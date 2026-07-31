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
      if (!vivo) return

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
