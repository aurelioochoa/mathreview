import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseURL = process.env.MATHQUEST_URL ?? 'http://localhost:4174'
const screenshotDir = process.env.MATHQUEST_SCREENSHOTS ?? '/tmp/mathquest-browser'
await mkdir(screenshotDir, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const errors = []
const cases = [
  ['isla-numerica', 'operaciones', 'Construye grupos iguales', async lab => {
    await lab.getByRole('slider', { name: /^Grupos:/ }).fill('4')
    await lab.getByRole('slider', { name: /^Fichas por grupo:/ }).fill('6')
    await lab.getByRole('img', { name: '4 filas de 6 fichas, 24 en total' }).waitFor()
  }],
  ['reino-fracciones', 'operar-fracciones', 'El mismo entero, otros trozos', async lab => {
    await lab.getByRole('slider', { name: /^Cuartos:/ }).fill('2')
    await lab.getByRole('slider', { name: /^Sextos:/ }).fill('2')
    await lab.getByRole('button', { name: 'Dividir ambas barras en doceavos' }).click()
    assert.match(await lab.innerText(), /10\/12/)
  }],
  ['volcan-potencias', 'potenciacion', 'Una potencia crece por pasos', async lab => {
    await lab.getByRole('slider', { name: /^Base:/ }).fill('3')
    await lab.getByRole('slider', { name: /^Exponente:/ }).fill('2')
    await lab.getByRole('img', { name: /Crecimiento de 3 elevado a 2: 1, 3, 9/ }).waitFor()
  }],
  ['castillo-algebra', 'ecuaciones-lineales', 'Mantén la igualdad en la balanza', async lab => {
    await lab.getByRole('slider', { name: /^Valor de x:/ }).fill('4')
    await lab.getByRole('button', { name: 'Restar 3 en ambos lados' }).click()
    await lab.getByRole('button', { name: 'Dividir ambos lados entre 2' }).click()
    await lab.getByRole('img', { name: /izquierda 4, derecha 4, equilibrada/ }).waitFor()
  }],
  ['laberinto-sistemas', 'intro-sistemas', 'Encuentra el punto que cumple dos pistas', async lab => {
    await lab.getByRole('slider', { name: /^Coordenada x:/ }).fill('2')
    await lab.getByRole('slider', { name: /^Coordenada y:/ }).fill('4')
    await lab.getByRole('img', { name: /Punto \(2, 4\).*Primera ecuación: cumple.*Segunda: cumple/ }).waitFor()
  }],
  ['estacion-funciones', 'funcion-lineal', 'Una máquina, una tabla y una recta', async lab => {
    await lab.getByRole('slider', { name: /^Pendiente de la máquina:/ }).fill('0')
    assert.ok(!(await lab.getByRole('status', { name: 'Resultado de la misión' }).innerText()).startsWith('¡Lo lograste!'), 'Misión constante premiada sin observar otra entrada')
    await lab.getByRole('slider', { name: /^Entrada x:/ }).fill('2')
    await lab.getByRole('img', { name: /Recta y = 0x.*punto \(2, 1\)/ }).waitFor()
    assert.match(await lab.getByRole('status', { name: 'Resultado de la misión' }).innerText(), /recorrido es \{1\}/)
  }],
  ['montanas-geometria', 'pitagoras', 'Pitágoras suma áreas, no lados', async lab => {
    await lab.getByRole('slider', { name: /^Cateto a:/ }).fill('3')
    await lab.getByRole('slider', { name: /^Cateto b:/ }).fill('4')
    await lab.getByRole('img', { name: /catetos 3 y 4; hipotenusa 5.00/ }).waitFor()
    await lab.getByRole('img', { name: /área a² 9, área b² 16, área c² 25/ }).waitFor()
  }],
  ['feria-datos', 'probabilidad', 'El mapa de todos los resultados', async lab => {
    await lab.getByRole('button', { name: /^Dado A 1, dado B 6,/ }).click()
    assert.match(await lab.innerText(), /P\(suma 7\) = 6\/36/)
  }],
]

async function verifyTheme(theme) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' })
  await context.addInitScript(theme => localStorage.setItem('mathquest-tema', theme), theme)
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
  for (const [slug, level, title, interact] of cases) {
    await page.goto(`${baseURL}/mundo/${slug}/nivel/${level}`)
    await page.getByRole('button', { name: /Siguiente →/ }).waitFor()
    const lab = page.getByRole('region', { name: title, exact: true })
    for (let step = 0; step < 20 && !(await lab.count()); step++) {
      // El título del contenedor aparece antes de que React.lazy resuelva.
      // Esperar el laboratorio aquí evita saltarlo mientras se descarga.
      if (await page.getByRole('heading', { name: new RegExp(title, 'i') }).count()) {
        await lab.waitFor()
        break
      }
      const previousStep = await page.locator('main span.self-center').innerText()
      await page.getByRole('button', { name: 'Siguiente →', exact: true }).click()
      await page.waitForFunction(previous => document.querySelector('main span.self-center')?.textContent !== previous, previousStep)
      await page.getByRole('status').filter({ hasText: 'Cargando actividad' }).waitFor({ state: 'hidden' })
    }
    await lab.waitFor()
    assert.ok(!(await lab.getByRole('status', { name: 'Resultado de la misión' }).innerText()).startsWith('¡Lo lograste!'), `${title}: la misión empieza resuelta`)
    await interact(lab)
    assert.match(await lab.getByRole('status', { name: 'Resultado de la misión' }).innerText(), /^¡Lo lograste!/)
    await lab.locator('summary').click()
    await lab.getByText('Prueba la idea:', { exact: true }).waitFor()
    const source = lab.getByRole('link', { name: /^Fuente: MacTutor/ })
    assert.match(await source.getAttribute('href'), /^https:\/\/mathshistory\.st-andrews\.ac\.uk\//)
    assert.ok(await source.isVisible(), `${title}: fuente histórica oculta`)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${title}: desbordamiento en móvil`)
    await lab.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${screenshotDir}/concept-${slug}-${theme}.png` })
    console.log(`Concepto e historia verificados (${theme}): ${title}`)
  }
  // La probabilidad también responde al cambiar la condición, sin conservar
  // una misión aprobada que ya no corresponde a la selección actual.
  const probability = page.getByRole('region', { name: cases.at(-1)[2], exact: true })
  await probability.getByRole('slider', { name: /^Suma objetivo:/ }).fill('2')
  assert.match(await probability.innerText(), /P\(suma 2\) = 1\/36/)
  assert.ok(!(await probability.getByRole('status', { name: 'Resultado de la misión' }).innerText()).startsWith('¡Lo lograste!'))
  await context.close()
}

try {
  await verifyTheme('claro')
  await verifyTheme('oscuro')
  assert.deepEqual(errors, [], 'Errores en los conceptos educativos')
  console.log(`COURSES VERIFIED: ${cases.length} laboratorios, misiones, visuales e historia en móvil, en ambos temas. Capturas: ${screenshotDir}`)
} finally {
  await browser.close()
}
