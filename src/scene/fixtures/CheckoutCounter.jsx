import { memo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'

const UNIT_GEO = new BoxGeometry(1, 1, 1)
const BODY_MAT = new MeshStandardMaterial({ color: '#0058a3', roughness: 0.65 })
const TOP_MAT = new MeshStandardMaterial({ color: '#e6e9e6', roughness: 0.5 })
const BELT_MAT = new MeshStandardMaterial({ color: '#2c3438', roughness: 0.9 })

/** Checkout desk with a belt and a lit number post. */
function CheckoutCounter({ position, rotationY = 0, size }) {
  const [w, h, d] = size

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={UNIT_GEO} material={BODY_MAT} position={[0, h / 2, 0]} scale={[w, h, d]} castShadow receiveShadow />
      <mesh geometry={UNIT_GEO} material={TOP_MAT} position={[0, h + 0.03, 0]} scale={[w + 0.08, 0.06, d + 0.08]} castShadow />
      <mesh geometry={UNIT_GEO} material={BELT_MAT} position={[0, h + 0.08, 0]} scale={[w - 0.3, 0.03, d * 0.55]} />

      <mesh position={[w / 2 - 0.2, h + 1.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.1, 8]} />
        <meshStandardMaterial color="#c3ccd0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[w / 2 - 0.2, h + 2.0, 0]}>
        <boxGeometry args={[0.42, 0.42, 0.08]} />
        <meshStandardMaterial color="#ffdb00" emissive="#ffdb00" emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default memo(CheckoutCounter)
