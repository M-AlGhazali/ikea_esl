import { useStoreState } from '../store/useStoreState.js'
import { VIEW_ORDER, VIEW_PRESETS } from '../lib/cameraPresets.js'
import FloorFilter from './FloorFilter.jsx'

/**
 * Floating glass controls over the viewport. Deliberately not a full-width
 * chrome bar — the 3D scene stays the hero, and the controls sit on top of it.
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
      <div className="scroll-slim pointer-events-auto absolute inset-x-0 top-0 z-10 flex flex-nowrap items-start gap-2 overflow-x-auto p-3 lg:pointer-events-none lg:flex-wrap lg:gap-2.5 lg:p-4">
        <div className="pointer-events-auto shrink-0 rounded-xl border border-line/70 bg-ink-850/80 p-2 backdrop-blur-md">
          <div className="flex items-center gap-1">
            {VIEW_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={[
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  view === id
                    ? 'bg-cyan-400 text-ink-900'
                    : 'text-muted hover:bg-ink-700 hover:text-white',
                ].join(' ')}
              >
                {VIEW_PRESETS[id].label}
              </button>
            ))}
          </div>
        </div>

        <FloorFilter />

        <div className="pointer-events-auto flex shrink-0 items-center gap-3 rounded-xl border border-line/70 bg-ink-850/80 px-4 py-2.5 backdrop-blur-md">
          <label htmlFor="cutaway" className="text-[10px] font-semibold uppercase tracking-wider text-muted">
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
            className="w-28 cursor-pointer"
          />
          <span className="w-9 text-right text-xs font-medium tabular-nums text-cyan-300">
            {Math.round(cutaway * 100)}%
          </span>
        </div>

        <button
          type="button"
          onClick={toggleDimensions}
          aria-pressed={showDimensions}
          className={[
            'pointer-events-auto shrink-0 rounded-xl border px-4 py-2.5 text-xs font-medium backdrop-blur-md transition',
            showDimensions
              ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
              : 'border-line/70 bg-ink-850/80 text-muted hover:text-white',
          ].join(' ')}
        >
          Dimensions
        </button>
      </div>

      {/* Title block, bottom-left of the viewport. */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden md:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Electronic Shelf Labels
        </p>
        <p className="text-sm font-medium text-white/85">Store Digital Twin — Concept Demo</p>
      </div>
    </>
  )
}
