import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { STORE } from '../data/storeLayout.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'
import FloorGroup from './FloorGroup.jsx'

/**
 * The building itself: two slabs, an atrium void through the upper one, four
 * walls and a roof.
 *
 * Cutaway is animated opacity plus an exploded lift rather than clipping planes
 * — cheaper, smoother, and it reads better on a projector. The two walls
 * nearest the default camera fade first so the interior is legible immediately.
 */

/** The second-floor slab is four rectangles around the atrium void. */
function slabRects() {
  const { x, z, atrium } = STORE
  return [
    { pos: [(x[0] + atrium.x[0]) / 2, (z[0] + z[1]) / 2], size: [atrium.x[0] - x[0], z[1] - z[0]] },
    { pos: [(x[1] + atrium.x[1]) / 2, (z[0] + z[1]) / 2], size: [x[1] - atrium.x[1], z[1] - z[0]] },
    { pos: [(atrium.x[0] + atrium.x[1]) / 2, (z[0] + atrium.z[0]) / 2], size: [atrium.x[1] - atrium.x[0], atrium.z[0] - z[0]] },
    { pos: [(atrium.x[0] + atrium.x[1]) / 2, (z[1] + atrium.z[1]) / 2], size: [atrium.x[1] - atrium.x[0], z[1] - atrium.z[1]] },
  ]
}

/** A wall whose opacity is driven by the cutaway slider. */
function CutawayWall({ position, rotation, size, openAt }) {
  const mat = useRef()
  const cutaway = useStoreState((s) => s.cutaway)

  useFrame((_, dt) => {
    if (!mat.current) return
    const target = cutaway <= openAt ? 1 : Math.max(0, 1 - (cutaway - openAt) / (1 - openAt))
    mat.current.opacity = damp(mat.current.opacity, target, 5, dt)
    mat.current.visible = mat.current.opacity > 0.02
  })

  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial
        ref={mat}
        color="#e9eef0"
        roughness={0.92}
        metalness={0}
        side={2}
        transparent
        opacity={1}
        depthWrite={false}
      />
    </mesh>
  )
}

function AtriumRailing() {
  const { atrium, secondY } = STORE
  const h = 1.05
  const y = secondY + h / 2
  const w = atrium.x[1] - atrium.x[0]
  const d = atrium.z[1] - atrium.z[0]

  const rails = [
    { p: [0, y, atrium.z[0]], s: [w, h, 0.06] },
    { p: [0, y, atrium.z[1]], s: [w, h, 0.06] },
    { p: [atrium.x[0], y, 0], s: [0.06, h, d] },
    { p: [atrium.x[1], y, 0], s: [0.06, h, d] },
  ]

  return (
    <group>
      {rails.map((r, i) => (
        <mesh key={i} position={r.p}>
          <boxGeometry args={r.s} />
          <meshStandardMaterial color="#9fb3b8" roughness={0.25} metalness={0.4} transparent opacity={0.32} />
        </mesh>
      ))}
      {rails.map((r, i) => (
        <mesh key={`cap-${i}`} position={[r.p[0], secondY + h, r.p[2]]}>
          <boxGeometry args={[r.s[0] === 0.06 ? 0.09 : r.s[0], 0.055, r.s[2] === 0.06 ? 0.09 : r.s[2]]} />
          <meshStandardMaterial color="#1f7ae0" emissive="#1f7ae0" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Long ceiling light coves, the cheapest way to sell "retail interior". */
function CeilingCoves({ y }) {
  const depth = STORE.depth - 6
  return (
    <group>
      {[-16, -9, 9, 16].map((x) => (
        <mesh key={x} position={[x, y, 0]}>
          <boxGeometry args={[0.5, 0.06, depth]} />
          <meshStandardMaterial color="#ffffff" emissive="#dff2f7" emissiveIntensity={0.55} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function StoreShell() {
  const rects = useMemo(slabRects, [])
  const roof = useRef()
  const roofMat = useRef()

  const cutaway = useStoreState((s) => s.cutaway)
  const floorFilter = useStoreState((s) => s.floorFilter)

  const { width, depth, groundY, secondY, slabThickness, roofY, groundCeilingY } = STORE

  useFrame((_, dt) => {
    // The roof drifts up and fades, so the exploded view stays uncluttered.
    if (roof.current) roof.current.position.y = damp(roof.current.position.y, roofY + cutaway * 13, 4, dt)
    if (roofMat.current) {
      roofMat.current.opacity = damp(roofMat.current.opacity, Math.max(0, 1 - cutaway * 1.5), 4, dt)
      roofMat.current.visible = roofMat.current.opacity > 0.03
    }
  })

  return (
    <group>
      {/* --- ground level ---------------------------------------------------- */}
      <group visible={floorFilter !== 'second'}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]} receiveShadow>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color="#dfe4e3" roughness={0.78} metalness={0.02} />
        </mesh>
        <CeilingCoves y={groundCeilingY - 0.15} />
      </group>

      {/* --- second level, lifted by the cutaway slider ----------------------- */}
      <FloorGroup floor={1}>
        <group position={[0, secondY - slabThickness / 2, 0]}>
          {rects.map((r, i) => (
            <mesh key={i} position={[r.pos[0], 0, r.pos[1]]} castShadow receiveShadow>
              <boxGeometry args={[r.size[0], slabThickness, r.size[1]]} />
              <meshStandardMaterial color="#e6ebea" roughness={0.8} />
            </mesh>
          ))}
          {/* accent trim on the slab edge, so the lifted plate reads as a floor */}
          <mesh position={[0, -slabThickness / 2 - 0.02, 0]}>
            <boxGeometry args={[width + 0.1, 0.05, depth + 0.1]} />
            <meshStandardMaterial color="#1f7ae0" emissive="#1f7ae0" emissiveIntensity={0.35} toneMapped={false} />
          </mesh>
        </group>

        <AtriumRailing />
      </FloorGroup>

      {/* --- envelope --------------------------------------------------------- */}
      <CutawayWall position={[0, roofY / 2, STORE.z[0]]} rotation={[0, 0, 0]} size={[width, roofY]} openAt={0.88} />
      <CutawayWall position={[STORE.x[0], roofY / 2, 0]} rotation={[0, Math.PI / 2, 0]} size={[depth, roofY]} openAt={0.88} />
      <CutawayWall position={[0, roofY / 2, STORE.z[1]]} rotation={[0, Math.PI, 0]} size={[width, roofY]} openAt={0.06} />
      <CutawayWall position={[STORE.x[1], roofY / 2, 0]} rotation={[0, -Math.PI / 2, 0]} size={[depth, roofY]} openAt={0.06} />

      <mesh ref={roof} position={[0, roofY + cutaway * 13, 0]} castShadow>
        <boxGeometry args={[width + 1.2, 0.5, depth + 1.2]} />
        <meshStandardMaterial ref={roofMat} color="#c9d4d6" roughness={0.9} transparent opacity={1} />
      </mesh>
    </group>
  )
}

export default memo(StoreShell)
