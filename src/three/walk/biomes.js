// Biomas de las islas: cada mundo tiene su propio terreno. Un bioma decide la
// forma del suelo (dunas, colinas, volcán, terrazas, llanura, cráteres,
// cordillera o plaza), sus colores por altura y zona, qué crece encima y qué
// "rasgos" tiene (lava, laguna, setos, cráteres, carpas…).
//
// `makeTerrain(biomaId, seed, stations)` devuelve un terreno con:
//   height(x, z)      altura del suelo (la usan la malla, la física y los objetos)
//   color(x, z, h)    color [r, g, b] 0..1 de ese punto
//   features          rasgos para pintar (y, algunos, para chocar)
//   avoid             círculos { x, z, r } donde no deben ir árboles
//   obstacles         círculos { x, z, r } que el personaje no atraviesa
// Todo es puro y determinista: misma semilla, misma isla.

import { SHORE_R, rng, pathPoints } from './walkLogic'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const angDist = (a, b) => { let d = Math.abs(a - b) % (Math.PI * 2); return d > Math.PI ? Math.PI * 2 - d : d }

export const BIOMA_POR_MUNDO = {
  'isla-numerica': 'dunas',
  'reino-fracciones': 'colinas',
  'volcan-potencias': 'volcan',
  'castillo-algebra': 'terrazas',
  'laberinto-sistemas': 'setos',
  'estacion-funciones': 'crateres',
  'montanas-geometria': 'cordillera',
  'feria-datos': 'plaza',
}

// Paletas y vegetación. `acantilado` y `pradera` los usa también la isla
// pequeña del mapa, para que cada una se reconozca desde el barco.
export const BIOMAS = {
  dunas: {
    nombre: 'Dunas tropicales',
    pradera: '#8fc25a', oscuro: '#5f9a44', arena: '#f1dca4', acantilado: '#c9b08a',
    mix: ['palm', 'palm', 'palm', 'bush', 'rock'], playaDesde: 11.5,
  },
  colinas: {
    nombre: 'Colinas y campos',
    pradera: '#86c05a', oscuro: '#4f8a3c', arena: '#ecd9a6', acantilado: '#a69883',
    mix: ['round', 'round', 'bush', 'bush', 'pine'], campos: ['#e8c84e', '#c98b3b', '#9cc46a', '#d9a441'],
  },
  volcan: {
    nombre: 'Volcán',
    pradera: '#5b534d', oscuro: '#2f2a28', arena: '#6b625a', acantilado: '#4a4340', ceniza: '#8a817a',
    mix: ['rock', 'rock', 'rock', 'deadtree'], lava: true,
  },
  terrazas: {
    nombre: 'Terrazas del castillo',
    pradera: '#7cb65a', oscuro: '#4c7f3d', arena: '#e6d4a4', acantilado: '#b0a492', piedra: '#a79f92',
    mix: ['pine', 'pine', 'round', 'bush', 'rock'],
  },
  setos: {
    nombre: 'Jardín de setos',
    pradera: '#8ccf66', oscuro: '#5f9f4a', arena: '#e8d9ad', acantilado: '#a59a88', seto: '#2f6f3a',
    mix: ['bush', 'bush', 'round'],
  },
  crateres: {
    nombre: 'Suelo lunar',
    pradera: '#b9b4c9', oscuro: '#8a84a3', arena: '#d6d1e3', acantilado: '#7c7690', cristal: '#a78bfa',
    mix: ['rock', 'rock', 'crystal'],
  },
  cordillera: {
    nombre: 'Cordillera nevada',
    pradera: '#7aa85c', oscuro: '#4d7a45', arena: '#e3d6b0', acantilado: '#8d8a86', roca: '#8a8580', nieve: '#f4f7fb',
    mix: ['pine', 'pine', 'pine', 'rock'],
  },
  plaza: {
    nombre: 'Recinto ferial',
    pradera: '#8fcf6a', oscuro: '#63a452', arena: '#eddcb0', acantilado: '#a89c8b', baldosas: ['#f2d7e6', '#fbe7c6', '#d7ecf7'],
    mix: ['round', 'bush', 'bush', 'palm'],
  },
}

export function biomaDe(slug) {
  return BIOMAS[BIOMA_POR_MUNDO[slug]] ? BIOMA_POR_MUNDO[slug] : 'colinas'
}

