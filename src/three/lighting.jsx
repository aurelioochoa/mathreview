import { Environment, Lightformer } from '@react-three/drei'

// Estudio de luz procedural: reflejos glossy sin descargar HDR de ningún CDN.
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 3]} intensity={1.3} />
      <directionalLight position={[-5, 2, -2]} intensity={0.4} color="#a5b4fc" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={8} />
        <Lightformer form="rect" intensity={1.4} position={[-4, 1, 2]} scale={5} color="#ffd8a8" />
        <Lightformer form="circle" intensity={1.2} position={[4, -2, 2]} scale={4} color="#bae6fd" />
      </Environment>
    </>
  )
}
