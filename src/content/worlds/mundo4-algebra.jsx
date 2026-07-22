import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y] } return x }
const sg = (k) => (k >= 0 ? `+ ${k}` : `- ${-k}`)
const COPRIMOS = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [2, 7], [3, 7]]

export function mcdReparto(rng = Math.random) {
  const d = randInt(rng, 3, 9)
  const [m, n] = COPRIMOS[randInt(rng, 0, COPRIMOS.length - 1)]
  const a = d * m, b = d * n
  return {
    question: `Tienes ${a} diamantes y ${b} pociones para repartir en partes iguales entre tu squad. ¿Cuál es el máximo de jugadores que reciben la misma cantidad de ambos?`,
    ...makeOptions(d, [2 * d, d + 1, Math.min(m, n)]),
    hint: `Busca el MCD de ${a} y ${b}.`,
    reminder: 'MCD = el mayor número que divide exacto a ambos.',
  }
}

export function mcmEventos(rng = Math.random) {
  const g = randInt(rng, 2, 4)
  const m = randInt(rng, 1, 5)
  const n = m + 1 + randInt(rng, 0, 3) // n > m siempre
  const a = g * m, b = g * n
  const mcm = Math.abs(a * b) / gcd(a, b)
  return {
    question: `Un evento de Roblox se repite cada ${a} horas y otro cada ${b} horas. ¿Cada cuántas horas coinciden por primera vez?`,
    ...makeOptions(mcm, [a * b, gcd(a, b), a + b]),
    hint: `MCM(${a}, ${b}) = |${a}×${b}| / MCD(${a}, ${b}).`,
    reminder: 'MCM = múltiplo común más pequeño = |a×b| / MCD(a,b).',
  }
}

export function resolverLineal(rng = Math.random) {
  const a = randInt(rng, 3, 8)
  const c = randInt(rng, 1, a - 1) // a > c
  const x0 = randInt(rng, 1, 9)
  const b = randInt(rng, -9, 9)
  const e = (a - c) * x0 + b
  return {
    question: `Resuelve para x:  ${a}x ${sg(b)} = ${c}x ${sg(e)}`,
    ...makeOptions(`x = ${x0}`, [`x = ${x0 + 1}`, `x = ${x0 - 1}`, `x = ${-x0}`]),
    hint: `Agrupa las x: (${a} − ${c})x = ${e} − (${b}) → ${a - c}x = ${e - b}.`,
    reminder: 'Pasa las x a un lado y los números al otro; luego divide.',
  }
}

