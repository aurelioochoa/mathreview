// Paleta de la escena 3D del mapa, por tema. Vive aparte de los componentes
// porque three.js no lee CSS: los colores del canvas no se pueden voltear con
// variables como el resto de la app, hay que pasárselos a los materiales.
//
// De noche no se repintan las islas: se cambian el cielo, el agua y las luces,
// y las islas se ven iluminadas por la luna. Recolorearlas costaría tocar cada
// material y saldría un mapa distinto, no el mismo mapa de noche.
const DIA = {
  niebla: '#b7d9f5',
  oceano: '#3fa7e0',
  ambiente: 0.45,
  sol: { intensidad: 1.3, color: '#ffffff' },
  relleno: { intensidad: 0.4, color: '#a5b4fc' },
  estudio: [
    { intensidad: 3, color: '#ffffff' },
    { intensidad: 1.4, color: '#ffd8a8' },
    { intensidad: 1.2, color: '#bae6fd' },
  ],
}

const NOCHE = {
  niebla: '#131c33',
  oceano: '#14425f',
  // La ambiental sube un poco respecto al día: sin cielo claro que rebote,
  // con 0.45 las caras en sombra de las islas se quedaban en negro puro.
  ambiente: 0.5,
  sol: { intensidad: 0.75, color: '#c7d2fe' },
  relleno: { intensidad: 0.35, color: '#4c1d95' },
  estudio: [
    { intensidad: 1.2, color: '#c7d2fe' },
    { intensidad: 0.7, color: '#7c3aed' },
    { intensidad: 0.9, color: '#38bdf8' },
  ],
}

export function escenaDe(resuelto) {
  return resuelto === 'oscuro' ? NOCHE : DIA
}
