// Geometría de los sólidos del laboratorio 3D: medidas (área lateral, bases,
// total, volumen) y el "despliegue" de las caras laterales como una cadena de
// rectángulos con bisagras. Puro: el componente 3D solo pinta lo que sale de aquí.

export const SOLIDOS = {
  rect: { nombre: 'Prisma rectangular', icono: '📦' },
  tri: { nombre: 'Prisma triangular', icono: '🔺' },
  hex: { nombre: 'Prisma hexagonal', icono: '⬡' },
  cyl: { nombre: 'Cilindro', icono: '🥫' },
}

const CYL_SEGMENTS = 48

// Lados de la base (longitudes, en orden) y su área, según el tipo.
// dims: { l, w } para rect, { a } para tri/hex, { r } para cyl.
export function base(kind, dims) {
  switch (kind) {
    case 'rect': return { lados: [dims.l, dims.w, dims.l, dims.w], area: dims.l * dims.w }
    case 'tri': return { lados: [dims.a, dims.a, dims.a], area: (Math.sqrt(3) / 4) * dims.a * dims.a }
    case 'hex': return { lados: Array(6).fill(dims.a), area: ((3 * Math.sqrt(3)) / 2) * dims.a * dims.a }
    case 'cyl': {
      const L = 2 * Math.PI * dims.r / CYL_SEGMENTS
      return { lados: Array(CYL_SEGMENTS).fill(L), area: Math.PI * dims.r * dims.r }
    }
    default: throw new Error(`sólido desconocido: ${kind}`)
  }
}

export function medidas(kind, dims, h) {
  const b = base(kind, dims)
  const perimetro = b.lados.reduce((s, x) => s + x, 0)
  const lateral = perimetro * h
  return {
    perimetro,
    areaBase: b.area,
    lateral,
    total: lateral + 2 * b.area,
    volumen: b.area * h,
  }
}

// Puntos de la cadena de bisagras en el plano XZ para un grado de despliegue
// t ∈ [0, 1]. La cara 0 se queda quieta en z = 0, de x = -L0/2 a x = L0/2; las
// demás giran hacia dentro (−z) un ángulo exterior·(1 − t) cada una. Con t = 0
// la cadena cierra el polígono de la base; con t = 1 queda en línea recta.
export function cadena(lados, t) {
  const n = lados.length
  const ext = (2 * Math.PI) / n // polígonos regulares o rectángulo: ext = 2π/n
  const pts = [[-lados[0] / 2, 0]]
  let phi = 0
  for (let i = 0; i < n; i++) {
    const [x, z] = pts[i]
    pts.push([x + lados[i] * Math.cos(phi), z + lados[i] * Math.sin(phi)])
    phi -= ext * (1 - t)
  }
  return pts
}

// Polígono de la base en coordenadas de "tapa": x igual, y = profundidad hacia
// dentro. Es la cadena cerrada (t = 0) sin el punto repetido del final.
export function tapa(lados) {
  return cadena(lados, 0).slice(0, lados.length).map(([x, z]) => [x, -z])
}

export function fmt(n, dec = 1) {
  return Number.isInteger(n) ? String(n) : n.toFixed(dec).replace('.', ',')
}
