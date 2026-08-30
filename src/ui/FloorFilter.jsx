import { useStoreState } from '../store/useStoreState.js'
import { Group, Segment } from './TopToolbar.jsx'

const OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'ground', label: 'Ground' },
  { id: 'second', label: 'Second' },
]

export default function FloorFilter() {
  const floorFilter = useStoreState((s) => s.floorFilter)
  const setFloorFilter = useStoreState((s) => s.setFloorFilter)

  return (
    <Group>
      {OPTIONS.map((o) => (
        <Segment key={o.id} active={floorFilter === o.id} onClick={() => setFloorFilter(o.id)}>
          {o.label}
        </Segment>
      ))}
    </Group>
  )
}
