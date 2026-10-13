import { useId, useState } from 'react'
import ConceptLab from '../components/ConceptLab'

const ink = '#4f46e5'
const mint = '#059669'
const amber = '#b45309'
const buttonClass = 'rounded-lg border border-indigo-300 px-3 py-2 min-h-11 text-sm font-semibold text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50'

function Slider({ label, value, onChange, min = 0, max = 6 }) {
  const id = useId()
  return <div className="min-w-0">
    <label htmlFor={id} className="block text-sm font-semibold mb-1">{label}: <output>{value}</output></label>
    <input id={id} type="range" min={min} max={max} step="1" value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-11 accent-indigo-600" />
  </div>
}

function Equation({ children }) {
  return <p className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-center font-mono font-semibold text-indigo-900 break-words" aria-live="polite" aria-atomic="true">{children}</p>
}

export function CountingLab() {
  const [groups, setGroups] = useState(3)
  const [each, setEach] = useState(4)
  const total = groups * each
  return <ConceptLab concept="counting" title="Construye grupos iguales" question="Si añades un grupo, ¿el total sube de uno en uno o por una fila entera?" goal="Construye 24 fichas en grupos iguales." achieved={total === 24} explanation={`Una fila añade ${each} fichas. Repartir ${total} entre ${groups} grupos devuelve ${each} por grupo.`}>
    <div className="grid sm:grid-cols-2 gap-3"><Slider label="Grupos" value={groups} onChange={setGroups} min={1} /><Slider label="Fichas por grupo" value={each} onChange={setEach} min={1} /></div>
    <svg viewBox="0 0 300 215" style={{ backgroundColor: '#f8fafc' }} className="w-full max-w-sm mx-auto rounded-xl border border-indigo-200" role="img" aria-label={`${groups} filas de ${each} fichas, ${total} en total`}>
      {Array.from({ length: groups }, (_, row) => <g key={row}>
        <rect x="8" y={row * 33 + 5} width="282" height="29" rx="9" fill="#eef2ff" stroke="#a5b4fc" />
        {Array.from({ length: each }, (_, col) => <circle key={col} cx={30 + col * 44} cy={row * 33 + 20} r="10" fill={ink} />)}
        <text x="282" y={row * 33 + 24} textAnchor="end" fontSize="11" fill={ink}>{row + 1}</text>
      </g>)}
    </svg>
    <Equation>{Array.from({ length: groups }, () => each).join(' + ')} = {groups} × {each} = {total}</Equation>
  </ConceptLab>
}

function FractionStrip({ numerator, denominator, twelfths, name }) {
  const divisions = twelfths ? 12 : denominator
  return <div>
    <p className="text-sm mb-1"><strong>{name}:</strong> {numerator}/{denominator}{twelfths ? ` = ${numerator * (12 / denominator)}/12` : ''}</p>
    <svg viewBox="0 0 300 45" style={{ backgroundColor: '#f8fafc' }} className="w-full rounded-lg" role="img" aria-label={`${name}: ${numerator} de ${denominator} partes del mismo entero`}>
      <rect x="1" y="1" width="298" height="40" rx="4" fill="#eef2ff" stroke={ink} />
      <rect x="1" y="1" width={298 * numerator / denominator} height="40" fill={name === 'Primera fracción' ? ink : mint} />
      {Array.from({ length: divisions - 1 }, (_, i) => <line key={i} x1={1 + (i + 1) * 298 / divisions} x2={1 + (i + 1) * 298 / divisions} y1="1" y2="41" stroke="white" strokeWidth="2" />)}
    </svg>
  </div>
}

