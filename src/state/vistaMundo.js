// Cómo entró el jugador al mundo la última vez: caminando por la isla ('pie')
// o por la lista de niveles ('lista'). Los botones de "Volver al mundo" de los
// modos de juego lo usan para devolverte a donde estabas. Vive en
// sessionStorage: es de esta pestaña, no de la partida.
const KEY = 'mq-vista-mundo'

export function setVistaMundo(modo) {
  try { sessionStorage.setItem(KEY, modo) } catch { /* sin almacenamiento */ }
}

export function rutaMundo(slug) {
  let modo = null
  try { modo = sessionStorage.getItem(KEY) } catch { /* sin almacenamiento */ }
  return modo === 'pie' ? `/mundo/${slug}/explorar` : `/mundo/${slug}`
}
