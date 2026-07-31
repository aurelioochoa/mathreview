# Fase 5 — Pulido: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Diferenciar las celebraciones por tipo de victoria, permitir mover una partida entre dispositivos por código, fichero o QR, y poner lint + tests + build en GitHub Actions.

**Architecture:** Tres bloques independientes. El traspaso de partida se apoya en un códec puro (`src/state/saveCode.js`) que comprime con `CompressionStream` y sella con FNV-1a, sobre el que se montan las tres vías de UI; el reducer solo gana una acción que sustituye el estado. Las celebraciones extraen su configuración a una tabla pura y el componente 3D existente pasa a leerla. La CI es un workflow nuevo, sin tocar código.

**Tech Stack:** React 19, Vite 8, Vitest 4 + Testing Library, `@react-three/fiber`, `qrcode` 1.5.4 (nuevo), `jsqr` 1.4.0 (nuevo), GitHub Actions.

**Spec:** [Fase 5 — Pulido](../specs/2026-07-31-fase5-pulido-design.md)

## Global Constraints

- **Español en todo lo que ve el jugador y en los comentarios de código.** Los tests se describen en español, como el resto de la suite.
- **Nada de dependencias nuevas más allá de `qrcode` y `jsqr`.** La compresión y el base64 usan API de plataforma (`CompressionStream`, `btoa`/`atob`).
- **El códec no puede usar `Blob.stream()`.** El `Blob` de jsdom no produce un stream compatible con `CompressionStream` y el test se cae. Construir el `ReadableStream` desde el `Uint8Array` a mano.
- **Todo lo que pese va por `lazy()`.** El bundle inicial (385 KB gzip) no se toca en esta fase, así que ni `qrcode` ni `jsqr` pueden acabar en él.
- **`variant` por defecto de `Celebration` es `'nivel'`, y esa variante debe verse exactamente como hoy.** Regresión visual cero en el nivel superado.
- **No exportar valores no-componente desde ficheros `.jsx` con componentes:** ESLint tiene `react-refresh/only-export-components` activo. Las tablas de datos van en su propio `.js`.
- **Comando de verificación:** `npm test` (suite completa), `npm run lint`, `npm run build`.

---

### Task 1: Códec de traspaso de partida

**Files:**
- Create: `src/state/saveCode.js`
- Modify: `src/state/persistence.js:7` (cambiar `function migrate` por `export function migrate`)
- Test: `src/state/__tests__/saveCode.test.js`

**Interfaces:**
- Consumes: `migrate(data)` de `./persistence` — hoy privada, se exporta en esta task. Devuelve un estado v3 completo o `null`.
- Produces:
  - `CODE_PREFIX = 'MQ1'` (string)
  - `QR_MAX_BYTES = 2331` (number)
  - `encodeSave(save: object): Promise<string>` — devuelve `"MQ1.<base64url>"`
  - `decodeSave(code: string): Promise<{ok: true, save: object} | {ok: false, reason: 'formato'|'corrupto'|'incompatible'}>`

- [ ] **Step 1: Exportar `migrate` desde persistence**

En `src/state/persistence.js`, línea 7, cambiar la declaración:

```js
export function migrate(data) {
```

El comentario de encima se queda como está. Nada más cambia en ese fichero: `tryParse` la sigue usando igual.

- [ ] **Step 2: Escribir el test que falla**

