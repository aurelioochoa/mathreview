import * as THREE from 'three'

// Texturas procedurales pintadas en un <canvas>: hierba, arena, roca, madera,
// piedra en sillares, tierra de camino y un normal map para el agua. Nada se
// descarga (el juego funciona offline) y todas son "tileables": el ruido se
// calcula sobre un toro, así que al repetirlas no se ve la costura.
//
// Se crean una sola vez por tipo y se comparten entre mallas; el `repeat` lo
// ajusta cada material clonando la textura (clone() comparte la imagen).

const SIZE = 256
const cache = new Map()

function mulberry32(seed) {
  let a = seed
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Ruido de valor periódico (se repite cada `period` celdas) con fbm.
function makeNoise(seed, period) {
  const rand = mulberry32(seed)
  const grid = Array.from({ length: period * period }, () => rand())
  const at = (x, y) => grid[((y % period) + period) % period * period + (((x % period) + period) % period)]
  const smooth = (t) => t * t * (3 - 2 * t)
  return (u, v) => {
    const x = u * period, y = v * period
    const x0 = Math.floor(x), y0 = Math.floor(y)
    const fx = smooth(x - x0), fy = smooth(y - y0)
    const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1)
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
  }
}

function fbm(seed, octaves = 4, base = 4) {
  const layers = Array.from({ length: octaves }, (_, i) => makeNoise(seed + i * 101, base << i))
  return (u, v) => {
    let s = 0, amp = 0.5, norm = 0
    for (const n of layers) { s += n(u, v) * amp; norm += amp; amp *= 0.5 }
    return s / norm
  }
}

const lerp = (a, b, t) => a + (b - a) * t
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

function paint(fn) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(SIZE, SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = fn(x / SIZE, y / SIZE, x, y)
      const i = (y * SIZE + x) * 4
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return { canvas, ctx }
}

const PINTORES = {
  grass() {
    const n = fbm(11, 5, 4), fine = makeNoise(12, 64)
    const dark = hex('#4f7d3a'), light = hex('#8fbf5a'), dry = hex('#a7a85a')
    const { canvas, ctx } = paint((u, v) => {
      const t = n(u, v)
      let c = mix(dark, light, t)
      c = mix(c, dry, Math.max(0, fine(u, v) - 0.72) * 2)
      const s = 0.85 + fine(u * 2, v * 2) * 0.3
      return c.map(x => x * s)
    })
    // Briznas: trazos cortos claros y oscuros.
    const rand = mulberry32(13)
    for (let i = 0; i < 900; i++) {
      const x = rand() * SIZE, y = rand() * SIZE, l = 3 + rand() * 5
      ctx.strokeStyle = rand() < 0.5 ? 'rgba(170,215,110,0.35)' : 'rgba(45,80,35,0.35)'
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - 0.5) * 2, y - l); ctx.stroke()
    }
    return canvas
  },
  sand() {
    const n = fbm(21, 4, 4), grain = makeNoise(22, 128)
    const a = hex('#d9c08c'), b = hex('#efdcae')
    return paint((u, v) => mix(a, b, n(u, v)).map(x => x * (0.9 + grain(u, v) * 0.2))).canvas
  },
  rock() {
    const n = fbm(31, 5, 3), cracks = fbm(32, 3, 6)
    const a = hex('#6f655c'), b = hex('#a39a8e')
    return paint((u, v) => {
      let c = mix(a, b, n(u, v))
      const k = Math.abs(cracks(u, v) - 0.5)
      if (k < 0.025) c = c.map(x => x * 0.55)
      return c
    }).canvas
  },
  wood() {
    const n = fbm(41, 3, 2), grain = makeNoise(42, 64)
    const a = hex('#7a4a24'), b = hex('#b7803f')
    return paint((u, v) => {
      const ring = Math.sin((u * 18 + n(u, v) * 3) * Math.PI) * 0.5 + 0.5
      return mix(a, b, ring * 0.7 + grain(u * 0.2, v * 4) * 0.3)
    }).canvas
  },
  bricks() {
    const n = fbm(51, 4, 4)
    const mortar = hex('#b9ad95'), a = hex('#d8ccb2'), b = hex('#efe6d2')
    const rows = 8, cols = 4
    const rand = mulberry32(52)
    const tint = Array.from({ length: rows * cols * 2 }, () => rand())
    return paint((u, v) => {
      const row = Math.floor(v * rows)
      const off = row % 2 ? 0.5 / cols : 0
      const uu = (u + off) % 1
      const col = Math.floor(uu * cols)
      const fu = (uu * cols) % 1, fv = (v * rows) % 1
      if (fu < 0.05 || fv < 0.08) return mortar.map(x => x * (0.9 + n(u, v) * 0.15))
      return mix(a, b, tint[row * cols + col] * 0.6 + n(u, v) * 0.4)
    }).canvas
  },
  dirt() {
    const n = fbm(61, 5, 4), pebbles = makeNoise(62, 48)
    const a = hex('#8b6a45'), b = hex('#b8966a')
    return paint((u, v) => {
      let c = mix(a, b, n(u, v))
      if (pebbles(u, v) > 0.8) c = mix(c, hex('#d8cdb8'), 0.6)
      return c
    }).canvas
  },
  metal() {
    const n = fbm(71, 3, 2), brush = makeNoise(72, 128)
    const a = hex('#c9ced3'), b = hex('#eef1f3')
    return paint((u, v) => mix(a, b, n(u, v) * 0.5 + brush(u * 0.05, v) * 0.5)).canvas
  },
  // Normal map del agua: altura por ruido y normales por diferencias finitas.
  waterNormal() {
    const h = fbm(81, 4, 4)
    const e = 1 / SIZE
    return paint((u, v) => {
      const dx = (h((u + e) % 1, v) - h((u - e + 1) % 1, v)) * 6
      const dy = (h(u, (v + e) % 1) - h(u, (v - e + 1) % 1)) * 6
      const nz = 1 / Math.sqrt(dx * dx + dy * dy + 1)
      return [(-dx * nz * 0.5 + 0.5) * 255, (-dy * nz * 0.5 + 0.5) * 255, nz * 255]
    }).canvas
  },
}

// Textura base (compartida) de un tipo.
function base(kind) {
  if (!cache.has(kind)) {
    const canvas = PINTORES[kind]()
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.anisotropy = 4
    if (kind !== 'waterNormal') tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
    cache.set(kind, tex)
  }
  return cache.get(kind)
}

// Textura con su propio `repeat` (la imagen se comparte).
export function texture(kind, repeat = 1) {
  const t = base(kind).clone()
  t.repeat.set(repeat, repeat)
  t.needsUpdate = true
  return t
}

export const TEXTURE_KINDS = Object.keys(PINTORES)
