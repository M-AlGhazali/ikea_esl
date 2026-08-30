import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { damp } from '../lib/anim.js'

/**
 * Floor ring plus a soft beam under the selected product. The ring is sized
 * from the product footprint so it hugs a vase as closely as it hugs a sofa.
 */
function SelectionHalo({ selected, product }) {
  const ring = useRef()
  const ringMat = useRef()
  const beamMat = useRef()

  const footprint = Math.max(product.dimensions.width, product.dimensions.depth) / 100
  const r = Math.max(0.28, footprint * 0.75)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (ringMat.current) {
      ringMat.current.opacity = damp(ringMat.current.opacity, selected ? 0.9 : 0.35, 8, dt)
    }
    if (beamMat.current) {
      beamMat.current.opacity = damp(beamMat.current.opacity, selected ? 0.07 : 0.03, 8, dt)
    }
    if (ring.current) {
      const s = selected ? 1 + Math.sin(t * 3) * 0.035 : 1
      ring.current.scale.setScalar(s)
      ring.current.rotation.z = t * 0.35
    }
  })

  return (
    <group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[r, r + 0.06, 48, 1, 0, Math.PI * 1.55]} />
        <meshBasicMaterial
          ref={ringMat}
          color="#1f7ae0"
          transparent
          opacity={0.4}
          toneMapped={false}
          depthWrite={false}
          side={2}
        />
      </mesh>

      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[r * 0.95, r * 0.95, 2.2, 24, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          color="#1f7ae0"
          transparent
          opacity={0.05}
          toneMapped={false}
          depthWrite={false}
          side={2}
        />
      </mesh>
    </group>
  )
}

export default memo(SelectionHalo)
