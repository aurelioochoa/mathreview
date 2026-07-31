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