Crear `src/state/__tests__/saveCode.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { encodeSave, decodeSave, CODE_PREFIX, QR_MAX_BYTES } from '../saveCode'
import { defaultState } from '../gameStore'

// Partida deliberadamente pesada: es el peor caso que se usa para comprobar
// que un código sigue cabiendo en un QR.
function partidaPesada() {
  const stars = {}
  const completedLevels = []
  for (let w = 1; w <= 8; w++) {
    for (let i = 0; i < 5; i++) {
      const k = `mundo${w}/nivel-de-nombre-largo-${i}`
      stars[k] = 3
      completedLevels.push(k)
    }
  }
  return {
    ...defaultState(),
    xp: 12450,
    coins: 3200,
    stars,
    completedLevels,
    bossDefeats: ['mundo1', 'mundo2', 'mundo3', 'mundo4', 'mundo5', 'mundo6', 'mundo7', 'mundo8'],
    portalPasses: ['mundo1', 'mundo2'],
    questsCompleted: Array.from({ length: 17 }, (_, i) => `mundo${(i % 8) + 1}/quest-de-nombre-largo-${i}`),
    achievements: Array.from({ length: 18 }, (_, i) => `logro-identificador-${i}`),
    hints: 12,
    cosmetics: {
      owned: ['avatar-default', 'avatar-mago', 'avatar-dragon', 'frame-oro', 'title-leyenda', 'avatar-robot', 'frame-neon'],
      avatar: 'avatar-mago', frame: 'frame-oro', title: 'title-leyenda',
    },
    streak: { count: 14, best: 22, lastDate: '2026-07-31' },
  }
}

describe('saveCode — ida y vuelta', () => {
  it('el código empieza por el prefijo de versión', async () => {
    const code = await encodeSave(defaultState())
    expect(code.startsWith(`${CODE_PREFIX}.`)).toBe(true)
  })

  it('decodeSave devuelve la misma partida que entró', async () => {
    const save = partidaPesada()
    const res = await decodeSave(await encodeSave(save))
    expect(res.ok).toBe(true)
    expect(res.save).toEqual(save)
  })
})

describe('saveCode — códigos malos', () => {
  it('una cadena cualquiera es un problema de formato', async () => {
    expect(await decodeSave('hola')).toEqual({ ok: false, reason: 'formato' })
  })

  it('la cadena vacía y null son un problema de formato', async () => {
    expect((await decodeSave('')).reason).toBe('formato')
    expect((await decodeSave(null)).reason).toBe('formato')
  })

  it('cambiar un carácter del código lo marca como corrupto', async () => {
    const code = await encodeSave(defaultState())
    // Se toca un carácter del payload por otro que sigue siendo base64url
    // válido, para que el fallo lo cace el CRC del gzip y no el atob.
    const i = CODE_PREFIX.length + 5
    const sustituto = code[i] === 'A' ? 'B' : 'A'
    const roto = code.slice(0, i) + sustituto + code.slice(i + 1)
    expect((await decodeSave(roto)).reason).toBe('corrupto')
  })

  it('un código truncado es corrupto', async () => {
    const code = await encodeSave(defaultState())
    expect((await decodeSave(code.slice(0, code.length - 8))).reason).toBe('corrupto')
  })
})

describe('saveCode — migración', () => {
  it('un guardado v1 dentro del código sale migrado a v3', async () => {
    const code = await encodeSave({ version: 1, xp: 50, coins: 5 })
    const res = await decodeSave(code)
    expect(res.ok).toBe(true)
    expect(res.save.version).toBe(3)
    expect(res.save.xp).toBe(50)
    expect(res.save.bossDefeats).toEqual([])
  })

  it('un guardado v2 dentro del código sale migrado a v3 sin perder datos', async () => {
    const code = await encodeSave({ version: 2, xp: 900, coins: 40, hints: 3, achievements: ['a1'] })
    const res = await decodeSave(code)
    expect(res.save.version).toBe(3)
    expect(res.save.hints).toBe(3)
    expect(res.save.achievements).toEqual(['a1'])
    expect(res.save.portalPasses).toEqual([])
  })

  it('algo que no es un guardado reconocible es incompatible', async () => {
    const code = await encodeSave({ version: 99, loquesea: true })
    expect((await decodeSave(code)).reason).toBe('incompatible')
  })
})

describe('saveCode — tamaño', () => {
  it('el peor caso realista cabe en un QR', async () => {
    const code = await encodeSave(partidaPesada())
    expect(code.length).toBeLessThanOrEqual(QR_MAX_BYTES)
  })

  it('comprimir importa: el código es mucho más corto que el JSON a pelo', async () => {
    const save = partidaPesada()
    const code = await encodeSave(save)
    expect(code.length).toBeLessThan(JSON.stringify(save).length / 2)
  })
})
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `npx vitest run src/state/__tests__/saveCode.test.js`
Expected: FAIL — no existe `../saveCode`, error de resolución de módulo.

- [ ] **Step 4: Escribir el códec**

Crear `src/state/saveCode.js`:

```js
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
```

- [ ] **Step 5: Ejecutar los tests y verificar que pasan**

Run: `npx vitest run src/state/__tests__/saveCode.test.js src/state/__tests__/persistence.test.js`
Expected: PASS, los 11 tests nuevos y los de persistence sin tocar.

Si «cambiar un carácter del código lo marca como corrupto» diera `formato`, el carácter sustituto cayó fuera del alfabeto base64url: revisar el índice elegido en el test.

- [ ] **Step 6: Commit**

```bash
git add src/state/saveCode.js src/state/__tests__/saveCode.test.js src/state/persistence.js
git commit -m "feat: códec de traspaso de partida (gzip + checksum FNV-1a)"
```

---

### Task 2: Acción `IMPORT_SAVE` en el reducer

**Files:**
- Modify: `src/state/gameStore.js` (añadir un `case` antes de `default`)
- Test: `src/state/__tests__/gameStore.test.js` (añadir un `describe`)

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces: acción `{ type: 'IMPORT_SAVE', save }` — sustituye el estado entero. `save` debe venir ya migrada y validada por `decodeSave` (Task 1); el reducer no valida.

- [ ] **Step 1: Escribir el test que falla**

Añadir al final de `src/state/__tests__/gameStore.test.js`:

```js
describe('IMPORT_SAVE', () => {
  it('sustituye el estado entero por la partida importada', () => {
    const entrante = { ...defaultState(), xp: 999, coins: 42, hints: 7 }
    const previo = { ...defaultState(), xp: 10 }
    expect(gameReducer(previo, { type: 'IMPORT_SAVE', save: entrante })).toEqual(entrante)
  })

  it('sin partida no toca nada', () => {
    const previo = { ...defaultState(), xp: 10 }
    expect(gameReducer(previo, { type: 'IMPORT_SAVE' })).toBe(previo)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `npx vitest run src/state/__tests__/gameStore.test.js -t IMPORT_SAVE`
Expected: FAIL — el reducer cae en `default` y devuelve `previo`, así que el primer test falla al comparar con `entrante`.

- [ ] **Step 3: Añadir el caso al reducer**

En `src/state/gameStore.js`, justo antes de `default:`:

```js
    case 'IMPORT_SAVE':
      // Sustituye el estado entero. No valida: de eso se encarga decodeSave,
      // y tener la validación en dos sitios es tener dos sitios donde
      // equivocarse.
      return action.save ?? state
```

- [ ] **Step 4: Ejecutar los tests y verificar que pasan**

Run: `npx vitest run src/state/__tests__/gameStore.test.js`
Expected: PASS, incluidos los que ya había.

- [ ] **Step 5: Commit**

```bash
git add src/state/gameStore.js src/state/__tests__/gameStore.test.js
git commit -m "feat: acción IMPORT_SAVE para cargar una partida traspasada"
```

---

### Task 3: Sección «Partida» en el perfil — código y fichero

**Files:**
- Create: `src/components/SaveTransfer.jsx`
- Modify: `src/pages/Profile.jsx` (importar y montar al final)
- Test: `src/__tests__/saveTransfer-integracion.test.jsx`

**Interfaces:**
- Consumes: `encodeSave`, `decodeSave` de `../state/saveCode` (Task 1); acción `IMPORT_SAVE` (Task 2); `useGame` de `../state/gameStore`; `hudStats` de `../state/hudStats`.
- Produces: componente por defecto `SaveTransfer` sin props. Task 4 le añadirá el bloque QR.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/__tests__/saveTransfer-integracion.test.jsx`:

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SaveTransfer from '../components/SaveTransfer'
import { GameProvider } from '../state/GameProvider'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY } from '../state/persistence'
import { encodeSave } from '../state/saveCode'
import { todayStr } from '../state/streak'

function montar(extra = {}) {
  const save = { ...defaultState(), streak: { count: 1, best: 1, lastDate: todayStr() }, ...extra }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  return render(<GameProvider><SaveTransfer /></GameProvider>)
}

describe('integración: SaveTransfer', () => {
  beforeEach(() => localStorage.clear())

  it('muestra el código de la partida actual', async () => {
    montar({ xp: 500 })
    const salida = await screen.findByLabelText(/Tu código de partida/i)
    await waitFor(() => expect(salida.value.startsWith('MQ1.')).toBe(true))
  })

  it('pegar un código válido enseña el resumen y NO importa todavía', async () => {
    montar({ xp: 10 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777, hints: 4 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))

    expect(await screen.findByText(/777 monedas/)).toBeTruthy()
    // Sigue esperando confirmación: el botón de confirmar está en pantalla.
    expect(screen.getByRole('button', { name: /Cargar esta partida/i })).toBeTruthy()
  })

  it('confirmar aplica la partida importada', async () => {
    montar({ xp: 10 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Cargar esta partida/i }))

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777)
    })
  })

  it('cancelar descarta la partida pendiente sin aplicarla', async () => {
    montar({ xp: 10, coins: 3 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Cancelar/i }))

    expect(screen.queryByText(/777 monedas/)).toBeNull()
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(3)
  })

  it('un código ilegible explica qué pasa y no ofrece cargar nada', async () => {
    montar()
    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: 'esto-no-es-un-codigo' } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))

    expect(await screen.findByText(/no parece un código de Math Quest/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Cargar esta partida/i })).toBeNull()
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `npx vitest run src/__tests__/saveTransfer-integracion.test.jsx`
Expected: FAIL — no existe `../components/SaveTransfer`.

- [ ] **Step 3: Escribir el componente**

Crear `src/components/SaveTransfer.jsx`:

```jsx
import { useCallback, useEffect, useState } from 'react'
import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'
import { encodeSave, decodeSave } from '../state/saveCode'

const MENSAJES = {
  formato: 'Esto no parece un código de Math Quest.',
  corrupto: 'El código está incompleto. ¿Se copió entero?',
  incompatible: 'Este código es de una versión que ya no se reconoce.',
}

// Resumen legible de una partida, para que el jugador confirme que carga la
// que quiere antes de reemplazar la suya. Sin exportar: este fichero tiene
// componentes, y react-refresh/only-export-components prohíbe sacar de aquí
// cualquier otra cosa.
function resumenDe(save) {
  const s = hudStats(save)
  return `Nivel ${s.level} · ${s.coins} monedas · ${save.achievements.length} logros · ${save.completedLevels.length} niveles`
}

const boton = 'px-4 py-2 rounded-xl font-display font-bold text-sm'

export default function SaveTransfer() {
  const { state, dispatch } = useGame()
  const [codigo, setCodigo] = useState('')
  const [pegado, setPegado] = useState('')
  const [pendiente, setPendiente] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let vivo = true
    encodeSave(state).then(c => { if (vivo) setCodigo(c) })
    return () => { vivo = false }
  }, [state])

  const revisar = useCallback(async (texto) => {
    setError(null)
    setPendiente(null)
    const res = await decodeSave(texto)
    if (res.ok) setPendiente(res.save)
    else setError(MENSAJES[res.reason])
  }, [])

  const copiar = () => navigator.clipboard?.writeText(codigo)

  const descargar = () => {
    const url = URL.createObjectURL(new Blob([codigo], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'partida.mathquest'
    a.click()
    URL.revokeObjectURL(url)
  }

  const subir = async (e) => {
    const fichero = e.target.files?.[0]
    if (fichero) await revisar(await fichero.text())
    e.target.value = ''
  }

  const confirmar = () => {
    dispatch({ type: 'IMPORT_SAVE', save: pendiente })
    setPendiente(null)
    setPegado('')
  }

  return (
    <section className="mt-8">
      <h2 className="font-display font-bold text-gray-700 mb-1">Partida</h2>
      <p className="text-xs text-gray-500 mb-3">
        Llévate tu progreso a otro dispositivo. Guarda el código en sitio seguro: es tu partida entera.
      </p>

      <div className="glass rounded-2xl p-4 mb-3">
        <label htmlFor="codigo-salida" className="text-xs text-gray-500 block mb-1">Tu código de partida</label>
        <textarea
          id="codigo-salida" readOnly value={codigo} rows={3}
          className="w-full text-xs font-mono border border-gray-200 rounded-lg p-2 bg-white break-all"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={copiar} className={`${boton} bg-primary text-white`}>Copiar</button>
          <button onClick={descargar} className={`${boton} bg-white border border-gray-200`}>Descargar fichero</button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <label htmlFor="codigo-entrada" className="text-xs text-gray-500 block mb-1">Pega aquí un código de otro dispositivo</label>
        <textarea
          id="codigo-entrada" value={pegado} rows={3}
          onChange={e => setPegado(e.target.value)}
          className="w-full text-xs font-mono border border-gray-200 rounded-lg p-2 bg-white break-all"
        />
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <button onClick={() => revisar(pegado)} className={`${boton} bg-primary text-white`}>Revisar código</button>
          <label className={`${boton} bg-white border border-gray-200 cursor-pointer`}>
            Abrir fichero
            <input type="file" accept=".mathquest,text/plain" onChange={subir} className="hidden" />
          </label>
        </div>

        {error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}

        {pendiente && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-700">Vas a cargar: <strong>{resumenDe(pendiente)}</strong></p>
            <p className="text-xs text-gray-500 mt-1">
              Esto reemplaza tu partida actual ({resumenDe(state)}).
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={confirmar} className={`${boton} bg-primary text-white`}>Cargar esta partida</button>
              <button onClick={() => setPendiente(null)} className={`${boton} bg-white border border-gray-200`}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Montarlo en el perfil**

En `src/pages/Profile.jsx`, añadir el import junto a los demás (línea 6, tras el de `worlds`):

```js
import SaveTransfer from '../components/SaveTransfer'
```

Y montarlo como último hijo del `<div className="max-w-3xl mx-auto">`, justo después del `Selector` de `title` (línea 77):

```jsx
      <SaveTransfer />
```

- [ ] **Step 5: Ejecutar los tests y verificar que pasan**

Run: `npx vitest run src/__tests__/saveTransfer-integracion.test.jsx src/__tests__/profile-integracion.test.jsx`
Expected: PASS los 5 nuevos y los 4 de profile.

- [ ] **Step 6: Commit**

```bash
git add src/components/SaveTransfer.jsx src/__tests__/saveTransfer-integracion.test.jsx src/pages/Profile.jsx
git commit -m "feat: traspaso de partida por código y fichero en /perfil"
```

---

### Task 4: Mostrar la partida como QR

**Files:**
- Create: `src/components/QrPanel.jsx`
- Modify: `src/components/SaveTransfer.jsx` (botón «Mostrar QR» + guarda de tamaño)
- Modify: `package.json` (dependencia `qrcode`)
- Test: `src/__tests__/saveTransfer-integracion.test.jsx` (añadir un `describe`)

**Interfaces:**
- Consumes: `QR_MAX_BYTES` de `../state/saveCode` (Task 1); el estado `codigo` de `SaveTransfer` (Task 3).
- Produces: `QrPanel` con props `{ code: string }`, cargado con `lazy()` desde `SaveTransfer`.

- [ ] **Step 1: Instalar la dependencia**

```bash
npm install qrcode@1.5.4
```

El `package.json` de `qrcode` mapea `./lib/index.js` → `./lib/browser.js` en su campo `browser`, así que Vite resuelve solo la build de navegador con un import normal. No hace falta importar `qrcode/lib/browser`.

- [ ] **Step 2: Escribir el test que falla**

Añadir a `src/__tests__/saveTransfer-integracion.test.jsx`:

```jsx
describe('integración: SaveTransfer — QR', () => {
  beforeEach(() => localStorage.clear())

  it('ofrece mostrar el QR cuando el código cabe', async () => {
    montar({ xp: 100 })
    await screen.findByLabelText(/Tu código de partida/i)
    expect(await screen.findByRole('button', { name: /Mostrar QR/i })).toBeTruthy()
  })

  it('si el código no cabe en un QR lo dice en vez de ofrecerlo', async () => {
    // Una partida con basura suficiente para pasarse del tope, para probar la
    // guarda. No es un caso real: el peor caso realista son ~800 B.
    const relleno = {}
    for (let i = 0; i < 4000; i++) relleno[`nivel-de-relleno-numero-${i}`] = 3
    montar({ stars: relleno })
    await screen.findByLabelText(/Tu código de partida/i)
    expect(await screen.findByText(/demasiado grande para un QR/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Mostrar QR/i })).toBeNull()
  })
})
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `npx vitest run src/__tests__/saveTransfer-integracion.test.jsx -t QR`
Expected: FAIL — no hay ningún botón «Mostrar QR».

- [ ] **Step 4: Escribir el panel**

Crear `src/components/QrPanel.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

// Pinta el código de partida como QR. La guarda de tamaño vive en quien lo
// monta: aquí ya se da por hecho que el código cabe.
export default function QrPanel({ code }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !code) return
    // margin 1 en vez del 4 por defecto: en pantalla el marco blanco grande
    // solo roba tamaño al código.
    QRCode.toCanvas(ref.current, code, { width: 240, margin: 1 }).catch(() => {})
  }, [code])

  return (
    <div className="mt-3 flex flex-col items-center">
      <canvas ref={ref} aria-label="Código QR de tu partida" className="rounded-lg bg-white p-2" />
      <p className="text-xs text-gray-500 mt-2">Escanéalo desde el otro dispositivo.</p>
    </div>
  )
}
```

- [ ] **Step 5: Enganchar el panel en SaveTransfer**

En `src/components/SaveTransfer.jsx`:

Cambiar la primera línea de imports por:

```jsx
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
```

Añadir tras el import de `saveCode`:

```jsx
import { QR_MAX_BYTES } from '../state/saveCode'

// Va aparte y en lazy: `qrcode` no puede acabar en el bundle inicial.
const QrPanel = lazy(() => import('./QrPanel'))
```

(El import de `saveCode` pasa a ser `import { encodeSave, decodeSave, QR_MAX_BYTES } from '../state/saveCode'` — una sola línea, no dos.)

Añadir junto al resto de estado:

```jsx
  const [verQr, setVerQr] = useState(false)
  const cabeEnQr = codigo.length > 0 && codigo.length <= QR_MAX_BYTES
```

Y dentro del primer `glass`, en el `div` de botones, tras «Descargar fichero»:

```jsx
          {cabeEnQr && (
            <button onClick={() => setVerQr(v => !v)} className={`${boton} bg-white border border-gray-200`}>
              {verQr ? 'Ocultar QR' : 'Mostrar QR'}
            </button>
          )}
```

Y justo después de ese `div` de botones, aún dentro del primer `glass`:

```jsx
        {codigo.length > QR_MAX_BYTES && (
          <p className="text-xs text-gray-500 mt-2">
            Tu partida es demasiado grande para un QR. Usa el código o el fichero.
          </p>
        )}
        {verQr && <Suspense fallback={null}><QrPanel code={codigo} /></Suspense>}
```

- [ ] **Step 6: Ejecutar los tests y verificar que pasan**

Run: `npx vitest run src/__tests__/saveTransfer-integracion.test.jsx`
Expected: PASS los 7.

`QrPanel` no llega a montarse en los tests (`verQr` arranca en `false`), así que `qrcode` no se carga en jsdom y no hay que simular canvas.

- [ ] **Step 7: Verificar que el build no mete `qrcode` en el bundle inicial**

Run: `npm run build`
Expected: build limpio y un chunk propio para `QrPanel` en `dist/assets/`. Comprobar con:

```bash
ls dist/assets/ | grep -i qr
```

Debe salir al menos un fichero. Si `qrcode` acabase en `index-*.js` en vez de en su chunk, revisar que el import de `QrPanel` en `SaveTransfer` es `lazy(() => import('./QrPanel'))` y no un import estático.

Si el build fallase por el CJS de `qrcode`, cambiar el import de `QrPanel.jsx` a `import QRCode from 'qrcode/lib/browser'`.

- [ ] **Step 8: Commit**

```bash
git add src/components/QrPanel.jsx src/components/SaveTransfer.jsx src/__tests__/saveTransfer-integracion.test.jsx package.json package-lock.json
git commit -m "feat: mostrar la partida como QR (chunk aparte)"
```

---

### Task 5: Escanear un QR con la cámara

**Files:**
- Create: `src/components/QrScanner.jsx`
- Modify: `src/components/SaveTransfer.jsx` (botón «Escanear QR»)
- Modify: `package.json` (dependencia `jsqr`)
- Test: `src/__tests__/qrScanner.test.jsx`

**Interfaces:**
- Consumes: nada de tasks anteriores salvo el hueco en `SaveTransfer` (Task 3).
- Produces: `QrScanner` con props `{ onCode: (texto: string) => void, onCancel: () => void }`, cargado con `lazy()`.

- [ ] **Step 1: Instalar la dependencia**

```bash
npm install jsqr@1.4.0
```

- [ ] **Step 2: Escribir el test que falla**

Crear `src/__tests__/qrScanner.test.jsx`:

```jsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import QrScanner from '../components/QrScanner'

// jsdom no trae mediaDevices. Estos tests cubren los caminos de fallo, que son
// los que sí se pueden ejercitar sin cámara real.
//
// mediaDevices se instala con defineProperty y no con asignación directa:
// en jsdom `navigator` no siempre acepta propiedades nuevas por asignación, y
// un `navigator.mediaDevices = ...` puede quedarse en nada sin avisar.
function fingirCamara(getUserMedia) {
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
}

function rechazarCon(nombre) {
  const error = new Error(nombre)
  error.name = nombre
  return vi.fn().mockRejectedValue(error)
}

describe('QrScanner — sin cámara utilizable', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
  })

  it('sin mediaDevices avisa de que el navegador no puede y ofrece salir', async () => {
    render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
    expect(await screen.findByText(/no puede usar la cámara/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Cerrar/i })).toBeTruthy()
  })

  it('con el permiso denegado lo dice con sus palabras', async () => {
    fingirCamara(rechazarCon('NotAllowedError'))
    render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
    expect(await screen.findByText(/permiso para usar la cámara/i)).toBeTruthy()
  })

  it('sin cámara conectada lo distingue del permiso denegado', async () => {
    fingirCamara(rechazarCon('NotFoundError'))
    render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
    expect(await screen.findByText(/no se ha encontrado ninguna cámara/i)).toBeTruthy()
  })
})
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `npx vitest run src/__tests__/qrScanner.test.jsx`
Expected: FAIL — no existe `../components/QrScanner`.

