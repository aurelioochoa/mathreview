import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }
const baraja = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }

export function media(rng = Math.random) {
  const mean = randInt(rng, 5, 20)
  const d1 = randInt(rng, 1, 4), d2 = randInt(rng, 5, 9)
  const vals = [mean - d2, mean - d1, mean, mean + d1, mean + d2] // promedian 'mean'
  return {
    question: `¿Cuál es la media de: ${vals.join(', ')}?`,
    ...makeOptions(mean, [mean + 1, mean - 1, mean + d2]),
    hint: `Suma = ${vals.reduce((a, b) => a + b, 0)}, n = 5 → media = suma/5.`,
    reminder: 'Media = suma de los valores / cantidad de valores.',
  }
}

export function mediana(rng = Math.random) {
  const base = randInt(rng, 1, 8)
  const vals = [base, base + randInt(rng, 1, 3), base + randInt(rng, 4, 6), base + randInt(rng, 7, 9), base + randInt(rng, 10, 13)]
  const med = vals[2]
  const mostrado = baraja(vals, rng)
  return {
    question: `¿Cuál es la mediana de: ${mostrado.join(', ')}?`,
    ...makeOptions(med, [vals[0], vals[4], vals[1]]),
    hint: 'Ordena los datos y toma el del medio.',
    reminder: 'Mediana = valor central con los datos ordenados.',
  }
}

export function moda(rng = Math.random) {
  const mode = randInt(rng, 1, 9)
  let x = randInt(rng, 1, 9); if (x === mode) x = mode === 9 ? 1 : mode + 1
  let y = randInt(rng, 1, 9); if (y === mode || y === x) y = [1, 2, 3, 4, 5, 6, 7, 8, 9].find(v => v !== mode && v !== x)
  const mostrado = baraja([x, x, y, mode, mode, mode], rng)
  return {
    question: `En los datos ${mostrado.join(', ')}, ¿cuál es la moda?`,
    ...makeOptions(mode, [x, y, mode + 1]),
    hint: 'La moda es el valor que más se repite.',
    reminder: 'Moda = valor más frecuente.',
  }
}

export function principioConteo(rng = Math.random) {
  const a = randInt(rng, 2, 5), b = randInt(rng, 2, 5), c = randInt(rng, 2, 4)
  return {
    question: `Tienes ${a} camisas, ${b} pantalones y ${c} pares de zapatos. ¿Cuántos atuendos distintos puedes formar?`,
    ...makeOptions(a * b * c, [a + b + c, a * b + c, a * b]),
    hint: `${a} × ${b} × ${c}.`,
    reminder: 'Principio de conteo: multiplica las opciones de cada decisión.',
  }
}

export function menuConteo(rng = Math.random) {
  const a = randInt(rng, 2, 5), b = randInt(rng, 3, 6), c = randInt(rng, 2, 3)
  return {
    question: `Un menú tiene ${a} entradas, ${b} platos principales y ${c} postres. ¿Cuántos menús completos distintos hay?`,
    ...makeOptions(a * b * c, [a + b + c, b * c, a * b]),
    hint: `${a} × ${b} × ${c}.`,
    reminder: 'Multiplica las opciones de cada elección independiente.',
  }
}

export function permutaciones(rng = Math.random) {
  const n = randInt(rng, 4, 7), r = randInt(rng, 2, 3)
  return {
    question: `¿De cuántas formas puedes ordenar ${r} elementos elegidos de ${n} (el orden importa)?`,
    ...makeOptions(fact(n) / fact(n - r), [fact(n) / (fact(r) * fact(n - r)), fact(n), n * r]),
    hint: `P(${n},${r}) = ${n}!/(${n}−${r})!.`,
    reminder: 'Permutación (orden importa): P(n,r) = n!/(n−r)!.',
  }
}

export function factorial(rng = Math.random) {
  const n = randInt(rng, 3, 6)
  return {
    question: `¿Cuánto vale ${n}! (factorial de ${n})?`,
    ...makeOptions(fact(n), [n * n, n * (n - 1), fact(n - 1)]),
    hint: `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')}.`,
    reminder: 'n! = n × (n−1) × … × 1.',
  }
}

