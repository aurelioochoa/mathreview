import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

// Píxeles por módulo, en vez de un ancho fijo. El número de módulos del QR
// crece con el tamaño de la partida, así que un ancho fijo va encogiendo cada
// módulo hasta que ningún lector puede con él. Medido en navegador: con el
// ancho fijo de 240 px que había antes, un código de 452 caracteres (versión
// 17, 85x85 módulos, 2,76 px por módulo) no lo decodificaba ni jsQR, que es el
// lector que lleva la propia app. Fijando la escala, decodifica siempre.
const PX_POR_MODULO = 6

// Zona de silencio alrededor del código. El estándar pide 4 módulos; 2 es el
// término medio que aguanta el escaneo de una pantalla sin comerse la caja.
const MARGEN_MODULOS = 2

// Pinta el código de partida como QR. La guarda de tamaño vive en quien lo
// monta: aquí ya se da por hecho que el código cabe.
export default function QrPanel({ code }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !code) return
    let vivo = true
    QRCode.toCanvas(ref.current, code, { scale: PX_POR_MODULO, margin: MARGEN_MODULOS })
      .then(() => {
        if (!vivo || !ref.current) return
        // `qrcode` escribe el tamaño en píxeles en el atributo `style` del
        // canvas, y eso gana a cualquier clase de CSS. Hay que devolvérselo
        // después de generar: si no, el mapa de bits a resolución completa se
        // sale del contenedor en cuanto la partida crece.
        ref.current.style.width = '100%'
        ref.current.style.height = '100%'
      })
      .catch(() => {})
    return () => { vivo = false }
  }, [code])

  return (
    <div className="mt-3 flex flex-col items-center">
      {/* El mapa de bits va a resolución completa y el contenedor lo limita:
          así el código se ve nítido en pantallas de alta densidad, que son las
          que apunta la cámara del otro dispositivo. La caja es cuadrada porque
          un QR deformado no lo lee nadie, y `pixelated` evita que al reducirlo
          se difuminen los bordes de los módulos. */}
      <div className="w-full max-w-[360px] aspect-square">
        {/* El fondo es blanco de verdad, no la superficie del tema: en oscuro,
            un QR sobre fondo gris pierde el contraste que la cámara necesita
            para separar los módulos, y deja de escanearse. */}
        <canvas
          ref={ref}
          aria-label="Código QR de tu partida"
          className="rounded-lg bg-white block"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">Escanéalo desde el otro dispositivo.</p>
    </div>
  )
}