- [ ] **Step 4: Escribir el escáner**

Crear `src/components/QrScanner.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'

const INTERVALO_MS = 250

const ERRORES = {
  sinApi: 'Este navegador no puede usar la cámara aquí. Prueba con el código o el fichero.',
  permiso: 'No hay permiso para usar la cámara. Actívalo o usa el código o el fichero.',
  sinCamara: 'No se ha encontrado ninguna cámara. Usa el código o el fichero.',
  otro: 'No se ha podido abrir la cámara. Usa el código o el fichero.',
}

function motivoDe(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return 'permiso'
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return 'sinCamara'
  return 'otro'
}

// Lee un fotograma del vídeo y devuelve el texto del QR, o null.
// Usa BarcodeDetector cuando existe (Chrome, Android) y jsQR de reserva
// (Safari en iOS no trae la API nativa). La fontanería de cámara es la misma
// en ambos casos; solo cambia el paso de detección.
async function leerFotograma(video, canvas, detector) {
  if (video.readyState !== video.HAVE_ENOUGH_DATA) return null

  if (detector) {
    const encontrados = await detector.detect(video)
    return encontrados[0]?.rawValue ?? null
  }

  const { videoWidth: w, videoHeight: h } = video
  if (!w || !h) return null
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, w, h)
  const { default: jsQR } = await import('jsqr')
  const imagen = ctx.getImageData(0, 0, w, h)
  return jsQR(imagen.data, w, h, { inversionAttempts: 'dontInvert' })?.data ?? null
}

export default function QrScanner({ onCode, onCancel }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let vivo = true
    let stream = null
    let timer = null

    async function arrancar() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(ERRORES.sinApi)
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch (e) {
        if (vivo) setError(ERRORES[motivoDe(e)])
        return
      }
      if (!vivo) {
        stream.getTracks().forEach(t => t.stop())
        return
      }

      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play().catch(() => {})

      const detector = 'BarcodeDetector' in window
        ? new window.BarcodeDetector({ formats: ['qr_code'] })
        : null

      timer = setInterval(async () => {
        if (!vivo || !videoRef.current || !canvasRef.current) return
        const texto = await leerFotograma(videoRef.current, canvasRef.current, detector).catch(() => null)
        if (texto && vivo) {
          clearInterval(timer)
          onCode(texto)
        }
      }, INTERVALO_MS)
    }

    arrancar()

    return () => {
      vivo = false
      if (timer) clearInterval(timer)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [onCode])

  return (
    <div className="mt-3">
      {error ? (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      ) : (
        <>
          <video ref={videoRef} playsInline muted className="w-full max-w-xs rounded-xl bg-black mx-auto block" />
          <p className="text-xs text-gray-500 mt-2 text-center">Apunta al QR del otro dispositivo.</p>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex justify-center mt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl font-display font-bold text-sm bg-white border border-gray-200">
          Cerrar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Enganchar el escáner en SaveTransfer**

En `src/components/SaveTransfer.jsx`, junto al `lazy` de `QrPanel`:

```jsx
const QrScanner = lazy(() => import('./QrScanner'))
```

Añadir estado:

```jsx
  const [escaneando, setEscaneando] = useState(false)
