import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { STORE } from '../data/storeLayout.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

/**
 * The IKEA cue: a blue outer skin and a yellow entrance canopy. Colour and
 * massing only — no logos or wordmarks. It fades out with the cutaway slider so
 * it never gets in the way of reading the interior.
 */
function Exterior() {
  const cutaway = useStoreState((s) => s.cutaway)
  const skin = useRef()
  const band = useRef()
  const { width, depth, roofY } = STORE

  useFrame((_, dt) => {
    for (const mat of [skin.current, band.current]) {
      if (!mat) continue
      mat.opacity = damp(mat.opacity, Math.max(0, 1 - cutaway * 1.6), 4, dt)
      mat.visible = mat.opacity > 0.04
    }
  })

  return (
    <group>
      {/* Blue outer skin. Front faces, so a sealed store reads as the real
          thing from outside; it fades away as the cutaway slider opens. */}
      <mesh position={[0, roofY / 2, 0]}>
        <boxGeometry args={[width + 0.9, roofY, depth + 0.9]} />
        <meshStandardMaterial ref={skin} color="#0058a3" roughness={0.85} side={2} transparent opacity={1} />
      </mesh>

      {/* yellow band near the parapet, the other half of the exterior cue */}
      <mesh position={[0, roofY - 1.1, 0]}>
        <boxGeometry args={[width + 1.05, 1.1, depth + 1.05]} />
        <meshStandardMaterial ref={band} color="#ffdb00" roughness={0.8} side={2} transparent opacity={1} />
      </mesh>

      {/* yellow entrance canopy */}
      <mesh position={[0, 4.5, STORE.z[1] + 1.8]} castShadow>
        <boxGeometry args={[15, 0.55, 3.6]} />
        <meshStandardMaterial color="#ffdb00" roughness={0.55} />
      </mesh>
      {[-7, 7].map((x) => (
        <mesh key={x} position={[x, 2.25, STORE.z[1] + 3.2]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 4.5, 10]} />
          <meshStandardMaterial color="#d9d9d9" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}

      {/* storefront glazing */}
      <mesh position={[0, 2.2, STORE.z[1] + 0.5]}>
        <boxGeometry args={[13, 4.3, 0.14]} />
        <meshPhysicalMaterial
          color="#bfe4ec"
          roughness={0.06}
          metalness={0}
          transmission={0.85}
          thickness={0.4}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* forecourt apron and entrance mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, STORE.z[1] + 9]} receiveShadow>
        <planeGeometry args={[width + 18, 18]} />
        <meshStandardMaterial color="#e9ecef" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, STORE.z[1] + 2.6]}>
        <planeGeometry args={[12, 3]} />
        <meshStandardMaterial color="#ffdb00" roughness={0.9} />
      </mesh>
    </group>
  )
}

export default memo(Exterior)
