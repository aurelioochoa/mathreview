import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'
import { encodeSave, decodeSave, QR_MAX_BYTES } from '../state/saveCode'

// Va aparte y en lazy: `qrcode` no puede acabar en el bundle inicial.
const QrPanel = lazy(() => import('./QrPanel'))

const MENSAJES = {
  formato: 'Esto no parece un código de Math Quest.',
  corrupto: 'El código está incompleto. ¿Se copió entero?',
  incompatible: 'Este código es de una versión que ya no se reconoce.',
}

// Resumen legible de una partida, para que el jugador confirme que carga la
// que quiere antes de reemplazar la suya. Sin exportar: este fichero tiene
// componentes, y react-refresh/only-export-components prohíbe sacar de aquí
// cualquier otra cosa.
function resumenDe(save) {
  const s = hudStats(save)
  return `Nivel ${s.level} · ${s.coins} monedas · ${save.achievements.length} logros · ${save.completedLevels.length} niveles`
}

const boton = 'px-4 py-2 rounded-xl font-display font-bold text-sm'

export default function SaveTransfer() {
  const { state, dispatch } = useGame()
  const [codigo, setCodigo] = useState('')
  const [pegado, setPegado] = useState('')
  const [pendiente, setPendiente] = useState(null)
  const [error, setError] = useState(null)
  const [verQr, setVerQr] = useState(false)
  const cabeEnQr = codigo.length > 0 && codigo.length <= QR_MAX_BYTES

  useEffect(() => {
    let vivo = true
    encodeSave(state).then(c => { if (vivo) setCodigo(c) })
    return () => { vivo = false }
  }, [state])

  const revisar = useCallback(async (texto) => {
    setError(null)
    setPendiente(null)
    const res = await decodeSave(texto)
    if (res.ok) setPendiente(res.save)
    else setError(MENSAJES[res.reason])
  }, [])

  const copiar = () => navigator.clipboard?.writeText(codigo)

  const descargar = () => {
    const url = URL.createObjectURL(new Blob([codigo], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'partida.mathquest'
    a.click()
    URL.revokeObjectURL(url)
  }

  const subir = async (e) => {
    const fichero = e.target.files?.[0]
    if (fichero) await revisar(await fichero.text())
    e.target.value = ''
  }

  const confirmar = () => {
    dispatch({ type: 'IMPORT_SAVE', save: pendiente })
    setPendiente(null)
    setPegado('')
  }

  return (
    <section className="mt-8">
      <h2 className="font-display font-bold text-gray-700 mb-1">Partida</h2>
      <p className="text-xs text-gray-500 mb-3">
        Llévate tu progreso a otro dispositivo. Guarda el código en sitio seguro: es tu partida entera.
      </p>

      <div className="glass rounded-2xl p-4 mb-3">
        <label htmlFor="codigo-salida" className="text-xs text-gray-500 block mb-1">Tu código de partida</label>
        <textarea
          id="codigo-salida" readOnly value={codigo} rows={3}
          className="w-full text-xs font-mono border border-gray-200 rounded-lg p-2 bg-white break-all"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={copiar} className={`${boton} bg-primary text-white`}>Copiar</button>
          <button onClick={descargar} className={`${boton} bg-white border border-gray-200`}>Descargar fichero</button>
          {cabeEnQr && (
            <button onClick={() => setVerQr(v => !v)} className={`${boton} bg-white border border-gray-200`}>
              {verQr ? 'Ocultar QR' : 'Mostrar QR'}
            </button>
          )}
        </div>
        {codigo.length > QR_MAX_BYTES && (
          <p className="text-xs text-gray-500 mt-2">
            Tu partida es demasiado grande para un QR. Usa el código o el fichero.
          </p>
        )}
        {verQr && <Suspense fallback={null}><QrPanel code={codigo} /></Suspense>}
      </div>

      <div className="glass rounded-2xl p-4">
        <label htmlFor="codigo-entrada" className="text-xs text-gray-500 block mb-1">Pega aquí un código de otro dispositivo</label>
        <textarea
          id="codigo-entrada" value={pegado} rows={3}
          onChange={e => {
            setPegado(e.target.value)
            // Un código pendiente sin confirmar solo vale para el texto que lo
            // generó: si el jugador lo cambia sin volver a pulsar "Revisar
            // código", el resumen y el botón de confirmar quedan obsoletos y
            // podrían aplicar una partida que ya no coincide con lo que ve.
            setPendiente(null)
            setError(null)
          }}
          className="w-full text-xs font-mono border border-gray-200 rounded-lg p-2 bg-white break-all"
        />
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <button onClick={() => revisar(pegado)} className={`${boton} bg-primary text-white`}>Revisar código</button>
          <label className={`${boton} bg-white border border-gray-200 cursor-pointer focus-within:ring-2 focus-within:ring-primary`}>
            Abrir fichero
            <input type="file" accept=".mathquest,text/plain" onChange={subir} className="sr-only" />
          </label>
        </div>

        {error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}

        {pendiente && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-700">Vas a cargar: <strong>{resumenDe(pendiente)}</strong></p>
            <p className="text-xs text-gray-500 mt-1">
              Esto reemplaza tu partida actual ({resumenDe(state)}).
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={confirmar} className={`${boton} bg-primary text-white`}>Cargar esta partida</button>
              <button onClick={() => setPendiente(null)} className={`${boton} bg-white border border-gray-200`}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