export function FractionsLab() {
  const [first, setFirst] = useState(1)
  const [second, setSecond] = useState(1)
  const [twelfths, setTwelfths] = useState(false)
  const numerator = first * 3 + second * 2
  const divisor = [12, 6, 4, 3, 2, 1].find(value => numerator % value === 0)
  return <ConceptLab concept="fractions" title="El mismo entero, otros trozos" question="¿Se puede sumar un cuarto y un sexto contando sus trozos como si fueran iguales?" goal="Forma 1/2 + 1/3 y muestra los trozos de tamaño común." achieved={first === 2 && second === 2 && twelfths} explanation={`Un cuarto son 3 doceavos; un sexto son 2 doceavos. La suma ocupa ${numerator} doceavos${numerator > 12 ? ', más de un entero' : ''}.`}>
    <div className="grid sm:grid-cols-2 gap-3"><Slider label="Cuartos" max={4} value={first} onChange={setFirst} /><Slider label="Sextos" value={second} onChange={setSecond} /></div>
    <FractionStrip numerator={first} denominator={4} twelfths={twelfths} name="Primera fracción" />
    <FractionStrip numerator={second} denominator={6} twelfths={twelfths} name="Segunda fracción" />
    <button type="button" aria-pressed={twelfths} onClick={() => setTwelfths(value => !value)} className={buttonClass}>{twelfths ? 'Ver cuartos y sextos' : 'Dividir ambas barras en doceavos'}</button>
    {twelfths && <div className="grid grid-cols-12 gap-1" aria-label={`Suma: ${numerator} doceavos`}>
      {Array.from({ length: 24 }, (_, i) => <span key={i} className={`h-6 rounded border ${i < numerator ? 'bg-indigo-600 border-indigo-600' : 'border-indigo-300'}`} aria-hidden="true" />)}
    </div>}
    <Equation>{first}/4 + {second}/6 = {first * 3}/12 + {second * 2}/12 = {numerator}/12</Equation>
    <p className="text-sm text-center">La misma cantidad simplificada: <strong>{numerator / divisor}/{12 / divisor}</strong>.</p>
    <p className="text-xs text-gray-600">Las barras representan enteros del mismo tamaño. En la suma, cada fila de 12 casillas es un entero.</p>
  </ConceptLab>
}

export function PowersLab() {
  const [base, setBase] = useState(2)
  const [exponent, setExponent] = useState(3)
  return <ConceptLab concept="powers" title="Una potencia crece por pasos" question="¿3² significa 3 × 2 o dos factores iguales a 3?" goal="Construye 3² y compara multiplicar dos veces con multiplicar por 2." achieved={base === 3 && exponent === 2} explanation={exponent === 0 ? 'Cero multiplicaciones: empezamos en 1. Para una base distinta de cero, base⁰ = 1.' : `Cada paso multiplica por ${base}; no añade ${base}. ${base} × ${exponent} = ${base * exponent}, pero ${base} elevado a ${exponent} = ${base ** exponent}.`}>
    <div className="grid sm:grid-cols-2 gap-3"><Slider label="Base" min={2} max={4} value={base} onChange={setBase} /><Slider label="Exponente" max={4} value={exponent} onChange={setExponent} /></div>
    <div className="space-y-2" role="img" aria-label={`Crecimiento de ${base} elevado a ${exponent}: ${Array.from({ length: exponent + 1 }, (_, i) => base ** i).join(', ')}`}>
      {Array.from({ length: exponent + 1 }, (_, i) => <div key={i} className="flex items-center gap-2">
        <span className="w-20 shrink-0 text-sm font-mono">Paso {i}: {base ** i}</span>
        <div className="flex flex-wrap gap-1 flex-1" aria-hidden="true">{Array.from({ length: base ** i }, (_, dot) => <span key={dot} className="w-2 h-2 rounded-sm bg-indigo-600" />)}</div>
      </div>)}
    </div>
    <Equation>{base}<sup>{exponent}</sup> = {exponent ? Array.from({ length: exponent }, () => base).join(' × ') : '1'} = {base ** exponent}</Equation>
  </ConceptLab>
}

