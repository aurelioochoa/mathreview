import { EffectComposer, Bloom } from '@react-three/postprocessing'

// Glow suave: solo los píxeles brillantes (emissive de los mundos) florecen.
export default function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.7} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur />
    </EffectComposer>
  )
}
