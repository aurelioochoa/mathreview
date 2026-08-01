import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// encodeSave se sustituye por uno que siempre rechaza, simulando un
// navegador sin CompressionStream (Safari iOS < 16.4, WebViews viejos de
// Android). Vive en su propio fichero porque el mock de saveCode es global a
// todo el fichero de test, y el resto de tests de SaveTransfer necesitan el
// encodeSave/decodeSave de verdad.
vi.mock('../state/saveCode', async (importOriginal) => {
  const real = await importOriginal()
  return {
    ...real,
    encodeSave: vi.fn().mockRejectedValue(new ReferenceError('CompressionStream is not defined')),
  }
})

const { default: SaveTransfer } = await import('../components/SaveTransfer')
const { GameProvider } = await import('../state/GameProvider')

describe('integración: SaveTransfer — encodeSave falla (sin CompressionStream)', () => {
  it('avisa de que el navegador no puede generar el código, y no ofrece copiar ni descargar nada', async () => {
    render(<GameProvider><SaveTransfer /></GameProvider>)

    expect(await screen.findByText(/no puede generar el código/i)).toBeTruthy()

    const copiarBtn = screen.getByRole('button', { name: /^Copiar$/i })
    const descargarBtn = screen.getByRole('button', { name: /Descargar fichero/i })
    expect(copiarBtn.disabled).toBe(true)
    expect(descargarBtn.disabled).toBe(true)
  })
})
