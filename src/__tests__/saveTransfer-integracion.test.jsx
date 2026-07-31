import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SaveTransfer from '../components/SaveTransfer'
import { GameProvider } from '../state/GameProvider'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY, PRE_IMPORT_KEY } from '../state/persistence'
import { encodeSave } from '../state/saveCode'
import { todayStr } from '../state/streak'

function montar(extra = {}) {
  const save = { ...defaultState(), streak: { count: 1, best: 1, lastDate: todayStr() }, ...extra }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  return render(<GameProvider><SaveTransfer /></GameProvider>)
}

describe('integración: SaveTransfer', () => {
  beforeEach(() => localStorage.clear())

  it('muestra el código de la partida actual', async () => {
    montar({ xp: 500 })
    const salida = await screen.findByLabelText(/Tu código de partida/i)
    await waitFor(() => expect(salida.value.startsWith('MQ1.')).toBe(true))
  })

  it('pegar un código válido enseña el resumen y NO importa todavía', async () => {
    montar({ xp: 10 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777, hints: 4 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))

    expect(await screen.findByText(/777 monedas/)).toBeTruthy()
    // Sigue esperando confirmación: el botón de confirmar está en pantalla.
    expect(screen.getByRole('button', { name: /Cargar esta partida/i })).toBeTruthy()
  })

  it('confirmar aplica la partida importada', async () => {
    montar({ xp: 10 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Cargar esta partida/i }))

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777)
    })
  })

  it('cancelar descarta la partida pendiente sin aplicarla', async () => {
    montar({ xp: 10, coins: 3 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Cancelar/i }))

    expect(screen.queryByText(/777 monedas/)).toBeNull()
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(3)
  })

  it('un código ilegible explica qué pasa y no ofrece cargar nada', async () => {
    montar()
    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: 'esto-no-es-un-codigo' } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))

    expect(await screen.findByText(/no parece un código de Math Quest/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Cargar esta partida/i })).toBeNull()
  })

  it('cambiar el código pegado tras revisarlo descarta la partida pendiente', async () => {
    montar({ xp: 10 })
    const codigoA = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigoA } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    expect(await screen.findByRole('button', { name: /Cargar esta partida/i })).toBeTruthy()

    // El jugador se da cuenta de que pegó el código equivocado y lo cambia,
    // pero sin volver a pulsar "Revisar código". El resumen y el botón de
    // confirmar de la partida anterior ya no deben estar en pantalla: no hay
    // que poder cargar una partida que ya no corresponde al texto visible.
    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: 'otro-texto-cualquiera' } })

    expect(screen.queryByRole('button', { name: /Cargar esta partida/i })).toBeNull()
    expect(screen.queryByText(/777 monedas/)).toBeNull()
  })

  it('el input de "Abrir fichero" es accesible por teclado, no está oculto con display:none', async () => {
    montar()
    const input = await screen.findByLabelText(/Abrir fichero/i)
    expect(input.className).not.toMatch(/\bhidden\b/)
  })
})

describe('integración: SaveTransfer — QR', () => {
  beforeEach(() => localStorage.clear())

  it('ofrece mostrar el QR cuando el código cabe', async () => {
    montar({ xp: 100 })
    await screen.findByLabelText(/Tu código de partida/i)
    expect(await screen.findByRole('button', { name: /Mostrar QR/i })).toBeTruthy()
  })

  it('si el código no cabe en un QR lo dice en vez de ofrecerlo', async () => {
    // Una partida con basura suficiente para pasarse del tope, para probar la
    // guarda. No es un caso real: el peor caso realista son ~800 B.
    const relleno = {}
    for (let i = 0; i < 4000; i++) relleno[`nivel-de-relleno-numero-${i}`] = 3
    montar({ stars: relleno })
    await screen.findByLabelText(/Tu código de partida/i)
    expect(await screen.findByText(/demasiado grande para un QR/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Mostrar QR/i })).toBeNull()
  })
})

describe('integración: SaveTransfer — deshacer un import', () => {
  beforeEach(() => localStorage.clear())

  it('sin haber importado nada, no se ofrece deshacer', async () => {
    montar()
    await screen.findByLabelText(/Tu código de partida/i)
    expect(screen.queryByRole('button', { name: /Deshacer/i })).toBeNull()
  })

  // Reproduce el bug real: la partida importada trae bossDefeats que
  // desbloquean un logro retroactivo (ver GameProvider.test.jsx), lo que
  // dispara un segundo cambio de estado — y por tanto un segundo
  // persistSave() — después del import, sin que el jugador toque nada.
  it('tras importar, la instantánea sobrevive al cambio de estado del logro retroactivo y aparece "Deshacer"', async () => {
    montar({ xp: 10, coins: 3 })
    const codigo = await encodeSave({
      ...defaultState(), xp: 9000, coins: 777, bossDefeats: ['mundo3'],
      streak: { count: 1, best: 1, lastDate: todayStr() },
    })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Cargar esta partida/i }))

    // Espera a que el logro retroactivo se dispare y se persista de nuevo.
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(SAVE_KEY)).achievements).toContain('cazajefes')
    })

    expect(await screen.findByRole('button', { name: /Deshacer/i })).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(PRE_IMPORT_KEY)).coins).toBe(3)
  })

  it('"Deshacer" restaura la partida anterior y hace desaparecer el botón', async () => {
    montar({ xp: 10, coins: 3 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Cargar esta partida/i }))

    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777))

    fireEvent.click(await screen.findByRole('button', { name: /Deshacer/i }))

    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(3))
    expect(localStorage.getItem(PRE_IMPORT_KEY)).toBeNull()
    expect(screen.queryByRole('button', { name: /Deshacer/i })).toBeNull()
  })
})
