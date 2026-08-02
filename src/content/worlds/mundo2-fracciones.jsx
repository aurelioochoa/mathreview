import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'
import { SEASON, pickSeason } from '../season'

// Mundo 2 — tono 8-11 años (spec de Fase 4 §3).
//
// CUIDADO al añadir fábricas aquí: las opciones son strings ("3/4"), y
// makeOptions solo sabe sintetizar vecinos cuando el correcto es numérico. Con
// fracciones, los tres distractores tienen que salir ya distintos por
// construcción o acabarían en el relleno de emergencia "3/4 (1)".

// ——— Nivel 1: qué es una fracción ———
export function leerFraccion(rng = Math.random) {
  const snack = pickSeason(rng, SEASON.snacks)
  const den = randInt(rng, 4, 10)
  const num = randInt(rng, 1, den - 1) // propia: num < den, así num/den != den/num
  return {
    question: `Partes una tarta en ${den} trozos iguales y te comes ${num}. ¿Qué fracción de tarta te comiste?`,
    ...makeOptions(`${num}/${den}`, [`${den}/${num}`, `${num}/${den + 1}`, `${num + 1}/${den}`]),
    hint: `Arriba va lo que te comes (${num}) y abajo en cuántos trozos partiste (${den}).`,
    reminder: `Numerador arriba (lo que tomas), denominador abajo (el total de trozos). Y sí, también vale para ${snack}.`,
  }
}

export function fraccionEquivalente(rng = Math.random) {
  const den = randInt(rng, 3, 6)
  const num = randInt(rng, 1, den - 1)
  const k = randInt(rng, 2, 4)
  return {
    question: `¿Cuál de estas fracciones vale lo mismo que ${num}/${den}?`,
    ...makeOptions(`${num * k}/${den * k}`, [`${num + k}/${den + k}`, `${num * k}/${den}`, `${num}/${den * k}`]),
    hint: `Multiplica arriba Y abajo por el mismo número: ${num}×${k} y ${den}×${k}.`,
    reminder: 'Dos fracciones son equivalentes si sale una de la otra multiplicando (o dividiendo) arriba y abajo por lo mismo.',
  }
}

export function cualEsMayor(rng = Math.random) {
  const den = randInt(rng, 4, 9)
  const a = randInt(rng, 1, den - 1)
  let b = randInt(rng, 1, den - 1)
  if (b === a) b = a === 1 ? a + 1 : a - 1
  const mayor = Math.max(a, b), menor = Math.min(a, b)
  return {
    question: `Dos pizzas iguales están partidas en ${den} trozos. Ana se come ${a}/${den} y Beto ${b}/${den}. ¿Qué fracción es mayor?`,
    ...makeOptions(`${mayor}/${den}`, [`${menor}/${den}`, 'Son iguales', 'No se puede saber']),
    hint: 'Si los trozos son del mismo tamaño, gana quien se come más trozos.',
    reminder: 'Con el mismo denominador, la fracción mayor es la del numerador mayor.',
  }
}

// ——— Nivel 2: sumar y restar fracciones ———
export function sumaMismoDenominador(rng = Math.random) {
  const den = randInt(rng, 5, 10)
  const a = randInt(rng, 1, den - 2)
  const b = randInt(rng, 1, den - a) // a + b <= den: nunca pasa de una unidad
  return {
    question: `Te comes ${a}/${den} de una pizza y luego ${b}/${den} más. ¿Cuánta pizza te comiste en total?`,
    ...makeOptions(`${a + b}/${den}`, [`${a + b}/${den * 2}`, `${a + b + 1}/${den}`, `${a + b - 1}/${den}`]),
    hint: `Los trozos son del mismo tamaño: suma solo los de arriba, ${a} + ${b}.`,
    reminder: 'Con el mismo denominador se suman los numeradores. El denominador NO se suma.',
  }
}

export function restaMismoDenominador(rng = Math.random) {
  const den = randInt(rng, 5, 10)
  const a = randInt(rng, 3, den - 1) // propia: "quedaban 5/5 de tarta" suena raro
  const b = randInt(rng, 1, a - 2)
  return {
    question: `Quedaban ${a}/${den} de tarta y tu hermano se comió ${b}/${den}. ¿Cuánta tarta queda?`,
    ...makeOptions(`${a - b}/${den}`, [`${a - b}/${den * 2}`, `${a + b}/${den}`, `${a - b + 1}/${den}`]),
    hint: `Resta solo los de arriba: ${a} − ${b}.`,
    reminder: 'Con el mismo denominador se restan los numeradores y el denominador se queda igual.',
  }
}

