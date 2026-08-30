import { useStoreState } from '../store/useStoreState.js'

const OPTIONS = [
  { id: 'all', label: 'All Floors' },
  { id: 'ground', label: 'Ground Floor' },
  { id: 'second', label: 'Second Floor' },
]

export default function FloorFilter() {
  const floorFilter = useStoreState((s) => s.floorFilter)
  const setFloorFilter = useStoreState((s) => s.setFloorFilter)

  return (
    <div className="pointer-events-auto shrink-0 rounded-xl border border-line/70 bg-ink-850/80 p-2 backdrop-blur-md">
      <div className="flex items-center gap-1">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setFloorFilter(o.id)}
            className={[
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
              floorFilter === o.id
                ? 'bg-cyan-400 text-ink-900'
                : 'text-muted hover:bg-ink-700 hover:text-white',
            ].join(' ')}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
