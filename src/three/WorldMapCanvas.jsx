import { lazy, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { worldMapNodes, nodeState, worldProgress } from '../content/worldMap'
import { useGame } from '../state/gameStore'
import Lighting from './lighting'
import WorldObject from './WorldObject'
import Ocean from './Ocean'
import Clouds from './Clouds'
import Paths from './Paths'

const Effects = lazy(() => import('./Effects'))

export default function WorldMapCanvas({ spin = true }) {
  const { state } = useGame()
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [-0.9, 8.4, 10], fov: 46, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(-0.9, -0.4, -0.6)}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerformanceMonitor onChange={({ factor }) => setDpr(Math.round((1 + factor) * 10) / 10)} />
      <fog attach="fog" args={['#b7d9f5', 15, 30]} />
      <Lighting />
      <Ocean animate={spin} />
      <Clouds animate={spin} />
      <Paths />
      {worldMapNodes.map((node) => (
        <WorldObject
          key={node.id}
          node={node}
          state={nodeState(node, state)}
          progress={worldProgress(node, state)}
          spin={spin}
        />
      ))}
      <Suspense fallback={null}>
        <Effects />
      </Suspense>
    </Canvas>
  )
}
