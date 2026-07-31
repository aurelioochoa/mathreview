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

describe('saveCode — formas envenenadas (decodeSave valida de verdad)', () => {
  // migrate() solo rellena defaults con spread; no mira tipos. Estos códigos
  // decodifican bien y pasan el checksum (están fabricados con encodeSave,
  // así que el envoltorio es legítimo), pero traen un campo con un tipo que
  // el resto del juego no espera. decodeSave debe cazarlos antes de dar el
  // guardado por bueno.
  it('un array que en realidad es un número da corrupto', async () => {
    const code = await encodeSave({ ...defaultState(), achievements: 5 })
    expect(await decodeSave(code)).toEqual({ ok: false, reason: 'corrupto' })
  })

  it('un array que en realidad es null da corrupto', async () => {
    const code = await encodeSave({ ...defaultState(), completedLevels: null })
    expect(await decodeSave(code)).toEqual({ ok: false, reason: 'corrupto' })
  })

  it('cosmetics que en realidad es un string da corrupto', async () => {
    const code = await encodeSave({ ...defaultState(), cosmetics: 'trampa' })
    expect(await decodeSave(code)).toEqual({ ok: false, reason: 'corrupto' })
  })

  it('cosmetics.owned que no es un array da corrupto', async () => {
    const code = await encodeSave({ ...defaultState(), cosmetics: { ...defaultState().cosmetics, owned: 'trampa' } })
    expect(await decodeSave(code)).toEqual({ ok: false, reason: 'corrupto' })
  })

  it('un numérico que no es un número finito da corrupto', async () => {
    // JSON no tiene NaN: al serializar se convierte en null (es lo que de
    // verdad llegaría si alguien intentara colar NaN a mano), y null tampoco
    // es un número finito.
    const code = await encodeSave({ ...defaultState(), xp: NaN })
    expect(await decodeSave(code)).toEqual({ ok: false, reason: 'corrupto' })
  })

  it('streak con un campo numérico que no es número da corrupto', async () => {
    const code = await encodeSave({ ...defaultState(), streak: { count: 'mucho', best: 0, lastDate: null } })
    expect(await decodeSave(code)).toEqual({ ok: false, reason: 'corrupto' })
  })

  it('una partida legítima sigue pasando la validación de forma', async () => {
    const code = await encodeSave(defaultState())
    const res = await decodeSave(code)
    expect(res.ok).toBe(true)
    expect(res.save).toEqual(defaultState())
  })
})

// Repite a mano el empaquetado de saveCode.js (gzip + base64url) para poder
// fabricar un sobre con un checksum equivocado a propósito. No se reutilizan
// las funciones internas del módulo (no se exportan, y no deberían): el test
// comprueba el comportamiento observable de decodeSave, no su implementación.
async function empaquetarSobre(sobre) {
  const bytes = new TextEncoder().encode(JSON.stringify(sobre))
  const stream = new ReadableStream({ start(c) { c.enqueue(bytes); c.close() } })
  const comprimido = stream.pipeThrough(new CompressionStream('gzip'))
  const reader = comprimido.getReader()
  const trozos = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    trozos.push(value)
  }
  let n = 0
  for (const t of trozos) n += t.length
  const salida = new Uint8Array(n)
  let o = 0
  for (const t of trozos) { salida.set(t, o); o += t.length }
  let bin = ''
  for (let i = 0; i < salida.length; i++) bin += String.fromCharCode(salida[i])
  const b64url = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${CODE_PREFIX}.${b64url}`
}

describe('saveCode — la rama del checksum FNV, no solo el CRC32 del gzip', () => {
  it('un sobre gzip válido (descomprime y da JSON bien formado) con el checksum equivocado da corrupto', async () => {
    // Los tests de "código corrupto" de más arriba los caza el CRC32 del
    // gzip antes de llegar aquí: tocar un carácter del código rompe la
    // integridad del gzip, no el JSON de dentro. Este sobre es gzip válido
    // de principio a fin -- lo único mal es el campo `c`, que no tiene
    // relación con el guardado real -- así que es el único que ejercita la
    // comparación FNV.
    const code = await empaquetarSobre({ c: 'deadbeef', s: defaultState() })
    expect((await decodeSave(code)).reason).toBe('corrupto')
  })
})

describe('saveCode — sin soporte de descompresión en el navegador', () => {
  it('si falta DecompressionStream, lo distingue de un código corrupto', async () => {
    const code = await encodeSave(defaultState())
    const original = globalThis.DecompressionStream
    // Se borra a propósito para simular un navegador sin soporte (Safari iOS
    // < 16.4, WebViews viejos de Android).
    delete globalThis.DecompressionStream
    try {
      const res = await decodeSave(code)
      expect(res).toEqual({ ok: false, reason: 'sinSoporte' })
      expect(res.reason).not.toBe('corrupto')
    } finally {
      globalThis.DecompressionStream = original
    }
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