export function AlgebraLab() {
  const [x, setX] = useState(2)
  const [step, setStep] = useState(0)
  const left = step === 0 ? 2 * x + 3 : step === 1 ? 2 * x : x
  const right = step === 0 ? 11 : step === 1 ? 8 : 4
  // Positive SVG rotation lowers the right plate; the heavier plate goes down.
  const angle = Math.max(-12, Math.min(12, (right - left) * 2))
  return <ConceptLab concept="algebra" title="Mantén la igualdad en la balanza" question="¿Qué pasa si quitas 3 unidades de un solo lado? ¿Y si las quitas de ambos?" goal="Aplica las dos operaciones a ambos lados y encuentra x." achieved={step === 2 && x === 4} explanation={left === right ? 'Los dos lados pesan lo mismo. La solución sigue siendo x = 4 en cada paso.' : `Izquierda: ${left}; derecha: ${right}. Ajusta x para igualar los pesos; hacer lo mismo a ambos lados conserva la solución.`}>
    <Slider label="Valor de x" min={1} max={8} value={x} onChange={setX} />
    <svg viewBox="0 0 320 145" style={{ backgroundColor: '#f8fafc' }} className="w-full max-w-md mx-auto rounded-xl border border-indigo-200" role="img" aria-label={`Balanza: izquierda ${left}, derecha ${right}, ${left === right ? 'equilibrada' : 'desequilibrada'}`}>
      <path d="M160 65 L135 135 L185 135 Z" fill="#c7d2fe" stroke={ink} />
      <g transform={`rotate(${angle} 160 65)`}>
        <line x1="40" y1="65" x2="280" y2="65" stroke={ink} strokeWidth="5" />
        <path d="M45 65 L25 105 L95 105 L75 65 M245 65 L225 105 L295 105 L275 65" fill="#eef2ff" stroke={ink} strokeWidth="2" />
        <text x="60" y="54" textAnchor="middle" fontSize="19" fill={ink}>{left}</text>
        <text x="260" y="54" textAnchor="middle" fontSize="19" fill={mint}>{right}</text>
      </g>
    </svg>
    <Equation>{step === 0 ? '2x + 3 = 11' : step === 1 ? '2x = 8' : 'x = 4'}</Equation>
    <div className="grid grid-cols-2 gap-3 text-xs" aria-label="Contenido de los dos platos">
      <div className="rounded-xl border border-indigo-200 p-3"><p className="font-semibold mb-2">Plato izquierdo</p><div className="flex flex-wrap gap-1">
        {Array.from({ length: step === 2 ? 1 : 2 }, (_, i) => <span key={`x${i}`} style={{ backgroundColor: ink, color: '#fff' }} className="rounded px-3 py-2">x = {x}</span>)}
        {step === 0 && Array.from({ length: 3 }, (_, i) => <span key={i} className="border border-indigo-300 rounded px-2 py-2">1</span>)}
      </div></div>
      <div className="rounded-xl border border-emerald-200 p-3"><p className="font-semibold mb-2">Plato derecho</p><div className="flex flex-wrap gap-1">{Array.from({ length: right }, (_, i) => <span key={i} className="border border-emerald-300 rounded px-2 py-2">1</span>)}</div></div>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className={buttonClass} disabled={step !== 0} onClick={() => setStep(1)}>Restar 3 en ambos lados</button>
      <button type="button" className={buttonClass} disabled={step !== 1} onClick={() => setStep(2)}>Dividir ambos lados entre 2</button>
      <button type="button" className={buttonClass} onClick={() => { setStep(0); setX(2) }}>Reiniciar balanza</button>
    </div>
    <p className="text-sm text-gray-600">La balanza usa los valores de x que pruebas. La ecuación describe la condición que buscas cumplir. Las cajas x contienen todas la misma cantidad.</p>
  </ConceptLab>
}

