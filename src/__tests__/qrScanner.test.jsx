import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
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

describe('QrScanner — la cámara no se queda encendida sola', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  })

  function fingirCamaraLista() {
    const detener = vi.fn()
    const stream = { getTracks: () => [{ stop: detener }] }
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    fingirCamara(getUserMedia)
    return { detener, getUserMedia }
  }

  it('si la pestaña deja de estar visible, suelta la cámara y lo dice en pantalla', async () => {
    const { detener } = fingirCamaraLista()
    const playOriginal = window.HTMLMediaElement.prototype.play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)

    try {
      const { container } = render(<QrScanner onCode={() => {}} onCancel={() => {}} />)

      // Deja que arrancar() pase getUserMedia + video.play() y registre el
      // listener de visibilitychange antes de disparar el evento.
      await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled())
      await new Promise(resolve => setTimeout(resolve, 0))

      const video = container.querySelector('video')
      expect(video.srcObject).toBeTruthy()

      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(await screen.findByText(/se apagó la cámara.*cambiaste de pantalla/i)).toBeTruthy()
      expect(detener).toHaveBeenCalled()
      expect(video.srcObject).toBeNull()
    } finally {
      window.HTMLMediaElement.prototype.play = playOriginal
    }
  })

  // El aviso de autocierre manda pulsar un botón: ese botón tiene que
  // encender la cámara de verdad. Antes el único camino que funcionaba era
  // "Cerrar" y volver a abrir el escáner desde el perfil.
  it('tras apagarse sola, "Volver a intentar" vuelve a encender la cámara', async () => {
    const { getUserMedia } = fingirCamaraLista()
    const playOriginal = window.HTMLMediaElement.prototype.play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)

    try {
      const { container } = render(<QrScanner onCode={() => {}} onCancel={() => {}} />)

      await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled())
      await new Promise(resolve => setTimeout(resolve, 0))

      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      expect(await screen.findByText(/se apagó la cámara/i)).toBeTruthy()
      expect(container.querySelector('video')).toBeNull()

      // Volver a la pestaña NO reenciende la cámara sola: hace falta el gesto
      // explícito del jugador.
      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(getUserMedia).toHaveBeenCalledTimes(1)

      // Y el botón que nombra el aviso es el que la enciende.
      fireEvent.click(screen.getByRole('button', { name: /Volver a intentar/i }))

      await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2))
      expect(screen.queryByText(/se apagó la cámara/i)).toBeNull()
      await waitFor(() => expect(container.querySelector('video')?.srcObject).toBeTruthy())
    } finally {
      window.HTMLMediaElement.prototype.play = playOriginal
    }
  })

  it('el texto del aviso nombra al botón que existe en pantalla', async () => {
    fingirCamaraLista()
    const playOriginal = window.HTMLMediaElement.prototype.play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)

    try {
      render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
      await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled())
      await new Promise(resolve => setTimeout(resolve, 0))

      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))

      const aviso = await screen.findByText(/se apagó la cámara/i)
      const nombreDelBoton = screen.getByRole('button', { name: /Volver a intentar/i }).textContent.trim()
      expect(aviso.textContent).toContain(`"${nombreDelBoton}"`)
    } finally {
      window.HTMLMediaElement.prototype.play = playOriginal
    }
  })

  // Hueco real: la pestaña se oculta mientras arrancar() está colgada del
  // `await video.play()`, antes de registrar el listener de visibilidad. El
  // evento no llega a nadie, así que hay que mirar document.hidden a mano.
  it('si la pestaña se oculta mientras la cámara arranca, no se queda encendida', async () => {
    const { detener } = fingirCamaraLista()
    let resolverPlay
    const playPendiente = new Promise(resolve => { resolverPlay = resolve })
    const playOriginal = window.HTMLMediaElement.prototype.play
    const playSpy = vi.fn(() => playPendiente)
    window.HTMLMediaElement.prototype.play = playSpy

    try {
      const { container } = render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
      await waitFor(() => expect(playSpy).toHaveBeenCalled())

      // Se oculta sin disparar el evento: nadie lo está escuchando todavía.
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      await act(async () => {
        resolverPlay()
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(detener).toHaveBeenCalled()
      expect(screen.getByText(/se apagó la cámara.*cambiaste de pantalla/i)).toBeTruthy()
      expect(container.querySelector('video')).toBeNull()
    } finally {
      window.HTMLMediaElement.prototype.play = playOriginal
    }
  })

  it('si nadie encuentra un código antes del tope de tiempo encendida, se apaga sola y lo dice', async () => {
    vi.useFakeTimers()
    const { detener } = fingirCamaraLista()
    const playOriginal = window.HTMLMediaElement.prototype.play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)

    try {
      render(<QrScanner onCode={() => {}} onCancel={() => {}} />)

      // Con temporizadores falsos, getUserMedia/video.play() (ya resueltos)
      // solo necesitan que se vacíen los microtasks para que arrancar()
      // continúe y registre el temporizador del tope. act() asegura que React
      // aplique esos cambios de estado antes de seguir.
      await act(async () => { await vi.advanceTimersByTimeAsync(0) })
      // 3 minutos sin encontrar ningún código (el vídeo de jsdom nunca alcanza
      // HAVE_ENOUGH_DATA, así que el sondeo nunca "encuentra" nada él solo).
      await act(async () => { await vi.advanceTimersByTimeAsync(180000) })

      expect(screen.getByText(/se apagó la cámara.*sin encontrar/i)).toBeTruthy()
      expect(detener).toHaveBeenCalled()
    } finally {
      window.HTMLMediaElement.prototype.play = playOriginal
      vi.useRealTimers()
    }
  })
})
