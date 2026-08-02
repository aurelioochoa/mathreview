import { useEffect, useRef, useState } from 'react'

const INTERVALO_MS = 250

// Tope duro de tiempo con la cámara encendida, contado desde que arranca. NO
// es un temporizador de inactividad y no se reinicia con nada: el escáner no
// tiene ninguna señal de "actividad" que valga (mira fotogramas cada 250 ms y
// lo único que puede encontrar -- un código -- lo apaga igualmente), así que
// lo honesto es un tope y llamarlo por su nombre.
//
// 3 minutos: los 45 s de antes se quedaban muy cortos para un niño de 8 años
// apuntando con una tablet a un código pequeño, y el tope solo está para no
// dejar la cámara viva si el jugador se va y deja la pantalla abierta.
const TOPE_ENCENDIDA_MS = 180000

const ERRORES = {
  sinApi: 'Este navegador no puede usar la cámara aquí. Prueba con el código o el fichero.',
  permiso: 'No hay permiso para usar la cámara. Actívalo o usa el código o el fichero.',
  sinCamara: 'No se ha encontrado ninguna cámara. Usa el código o el fichero.',
  otro: 'No se ha podido abrir la cámara. Usa el código o el fichero.',
}

// Los dos avisos nombran el botón que de verdad reenciende la cámara, el de
// aquí abajo. Antes decían "Escanear QR" (el del perfil), que con el escáner
// ya montado no hacía nada: el jugador pulsaba y no pasaba nada.
const AVISO_OCULTO = 'Se apagó la cámara porque cambiaste de pantalla. Pulsa "Volver a intentar" para encenderla otra vez.'
const AVISO_TOPE = 'Se apagó la cámara porque llevaba mucho rato encendida sin encontrar ningún código. Pulsa "Volver a intentar" para seguir buscando.'

const boton = 'px-4 py-2 rounded-xl font-display font-bold text-sm'

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
  // Mensaje de autocierre (tope de tiempo encendida o pestaña oculta), o null
  // si la cámara sigue encendida. Distinto de `error`: aquí no ha fallado
  // nada, es el propio escáner el que decide apagarse.
  const [cerrado, setCerrado] = useState(null)
  // Contador de arranques. Es dependencia del efecto a propósito: subirlo es
  // lo que vuelve a lanzar arrancar() cuando el jugador pide reintentar. Sin
  // él, el escáner ya montado se quedaba con su estado `cerrado` para siempre
  // y la cámara no se reencendía por ningún camino.
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vivo = true
    let stream = null
    let timer = null
    let topeEncendida = null

    // Punto único de apagado: para el sondeo, quita el aviso de visibilidad,
    // suelta la cámara física y desengancha el vídeo. Se usa al desmontar,
    // al autocerrarse y al encontrar un código -- así ningún camino se deja
    // la cámara viva por olvido.
    function detener() {
      if (timer) { clearInterval(timer); timer = null }
      if (topeEncendida) { clearTimeout(topeEncendida); topeEncendida = null }
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
      if (videoRef.current) videoRef.current.srcObject = null
    }

    function cerrarPor(mensaje) {
      detener()
      if (vivo) setCerrado(mensaje)
    }

    function alCambiarVisibilidad() {
      // Solo importa que se oculte: al volver a primer plano no se reabre
      // sola la cámara (el jugador pulsa "Volver a intentar" si quiere).
      if (document.hidden) cerrarPor(AVISO_OCULTO)
    }

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
      if (!video) {
        stream.getTracks().forEach(t => t.stop())
        return
      }
      video.srcObject = stream
      await video.play().catch(() => {})
      if (!vivo) return

      // El listener de visibilidad se registra unas líneas más abajo, así que
      // una pestaña que se oculte durante el arranque no dispara nada: sin
      // esta comprobación, la cámara se quedaría encendida en segundo plano
      // hasta el tope de tiempo. Se mira el estado real, que es lo que el
      // evento que no llegó habría contado.
      if (document.hidden) {
        cerrarPor(AVISO_OCULTO)
        return
      }

      const detector = 'BarcodeDetector' in window
        ? new window.BarcodeDetector({ formats: ['qr_code'] })
        : null

      document.addEventListener('visibilitychange', alCambiarVisibilidad)
      topeEncendida = setTimeout(() => cerrarPor(AVISO_TOPE), TOPE_ENCENDIDA_MS)

      timer = setInterval(async () => {
        if (!vivo || !videoRef.current || !canvasRef.current) return
        const texto = await leerFotograma(videoRef.current, canvasRef.current, detector).catch(() => null)
        if (texto && vivo) {
          detener()
          onCode(texto)
        }
      }, INTERVALO_MS)
    }

    arrancar()

    return () => {
      vivo = false
      detener()
    }
  }, [onCode, intento])

  // Reencender la cámara sigue exigiendo un gesto del jugador: se hace desde
  // aquí, nunca sola al volver a la pestaña.
  const reintentar = () => {
    setCerrado(null)
    setIntento(n => n + 1)
  }

  return (
    <div className="mt-3">
      {error ? (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      ) : cerrado ? (
        <p role="status" className="text-sm text-gray-600">{cerrado}</p>
      ) : (
        <>
          <video ref={videoRef} playsInline muted className="w-full max-w-xs rounded-xl bg-black mx-auto block" />
          <p className="text-xs text-gray-500 mt-2 text-center">Apunta al QR del otro dispositivo.</p>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex justify-center gap-2 mt-2">
        {cerrado && (
          <button onClick={reintentar} className={`${boton} bg-primary text-white`}>
            Volver a intentar
          </button>
        )}
        <button onClick={onCancel} className={`${boton} bg-surface border border-gray-200`}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