export function SystemsLab() {
  const [x, setX] = useState(1)
  const [y, setY] = useState(2)
  const first = x + y === 6
  const second = 2 * x + y === 8
  const px = value => 30 + value * 40
  const py = value => 270 - value * 40
  return <ConceptLab concept="systems" title="Encuentra el punto que cumple dos pistas" question="¿Basta con cumplir una ecuación para resolver el sistema?" goal="Haz verdaderas las dos ecuaciones a la vez." achieved={first && second} explanation={`x + y = ${x + y} ${first ? '✓ cumple 6' : '≠ 6'}; 2x + y = ${2 * x + y} ${second ? '✓ cumple 8' : '≠ 8'}. ${first && second ? 'La intersección es (2, 4).' : 'El punto debe estar sobre las dos rectas.'}`}>
    <div className="grid sm:grid-cols-2 gap-3"><Slider label="Coordenada x" value={x} onChange={setX} /><Slider label="Coordenada y" value={y} onChange={setY} /></div>
    <svg viewBox="0 0 305 300" style={{ backgroundColor: '#f8fafc' }} className="w-full max-w-sm mx-auto rounded-xl border border-indigo-200" role="img" aria-label={`Punto (${x}, ${y}). Primera ecuación: ${first ? 'cumple' : 'no cumple'}. Segunda: ${second ? 'cumple' : 'no cumple'}.`}>
      {Array.from({ length: 7 }, (_, i) => <g key={i}>
        <line x1={px(i)} x2={px(i)} y1="30" y2="270" stroke="#cbd5e1" /><line x1="30" x2="270" y1={py(i)} y2={py(i)} stroke="#cbd5e1" />
        <text x={px(i)} y="290" textAnchor="middle" fontSize="11" fill="#475569">{i}</text><text x="16" y={py(i) + 4} textAnchor="middle" fontSize="11" fill="#475569">{i}</text>
      </g>)}
      <text x="285" y="290" fontSize="13" fill={ink}>x</text><text x="13" y="17" fontSize="13" fill={ink}>y</text>
      <line x1={px(0)} y1={py(6)} x2={px(6)} y2={py(0)} stroke={ink} strokeWidth="3" />
      <line x1={px(1)} y1={py(6)} x2={px(4)} y2={py(0)} stroke={mint} strokeDasharray="8 4" strokeWidth="3" />
      <circle cx={px(x)} cy={py(y)} r="8" fill={amber} stroke="white" strokeWidth="2" />
    </svg>
    <div className="grid sm:grid-cols-2 gap-2 text-sm"><p className="text-indigo-700">Línea continua: x + y = 6</p><p className="text-emerald-700">Línea discontinua: 2x + y = 8</p></div>
    <Equation>Punto que pruebas: ({x}, {y})</Equation>
  </ConceptLab>
}

export function FunctionsLab() {
  const [m, setM] = useState(2)
  const [b, setB] = useState(1)
  const [x, setX] = useState(1)
  const [observedConstant, setObservedConstant] = useState(false)
  const y = m * x + b
  const px = value => 150 + value * 40
  const py = value => 140 - value * 9
  return <ConceptLab concept="functions" title="Una máquina, una tabla y una recta" question="Si la pendiente vale cero, ¿cambiar la entrada cambia la salida?" goal="Pon pendiente 0 y cambia x: comprueba que la salida se queda en b." achieved={m === 0 && observedConstant} explanation={m === 0 ? `Función constante: todas las entradas dan ${b}. Su recorrido es {${b}}, aunque su dominio sea todos los reales.` : `Al aumentar x en 1, la salida cambia ${m}. En el modelo y = mx + b, con x real y m ≠ 0, el recorrido es todos los reales.`}>
    <div className="grid sm:grid-cols-3 gap-3"><Slider label="Pendiente de la máquina" min={-3} max={3} value={m} onChange={value => { setM(value); setObservedConstant(false) }} /><Slider label="Salida inicial b" min={-3} max={3} value={b} onChange={value => { setB(value); setObservedConstant(false) }} /><Slider label="Entrada x" min={-3} max={3} value={x} onChange={value => { if (m === 0 && value !== x) setObservedConstant(true); setX(value) }} /></div>
    <div className="grid grid-cols-3 gap-2 text-center text-sm"><div className="p-3 rounded-xl border border-indigo-200">Entrada<br /><strong>{x}</strong></div><div className="p-3 rounded-xl bg-indigo-50 text-indigo-800">× ({m})<br />+ ({b})</div><div className="p-3 rounded-xl border border-emerald-300">Salida<br /><strong>{y}</strong></div></div>
    <svg viewBox="0 0 310 285" style={{ backgroundColor: '#f8fafc' }} className="w-full max-w-sm mx-auto rounded-xl border border-indigo-200" role="img" aria-label={`Recta y = ${m}x + (${b}), punto (${x}, ${y})`}>
      {Array.from({ length: 7 }, (_, i) => <g key={i}>
        <line x1={px(i - 3)} x2={px(i - 3)} y1="25" y2="250" stroke="#e2e8f0" />
        <text x={px(i - 3)} y="271" fontSize="11" textAnchor="middle" fill="#475569">{i - 3}</text>
      </g>)}
      {[-12, -6, 0, 6, 12].map(value => <g key={value}><line x1="30" x2="270" y1={py(value)} y2={py(value)} stroke="#e2e8f0" /><text x="20" y={py(value) + 4} fontSize="10" textAnchor="end" fill="#475569">{value}</text></g>)}
      <line x1="30" x2="270" y1={py(0)} y2={py(0)} stroke="#64748b" /><line x1={px(0)} x2={px(0)} y1="25" y2="250" stroke="#64748b" />
      <line x1={px(-3)} y1={py(-3 * m + b)} x2={px(3)} y2={py(3 * m + b)} stroke={ink} strokeWidth="3" />
      <circle cx={px(x)} cy={py(y)} r="7" fill={amber} stroke="white" strokeWidth="2" />
      <text x="284" y="143" fontSize="13" fill={ink}>x</text><text x="157" y="17" fontSize="13" fill={ink}>y</text>
    </svg>
    <Equation>f({x}) = ({m}) × ({x}) + ({b}) = {y}</Equation>
    <table className="w-full text-sm text-center border-collapse"><caption className="text-xs text-gray-600 mb-2">La misma regla para cinco entradas</caption><thead><tr><th scope="col" className="border border-indigo-200 p-2">x</th>{[-2, -1, 0, 1, 2].map(value => <th scope="col" key={value} className="border border-indigo-200 p-2">{value}</th>)}</tr></thead><tbody><tr><th scope="row" className="border border-indigo-200 p-2">f(x)</th>{[-2, -1, 0, 1, 2].map(value => <td key={value} className="border border-indigo-200 p-2">{m * value + b}</td>)}</tr></tbody></table>
    <p className="text-xs text-gray-600">La ventana muestra solo x entre −3 y 3; la función matemática puede recibir cualquier número real. Un problema real puede limitar su dominio, como horas ≥ 0.</p>
  </ConceptLab>
}