export const mundo4 = {
  id: 'mundo4', slug: 'castillo-algebra', name: 'Castillo del Álgebra',
  emoji: '🏰', color: 'bg-bloque2',
  description: 'MCD, MCM, fracciones algebraicas, operaciones y ecuaciones lineales',
  levels: [
    {
      id: 'mcd', title: 'Máximo Común Divisor', icon: '🔗',
      briefing: [
        { type: 'why', body: <>
          Tienes 48 diamantes y 36 potions para repartir en partes iguales entre tu squad de Free Fire.
          <br />
          ¿Cuál es el máximo de jugadores que pueden recibir la misma cantidad de ambos? ¡Eso es el MCD!
          <br />
          El MCD también sirve para simplificar fracciones y encontrar combinaciones perfectas en tu inventario.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            El <GlossaryTerm term="MCD (Máximo Común Divisor)" definition="El número más grande que divide exactamente a dos o más números">MCD</GlossaryTerm> es el número más grande que divide exactamente a dos o más números.
            Piénsalo así: si tú y tu amigo tienen chocolates y quieren repartirlos en grupos iguales
            lo más grandes posible, el MCD te dice cuántos poner en cada grupo.
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="font-semibold text-emerald-800 mb-2">Para polinomios, el proceso es similar:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Factoriza cada polinomio completamente</li>
              <li>Toma los factores <strong>comunes</strong> con el <strong>menor exponente</strong></li>
            </ol>
            <div className="mt-3 glass rounded-md p-3 text-sm">
              <p className="font-medium">Ejemplo con monomios:</p>
              <MathTex expr={"\\text{MCD}(18x^2yz,\\ 36xy^2z^3,\\ 54x^2y^3z)"} display />
              <p className="mt-1">Coeficientes: MCD(18, 36, 54) = 18</p>
              <p>Variables: <MathTex expr={"x^1 \\cdot y^1 \\cdot z^1"} /> (menor exponente de cada una)</p>
              <p className="font-bold text-emerald-700 mt-1"><MathTex expr={"\\text{MCD} = 18xyz"} /></p>
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Pensar que MCD siempre es el número más pequeño — no, es el divisor más grande que les queda exacto a ambos.',
          'Para polinomios: confundir y tomar el MAYOR exponente en vez del menor. El MCD toma el menor.',
          'Olvidar que MCD se calcula con números positivos; con negativos se toma el valor absoluto.',
        ] },
        { type: 'widget', widgetId: 'mcd-calculadora', title: 'Calculadora de MCD: repartiendo loot del squad' },
      ],
      reto: { pick: 3, factories: [
        mcdReparto,
        staticQuestion({ question: "¿Cuál es el MCD de 18x³y² y 12x²y⁴?", options: ["6x³y⁴", "6x²y²", "36x²y²", "6xy"], correctAnswer: 1, hint: "MCD de coeficientes: 6. Variables: x² (menor exponente), y² (menor exponente)", reminder: "Para polinomios, toma coeficientes MCD y variables con menor exponente." }),
        staticQuestion({ question: "Si MCD(a,b) = 12 y a = 36, ¿qué valores puede tener b?", options: ["Cualquier múltiplo de 12", "Solo 24", "24 o 48", "Imposible saber"], correctAnswer: 2, hint: "b debe ser divisible por 12, y 36 también debe ser divisible por el MCD (12). Prueba 24: MCD(36,24)=12 ✓", reminder: "Ambos números deben ser divisibles por el MCD." }),
      ] },
    },
    {
      id: 'mcm', title: 'Mínimo Común Múltiplo', icon: '🔄',
      briefing: [
        { type: 'why', body: <>
          Un evento especial en Roblox se repite cada 12 horas y otro cada 18 horas. ¿Cada cuándo coinciden?
          <br />
          <strong>MCM(12, 18) = 36 horas</strong>.
          <br />
          El MCM también te sirve para sumar fracciones: necesitas el denominador común más pequeño.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            El <GlossaryTerm term="MCM (Mínimo Común Múltiplo)" definition="El número más pequeño que es múltiplo de dos o más números a la vez">MCM</GlossaryTerm> es el número más pequeño que es múltiplo de dos o más números a la vez.
            Imagina que un bus pasa cada 12 minutos y otro cada 18 minutos. Los dos coinciden cada
            <strong> MCM(12,18) = 36 minutos</strong>.
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="font-semibold text-emerald-800 mb-2">Para polinomios:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Factoriza cada polinomio completamente</li>
              <li>Toma <strong>todos</strong> los factores con el <strong>mayor exponente</strong></li>
            </ol>
            <div className="mt-2 text-sm text-emerald-600">
              💡 Truco: MCD usa el menor exponente, MCM usa el mayor. ¡Son opuestos!
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Confundir MCM con MCD: MCM es el múltiplo más pequeño, MCD es el divisor más grande.',
          'Para polinomios: tomar el MENOR exponente en vez del mayor. El MCM toma el mayor.',
          'Olvidar que MCM siempre es mayor o igual que los números originales.',
        ] },
        { type: 'widget', widgetId: 'mcm-calculadora', title: 'Calculadora de MCM: sincronizando eventos' },
      ],
      reto: { pick: 3, factories: [
        mcmEventos,
        staticQuestion({ question: "Para sumar 1/4 + 1/6, ¿qué denominador común necesitas?", options: ["10", "12", "24", "2"], correctAnswer: 1, hint: "MCM(4, 6) = ? 4=2², 6=2×3. MCM = 2²×3 = 12", reminder: "El MCM te da el denominador común más pequeño." }),
        staticQuestion({ question: "¿Cuál es el MCM de 8x²y y 12xy³?", options: ["4xy", "24x²y³", "96x²y³", "24xy"], correctAnswer: 1, hint: "MCM coeficientes: MCM(8,12)=24. Variables: x² (mayor), y³ (mayor)", reminder: "Para MCM de polinomios: mayor exponente de cada variable." }),
      ] },
    },
    {
      id: 'fracciones-algebraicas', title: 'Fracciones Algebraicas', icon: '➗',
      briefing: [
        { type: 'why', body: <>
          Tu K/D ratio en Free Fire es kills/deaths — eso es una fracción algebraica cuando usas variables.
          <br />
          Simplificar fracciones algebraicas = entender ratios de manera más simple.
          <br />
          Esto te ayuda a comparar estadísticas de jugadores, calcular porcentajes de victoria, y más.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Una <GlossaryTerm term="Fracción algebraica" definition="Cociente de dos expresiones algebraicas, donde el denominador no es cero">fracción algebraica</GlossaryTerm> es igual que una fracción normal, pero con letras (variables)
            en vez de solo números. Es como una fracción con "ingredientes secretos".
          </p>
          <div className="text-center my-4">
            <MathTex expr={"\\frac{x^2 - 4}{x^2 - 4x + 4} = \\frac{(x-2)(x+2)}{(x-2)^2} = \\frac{x+2}{x-2}"} display />
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="font-semibold text-emerald-800 mb-2">Para simplificar fracciones algebraicas:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li><strong>Factoriza</strong> el numerador y el denominador</li>
              <li><strong>Cancela</strong> los factores comunes (los que aparecen arriba y abajo)</li>
              <li><strong>Escribe</strong> lo que queda</li>
            </ol>
            <p className="mt-2 text-xs text-emerald-600">⚠️ Solo puedes cancelar factores (multiplicaciones), ¡NUNCA sumas o restas!</p>
          </div>
          <div className="mt-4 glass rounded-xl p-4 border">
            <p className="font-semibold mb-2">Factorizaciones que más vas a usar:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Factor común</p>
                <MathTex expr={"ax + ay = a(x + y)"} />
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Diferencia de cuadrados</p>
                <MathTex expr={"a^2 - b^2 = (a+b)(a-b)"} />
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Trinomio cuadrado perfecto</p>
                <MathTex expr={"a^2 + 2ab + b^2 = (a+b)^2"} />
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Trinomio de la forma x² + bx + c</p>
                <MathTex expr={"x^2 + bx + c = (x+p)(x+q)"} />
              </div>
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Cancelar TÉRMINOS en vez de FACTORES: (x+2)/(x+3) NO se simplifica a 2/3.',
          'Olvidar que a²-b² = (a+b)(a-b), no (a-b)².',
          'Distribuir la raíz: √(a+b) ≠ √a + √b (esto es radicación, pero ocurre en fracciones también).',
        ] },
      ],
      reto: { pick: 3, factories: [
        staticQuestion({ question: "¿Cuál es la fracción simplificada de (x² - 4)/(x² - 4x + 4)?", options: ["(x+2)/(x-2)", "(x-2)/(x+2)", "(x+2)/(x+2)", "1"], correctAnswer: 0, hint: "x²-4 = (x+2)(x-2). x²-4x+4 = (x-2)². Cancela (x-2)", reminder: "Diferencia de cuadrados: a²-b² = (a+b)(a-b). Trinomio cuadrado: a²-2ab+b² = (a-b)²." }),
        staticQuestion({ question: "En la fracción (2x+6)/(4x+8), ¿qué puedes factorizar arriba y abajo?", options: ["Nada", "Factor común 2 arriba y 4 abajo", "Factor común 2 en ambos", "2(x+3)/4(x+2)"], correctAnswer: 2, hint: "2x+6 = 2(x+3). 4x+8 = 4(x+2) = 2·2(x+2). El 2 es común.", reminder: "Busca el MCD de los coeficientes como factor común." }),
        staticQuestion({ question: "¿Cuál es el resultado de (x²-9)/(x+3)?", options: ["x-3", "x+3", "(x-3)/(x+3)", "x²-3"], correctAnswer: 0, hint: "x²-9 = (x+3)(x-3). Divide por (x+3).", reminder: "Diferencia de cuadrados: x²-9 = x²-3² = (x+3)(x-3)." }),
      ] },
    },
    {
      id: 'operaciones', title: 'Operaciones con Fracciones', icon: '🧮',
      briefing: [
        { type: 'why', body: <>
          Cuando calculas tu ratio de victorias (wins/games), estás trabajando con fracciones.
          <br />
          Sumar ratios de jugadores, calcular promedios de estadísticas — todo usa operaciones con fracciones.
          <br />
          Las fracciones algebraicas funcionan igual que las numéricas, solo que con letras.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Las operaciones con fracciones algebraicas funcionan <strong>igual que con fracciones numéricas</strong>:
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 space-y-2">
            <div className="glass rounded-md p-2 text-sm">
              <strong>Suma/Resta:</strong> Necesitas denominador común (MCM), luego sumas/restas los numeradores
            </div>
            <div className="glass rounded-md p-2 text-sm">
              <strong>Multiplicación:</strong> <MathTex expr={"\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}"} /> (numerador × numerador, denominador × denominador)
            </div>
            <div className="glass rounded-md p-2 text-sm">
              <strong>División:</strong> <MathTex expr={"\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}"} /> (multiplicas por el inverso, "flip" la segunda)
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Para sumar fracciones, intentar sumar numeradores y denominadores directamente.',
          "Para dividir, olvidar 'dar vuelta' la segunda fracción (multiplicar por el inverso).",
          'No simplificar al final: siempre busca factores comunes para reducir la fracción.',
        ] },
        { type: 'widget', widgetId: 'fracciones-ejemplo', title: 'Ejemplo paso a paso — Suma de fracciones' },
      ],
      reto: { pick: 3, factories: [
        staticQuestion({ question: "¿Cuál es el resultado de 1/x + 1/(x+1)?", options: ["2/(2x+1)", "(2x+1)/(x²+x)", "2/(x²+x)", "2x+1"], correctAnswer: 1, hint: "MCM(x, x+1) = x(x+1). Luego: (x+1 + x)/[x(x+1)]", reminder: "Para sumar fracciones, necesitas el MCM de los denominadores." }),
        staticQuestion({ question: "Para multiplicar (3/x) × (x²/9), ¿qué haces primero?", options: ["Sumar numeradores y denominadores", "Multiplicar numeradores y denominadores", "Encontrar MCM", "Dividir cruzado"], correctAnswer: 1, hint: "Multiplicación: numerador × numerador, denominador × denominador. Luego simplifica.", reminder: "(a/b) × (c/d) = (ac)/(bd)" }),
        staticQuestion({ question: "Para dividir (2/x) ÷ (4/x²), ¿qué haces?", options: ["Multiplicar por la inversa: (2/x) × (x²/4)", "Multiplicar directo", "Sumar fracciones", "Nada, no se puede"], correctAnswer: 0, hint: "Dividir por una fracción = multiplicar por su inversa (dar vuelta la segunda).", reminder: "(a/b) ÷ (c/d) = (a/b) × (d/c)" }),
      ] },
    },
    {
      id: 'ecuaciones-lineales', title: 'Ecuaciones Lineales', icon: '⚖️',
      briefing: [
        { type: 'why', body: <>
          Un juego te da 100 monedas base + 50 por nivel completado. Necesitas 400 para comprar una skin.
          <br />
          ¿Cuántos niveles debes completar? Eso es resolver: 100 + 50x = 400.
          <br />
          Las ecuaciones lineales aparecen en economías de juegos, progresos de misiones, y más.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Una <GlossaryTerm term="Ecuación lineal" definition="Ecuación donde la variable x aparece con exponente 1, de la forma ax + b = c">ecuación lineal</GlossaryTerm> es como una balanza: lo que está a la izquierda del "="
            pesa lo mismo que lo de la derecha. Tu trabajo es encontrar qué valor de x mantiene la balanza equilibrada.
          </p>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <p className="font-semibold text-violet-800 mb-2">Reglas de oro para resolver ecuaciones:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Lo que <strong>suma</strong> de un lado, pasa <strong>restando</strong> al otro</li>
              <li>Lo que <strong>multiplica</strong> de un lado, pasa <strong>dividiendo</strong> al otro</li>
              <li>Junta todas las x de un lado y los números del otro</li>
              <li>¡Siempre verifica sustituyendo tu respuesta!</li>
            </ol>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Cambiar de lado pero olvidar cambiar el signo (lo que suma pasa restando, etc.).',
          'Distribuir mal: 2(x + 3) ≠ 2x + 3, es 2x + 6.',
          'No verificar la respuesta: siempre sustituye tu x en la ecuación original.',
        ] },
        { type: 'content', body: <>
          <div className="glass rounded-xl p-4 border">
            <p className="font-semibold mb-2">Ejemplo resuelto paso a paso:</p>
            <div className="space-y-2 text-sm">
              <div><MathTex expr={"3x + 7 = 2x - 5"} display /><p className="text-center text-violet-600">Problema</p></div>
              <div><MathTex expr={"3x - 2x = -5 - 7"} display /><p className="text-center text-violet-600">Paso 1: Pasar las x a un lado</p></div>
              <div><MathTex expr={"x = -12"} display /><p className="text-center text-violet-600">Paso 2: Simplificar</p></div>
              <div><MathTex expr={"3(-12) + 7 = -36 + 7 = -29 \\\\[4pt] 2(-12) - 5 = -24 - 5 = -29 \\quad \\checkmark"} display /><p className="text-center text-violet-600">Verificación</p></div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 border mt-4">
            <p className="font-semibold mb-2">Problema tipo examen:</p>
            <p className="text-sm text-gray-700">
              Ana y Luis trabajan en un proyecto. Ana ha completado el <strong>triple</strong> de páginas que Luis.
              Juntos han completado <strong>56 páginas</strong>. ¿Cuántas hizo cada uno?
            </p>
            <div className="mt-3 bg-violet-50 rounded p-3 text-sm">
              <p>Sea x = páginas de Luis → Ana = 3x</p>
              <p><MathTex expr={"x + 3x = 56 \\implies 4x = 56 \\implies x = 14"} /></p>
              <p className="font-bold text-violet-700 mt-1">Luis: 14 páginas, Ana: 42 páginas</p>
            </div>
          </div>
        </> },
      ],
      reto: { pick: 3, factories: [
        resolverLineal,
        staticQuestion({ question: "Si 2(x + 4) = 3x - 2, ¿cuánto vale x?", options: ["x = 6", "x = 10", "x = 8", "x = -10"], correctAnswer: 1, hint: "Expande: 2x + 8 = 3x - 2 → 8 + 2 = 3x - 2x → 10 = x", reminder: "Primero distribuye, luego agrupa términos semejantes." }),
        staticQuestion({ question: "Después de resolver una ecuación, ¿qué debes hacer?", options: ["Nada, ya terminaste", "Verificar sustituyendo tu respuesta en la ecuación original", "Multiplicar por 2", "Dividir entre 0"], correctAnswer: 1, hint: "Siempre verifica: reemplaza x con tu respuesta y comprueba que ambos lados sean iguales.", reminder: "La verificación te asegura que no cometiste errores de signo." }),
      ] },
    },
  ],
}
