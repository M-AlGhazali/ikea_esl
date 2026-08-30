import { memo, useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { BoxGeometry, MeshStandardMaterial } from 'three'

const UNIT_GEO = new BoxGeometry(1, 1, 1)
const UPRIGHT_MAT = new MeshStandardMaterial({ color: '#5b6d75', roughness: 0.5, metalness: 0.4 })
const BEAM_MAT = new MeshStandardMaterial({ color: '#ffb020', roughness: 0.55, metalness: 0.2 })
const DECK_MAT = new MeshStandardMaterial({ color: '#a9b3b6', roughness: 0.85 })

/**
 * Self-serve warehouse racking: heavy uprights, orange safety beams and stacked
 * flat-pack cartons. This is the visual signature that separates the right-hand
 * half of the ground floor from the market hall.
 */
function WarehouseRack({ position, rotationY = 0, size, shelves = 3 }) {
  const [w, h, d] = size

  const levels = useMemo(
    () => Array.from({ length: shelves }, (_, i) => 0.35 + (i * (h - 0.6)) / Math.max(1, shelves - 1)),
    [h, shelves],
  )

  const bays = Math.max(2, Math.round(w / 2.6))

  const uprights = useMemo(
    () => Array.from({ length: bays + 1 }, (_, i) => -w / 2 + (i * w) / bays),
    [bays, w],
  )

  // Cartons live on the upper levels only; the ground level stays clear so the
  // aisle reads as walkable.
  const cartons = useMemo(() => {
    const out = []
    levels.forEach((y, li) => {
      if (li === 0) return
      for (let b = 0; b < bays; b++) {
        const bx = -w / 2 + (b + 0.5) * (w / bays)
        for (let k = 0; k < 2; k++) {
          out.push({
            key: `${li}-${b}-${k}`,
            position: [bx + (k - 0.5) * 0.95, y + 0.28, 0],
            scale: [0.85, 0.5, d - 0.35],
          })
        }
      }
    })
    return out
  }, [levels, bays, w, d])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {uprights.map((x) => (
        <mesh key={x} geometry={UNIT_GEO} material={UPRIGHT_MAT} position={[x, h / 2, 0]} scale={[0.14, h, d]} castShadow />
      ))}

      {levels.map((y) => (
        <group key={y}>
          <mesh geometry={UNIT_GEO} material={DECK_MAT} position={[0, y, 0]} scale={[w, 0.07, d - 0.1]} receiveShadow />
          {[-d / 2 + 0.08, d / 2 - 0.08].map((z) => (
            <mesh key={z} geometry={UNIT_GEO} material={BEAM_MAT} position={[0, y + 0.1, z]} scale={[w, 0.12, 0.08]} />
          ))}
        </group>
      ))}

      <Instances limit={cartons.length} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c8a878" roughness={0.95} />
        {cartons.map((c) => (
          <Instance key={c.key} position={c.position} scale={c.scale} />
        ))}
      </Instances>
    </group>
  )
}

export default memo(WarehouseRack)
