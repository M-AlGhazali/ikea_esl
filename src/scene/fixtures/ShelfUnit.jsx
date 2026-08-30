import { memo, useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'
import { shelfBoardHeights } from '../../data/storeLayout.js'

// Shared by every shelf unit in the store, so 20+ runs cost almost nothing.
const UNIT_GEO = new BoxGeometry(1, 1, 1)
const FRAME_MAT = new MeshStandardMaterial({ color: '#cfd6d6', roughness: 0.55, metalness: 0.25 })
const BOARD_MAT = new MeshStandardMaterial({ color: '#efeae1', roughness: 0.8 })
const BACK_MAT = new MeshStandardMaterial({ color: '#e2e6e6', roughness: 0.95 })
const LIP_MAT = new MeshStandardMaterial({ color: '#b9c3c6', roughness: 0.5, metalness: 0.3 })

/**
 * A market-hall shelf run. The front lip is the price rail that shelf-edge ESLs
 * clip onto, so its height has to match the labelPosition values in the catalog.
 *
 * @param {[number,number,number]} position base of the unit
 * @param {[number,number,number]} size [width, height, depth]
 */
function ShelfUnit({ position, rotationY = 0, size, shelves = 4 }) {
  const [w, h, d] = size
  const boards = useMemo(() => shelfBoardHeights(h, shelves), [h, shelves])

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
          castShadow
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
    </group>
  )
}

export default memo(ShelfUnit)
