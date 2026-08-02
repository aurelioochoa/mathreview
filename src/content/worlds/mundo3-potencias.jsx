import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt } from '../../engine/generators'

// ——— Fábricas parametrizadas (ejemplo del mecanismo; el resto son estáticas) ———
export function potenciaDanio() {
  const base = randInt(Math.random, 2, 5)
  const exp = randInt(Math.random, 2, 3)
  const res = Math.pow(base, exp)
  const candidates = [res + base, base * exp, Math.pow(base, exp + 1), res + 1, res * 2]
  const options = [res]
  for (const c of candidates) {
    if (options.length >= 4) break
    if (!options.includes(c)) options.push(c)
  }
  return {
    question: `En tu juego favorito, un potenciador multiplica el daño por ${base} elevado a ${exp}. ¿Cuál es el multiplicador total?`,
    options: options.map(String),
    correctAnswer: 0,
    hint: `${base}^${exp} = ${base} multiplicado por sí mismo ${exp} veces`,
    reminder: 'Potencia = multiplicación repetida. aⁿ = a multiplicado n veces.',
  }
}

export function raizCuadradaMinecraft() {
  const lado = randInt(Math.random, 5, 15)
  const area = lado * lado
  const opts = [String(lado), String(lado + 2), String(Math.round(area / 2)), String(area)]
  return {
    question: `Tu base cuadrada en Minecraft mide ${area} bloques². ¿Cuántos bloques mide cada lado?`,
    options: opts,
    correctAnswer: 0,
    hint: `√${area} = ? Busca el número que multiplicado por sí mismo da ${area}`,
    reminder: 'La raíz cuadrada es la inversa del cuadrado: si x² = a, entonces √a = x',
  }
}

