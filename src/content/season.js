// ÚNICO sitio del proyecto con referencias pop caducables.
//
// La spec base lo pide así: lo viral envejece mal, y concentrarlo aquí permite
// refrescarlo cada pocos meses sin tocar el contenido de los mundos. Regla dura
// (con test que la vigila): las entradas son nombres en texto plano, sin cifras
// — nada de "15M de seguidores" ni versiones, que quedan desfasadas solas.
//
// Las fábricas de preguntas insertan estos nombres con pickSeason(rng, lista).

export const SEASON = {
  etiqueta: 'julio 2026',
  juegos: ['Minecraft', 'Roblox', 'Mario Kart', 'Pokémon', 'Among Us', 'Stumble Guys'],
  criaturas: ['dragón', 'slime', 'fénix', 'gato ninja', 'perro cohete', 'pulpo bailarín'],
  // En plural: se insertan tras una cantidad ("42 pizzas entre 7 amigos").
  snacks: ['pizzas', 'galletas', 'helados', 'donas', 'palomitas', 'chocolates'],
  deportes: ['fútbol', 'baloncesto', 'natación', 'ciclismo', 'atletismo'],
  tesoros: ['monedas de oro', 'gemas', 'cofres', 'perlas', 'cromos', 'medallas'],
}

// Todas las listas, para recorrerlas sin repetir sus nombres.
export const SEASON_LISTS = Object.values(SEASON).filter(Array.isArray)

// Elige un elemento. Determinista dado rng; null si la lista está vacía, para
// que una lista mal editada no meta "undefined" dentro de un enunciado.
export function pickSeason(rng, lista) {
  if (!Array.isArray(lista) || lista.length === 0) return null
  return lista[Math.floor(rng() * lista.length)]
}
