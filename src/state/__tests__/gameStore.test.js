import { describe, it, expect } from 'vitest'
import { gameReducer, initialState, defaultState, coinsForCompletion } from '../gameStore'

describe('gameReducer — base', () => {
  it('ANSWER_CORRECT suma XP', () => {
    expect(gameReducer(initialState, { type: 'ANSWER_CORRECT', xp: 10 }).xp).toBe(10)
  })
  it('acción desconocida devuelve el mismo estado', () => {
    expect(gameReducer(initialState, { type: 'NOPE' })).toBe(initialState)
  })
  it('defaultState trae los campos v3 con sus valores por defecto', () => {
    const s = defaultState()
    expect(s.version).toBe(3)
    expect(s.bossDefeats).toEqual([])
    expect(s.portalPasses).toEqual([])
    expect(s.questsCompleted).toEqual([])
    expect(s.achievements).toEqual([])
    expect(s.hints).toBe(0)
    expect(s.cosmetics).toEqual({ owned: ['avatar-default'], avatar: 'avatar-default', frame: null, title: null })
    expect(s.streak).toEqual({ count: 0, best: 0, lastDate: null })
  })
})

describe('economía por estrellas nuevas', () => {
  it('coinsForCompletion: primer clear paga base + estrellas', () => {
    // primera vez (previaRaw undefined) con 3★ → 3*10 + 15 = 45
    expect(coinsForCompletion(undefined, 3)).toBe(45)
    expect(coinsForCompletion(undefined, 1)).toBe(25) // 1*10 + 15
  })
  it('coinsForCompletion: mejorar la marca paga solo la diferencia (sin base)', () => {
    expect(coinsForCompletion(1, 3)).toBe(20) // (3-1)*10
  })
  it('coinsForCompletion: rejugar sin mejorar paga 0', () => {
    expect(coinsForCompletion(3, 1)).toBe(0)
    expect(coinsForCompletion(3, 3)).toBe(0)
  })
  it('LEVEL_COMPLETED aplica la regla y guarda la mejor marca', () => {
    let s = gameReducer(initialState, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 2, xp: 50 })
    expect(s.stars.k).toBe(2)
    expect(s.xp).toBe(50)
    expect(s.coins).toBe(35) // 2*10 + 15
    expect(s.completedLevels).toContain('k')
    // rejugar peor: 0 monedas, estrellas intactas, sin duplicar
    s = gameReducer(s, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 1, xp: 50 })
    expect(s.stars.k).toBe(2)
    expect(s.coins).toBe(35)
    expect(s.completedLevels.filter(x => x === 'k')).toHaveLength(1)
    // rejugar mejor (3★): paga la diferencia (3-2)*10 = 10
    s = gameReducer(s, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 3, xp: 50 })
    expect(s.stars.k).toBe(3)
    expect(s.coins).toBe(45)
  })
})