// Puntos densos del camino y estaciones: donde no se ponen rasgos.
function exclusiones(stations) {
  const pts = []
  for (const s of stations) pts.push({ x: s.x, z: s.z, r: s.kind === 'boss' ? 3.4 : 2.8 })
  const path = pathPoints(stations)
  for (let i = 0; i < path.length - 1; i++) {
    for (let t = 0; t <= 1; t += 0.08) {
      pts.push({ x: path[i].x + (path[i + 1].x - path[i].x) * t, z: path[i].z + (path[i + 1].z - path[i].z) * t, r: 1.6 })
    }
  }
  return pts
}

// Busca `n` sitios libres de radio `rad` entre rMin y rMax.
function sitios(rand, n, rad, rMin, rMax, excl, ya = []) {
  const out = []
  for (let tries = 0; tries < 400 && out.length < n; tries++) {
    const r = rMin + rand() * (rMax - rMin)
    const a = rand() * Math.PI * 2
    const x = Math.sin(a) * r, z = Math.cos(a) * r
    if (excl.some(e => Math.hypot(x - e.x, z - e.z) < e.r + rad)) continue
    if ([...ya, ...out].some(o => Math.hypot(x - o.x, z - o.z) < (o.rad ?? o.r ?? 1) + rad + 0.5)) continue
    out.push({ x, z, rad })
  }
  return out
}

function base(r) {
  return {
    explanada: smooth(3.5, 6.5, r),
    borde: 1 - smooth(SHORE_R - 2, SHORE_R, r),
    orilla: -3.2 * smooth(SHORE_R - 1, SHORE_R + 3.5, r),
  }
}

