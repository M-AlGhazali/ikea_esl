import { memo } from 'react'
import { placementsOnFloor } from '../data/placements.js'
import ProductMesh from './furniture/ProductMesh.jsx'
import ESLLabel from './ESLLabel.jsx'
import LargeInfoSign from './LargeInfoSign.jsx'
import SelectionHalo from './SelectionHalo.jsx'
import FloorGroup from './FloorGroup.jsx'
import { useStoreState } from '../store/useStoreState.js'

/**
 * Every product instance in the store, each paired with its own label.
 *
 * The label sits beside the product group rather than inside it, because
 * labelPosition is world space and must not inherit the product transform.
 * Both sit inside a FloorGroup so they rise together with the cutaway lift.
 */

// Only a few lamps carry a real point light, to keep the scene light count low.
const LIT_PLACEMENTS = new Set(['loc-001a', 'loc-001b', 'loc-004b'])

function Placement({ placement }) {
  const { location, product } = placement
  const selectedId = useStoreState((s) => s.selectedPlacementId)
  const hoveredId = useStoreState((s) => s.hoveredPlacementId)
  const selectPlacement = useStoreState((s) => s.selectPlacement)
  const setHovered = useStoreState((s) => s.setHovered)

  const selected = selectedId === placement.id
  const hovered = hoveredId === placement.id
  const Label = location.labelType === 'hybrid-sign' ? LargeInfoSign : ESLLabel

  return (
    <group>
      <group
        position={location.positionInScene}
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
        <ProductMesh
          product={product}
          displayType={location.displayType}
          lit={LIT_PLACEMENTS.has(placement.id)}
        />
        {(selected || hovered) && <SelectionHalo selected={selected} product={product} />}
      </group>

      <Label placement={placement} selected={selected} hovered={hovered} />
    </group>
  )
}

const MemoPlacement = memo(Placement)

function Products() {
  return (
    <>
      {[0, 1].map((floor) => (
        <FloorGroup key={floor} floor={floor}>
          {placementsOnFloor(floor).map((placement) => (
            <MemoPlacement key={placement.id} placement={placement} />
          ))}
        </FloorGroup>
      ))}
    </>
  )
}

export default memo(Products)
