import { memo, useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'

const UNIT_GEO = new BoxGeometry(1, 1, 1)
const TOP_MAT = new MeshStandardMaterial({ color: '#e8e3d9', roughness: 0.8 })
const LEG_MAT = new MeshStandardMaterial({ color: '#b3bcbf', roughness: 0.5, metalness: 0.35 })
const BIN_MAT = new MeshStandardMaterial({ color: '#cfd8d6', roughness: 0.85 })

/**
 * Open bin table for the self-serve market-hall zones: a top surface, four legs
 * and a grid of shallow bins, with a front price rail for the ESL.
 */
function BinTable({ position, rotationY = 0, size }) {
  const [w, h, d] = size
  const cols = Math.max(2, Math.round(w / 0.7))

  const bins = useMemo(() => {
    const out = []
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < 2; r++) {
        out.push({
          key: `${c}-${r}`,
          position: [-w / 2 + (c + 0.5) * (w / cols), h + 0.09, -d / 4 + (r * d) / 2],
          scale: [(w / cols) * 0.86, 0.18, (d / 2) * 0.82],
        })
      }
    }
    return out
  }, [cols, w, h, d])

  const legs = [
    [-w / 2 + 0.1, -d / 2 + 0.1],
    [w / 2 - 0.1, -d / 2 + 0.1],
    [-w / 2 + 0.1, d / 2 - 0.1],
    [w / 2 - 0.1, d / 2 - 0.1],
  ]

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={UNIT_GEO} material={TOP_MAT} position={[0, h, 0]} scale={[w, 0.06, d]} castShadow receiveShadow />

      {legs.map(([x, z]) => (
        <mesh key={`${x}:${z}`} geometry={UNIT_GEO} material={LEG_MAT} position={[x, h / 2, z]} scale={[0.06, h, 0.06]} />
      ))}

      {bins.map((b) => (
        <mesh key={b.key} geometry={UNIT_GEO} material={BIN_MAT} position={b.position} scale={b.scale} castShadow />
      ))}

      <mesh geometry={UNIT_GEO} material={LEG_MAT} position={[0, h - 0.06, d / 2 - 0.01]} scale={[w, 0.07, 0.02]} />
    </group>
  )
}

export default memo(BinTable)