export function makeTerrain(biomaId, seed, stations) {
  const b = BIOMAS[biomaId] ?? BIOMAS.colinas
  const rand = rng(seed ^ 0x9e3779b9)
  const s = (seed % 1000) / 100
  const excl = exclusiones(stations)
  const features = { lava: [], laguna: null, setos: [], crateres: [], carpas: [], farolas: [], campos: [], cristales: [] }
  const avoid = []
  const obstacles = []

  // ——— Rasgos por bioma ———
  if (biomaId === 'dunas') {
    const [l] = sitios(rand, 1, 2.6, 6, 12, excl)
    if (l) {
      features.laguna = l
      avoid.push({ x: l.x, z: l.z, r: l.rad + 0.6 })
      obstacles.push({ x: l.x, z: l.z, r: l.rad * 0.8 })
    }
  }
  if (biomaId === 'volcan') {
    // Ríos de lava: bajan del cono en radial, esquivando camino y estaciones.
    for (let tries = 0; tries < 60 && features.lava.length < 5; tries++) {
      const a = rand() * Math.PI * 2
      const pts = []
      let ok = true
      for (let r = 4.6; r <= 16; r += 0.7) {
        const aa = a + Math.sin(r * 0.6 + tries) * 0.08
        const p = { x: Math.sin(aa) * r, z: Math.cos(aa) * r }
        if (excl.some(e => Math.hypot(p.x - e.x, p.z - e.z) < e.r * 0.8)) { ok = false; break }
        pts.push(p)
      }
      if (ok && !features.lava.some(l => angDist(l.a, a) < 0.5)) features.lava.push({ a, pts })
    }
    for (const l of features.lava) for (const p of l.pts) avoid.push({ x: p.x, z: p.z, r: 0.8 })
  }
  if (biomaId === 'setos') {
    // Setos en arcos entre las estaciones, con huecos donde pasa el camino.
    for (const radio of [6.2, 12, 15.2]) {
      const n = Math.round(radio * 1.3)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + radio
        const x = Math.sin(a) * radio, z = Math.cos(a) * radio
        if (excl.some(e => Math.hypot(x - e.x, z - e.z) < e.r + 0.4)) continue
        if (rand() < 0.15) continue // huecos para colarse
        const len = (Math.PI * 2 * radio) / n * 0.92
        features.setos.push({ x, z, len, rot: a + Math.PI / 2 })
        obstacles.push({ x, z, r: len * 0.45 })
        avoid.push({ x, z, r: len * 0.6 })
      }
    }
  }
  if (biomaId === 'crateres') {
    features.crateres = sitios(rand, 6, 2, 5.5, 15.5, excl).map(c => ({ ...c, rad: 1.4 + rand() * 1.2, depth: 0.6 + rand() * 0.5 }))
    for (const c of features.crateres) {
      avoid.push({ x: c.x, z: c.z, r: c.rad })
      const k = 2 + Math.floor(rand() * 3)
      for (let i = 0; i < k; i++) {
        const a = rand() * Math.PI * 2
        features.cristales.push({ x: c.x + Math.sin(a) * c.rad * 1.05, z: c.z + Math.cos(a) * c.rad * 1.05, s: 0.6 + rand() * 0.7, rot: rand() * 6 })
      }
    }
    for (const c of features.cristales) obstacles.push({ x: c.x, z: c.z, r: 0.25 * c.s })
  }
  if (biomaId === 'plaza') {
    const colores = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#ec4899']
    features.carpas = sitios(rand, 4, 1.6, 11.5, 15.5, excl).map((c, i) => ({ ...c, color: colores[i % colores.length] }))
    for (const c of features.carpas) { avoid.push({ x: c.x, z: c.z, r: 2.2 }); obstacles.push({ x: c.x, z: c.z, r: 1.35 }) }
    features.farolas = sitios(rand, 10, 0.3, 5, 16, excl, features.carpas.map(c => ({ ...c, rad: 2 })))
    for (const f of features.farolas) { avoid.push({ x: f.x, z: f.z, r: 0.8 }); obstacles.push({ x: f.x, z: f.z, r: 0.15 }) }
  }
  if (biomaId === 'colinas') {
    // Campos de cultivo: sectores del anillo exterior pintados a surcos.
    features.campos = Array.from({ length: 4 }, (_, i) => ({ a: (i / 4) * Math.PI * 2 + rand() * 0.8, ancho: 0.35 + rand() * 0.25, color: hex(b.campos[i % b.campos.length]) }))
  }

  // ——— Altura ———
  const height = (x, z) => {
    const r = Math.hypot(x, z)
    const { explanada, borde, orilla } = base(r)
    let h
    switch (biomaId) {
      case 'dunas': {
        const dunas = 0.35 * Math.sin(x * 0.33 + z * 0.12 + s) + 0.18 * Math.sin(z * 0.5 - x * 0.2 + s * 2)
        h = (dunas + 0.3) * explanada * borde + orilla * 0.9 - 0.25 * smooth(b.playaDesde, SHORE_R, r)
        const l = features.laguna
        if (l) {
          const d = Math.hypot(x - l.x, z - l.z)
          if (d < l.rad + 1) h -= 1.9 * (1 - smooth(l.rad * 0.4, l.rad + 1, d))
        }
        return h
      }
      case 'colinas': {
        const lomas = 0.95 * Math.sin(x * 0.2 + s) * Math.cos(z * 0.17 + s * 1.3) + 0.45 * Math.sin((x - z) * 0.33 + s)
        return (lomas + 0.6) * explanada * borde + orilla
      }
      case 'volcan': {
        // Cono que sube hacia el centro; la explanada queda en la cima.
        const cono = 2.1 * (1 - smooth(4.5, 15, r))
        const rugoso = 0.25 * Math.sin(x * 0.9 + s) * Math.cos(z * 0.8) + 0.15 * Math.sin((x + z) * 1.7)
        let hv = cono + rugoso * explanada * borde + 0.2 * borde
        for (const lv of features.lava) {
          for (const p of lv.pts) {
            const d = Math.hypot(x - p.x, z - p.z)
            if (d < 0.7) { hv -= 0.18 * (1 - d / 0.7); break }
          }
        }
        return hv * borde + orilla
      }
      case 'terrazas': {
        const raw = 0.9 * Math.sin(x * 0.18 + s) * Math.cos(z * 0.21 + s) + 0.6 * Math.sin((x + z) * 0.12) + 0.9
        const escalon = Math.round(raw * 2.4) / 2.4
        const ht = (escalon + (raw - escalon) * 0.15) * explanada * borde
        // Foso alrededor del monumento.
        const foso = -1.5 * (smooth(3.9, 4.4, r) - smooth(5.1, 5.6, r))
        return ht + foso + orilla
      }
      case 'setos': {
        const suave = 0.12 * Math.sin(x * 0.3 + s) * Math.cos(z * 0.3)
        return (suave + 0.2) * explanada * borde + orilla
      }
      case 'crateres': {
        let hc = (0.3 * Math.sin(x * 0.4 + s) * Math.cos(z * 0.35) + 0.4) * explanada * borde
        for (const c of features.crateres) {
          const d = Math.hypot(x - c.x, z - c.z)
          if (d < c.rad * 1.5) {
            const t = d / c.rad
            hc += t < 1 ? -c.depth * (1 - t * t) : 0.25 * c.depth * (1 - smooth(1, 1.5, t)) * smooth(0.9, 1.05, t)
          }
        }
        return hc + orilla
      }
      case 'cordillera': {
        const lomas = 0.5 * Math.sin(x * 0.25 + s) * Math.cos(z * 0.2 + s) + 0.3
        const phi = Math.atan2(x, z)
        const hueco = smooth(0.35, 0.75, angDist(phi, 0)) * smooth(0.3, 0.6, angDist(phi, Math.PI))
        const picos = 1 + 0.45 * Math.sin(phi * 7 + s) + 0.25 * Math.sin(phi * 13 + s * 2)
        const sierra = 3.6 * picos * hueco * smooth(12.8, 16.2, r) * (1 - smooth(17.6, 19.5, r))
        return lomas * explanada * borde + sierra + orilla
      }
      case 'plaza': {
        const suave = 0.08 * Math.sin(x * 0.25 + s) * Math.cos(z * 0.25)
        return (suave + 0.15) * explanada * borde + orilla
      }
      default:
        return 0
    }
  }

  // ——— Color ———
  const P = {
    pradera: hex(b.pradera), oscuro: hex(b.oscuro), arena: hex(b.arena),
    nieve: b.nieve ? hex(b.nieve) : null, roca: b.roca ? hex(b.roca) : null,
    ceniza: b.ceniza ? hex(b.ceniza) : null, piedra: b.piedra ? hex(b.piedra) : null,
    baldosas: b.baldosas ? b.baldosas.map(hex) : null,
  }
  const playaDesde = b.playaDesde ?? 15.8
  const color = (x, z, h) => {
    const r = Math.hypot(x, z)
    const n = 0.5 + 0.5 * Math.sin(x * 1.3 + s) * Math.cos(z * 1.1 - s)
    let c = mix(P.pradera, P.oscuro, clamp(0.35 - h * 0.25 + n * 0.25, 0, 0.8))
    switch (biomaId) {
      case 'colinas':
        for (const f of features.campos) {
          const phi = Math.atan2(x, z)
          if (angDist(phi, f.a) < f.ancho * 0.5 && r > 10 && r < 16.5) {
            const surco = Math.sin((x * Math.cos(f.a) - z * Math.sin(f.a)) * 5) > 0 ? 1 : 0.85
            c = mix(c, f.color.map(v => v * surco), 0.85)
          }
        }
        break
      case 'volcan':
        c = mix(P.pradera, P.oscuro, clamp(0.5 + n * 0.4 - h * 0.1, 0, 1))
        c = mix(c, P.ceniza, smooth(1.2, 2.1, h) * 0.6)
        break
      case 'terrazas': {
        // Borde de cada terraza en piedra.
        const frac = Math.abs(((h * 2.4) % 1 + 1) % 1 - 0.5)
        if (frac > 0.42 && r > 6) c = mix(c, P.piedra, 0.7)
        if (r > 3.9 && r < 5.6) c = mix(c, P.piedra, 0.5)
        break
      }
      case 'crateres':
        c = mix(P.pradera, P.oscuro, clamp(0.3 - h * 0.6 + n * 0.3, 0, 1))
        break
      case 'cordillera':
        c = mix(c, P.roca, smooth(0.9, 1.8, h))
        c = mix(c, P.nieve, smooth(2.1, 2.7, h + n * 0.3))
        break
      case 'plaza':
        if ((r > 7.4 && r < 10.6) || r < 6.5) {
          const i = (Math.floor(x / 1.1) + Math.floor(z / 1.1)) & 1
          const k = Math.floor(Math.abs(x * 0.37 + z * 0.23)) % 3
          c = i ? P.baldosas[k] : mix(P.baldosas[(k + 1) % 3], [1, 1, 1], 0.4)
        }
        break
      default:
    }
    c = mix(c, P.arena, smooth(playaDesde, playaDesde + 1.8, r) * (biomaId === 'volcan' ? 0.4 : 1))
    return c
  }

  return { id: biomaId, bioma: b, height, color, features, avoid, obstacles }
}
