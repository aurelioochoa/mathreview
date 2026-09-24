import { useLayoutEffect, useRef } from 'react'
import { Environment, Lightformer } from '@react-three/drei'

// Estudio de luz procedural: reflejos glossy sin descargar HDR de ningún CDN.
// Los valores (intensidades y colores) los pone el tema; ver sceneTheme.js.
export default function Lighting({ escena }) {
  const [principal, calida, fria] = escena.estudio
  const sol = useRef(null)

  // La cámara de sombra hay que encuadrarla a mano: por defecto es un ortográfico
  // de ±5 y el mapa va de x=-6.2 a x=4.4, así que las islas de los extremos se
  // quedaban fuera y no proyectaban nada. Y no basta con fijar los límites como
  // props: three lee `projectionMatrix`, que no se recalcula solo al cambiarlos.
  // Sin este updateProjectionMatrix() el encuadre queda incoherente y no se ve
  // ni una sombra en todo el mapa — que es justo lo que pasaba.
  useLayoutEffect(() => {
    const luz = sol.current
    if (!luz) return
    const cam = luz.shadow.camera
    // Con el mapa explorable las islas se separaron (SPREAD) y el mar navegable
    // va de x=-17 a x=14: el encuadre crece con él.
    cam.left = -19
    cam.right = 19
    cam.top = 15
    cam.bottom = -15
    cam.near = 0.5
    cam.far = 50
    cam.updateProjectionMatrix()
  }, [])

  return (
    <>
      <ambientLight intensity={escena.ambiente} />
      {/* Cielo arriba, tierra abajo: las caras en sombra toman color en vez de gris. */}
      <hemisphereLight args={[escena.cielo.horizonte, '#5d6b3c', 0.7]} />
      <directionalLight
        ref={sol}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.02}
        shadow-bias={-0.0005}
        position={[5, 14, 5]}
        intensity={escena.sol.intensidad}
        color={escena.sol.color}
      />
      <directionalLight position={[-5, 2, -2]} intensity={escena.relleno.intensidad} color={escena.relleno.color} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={principal.intensidad} color={principal.color} position={[0, 4, 3]} scale={8} />
        <Lightformer form="rect" intensity={calida.intensidad} position={[-4, 1, 2]} scale={5} color={calida.color} />
        <Lightformer form="circle" intensity={fria.intensidad} position={[4, -2, 2]} scale={4} color={fria.color} />
      </Environment>
    </>
  )
}