export function GeometryLab() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(3)
  const c = Math.hypot(a, b)
  return <ConceptLab concept="geometry" title="Pitágoras suma áreas, no lados" question="Si los lados cortos miden 3 y 4, ¿el lado largo mide 7? Cuenta las áreas antes de responder." goal="Construye el triángulo 3–4–5 y observa 9 + 16 = 25." achieved={a === 3 && b === 4} explanation={`${a}² + ${b}² = ${a * a + b * b}. Por eso c = √${a * a + b * b} ≈ ${c.toFixed(2)}. El ángulo marcado debe ser recto.`}>
    <div className="grid sm:grid-cols-2 gap-3"><Slider label="Cateto a" min={1} value={a} onChange={setA} /><Slider label="Cateto b" min={1} value={b} onChange={setB} /></div>
    <svg viewBox="0 0 310 155" style={{ backgroundColor: '#f8fafc' }} className="w-full max-w-sm mx-auto rounded-xl border border-indigo-200" role="img" aria-label={`Triángulo rectángulo: catetos ${a} y ${b}; hipotenusa ${c.toFixed(2)}`}>
      <path d={`M90 125 L${90 + b * 18} 125 L90 ${125 - a * 18} Z`} fill="#eef2ff" stroke={ink} strokeWidth="3" />
      <path d="M90 113 L102 113 L102 125" fill="none" stroke={ink} strokeWidth="2" />
      <text x="75" y={125 - a * 9} textAnchor="end" fontSize="14" fill={ink}>a = {a}</text><text x={90 + b * 9} y="145" textAnchor="middle" fontSize="14" fill={mint}>b = {b}</text>
      <text x={102 + b * 9} y={112 - a * 9} fontSize="14" fill={amber}>c ≈ {c.toFixed(2)}</text>
    </svg>
    <svg viewBox="0 0 320 115" style={{ backgroundColor: '#f8fafc' }} className="w-full max-w-md mx-auto rounded-xl border border-indigo-200" role="img" aria-label={`Cuadrados a escala: área a² ${a * a}, área b² ${b * b}, área c² ${a * a + b * b}`}>
      <rect x="4" y={86 - a * 10} width={a * 10} height={a * 10} fill={ink} />
      <rect x="110" y={86 - b * 10} width={b * 10} height={b * 10} fill={mint} />
      <rect x="225" y={86 - c * 10} width={c * 10} height={c * 10} fill={amber} />
      {Array.from({ length: a - 1 }, (_, i) => <g key={`a${i}`}><line x1={4 + (i + 1) * 10} x2={4 + (i + 1) * 10} y1={86 - a * 10} y2="86" stroke="white" /><line x1="4" x2={4 + a * 10} y1={86 - (i + 1) * 10} y2={86 - (i + 1) * 10} stroke="white" /></g>)}
      {Array.from({ length: b - 1 }, (_, i) => <g key={`b${i}`}><line x1={110 + (i + 1) * 10} x2={110 + (i + 1) * 10} y1={86 - b * 10} y2="86" stroke="white" /><line x1="110" x2={110 + b * 10} y1={86 - (i + 1) * 10} y2={86 - (i + 1) * 10} stroke="white" /></g>)}
      <text x="4" y="105" fontSize="13" fill={ink}>a² = {a * a}</text><text x="110" y="105" fontSize="13" fill={mint}>b² = {b * b}</text><text x="225" y="105" fontSize="13" fill={amber}>c² = {a * a + b * b}</text>
    </svg>
    <Equation>{a}² + {b}² = {a * a} + {b * b} = {a * a + b * b} = c²</Equation>
    <p className="text-sm text-gray-600">Los tres cuadrados usan la misma escala. Cada casilla de los cuadrados pequeños representa 1 unidad cuadrada. El teorema no dice a + b = c.</p>
  </ConceptLab>
}

