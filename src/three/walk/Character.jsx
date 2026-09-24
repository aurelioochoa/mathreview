import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Personaje humano de proporciones realistas (~1,75 de alto): torso torneado
// con pecho y cintura, pelvis, extremidades en dos tramos con articulación
// (rodilla, codo), manos, zapatillas, cuello y cabeza con ojos, cejas, nariz,
// boca, orejas y pelo. El avatar equipado va como parche en la mochila.
//
// `state()` da { x, y, z, heading, speed, air } cada fotograma, así sirve igual
// para el jugador que para los personajes de las sidequests.

function parcheTexture(emoji) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fef3c7'
  ctx.beginPath(); ctx.arc(64, 64, 60, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#b45309'; ctx.lineWidth = 6; ctx.stroke()
  ctx.font = '76px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Torso: perfil de revolución (cadera → cintura → pecho → hombros → cuello)
// achatado de delante a atrás.
function torsoGeo() {
  const perfil = [
    [0.001, -0.06], [0.14, -0.06], [0.165, 0.0], [0.16, 0.08], [0.148, 0.17], [0.158, 0.27],
    [0.178, 0.37], [0.188, 0.44], [0.178, 0.49], [0.13, 0.535], [0.06, 0.555], [0.001, 0.56],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const g = new THREE.LatheGeometry(perfil, 24)
  g.scale(1.05, 1, 0.68)
  return g
}

// Capsula de un tramo de extremidad, colgando del pivote (y de 0 a -len).
function Tramo({ len, r0, r1, color, rough = 0.75 }) {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(r1, r0, len, 12, 1)
    g.translate(0, -len / 2, 0)
    return g
  }, [len, r0, r1])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <>
      <mesh geometry={geo} castShadow><meshStandardMaterial color={color} roughness={rough} /></mesh>
      <mesh position={[0, -len, 0]} castShadow>
        <sphereGeometry args={[r1 * 1.02, 12, 8]} />
        <meshStandardMaterial color={color} roughness={rough} />
      </mesh>
    </>
  )
}

const PIELES = ['#f1c7a3', '#d9a07a', '#b97a52', '#8d5a3b', '#f6d7bd']
const PELOS = ['#3b2616', '#1f1a17', '#7a4b24', '#c8923d', '#5b3a29']

