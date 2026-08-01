import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Toast from '../components/Toast'

// En jsdom no hay WebGL, así que useDeviceTier devuelve use3D=false y el
// canvas no se monta. Estos tests fijan que el aviso sigue funcionando ahí,
// que es el camino que ve cualquier móvil flojo.
describe('Toast de logro', () => {
  it('sin logro no pinta nada', () => {
    const { container } = render(<Toast toast={null} onDismiss={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('muestra nombre y emoji del logro', () => {
    render(<Toast toast={{ emoji: '🏆', name: 'Maestro del Volcán' }} onDismiss={() => {}} />)
    expect(screen.getByText('🏆')).toBeTruthy()
    expect(screen.getByText('Maestro del Volcán')).toBeTruthy()
    expect(screen.getByText(/¡Logro desbloqueado!/)).toBeTruthy()
  })

  it('sigue siendo un status accesible', () => {
    render(<Toast toast={{ emoji: '⭐', name: 'Primera estrella' }} onDismiss={() => {}} />)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('sin 3D no fuerza el ancho mínimo pensado para el canvas', () => {
    // En jsdom use3D siempre es false: la caja debe seguir dimensionándose al
    // contenido, como antes de esta task, en vez de ensancharse sin canvas
    // que llenar (nombres cortos como "Fénix" o "Veterano" quedarían con una
    // píldora ancha y medio vacía).
    render(<Toast toast={{ emoji: '⭐', name: 'Fénix' }} onDismiss={() => {}} />)
    expect(screen.getByRole('status').className).not.toContain('min-w-[18rem]')
  })

  it('se descarta solo a los 3,5 s', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<Toast toast={{ emoji: '⭐', name: 'Primera estrella' }} onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(3500) })
    expect(onDismiss).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
