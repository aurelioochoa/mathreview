import { RoundedBox } from '@react-three/drei'

// Small, offline dioramas. Materials distinguish stone, enamel, glass and wood.
function Box({ position, args, color = '#e7dcc4', rotation, metalness = 0 }) {
  return <RoundedBox position={position} rotation={rotation} args={args} radius={0.025} smoothness={2} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.65} metalness={metalness} /></RoundedBox>
}
function Cone({ position, args, color }) {
  return <mesh position={position} castShadow receiveShadow><coneGeometry args={args} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
}
function Cylinder({ position, args, color, rotation, metalness = 0 }) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow><cylinderGeometry args={args} /><meshStandardMaterial color={color} roughness={0.48} metalness={metalness} /></mesh>
}

export default function WorldModel({ kind, color, glow, locked }) {
  const accent = locked ? '#84958e' : color
  switch (kind) {
    case 'castle':
      return <group>
        <Box position={[0, -0.2, 0]} args={[1, 0.65, 0.7]} />
        <Box position={[0, -0.3, 0.365]} args={[0.23, 0.43, 0.035]} color="#514334" />
        {[-1, 1].flatMap(x => [-1, 1].map(z => <group key={`${x}${z}`} position={[x * 0.45, 0, z * 0.32]}>
          <Cylinder args={[0.17, 0.2, 0.9, 16]} color="#e1d4ba" />
          <Cone position={[0, 0.62, 0]} args={[0.25, 0.4, 16]} color={accent} />
          <Box position={[0, 0.16, 0.17]} args={[0.07, 0.18, 0.025]} color="#42505a" />
        </group>))}
        {[-0.3, 0, 0.3].map(x => <Box key={x} position={[x, 0.2, 0.32]} args={[0.16, 0.18, 0.15]} />)}
        <Cylinder position={[0, 0.53, 0]} args={[0.018, 0.018, 0.65, 8]} color="#a88a51" />
        <Box position={[0.13, 0.77, 0]} args={[0.25, 0.14, 0.025]} color={accent} />
      </group>
    case 'rocket':
      return <group rotation={[0, 0, -0.15]}>
        <Cylinder args={[0.25, 0.3, 0.85, 32]} color="#edf0ed" metalness={0.35} />
        <Cone position={[0, 0.6, 0]} args={[0.25, 0.4, 32]} color={accent} />
        <Cylinder position={[0, -0.49, 0]} args={[0.2, 0.16, 0.16, 24]} color="#536476" metalness={0.7} />
        <mesh position={[0, 0.12, 0.257]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.11, 0.026, 8, 24]} /><meshStandardMaterial color="#bd9e64" metalness={0.7} roughness={0.28} /></mesh>
        <mesh position={[0, 0.12, 0.265]}><sphereGeometry args={[0.09, 20, 12]} /><meshPhysicalMaterial color="#246b83" metalness={0.45} roughness={0.12} clearcoat={1} /></mesh>
        {[0, 2.094, 4.189].map(a => <group key={a} rotation={[0, a, 0]}><Box position={[0.29, -0.32, 0]} rotation={[0, 0, -0.3]} args={[0.17, 0.43, 0.09]} color={accent} /></group>)}
      </group>
    case 'mountain':
      return <group>{[[-0.38, -0.22, 0.1, 0.65], [0.12, 0, -0.12, 1], [0.48, -0.26, 0.2, 0.55]].map(([x,y,z,s], i) => <group key={i} position={[x,y,z]} scale={s}>
        <Cone args={[0.6, 1.25, 7]} color={i === 1 ? '#79858a' : '#9c9990'} />
        <Cone position={[0, 0.43, 0]} args={[0.19, 0.4, 7]} color="#f1f4ed" />
      </group>)}</group>
    case 'crystal':
      return <group>
        <Cylinder position={[0, -0.12, 0]} args={[0.25, 0.7, 0.9, 11]} color="#645f59" />
        <mesh position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.22, 24]} /><meshStandardMaterial color="#ffab35" emissive="#ff5a12" emissiveIntensity={glow ? 2 : 1} /></mesh>
        <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.25, 0.065, 8, 24]} /><meshStandardMaterial color="#484341" roughness={1} /></mesh>
        {[0.2, 2.5, 4.2].map(a => <group key={a} rotation={[0, a, 0]}><Box position={[0.32, 0.02, 0]} rotation={[0, 0, 0.75]} args={[0.055, 0.6, 0.035]} color={accent} /></group>)}
      </group>
    case 'ferris':
      return <group>
        {[-1, 1].map(s => <Box key={s} position={[s * 0.23, -0.25, 0]} rotation={[0, 0, s * 0.4]} args={[0.07, 0.95, 0.12]} color="#eee5ce" metalness={0.4} />)}
        <group position={[0, 0.15, 0.1]}>
          <mesh castShadow><torusGeometry args={[0.56, 0.035, 8, 48]} /><meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} /></mesh>
          {Array.from({length: 8}, (_, i) => { const a = i * Math.PI / 4; return <group key={i}>
            <Box position={[Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0]} rotation={[0, 0, a]} args={[0.56, 0.018, 0.025]} color="#e6d9b9" metalness={0.5} />
            <Box position={[Math.cos(a) * 0.56, Math.sin(a) * 0.56 - 0.07, 0]} args={[0.16, 0.14, 0.18]} color={i % 2 ? '#e4b85e' : accent} />
          </group>})}
        </group>
      </group>
    case 'maze':
      return <group rotation={[0, 0.3, 0]}>
        <Box position={[0, -0.35, 0]} args={[1.25, 0.12, 1.1]} color="#c6b99d" />
        {[-0.52, 0.52].map(z => <Box key={z} position={[0, -0.12, z]} args={[1.2, 0.4, 0.075]} color={accent} />)}
        {[-0.56, 0.56].map(x => <Box key={x} position={[x, -0.12, 0]} args={[0.075, 0.4, 1]} color={accent} />)}
        {[-0.27, 0, 0.27].map((x,i) => <Box key={x} position={[x, -0.12, i % 2 ? 0.14 : -0.14]} args={[0.07, 0.4, 0.7]} color={accent} />)}
        <mesh position={[0.4, 0.16, -0.32]} castShadow><sphereGeometry args={[0.1, 16, 12]} /><meshStandardMaterial color="#e7b952" metalness={0.6} roughness={0.25} /></mesh>
      </group>
    case 'island':
      return <group>
        <Cylinder position={[0, -0.4, 0]} args={[0.65, 0.55, 0.16, 32]} color="#e7cc8b" />
        <group rotation={[0, 0, -0.14]}>
          <Cylinder position={[0, 0, 0]} args={[0.055, 0.09, 0.85, 10]} color="#98714a" />
          {Array.from({length: 7}, (_, i) => <group key={i} position={[0, 0.45, 0]} rotation={[0, i * Math.PI * 2 / 7, 0]}>
            <mesh position={[0.25, -0.04, 0]} rotation={[0, 0, -0.2]} scale={[0.42, 0.055, 0.13]} castShadow><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={locked ? '#82978b' : '#398764'} roughness={0.8} /></mesh>
          </group>)}
        </group>
        <Box position={[0.34, -0.25, 0.15]} rotation={[0, -0.4, 0]} args={[0.26, 0.22, 0.22]} color="#b38343" />
      </group>
    case 'pizza':
      return <group rotation={[0.18, 0, 0]}>
        <Cylinder position={[0, -0.14, 0]} args={[0.7, 0.7, 0.07, 48]} color="#e7dfcd" />
        <Cylinder position={[0, -0.07, 0]} args={[0.62, 0.62, 0.1, 48]} color="#bd813c" />
        <Cylinder args={[0.56, 0.56, 0.055, 48]} color="#e9ba54" />
        {Array.from({length: 8}, (_, i) => { const a = i * Math.PI / 4; return <group key={i} rotation={[0, a, 0]}>
          <Box position={[0.29, 0.032, 0]} args={[0.57, 0.009, 0.018]} color="#ab7035" />
          <Cylinder position={[0.34, 0.042, 0.14]} args={[0.072, 0.072, 0.022, 16]} color="#a94f36" />
        </group>})}
      </group>
    // Red de seguridad: antes de los dioramas cada mundo caía aquí como esfera. Sin
    // esto, una forma no contemplada dejaría la isla vacía y sin ningún aviso.
    default:
      return <mesh castShadow receiveShadow><sphereGeometry args={[0.55, 32, 32]} /><meshStandardMaterial color={accent} roughness={0.4} metalness={0.2} /></mesh>
  }
}
