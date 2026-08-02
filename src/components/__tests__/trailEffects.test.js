import { describe, it, expect } from 'vitest'
import { EFECTOS, VEL_MAX, efectoDe, crearParticula, avanzarParticula, estaViva, aspecto } from '../trailEffects'
import { SHOP_ITEMS } from '../../content/shop'

// rnd fijo en 0.5: los términos aleatorios (dispersión, giro, tamaño) salen
// centrados, así que lo que se mide es la física y no la suerte.
const rnd = () => 0.5

const nacer = (nombre, extra = {}) =>
  crearParticula(efectoDe(nombre), { x: 100, y: 100, ...extra }, rnd)

function correr(p, nombre, ms, paso = 16) {
  const efecto = efectoDe(nombre)
  for (let t = 0; t < ms; t += paso) avanzarParticula(p, efecto, paso)
  return p
}

describe('trailEffects', () => {
  // Si mañana alguien añade una estela a la tienda y se olvida de darle
  // física, la estela saldría con el efecto por defecto sin avisar. Este test
  // es el aviso.
  it('cada estela del catálogo tiene su efecto', () => {
    const estelas = SHOP_ITEMS.filter(i => i.slot === 'cursor')
    expect(estelas.length).toBeGreaterThan(0)
    for (const item of estelas) {
      expect(EFECTOS[item.efecto], `falta el efecto "${item.efecto}" de ${item.id}`).toBeTruthy()
    }
  })

  it('un efecto desconocido cae en el de por defecto en vez de reventar', () => {
    expect(efectoDe('no-existe')).toBe(EFECTOS.chispas)
  })

  it('la partícula nace donde está el cursor y con la vida entera', () => {
    const p = nacer('chispas')
    expect([p.x, p.y]).toEqual([100, 100])
    expect(p.edad).toBe(0)
    expect(estaViva(p)).toBe(true)
  })

  it('las burbujas suben y el confeti cae', () => {
    expect(correr(nacer('burbujas'), 'burbujas', 600).y).toBeLessThan(100)
    expect(correr(nacer('confeti'), 'confeti', 600).y).toBeGreaterThan(100)
  })

  it('las brasas del cometa heredan parte del impulso del ratón', () => {
    const quieto = nacer('cometa')
    const lanzada = nacer('cometa', { velX: 1 })
    expect(lanzada.vx).toBeGreaterThan(quieto.vx)
  })

  // Un salto enorme del puntero (entrar en la ventana, cambiar de escritorio)
  // no puede parir una partícula que cruce la pantalla en dos frames.
  it('la velocidad heredada está acotada por muy bruto que sea el salto', () => {
    const absurda = nacer('cometa', { velX: 9999, velY: -9999 })
    const tope = VEL_MAX * EFECTOS.cometa.hereda + EFECTOS.cometa.dispersion
    expect(Math.abs(absurda.vx)).toBeLessThanOrEqual(tope)
    expect(Math.abs(absurda.vy)).toBeLessThanOrEqual(tope)
  })

  it('el confeti y las monedas giran; las chispas no', () => {
    expect(correr(nacer('confeti'), 'confeti', 300).angulo).not.toBe(0)
    expect(correr(nacer('chispas'), 'chispas', 300).angulo).toBe(0)
  })

  it('la nieve se balancea de lado sin irse de la pantalla', () => {
    const p = correr(nacer('nieve'), 'nieve', 2000)
    expect(Math.abs(p.x - 100)).toBeGreaterThan(0)
    expect(Math.abs(p.x - 100)).toBeLessThan(60)
  })

  it('la partícula muere al agotar su vida', () => {
    const p = nacer('chispas')
    expect(estaViva(correr(p, 'chispas', EFECTOS.chispas.vida - 32))).toBe(true)
    expect(estaViva(correr(p, 'chispas', 64))).toBe(false)
  })

  // Avanzar 32 ms de una vez tiene que dejar la partícula donde la dejarían
  // dos pasos de 16: sin esto, la estela iría más rápida en un monitor de
  // 144 Hz que en uno de 60.
  it('el movimiento no depende de cuántos frames se den', () => {
    const unPaso = avanzarParticula(nacer('cometa'), efectoDe('cometa'), 32)
    const dosPasos = correr(nacer('cometa'), 'cometa', 32, 16)
    expect(unPaso.x).toBeCloseTo(dosPasos.x, 5)
    expect(unPaso.y).toBeCloseTo(dosPasos.y, 1)
  })

  it('la partícula entra, se apaga y nunca pasa de opaca', () => {
    const p = nacer('chispas')
    expect(aspecto(p).opacidad).toBe(0)
    correr(p, 'chispas', 96)
    expect(aspecto(p).opacidad).toBeGreaterThan(0.5)
    correr(p, 'chispas', EFECTOS.chispas.vida)
    expect(aspecto(p).opacidad).toBeLessThanOrEqual(0)
  })
})
