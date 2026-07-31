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
