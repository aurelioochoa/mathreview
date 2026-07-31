// Cada tipo de victoria se celebra distinto. La tabla es un objeto puro y vive
// fuera de Celebration.jsx para poder testearla sin WebGL, que en jsdom no
// existe, y para no chocar con react-refresh/only-export-components.

const FIESTA = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308']
const BRASAS = ['#ef4444', '#f97316', '#fbbf24', '#dc2626', '#fb923c', '#fde047']
const ORO = ['#fbbf24', '#f59e0b', '#fde047', '#fcd34d']

export const CELEBRATION_VARIANTS = {
  // 'nivel' reproduce exactamente lo que había antes de existir las variantes.
  nivel: { pieces: 40, centerpiece: 'trofeo', scale: 1, camera: 5, colors: FIESTA },
  jefe: { pieces: 64, centerpiece: 'corona', scale: 1.15, camera: 5, colors: BRASAS },
  // Vive dentro de un aviso de ~320×90 px: poco confeti y cámara cerca.
  logro: { pieces: 18, centerpiece: 'medalla', scale: 0.55, camera: 3.2, colors: ORO },
}

export const DEFAULT_VARIANT = 'nivel'
