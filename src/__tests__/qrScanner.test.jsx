import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import QrScanner from '../components/QrScanner'

// jsdom no trae mediaDevices. Estos tests cubren los caminos de fallo, que son
// los que sí se pueden ejercitar sin cámara real.
//
// mediaDevices se instala con defineProperty y no con asignación directa:
// en jsdom `navigator` no siempre acepta propiedades nuevas por asignación, y
// un `navigator.mediaDevices = ...` puede quedarse en nada sin avisar.
function fingirCamara(getUserMedia) {
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
}

function rechazarCon(nombre) {
  const error = new Error(nombre)
  error.name = nombre
  return vi.fn().mockRejectedValue(error)
}

describe('QrScanner — sin cámara utilizable', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
  })

  it('sin mediaDevices avisa de que el navegador no puede y ofrece salir', async () => {
    render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
    expect(await screen.findByText(/no puede usar la cámara/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Cerrar/i })).toBeTruthy()
  })

  it('con el permiso denegado lo dice con sus palabras', async () => {
    fingirCamara(rechazarCon('NotAllowedError'))
    render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
    expect(await screen.findByText(/permiso para usar la cámara/i)).toBeTruthy()
  })

  it('sin cámara conectada lo distingue del permiso denegado', async () => {
    fingirCamara(rechazarCon('NotFoundError'))
    render(<QrScanner onCode={() => {}} onCancel={() => {}} />)
    expect(await screen.findByText(/no se ha encontrado ninguna cámara/i)).toBeTruthy()
  })
})
