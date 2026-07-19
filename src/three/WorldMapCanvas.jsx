import { lazy, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { worldMapNodes, nodeState } from '../content/worldMap'
import { useGame } from '../state/gameStore'
import Lighting from './lighting'
import WorldObject from './WorldObject'

const Effects = lazy(() => import('./Effects'))

export default function WorldMapCanvas({ spin = true }) {
  const { state } = useGame()
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0.6, 0, 8], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerformanceMonitor onChange={({ factor }) => setDpr(Math.round((1 + factor) * 10) / 10)} />
      <Lighting />
      {worldMapNodes.map((node) => (
        <WorldObject key={node.id} node={node} state={nodeState(node, state)} spin={spin} />
      ))}
      <Suspense fallback={null}>
        <Effects />
      </Suspense>
    </Canvas>
  )
}
