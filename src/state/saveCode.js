import { migrate } from './persistence'

// Código de traspaso de partida: MQ1.<base64url(gzip(JSON({c, s})))>
//
// El prefijo lleva versión para poder cambiar el formato más adelante sin que
// un código viejo se interprete como basura.
export const CODE_PREFIX = 'MQ1'

// Capacidad de un QR versión 40 en modo byte con corrección de errores M, que
// es la que trae `qrcode` por defecto. El código es ASCII, así que su longitud
// en caracteres es su tamaño en bytes y la guarda es una simple comparación.
export const QR_MAX_BYTES = 2331

// FNV-1a de 32 bits sobre los bytes del JSON. No es criptográfico y no lo
// pretende: el gzip ya trae su propio CRC y caza el código mal copiado. Esto
// es la segunda red, para un sobre que descomprime bien pero no cuadra.
function fnv1a(bytes) {
  let h = 0x811c9dc5
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i]
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

function toBase64Url(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(texto) {
  const b64 = texto.replace(/-/g, '+').replace(/_/g, '/')
  // El relleno se quitó al codificar; se repone antes de atob en vez de
  // confiar en que todo runtime acepte base64 sin padding.
  const resto = b64.length % 4
  const bin = atob(resto === 0 ? b64 : b64 + '='.repeat(4 - resto))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

// El stream se construye desde el Uint8Array a mano y NO con Blob.stream():
// el Blob de jsdom no produce un stream que CompressionStream acepte, y los
// tests se caen.
function streamDe(bytes) {
  return new ReadableStream({ start(c) { c.enqueue(bytes); c.close() } })
}

async function vaciar(stream) {
  const reader = stream.getReader()
  const trozos = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    trozos.push(value)
  }
  let n = 0
  for (const t of trozos) n += t.length
  const out = new Uint8Array(n)
  let o = 0
  for (const t of trozos) { out.set(t, o); o += t.length }
  return out
}

const comprimir = (bytes) => vaciar(streamDe(bytes).pipeThrough(new CompressionStream('gzip')))
const descomprimir = (bytes) => vaciar(streamDe(bytes).pipeThrough(new DecompressionStream('gzip')))

export async function encodeSave(save) {
  const bytesSave = new TextEncoder().encode(JSON.stringify(save))
  const sobre = JSON.stringify({ c: fnv1a(bytesSave), s: save })
  const empaquetado = await comprimir(new TextEncoder().encode(sobre))
  return `${CODE_PREFIX}.${toBase64Url(empaquetado)}`
}

export async function decodeSave(code) {
  const texto = String(code ?? '').trim()
  if (!texto.startsWith(`${CODE_PREFIX}.`)) return { ok: false, reason: 'formato' }

  let empaquetado
  try {
    empaquetado = fromBase64Url(texto.slice(CODE_PREFIX.length + 1))
  } catch {
    return { ok: false, reason: 'formato' }
  }

  // A partir de aquí el prefijo era correcto y el base64 se decodificó, así
  // que un fallo apunta a un código mal copiado, no a otra cosa.
  let sobre
  try {
    sobre = JSON.parse(new TextDecoder().decode(await descomprimir(empaquetado)))
  } catch {
    return { ok: false, reason: 'corrupto' }
  }

  if (!sobre || typeof sobre.c !== 'string' || !sobre.s || typeof sobre.s !== 'object')
    return { ok: false, reason: 'corrupto' }
  if (fnv1a(new TextEncoder().encode(JSON.stringify(sobre.s))) !== sobre.c)
    return { ok: false, reason: 'corrupto' }

  // El código es un guardado que viaja en el tiempo: entra por el mismo tubo
  // de migración que el de localStorage, no por uno paralelo.
  const save = migrate(sobre.s)
  if (!save) return { ok: false, reason: 'incompatible' }
  return { ok: true, save }
}
