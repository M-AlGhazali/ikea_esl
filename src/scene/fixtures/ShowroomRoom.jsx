import { memo } from 'react'
import { Line } from '@react-three/drei'
import { zoneCenter, zoneSize } from '../../data/storeLayout.js'

/**
 * A showroom vignette footprint: a warm rug, two partial walls on the back and
 * left edges, and a thin accent outline on the floor. Furniture is placed
 * separately by Products, so this only has to define the room, not fill it.
 */
const WALL_H = 2.4

/** Closed rectangle in the XZ plane, for the floor outline. */
const outlinePoints = (w, d) => [
  [-w / 2, 0, -d / 2],
  [w / 2, 0, -d / 2],
  [w / 2, 0, d / 2],
  [-w / 2, 0, d / 2],
  [-w / 2, 0, -d / 2],
]

function ShowroomRoom({ zone }) {
  const [cx, cy, cz] = zoneCenter(zone)
  const [w, d] = zoneSize(zone)
  const rugW = Math.max(1, w - 1.6)
  const rugD = Math.max(1, d - 1.6)

  return (
    <group position={[cx, cy, cz]}>
      {/* floor tint + rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[w - 0.4, d - 0.4]} />
        <meshStandardMaterial color="#efeae2" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[rugW, rugD]} />
        <meshStandardMaterial color="#d7c9b4" roughness={1} />
      </mesh>

      {/* accent outline, so the zone still reads from a plan view */}
      <Line
        points={outlinePoints(w - 0.4, d - 0.4)}
        color={zone.accent}
        lineWidth={1.4}
        transparent
        opacity={0.65}
        position={[0, 0.03, 0]}
      />

      {/* two partial walls give the vignette a corner without boxing it in */}
      <mesh position={[0, WALL_H / 2, -d / 2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.6, WALL_H, 0.14]} />
        <meshStandardMaterial color="#f2efe9" roughness={0.95} />
      </mesh>
      <mesh position={[-w / 2 + 0.1, WALL_H / 2, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.14, WALL_H, d - 2.2]} />
        <meshStandardMaterial color="#e9e4dc" roughness={0.95} />
      </mesh>

      {/* accent skirting along the back wall */}
      <mesh position={[0, 0.08, -d / 2 + 0.02]}>
        <boxGeometry args={[w - 0.6, 0.16, 0.04]} />
        <meshStandardMaterial color={zone.accent} emissive={zone.accent} emissiveIntensity={0.25} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default memo(ShowroomRoom)
