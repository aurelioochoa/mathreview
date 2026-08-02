import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from '../components/ThemeToggle'
import { THEME_KEY, setTema } from '../state/theme'

const matchMediaOriginal = window.matchMedia

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    }))
    localStorage.clear()
    setTema('auto')
    document.documentElement.classList.remove('dark')
  })
  afterEach(() => { window.matchMedia = matchMediaOriginal })

  it('el botón dice en qué tema está', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /Tema: automático/i })).toBeTruthy()
  })

  it('pulsarlo cicla los tres temas y deja el documento en oscuro al llegar', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: /Tema: claro/i })).toBeTruthy()
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: /Tema: oscuro/i })).toBeTruthy()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_KEY)).toBe('oscuro')

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: /Tema: automático/i })).toBeTruthy()
  })
})