export const mundo3 = {
  id: 'mundo3',
  slug: 'volcan-potencias',
  name: 'Volcán de las Potencias',
  emoji: '🌋',
  color: 'bg-bloque1',
  description: 'Aproximación, potencias, notación científica y radicales',
  boss: { name: 'Ígneo, Señor del Magma', emoji: '🐲', intro: 'El volcán ruge: Ígneo pondrá a prueba todo lo que aprendiste sobre potencias y raíces.' },
  levels: [
    {
      id: 'aproximacion',
      title: 'Aproximación y Error',
      icon: '🎯',
      briefing: [
        { type: 'why', body: <>Cuando Spotify dice que una canción tiene "1.2 millones de plays", eso es una aproximación. Esta misión te enseña a redondear y truncar.</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2"><strong>Aproximar</strong> es simplificar un número usando uno más fácil que esté "cerca" del real — como decir "me costó como $7" cuando fueron $6.99.</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><GlossaryTerm term="Truncar" definition="Eliminar los decimales sobrantes sin modificar el último dígito conservado">Truncar</GlossaryTerm>: cortas los decimales que no quieres.</li>
            <li><GlossaryTerm term="Redondear" definition="Aproximar al valor más cercano revisando el siguiente dígito. Si es 5 o más, subes; si es menor, dejas igual.">Redondear</GlossaryTerm>: miras el siguiente dígito; ≥5 sube, &lt;5 queda.</li>
          </ul>
          <p className="mt-2"><strong>Error absoluto</strong> = <MathTex expr={"|\\text{real} - \\text{aproximado}|"} /> · <strong>Error relativo</strong> = <MathTex expr={"\\frac{\\text{error absoluto}}{|\\text{real}|}"} /></p>
        </> },
        { type: 'mistakes', items: [
          'Confundir truncar con redondear: truncar simplemente corta, redondear revisa el siguiente dígito.',
          'Pensar que error absoluto y relativo son lo mismo.',
          'Olvidar que un error de $1 no pesa igual en una compra de $2 que en una de $500.',
        ] },
        { type: 'widget', widgetId: 'aproximacion-explorer', title: 'Prueba la aproximación' },
      ],
      reto: {
        pick: 3,
        factories: [
          staticQuestion({ question: 'Spotify dice que tu canción favorita tiene 2,450,890 reproducciones. Si la aproximas a 2 decimales usando millones, ¿qué valor es correcto?', options: ['2.4 millones', '2.45 millones', '2.5 millones', '2.0 millones'], correctAnswer: 1, hint: 'Mira el tercer decimal después de convertir a millones', reminder: 'Para redondear a 2 decimales, revisas el tercero. Si es 5 o más, subes el anterior.' }),
          staticQuestion({ question: 'Tienes 899 Robux. Si truncas a centenas (no redondeas), ¿cuántos tienes?', options: ['900 Robux', '800 Robux', '899 Robux', '1000 Robux'], correctAnswer: 1, hint: 'Truncar es cortar sin redondear. Solo eliminas lo sobrante.', reminder: 'Truncar = cortar los dígitos sobrantes sin modificar el anterior.' }),
          staticQuestion({ question: 'Tu K/D ratio es 2.447. El juego lo muestra como 2.4. ¿Qué operación hizo?', options: ['Redondeó a 1 decimal', 'Truncó a 1 decimal', 'Redondeó a enteros', 'Truncó a enteros'], correctAnswer: 1, hint: 'Si fuera redondeo sería 2.5, porque 4≥5? No, 4<5', reminder: 'Truncar a 1 decimal de 2.447 da 2.4. Redondear daría 2.4 también... aquí ambos coinciden, pero truncar siempre corta.' }),
        ],
      },
    },
    {
      id: 'potenciacion',
      title: 'Potenciación',
      icon: '⚡',
      briefing: [
        { type: 'why', body: <>Cuando tu personaje sube de nivel, su daño se potencia. Las leyes de exponentes te permiten manejar cantidades enormes de Robux, diamantes o seguidores.</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2">Una <GlossaryTerm term="Potenciación" definition="Multiplicar un número por sí mismo varias veces. aⁿ = a × a × ... × a (n veces)">potencia</GlossaryTerm> es una multiplicación repetida:</p>
          <MathTex expr={"3^4 = 3 \\times 3 \\times 3 \\times 3 = 81"} display />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
            <div className="bg-surface rounded p-2"><MathTex expr={"a^m \\cdot a^n = a^{m+n}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"\\frac{a^m}{a^n} = a^{m-n}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"(a^m)^n = a^{m \\cdot n}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"a^0 = 1 \\text{ (siempre!)}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"a^{-n} = \\frac{1}{a^n}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"(a \\cdot b)^n = a^n \\cdot b^n"} /></div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Pensar que exponente negativo da resultado negativo: 2⁻³ = 1/8, NO -8.',
          'Confundir a⁰ con 0: cualquier número (excepto 0) a la 0 es 1.',
          'Olvidar que (aᵐ)ⁿ = a^(m×n), no a^(m+n).',
        ] },
        { type: 'widget', widgetId: 'potencia-calculadora', title: 'Calculadora de potencias' },
      ],
      reto: {
        pick: 3,
        factories: [
          potenciaDanio,   // ← parametrizada
          staticQuestion({ question: 'En Free Fire, tu arma hace 50 de daño base. Con un potenciador de nivel 3 (×2³), ¿cuánto daño haces ahora?', options: ['100', '150', '200', '400'], correctAnswer: 3, hint: '2³ = 2 × 2 × 2 = 8. Luego 50 × 8', reminder: 'Potencia = multiplicación repetida. aⁿ = a multiplicado n veces.' }),
          staticQuestion({ question: '¿Cuánto vale 5⁰?', options: ['0', '1', '5', 'No se puede'], correctAnswer: 1, hint: 'Cualquier número (excepto 0) elevado a la 0 es 1', reminder: 'a⁰ = 1 siempre, para cualquier a ≠ 0.' }),
          staticQuestion({ question: '¿Cuál es el resultado de 2⁻³?', options: ['-8', '-6', '1/8', '0.125'], correctAnswer: 2, hint: 'Exponente negativo = 1 dividido por la potencia positiva', reminder: 'a⁻ⁿ = 1/aⁿ. El exponente negativo NO hace negativo el resultado.' }),
        ],
      },
    },
    {
      id: 'notacion',
      title: 'Notación Científica',
      icon: '🔬',
      briefing: [
        { type: 'why', body: <>Bad Bunny tiene 45,000,000 de oyentes en Spotify. ¿No sería más fácil escribir 4.5 × 10⁷? La notación científica nos ayuda a manejar números enormes (o diminutos) sin perdernos en los ceros.</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2">La <GlossaryTerm term="Notación científica" definition="Forma de escribir números muy grandes o pequeños como a × 10ⁿ, donde 1 ≤ |a| < 10">notación científica</GlossaryTerm> es un atajo para escribir números como la distancia de la Tierra al Sol o el tamaño de un átomo.</p>
          <div className="text-center my-2">
            <MathTex expr={"\\text{Número} = a \\times 10^n \\quad \\text{donde } 1 \\leq |a| < 10"} display />
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm">
            <div className="bg-surface rounded p-2">Oyentes de Bad Bunny: <MathTex expr={"4.5 \\times 10^7"} /> = 45,000,000</div>
            <div className="bg-surface rounded p-2">Usuarios TikTok Ecuador: <MathTex expr={"1.56 \\times 10^7"} /> = 15,600,000</div>
            <div className="bg-surface rounded p-2">Diamantes mínimos en Free Fire: <MathTex expr={"1 \\times 10^1"} /> = 10</div>
          </div>
          <p className="text-xs text-amber-600 mt-2">💡 Exponente positivo = número grande | Exponente negativo = número pequeñito</p>
        </> },
        { type: 'mistakes', items: [
          'La mantisa fuera de rango: 45 × 10⁶ está mal, debe ser 4.5 × 10⁷.',
          'Confundir exponente positivo con negativo: positivo = grande, negativo = pequeño.',
          'Mover la coma al lado contrario: exponente positivo → coma a la izquierda; negativo → derecha.',
        ] },
        { type: 'widget', widgetId: 'notacion-conversor', title: 'Convertidor: prueba con números de verdad' },
      ],
      reto: {
        pick: 3,
        factories: [
          // ⬇️ copiadas literalmente de NotacionCientificaSection (Bloque1.jsx)
          staticQuestion({ question: 'Bad Bunny tiene 45,000,000 de oyentes mensuales. ¿Cómo se escribe en notación científica?', options: ['45 × 10⁶', '4.5 × 10⁷', '4.5 × 10⁶', '0.45 × 10⁸'], correctAnswer: 1, hint: 'La mantisa debe estar entre 1 y 10. 4.5 está bien, 45 no.', reminder: 'En notación científica, la mantisa a cumple: 1 ≤ |a| < 10' }),
          staticQuestion({ question: 'Un video tiene 8.5 × 10⁶ views. ¿Cuántas visualizaciones reales tiene?', options: ['850,000', '8,500,000', '85,000,000', '850,000,000'], correctAnswer: 1, hint: '10⁶ = 1,000,000 (un millón). Multiplica 8.5 × 1,000,000', reminder: 'Exponente positivo = número grande. 10⁶ = 1 millón.' }),
          staticQuestion({ question: '¿Cuál es el exponente cuando escribes 0.0032 en notación científica?', options: ['3', '-3', '4', '-4'], correctAnswer: 1, hint: '0.0032 = 3.2 × 0.001 = 3.2 × 10⁻³', reminder: 'Exponente negativo = número pequeño. Mueves la coma a la derecha.' }),
        ],
      },
    },
    {
      id: 'radicacion',
      title: 'Radicación',
      icon: '√',
      briefing: [
        { type: 'why', body: <>Si tu terreno cuadrado en Minecraft mide 144 bloques², ¿cuánto mide cada lado? √144 = 12. Las raíces son esenciales para entender áreas, volúmenes y hasta la distancia más corta entre dos puntos (Pitágoras).</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2">La <GlossaryTerm term="Radicación" definition="Operación inversa de la potenciación. Si bⁿ = a, entonces ⁿ√a = b">radicación</GlossaryTerm> es la operación inversa de la potenciación. Si potenciar es "¿cuánto da 3 elevado a 2?" (9), la raíz pregunta "¿qué número elevado a 2 da 9?" (3).</p>
          <div className="text-center my-2">
            <MathTex expr={"\\sqrt[n]{a} = b \\quad \\Leftrightarrow \\quad b^n = a"} display />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-surface rounded p-2"><MathTex expr={"\\sqrt[n]{a \\cdot b} = \\sqrt[n]{a} \\cdot \\sqrt[n]{b}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"\\sqrt[n]{\\frac{a}{b}} = \\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"\\sqrt[n]{a^m} = a^{m/n}"} /></div>
            <div className="bg-surface rounded p-2"><MathTex expr={"\\sqrt[m]{\\sqrt[n]{a}} = \\sqrt[m \\cdot n]{a}"} /></div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Distribuir la raíz sobre sumas: √(9+16) = √25 = 5, NO √9 + √16 = 7.',
          'Olvidar que raíz cuadrada de negativo NO existe en reales: √(-4) no es real.',
          'Confundir índice con radicando: ³√27 es diferente de √27 (que sería ²√27).',
        ] },
        { type: 'widget', widgetId: 'raiz-calculadora', title: 'Calculadora: áreas de bases en Minecraft' },
      ],
      reto: {
        pick: 3,
        factories: [
          raizCuadradaMinecraft,   // ← parametrizada
          // ⬇️ copiadas literalmente de RadicacionSection (Bloque1.jsx)
          staticQuestion({ question: 'Tu base cuadrada en Minecraft mide 144 bloques². ¿Cuántos bloques mide cada lado?', options: ['12', '72', '24', '144'], correctAnswer: 0, hint: '√144 = ? Busca el número que multiplicado por sí mismo da 144', reminder: 'La raíz cuadrada es la inversa del cuadrado: si x² = a, entonces √a = x' }),
          staticQuestion({ question: 'Si un cubo tiene volumen de 27 unidades³, ¿cuánto mide su arista?', options: ['3', '9', '6', '27'], correctAnswer: 0, hint: '³√27 = ? Busca el número que multiplicado 3 veces da 27', reminder: '³√a = b significa que b³ = a' }),
          staticQuestion({ question: '¿Cuál es el valor de √(9 + 16)?', options: ['5', '7', '25', '3 + 4 = 7'], correctAnswer: 0, hint: '√(25) = 5. ¡No es √9 + √16!', reminder: '√(a+b) ≠ √a + √b. La raíz NO se distribuye sobre sumas.' }),
        ],
      },
    },
  ],
}
