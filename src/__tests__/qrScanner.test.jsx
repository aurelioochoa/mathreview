import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('QrScanner — desmontaje mientras la cámara sigue arrancando', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
  })

  // getUserMedia resuelve, pero `video.play()` (que siempre es asíncrono)
  // se queda pendiente. Si el jugador cierra el escáner en ese hueco, el
  // efecto hace su limpieza (para la cámara, vivo = false) mientras
  // `arrancar()` sigue colgado del `await video.play()`. Cuando `play()`
  // por fin resuelve, `arrancar()` retoma su ejecución: sin un chequeo de
  // `vivo` ahí, seguiría creando un `setInterval` que ya nadie va a limpiar.
  it('no deja un setInterval huérfano si se desmonta con video.play() pendiente', async () => {
    const detener = vi.fn()
    const stream = { getTracks: () => [{ stop: detener }] }
    fingirCamara(vi.fn().mockResolvedValue(stream))

    let resolverPlay
    const playPendiente = new Promise(resolve => { resolverPlay = resolve })
    const playOriginal = window.HTMLMediaElement.prototype.play
    const playSpy = vi.fn(() => playPendiente)
    window.HTMLMediaElement.prototype.play = playSpy

    const setIntervalSpy = vi.spyOn(window, 'setInterval')

    try {
      const { unmount } = render(<QrScanner onCode={() => {}} onCancel={() => {}} />)

      // Espera a que `arrancar()` llegue al `await video.play()` y se quede
      // ahí colgada, con la promesa todavía sin resolver.
      await waitFor(() => expect(playSpy).toHaveBeenCalled())

      // `waitFor` usa su propio `setInterval` interno para sondear: se
      // descarta de la cuenta para que la aserción de abajo solo mire lo que
      // haga nuestro componente, no la maquinaria de testing-library.
      setIntervalSpy.mockClear()

      unmount()
      resolverPlay()

      // Deja correr los microtasks que encolan el `.catch(() => {})` del
      // `await video.play()` y la continuación de `arrancar()` tras él.
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(detener).toHaveBeenCalled()
      expect(setIntervalSpy).not.toHaveBeenCalled()
    } finally {
      window.HTMLMediaElement.prototype.play = playOriginal
    }
  })
})
