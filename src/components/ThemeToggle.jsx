import { useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTema, setTema, siguienteTema, aplicarTema, resolverTema } from '../state/theme'

const ASPECTO = {
  auto: { Icono: Monitor, nombre: 'automático' },
  claro: { Icono: Sun, nombre: 'claro' },
  oscuro: { Icono: Moon, nombre: 'oscuro' },
}

// Un solo botón que cicla auto → claro → oscuro. Cicla en vez de abrir un
// menú porque el HUD ya va apretado y son tres estados: llegar a cualquiera
// cuesta dos toques como mucho.
export default function ThemeToggle() {
  const { tema, resuelto } = useTema()
  const { Icono, nombre } = ASPECTO[tema]

  // El <html> ya viene con la clase puesta desde el script de index.html, que
  // corre antes del primer pintado. Esto solo repone el tema donde ese script
  // no existe (los tests) y lo mantiene si algo lo pisa.
  useEffect(() => { aplicarTema(resolverTema(tema)) }, [tema])

  return (
    <button
      onClick={() => setTema(siguienteTema(tema))}
      title={`Tema: ${nombre} (pulsa para cambiar)`}
      aria-label={`Tema: ${nombre}. Pulsa para cambiar.`}
      className="text-gray-500 hover:text-primary"
    >
      <Icono size={18} fill={resuelto === 'oscuro' && tema !== 'auto' ? 'currentColor' : 'none'} />
    </button>
  )
}
