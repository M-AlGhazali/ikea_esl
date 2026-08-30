import { memo, useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'
import { Instance, Instances } from '@react-three/drei'
import { shelfBoardHeights } from '../../data/storeLayout.js'

// Shared by every shelf unit in the store, so 20+ runs cost almost nothing.
const UNIT_GEO = new BoxGeometry(1, 1, 1)
const FRAME_MAT = new MeshStandardMaterial({ color: '#cfd6d6', roughness: 0.55, metalness: 0.25 })
const BOARD_MAT = new MeshStandardMaterial({ color: '#efeae1', roughness: 0.8 })
const BACK_MAT = new MeshStandardMaterial({ color: '#e2e6e6', roughness: 0.95 })
const LIP_MAT = new MeshStandardMaterial({ color: '#b9c3c6', roughness: 0.5, metalness: 0.3 })

// Muted retail palette for the filler stock. These are scenery, not catalog
// items, so they stay desaturated and never compete with a selected product.
const STOCK_COLORS = ['#c9c2b4', '#a8b5b8', '#d8cfbe', '#b6bfae', '#c6b7a4', '#9fb0b6']

/** Deterministic pseudo-random in [0,1), so the store looks the same every load. */
function rand(seed) {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

/**
 * A market-hall shelf run. The front lip is the price rail that shelf-edge ESLs
 * clip onto, so its height has to match the labelPosition values in the catalog.
 *
 * @param {[number,number,number]} position base of the unit
 * @param {[number,number,number]} size [width, height, depth]
 */
function ShelfUnit({ position, rotationY = 0, size, shelves = 4, filled = true }) {
  const [w, h, d] = size
  const boards = useMemo(() => shelfBoardHeights(h, shelves), [h, shelves])

  const stock = useMemo(() => {
    if (!filled) return []
    const out = []
    const seedBase = Math.abs(position[0] * 7.3 + position[2] * 3.1)
    const perBoard = Math.max(3, Math.floor(w / 0.55))

    boards.forEach((y, bi) => {
      for (let i = 0; i < perBoard; i++) {
        const r = rand(seedBase + bi * 13 + i * 3)
        if (r < 0.22) continue // gaps, so the run does not look machine-packed
        const bw = 0.2 + r * 0.24
        const bh = 0.16 + rand(seedBase + bi * 5 + i) * 0.22
        out.push({
          key: `${bi}-${i}`,
          position: [-w / 2 + 0.12 + i * ((w - 0.24) / (perBoard - 1)), y + 0.03 + bh / 2, 0],
          scale: [bw, bh, d * 0.6],
          color: STOCK_COLORS[Math.floor(rand(seedBase + i * 17 + bi) * STOCK_COLORS.length)],
        })
      }
    })
    return out
  }, [boards, w, d, filled, position])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-w / 2 + 0.04, w / 2 - 0.04].map((x) => (
        <mesh key={x} geometry={UNIT_GEO} material={FRAME_MAT} position={[x, h / 2, 0]} scale={[0.08, h, d]} castShadow />
      ))}

      <mesh
        geometry={UNIT_GEO}
        material={BACK_MAT}
        position={[0, h / 2, -d / 2 + 0.02]}
        scale={[w, h, 0.04]}
        receiveShadow
      />

      {boards.map((y) => (
        <mesh
          key={`b-${y}`}
          geometry={UNIT_GEO}
          material={BOARD_MAT}
          position={[0, y, 0]}
          scale={[w - 0.1, 0.05, d - 0.04]}
          receiveShadow
        />
      ))}

      {boards.map((y) => (
        <mesh
          key={`l-${y}`}
          geometry={UNIT_GEO}
          material={LIP_MAT}
          position={[0, y + 0.05, d / 2 - 0.02]}
          scale={[w - 0.1, 0.06, 0.02]}
        />
      ))}

      {stock.length > 0 && (
        <Instances limit={stock.length} receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial roughness={0.85} />
          {stock.map((s) => (
            <Instance key={s.key} position={s.position} scale={s.scale} color={s.color} />
          ))}
        </Instances>
      )}
    </group>
  )
}

export default memo(ShelfUnit)
