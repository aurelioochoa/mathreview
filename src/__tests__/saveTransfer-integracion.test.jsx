import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SaveTransfer from '../components/SaveTransfer'
import { GameProvider } from '../state/GameProvider'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY, PRE_IMPORT_KEY, PRE_IMPORT_TTL_MS } from '../state/persistence'
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

  it('editar el texto pegado mientras decodeSave sigue en vuelo no resucita un resultado viejo', async () => {
    montar({ xp: 10 })
    const codigoA = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigoA } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    // Sin esperar a que decodeSave resuelva, el jugador cambia de idea y
    // borra lo que había pegado.
    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: 'cambié de idea' } })

    // Da tiempo de sobra a que la petición vieja, si no se descartara,
    // resolviera y aplicara su resultado por encima del cambio.
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(screen.queryByRole('button', { name: /Cargar esta partida/i })).toBeNull()
    expect(screen.queryByText(/777 monedas/)).toBeNull()
  })

  it('"Abrir fichero" también actualiza el textarea de pegar con el contenido del fichero', async () => {
    montar()
    const codigo = await encodeSave({ ...defaultState(), xp: 5, coins: 42 })
    const fichero = new File([codigo], 'partida.mathquest', { type: 'text/plain' })

    const input = await screen.findByLabelText(/Abrir fichero/i)
    fireEvent.change(input, { target: { files: [fichero] } })

    await screen.findByRole('button', { name: /Cargar esta partida/i })
    expect(screen.getByLabelText(/Pega aquí un código/i).value).toBe(codigo)
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

describe('integración: SaveTransfer — botón "Copiar" con reserva manual', () => {
  beforeEach(() => localStorage.clear())

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  })

  it('con navigator.clipboard disponible, copiar confirma que funcionó', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    montar({ xp: 100 })
    const copiarBtn = await screen.findByRole('button', { name: /^Copiar$/i })
    await waitFor(() => expect(copiarBtn.disabled).toBe(false))

    fireEvent.click(copiarBtn)

    expect(await screen.findByText(/copiado/i)).toBeTruthy()
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^MQ1\./))
  })

  // El caso real más común de la reserva manual: la API existe, pero writeText
  // rechaza (contexto no seguro, permiso denegado, portapapeles bloqueado por
  // el sistema). Sin este camino, el jugador se queda sin código y sin aviso.
  it('si writeText falla, cae igualmente a la selección manual y lo dice', async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException('denegado', 'NotAllowedError'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    montar({ xp: 100 })
    const salida = await screen.findByLabelText(/Tu código de partida/i)
    const copiarBtn = screen.getByRole('button', { name: /^Copiar$/i })
    await waitFor(() => expect(copiarBtn.disabled).toBe(false))

    fireEvent.click(copiarBtn)

    expect(await screen.findByText(/ya dejamos el texto seleccionado/i)).toBeTruthy()
    expect(writeText).toHaveBeenCalled()
    expect(salida.selectionStart).toBe(0)
    expect(salida.selectionEnd).toBe(salida.value.length)
    // Y sin decir que se copió, que es lo que no pasó.
    expect(screen.queryByText(/¡Código copiado!/)).toBeNull()
  })

  it('sin navigator.clipboard, selecciona el texto a mano y lo dice', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })

    montar({ xp: 100 })
    const salida = await screen.findByLabelText(/Tu código de partida/i)
    const copiarBtn = screen.getByRole('button', { name: /^Copiar$/i })
    await waitFor(() => expect(copiarBtn.disabled).toBe(false))

    fireEvent.click(copiarBtn)

    expect(await screen.findByText(/ya dejamos el texto seleccionado/i)).toBeTruthy()
    expect(salida.selectionStart).toBe(0)
    expect(salida.selectionEnd).toBe(salida.value.length)
  })
})

describe('integración: SaveTransfer — el panel de confirmación se anuncia', () => {
  beforeEach(() => localStorage.clear())

  it('el panel que aparece tras revisar un código válido es una región anunciada (role="alert")', async () => {
    montar({ xp: 10 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))

    const panel = await screen.findByRole('alert')
    expect(panel.textContent).toMatch(/777 monedas/)
  })

  it('el foco se mueve al botón de confirmar cuando aparece el panel', async () => {
    montar({ xp: 10 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))

    const botonCargar = await screen.findByRole('button', { name: /Cargar esta partida/i })
    await waitFor(() => expect(document.activeElement).toBe(botonCargar))
  })
})

