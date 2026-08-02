// Física de las estelas del ratón. Cada estela es un sistema de partículas: el
// cursor las suelta por el camino y cada una vive su vida por su cuenta —cae,
// flota, gira y se apaga— en vez de ir pegada al puntero.
//
// La tabla y las funciones son puras y viven fuera de CursorAura.jsx, igual
// que celebrationVariants.js: así el movimiento se puede testear sin DOM ni
// requestAnimationFrame, que es donde de verdad se esconden los errores.
//
// Unidades: posición en px, tiempo en ms, velocidad en px/ms y gravedad en
// px/ms². Todo por milisegundo para poder avanzar con el delta real del frame
// y que la estela vaya igual a 60 Hz que a 144 Hz.

// Cuántas partículas pueden estar vivas a la vez. Es un tope de nodos del DOM,
// no una preferencia estética: por encima de esto se nota en máquinas justas,
// y ninguna estela necesita tantas para leerse bien.
export const MAX_PARTICULAS = 56

const glifo = (caracter) => ({ forma: 'glifo', caracter })

export const EFECTOS = {
  // Chispas que titilan y se apagan casi donde nacieron.
  chispas: {
    cadaPx: 16, vida: 650, tam: [5, 10],
    gravedad: 0, dispersion: 0.06, hereda: 0.05, vaiven: 0, giro: 0,
    ...glifo('✦'),
  },
  // Burbujas: suben despacio, se balancean y revientan al final.
  burbujas: {
    cadaPx: 26, vida: 1600, tam: [8, 16],
    gravedad: -0.00004, dispersion: 0.02, hereda: 0.05, vaiven: 0.02, giro: 0,
    forma: 'burbuja',
  },
  // Brasas de cometa: se llevan parte del impulso del ratón y caen.
  cometa: {
    cadaPx: 10, vida: 800, tam: [4, 9],
    gravedad: 0.0006, dispersion: 0.08, hereda: 0.25, vaiven: 0, giro: 0,
    forma: 'punto',
  },
  // Neón es la excepción: partículas muy juntas, sin dispersión y de vida
  // corta, así que no se leen como puntos sueltos sino como una cinta que se
  // desvanece por detrás del cursor.
  neon: {
    cadaPx: 8, vida: 380, tam: [7, 12],
    gravedad: 0, dispersion: 0.005, hereda: 0, vaiven: 0, giro: 0,
    forma: 'punto',
  },
  confeti: {
    cadaPx: 22, vida: 1400, tam: [6, 11],
    gravedad: 0.0009, dispersion: 0.12, hereda: 0.2, vaiven: 0, giro: 0.5,
    forma: 'confeti',
  },
  nieve: {
    cadaPx: 30, vida: 2200, tam: [8, 14],
    gravedad: 0.00012, dispersion: 0.02, hereda: 0.05, vaiven: 0.03, giro: 0.06,
    ...glifo('❄'),
  },
  corazones: {
    cadaPx: 26, vida: 1300, tam: [10, 18],
    gravedad: -0.00012, dispersion: 0.03, hereda: 0.08, vaiven: 0.015, giro: 0,
    ...glifo('♥'),
  },
  monedas: {
    cadaPx: 26, vida: 1200, tam: [12, 20],
    gravedad: 0.0008, dispersion: 0.1, hereda: 0.2, vaiven: 0, giro: 0.6,
    ...glifo('🪙'),
  },
}

export const EFECTO_POR_DEFECTO = 'chispas'

export function efectoDe(nombre) {
  return EFECTOS[nombre] ?? EFECTOS[EFECTO_POR_DEFECTO]
}

// Tope de la velocidad que se hereda del puntero, en px/ms. El ratón puede dar
// saltos enormes de un evento a otro —al entrar en la ventana, al cambiar de
// escritorio, o sencillamente moviéndose muy rápido—, y sin tope una partícula
// nacía con velocidades absurdas y salía disparada fuera de la pantalla antes
// del segundo frame. Se acota aquí, dentro de la función pura, y no en quien
// llama: es un invariante de la partícula, no una cortesía del emisor.
export const VEL_MAX = 1.2

const acotar = (v) => Math.max(-VEL_MAX, Math.min(VEL_MAX, v))

// Nace una partícula en (x, y). `velX`/`velY` es la velocidad del puntero en
// px/ms; parte de ella se hereda, que es lo que hace que las brasas salgan
// despedidas al mover rápido y se queden quietas al mover despacio.
export function crearParticula(efecto, { x, y, velX = 0, velY = 0, color = '#fff' }, rnd = Math.random) {
  const [minTam, maxTam] = efecto.tam
  return {
    x, y,
    vx: (rnd() - 0.5) * efecto.dispersion + acotar(velX) * efecto.hereda,
    vy: (rnd() - 0.5) * efecto.dispersion + acotar(velY) * efecto.hereda,
    angulo: efecto.giro ? rnd() * 360 : 0,
    vAngulo: efecto.giro ? (rnd() - 0.5) * efecto.giro : 0,
    tam: minTam + rnd() * (maxTam - minTam),
    edad: 0,
    vida: efecto.vida,
    color,
  }
}

// Avanza una partícula `dt` milisegundos. Muta el objeto a propósito: se
// llaman decenas por frame y crear objetos nuevos 60 veces por segundo es
// basura que el recolector acaba pagando con tirones.
export function avanzarParticula(p, efecto, dt) {
  // La posición avanza con la velocidad MEDIA del intervalo, no con la final.
  // Con `vy += g·dt; y += vy·dt` la caída depende de en cuántos trozos se
  // parta el tiempo, y la misma estela caía más rápido en un monitor de
  // 144 Hz que en uno de 60. La media equivale a v₀·dt + ½·g·dt², que para
  // aceleración constante es la solución exacta.
  const vyAntes = p.vy
  p.vy += efecto.gravedad * dt
  p.x += p.vx * dt
  p.y += ((vyAntes + p.vy) / 2) * dt
  // El vaivén va sobre la posición y no sobre la velocidad: así el balanceo no
  // se acumula y la partícula no acaba saliéndose de lado. Se muestrea por
  // frame, así que a distinto refresco sale un balanceo ligeramente distinto;
  // en un bamboleo de unos pocos píxeles no se aprecia.
  if (efecto.vaiven) p.x += Math.sin(p.edad * 0.008) * efecto.vaiven * dt
  p.angulo += p.vAngulo * dt
  p.edad += dt
  return p
}

export const estaViva = (p) => p.edad < p.vida

// Opacidad y escala derivadas de la edad. Entra rápido (10% de su vida) y se
// apaga durante el resto: aparecer de golpe se nota como un parpadeo.
export function aspecto(p) {
  const t = Math.min(1, Math.max(0, p.edad / p.vida))
  const entrada = Math.min(1, t / 0.1)
  const salida = 1 - t
  return { opacidad: entrada * salida, escala: 0.6 + 0.4 * entrada }
}
