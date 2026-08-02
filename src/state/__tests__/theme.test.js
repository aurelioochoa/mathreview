import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { THEME_KEY, THEMES, siguienteTema, temaGuardado, resolverTema, aplicarTema, setTema, getTema } from '../theme'

const matchMediaOriginal = window.matchMedia

function sistemaOscuro(oscuro) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: query.includes('dark') ? oscuro : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    sistemaOscuro(false)
  })
  afterEach(() => { window.matchMedia = matchMediaOriginal })

  it('sin nada guardado, el tema es automático', () => {
    expect(temaGuardado()).toBe('auto')
  })

  // Un valor tocado a mano en localStorage no debe dejar la app sin tema.
  it('un tema guardado que no existe cae en automático', () => {
    localStorage.setItem(THEME_KEY, 'fosforito')
    expect(temaGuardado()).toBe('auto')
  })

  it('el botón cicla auto → claro → oscuro → auto', () => {
    expect(siguienteTema('auto')).toBe('claro')
    expect(siguienteTema('claro')).toBe('oscuro')
    expect(siguienteTema('oscuro')).toBe('auto')
    expect(THEMES).toEqual(['auto', 'claro', 'oscuro'])
  })

  it('automático sigue a la preferencia del sistema', () => {
    sistemaOscuro(true)
    expect(resolverTema('auto')).toBe('oscuro')
    sistemaOscuro(false)
    expect(resolverTema('auto')).toBe('claro')
  })

  it('elegir a mano manda sobre el sistema', () => {
    sistemaOscuro(true)
    expect(resolverTema('claro')).toBe('claro')
    sistemaOscuro(false)
    expect(resolverTema('oscuro')).toBe('oscuro')
  })

  it('aplicar el tema pone y quita la clase dark del documento', () => {
    aplicarTema('oscuro')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    aplicarTema('claro')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('setTema guarda la elección y la aplica', () => {
    setTema('oscuro')
    expect(getTema()).toBe('oscuro')
    expect(localStorage.getItem(THEME_KEY)).toBe('oscuro')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    setTema('auto')
    expect(localStorage.getItem(THEME_KEY)).toBe('auto')
  })

  it('setTema ignora un tema que no existe', () => {
    setTema('oscuro')
    setTema('fosforito')
    expect(getTema()).toBe('oscuro')
  })
})
