import { findItem } from '../content/shop'

// Halo animado alrededor de lo que envuelva. Se usa para el avatar del perfil
// y para la vista previa de la tienda, así que el tamaño entra por parámetro.
//
// Si el id no trae colores -- no hay aura equipada, o es un id de una partida
// vieja que ya no está en el catálogo -- devuelve el contenido tal cual, sin
// envoltorio: un aura desconocida no debe dejar un hueco raro en el perfil.
export default function AuraRing({ auraId, size = 88, children }) {
  const colores = findItem(auraId)?.colors
  if (!colores || colores.length === 0) return children

  // El conic-gradient se cierra repitiendo el primer color: sin eso hay un
  // corte duro entre el último y el primero al dar la vuelta.
  const anillo = `conic-gradient(from 0deg, ${[...colores, colores[0]].join(', ')})`

  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <span
        data-testid="aura-ring"
        aria-hidden="true"
        className="aura-giro absolute inset-0 rounded-full"
        style={{ background: anillo, filter: `blur(${Math.round(size / 12)}px)`, opacity: 0.85 }}
      />
      <span
        aria-hidden="true"
        className="aura-latido absolute rounded-full"
        style={{ inset: '12%', background: `radial-gradient(circle, ${colores[0]}55 0%, transparent 70%)` }}
      />
      <span className="relative leading-none">{children}</span>
    </span>
  )
}