describe('integración: SaveTransfer — exportar sin creer que se hizo una copia inexistente', () => {
  beforeEach(() => localStorage.clear())

  it('"Copiar" y "Descargar fichero" están deshabilitados hasta que el código está listo', async () => {
    montar({ xp: 100 })
    // Justo tras el render síncrono, el efecto que llama a encodeSave todavía
    // no ha resuelto su promesa (es asíncrono incluso en el caso rápido), así
    // que codigo sigue vacío en este instante: es la ventana real del bug.
    const copiarBtn = screen.getByRole('button', { name: /^Copiar$/i })
    const descargarBtn = screen.getByRole('button', { name: /Descargar fichero/i })
    expect(copiarBtn.disabled).toBe(true)
    expect(descargarBtn.disabled).toBe(true)

    await waitFor(() => expect(copiarBtn.disabled).toBe(false))
    expect(descargarBtn.disabled).toBe(false)
  })
})

describe('integración: SaveTransfer — código corrupto vs. navegador sin soporte', () => {
  beforeEach(() => localStorage.clear())

  it('un código corrupto y un navegador sin DecompressionStream dan mensajes distintos', async () => {
    montar()
    const codigo = await encodeSave({ ...defaultState(), xp: 1 })

    // Primero, con la API presente: un código truncado es 'corrupto'.
    fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo.slice(0, -8) } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
    expect(await screen.findByText(/incompleto/i)).toBeTruthy()

    // Ahora, sin DecompressionStream: el mismo código (esta vez entero, uno
    // que decodificaría bien) da un mensaje distinto, que no culpa al código.
    const original = globalThis.DecompressionStream
    delete globalThis.DecompressionStream
    try {
      fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
      fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
      expect(await screen.findByText(/este navegador no puede leer/i)).toBeTruthy()
      expect(screen.queryByText(/incompleto/i)).toBeNull()
    } finally {
      globalThis.DecompressionStream = original
    }
  })
})

// Pega un código, lo revisa y confirma la carga: los tres pasos que da el
// jugador para importar una partida.
async function importar(codigo) {
  fireEvent.change(screen.getByLabelText(/Pega aquí un código/i), { target: { value: codigo } })
  fireEvent.click(screen.getByRole('button', { name: /Revisar código/i }))
  fireEvent.click(await screen.findByRole('button', { name: /Cargar esta partida/i }))
}

