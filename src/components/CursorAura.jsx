import { useEffect, useRef } from 'react'
import { useGame } from '../state/gameStore'
import { findItem } from '../content/shop'
import { MAX_PARTICULAS, efectoDe, crearParticula, avanzarParticula, estaViva, aspecto } from './trailEffects'

// Estela de partículas que el cursor va soltando por el camino. La física está
// en trailEffects.js; aquí solo vive el enganche con el DOM.
//
// Es puro adorno: no captura eventos (pointer-events: none) y no entra en el
// árbol de accesibilidad.
//
// No re-renderiza con cada mousemove. React monta una vez el charco de nodos y
// a partir de ahí un bucle de requestAnimationFrame les escribe el transform
// directamente. Con estado de React, mover el ratón por el mapa 3D disparaba
// un render por cada píxel y el mapa se arrastraba.
export default function CursorAura() {
  const { state } = useGame()
  const item = findItem(state.cosmetics?.cursor)
  const capaRef = useRef(null)

  // Las dos medias queries se leen en el render y no en un efecto porque
  // deciden si el componente existe siquiera. Se consultan a través de
  // window.matchMedia, que en un entorno sin soporte (jsdom pelado) no está:
  // sin él se asume el caso conservador de no pintar nada.
  const mq = (q) => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(q).matches
  const punteroFino = mq('(pointer: fine)')
  const reduce = mq('(prefers-reduced-motion: reduce)')
  const activa = !!item && punteroFino && !reduce

  const efectoId = item?.efecto
  const colores = item?.colors?.join(',')

  useEffect(() => {
    if (!activa) return
    const capa = capaRef.current
    if (!capa) return

    const efecto = efectoDe(efectoId)
    const paleta = colores ? colores.split(',') : ['#ffffff']
    const nodos = Array.from(capa.children)
    const vivas = []
    let siguienteColor = 0

    // Las partículas se sueltan por distancia recorrida y no por tiempo: así
    // la estela tiene la misma densidad muevas el ratón deprisa o despacio, y
    // dejar el ratón quieto no acumula un montón encima del cursor.
    let ultimo = null
    let acumulado = 0

    const onMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      if (!ultimo) { ultimo = { x, y }; return }
      const dx = x - ultimo.x
      const dy = y - ultimo.y
      const recorrido = Math.hypot(dx, dy)
      const desde = ultimo
      ultimo = { x, y }
      if (recorrido === 0) return

      // La velocidad del puntero se estima repartiendo el salto en un frame de
      // 60 Hz, en vez de medir el tiempo entre eventos: dos mousemove seguidos
      // pueden llegar con 0 ms de diferencia y la división se iría a infinito.
      // El tope de crearParticula acaba de acotar el resultado.
      const velX = dx / 16
      const velY = dy / 16
      acumulado += recorrido

      while (acumulado >= efecto.cadaPx) {
        acumulado -= efecto.cadaPx
        // Al llegar al tope se deja de emitir en vez de tirar la más vieja:
        // cortar una estela por la mitad canta más que emitir un poco menos.
        if (vivas.length >= MAX_PARTICULAS) break
        // Repartidas por el trayecto y no todas en el punto final: al mover
        // rápido, el ratón salta cientos de píxeles entre dos eventos, y sin
        // esto la estela salía a grumos en vez de seguir el camino.
        const t = acumulado / recorrido
        vivas.push(crearParticula(efecto, {
          x: desde.x + dx * (1 - t),
          y: desde.y + dy * (1 - t),
          velX, velY,
          color: paleta[siguienteColor++ % paleta.length],
        }))
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    let raf = 0
    let vivo = true
    let anterior = 0
    const tick = (ahora) => {
      // Un frame ya encolado puede llegar después de la limpieza. Sin esta
      // verja, ese bucle zombi sigue escribiendo sobre el mismo charco de
      // nodos que el bucle nuevo y la estela anterior se queda pegada en
      // pantalla al cambiar de estela.
      if (!vivo) return
      // El primer frame no tiene intervalo con el que comparar; 16 ms es lo
      // que dura uno a 60 Hz y evita un salto inicial.
      const dt = anterior ? Math.min(64, ahora - anterior) : 16
      anterior = ahora

      for (let i = vivas.length - 1; i >= 0; i--) {
        avanzarParticula(vivas[i], efecto, dt)
        if (!estaViva(vivas[i])) vivas.splice(i, 1)
      }

      for (let i = 0; i < nodos.length; i++) {
        const nodo = nodos[i]
        const p = vivas[i]
        if (!p) { nodo.style.opacity = '0'; continue }
        const { opacidad, escala } = aspecto(p)
        nodo.style.opacity = String(opacidad)
        nodo.style.transform =
          `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${p.angulo}deg) scale(${escala})`
        pintar(nodo, p, efecto)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      vivo = false
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      // Los nodos se reutilizan entre estelas, así que se apagan al salir: el
      // bucle nuevo solo toca los que necesita, y los que sobran conservarían
      // el aspecto de la estela anterior.
      for (const nodo of nodos) nodo.style.opacity = '0'
    }
  }, [activa, efectoId, colores])

  if (!activa) return null

  return (
    <div ref={capaRef} data-testid="cursor-aura" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {Array.from({ length: MAX_PARTICULAS }, (_, i) => (
        <span key={i} className="absolute top-0 left-0 block leading-none" style={{ opacity: 0 }} />
      ))}
    </div>
  )
}

// Da al nodo el aspecto de su forma. Se escribe en cada frame porque el charco
// de nodos se reutiliza: el que ahora es una moneda antes fue otra cosa.
function pintar(nodo, p, efecto) {
  const px = `${p.tam}px`
  if (efecto.forma === 'glifo') {
    if (nodo.textContent !== efecto.caracter) nodo.textContent = efecto.caracter
    nodo.style.width = ''
    nodo.style.height = ''
    nodo.style.background = ''
    nodo.style.borderRadius = ''
    nodo.style.border = ''
    nodo.style.fontSize = px
    nodo.style.color = p.color
    return
  }

  if (nodo.textContent !== '') nodo.textContent = ''
  nodo.style.width = px
  nodo.style.border = ''
  if (efecto.forma === 'confeti') {
    // Rectángulo alargado: al girar se lee como un papelito dando vueltas.
    nodo.style.height = `${p.tam * 0.5}px`
    nodo.style.background = p.color
    nodo.style.borderRadius = '2px'
    return
  }

  nodo.style.height = px
  nodo.style.borderRadius = '9999px'
  if (efecto.forma === 'burbuja') {
    // Hueca y con un brillo arriba a la izquierda, que es lo que la distingue
    // de un punto de color sin más.
    nodo.style.background = `radial-gradient(circle at 32% 28%, #ffffffcc 0 12%, ${p.color}40 38%, ${p.color}18 70%)`
    nodo.style.border = `1px solid ${p.color}80`
    return
  }
  nodo.style.background = `radial-gradient(circle, ${p.color} 0%, transparent 70%)`
}