export function ProbabilityLab() {
  const [target, setTarget] = useState(7)
  const [selected, setSelected] = useState([1, 1])
  const outcomes = Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, i % 6 + 1])
  const favorable = outcomes.filter(([a, b]) => a + b === target).length
  return <ConceptLab concept="probability" title="El mapa de todos los resultados" question="¿Es tan fácil sumar 2 como sumar 7 con dos dados? Cuenta parejas, no solo sumas." goal="Elige suma 7 y selecciona una pareja que la forme." achieved={target === 7 && selected[0] + selected[1] === 7} explanation={`${favorable} de 36 parejas suman ${target}. (1, 6) y (6, 1) son distintas: cada dado tiene su lugar.`}>
    <Slider label="Suma objetivo" min={2} max={12} value={target} onChange={setTarget} />
    <p className="text-xs text-gray-600">Filas: dado A. Columnas: dado B. Las casillas con ✓ cumplen la suma; toca una para comprobarla.</p>
    <div className="grid grid-cols-6 gap-1" role="group" aria-label="36 parejas de dados">
      {outcomes.map(([a, b]) => <button type="button" key={`${a}-${b}`} aria-label={`Dado A ${a}, dado B ${b}, suma ${a + b}${a + b === target ? ', favorable' : ''}`} aria-pressed={selected[0] === a && selected[1] === b} onClick={() => setSelected([a, b])} style={a + b === target ? { backgroundColor: ink, color: '#fff', borderColor: ink } : undefined} className={`min-h-11 rounded-lg border text-xs sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${a + b === target ? '' : 'text-gray-700 border-indigo-200'} ${selected[0] === a && selected[1] === b ? 'ring-2 ring-amber-600 ring-offset-1' : ''}`}>{a} + {b}{a + b === target ? ' ✓' : ''}</button>)}
    </div>
    <Equation>P(suma {target}) = {favorable}/36 ≈ {(favorable / 36 * 100).toFixed(1)} %</Equation>
    <p className="text-sm" aria-live="polite">Pareja seleccionada: ({selected[0]}, {selected[1]}) → suma {selected[0] + selected[1]}. {selected[0] + selected[1] === target ? 'Sí cumple la condición.' : 'No cumple la condición.'}</p>
    <p className="text-xs text-gray-600">Modelo: dos dados justos e independientes. Cada una de las 36 parejas tiene probabilidad 1/36. Una probabilidad no garantiza lo que ocurrirá en la próxima tirada.</p>
  </ConceptLab>
}
