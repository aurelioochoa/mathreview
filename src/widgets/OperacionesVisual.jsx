import { useEffect, useRef, useState } from 'react'

// Las cuatro operaciones con conchas que se pueden ver y contar:
//  ➕ juntar dos montones · ➖ tachar las que regalas
//  ✖️ filas iguales (y la suma repetida que esconde)
//  ➗ repartir una a una entre amigos hasta que no sobre nada.

const OPS = [
  { id: 'suma', icon: '➕', label: 'Sumar' },
  { id: 'resta', icon: '➖', label: 'Restar' },
  { id: 'multi', icon: '✖️', label: 'Multiplicar' },
  { id: 'divi', icon: '➗', label: 'Dividir' },
]

function Concha({ color = 'bg-sky-400', tachada = false, nueva = false }) {
  return (
    <span className={`relative inline-block w-5 h-5 rounded-full border-2 border-white shadow-[0_2px_0_rgba(0,0,0,0.15)] ${color} ${tachada ? 'opacity-30' : ''} ${nueva ? 'entrar-abajo' : ''}`}>
      {tachada && <span className="absolute inset-0 grid place-items-center text-red-600 font-bold text-sm leading-none">✕</span>}
    </span>
  )
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <label className="block text-xs font-bold text-gray-600 min-w-[8rem] flex-1">
      <span className="flex justify-between"><span>{label}</span><span className="tabular-nums text-indigo-600 text-sm">{value}</span></span>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-indigo-500" />
    </label>
  )
}

// Conchas en filas de 10 (como un ábaco): así se cuentan de diez en diez.
function Decenas({ items }) {
  const filas = []
  for (let i = 0; i < items.length; i += 10) filas.push(items.slice(i, i + 10))
  return (
    <div className="space-y-1">
      {filas.map((f, i) => <div key={i} className="flex gap-1">{f}</div>)}
    </div>
  )
}

function Suma() {
  const [a, setA] = useState(8)
  const [b, setB] = useState(5)
  const items = [...Array(a)].map((_, i) => <Concha key={`a${i}`} color="bg-sky-400" />)
    .concat([...Array(b)].map((_, i) => <Concha key={`b${i}`} color="bg-orange-400" nueva />))
  return (
    <>
      <div className="flex flex-wrap gap-4 mb-3"><Slider label="🔵 Primer cofre" value={a} min={0} max={20} onChange={setA} /><Slider label="🟠 Segundo cofre" value={b} min={0} max={20} onChange={setB} /></div>
      <Decenas items={items} />
      <p className="mt-3 font-display font-bold text-xl text-center"><span className="text-sky-500">{a}</span> + <span className="text-orange-500">{b}</span> = {a + b}</p>
      <p className="text-xs text-center text-gray-500">Cada fila completa son 10. Cuenta filas y luego las sueltas: {Math.floor((a + b) / 10)} decenas y {(a + b) % 10} unidades.</p>
    </>
  )
}

function Resta() {
  const [a, setA] = useState(13)
  const [b, setB] = useState(5)
  const q = Math.min(b, a)
  const items = [...Array(a)].map((_, i) => <Concha key={i} color="bg-sky-400" tachada={i >= a - q} />)
  return (
    <>
      <div className="flex flex-wrap gap-4 mb-3"><Slider label="🔵 Tenías" value={a} min={1} max={30} onChange={setA} /><Slider label="🎁 Regalas" value={q} min={0} max={a} onChange={setB} /></div>
      <Decenas items={items} />
      <p className="mt-3 font-display font-bold text-xl text-center">{a} − {q} = <span className="text-sky-600">{a - q}</span></p>
      <p className="text-xs text-center text-gray-500">Las tachadas son las que regalaste. Te quedan las que no tienen ✕.</p>
    </>
  )
}

