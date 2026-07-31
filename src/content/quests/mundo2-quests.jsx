import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

// Quest 1 — la pizzería del reino (fracciones sobre cantidades)
const PEDIDOS = [[1, 2], [1, 4], [3, 4]]

function pedidoDeTrozos(rng = Math.random) {
  const trozos = 4 * randInt(rng, 1, 3) // 4, 8 o 12: divisible entre 2 y entre 4
  const [num, den] = PEDIDOS[randInt(rng, 0, PEDIDOS.length - 1)]
  const cuantos = (num * trozos) / den
  return {
    question: `Un cliente pide ${num}/${den} de una pizza cortada en ${trozos} trozos. ¿Cuántos trozos hay que servirle?`,
    ...makeOptions(cuantos, [trozos - cuantos, den, trozos]),
    hint: `Divide los ${trozos} trozos entre ${den} y coge ${num} de esas partes.`,
    reminder: 'Para hallar una fracción de una cantidad: divide entre el de abajo y multiplica por el de arriba.',
  }
}

function dosPedidos(rng = Math.random) {
  const den = randInt(rng, 5, 10)
  const a = randInt(rng, 1, den - 2)
  const b = randInt(rng, 1, den - a)
  return {
    question: `El aprendiz sirve ${a}/${den} de tarta a una mesa y ${b}/${den} a otra. ¿Cuánta tarta ha servido en total?`,
    ...makeOptions(`${a + b}/${den}`, [`${a + b}/${den * 2}`, `${a + b + 1}/${den}`, `${a + b - 1}/${den}`]),
    hint: `Los trozos son iguales: suma solo los de arriba, ${a} + ${b}.`,
    reminder: 'Mismo denominador: se suman los numeradores y el denominador se queda igual.',
  }
}

// Quest 2 — el mercado de rebajas (porcentajes y decimales)
// Múltiplo de 20 → todos los descuentos salen en monedas enteras. Sin el 50 en
// "lo que pagas", donde coincidiría con "lo que te ahorras".
const DESCUENTOS = [10, 20, 25, 50]
const DESCUENTOS_PAGO = [10, 20, 25]
const precioRedondo = (rng) => 20 * randInt(rng, 1, 5)

function loQuePagas(rng = Math.random) {
  const pct = DESCUENTOS_PAGO[randInt(rng, 0, DESCUENTOS_PAGO.length - 1)]
  const precio = precioRedondo(rng)
  const ahorro = (precio * pct) / 100
  return {
    question: `En el puesto del Mercader, una capa cuesta ${precio} monedas y hoy tiene un ${pct}% de rebaja. ¿Cuántas monedas pagas?`,
    ...makeOptions(precio - ahorro, [ahorro, precio, ahorro + pct]),
    hint: `La rebaja es ${precio} × ${pct} ÷ 100 = ${ahorro} monedas. Réstala del precio.`,
    reminder: 'El descuento es lo que NO pagas: precio − descuento.',
  }
}

function cuantoAhorras(rng = Math.random) {
  const pct = DESCUENTOS[randInt(rng, 0, DESCUENTOS.length - 1)]
  const precio = precioRedondo(rng)
  const ahorro = (precio * pct) / 100
  return {
    question: `Un escudo de ${precio} monedas está rebajado un ${pct}%. ¿Cuántas monedas te ahorras?`,
    ...makeOptions(ahorro, [precio - ahorro, pct, ahorro * 2]),
    hint: `Calcula el ${pct}% de ${precio}: ${precio} × ${pct} ÷ 100.`,
    reminder: 'El X% de una cantidad = cantidad × X ÷ 100.',
  }
}

export const mundo2Quests = [
  {
    id: 'reino-quest-1',
    title: 'La pizzería del reino',
    emoji: '🍕',
    npc: 'Chef aprendiz',
    intro: 'El aprendiz del Chef se ha quedado solo en la pizzería y los pedidos llegan en fracciones. ¡Ayúdale a servirlos bien antes de que se enfríe todo!',
    outro: '¡Todos los pedidos servidos! El aprendiz te invita a la pizza que sobró.',
    questions: [pedidoDeTrozos, dosPedidos, staticQuestion({
      question: 'Un pedido pide 2/4 de pizza y otro pide 1/2. ¿Son la misma cantidad?',
      options: ['Sí, 2/4 y 1/2 son lo mismo', 'No, 2/4 es el doble', 'No, 1/2 es el doble', 'Depende del tamaño de la pizza'],
      correctAnswer: 0,
      hint: 'Divide arriba y abajo de 2/4 entre 2.',
      reminder: 'Fracciones equivalentes: valen lo mismo aunque estén escritas distinto.',
    })],
  },
  {
    id: 'reino-quest-2',
    title: 'El mercado de rebajas',
    emoji: '🏪',
    npc: 'Mercader de la plaza',
    intro: 'Es día de rebajas en la plaza del reino y el Mercader se hace un lío con los carteles. Ayúdale a calcular los precios antes de que le reclamen.',
    outro: '¡Cuentas cuadradas! El Mercader te deja elegir un objeto del puesto con su descuento.',
    questions: [loQuePagas, cuantoAhorras, staticQuestion({
      question: 'El Mercader dice que 0.25 de sus monedas son de plata. ¿Qué fracción es eso?',
      options: ['1/4', '1/2', '2/5', '1/25'],
      correctAnswer: 0,
      hint: '0.25 es la cuarta parte de la unidad.',
      reminder: '0.25 = 25/100 = 1/4. Y también es el 25%.',
    })],
  },
]