// ——— Nivel 3: decimales ———
// Fracciones con decimal exacto y corto, que es lo que toca a esta edad.
const EQUIVALENCIAS = [
  ['1/2', '0.5'], ['1/4', '0.25'], ['3/4', '0.75'], ['1/5', '0.2'], ['2/5', '0.4'],
  ['3/5', '0.6'], ['4/5', '0.8'], ['1/10', '0.1'], ['3/10', '0.3'], ['7/10', '0.7'],
]

function otrosDe(rng, indice, columna) {
  const restantes = EQUIVALENCIAS.filter((_, i) => i !== indice).map(e => e[columna])
  const otros = []
  while (otros.length < 3) otros.push(...restantes.splice(randInt(rng, 0, restantes.length - 1), 1))
  return otros
}

export function fraccionADecimal(rng = Math.random) {
  const i = randInt(rng, 0, EQUIVALENCIAS.length - 1)
  const [frac, dec] = EQUIVALENCIAS[i]
  return {
    question: `¿Cómo se escribe ${frac} en número decimal?`,
    ...makeOptions(dec, otrosDe(rng, i, 1)),
    hint: `Divide el de arriba entre el de abajo: ${frac.replace('/', ' ÷ ')}.`,
    reminder: 'Una fracción es una división: 1/2 es 1 ÷ 2 = 0.5.',
  }
}

export function decimalAFraccion(rng = Math.random) {
  const i = randInt(rng, 0, EQUIVALENCIAS.length - 1)
  const [frac, dec] = EQUIVALENCIAS[i]
  return {
    question: `¿Qué fracción vale lo mismo que ${dec}?`,
    ...makeOptions(frac, otrosDe(rng, i, 0)),
    hint: `Piensa qué trozo de la unidad es ${dec}: ¿la mitad, un cuarto, una décima…?`,
    reminder: 'Los decimales y las fracciones son dos formas de escribir lo mismo.',
  }
}

// ——— Nivel 4: porcentajes ———
const PORCENTAJES = [10, 20, 25, 50]
// Sin el 50: ahí "lo que pagas" y "lo que te ahorras" coinciden, y el distractor
// más natural dejaría de serlo.
const PORCENTAJES_PAGO = [10, 20, 25]
// Múltiplo de 20 → 10%, 20%, 25% y 50% salen todos enteros. Con múltiplos de 4
// el 10% daba cosas como "9.6 cromos".
const cantidadRedonda = (rng) => 20 * randInt(rng, 1, 5)

export function porcentajeDe(rng = Math.random) {
  const pct = PORCENTAJES[randInt(rng, 0, PORCENTAJES.length - 1)]
  const total = cantidadRedonda(rng)
  const parte = (total * pct) / 100
  return {
    question: `En una clase hay ${total} cromos y regalan el ${pct}%. ¿Cuántos cromos regalan?`,
    ...makeOptions(parte, [total - parte, parte * 2, pct]),
    hint: `Multiplica por el porcentaje y divide entre 100: ${total} × ${pct} ÷ 100.`,
    reminder: 'El X% de una cantidad = cantidad × X ÷ 100.',
  }
}

export function precioConDescuento(rng = Math.random) {
  const pct = PORCENTAJES_PAGO[randInt(rng, 0, PORCENTAJES_PAGO.length - 1)]
  const precio = cantidadRedonda(rng)
  const ahorro = (precio * pct) / 100
  const pagas = precio - ahorro
  return {
    question: `Un juego cuesta ${precio} monedas y está rebajado un ${pct}%. ¿Cuánto pagas al final?`,
    ...makeOptions(pagas, [ahorro, precio, ahorro + pct]),
    hint: `Primero calcula el descuento (${precio} × ${pct} ÷ 100 = ${ahorro}) y réstalo del precio.`,
    reminder: 'Con descuento pagas el precio MENOS el ahorro, no el ahorro.',
  }
}