function Multi() {
  const [f, setF] = useState(4)
  const [c, setC] = useState(5)
  const [hover, setHover] = useState(null)
  return (
    <>
      <div className="flex flex-wrap gap-4 mb-3"><Slider label="🏠 Cuevas (filas)" value={f} min={1} max={9} onChange={setF} /><Slider label="🦀 Criaturas por cueva" value={c} min={1} max={9} onChange={setC} /></div>
      <div className="inline-flex flex-col gap-1 rounded-xl bg-amber-50 p-2 border border-amber-100" onMouseLeave={() => setHover(null)}>
        {[...Array(f)].map((_, i) => (
          <div key={i} className={`flex gap-1 items-center rounded-lg px-1 transition-colors ${hover === i ? 'bg-amber-200' : ''}`} onMouseEnter={() => setHover(i)}>
            {[...Array(c)].map((_, j) => <Concha key={j} color={i % 2 ? 'bg-violet-400' : 'bg-fuchsia-400'} />)}
            <span className="ml-2 text-xs font-bold text-amber-700 tabular-nums">{c * (i + 1)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 font-display font-bold text-xl text-center">{f} × {c} = {f * c}</p>
      <p className="text-xs text-center text-gray-500">Es sumar {f} veces el {c}: {Array(f).fill(c).join(' + ')} = {f * c}. El número de la derecha va contando.</p>
    </>
  )
}

function Divi() {
  const [amigos, setAmigos] = useState(4)
  const [cada, setCada] = useState(3)
  const total = amigos * cada
  const [repartidas, setRepartidas] = useState(0)
  const timer = useRef(null)

  useEffect(() => () => clearInterval(timer.current), [])
  const reset = (fn) => (v) => { clearInterval(timer.current); setRepartidas(0); fn(v) }
  const repartir = () => {
    clearInterval(timer.current)
    setRepartidas(0)
    let n = 0
    timer.current = setInterval(() => {
      n++
      setRepartidas(n)
      if (n >= total) clearInterval(timer.current)
    }, Math.max(60, 900 / total))
  }
  const enMonton = total - repartidas

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-3"><Slider label="👫 Amigos" value={amigos} min={2} max={6} onChange={reset(setAmigos)} /><Slider label="🍬 A cada uno le tocan" value={cada} min={1} max={6} onChange={reset(setCada)} /></div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="rounded-xl bg-gray-50 border p-2 min-w-[6rem]">
          <p className="text-[11px] font-bold text-gray-500 mb-1">Montón: {enMonton}</p>
          <div className="flex flex-wrap gap-1 max-w-[7.5rem]">{[...Array(enMonton)].map((_, i) => <Concha key={i} color="bg-pink-400" />)}</div>
        </div>
        {[...Array(amigos)].map((_, g) => {
          // Reparto por turnos: la concha k va al amigo k % amigos.
          const suyas = Math.floor(repartidas / amigos) + (g < repartidas % amigos ? 1 : 0)
          return (
            <div key={g} className="rounded-xl bg-indigo-50 border border-indigo-100 p-2 w-20 text-center">
              <p className="text-2xl leading-none">🧒</p>
              <div className="flex flex-wrap justify-center gap-0.5 mt-1 min-h-5">{[...Array(suyas)].map((_, i) => <Concha key={i} color="bg-pink-400" nueva />)}</div>
              <p className="text-xs font-bold tabular-nums mt-1">{suyas}</p>
            </div>
          )
        })}
      </div>
      <div className="text-center mt-3">
        <button type="button" onClick={repartir} className="btn btn-sm btn-green">🤲 Repartir una a una</button>
      </div>
      <p className="mt-2 font-display font-bold text-xl text-center">{total} ÷ {amigos} = {repartidas >= total ? cada : '?'}</p>
      <p className="text-xs text-center text-gray-500">Repartir es dar una a cada uno por turnos hasta vaciar el montón. Lo que le toca a CADA uno es el resultado.</p>
    </>
  )
}

export default function OperacionesVisual() {
  const [op, setOp] = useState('suma')
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4" role="tablist" aria-label="Operación">
        {OPS.map(o => (
          <button key={o.id} type="button" role="tab" aria-selected={op === o.id} onClick={() => setOp(o.id)}
            className={`btn btn-sm !px-1 flex-col !gap-0.5 ${op === o.id ? '' : 'btn-ghost'}`}>
            <span className="text-lg leading-none">{o.icon}</span><span className="text-[11px]">{o.label}</span>
          </button>
        ))}
      </div>
      {op === 'suma' && <Suma />}
      {op === 'resta' && <Resta />}
      {op === 'multi' && <Multi />}
      {op === 'divi' && <Divi />}
    </div>
  )
}
