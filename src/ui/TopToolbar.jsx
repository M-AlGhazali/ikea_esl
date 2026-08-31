import { useStoreState } from '../store/useStoreState.js'
import { VIEW_ORDER, VIEW_PRESETS } from '../lib/cameraPresets.js'
import FloorFilter from './FloorFilter.jsx'
import BrandMark from './BrandMark.jsx'

/**
 * Floating controls over the viewport, split by what they do: camera along the
 * top, model display along the bottom. Keeping them in two short rows rather
 * than one long one is what stops the chrome competing with the scene.
 */
export default function TopToolbar() {
  const view = useStoreState((s) => s.view)
  const setView = useStoreState((s) => s.setView)
  const cutaway = useStoreState((s) => s.cutaway)
  const setCutaway = useStoreState((s) => s.setCutaway)
  const showDimensions = useStoreState((s) => s.showDimensions)
  const toggleDimensions = useStoreState((s) => s.toggleDimensions)

  return (
    <>
      <div className="scroll-slim pointer-events-auto absolute inset-x-0 top-0 z-10 flex flex-nowrap items-start gap-2 overflow-x-auto p-3 lg:pointer-events-none lg:p-4">
        <div className="pointer-events-auto flex shrink-0 items-center rounded-xl border border-line bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <BrandMark height={22} />
        </div>

        <Group>
          {VIEW_ORDER.map((id) => (
            <Segment key={id} active={view === id} onClick={() => setView(id)}>
              {VIEW_PRESETS[id].label}
            </Segment>
          ))}
        </Group>

        <FloorFilter />
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 lg:bottom-4 lg:left-4">
        <div className="pointer-events-auto flex shrink-0 items-center gap-2.5 rounded-xl border border-line bg-white/90 px-3.5 py-2 shadow-sm backdrop-blur">
          <label htmlFor="cutaway" className="text-xs text-ink-soft">
            Cutaway
          </label>
          <input
            id="cutaway"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={cutaway}
            onChange={(e) => setCutaway(Number(e.target.value))}
            className="w-24 cursor-pointer"
          />
          <span className="w-8 text-right text-xs font-medium tabular-nums text-brand">
            {Math.round(cutaway * 100)}%
          </span>
        </div>

        <Group>
          <Segment active={showDimensions} onClick={toggleDimensions}>
            Dimensions
          </Segment>
        </Group>
      </div>
    </>
  )
}

export function Group({ children }) {
  return (
    <div className="pointer-events-auto flex shrink-0 items-center gap-0.5 rounded-xl border border-line bg-white/90 p-1 shadow-sm backdrop-blur">
      {children}
    </div>
  )
}

export function Segment({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
        active ? 'bg-brand text-white' : 'text-ink-soft hover:bg-soft hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