// Deshacer también son dos pasos: pedirlo y confirmarlo sobre el resumen de la
// partida que se va a recuperar.
async function deshacer() {
  fireEvent.click(await screen.findByRole('button', { name: /Deshacer la última carga/i }))
  fireEvent.click(await screen.findByRole('button', { name: /Sí, recuperar esa partida/i }))
}

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
    // La instantánea se guarda con la hora a la que se tomó, para poder
    // caducarla: la partida va dentro, en `save`.
    expect(JSON.parse(localStorage.getItem(PRE_IMPORT_KEY)).save.coins).toBe(3)
  })

  // Secuencia real: el niño pega un código, ve que no es el suyo y, en vez de
  // deshacer, prueba directamente con otro. La instantánea que hay que poder
  // recuperar sigue siendo la de su partida (3 monedas), no la del primer
  // código equivocado.
  it('importar dos veces seguidas sin deshacer conserva la partida original', async () => {
    montar({ xp: 10, coins: 3 })

    await importar(await encodeSave({ ...defaultState(), coins: 111 }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(111))

    await importar(await encodeSave({ ...defaultState(), coins: 222 }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(222))

    await deshacer()

    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(3))
  })

  it('"Deshacer" restaura la partida anterior y hace desaparecer el botón', async () => {
    montar({ xp: 10, coins: 3 })
    const codigo = await encodeSave({ ...defaultState(), xp: 9000, coins: 777 })

    await importar(codigo)
    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777))

    await deshacer()

    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(3))
    expect(localStorage.getItem(PRE_IMPORT_KEY)).toBeNull()
    expect(screen.queryByRole('button', { name: /Deshacer/i })).toBeNull()
  })

  // Deshacer reemplaza la partida entera, igual que importar: no puede aplicar
  // nada de un clic pelado, y el jugador tiene que ver qué recupera.
  it('"Deshacer" enseña el resumen de la partida que se recupera y no aplica nada hasta confirmar', async () => {
    montar({ xp: 10, coins: 3 })

    await importar(await encodeSave({ ...defaultState(), xp: 9000, coins: 777 }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777))

    fireEvent.click(await screen.findByRole('button', { name: /Deshacer la última carga/i }))

    // Resumen de lo que se va a recuperar (3 monedas) y aviso de lo que se
    // reemplaza (la partida actual, 777).
    expect(await screen.findByText(/3 monedas/)).toBeTruthy()
    expect(screen.getByText(/777 monedas/)).toBeTruthy()
    // Y nada aplicado todavía.
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777)
    expect(localStorage.getItem(PRE_IMPORT_KEY)).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Sí, recuperar esa partida/i }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(3))
  })

  it('cancelar el deshacer deja la partida importada como está', async () => {
    montar({ xp: 10, coins: 3 })

    await importar(await encodeSave({ ...defaultState(), xp: 9000, coins: 777 }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777))

    fireEvent.click(await screen.findByRole('button', { name: /Deshacer la última carga/i }))
    fireEvent.click(await screen.findByRole('button', { name: /No, dejarlo como está/i }))

    expect(screen.queryByRole('button', { name: /Sí, recuperar esa partida/i })).toBeNull()
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777)
    // El aviso sigue ahí: cancelar no gasta la instantánea.
    expect(screen.getByRole('button', { name: /Deshacer la última carga/i })).toBeTruthy()
  })

  // Si localStorage está lleno, la instantánea no llega a guardarse: el aviso
  // no puede aparecer prometiendo una vuelta atrás que no existe.
  it('sin poder guardar la instantánea, no aparece un "Deshacer" que no funcionaría', async () => {
    montar({ xp: 10, coins: 3 })
    await screen.findByLabelText(/Tu código de partida/i)
    const codigo = await encodeSave({ ...defaultState(), coins: 777 })

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded', 'QuotaExceededError')
    })
    try {
      await importar(codigo)
      // La importación se aplicó (el panel de confirmar ya no está)...
      await waitFor(() => expect(screen.queryByRole('button', { name: /Cargar esta partida/i })).toBeNull())
      // ...pero sin instantánea no se ofrece deshacer.
      expect(screen.queryByRole('button', { name: /Deshacer/i })).toBeNull()
    } finally {
      setItem.mockRestore()
    }
  })

  // Rebuscado -- hace falta dejar el diálogo abierto más de un día -- pero es
  // el único camino por el que la caducidad se podía saltar: confirmar aplicaba
  // la instantánea que se leyó al ABRIR el panel, sin volver a mirar si seguía
  // vigente. Se relee al confirmar, así que la caducidad manda en todos los
  // caminos y no en casi todos.
  it('si la instantánea caduca con el panel de confirmar abierto, no se aplica nada y el aviso se retira', async () => {
    montar({ xp: 10, coins: 3 })

    await importar(await encodeSave({ ...defaultState(), xp: 9000, coins: 777 }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777))

    // El jugador abre el panel: aquí es donde se leía la instantánea.
    fireEvent.click(await screen.findByRole('button', { name: /Deshacer la última carga/i }))
    expect(await screen.findByRole('button', { name: /Sí, recuperar esa partida/i })).toBeTruthy()

    // ...y la deja abierta hasta que la instantánea caduca.
    const sobre = JSON.parse(localStorage.getItem(PRE_IMPORT_KEY))
    localStorage.setItem(PRE_IMPORT_KEY, JSON.stringify({
      ...sobre, guardadaEn: Date.now() - PRE_IMPORT_TTL_MS - 1000,
    }))

    fireEvent.click(screen.getByRole('button', { name: /Sí, recuperar esa partida/i }))

    // La partida caducada NO vuelve: sigue la importada.
    await waitFor(() => expect(screen.queryByRole('button', { name: /Sí, recuperar esa partida/i })).toBeNull())
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).coins).toBe(777)
    // Y el aviso entero se retira: nada de dejar un botón que ya no puede hacer
    // nada esperando otro clic.
    expect(screen.queryByRole('button', { name: /Deshacer/i })).toBeNull()
    expect(localStorage.getItem(PRE_IMPORT_KEY)).toBeNull()
  })

  it('una instantánea caducada no ofrece deshacer y se limpia sola', async () => {
    localStorage.setItem(PRE_IMPORT_KEY, JSON.stringify({
      guardadaEn: Date.now() - PRE_IMPORT_TTL_MS - 1000,
      save: { ...defaultState(), coins: 3 },
    }))

    montar({ xp: 10, coins: 777 })
    await screen.findByLabelText(/Tu código de partida/i)

    expect(screen.queryByRole('button', { name: /Deshacer/i })).toBeNull()
    expect(localStorage.getItem(PRE_IMPORT_KEY)).toBeNull()
  })
})