```

Añadir un manejador junto a `subir`:

```jsx
  const escaneado = useCallback(async (texto) => {
    setEscaneando(false)
    await revisar(texto)
  }, [revisar])
```

En el segundo `glass`, en el `div` de botones, tras la etiqueta «Abrir fichero»:

```jsx
          <button onClick={() => setEscaneando(true)} className={`${boton} bg-white border border-gray-200`}>
            Escanear QR
          </button>
```

Y justo después de ese `div`:

```jsx
        {escaneando && (
          <Suspense fallback={null}>
            <QrScanner onCode={escaneado} onCancel={() => setEscaneando(false)} />
          </Suspense>
        )}
```

- [ ] **Step 6: Ejecutar los tests y verificar que pasan**

Run: `npx vitest run src/__tests__/qrScanner.test.jsx src/__tests__/saveTransfer-integracion.test.jsx`
Expected: PASS los 3 del escáner y los 7 de SaveTransfer.

- [ ] **Step 7: Verificar el build y los chunks**

Run: `npm run build && ls dist/assets/ | grep -iE "qr|jsqr"`
Expected: build limpio, con `QrPanel` y `QrScanner` en chunks propios. `jsqr` debe estar en su propio chunk o dentro del de `QrScanner`, nunca en `index-*.js`.

Comprobación explícita de que no se coló en el arranque:

```bash
grep -c "jsQR" dist/assets/index-*.js || echo "OK: jsqr no está en el bundle inicial"
```

- [ ] **Step 8: Commit**

```bash
git add src/components/QrScanner.jsx src/components/SaveTransfer.jsx src/__tests__/qrScanner.test.jsx package.json package-lock.json
git commit -m "feat: escáner de QR con cámara (BarcodeDetector nativo + jsQR de reserva)"
```

---

### Task 6: Celebración con variantes

**Files:**
- Create: `src/three/celebrationVariants.js`
- Modify: `src/three/Celebration.jsx` (reescritura del componente)
- Modify: `src/engine/LevelPlayer.jsx:184`
- Modify: `src/engine/BossArena.jsx:157`
- Test: `src/three/__tests__/celebrationVariants.test.js`

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces:
  - `CELEBRATION_VARIANTS` — objeto con claves `nivel`, `jefe`, `logro`; cada valor `{ pieces: number, centerpiece: 'trofeo'|'corona'|'medalla', scale: number, camera: number, colors: string[] }`
  - `Celebration` acepta `{ variant?: 'nivel'|'jefe'|'logro' }`, por defecto `'nivel'`

La tabla vive en un `.js` aparte y no dentro de `Celebration.jsx` por dos razones: ESLint tiene `react-refresh/only-export-components` activo y se quejaría de exportar un no-componente desde un fichero con componentes; y así se testea sin arrastrar `@react-three/fiber` a jsdom.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/three/__tests__/celebrationVariants.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { CELEBRATION_VARIANTS } from '../celebrationVariants'

describe('variantes de celebración', () => {
  it('están las tres', () => {
    expect(Object.keys(CELEBRATION_VARIANTS).sort()).toEqual(['jefe', 'logro', 'nivel'])
  })

  it('cada una trae la forma completa', () => {
    for (const [nombre, v] of Object.entries(CELEBRATION_VARIANTS)) {
      expect(typeof v.pieces, nombre).toBe('number')
      expect(v.pieces, nombre).toBeGreaterThan(0)
      expect(['trofeo', 'corona', 'medalla'], nombre).toContain(v.centerpiece)
      expect(typeof v.scale, nombre).toBe('number')
      expect(typeof v.camera, nombre).toBe('number')
      expect(Array.isArray(v.colors), nombre).toBe(true)
      expect(v.colors.length, nombre).toBeGreaterThan(0)
    }
  })

  it('la del jefe es más aparatosa que la del nivel', () => {
    expect(CELEBRATION_VARIANTS.jefe.pieces).toBeGreaterThan(CELEBRATION_VARIANTS.nivel.pieces)
    expect(CELEBRATION_VARIANTS.jefe.scale).toBeGreaterThan(CELEBRATION_VARIANTS.nivel.scale)
  })

  it('la del logro es la pequeña: vive dentro de un aviso, no en la pantalla entera', () => {
    expect(CELEBRATION_VARIANTS.logro.pieces).toBeLessThan(CELEBRATION_VARIANTS.nivel.pieces)
    expect(CELEBRATION_VARIANTS.logro.scale).toBeLessThan(1)
    expect(CELEBRATION_VARIANTS.logro.camera).toBeLessThan(CELEBRATION_VARIANTS.nivel.camera)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `npx vitest run src/three/__tests__/celebrationVariants.test.js`
Expected: FAIL — no existe `../celebrationVariants`.

- [ ] **Step 3: Escribir la tabla**

Crear `src/three/celebrationVariants.js`:

```js
// Cada tipo de victoria se celebra distinto. La tabla es un objeto puro y vive
// fuera de Celebration.jsx para poder testearla sin WebGL, que en jsdom no
// existe, y para no chocar con react-refresh/only-export-components.