export const mundo2 = {
  id: 'mundo2', slug: 'reino-fracciones', name: 'Reino de las Fracciones',
  emoji: '🍕', color: 'bg-world-reino',
  description: 'Fracciones, decimales y porcentajes',
  boss: { name: 'El Chef Mitades', emoji: '👨‍🍳', intro: 'El Chef parte todo por la mitad y reta a quien no sepa juntar los trozos otra vez. ¡Su cocina es la última prueba del reino!' },
  levels: [
    {
      id: 'fracciones', title: '¿Qué es una fracción?', icon: '🍕',
      briefing: [
        { type: 'why', body: <>
          Media pizza, un cuarto de hora, tres cuartos de la batería.
          <br />
          Las fracciones aparecen todo el rato cuando algo se parte en trozos.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Una <GlossaryTerm term="Fracción" definition="Forma de escribir una parte de algo: numerador arriba, denominador abajo">fracción</GlossaryTerm> se
            escribe con dos números, uno encima del otro:
          </p>
          <div className="glass rounded-xl p-4 text-sm">
            <p className="text-center text-2xl font-bold text-amber-700 mb-3">3/4</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>El de <strong>abajo</strong> (denominador, el 4) dice <strong>en cuántos trozos iguales</strong> partiste la pizza.</li>
              <li>El de <strong>arriba</strong> (numerador, el 3) dice <strong>cuántos trozos coges</strong>.</li>
            </ul>
            <p className="mt-3">Cuanto más grande el número de abajo, <strong>más pequeño</strong> es cada trozo. Partir una pizza en 8 da trozos más chicos que partirla en 4.</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Dos fracciones distintas pueden valer lo mismo: 1/2 y 2/4 son la misma cantidad de pizza, solo que contada con trozos de otro tamaño.
            Se llaman <strong>equivalentes</strong>, y salen de multiplicar arriba y abajo por el mismo número.
          </p>
        </> },
        { type: 'mistakes', items: [
          'Poner los números al revés: en 3/4 te comes 3 trozos de 4, no 4 de 3.',
          'Pensar que un denominador más grande significa más cantidad. Es al revés: más trozos, más pequeños.',
          'Al buscar equivalentes, multiplicar solo arriba. Hay que hacerlo arriba y abajo.',
        ] },
        { type: 'widget', widgetId: 'pizza-fracciones', title: 'Dibuja tu fracción en una pizza' },
      ],
      reto: { pick: 3, factories: [leerFraccion, fraccionEquivalente, cualEsMayor] },
    },
    {
      id: 'operar-fracciones', title: 'Sumar y restar fracciones', icon: '➕',
      briefing: [
        { type: 'why', body: <>
          Te comes un trozo, luego otro. ¿Cuánta pizza llevas?
          <br />
          Para sumarlo hay una condición: los trozos tienen que ser del mismo tamaño.
        </> },
        { type: 'content', body: <>
          <div className="glass rounded-xl p-4 text-sm">
            <p className="font-semibold mb-2">Con el mismo denominador es facilísimo:</p>
            <p className="text-center text-lg font-bold text-emerald-700">2/8 + 3/8 = 5/8</p>
            <p className="mt-2">Sumas solo los de arriba. El de abajo <strong>no se toca</strong>: los trozos siguen siendo octavos.</p>
            <p className="mt-3 text-rose-700 font-semibold">⚠️ 2/8 + 3/8 NO es 5/16. Si sumaras también abajo, los trozos cambiarían de tamaño solos.</p>
          </div>
          <div className="glass rounded-xl p-4 text-sm mt-3">
            <p className="font-semibold mb-2">¿Y si los denominadores son distintos?</p>
            <p>Primero hay que igualar los trozos. Por ejemplo, 1/2 + 1/4:</p>
            <p className="mt-1">1/2 es lo mismo que 2/4 (multiplicando arriba y abajo por 2).</p>
            <p>Entonces: 2/4 + 1/4 = <strong className="text-emerald-700">3/4</strong>.</p>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Sumar también los denominadores. Solo se suman los numeradores.',
          'Sumar fracciones con denominador distinto sin igualarlas antes.',
          'Al restar, olvidar que el resultado no puede ser negativo si quitas menos de lo que tenías.',
        ] },
        { type: 'widget', widgetId: 'pizza-fracciones', title: 'Comprueba tus sumas en la pizza' },
      ],
      reto: { pick: 3, factories: [
        sumaMismoDenominador,
        restaMismoDenominador,
        staticQuestion({
          question: '¿Cuánto es 1/2 + 1/4?',
          options: ['3/4', '2/6', '1/6', '2/4'],
          correctAnswer: 0,
          hint: 'Cambia 1/2 por 2/4, que es lo mismo. Luego 2/4 + 1/4.',
          reminder: 'Si los denominadores no son iguales, primero se igualan.',
        }),
      ] },
    },
    {
      id: 'decimales', title: 'Decimales', icon: '🔟',
      briefing: [
        { type: 'why', body: <>
          Los precios, las notas y los tiempos de carrera se escriben con coma.
          <br />
          Un decimal es otra forma de escribir una fracción, y pasar de una a otra es un superpoder.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            La barra de una fracción significa <strong>dividir</strong>. Por eso 1/2 es 1 ÷ 2 = <strong>0.5</strong>.
          </p>
          <div className="glass rounded-xl p-4 text-sm">
            <p className="font-semibold mb-2">Las que más se repiten (vale la pena sabérselas):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-surface/70 rounded-lg p-2">1/2 = 0.5</div>
              <div className="bg-surface/70 rounded-lg p-2">1/4 = 0.25</div>
              <div className="bg-surface/70 rounded-lg p-2">3/4 = 0.75</div>
              <div className="bg-surface/70 rounded-lg p-2">1/10 = 0.1</div>
            </div>
            <p className="mt-3">Después de la coma, la primera cifra son las <strong>décimas</strong> y la segunda las <strong>centésimas</strong>.</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Para comparar decimales, mira cifra a cifra desde la izquierda: 0.5 es mayor que 0.45, aunque 45 parezca un número más grande que 5.
          </p>
        </> },
        { type: 'mistakes', items: [
          'Creer que 0.45 es mayor que 0.5 porque tiene más cifras. Compara desde la izquierda: 4 décimas es menos que 5 décimas.',
          'Leer 0.5 como "cero coma cinco partes". Es medio, la mitad.',
        ] },
      ],
      reto: { pick: 3, factories: [
        fraccionADecimal,
        decimalAFraccion,
        staticQuestion({
          question: '¿Qué número es mayor: 0.5 o 0.45?',
          options: ['0.5', '0.45', 'Son iguales', 'No se pueden comparar'],
          correctAnswer: 0,
          hint: 'Compara las décimas primero: 5 décimas contra 4 décimas.',
          reminder: 'Se compara cifra a cifra desde la izquierda, no por cuántas cifras tenga.',
        }),
      ] },
    },
    {
      id: 'porcentajes', title: 'Porcentajes', icon: '💯',
      briefing: [
        { type: 'why', body: <>
          "50% de descuento", "batería al 20%", "el 30% de la clase".
          <br />
          Un porcentaje es solo una fracción con el 100 debajo, y está en todas partes.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            <GlossaryTerm term="Porcentaje" definition="Fracción cuyo denominador es 100; el símbolo % significa 'de cada 100'">Por ciento</GlossaryTerm> significa
            "de cada 100". Así que 25% es lo mismo que 25/100, que es lo mismo que 1/4.
          </p>
          <div className="glass rounded-xl p-4 text-sm">
            <p className="font-semibold mb-2">Para calcular el % de una cantidad:</p>
            <p className="text-center text-lg font-bold text-rose-700 my-2">cantidad × porcentaje ÷ 100</p>
            <p>El 25% de 60 = 60 × 25 ÷ 100 = <strong>15</strong>.</p>
            <p className="mt-3 font-semibold">Atajos que conviene memorizar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>50%</strong> = la mitad</li>
              <li><strong>25%</strong> = la cuarta parte</li>
              <li><strong>10%</strong> = quitar un cero (el 10% de 80 es 8)</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            🏷️ Ojo con los descuentos: si algo cuesta 80 y tiene 25% de descuento, te ahorras 20 y <strong>pagas 60</strong>. El descuento es lo que NO pagas.
          </p>
        </> },
        { type: 'mistakes', items: [
          'Dar como respuesta el descuento en vez de lo que se paga al final.',
          'Olvidar dividir entre 100 y contestar cantidad × porcentaje.',
          'Pensar que el 100% es el doble. El 100% es todo, tal cual.',
        ] },
        { type: 'widget', widgetId: 'porcentaje-barra', title: 'Prueba porcentajes y descuentos' },
      ],
      reto: { pick: 3, factories: [
        porcentajeDe,
        precioConDescuento,
        staticQuestion({
          question: 'El 50% de una cantidad es siempre…',
          options: ['La mitad', 'El doble', 'La cuarta parte', 'Todo'],
          correctAnswer: 0,
          hint: '50 de cada 100 es la mitad de 100.',
          reminder: '50% = 1/2 = la mitad. 100% = todo.',
        }),
      ] },
    },
  ],
}