export default function Character({
  state, emoji = '🙂', shirt = '#4f46e5', pants = '#1e3a8a', shoes = '#f8fafc',
  skin = PIELES[0], hair = PELOS[0], scale = 1, idle = false, backpack = true,
}) {
  const root = useRef()
  const cuerpo = useRef(), torso = useRef(), cabeza = useRef()
  // Articulaciones por lado (0 izquierda, 1 derecha), con refs de callback.
  const art = useRef({ muslo: [], rodilla: [], brazo: [], codo: [] })
  const fase = useRef(0)
  const parche = useMemo(() => parcheTexture(emoji), [emoji])
  const tGeo = useMemo(() => torsoGeo(), [])
  useEffect(() => () => { tGeo.dispose(); parche.dispose() }, [tGeo, parche])

  useFrame(({ clock }, dt) => {
    const s = state()
    if (!root.current) return
    root.current.position.set(s.x, s.y, s.z)
    const cur = root.current.rotation.y
    let d = (s.heading - cur) % (Math.PI * 2)
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    root.current.rotation.y = cur + d * Math.min(1, dt * 12)

    const v = Math.min(1, s.speed / 4.6)          // 1 = caminar
    const carrera = Math.max(0, (s.speed - 4.6) / 2.9) // 0..1 al correr
    fase.current += dt * (s.speed > 0.1 ? 3.2 + s.speed * 1.25 : 0)
    const f = fase.current
    const t = clock.getElapsedTime()
    const amp = 0.55 * v + 0.35 * carrera

    const { muslo, rodilla, brazo, codo } = art.current
    if (muslo.length < 2 || brazo.length < 2) return
    for (let i = 0; i < 2; i++) {
      const sg = i === 0 ? 1 : -1
      const ph = Math.sin(f) * sg
      if (s.air) {
        // En el aire: rodillas recogidas y brazos arriba.
        muslo[i].rotation.x = -0.9 + 0.2 * sg
        rodilla[i].rotation.x = 1.3
        brazo[i].rotation.x = -2.2
        brazo[i].rotation.z = sg * 0.3
        codo[i].rotation.x = -0.3
        continue
      }
      muslo[i].rotation.x = ph * amp
      // La rodilla solo se dobla hacia atrás, sobre todo cuando la pierna recoge.
      rodilla[i].rotation.x = Math.max(0, -Math.sin(f + 0.9) * sg) * (0.9 * v + 0.7 * carrera) + 0.05
      brazo[i].rotation.x = -ph * (0.5 * v + 0.45 * carrera)
      brazo[i].rotation.z = sg * (0.08 + (idle || v < 0.05 ? Math.sin(t * 1.5) * 0.02 : 0))
      // El codo acompaña al brazo: se dobla más cuando el brazo va delante.
      codo[i].rotation.x = -(0.12 + 0.18 * v + Math.max(0, ph) * 0.35 * v + 0.9 * carrera)
    }
    const quieto = idle || v < 0.05
    cuerpo.current.position.y = Math.abs(Math.cos(f)) * 0.04 * (v + carrera) + (quieto ? Math.sin(t * 2) * 0.006 : 0)
    torso.current.rotation.y = Math.sin(f) * 0.12 * v
    torso.current.rotation.x = 0.05 * v + 0.15 * carrera + (quieto ? Math.sin(t * 2) * 0.01 : 0)
    cabeza.current.rotation.y = -Math.sin(f) * 0.08 * v + (quieto ? Math.sin(t * 0.5) * 0.25 : 0)
  })

  // Proporciones (unidades ≈ metros).
  const HIP = 0.9, MUSLO = 0.43, PIERNA = 0.42
  const BRAZO = 0.3, ANTEBRAZO = 0.27
  return (
    <group ref={root} scale={scale}>
      <group ref={cuerpo}>
        {/* Piernas: cadera → muslo → rodilla → pierna → pie */}
        {[-0.095, 0.095].map((x, i) => (
          <group key={x} ref={el => { art.current.muslo[i] = el }} position={[x, HIP, 0]}>
            <Tramo len={MUSLO} r0={0.085} r1={0.065} color={pants} />
            <group ref={el => { art.current.rodilla[i] = el }} position={[0, -MUSLO, 0]}>
              <Tramo len={PIERNA} r0={0.062} r1={0.045} color={pants} />
              <mesh position={[0, -PIERNA - 0.035, 0.05]} castShadow>
                <boxGeometry args={[0.1, 0.07, 0.24]} />
                <meshStandardMaterial color={shoes} roughness={0.5} />
              </mesh>
              <mesh position={[0, -PIERNA - 0.068, 0.05]}>
                <boxGeometry args={[0.105, 0.015, 0.25]} />
                <meshStandardMaterial color="#374151" roughness={0.8} />
              </mesh>
            </group>
          </group>
        ))}
        {/* Pelvis: une las piernas con el torso sin abultar */}
        <mesh position={[0, HIP + 0.02, 0]} scale={[1.05, 0.55, 0.68]} castShadow>
          <sphereGeometry args={[0.155, 16, 10]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <group ref={torso} position={[0, HIP + 0.04, 0]}>
          <mesh geometry={tGeo} castShadow>
            <meshStandardMaterial color={shirt} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.158, 0.158, 0.04, 20]} />
            <meshStandardMaterial color="#3f2a1d" roughness={0.5} />
          </mesh>
          {/* Mochila con el parche del avatar */}
          {backpack && (
            <group position={[0, 0.34, -0.15]}>
              <mesh castShadow>
                <boxGeometry args={[0.26, 0.32, 0.12]} />
                <meshStandardMaterial color="#b45309" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.17, 0.01]} castShadow>
                <boxGeometry args={[0.27, 0.05, 0.13]} />
                <meshStandardMaterial color="#92400e" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.02, -0.062]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.085, 24]} />
                <meshStandardMaterial map={parche} roughness={0.7} />
              </mesh>
              {[-0.08, 0.08].map(x => (
                <mesh key={x} position={[x, 0.02, 0.1]} rotation={[0.1, 0, 0]}>
                  <boxGeometry args={[0.03, 0.34, 0.02]} />
                  <meshStandardMaterial color="#78350f" />
                </mesh>
              ))}
            </group>
          )}
          {/* Brazos: hombro → brazo → codo → antebrazo → mano */}
          {[-0.19, 0.19].map((x, i) => (
            <group key={x} ref={el => { art.current.brazo[i] = el }} position={[x, 0.455, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.058, 12, 8]} />
                <meshStandardMaterial color={shirt} roughness={0.8} />
              </mesh>
              <Tramo len={BRAZO} r0={0.058} r1={0.045} color={shirt} />
              <group ref={el => { art.current.codo[i] = el }} position={[0, -BRAZO, 0]}>
                <Tramo len={ANTEBRAZO} r0={0.042} r1={0.034} color={skin} rough={0.6} />
                <mesh position={[0, -ANTEBRAZO - 0.05, 0.005]} scale={[0.8, 1.1, 0.55]} castShadow>
                  <sphereGeometry args={[0.05, 12, 8]} />
                  <meshStandardMaterial color={skin} roughness={0.6} />
                </mesh>
              </group>
            </group>
          ))}
          {/* Cuello y cabeza */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.1, 12]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
          <group ref={cabeza} position={[0, 0.76, 0]}>
            <mesh scale={[0.92, 1.1, 1]} castShadow>
              <sphereGeometry args={[0.115, 24, 18]} />
              <meshStandardMaterial color={skin} roughness={0.55} />
            </mesh>
            {/* Mandíbula */}
            <mesh position={[0, -0.06, 0.02]} scale={[0.8, 0.6, 0.85]}>
              <sphereGeometry args={[0.1, 16, 10]} />
              <meshStandardMaterial color={skin} roughness={0.55} />
            </mesh>
            {/* Ojos: blanco, iris y brillo */}
            {[-0.04, 0.04].map(x => (
              <group key={x} position={[x, 0.015, 0.098]}>
                <mesh scale={[1, 0.75, 0.5]}>
                  <sphereGeometry args={[0.021, 12, 8]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, 0.009]}>
                  <sphereGeometry args={[0.011, 10, 8]} />
                  <meshStandardMaterial color="#3b2a1a" roughness={0.1} />
                </mesh>
                <mesh position={[0.004, 0.004, 0.018]}>
                  <sphereGeometry args={[0.003, 6, 4]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* Ceja */}
                <mesh position={[0, 0.03, 0.004]} rotation={[0, 0, x > 0 ? -0.15 : 0.15]}>
                  <boxGeometry args={[0.038, 0.008, 0.01]} />
                  <meshStandardMaterial color={hair} />
                </mesh>
              </group>
            ))}
            {/* Nariz */}
            <mesh position={[0, -0.018, 0.112]} rotation={[0.3, 0, 0]} scale={[0.7, 1, 0.9]}>
              <sphereGeometry args={[0.017, 10, 8]} />
              <meshStandardMaterial color={skin} roughness={0.55} />
            </mesh>
            {/* Boca: sonrisa */}
            <mesh position={[0, -0.058, 0.1]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.022, 0.0045, 6, 14, Math.PI]} />
              <meshStandardMaterial color="#9f3a3a" roughness={0.5} />
            </mesh>
            {/* Orejas */}
            {[-0.108, 0.108].map(x => (
              <mesh key={x} position={[x, 0, 0]} scale={[0.4, 1, 0.7]}>
                <sphereGeometry args={[0.03, 10, 8]} />
                <meshStandardMaterial color={skin} roughness={0.55} />
              </mesh>
            ))}
            {/* Pelo: casquete + flequillo */}
            <mesh position={[0, 0.02, -0.006]} scale={[0.97, 1.08, 1.04]} castShadow>
              <sphereGeometry args={[0.12, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.02, -0.02]} scale={[0.97, 1.05, 1]} rotation={[-0.5, 0, 0]}>
              <sphereGeometry args={[0.12, 24, 16, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.3]} />
              <meshStandardMaterial color={hair} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

