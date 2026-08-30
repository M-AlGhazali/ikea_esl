import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { ZONES, zoneCenter, zoneSize, STORE } from '../data/storeLayout.js'
import FloorGroup from './FloorGroup.jsx'
import { Vector3 } from 'three'

const WORLD_POS = new Vector3()

/**
 * Zone floor tints, wide circulation paths and hanging zone signs — the
 * wayfinding layer that makes the model read as a retail store rather than a
 * grid of shelves.
 *
 * drei Text is used without a `font` prop on purpose: passing a font URL would
 * add a network fetch, and the demo has to work offline.
 */
const SIGN_HEIGHT = 3.0

// Wayfinding signs are for reading the store as a whole; once the camera moves
// in to inspect a product they only get in the way, so they fade out.
const FADE_NEAR = 11
const FADE_FAR = 20

function ZoneMarker({ zone }) {
  const [cx, cy, cz] = zoneCenter(zone)
  const [w, d] = zoneSize(zone)
  const signWidth = Math.min(4.6, Math.max(2.6, w * 0.72))
  const sign = useRef()

  useFrame(({ camera }) => {
    if (!sign.current) return
    const dist = camera.position.distanceTo(sign.current.getWorldPosition(WORLD_POS))
    const t = Math.min(1, Math.max(0, (dist - FADE_NEAR) / (FADE_FAR - FADE_NEAR)))
    sign.current.visible = t > 0.02
    sign.current.scale.setScalar(0.6 + t * 0.4)
  })

  return (
    <group>
      {zone.kind !== 'showroom' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, cy + 0.008, cz]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial
            color={zone.kind === 'warehouse' ? '#eceef0' : zone.kind === 'checkout' ? '#e7eef5' : '#f2f4f5'}
            roughness={0.95}
          />
        </mesh>
      )}

      <group ref={sign} position={[cx, cy + SIGN_HEIGHT, cz]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 1.2, 6]} />
          <meshStandardMaterial color="#9fb3b8" metalness={0.6} roughness={0.35} />
        </mesh>
        <Billboard follow>
          <mesh>
            <planeGeometry args={[signWidth, 0.5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} side={2} />
          </mesh>
          <mesh position={[0, -0.22, 0.005]}>
            <planeGeometry args={[signWidth, 0.05]} />
            <meshStandardMaterial
              color={zone.accent}
              emissive={zone.accent}
              emissiveIntensity={0.3}
              toneMapped={false}
              side={2}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.22}
            maxWidth={signWidth - 0.3}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#101820"
          >
            {zone.label}
          </Text>
        </Billboard>
      </group>
    </group>
  )
}

const MemoZoneMarker = memo(ZoneMarker)

function ZoneMarkers() {
  return (
    <>
      {[0, 1].map((floor) => (
        <FloorGroup key={floor} floor={floor}>
          {ZONES.filter((z) => z.floor === floor).map((zone) => (
            <MemoZoneMarker key={zone.id} zone={zone} />
          ))}

          {/* Circulation: the customer route through each level. */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, (floor === 0 ? 0 : STORE.secondY) + 0.014, 0]} receiveShadow>
            <planeGeometry args={[4.6, STORE.depth - 1]} />
            <meshStandardMaterial color="#f5f7f5" roughness={0.9} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, (floor === 0 ? 0 : STORE.secondY) + 0.014, floor === 0 ? 8 : 6]}
            receiveShadow
          >
            <planeGeometry args={[STORE.width - 2, 3.4]} />
            <meshStandardMaterial color="#f5f7f5" roughness={0.9} />
          </mesh>
        </FloorGroup>
      ))}
    </>
  )
}

export default memo(ZoneMarkers)