const FIESTA = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308']
const BRASAS = ['#ef4444', '#f97316', '#fbbf24', '#dc2626', '#fb923c', '#fde047']
const ORO = ['#fbbf24', '#f59e0b', '#fde047', '#fcd34d']

export const CELEBRATION_VARIANTS = {
  // 'nivel' reproduce exactamente lo que había antes de existir las variantes.
  nivel: { pieces: 40, centerpiece: 'trofeo', scale: 1, camera: 5, colors: FIESTA },
  jefe: { pieces: 64, centerpiece: 'corona', scale: 1.15, camera: 5, colors: BRASAS },
  // Vive dentro de un aviso de ~320×90 px: poco confeti y cámara cerca.
  logro: { pieces: 18, centerpiece: 'medalla', scale: 0.55, camera: 3.2, colors: ORO },
}

export const DEFAULT_VARIANT = 'nivel'
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `npx vitest run src/three/__tests__/celebrationVariants.test.js`
Expected: PASS los 4.

- [ ] **Step 5: Reescribir el componente**

Sustituir el contenido de `src/three/Celebration.jsx` por:

```jsx
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { CELEBRATION_VARIANTS, DEFAULT_VARIANT } from './celebrationVariants'

function Confetti({ pieces, colors }) {
  const ref = useRef()
  const trozos = useMemo(
    () => Array.from({ length: pieces }, (_, i) => ({
      pos: [(i % 8) - 3.5 + (i % 3) * 0.3, 2.2 - Math.floor(i / 8) * 0.2, (i % 5) * 0.2 - 0.4],
      color: colors[i % colors.length],
      speed: 0.6 + (i % 5) * 0.15,
    })),
    [pieces, colors],
  )
  useFrame((_, delta) => {
    if (!ref.current) return
    for (const child of ref.current.children) {
      child.position.y -= delta * (child.userData.speed ?? 0.8)
      child.rotation.x += delta * 2
      child.rotation.z += delta * 1.5
      if (child.position.y < -2.4) child.position.y = 2.4
    }
  })
  return (
    <group ref={ref}>
      {trozos.map((p, i) => (
        <mesh key={i} position={p.pos} userData={{ speed: p.speed }}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Trofeo() {
  return (
    <mesh>
      <icosahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.15} emissive="#f59e0b" emissiveIntensity={0.5} />
    </mesh>
  )
}

// Aro con puntas: la corona del jefe derrotado.
function Corona() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.12, 12, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.15} emissive="#dc2626" emissiveIntensity={0.4} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.65, 0.32, Math.sin(a) * 0.65]}>
            <coneGeometry args={[0.12, 0.42, 8]} />
            <meshStandardMaterial color="#fde047" metalness={0.7} roughness={0.2} emissive="#f59e0b" emissiveIntensity={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}

// Disco con borde: la medalla del logro.
function Medalla() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.75} roughness={0.12} emissive="#f59e0b" emissiveIntensity={0.55} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.6, 0.07, 12, 32]} />
        <meshStandardMaterial color="#fde047" metalness={0.8} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

const PIEZAS = { trofeo: Trofeo, corona: Corona, medalla: Medalla }

function Centro({ centerpiece }) {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 1.2 })
  const Pieza = PIEZAS[centerpiece] ?? Trofeo
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
      <group ref={ref}><Pieza /></group>
    </Float>
  )
}

export default function Celebration({ variant = DEFAULT_VARIANT }) {
  const v = CELEBRATION_VARIANTS[variant] ?? CELEBRATION_VARIANTS[DEFAULT_VARIANT]
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, v.camera], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} />
      <group scale={v.scale}>
        <Centro centerpiece={v.centerpiece} />
        <Confetti pieces={v.pieces} colors={v.colors} />
      </group>
    </Canvas>
  )
}
```

