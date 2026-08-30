import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import { STORE, secondFloorLift } from '../data/storeLayout.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

/**
 * The escalator through the atrium. It doubles as the landmark that tells you
 * where you are when you fly the camera inside, and as the visible connection
 * between the two plates once the cutaway slider lifts the upper floor apart.
 */
const RUN_START_Z = 3.6
const RUN_END_Z = -3.6
const STEP_COUNT = 22
const RUN = RUN_START_Z - RUN_END_Z

function Escalator() {
  const cutaway = useStoreState((s) => s.cutaway)
  const floorFilter = useStoreState((s) => s.floorFilter)
  const truss = useRef()
  const rails = useRef([])
  const stepGroup = useRef()
  const topLanding = useRef()
  const rise = useRef(STORE.secondY)

  const steps = useMemo(
    () => Array.from({ length: STEP_COUNT }, (_, i) => (i + 0.5) / STEP_COUNT),
    [],
  )

  useFrame((_, dt) => {
    const target = STORE.secondY + secondFloorLift(cutaway)
    rise.current = damp(rise.current, target, 4, dt)

    const r = rise.current
    const length = Math.hypot(r, RUN)
    const angle = Math.atan2(r, RUN)
    const midY = r / 2
    const midZ = (RUN_START_Z + RUN_END_Z) / 2

    if (truss.current) {
      truss.current.position.set(0, midY, midZ)
      truss.current.rotation.x = angle
      truss.current.scale.z = length
    }
    for (const rail of rails.current) {
      if (!rail) continue
      rail.position.y = midY + rail.userData.yOffset
      rail.position.z = midZ
      rail.rotation.x = angle
      rail.scale.z = length
    }
    if (stepGroup.current) {
      stepGroup.current.children.forEach((child, i) => {
        const t = steps[i]
        if (t == null) return
        child.position.set(0, 0.16 + r * t, RUN_START_Z - RUN * t)
      })
    }
    if (topLanding.current) topLanding.current.position.y = r + 0.08
  })

  return (
    <group visible={floorFilter === 'all'}>
      {/* inclined truss — scaled along Z each frame */}
      <mesh ref={truss} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.3, 1]} />
        <meshStandardMaterial color="#8d9aa1" metalness={0.55} roughness={0.35} />
      </mesh>

      {/* steps */}
      <group ref={stepGroup}>
        {steps.map((_, i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[2.2, 0.06, 0.28]} />
            <meshStandardMaterial color="#c8d2d6" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* glass balustrades with a cyan handrail */}
      {[-1.35, 1.35].map((x, i) => (
        <group key={x}>
          <mesh
            ref={(el) => {
              if (el) {
                el.userData.yOffset = 0.55
                rails.current[i * 2] = el
              }
            }}
            position={[x, 0, 0]}
          >
            <boxGeometry args={[0.05, 1.0, 1]} />
            <meshPhysicalMaterial
              color="#a9dfe6"
              roughness={0.05}
              transmission={0.9}
              thickness={0.2}
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) {
                el.userData.yOffset = 1.08
                rails.current[i * 2 + 1] = el
              }
            }}
            position={[x, 0, 0]}
          >
            <boxGeometry args={[0.09, 0.07, 1]} />
            <meshStandardMaterial color="#35e0d4" emissive="#35e0d4" emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* landings */}
      <mesh position={[0, 0.08, RUN_START_Z + 1.1]} receiveShadow>
        <boxGeometry args={[2.6, 0.16, 2.2]} />
        <meshStandardMaterial color="#b9c4c9" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh ref={topLanding} position={[0, STORE.secondY + 0.08, RUN_END_Z - 1.1]} receiveShadow>
        <boxGeometry args={[2.6, 0.16, 2.2]} />
        <meshStandardMaterial color="#b9c4c9" metalness={0.4} roughness={0.45} />
      </mesh>
    </group>
  )
}

export default memo(Escalator)