export function combinaciones(rng = Math.random) {
  const n = randInt(rng, 5, 10), r = randInt(rng, 2, 3)
  return {
    question: `¿De cuántas formas puedes elegir ${r} elementos de ${n} (el orden NO importa)?`,
    ...makeOptions(fact(n) / (fact(r) * fact(n - r)), [fact(n) / fact(n - r), n * r, fact(n)]),
    hint: `C(${n},${r}) = ${n}!/(${r}!·(${n}−${r})!).`,
    reminder: 'Combinación (orden no importa): C(n,r) = n!/(r!(n−r)!).',
  }
}

export function probEvento(rng = Math.random) {
  const total = [4, 5, 6, 8, 10][randInt(rng, 0, 4)]
  let fav = randInt(rng, 1, total - 1)
  if (total === 2 * fav) fav += 1 // evita que el complemento coincida
  return {
    question: `En una caja hay ${total} objetos y ${fav} son legendarios. Si sacas uno al azar, ¿cuál es la probabilidad de que sea legendario?`,
    ...makeOptions(`${fav}/${total}`, [`${total}/${fav}`, `${total - fav}/${total}`, `${fav}/${total - fav}`]),
    hint: `P = casos favorables / casos posibles = ${fav}/${total}.`,
    reminder: 'P(evento) = casos favorables / casos posibles.',
  }
}

export function probComplementario(rng = Math.random) {
  const total = [5, 10, 20, 4, 8][randInt(rng, 0, 4)]
  let fav = randInt(rng, 1, total - 1)
  if (total === 2 * fav) fav += 1
  return {
    question: `La probabilidad de ganar un premio es ${fav}/${total}. ¿Cuál es la probabilidad de NO ganar?`,
    ...makeOptions(`${total - fav}/${total}`, [`${fav}/${total}`, `${total}/${total - fav}`, `${total - fav}/${fav}`]),
    hint: `P(no) = 1 − ${fav}/${total} = ${total - fav}/${total}.`,
    reminder: 'P(complemento) = 1 − P(evento).',
  }
}

export function probIndependientes(rng = Math.random) {
  const opciones = [2, 3, 4, 5, 6]
  const d1 = opciones[randInt(rng, 0, 4)]
  let d2 = opciones[randInt(rng, 0, 4)]
  if (d1 * d2 === d1 + d2) d2 += 1 // evita 1/4 == 1/4 cuando d1=d2=2
  return {
    question: `Sacas un objeto raro con probabilidad 1/${d1} y, en una tirada independiente, otro con 1/${d2}. ¿Probabilidad de lograr ambos?`,
    ...makeOptions(`1/${d1 * d2}`, [`1/${d1 + d2}`, `2/${d1 * d2}`, `1/${Math.max(d1, d2)}`]),
    hint: `Independientes → multiplica: 1/${d1} × 1/${d2} = 1/${d1 * d2}.`,
    reminder: 'Eventos independientes: P(A y B) = P(A) × P(B).',
  }
}

