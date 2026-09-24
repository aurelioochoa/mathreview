import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

// Glow suave en lo que brilla (lava, faros, gemas) y una viñeta ligera que
// centra la mirada, como el acabado de cámara de un juego.
export default function Effects({ bloom = 0.35 }) {
  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={bloom} luminanceThreshold={0.9} luminanceSmoothing={0.3} mipmapBlur />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
    </EffectComposer>
  )
}
