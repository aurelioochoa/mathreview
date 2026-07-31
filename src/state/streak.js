// Fecha local en 'YYYY-MM-DD' (sin depender de UTC: la racha va por el día del
// jugador, no por el del meridiano de Greenwich).
export function todayStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Días enteros entre dos 'YYYY-MM-DD'. Se pasa por UTC para que el cálculo no
// se descuadre con los cambios de horario de verano.
function diffDays(a, b) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}

// Racha pura. today = 'YYYY-MM-DD'. Mismo día: sin cambios. Día siguiente: +1.
// Cualquier otro salto (incluido hacia atrás): reinicia a 1, conservando best.
export function nextStreak(streak, today) {
  if (streak.lastDate === today) return streak
  const consecutivo = streak.lastDate && diffDays(streak.lastDate, today) === 1
  const count = consecutivo ? streak.count + 1 : 1
  return { count, best: Math.max(streak.best, count), lastDate: today }
}

// Bono diario en monedas: 5 + count*2, topado a 20.
export function dailyBonus(count) {
  return Math.min(20, 5 + count * 2)
}
