import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

// `qrcode` toca el canvas, que jsdom no implementa. Se sustituye para poder
// comprobar con qué opciones se le pide el código, que es justo donde estaba
// el fallo.
const toCanvas = vi.fn(() => Promise.resolve())
vi.mock('qrcode', () => ({ default: { toCanvas: (...a) => toCanvas(...a) } }))

const { default: QrPanel } = await import('../components/QrPanel')

describe('QrPanel — el QR tiene que poder escanearse', () => {
  beforeEach(() => toCanvas.mockClear())

  // El fallo que esto vigila se encontró en navegador, no aquí: con el ancho
  // fijo de 240 px que había antes, un código de 452 caracteres sale en 85x85
  // módulos, o sea 2,76 px por módulo, y no lo decodifica ni jsQR, que es el
  // lector que lleva la propia app. El número de módulos crece con la partida,
  // así que cualquier ancho fijo acaba siendo demasiado pequeño para alguien.
  it('pide el código por escala y no por un ancho fijo', async () => {
    render(<QrPanel code="MQ1.loquesea" />)
    await waitFor(() => expect(toCanvas).toHaveBeenCalled())

    const opciones = toCanvas.mock.calls[0][2]
    expect(opciones.scale, 'debe fijar píxeles por módulo').toBeGreaterThanOrEqual(4)
    expect(opciones.width, 'un ancho fijo encoge los módulos según crece la partida').toBeUndefined()
  })

  it('deja zona de silencio alrededor del código', async () => {
    render(<QrPanel code="MQ1.loquesea" />)
    await waitFor(() => expect(toCanvas).toHaveBeenCalled())
    expect(toCanvas.mock.calls[0][2].margin).toBeGreaterThanOrEqual(2)
  })

  it('la caja del código es cuadrada y está acotada', async () => {
    const { container } = render(<QrPanel code="MQ1.loquesea" />)
    const canvas = container.querySelector('canvas')
    const caja = canvas.parentElement
    // Un QR deformado no lo lee nadie, y sin tope un código grande desbordaría
    // la tarjeta. Ambas cosas viven en el contenedor y no en el canvas, porque
    // `qrcode` pisa el atributo `style` del canvas al generar el código.
    expect(caja.className).toMatch(/aspect-square/)
    expect(caja.className).toMatch(/max-w-/)
    expect(canvas.style.imageRendering).toBe('pixelated')
  })

  it('devuelve el tamaño al canvas después de generar, que `qrcode` lo pisa', async () => {
    const { container } = render(<QrPanel code="MQ1.loquesea" />)
    const canvas = container.querySelector('canvas')
    // `qrcode` escribe width/height en píxeles en el style del canvas. Si no se
    // corrigen después, el mapa de bits a resolución completa se sale del
    // contenedor en cuanto la partida crece (medido en navegador: 534 px de
    // canvas dentro de una caja de 360).
    await waitFor(() => expect(canvas.style.width).toBe('100%'))
    expect(canvas.style.height).toBe('100%')
  })

  it('no pide nada si todavía no hay código', () => {
    render(<QrPanel code="" />)
    expect(toCanvas).not.toHaveBeenCalled()
  })
})
