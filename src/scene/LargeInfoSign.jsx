import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { signPaperTexture, signPriceTexture } from '../lib/signTexture.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'
import { STORE } from '../data/storeLayout.js'

/**
 * The large hanging showroom sign: a printed information sheet with an
 * ELECTRONIC price block at the bottom.
 *
 * These are two separate meshes on purpose. The paper body is matte and takes
 * no emission; the red block is a screen with an emissive map and a hardware
 * bezel. Merging them into one texture would lose the contrast the whole hybrid
 * signage concept rests on.
 */
const PW = 0.9
const PH = 1.05
const SW = 0.9
const SH = 0.33

function LargeInfoSign({ placement, selected, hovered }) {
  const { product, location } = placement
  const paper = useMemo(() => signPaperTexture(product), [product])
  const price = useMemo(() => signPriceTexture(product), [product])
  const selectPlacement = useStoreState((s) => s.selectPlacement)
  const setHovered = useStoreState((s) => s.setHovered)
  const screen = useRef()

  const [x, y, z] = location.labelPosition
  const ceilingY = location.floor === 0 ? STORE.groundCeilingY : STORE.secondCeilingY
  const topOfSign = y + SH / 2 + PH
  const cableLength = Math.max(0.15, ceilingY - topOfSign)

  useFrame((state, dt) => {
    if (!screen.current) return
    const base = selected ? 1.6 : hovered ? 1.0 : 0.62
    const pulse = selected ? 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.2 : 1
    screen.current.emissiveIntensity = damp(screen.current.emissiveIntensity, base * pulse, 7, dt)
  })

  return (
    <group
      position={[x, y, z]}
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
      {/* suspension cables up to the ceiling */}
      {[-PW / 2 + 0.09, PW / 2 - 0.09].map((cx) => (
        <mesh key={cx} position={[cx, topOfSign - y + cableLength / 2, 0]}>
          <cylinderGeometry args={[0.004, 0.004, cableLength, 6]} />
          <meshStandardMaterial color="#9fb3b8" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* printed information sheet */}
      <mesh position={[0, SH / 2 + PH / 2, 0]} castShadow>
        <planeGeometry args={[PW, PH]} />
        <meshStandardMaterial map={paper} roughness={0.95} metalness={0} side={2} />
      </mesh>

      {/* hardware bezel behind the screen */}
      <mesh position={[0, 0, -0.008]}>
        <boxGeometry args={[SW + 0.03, SH + 0.03, 0.016]} />
        <meshStandardMaterial color="#151b1f" roughness={0.4} metalness={0.35} />
      </mesh>

      {/* the electronic price panel */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[SW, SH]} />
        <meshStandardMaterial
          ref={screen}
          map={price}
          emissiveMap={price}
          emissive="#ffffff"
          emissiveIntensity={0.62}
          roughness={0.26}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {/* status pip on the bezel, matching the shelf-edge ESL cue */}
      <mesh position={[SW / 2 + 0.008, -SH / 2 + 0.03, 0]}>
        <boxGeometry args={[0.012, 0.05, 0.014]} />
        <meshStandardMaterial color="#1f7ae0" emissive="#1f7ae0" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default memo(LargeInfoSign)
