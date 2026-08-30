import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { eslTexture } from '../lib/eslTexture.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

/**
 * A shelf-edge Electronic Shelf Label.
 *
 * The e-paper face carries the canvas texture; the "powered" cue is a blue
 * emissive strip on the housing, which brightens on hover and pulses when the
 * label is selected. That strip is what separates this from a printed card at
 * a glance, so it stays lit even at rest.
 */
// 16:10, matching the 512x320 texture. Sized at the large end of real ESLs so
// the tag stays legible when the demo is shown on a projector.
const W = 0.224
const H = 0.14

function ESLLabel({ placement, selected, hovered }) {
  const { product, location } = placement
  const texture = useMemo(() => eslTexture(product, location), [product, location])
  const selectPlacement = useStoreState((s) => s.selectPlacement)
  const setHovered = useStoreState((s) => s.setHovered)
  const edge = useRef()

  useFrame((state, dt) => {
    if (!edge.current) return
    const base = selected ? 3.4 : hovered ? 1.9 : 0.85
    const pulse = selected ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.25 : 1
    edge.current.emissiveIntensity = damp(edge.current.emissiveIntensity, base * pulse, 8, dt)
  })

  return (
    <group
      position={location.labelPosition}
      rotation={[0, location.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation()
        selectPlacement(placement.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(placement.id)
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Housing. Kept a clear 3 mm behind the screen: at demo camera distances
          a sub-millimetre gap z-fights and the face renders black. */}
      <mesh castShadow position={[0, 0, -0.012]}>
        <boxGeometry args={[W + 0.014, H + 0.014, 0.02]} />
        <meshStandardMaterial color="#1b232a" roughness={0.45} metalness={0.2} />
      </mesh>

      {/* powered edge */}
      <mesh position={[0, -H / 2 - 0.006, -0.01]}>
        <boxGeometry args={[W + 0.014, 0.006, 0.022]} />
        <meshStandardMaterial
          ref={edge}
          color="#1f7ae0"
          emissive="#1f7ae0"
          emissiveIntensity={0.85}
          toneMapped={false}
        />
      </mesh>

      {/* e-paper face */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={texture} roughness={0.62} metalness={0} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default memo(ESLLabel)
