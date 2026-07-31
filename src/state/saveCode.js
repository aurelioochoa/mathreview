import { migrate } from './persistence'
import { defaultState } from './gameStore'

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

// Campos con forma variable (string o null), que no se pueden derivar del
// valor por defecto: `defaultState()` los trae a `null`, y eso no dice si un
// valor real sería un string. Se listan a mano; si se añade un campo nuevo de
// esta misma forma a cosmetics/streak, hay que sumarlo aquí a mano también.
function esStringONull(v) {
  return v === null || typeof v === 'string'
}

// migrate() no sobrescribe cosmetics/streak entero: los combina con
// `{...base, ...(data.campo ?? {})}`. Eso significa que si `data.cosmetics`
// es, por ejemplo, el string 'trampa', el spread lo trata como iterable y
// añade claves '0', '1', '2'... con sus caracteres, PERO deja intactos
// owned/avatar/frame/title de la base -- el resultado pasaría una
// comprobación que solo mire esos cuatro campos. Por eso aquí también se
// exige que el objeto no tenga claves de más: es la señal de que lo que
// llegó no era el objeto que decía ser.
function mismasClaves(obj, esperadas) {
  const propias = Object.keys(obj)
  return propias.length === esperadas.length && esperadas.every(k => propias.includes(k))
}

function formaValidaCosmetics(c) {
  return (
    !!c && typeof c === 'object' && !Array.isArray(c) &&
    mismasClaves(c, Object.keys(defaultState().cosmetics)) &&
    Array.isArray(c.owned) &&
    esStringONull(c.avatar) && esStringONull(c.frame) && esStringONull(c.title)
  )
}

function formaValidaStreak(s) {
  return (
    !!s && typeof s === 'object' && !Array.isArray(s) &&
    mismasClaves(s, Object.keys(defaultState().streak)) &&
    Number.isFinite(s.count) && Number.isFinite(s.best) && esStringONull(s.lastDate)
  )
}

// Un código de partida viene de fuera: puede estar fabricado a mano, o
// simplemente corrupto de una forma que decodifica pero no cuadra con lo que
// el resto del juego espera (p. ej. `achievements` como número en vez de
// array). `migrate` no lo mira -- solo rellena defaults --, así que la forma
// se valida aquí, después de migrar y antes de dar el guardado por bueno.
//
// Recorre defaultState() campo a campo y comprueba que los arrays sigan
// siendo arrays y los numéricos sigan siendo números finitos: es deliberado
// que sea genérico en esos dos casos, así que un campo array o numérico que
// se añada mañana al estado queda cubierto solo con existir en
// defaultState(), sin tocar esta función. `stars` (objeto, no lista fija de
// campos) y `cosmetics`/`streak` (con campos que pueden ser string o null)
// no encajan en ese patrón genérico y se comprueban explícitos.
function formaValida(save) {
  if (!save || typeof save !== 'object') return false

  const defaults = defaultState()
  for (const key of Object.keys(defaults)) {
    const esperado = defaults[key]
    const real = save[key]
    if (Array.isArray(esperado)) {
      if (!Array.isArray(real)) return false
    } else if (typeof esperado === 'number') {
      if (!Number.isFinite(real)) return false
    }
  }

  if (!save.stars || typeof save.stars !== 'object' || Array.isArray(save.stars)) return false
  if (!formaValidaCosmetics(save.cosmetics)) return false
  if (!formaValidaStreak(save.streak)) return false

  return true
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

  // El checksum solo dice que el JSON no se corrompió en el viaje; no dice
  // que tenga la forma que el resto del juego espera. Un código fabricado a
  // mano (o con un campo mal escrito) puede pasar migrate() -- que solo
  // rellena defaults, no valida -- y reventar más tarde en el reducer o al
  // arrancar. Se ataja aquí, antes de que ese guardado llegue a ninguna parte.
  if (!formaValida(save)) return { ok: false, reason: 'corrupto' }

  return { ok: true, save }
}
