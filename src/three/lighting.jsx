import { Environment, Lightformer } from '@react-three/drei'

// Estudio de luz procedural: reflejos glossy sin descargar HDR de ningún CDN.
// Los valores (intensidades y colores) los pone el tema; ver sceneTheme.js.
export default function Lighting({ escena }) {
  const [principal, calida, fria] = escena.estudio
  return (
    <>
      <ambientLight intensity={escena.ambiente} />
      <directionalLight position={[4, 6, 3]} intensity={escena.sol.intensidad} color={escena.sol.color} />
      <directionalLight position={[-5, 2, -2]} intensity={escena.relleno.intensidad} color={escena.relleno.color} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={principal.intensidad} color={principal.color} position={[0, 4, 3]} scale={8} />
        <Lightformer form="rect" intensity={calida.intensidad} position={[-4, 1, 2]} scale={5} color={calida.color} />
        <Lightformer form="circle" intensity={fria.intensidad} position={[4, -2, 2]} scale={4} color={fria.color} />
      </Environment>
    </>
  )
}
