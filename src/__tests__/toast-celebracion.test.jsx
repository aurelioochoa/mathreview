import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'

// Estos tests cubren el camino CON 3D, que en jsdom nunca se toma solo (no hay
// WebGL, así que useDeviceTier siempre devuelve use3D=false). Se fuerza a mano
// para poder vigilar cuándo se monta el canvas, que es donde estaba el fallo.
vi.mock('../three/useDeviceTier', () => ({ useDeviceTier: () => ({ use3D: true, reduce: false }) }))
vi.mock('../three/Celebration', () => ({
  default: ({ variant }) => <div data-testid="celebracion" data-variant={variant} />,
}))

const { default: Toast } = await import('../components/Toast')

// Se mira la CAPA contenedora, no el componente de dentro. El de dentro es
// `lazy()`, así que en el primer render Suspense muestra null con arreglo o sin
// él: un test que lo mirase pasaría por el motivo equivocado y no vigilaría
// nada. La capa, en cambio, se renderiza de forma síncrona en cuanto se decide
// montarla, así que es lo que de verdad distingue.
const capa = () => document.querySelector('[role="status"] [aria-hidden="true"]')
const celebracion = () => document.querySelector('[data-testid="celebracion"]')

// Temporizadores reales a propósito: los falsos de vitest no mueven
// requestAnimationFrame, que es justo el fotograma de espera que se comprueba.
const pasarUnFotograma = () => act(() => new Promise(r => requestAnimationFrame(() => r())))

describe('Toast — la celebración se monta cuando la caja ya está medida', () => {
  // El fallo se encontró en navegador: React Three Fiber mide su contenedor al
  // montar, y la capa `absolute inset-0` todavía no tiene la altura que le
  // presta el contenido en ese instante. El canvas se quedaba en su tamaño por
  // defecto (300x150) dentro de una caja de 286x64, así que la medalla se
  // dibujaba centrada fuera de la franja visible: el jugador no veía nada.
  it('no monta la capa de celebración en el primer render', () => {
    render(<Toast toast={{ emoji: '🏆', name: 'Maestro' }} onDismiss={() => {}} />)
    expect(capa()).toBeNull()
  })

  it('la monta un fotograma después, ya con la caja medida', async () => {
    render(<Toast toast={{ emoji: '🏆', name: 'Maestro' }} onDismiss={() => {}} />)
    await pasarUnFotograma()
    expect(capa()).toBeTruthy()
    expect(celebracion().dataset.variant).toBe('logro')
  })

  it('el texto del aviso está desde el primer momento, sin esperar al canvas', () => {
    render(<Toast toast={{ emoji: '🏆', name: 'Maestro' }} onDismiss={() => {}} />)
    expect(screen.getByText('Maestro')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('al cambiar de logro vuelve a esperar el fotograma, para medir la caja nueva', async () => {
    const { rerender } = render(<Toast toast={{ emoji: '🏆', name: 'Uno' }} onDismiss={() => {}} />)
    await pasarUnFotograma()
    expect(capa()).toBeTruthy()

    rerender(<Toast toast={null} onDismiss={() => {}} />)
    rerender(<Toast toast={{ emoji: '⭐', name: 'Dos con un nombre mucho más largo' }} onDismiss={() => {}} />)
    expect(capa()).toBeNull()
    await pasarUnFotograma()
    expect(capa()).toBeTruthy()
  })

  it('la capa no interfiere: no recibe puntero y queda oculta a lectores', async () => {
    render(<Toast toast={{ emoji: '🏆', name: 'Maestro' }} onDismiss={() => {}} />)
    await pasarUnFotograma()
    expect(capa().className).toMatch(/pointer-events-none/)
  })
})
