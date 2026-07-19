import { execSync, spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const OUTPUT = path.join(ROOT, 'output')

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/bloque1', name: 'bloque1' },
  { path: '/bloque2', name: 'bloque2' },
  { path: '/bloque3', name: 'bloque3' },
  { path: '/bloque4', name: 'bloque4' },
  { path: '/bloque5', name: 'bloque5' },
  { path: '/bloque6', name: 'bloque6' },
]

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url)
      return
    } catch {
      await new Promise(r => setTimeout(r, 300))
    }
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`)
}

async function main() {
  if (!existsSync(DIST)) {
    console.log('Building project...')
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' })
  }

  mkdirSync(OUTPUT, { recursive: true })

  console.log('Starting static server...')
  const server = spawn('npx', ['serve', '-s', DIST, '-l', String(PORT)], {
    cwd: ROOT,
    stdio: 'pipe',
    detached: true,
  })

  try {
    await waitForServer(BASE_URL)
    console.log(`Server running on ${BASE_URL}`)

    const puppeteer = await import('puppeteer-core')
    const browser = await puppeteer.default.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })

    const pdfBuffers = []

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route.path}`
      console.log(`Rendering ${url} ...`)

      const page = await browser.newPage()
      await page.setViewport({ width: 1200, height: 800 })
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

      // Wait for KaTeX and content to render
      await page.waitForSelector('.katex, [data-testid]', { timeout: 5000 }).catch(() => {})
      await new Promise(r => setTimeout(r, 1500))

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' },
      })

      const singlePath = path.join(OUTPUT, `${route.name}.pdf`)
      writeFileSync(singlePath, pdf)
      console.log(`  -> ${singlePath}`)

      pdfBuffers.push(pdf)
      await page.close()
    }

    await browser.close()

    // Merge all PDFs into one
    console.log('Merging PDFs...')
    const { PDFDocument } = await import('pdf-lib')
    const merged = await PDFDocument.create()

    for (const buf of pdfBuffers) {
      const doc = await PDFDocument.load(buf)
      const pages = await merged.copyPages(doc, doc.getPageIndices())
      for (const p of pages) {
        merged.addPage(p)
      }
    }

    const mergedBytes = await merged.save()
    const outputPath = path.join(OUTPUT, 'repaso-matematicas.pdf')
    writeFileSync(outputPath, mergedBytes)
    console.log(`\nPDF generado: ${outputPath}`)
  } finally {
    try { process.kill(-server.pid, 'SIGKILL') } catch {}
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error generating PDF:', err)
    process.exit(1)
  })
