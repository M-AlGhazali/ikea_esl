import { useStoreState } from '../../store/useStoreState.js'
import { labelTypeLabel, displayTypeLabel } from '../../lib/format.js'

/**
 * The tab that carries the concept: one product record, several physical
 * labels. Every row flies the camera to that instance, so the claim is
 * verifiable in the scene rather than just asserted in text.
 */
export default function LocationsTab({ placements }) {
  const selectedId = useStoreState((s) => s.selectedPlacementId)
  const selectPlacement = useStoreState((s) => s.selectPlacement)
  const multi = placements.length > 1

  return (
    <div className="space-y-3">
      {multi && (
        <div className="rounded-lg border border-cyan-600/40 bg-cyan-600/10 px-3 py-2.5">
          <p className="text-xs font-semibold text-cyan-300">
            One product record · {placements.length} physical labels
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Changing the price once updates every label below, wherever it sits in the store.
          </p>
        </div>
      )}

      {placements.map((pl, i) => {
        const active = pl.id === selectedId
        const { location } = pl

        return (
          <button
            key={pl.id}
            type="button"
            onClick={() => selectPlacement(pl.id)}
            className={[
              'block w-full rounded-xl border-l-2 px-3 py-3 text-left transition',
              active
                ? 'border-l-cyan-400 bg-cyan-600/15'
                : 'border-l-line bg-ink-800/50 hover:bg-ink-700',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded bg-ink-900 text-[10px] font-bold text-cyan-300">
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-white">{location.floorLabel}</span>
              {active && (
                <span className="ml-auto rounded bg-cyan-400 px-1.5 py-px text-[9px] font-bold text-ink-900">
                  VIEWING
                </span>
              )}
            </div>

            <p className="mt-2 text-sm font-medium leading-snug text-[#d8eef2]">
              {location.zoneLabel}
              <span className="text-muted"> → </span>
              {location.section}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip>{location.shelf}</Chip>
              <Chip>Aisle {location.aisle}</Chip>
              <Chip>{displayTypeLabel(location.displayType)}</Chip>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-[11px]">
              <span
                className="size-1.5 rounded-full"
                style={{ background: location.labelType === 'hybrid-sign' ? '#e11d2e' : '#35e0d4' }}
              />
              <span className="text-muted">{labelTypeLabel(location.labelType)}</span>
            </p>

            {location.note && <p className="mt-1.5 text-[11px] italic text-muted">{location.note}</p>}
          </button>
        )
      })}
    </div>
  )
}

const Chip = ({ children }) => (
  <span className="rounded bg-ink-900/70 px-1.5 py-0.5 text-[10px] font-medium text-muted">{children}</span>
)