- [ ] **Step 6: Pasar la variante desde los dos consumidores**

En `src/engine/LevelPlayer.jsx`, línea 184:

```jsx
              <Suspense fallback={null}><Celebration variant="nivel" /></Suspense>
```

En `src/engine/BossArena.jsx`, línea 157, dentro del `Suspense`:

```jsx
<Celebration variant="jefe" />
```

- [ ] **Step 7: Ejecutar la suite y el lint**

Run: `npm test && npm run lint`
Expected: PASS todo. El lint es importante aquí: confirma que `celebrationVariants.js` no dispara `react-refresh/only-export-components`.

- [ ] **Step 8: Commit**

```bash
git add src/three/celebrationVariants.js src/three/Celebration.jsx src/three/__tests__/celebrationVariants.test.js src/engine/LevelPlayer.jsx src/engine/BossArena.jsx
git commit -m "feat: celebración con variante por tipo de victoria (nivel, jefe, logro)"
```

---

### Task 7: Celebración de logro dentro del aviso

**Files:**
- Modify: `src/components/Toast.jsx`
- Test: `src/__tests__/toast.test.jsx`

**Interfaces:**
- Consumes: `Celebration` con `variant="logro"` (Task 6); `useDeviceTier` de `../three/useDeviceTier`.
- Produces: nada nuevo. `Toast` mantiene su firma `{ toast, onDismiss }`, así que `GameProvider` no se toca.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/__tests__/toast.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Toast from '../components/Toast'

