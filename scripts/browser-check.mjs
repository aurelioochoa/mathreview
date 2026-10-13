import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseURL = process.env.MATHQUEST_URL ?? 'http://localhost:4174'
const screenshotDir = process.env.MATHQUEST_SCREENSHOTS ?? '/tmp/mathquest-browser'
await mkdir(screenshotDir, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const errors = []
function observe(page) {
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`${page.url()}: ${message.text()}`)
  })
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })
}
async function noOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Desbordamiento horizontal: ${page.url()}`)
}
async function settled(page) {
  await page.waitForFunction(() => {
    const content = document.querySelector('main > div')
    return !content || getComputedStyle(content).opacity === '1'
  })
}
async function briefing(page) {
  await page.getByRole('button', { name: /Siguiente →|¡Al reto!/ }).first().waitFor()
  for (let step = 0; step < 20; step++) {
    const next = page.getByRole('button', { name: 'Siguiente →', exact: true })
    if (!(await next.count())) return
    await next.click()
    await page.getByRole('status').filter({ hasText: 'Cargando actividad' }).waitFor({ state: 'hidden' })
  }
  throw new Error('El briefing no terminó')
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1024, height: 700 } })
  // El renderer de CI puede usar WebGL por software. Darle margen para
  // compilar sombras sin convertir la prueba en un test de velocidad de GPU.
  desktop.setDefaultTimeout(60_000)
  await desktop.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8 }))
  const map = await desktop.newPage()
  observe(map)
  const requests = []
  map.on('request', request => requests.push(request.url()))
  await map.goto(baseURL)
  assert.equal(await map.title(), 'Math Quest')
  await map.waitForFunction(() => document.querySelectorAll('button[aria-label^="Ver "]').length === 8)
  assert.equal(await map.getByRole('region', { name: 'Mundo seleccionado' }).count(), 1)
  const markers = await map.locator('button[aria-label^="Ver "]').evaluateAll(buttons => buttons.map(button => {
    const r = button.getBoundingClientRect()
    return { title: button.title, x: r.x, y: r.y, right: r.right, bottom: r.bottom }
  }))
  for (let i = 0; i < markers.length; i++) {
    for (let j = i + 1; j < markers.length; j++) {
      const a = markers[i], b = markers[j]
      assert.ok(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y, `Marcadores solapados: ${a.title}, ${b.title}`)
    }
  }
  assert.ok(!requests.some(url => /Bloque\d-|EstadisticaCalculadora-|SistemasGrafica-|build-/.test(url)), 'Gráficas o estudios descargados en el mapa')
  await map.getByRole('button', { name: 'Ver Reino de las Fracciones', exact: true }).hover()
  const panel = map.getByRole('region', { name: 'Mundo seleccionado' })
  await panel.getByRole('heading', { name: /Reino de las Fracciones/ }).waitFor()
  await noOverflow(map)
  await settled(map)
  await map.screenshot({ path: `${screenshotDir}/desktop-map.png` })
  await panel.getByRole('link', { name: /Ver cómo desbloquear/ }).click()
  await map.getByRole('heading', { name: /está cerrado/ }).waitFor()
  await map.getByRole('link', { name: /Probar el portal/ }).click()
  await map.getByRole('button', { name: /Empezar la prueba/ }).click()
  assert.equal(await map.locator('main button.w-full').count(), 4)
  console.log('Desktop: mapa sin solapamientos, detalles, puerta y portal verificados.')
  await desktop.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await mobile.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8 }))
  const touch = await mobile.newPage()
  observe(touch)
  await touch.goto(baseURL)
  await touch.getByRole('link', { name: /^Isla Numérica:/ }).waitFor()
  await settled(touch)
  await touch.screenshot({ path: `${screenshotDir}/mobile-map.png` })
  assert.equal(await touch.locator('main ul > li').count(), 8)
  assert.equal(await touch.locator('canvas').count(), 0)
  const outOfFrame = await touch.locator('main ul > li').evaluateAll(cards => cards.filter(card => {
    const r = card.getBoundingClientRect()
    return r.x < 0 || r.right > innerWidth
  }).map(card => card.textContent))
  assert.deepEqual(outOfFrame, [], 'Todos los mundos deben poder elegirse en móvil')
  await noOverflow(touch)
  await touch.setViewportSize({ width: 320, height: 740 })
  await noOverflow(touch)
  await touch.setViewportSize({ width: 390, height: 844 })
  await touch.getByRole('link', { name: /^Isla Numérica:/ }).tap()
  await touch.getByRole('heading', { name: /Isla Numérica/ }).waitFor()
  await touch.getByRole('link', { name: /Nivel 1: Operaciones/ }).tap()
  await touch.getByRole('heading', { name: /Operaciones básicas/ }).waitFor()
  await briefing(touch)
  await touch.getByRole('button', { name: /¡Al reto!/ }).tap()
  assert.equal(await touch.locator('main button.w-full').count(), 4)
  await noOverflow(touch)
  console.log('Móvil: los ocho mundos son accesibles, sin desbordamiento, y el reto responde al tacto.')
  await mobile.close()

  const quiet = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const game = await quiet.newPage()
  observe(game)
  await game.goto(`${baseURL}/mundo/isla-numerica/nivel/orden`)
  await briefing(game)
  await game.locator('input[type="number"]').first().fill('15')
  await game.getByText('15 > 11', { exact: true }).waitFor()
  await game.getByRole('button', { name: /¡Al reto!/ }).click()
  const options = game.locator('main button.w-full')
  for (let q = 0; q < 3; q++) {
    // Cada pregunta ordena números enteros: resuelve desde lo que ve el jugador.
    const question = await game.locator('p.font-medium').innerText()
    const values = question.match(/\d+/g)?.map(Number) ?? []
    const answer = /signo/.test(question)
      ? `${values[0]} ${values[0] < values[1] ? '<' : '>'} ${values[1]}`
      : String(/pequeña/.test(question) ? Math.min(...values) : Math.max(...values))
    const labels = (await options.allTextContents()).map(text => text.replace(/^[A-D]\)\s*/, '').trim())
    const correct = labels.indexOf(answer)
    assert.ok(correct >= 0, `Respuesta ausente: ${question} → ${answer}`)
    await options.nth(correct).click()
    await game.getByRole('button', { name: /Continuar/ }).click()
  }
  await game.getByRole('heading', { name: '¡Nivel superado!' }).waitFor()
  await game.reload()
  const save = await game.evaluate(() => JSON.parse(localStorage.getItem('mathquest-save-v1')))
  assert.ok(save.completedLevels.includes('mundo1/orden'))
  console.log('Nivel: actividad diferida, reto y guardado tras recargar verificados.')

  for (const slug of ['volcan-potencias', 'castillo-algebra', 'laberinto-sistemas', 'estacion-funciones', 'montanas-geometria', 'feria-datos']) {
    await game.goto(`${baseURL}/mundo/${slug}/estudio`)
    await game.getByRole('link', { name: /Volver al mundo/ }).waitFor()
    await game.getByText('Cargando estudio…').waitFor({ state: 'hidden' })
    if (slug === 'estacion-funciones') {
      await game.locator('.MafsView').first().waitFor()
      const graphBox = game.getByRole('heading', { name: /Juega con la pendiente y la ordenada/i }).locator('..')
      const range = graphBox.locator('input[type="range"]').first()
      await range.fill('3')
      await game.getByText('Pendiente (m) = 3', { exact: true }).waitFor()
      await game.locator('.MafsView').first().scrollIntoViewIfNeeded()
      await settled(game)
      await game.screenshot({ path: `${screenshotDir}/study-functions.png` })
    }
    if (slug === 'feria-datos') {
      await game.locator('.recharts-wrapper').waitFor()
      await game.locator('input[type="text"]').first().fill('2, 4, 6')
      await game.getByText('4.00', { exact: true }).first().waitFor()
      await game.locator('.recharts-wrapper').scrollIntoViewIfNeeded()
      await settled(game)
      await game.screenshot({ path: `${screenshotDir}/study-data.png` })
    }
    await noOverflow(game)
  }
  console.log('Estudio: las seis páginas y las gráficas interactivas funcionan.')
  await quiet.close()

  const denied = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  await denied.addInitScript(() => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      Storage.prototype[method] = () => { throw new DOMException('Storage disabled', 'SecurityError') }
    }
  })
  const noStorage = await denied.newPage()
  observe(noStorage)
  await noStorage.goto(baseURL)
  await noStorage.getByRole('link', { name: /^Isla Numérica:/ }).waitFor()
  await noStorage.getByRole('link', { name: 'Perfil', exact: true }).click()
  await noStorage.getByRole('heading', { name: 'Partida', exact: true }).waitFor()
  await noOverflow(noStorage)
  console.log('Storage bloqueado: mapa y perfil funcionan sin pantalla blanca.')
  await denied.close()
  assert.deepEqual(errors, [], 'Errores del navegador')
  console.log(`BROWSER VERIFIED. Capturas: ${screenshotDir}`)
} finally {
  await browser.close()
}
