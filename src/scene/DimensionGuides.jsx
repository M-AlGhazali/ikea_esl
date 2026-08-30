import { memo } from 'react'
import { Line, Text } from '@react-three/drei'
import { STORE } from '../data/storeLayout.js'
import { getPlacement } from '../data/placements.js'
import { useStoreState } from '../store/useStoreState.js'

/**
 * Measurement overlay, off by default. Shows the building footprint, the two
 * floor heights, and the real bounding box of whatever is selected.
 */
const GUIDE = '#0058a3'

function Guide({ from, to, label, labelOffset = [0, 0.5, 0] }) {
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
  return (
    <group>
      <Line
        points={[from, to]}
        color={GUIDE}
        lineWidth={1.6}
        dashed
        dashSize={0.5}
        gapSize={0.28}
        depthTest={false}
        raycast={null}
      />
      <Text
        position={[mid[0] + labelOffset[0], mid[1] + labelOffset[1], mid[2] + labelOffset[2]]}
        fontSize={0.7}
        color={GUIDE}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {label}
      </Text>
    </group>
  )
}

function SelectedBounds({ placement }) {
  const d = placement.product.dimensions
  const [x, y, z] = placement.location.positionInScene
  const w = d.width / 100
  const dp = d.depth / 100
  const h = d.height / 100

  return (
    <group position={[x, y, z]} rotation={[0, placement.location.rotationY, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, dp]} />
        <meshBasicMaterial color={GUIDE} wireframe transparent opacity={0.55} depthTest={false} />
      </mesh>
      <Text
        position={[0, h + 0.28, 0]}
        fontSize={0.16}
        color={GUIDE}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor="#ffffff"
      >
        {`${d.width} × ${d.depth} × ${d.height} cm`}
      </Text>
    </group>
  )
}

function DimensionGuides() {
  const show = useStoreState((s) => s.showDimensions)
  const selectedId = useStoreState((s) => s.selectedPlacementId)
  if (!show) return null

  const { x, z, secondY, roofY, width, depth } = STORE
  const placement = selectedId ? getPlacement(selectedId) : null

  return (
    <group>
      <Guide
        from={[x[0], 0.05, z[1] + 2]}
        to={[x[1], 0.05, z[1] + 2]}
        label={`${width.toFixed(1)} m`}
        labelOffset={[0, 0.9, 0]}
      />
      <Guide
        from={[x[1] + 2, 0.05, z[0]]}
        to={[x[1] + 2, 0.05, z[1]]}
        label={`${depth.toFixed(1)} m`}
        labelOffset={[0, 0.9, 0]}
      />
      <Guide
        from={[x[0] - 1.5, 0, z[1]]}
        to={[x[0] - 1.5, secondY, z[1]]}
        label={`${secondY.toFixed(2)} m`}
        labelOffset={[-1.4, 0, 0]}
      />
      <Guide
        from={[x[0] - 3, 0, z[1]]}
        to={[x[0] - 3, roofY, z[1]]}
        label={`${roofY.toFixed(2)} m`}
        labelOffset={[-1.4, 0, 0]}
      />

      {placement && <SelectedBounds placement={placement} />}
    </group>
  )
}

export default memo(DimensionGuides)
