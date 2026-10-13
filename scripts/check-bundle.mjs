import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

// Suma todos los imports estáticos del arranque, no solo index-*.js. Excluye
// imports dinámicos: el mapa 3D y cada actividad tienen su propio presupuesto.
const manifest = JSON.parse(await readFile(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'))
const entry = Object.keys(manifest).find(key => manifest[key].isEntry)
assert.ok(entry, 'No se encontró la entrada del build')

function staticChunks(key, seen = new Set()) {
  if (seen.has(key)) return seen
  assert.ok(manifest[key], `Chunk ausente: ${key}`)
  seen.add(key)
  for (const dependency of manifest[key].imports ?? []) staticChunks(dependency, seen)
  return seen
}

const initial = staticChunks(entry)
let gzipBytes = 0
const forbiddenMarkers = ['mafs-view', 'recharts-wrapper']
function checkMarkers(source) {
  for (const marker of forbiddenMarkers) {
    assert.ok(!source.includes(marker), `Biblioteca de gráficas en el arranque: ${marker}`)
  }
}
// Control positivo: el detector debe rechazar ambas firmas.
for (const marker of forbiddenMarkers) assert.throws(() => checkMarkers(marker))

for (const key of initial) {
  assert.ok(!/^src\/(pages\/Bloque|widgets\/|three\/|components\/Qr)/.test(key), `Función diferida en el arranque: ${key}`)
  const source = await readFile(new URL(`../dist/${manifest[key].file}`, import.meta.url))
  checkMarkers(source.toString())
  gzipBytes += gzipSync(source).length
}

// Confirma que las bibliotecas siguen disponibles en las actividades diferidas.
for (const [widget, marker] of [
  ['src/widgets/SistemasGrafica.jsx', 'mafs-view'],
  ['src/widgets/EstadisticaCalculadora.jsx', 'recharts-wrapper'],
]) {
  let source = ''
  for (const key of staticChunks(widget)) {
    source += await readFile(new URL(`../dist/${manifest[key].file}`, import.meta.url), 'utf8')
  }
  assert.ok(source.includes(marker), `Control positivo ausente para ${widget}`)
}

const MAX_INITIAL_GZIP_BYTES = 300_000
assert.ok(gzipBytes <= MAX_INITIAL_GZIP_BYTES, `Arranque de ${gzipBytes} bytes gzip supera ${MAX_INITIAL_GZIP_BYTES}`)
console.log(`BUNDLE VERIFIED: ${(gzipBytes / 1000).toFixed(2)} kB gzip de JavaScript inicial (${initial.size} chunks; límite 300 kB decimales).`)
