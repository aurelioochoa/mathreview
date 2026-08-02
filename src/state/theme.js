import { useSyncExternalStore } from 'react'

// Tema de la interfaz: 'auto' (lo que diga el sistema), 'claro' u 'oscuro'.
//
// Vive en su propia clave de localStorage y NO dentro de la partida a
// propósito. El traspaso de partida (código, fichero o QR) mueve el progreso
// entre dispositivos, y el tema no es progreso: es una preferencia del
// aparato. Si viajara con el save, cargar la partida del móvil en la tablet
// del salón cambiaría el tema de la tablet sin que nadie lo haya pedido.
export const THEME_KEY = 'mathquest-tema'
export const THEMES = ['auto', 'claro', 'oscuro']

const MQ_OSCURO = '(prefers-color-scheme: dark)'

function media(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  return window.matchMedia(query)
}

// El tema elegido que hay guardado. Cualquier cosa que no sea un tema
// conocido (clave tocada a mano, formato viejo) cuenta como 'auto'.
export function temaGuardado() {
  try {
    const guardado = localStorage.getItem(THEME_KEY)
    return THEMES.includes(guardado) ? guardado : 'auto'
  } catch {
    // localStorage no disponible (modo privado): el tema vive en memoria.
    return 'auto'
  }
}

// De la elección al tema que se pinta de verdad. Solo 'auto' pregunta al
// sistema; elegir a mano manda siempre.
export function resolverTema(tema) {
  if (tema === 'claro' || tema === 'oscuro') return tema
  return media(MQ_OSCURO)?.matches ? 'oscuro' : 'claro'
}

// Escribe el tema resuelto en el <html>: la clase que engancha el variante
// `dark` de Tailwind, y color-scheme para que los controles nativos
// (scrollbars, selects, el cursor de texto) vayan a juego.
export function aplicarTema(resuelto) {
  if (typeof document === 'undefined') return
  const raiz = document.documentElement
  raiz.classList.toggle('dark', resuelto === 'oscuro')
  raiz.style.colorScheme = resuelto === 'oscuro' ? 'dark' : 'light'
}

export function siguienteTema(tema) {
  const i = THEMES.indexOf(tema)
  return THEMES[(i + 1) % THEMES.length]
}

// Store mínimo con suscriptores en vez de un contexto de React. La escena 3D
// del mapa, el HUD y el CSS necesitan el tema, y montar un provider obligaría
// a envolver también cada test que renderiza esos componentes.
let tema = temaGuardado()
const oyentes = new Set()

function avisar() {
  for (const fn of oyentes) fn()
}

export function getTema() {
  return tema
}

export function setTema(nuevo) {
  if (!THEMES.includes(nuevo) || nuevo === tema) return
  tema = nuevo
  try {
    localStorage.setItem(THEME_KEY, nuevo)
  } catch {
    // ver temaGuardado: sin poder guardar, el tema dura lo que la pestaña.
  }
  aplicarTema(resolverTema(tema))
  avisar()
}

function suscribir(fn) {
  oyentes.add(fn)
  // Con 'auto', el tema del sistema puede cambiar mientras el juego está
  // abierto (el modo noche del móvil entra solo al anochecer).
  const mq = media(MQ_OSCURO)
  const onSistema = () => {
    if (tema === 'auto') { aplicarTema(resolverTema(tema)); avisar() }
  }
  mq?.addEventListener?.('change', onSistema)
  return () => {
    oyentes.delete(fn)
    mq?.removeEventListener?.('change', onSistema)
  }
}

// Devuelve { tema, resuelto }: la elección y lo que se está pintando.
export function useTema() {
  const elegido = useSyncExternalStore(suscribir, getTema, getTema)
  return { tema: elegido, resuelto: resolverTema(elegido) }
}