export const mundo8 = {
  id: 'mundo8', slug: 'feria-datos', name: 'Feria de Datos',
  emoji: '🎡', color: 'bg-bloque6',
  description: 'Estadística, percentiles, conteo, permutaciones, combinaciones y probabilidad',
  levels: [
    {
      id: 'estadistica', title: 'Media, Mediana y Moda', icon: '📊',
      briefing: [
        { type: 'why', body: <>
          Ves las estadísticas de tu cuenta de Free Fire: kills promedio por partida, puntuación máxima frecuente.
          <br />
          Eso es estadística: entender tus datos para mejorar tu juego.
          <br />
          La media te da el promedio, la mediana el valor central, la moda lo más común.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Las <GlossaryTerm term="Medidas de tendencia central" definition="Valores que representan el centro de un conjunto de datos: media, mediana y moda">medidas de tendencia central</GlossaryTerm> te dicen dónde está el "centro" de un grupo de datos.
            Es como buscar el jugador "promedio" de un equipo de fútbol.
          </p>
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="glass rounded-xl p-3">
                <p className="text-lg font-bold text-pink-600">Media</p>
                <p>El <strong>promedio</strong>: suma todos los valores y divide entre cuántos son.</p>
                <MathTex expr={"\\bar{x} = \\frac{\\sum x_i}{n}"} />
                <p className="text-xs text-gray-500 mt-1">Como repartir todo en partes iguales</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-lg font-bold text-purple-600">Mediana</p>
                <p>El valor del <strong>medio</strong> cuando ordenas los datos.</p>
                <p className="text-xs text-gray-500 mt-1">Si hay cantidad par, es el promedio de los dos del centro</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-lg font-bold text-orange-600">Moda</p>
                <p>El valor que <strong>más se repite</strong>.</p>
                <p className="text-xs text-gray-500 mt-1">Como la canción más escuchada del playlist</p>
              </div>
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Calcular la mediana sin ordenar los datos primero — siempre ordena de menor a mayor.',
          'Confundir moda con media: la moda es el valor más frecuente, no el promedio.',
          'Olvidar que si hay cantidad par de datos, la mediana es el promedio de los dos del centro.',
        ] },
        { type: 'widget', widgetId: 'estadistica-calculadora', title: 'Calculadora interactiva' },
      ],
      reto: { pick: 3, factories: [media, mediana, moda] },
    },
    {
      id: 'percentiles', title: 'Percentiles y Cuartiles', icon: '📉',
      briefing: [
        { type: 'why', body: <>
          En tu ranking de Free Fire, estás en el top 10% de jugadores.
          <br />
          Eso significa que le ganas al 90% de los jugadores — estás en el percentil 90.
          <br />
          Los percentiles te dicen dónde te posicionas respecto a otros.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Los <GlossaryTerm term="Cuartiles" definition="Valores que dividen un conjunto de datos en 4 partes iguales: Q1 (25%), Q2 (50% = mediana), Q3 (75%)">cuartiles</GlossaryTerm> dividen tus datos en <strong>4 partes iguales</strong>.
            Los <strong>deciles</strong> en 10 partes y los <strong>percentiles</strong> en 100 partes.
            Es como cuando en un examen te dicen "estás en el percentil 80": quiere decir que le ganaste al 80% de los estudiantes.
          </p>
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <p className="font-semibold text-pink-800 mb-2">Relación entre ellos:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div className="glass rounded-md p-2 text-center">
                <strong>Cuartil 1 (Q1)</strong><br />= Percentil 25<br />= Decil 2.5
              </div>
              <div className="glass rounded-md p-2 text-center">
                <strong>Cuartil 2 (Q2)</strong><br />= Mediana<br />= Percentil 50
              </div>
              <div className="glass rounded-md p-2 text-center">
                <strong>Cuartil 3 (Q3)</strong><br />= Percentil 75<br />= Decil 7.5
              </div>
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          "Confundir percentil 80 con 'sacaste 80 puntos' — no, significa que le ganaste al 80%.",
          'Olvidar que Q2 (cuartil 2) es la mediana, no Q1.',
          'Pensar que hay 4 cuartiles — en realidad son 3 puntos que dividen en 4 partes.',
        ] },
        { type: 'widget', widgetId: 'boxplot', title: 'Diagrama de caja (Box Plot)' },
      ],
      reto: { pick: 3, factories: [
        staticQuestion({
          question: 'Si estás en el percentil 75 de una clase, ¿qué significa?',
          options: ['Sacaste 75 puntos', 'Le ganaste al 75% de la clase', 'Estás en el lugar 75', 'El 75% sacó más que tú'],
          correctAnswer: 1,
          hint: 'Percentil 75 = le ganaste al 75% de los estudiantes',
          reminder: 'Percentil P = le ganas al P% de los datos.',
        }),
        staticQuestion({
          question: '¿Qué cuartil es igual a la mediana?',
          options: ['Q1', 'Q2', 'Q3', 'Ninguno'],
          correctAnswer: 1,
          hint: 'Q2 = Percentil 50 = mediana (el valor del medio)',
          reminder: 'Q2 divide los datos en dos mitades iguales, igual que la mediana.',
        }),
        staticQuestion({
          question: 'En los datos ordenados: 2, 4, 6, 8, 10, ¿cuál es Q1 (percentil 25)?',
          options: ['2', '4', '6', '8'],
          correctAnswer: 0,
          hint: 'Q1 es el valor en el 25% de los datos. Con 5 datos, está cerca del primer valor.',
          reminder: 'Q1 = percentil 25, aproximadamente el valor que deja 1/4 de los datos debajo.',
        }),
      ] },
    },
    {
      id: 'conteo', title: 'Principio de Conteo', icon: '👕',
      briefing: [
        { type: 'content', body: <>
          <p>
            El <strong>principio fundamental de conteo</strong> dice que si tienes que tomar varias decisiones
            seguidas, el total de posibilidades es <strong>multiplicar</strong> las opciones de cada decisión.
          </p>
          <div className="text-center my-4">
            <MathTex expr={"\\text{Total} = n_1 \\times n_2 \\times n_3 \\times \\ldots"} display />
          </div>
        </> },
        { type: 'widget', widgetId: 'atuendos-ejemplo', title: 'Ejemplo: ¿Cuántos atuendos puedes formar?' },
      ],
      reto: { pick: 3, factories: [
        principioConteo, menuConteo,
        staticQuestion({
          question: '¿Cuándo usas el principio de conteo?',
          options: ['Cuando sumas cantidades', 'Cuando tienes decisiones independientes seguidas', 'Cuando restas valores', 'Cuando divides números'],
          correctAnswer: 1,
          hint: 'El principio de conteo aplica cuando tomas decisiones independientes una tras otra.',
          reminder: 'Principio de conteo: para decisiones seguidas, multiplica las opciones.',
        }),
      ] },
    },
    {
      id: 'permutaciones', title: 'Permutaciones', icon: '🔢',
      briefing: [
        { type: 'why', body: <>
          Creando un código PIN para tu celular: 4 dígitos donde cada orden es diferente.
          <br />
          1234 es diferente de 4321 — eso es permutación.
          <br />
          Las permutaciones cuentan todas las formas posibles de ordenar cosas cuando el orden importa.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Una <GlossaryTerm term="Permutación" definition="Número de formas de ordenar r elementos de un conjunto de n, cuando el orden SÍ importa: P(n,r) = n!/(n-r)!">permutación</GlossaryTerm> es cuando el <strong>orden SÍ importa</strong>.
            Piensa en los puestos de una carrera: no es lo mismo quedar 1°-2°-3° que 3°-2°-1°.
            ¡Son resultados diferentes!
          </p>
          <div className="text-center my-4">
            <MathTex expr={"P(n, r) = \\frac{n!}{(n-r)!}"} display />
          </div>
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <p className="text-sm">
              <strong>n</strong> = total de elementos disponibles<br />
              <strong>r</strong> = cuántos vas a elegir/ordenar<br />
              <strong>n!</strong> (factorial) = n × (n-1) × (n-2) × ... × 1
            </p>
            <p className="text-xs text-pink-600 mt-2">
              Ejemplo: ¿De cuántas formas puedes acomodar 3 libros de un estante de 5?
              P(5,3) = 5!/(5-3)! = 120/2 = 60 formas
            </p>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Usar permutaciones cuando el orden no importa — ahí se usa combinación.',
          'Olvidar que 0! = 1 (no es cero).',
          'Confundir n con r: n es el total disponible, r es cuántos vas a elegir.',
        ] },
        { type: 'widget', widgetId: 'permutaciones-calculadora', title: 'Calculadora de permutaciones' },
      ],
      reto: { pick: 3, factories: [
        permutaciones, factorial,
        staticQuestion({
          question: '¿Cuándo usas permutaciones en vez de combinaciones?',
          options: ['Cuando el orden no importa', 'Cuando el orden SÍ importa', 'Cuando hay menos elementos', 'Nunca'],
          correctAnswer: 1,
          hint: 'Permutaciones cuando el orden importa (pódium, contraseñas, PIN)',
          reminder: 'Permutación: orden importa. Combinación: orden no importa.',
        }),
      ] },
    },
    {
      id: 'combinaciones', title: 'Combinaciones', icon: '🎲',
      briefing: [
        { type: 'content', body: <>
          <p>
            Una <strong>combinación</strong> es cuando el <strong>orden NO importa</strong>.
            Si eliges 3 amigos para tu equipo, no importa en qué orden los elegiste — el equipo es el mismo.
          </p>
          <div className="text-center my-4">
            <MathTex expr={"C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}"} display />
          </div>
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <p className="font-semibold text-pink-800 mb-2">¿Cuándo uso cada una?</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass rounded-md p-3 border-l-4 border-purple-400">
                <p className="font-bold">Permutación</p>
                <p>Orden <strong>SÍ</strong> importa</p>
                <p className="text-xs text-gray-500 mt-1">Contraseñas, podio, PIN</p>
              </div>
              <div className="glass rounded-md p-3 border-l-4 border-pink-400">
                <p className="font-bold">Combinación</p>
                <p>Orden <strong>NO</strong> importa</p>
                <p className="text-xs text-gray-500 mt-1">Equipos, canciones, lotería</p>
              </div>
            </div>
          </div>
        </> },
        { type: 'widget', widgetId: 'combinaciones-calculadora', title: 'Calculadora de combinaciones' },
      ],
      reto: { pick: 3, factories: [
        combinaciones, factorial,
        staticQuestion({
          question: '¿Cuál es la diferencia entre permutación y combinación?',
          options: ['No hay diferencia', 'Permutación: orden importa. Combinación: orden no importa', 'Combinación usa división, permutación no', 'Permutación es solo para números pequeños'],
          correctAnswer: 1,
          hint: 'Permutación cuenta ordenes diferentes como distintos. Combinación los trata como iguales.',
          reminder: 'PIN (permutación): 1234 ≠ 4321. Equipo (combinación): {Ana, Beto} = {Beto, Ana}',
        }),
      ] },
    },
    {
      id: 'probabilidad', title: 'Probabilidad Básica', icon: '🎰',
      briefing: [
        { type: 'why', body: <>Cada vez que abres un cofre o tiras la ruleta de un gacha, hay una probabilidad detrás. Aprender a calcularla te dice qué tan raro es de verdad ese ítem legendario.</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2">La <GlossaryTerm term="Probabilidad" definition="Medida de qué tan posible es un evento, entre 0 (imposible) y 1 (seguro)">probabilidad</GlossaryTerm> de un evento es:</p>
          <MathTex expr={"P(\\text{evento}) = \\dfrac{\\text{casos favorables}}{\\text{casos posibles}}"} display />
          <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
            <li>El <strong>espacio muestral</strong> son todos los resultados posibles.</li>
            <li><strong>Complemento:</strong> <MathTex expr={"P(\\text{no } A) = 1 - P(A)"} />.</li>
            <li><strong>Independientes</strong> (una tirada no afecta a la otra): <MathTex expr={"P(A \\text{ y } B) = P(A)\\times P(B)"} />.</li>
          </ul>
        </> },
        { type: 'mistakes', items: [
          'Invertir la fracción: es favorables/posibles, no posibles/favorables.',
          'Sumar probabilidades de eventos independientes en vez de multiplicarlas.',
          'Olvidar que P siempre está entre 0 y 1 (nunca mayor que 1).',
        ] },
      ],
      reto: { pick: 3, factories: [
        probEvento, probComplementario, probIndependientes,
        staticQuestion({
          question: 'Si lanzas un dado de 6 caras, ¿cuál es la probabilidad de sacar un número par?',
          options: ['3/6', '2/6', '1/6', '6/3'],
          correctAnswer: 0,
          hint: 'Pares en un dado: 2, 4, 6 → 3 casos favorables de 6 posibles.',
          reminder: 'P = casos favorables / casos posibles.',
        }),
      ] },
    },
  ],
}
