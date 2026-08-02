import { findItem } from '../content/shop'

// Los colores del marco equipado, listos para pasarlos como `style`. La clase
// `.marco` (src/index.css) es la que pinta el aro; esto solo le dice de qué
// color va.
//
// Devuelve null si no hay marco puesto, o si el id viene de una partida vieja
// con un marco que ya no está en el catálogo: sin colores no hay aro que pintar
// y la opción se queda como estaba, que es justo lo que se quiere.
export function estiloMarco(frameId) {
  const colores = findItem(frameId)?.colors
  if (!colores || colores.length === 0) return null
  return {
    // Se repite el primer color al cerrar la vuelta: sin eso hay un corte duro
    // entre el último y el primero, igual que en el aura del avatar.
    '--marco-colores': [...colores, colores[0]].join(', '),
    // El halo que rodea al aro. Es un solo color -- el primero -- porque un
    // resplandor difuminado no distingue tonos: lo que hace es despegar el
    // marco del fondo blanco del tema claro, donde un aro de 2px se pierde.
    '--marco-brillo': colores[0],
  }
}