describe('acciones nuevas del reducer', () => {
  it('BOSS_DEFEATED registra el mundo (sin duplicar) y suma recompensas', () => {
    let s = gameReducer(initialState, { type: 'BOSS_DEFEATED', worldId: 'mundo3', coins: 60, xp: 120 })
    expect(s.bossDefeats).toEqual(['mundo3'])
    expect(s.coins).toBe(60); expect(s.xp).toBe(120)
    s = gameReducer(s, { type: 'BOSS_DEFEATED', worldId: 'mundo3', coins: 60, xp: 120 })
    expect(s.bossDefeats).toEqual(['mundo3']) // sin duplicar
    expect(s.coins).toBe(120) // pero vuelve a pagar (rejugar jefe no está bloqueado)
  })
  it('QUEST_COMPLETED paga una vez; rejugar no vuelve a pagar', () => {
    let s = gameReducer(initialState, { type: 'QUEST_COMPLETED', questKey: 'mundo3/q1', coins: 25, xp: 40 })
    expect(s.questsCompleted).toEqual(['mundo3/q1'])
    expect(s.coins).toBe(25)
    s = gameReducer(s, { type: 'QUEST_COMPLETED', questKey: 'mundo3/q1', coins: 25, xp: 40 })
    expect(s.coins).toBe(25) // idempotente
    expect(s.questsCompleted).toEqual(['mundo3/q1'])
  })
  it('OPEN_CHEST aplica coins/hint/cosmetic y no duplica cosméticos', () => {
    expect(gameReducer(initialState, { type: 'OPEN_CHEST', reward: { type: 'coins', amount: 30 } }).coins).toBe(30)
    expect(gameReducer(initialState, { type: 'OPEN_CHEST', reward: { type: 'hint', amount: 2 } }).hints).toBe(2)
    const s = gameReducer(initialState, { type: 'OPEN_CHEST', reward: { type: 'cosmetic', id: 'avatar-mago' } })
    expect(s.cosmetics.owned).toContain('avatar-mago')
    const s2 = gameReducer(s, { type: 'OPEN_CHEST', reward: { type: 'cosmetic', id: 'avatar-mago' } })
    expect(s2.cosmetics.owned.filter(x => x === 'avatar-mago')).toHaveLength(1)
  })
  it('BUY_ITEM descuenta y añade; falla sin monedas', () => {
    const rico = { ...defaultState(), coins: 100 }
    const s = gameReducer(rico, { type: 'BUY_ITEM', item: { id: 'avatar-mago', slot: 'avatar', price: 60 } })
    expect(s.coins).toBe(40); expect(s.cosmetics.owned).toContain('avatar-mago')
    const pobre = { ...defaultState(), coins: 10 }
    const s2 = gameReducer(pobre, { type: 'BUY_ITEM', item: { id: 'avatar-mago', slot: 'avatar', price: 60 } })
    expect(s2).toBe(pobre) // no-op sin monedas
    const hs = gameReducer(rico, { type: 'BUY_ITEM', item: { id: 'hint-pack', slot: 'hint', price: 20, amount: 1 } })
    expect(hs.coins).toBe(80); expect(hs.hints).toBe(1)
  })
  it('EQUIP_COSMETIC solo equipa lo poseído; null revierte a automático', () => {
    const owned = { ...defaultState(), cosmetics: { owned: ['avatar-default', 'avatar-mago'], avatar: 'avatar-default', frame: null, title: null } }
    expect(gameReducer(owned, { type: 'EQUIP_COSMETIC', slot: 'avatar', id: 'avatar-mago' }).cosmetics.avatar).toBe('avatar-mago')
    expect(gameReducer(owned, { type: 'EQUIP_COSMETIC', slot: 'avatar', id: 'no-poseido' })).toBe(owned)
    expect(gameReducer(owned, { type: 'EQUIP_COSMETIC', slot: 'title', id: null }).cosmetics.title).toBe(null)
  })
  it('USE_HINT no baja de 0', () => {
    expect(gameReducer(defaultState(), { type: 'USE_HINT' }).hints).toBe(0)
    expect(gameReducer({ ...defaultState(), hints: 2 }, { type: 'USE_HINT' }).hints).toBe(1)
  })
  it('TICK_STREAK aplica la racha calculada y suma el bono', () => {
    const s = gameReducer(defaultState(), { type: 'TICK_STREAK', streak: { count: 1, best: 1, lastDate: '2026-07-22' }, bonus: 7 })
    expect(s.streak).toEqual({ count: 1, best: 1, lastDate: '2026-07-22' })
    expect(s.coins).toBe(7)
  })
  it('TICK_STREAK no vuelve a pagar el bono del mismo día', () => {
    const accion = { type: 'TICK_STREAK', streak: { count: 1, best: 1, lastDate: '2026-07-31' }, bonus: 7 }
    const s = gameReducer(defaultState(), accion)
    expect(s.coins).toBe(7)
    // Segundo disparo idéntico (StrictMode remonta el efecto en desarrollo).
    expect(gameReducer(s, accion)).toBe(s)
  })

  it('PORTAL_PASSED registra el mundo una sola vez', () => {
    let s = gameReducer(defaultState(), { type: 'PORTAL_PASSED', worldId: 'mundo1' })
    expect(s.portalPasses).toEqual(['mundo1'])
    // No da estrellas ni maestría: solo abre paso.
    expect(s.stars).toEqual({})
    expect(s.bossDefeats).toEqual([])
    expect(gameReducer(s, { type: 'PORTAL_PASSED', worldId: 'mundo1' })).toBe(s)
  })

  it('UNLOCK_ACHIEVEMENTS une ids nuevos sin duplicar', () => {
    let s = gameReducer(defaultState(), { type: 'UNLOCK_ACHIEVEMENTS', ids: ['sin-dano'] })
    expect(s.achievements).toEqual(['sin-dano'])
    const s2 = gameReducer(s, { type: 'UNLOCK_ACHIEVEMENTS', ids: ['sin-dano', 'speedrunner'] })
    expect(s2.achievements).toEqual(['sin-dano', 'speedrunner'])
  })
})

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