// En jsdom no hay WebGL, así que useDeviceTier devuelve use3D=false y el
// canvas no se monta. Estos tests fijan que el aviso sigue funcionando ahí,
// que es el camino que ve cualquier móvil flojo.
describe('Toast de logro', () => {
  it('sin logro no pinta nada', () => {
    const { container } = render(<Toast toast={null} onDismiss={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('muestra nombre y emoji del logro', () => {
    render(<Toast toast={{ emoji: '🏆', name: 'Maestro del Volcán' }} onDismiss={() => {}} />)
    expect(screen.getByText('🏆')).toBeTruthy()
    expect(screen.getByText('Maestro del Volcán')).toBeTruthy()
    expect(screen.getByText(/¡Logro desbloqueado!/)).toBeTruthy()
  })

  it('sigue siendo un status accesible', () => {
    render(<Toast toast={{ emoji: '⭐', name: 'Primera estrella' }} onDismiss={() => {}} />)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('se descarta solo a los 3,5 s', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<Toast toast={{ emoji: '⭐', name: 'Primera estrella' }} onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(3500) })
    expect(onDismiss).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que pasa (¡sí, pasa!)**

Run: `npx vitest run src/__tests__/toast.test.jsx`
Expected: PASS los 4.

Este test se escribe **antes** de tocar `Toast.jsx` a propósito: fija el comportamiento actual para que el cambio del paso siguiente no lo rompa. No es un test que falle primero porque no se está añadiendo comportamiento nuevo a esta ruta, sino una capa visual encima de la que ya hay.

- [ ] **Step 3: Añadir la capa de celebración**

Sustituir el contenido de `src/components/Toast.jsx` por:

```jsx
import { lazy, Suspense, useEffect } from 'react'
import { useDeviceTier } from '../three/useDeviceTier'

const Celebration = lazy(() => import('../three/Celebration'))

// Aviso efímero de logro desbloqueado. Lleva su propia celebración de fondo,
// dentro de la caja: nunca ocupa la pantalla, así que puede solaparse con la
// celebración de un nivel recién superado sin pelearse con ella.
export default function Toast({ toast, onDismiss }) {
  const { use3D } = useDeviceTier()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null
  return (
    // `fixed` ya crea el contexto de posicionamiento que necesita el canvas de
    // dentro, así que NO se añade `relative`: convivirían dos position en la
    // misma caja y ganaría el que Tailwind emita último, no el que se lea antes.
    <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] glass rounded-2xl shadow-xl overflow-hidden min-w-[18rem]">
      {use3D && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Suspense fallback={null}><Celebration variant="logro" /></Suspense>
        </div>
      )}
      <div className="relative px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">{toast.emoji}</span>
        <div>
          <p className="text-xs text-gray-500">¡Logro desbloqueado!</p>
          <p className="font-display font-bold text-gray-800">{toast.name}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar los tests y verificar que siguen pasando**

Run: `npx vitest run src/__tests__/toast.test.jsx src/state/__tests__/GameProvider.test.jsx`
Expected: PASS. El `Toast` sin 3D queda con el mismo texto y el mismo `role="status"` de antes.

- [ ] **Step 5: Ejecutar la suite completa y el lint**

Run: `npm test && npm run lint`
Expected: PASS todo.

- [ ] **Step 6: Commit**

```bash
git add src/components/Toast.jsx src/__tests__/toast.test.jsx
git commit -m "feat: el aviso de logro desbloqueado lleva su propia celebración"
```

---

### Task 8: CI en GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md` (una línea sobre la CI, si el README tiene sección de desarrollo)

**Interfaces:**
- Consumes: los scripts `lint`, `test` y `build` de `package.json`, que ya existen.
- Produces: nada que consuma otro código.

- [ ] **Step 1: Escribir el workflow**

Crear `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Node 20 para que coincida con el Dockerfile (node:20-slim): la CI debe
      # verificar lo que de verdad se despliega, no otra versión que
      # casualmente también pase.
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run lint

      # La validación de contenido no lleva paso propio: validateContent.test.js
      # ya la ejecuta dentro de la suite, sobre los ocho mundos y sus quests.
      - run: npm test

      - run: npm run build
```

- [ ] **Step 2: Comprobar en local que los cuatro comandos pasan sobre un árbol limpio**

Run:

```bash
rm -rf node_modules && npm ci && npm run lint && npm test && npm run build
```

Expected: los cuatro en verde. Esto es exactamente lo que hará la CI; si algo falla aquí, fallaría allí.

Si `npm ci` se quejara de que `package-lock.json` no cuadra con `package.json`, es que las tasks 4 y 5 dejaron el lock sin commitear: revisar que `package-lock.json` está en el último commit.

- [ ] **Step 3: Verificar la sintaxis del workflow**

Run: `npx --yes js-yaml .github/workflows/ci.yml > /dev/null && echo "YAML válido"`
Expected: `YAML válido`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: lint, tests y build en GitHub Actions sobre Node 20"
```

- [ ] **Step 5: Comprobar que la CI corre de verdad**

Tras subir la rama, mirar la pestaña Actions del repo (o `gh run list --limit 3`). El workflow debe aparecer y terminar en verde. Una CI que no se ha visto correr no es una CI.

---

### Task 9: Cierre de fase

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`

- [ ] **Step 1: Verificación completa**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde. Anotar el número de ficheros y tests para el TODO.

- [ ] **Step 2: Comprobar que el bundle inicial no ha engordado**

Run:

```bash
ls -la dist/assets/index-*.js
gzip -c dist/assets/index-*.js | wc -c
```

Expected: **por debajo de 400 KB gzip.** La línea base antes de la fase eran 385 KB, y lo que se añade al arranque es solo el códec y `SaveTransfer`, unos pocos KB. Si se pasa de 400, `qrcode` o `jsqr` se colaron: revisar los `lazy()` de las tasks 4 y 5.

- [ ] **Step 3: Verificación e2e en navegador**

Levantar con `npm run dev` y comprobar a mano, que es la única forma de ver lo que ningún test ve:

1. `/perfil` muestra la sección Partida con un código que empieza por `MQ1.`
2. «Copiar» deja el código en el portapapeles
3. «Descargar fichero» baja un `.mathquest` con ese mismo código dentro
4. «Mostrar QR» pinta un QR legible
5. Pegar el propio código y pulsar «Revisar código» enseña el resumen, y «Cancelar» lo descarta
6. Pegar un código con un carácter cambiado dice que está incompleto
7. Superar un nivel sigue mostrando la celebración de siempre
8. Derrotar a un jefe muestra la corona, distinta de la del nivel
9. Al desbloquear un logro, el aviso lleva su medalla de fondo

- [ ] **Step 4: Actualizar TODO.md**

Mover la sección «🔴 En curso — Fase 5» al historial siguiendo el formato de las fases anteriores: título con ✅ y fecha, un párrafo con las capas, y otro con las desviaciones conscientes del plan si las hubo. Actualizar el bloque «Estado» de arriba con la rama, el recuento de tests y el estado de la fase. Añadir el plan al índice de «Planes» de la cabecera.

La nota de «Aplazado — lazy loading» **no se borra**: se mueve a «Deuda y cabos sueltos», que es donde vive lo pendiente una vez cerrada la fase.

- [ ] **Step 5: Actualizar README.md**

En la sección `## Estado` (línea 38), la viñeta «Siguiente (Fase 5)» de la línea 42 queda obsoleta: describe la fase como pendiente y además menciona el lazy loading, que se aplazó. Sustituirla por una viñeta de Fase 5 completa que cubra las celebraciones por tipo de victoria, el traspaso de partida por código/fichero/QR y la CI, y una viñeta de «Siguiente» que apunte al `TODO.md`.

En `## Desarrollo` (línea 9), añadir que `lint`, `test` y `build` corren en GitHub Actions en cada push a `main` y en cada PR.

- [ ] **Step 6: Commit**

```bash
git add TODO.md README.md
git commit -m "docs: cerrar Fase 5 — celebraciones por tipo, traspaso de partida y CI"
```

---

## Notas de riesgo para quien implemente

- **`CompressionStream` con `Blob.stream()` rompe los tests.** Está dicho en las constraints globales y en el comentario del códec, pero es el error fácil de cometer al «simplificar» `streamDe`. No se simplifica.
- **`qrcode` es CJS.** Vite lo pre-empaqueta sin problema, pero si el build protesta, el plan B es `import QRCode from 'qrcode/lib/browser'` (Task 4, Step 7).
- **El escáner no se puede probar de verdad en jsdom.** Los tests cubren los caminos de fallo; el camino feliz solo se valida en el navegador (Task 9, Step 3), y hace falta un segundo dispositivo o una ventana con el QR en pantalla.
- **`BarcodeDetector` no existe en Safari/iOS.** Si al probar en un iPhone el escáner no lee, confirmar que está cayendo en la rama de `jsQR` y no en un `detector` a medias.
