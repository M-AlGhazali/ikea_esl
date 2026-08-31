import { memo, useMemo } from 'react'
import { storefrontSignTexture } from '../lib/brandTexture.js'
import { STORE } from '../data/storeLayout.js'

/**
 * The fascia above the entrance. It sits just outside the +Z wall so it never
 * occludes the interior, and it stays opaque through the cutaway — once the
 * building opens up, this is the only thing still saying whose store it is.
 */
const SIGN_W = 16
const SIGN_H = 3.2
const SIGN_Y = 6.7

function StorefrontSign() {
  const texture = useMemo(() => storefrontSignTexture(), [])
  const z = STORE.z[1] + 0.62

  return (
    <group position={[0, SIGN_Y, z]}>
      {/* returned edge, so the panel reads as a built fascia rather than a decal */}
      <mesh position={[0, 0, -0.14]} castShadow>
        <boxGeometry args={[SIGN_W + 0.24, SIGN_H + 0.24, 0.28]} />
        <meshStandardMaterial color="#00457f" roughness={0.75} />
      </mesh>

      <mesh>
        <planeGeometry args={[SIGN_W, SIGN_H]} />
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0} />
      </mesh>

      {/* wash from the canopy lights below */}
      <pointLight position={[0, -1.6, 1.6]} intensity={2.2} distance={7} color="#fff6d8" />
    </group>
  )
}

export default memo(StorefrontSign)
