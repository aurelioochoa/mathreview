// Botellas con mensaje repartidas por el mar del mapa. Son la recompensa de
// explorar: no dan XP ni monedas (la economía del juego se queda como está),
// solo una curiosidad matemática y la satisfacción de encontrarlas todas.
// Las posiciones están en coordenadas de escena (ya separadas por SPREAD), en
// mar abierto y lejos de las islas; un test lo comprueba.
export const BOTELLAS = [
  { id: 'cero', x: -13.5, z: -4.5, titulo: 'El cero llegó tarde',
    texto: 'Durante siglos no hubo símbolo para "nada". El cero como número lo formalizó Brahmagupta en la India, hacia el año 628.' },
  { id: 'primos', x: -8.2, z: 7.4, titulo: 'Primos infinitos',
    texto: 'Euclides demostró hace más de 2 000 años que los números primos no se acaban nunca: siempre hay uno más grande.' },
  { id: 'pi', x: 0.8, z: -8.4, titulo: 'π no termina',
    texto: 'π = 3,14159… tiene infinitas cifras sin patrón que se repita. Con solo 40 decimales ya calcularías el universo visible con precisión atómica.' },
  { id: 'ajedrez', x: 9.8, z: -6.4, titulo: 'Granos en el ajedrez',
    texto: 'Pon 1 grano en la primera casilla y dobla en cada una: en la 64 habría 2⁶³ granos, más trigo del que se ha cosechado en toda la historia.' },
  { id: 'cumple', x: 11.2, z: 5.6, titulo: 'La paradoja del cumpleaños',
    texto: 'Con solo 23 personas en una sala, la probabilidad de que dos cumplan años el mismo día ya supera el 50 %.' },
  { id: 'hexagonos', x: -4.2, z: -7.6, titulo: 'Abejas geómetras',
    texto: 'Las abejas hacen celdas hexagonales porque el hexágono cubre el plano sin huecos usando el menor perímetro: menos cera por la misma miel.' },
  { id: 'fibonacci', x: 5.6, z: 7.2, titulo: 'Fibonacci en las flores',
    texto: '1, 1, 2, 3, 5, 8, 13… Muchas flores tienen un número de pétalos de esta sucesión, y las espirales de los girasoles suelen ser 34 y 55.' },
  { id: 'pitagoras', x: -14.2, z: 5.2, titulo: 'Cuerdas de 3-4-5',
    texto: 'En el antiguo Egipto se usaba una cuerda con 12 nudos para formar un triángulo 3-4-5 y trazar ángulos rectos perfectos en las construcciones.' },
]

export const BOTTLE_RADIUS = 1.3

// Botella al alcance del barco que aún no se ha recogido, o null. Pura.
export function bottleAt(x, z, found, bottles = BOTELLAS, radius = BOTTLE_RADIUS) {
  for (const b of bottles) {
    if (found.has(b.id)) continue
    if (Math.hypot(x - b.x, z - b.z) < radius) return b.id
  }
  return null
}
