import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'
import { encodeSave, decodeSave, QR_MAX_BYTES } from '../state/saveCode'
import { savePreImportSnapshot, loadPreImportSnapshot, clearPreImportSnapshot } from '../state/persistence'

// Va aparte y en lazy: `qrcode` no puede acabar en el bundle inicial.
const QrPanel = lazy(() => import('./QrPanel'))
// Igual que QrPanel: `jsqr` tampoco puede acabar en el bundle inicial.
const QrScanner = lazy(() => import('./QrScanner'))

const MENSAJES = {
  formato: 'Esto no parece un código de Math Quest.',
  corrupto: 'El código está incompleto. ¿Se copió entero?',
  incompatible: 'Este código es de una versión que ya no se reconoce.',
  // Distinto de 'corrupto' a propósito: aquí el código está bien, es el
  // navegador el que no sabe leerlo. Si sonara igual que "código incompleto",
  // el jugador se pondría a copiarlo diez veces buscando un fallo que no está.
  sinSoporte: 'Este navegador no puede leer códigos de partida. Prueba con otro navegador, o usa el fichero .mathquest.',
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
  const [escaneando, setEscaneando] = useState(false)
  const [hayInstantanea, setHayInstantanea] = useState(() => loadPreImportSnapshot() !== null)
  // Partida que se va a recuperar al deshacer, mientras espera confirmación.
  // null = no se ha pedido deshacer nada.
  const [previaDeshacer, setPreviaDeshacer] = useState(null)
  const [errorExportar, setErrorExportar] = useState(null)
  const [avisoCopiar, setAvisoCopiar] = useState(null)
  const cabeEnQr = codigo.length > 0 && codigo.length <= QR_MAX_BYTES
  const botonCargarRef = useRef(null)
  const botonRecuperarRef = useRef(null)
  const salidaRef = useRef(null)
  // Id incremental de la última petición de "revisar" en curso. decodeSave es
  // asíncrono: si el jugador edita el texto (o lanza otra revisión) mientras
  // una petición vieja sigue en vuelo, esa petición ya no debe poder aplicar
  // su resultado cuando por fin resuelva.
  const peticionRef = useRef(0)

  useEffect(() => {
    let vivo = true
    encodeSave(state)
      .then(c => { if (vivo) { setCodigo(c); setErrorExportar(null) } })
      .catch(() => {
        // Sin CompressionStream (Safari iOS < 16.4, WebViews viejos de
        // Android) encodeSave lanza. Sin este catch, el rechazo quedaba sin
        // capturar y el código se quedaba vacío para siempre sin que nadie
        // se enterara de por qué.
        if (vivo) setErrorExportar('Este navegador no puede generar el código de tu partida. Prueba con otro navegador.')
      })
    return () => { vivo = false }
  }, [state])

  // El panel de confirmación reemplaza la partida entera si se pulsa
  // "Cargar esta partida": con lector de pantalla debe notarse en cuanto
  // aparece (el role="alert" del div se encarga) y el foco debe ir al botón
  // que de verdad importa, no quedarse perdido en el textarea de pegar.
  useEffect(() => {
    if (pendiente) botonCargarRef.current?.focus()
  }, [pendiente])

  // Deshacer reemplaza la partida igual de a fondo que importar, así que su
  // panel de confirmación se comporta igual: se anuncia y se lleva el foco.
  useEffect(() => {
    if (previaDeshacer) botonRecuperarRef.current?.focus()
  }, [previaDeshacer])

  // El aviso de "copiado" (o de reserva manual) es informativo, no un error:
  // se retira solo al cabo de un rato para no dejarlo pegado en pantalla.
  useEffect(() => {
    if (!avisoCopiar) return
    const t = setTimeout(() => setAvisoCopiar(null), 3000)
    return () => clearTimeout(t)
  }, [avisoCopiar])

  const revisar = useCallback(async (texto) => {
    const id = ++peticionRef.current
    setError(null)
    setPendiente(null)
    const res = await decodeSave(texto)
    // Si mientras tanto se lanzó otra revisión (o el texto cambió e
    // invalidó esta petición desde el onChange), el id ya no coincide:
    // aplicar este resultado ahora resucitaría el panel de confirmación de
    // una partida que ya no es la que el jugador está mirando.
    if (id !== peticionRef.current) return
    if (res.ok) setPendiente(res.save)
    else setError(MENSAJES[res.reason])
  }, [])

  const escaneado = useCallback(async (texto) => {
    setEscaneando(false)
    await revisar(texto)
  }, [revisar])

  // El spec pedía "selección manual de reserva": si no hay navigator.clipboard
  // (contexto no seguro, navegador viejo) o si writeText falla, se selecciona
  // el texto del textarea para que el jugador pueda copiarlo a mano con
  // Ctrl+C, y se le dice. También se confirma cuando la copia SÍ funciona
  // sola: hasta ahora no había ninguna señal de que hubiera pasado algo.
  const copiar = async () => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(codigo)
        setAvisoCopiar('¡Código copiado!')
        return
      } catch {
        // sigue abajo, a la reserva manual
      }
    }
    salidaRef.current?.select()
    setAvisoCopiar('Este navegador no copia solo: ya dejamos el texto seleccionado, usa Ctrl+C (o mantén pulsado y elige "Copiar").')
  }

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
    if (fichero) {
      const texto = await fichero.text()
      // Sin esto, el textarea seguía mostrando lo que hubiera antes mientras
      // `pendiente` ya reflejaba el fichero: el resumen no correspondía a lo
      // que el jugador veía escrito.
      setPegado(texto)
      await revisar(texto)
    }
    e.target.value = ''
  }

  const confirmar = () => {
    // La instantánea se guarda ANTES de importar: si se guardara después,
    // el efecto de logros retroactivos ya habría cambiado el estado y
    // estaríamos guardando la partida nueva, no la que se pierde.
    // Si localStorage no dejó guardarla (cuota llena, modo privado) no hay
    // nada que deshacer: el aviso no debe aparecer prometiendo una vuelta
    // atrás que no existe.
    const hayCopia = savePreImportSnapshot(state)
    dispatch({ type: 'IMPORT_SAVE', save: pendiente })
    setPendiente(null)
    setPegado('')
    setHayInstantanea(hayCopia)
  }

  // Primer paso de deshacer: enseñar qué partida se va a recuperar. No aplica
  // nada todavía -- deshacer reemplaza la partida entera igual que importar, y
  // no puede ser un clic pelado.
  const pedirDeshacer = () => {
    const previa = loadPreImportSnapshot()
    if (!previa) {
      // La instantánea caducó (o desapareció) con el perfil abierto: se retira
      // el aviso en vez de dejar un botón que no hace nada.
      setHayInstantanea(false)
      return
    }
    setPreviaDeshacer(previa)
  }

  const confirmarDeshacer = () => {
    dispatch({ type: 'IMPORT_SAVE', save: previaDeshacer })
    clearPreImportSnapshot()
    setPreviaDeshacer(null)
    setHayInstantanea(false)
  }

  return (
    <section className="mt-8">
      <h2 className="font-display font-bold text-gray-700 mb-1">Partida</h2>
      <p className="text-xs text-gray-500 mb-3">
        Llévate tu progreso a otro dispositivo. Guarda el código en sitio seguro: es tu partida entera.
      </p>

      {hayInstantanea && (
        <div className="glass rounded-2xl p-4 mb-3 border border-amber-300">
          <p className="text-sm text-gray-700 mb-2">
            Cargaste una partida hace poco. Si no era la tuya, puedes recuperar la de antes.
          </p>
          {previaDeshacer ? (
            <div role="alert">
              <p className="text-sm text-gray-700">Vas a recuperar: <strong>{resumenDe(previaDeshacer)}</strong></p>
              <p className="text-xs text-gray-500 mt-1">
                Esto reemplaza tu partida actual ({resumenDe(state)}).
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button ref={botonRecuperarRef} onClick={confirmarDeshacer} className={`${boton} bg-primary text-white`}>
                  Sí, recuperar esa partida
                </button>
                <button onClick={() => setPreviaDeshacer(null)} className={`${boton} bg-white border border-gray-200`}>
                  No, dejarlo como está
                </button>
              </div>
            </div>
          ) : (
            <button onClick={pedirDeshacer} className={`${boton} bg-white border border-amber-300 text-amber-700`}>
              Deshacer la última carga
            </button>
          )}
        </div>
      )}

      <div className="glass rounded-2xl p-4 mb-3">
        <label htmlFor="codigo-salida" className="text-xs text-gray-500 block mb-1">Tu código de partida</label>
        <textarea
          id="codigo-salida" ref={salidaRef} readOnly value={codigo} rows={3}
          className="w-full text-xs font-mono border border-gray-200 rounded-lg p-2 bg-white break-all"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={copiar} disabled={!codigo} className={`${boton} bg-primary text-white disabled:opacity-50`}>Copiar</button>
          <button onClick={descargar} disabled={!codigo} className={`${boton} bg-white border border-gray-200 disabled:opacity-50`}>Descargar fichero</button>
          {cabeEnQr && (
            <button onClick={() => setVerQr(v => !v)} className={`${boton} bg-white border border-gray-200`}>
              {verQr ? 'Ocultar QR' : 'Mostrar QR'}
            </button>
          )}
        </div>
        {avisoCopiar && <p role="status" className="text-xs text-gray-600 mt-2">{avisoCopiar}</p>}
        {errorExportar && <p role="alert" className="text-sm text-red-600 mt-2">{errorExportar}</p>}
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
            // Invalida también cualquier revisar() todavía en vuelo: si
            // decodeSave resuelve después de este cambio, ya no debe poder
            // aplicar su resultado (ver el id en revisar()).
            peticionRef.current++
          }}
          className="w-full text-xs font-mono border border-gray-200 rounded-lg p-2 bg-white break-all"
        />
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <button onClick={() => revisar(pegado)} className={`${boton} bg-primary text-white`}>Revisar código</button>
          <label className={`${boton} bg-white border border-gray-200 cursor-pointer focus-within:ring-2 focus-within:ring-primary`}>
            Abrir fichero
            <input type="file" accept=".mathquest,text/plain" onChange={subir} className="sr-only" />
          </label>
          <button onClick={() => setEscaneando(true)} className={`${boton} bg-white border border-gray-200`}>
            Escanear QR
          </button>
        </div>

        {escaneando && (
          <Suspense fallback={null}>
            <QrScanner onCode={escaneado} onCancel={() => setEscaneando(false)} />
          </Suspense>
        )}

        {error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}

        {pendiente && (
          <div role="alert" className="mt-3 border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-700">Vas a cargar: <strong>{resumenDe(pendiente)}</strong></p>
            <p className="text-xs text-gray-500 mt-1">
              Esto reemplaza tu partida actual ({resumenDe(state)}).
            </p>
            <div className="flex gap-2 mt-3">
              <button ref={botonCargarRef} onClick={confirmar} className={`${boton} bg-primary text-white`}>Cargar esta partida</button>
              <button onClick={() => setPendiente(null)} className={`${boton} bg-white border border-gray-200`}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
