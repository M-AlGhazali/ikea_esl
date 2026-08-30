import { memo } from 'react'
import { FIXTURES, ZONES } from '../data/storeLayout.js'
import ShelfUnit from './fixtures/ShelfUnit.jsx'
import WarehouseRack from './fixtures/WarehouseRack.jsx'
import BinTable from './fixtures/BinTable.jsx'
import CheckoutCounter from './fixtures/CheckoutCounter.jsx'
import ShowroomRoom from './fixtures/ShowroomRoom.jsx'
import FloorGroup from './FloorGroup.jsx'

const COMPONENTS = {
  shelf: ShelfUnit,
  rack: WarehouseRack,
  bin: BinTable,
  counter: CheckoutCounter,
}

const floorOfZone = (zoneId) => ZONES.find((z) => z.id === zoneId)?.floor ?? 0

function renderFixture(fx) {
  const Component = COMPONENTS[fx.kind]
  if (!Component) return null
  return (
    <Component
      key={fx.id}
      position={fx.position}
      rotationY={fx.rotationY}
      size={fx.size}
      shelves={fx.shelves}
    />
  )
}

/** Every non-product object in the store, grouped by floor. */
function StoreFixtures() {
  return (
    <>
      {[0, 1].map((floor) => (
        <FloorGroup key={floor} floor={floor}>
          {FIXTURES.filter((fx) => floorOfZone(fx.zone) === floor).map(renderFixture)}
          {ZONES.filter((z) => z.floor === floor && z.kind === 'showroom').map((zone) => (
            <ShowroomRoom key={zone.id} zone={zone} />
          ))}
        </FloorGroup>
      ))}
    </>
  )
}

export default memo(StoreFixtures)
