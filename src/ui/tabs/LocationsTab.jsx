import { useStoreState } from '../../store/useStoreState.js'
import { displayTypeLabel } from '../../lib/format.js'

/**
 * The tab that carries the concept: one product record, several physical
 * labels. Every row flies the camera to that instance, so the claim is
 * verifiable in the scene rather than just asserted in text.
 */
export default function LocationsTab({ placements }) {
  const selectedId = useStoreState((s) => s.selectedPlacementId)
  const selectPlacement = useStoreState((s) => s.selectPlacement)

  return (
    <div className="space-y-2">
      {placements.length > 1 && (
        <p className="pb-1 text-xs text-ink-soft">
          <span className="font-medium text-ink">One record, {placements.length} labels.</span> Change
          the price once and both update.
        </p>
      )}

      {placements.map((pl, i) => {
        const active = pl.id === selectedId
        const { location } = pl
        const hybrid = location.labelType === 'hybrid-sign'

        return (
          <button
            key={pl.id}
            type="button"
            onClick={() => selectPlacement(pl.id)}
            className={[
              'block w-full rounded-xl border px-3.5 py-3 text-left transition',
              active ? 'border-brand bg-brand-soft' : 'border-line hover:bg-soft',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  'grid size-5 shrink-0 place-items-center rounded text-[10px] font-semibold',
                  active ? 'bg-brand text-white' : 'bg-soft-2 text-ink-soft',
                ].join(' ')}
              >
                {i + 1}
              </span>
              <span className="text-xs font-medium text-ink-soft">{location.floorLabel}</span>
            </div>

            <p className="mt-2 text-sm font-medium leading-snug text-ink">
              {location.zoneLabel}
              <span className="text-ink-faint"> · </span>
              {location.section}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Chip>{location.shelf}</Chip>
              <Chip>{location.aisle}</Chip>
              <Chip>{displayTypeLabel(location.displayType)}</Chip>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-soft">
              <span
                className="size-1.5 rounded-full"
                style={{ background: hybrid ? '#e11d2e' : '#0058a3' }}
              />
              {hybrid ? 'Hybrid sign' : 'Shelf-edge ESL'}
              {location.note && <span className="text-ink-faint">· {location.note}</span>}
            </p>
          </button>
        )
      })}
    </div>
  )
}

const Chip = ({ children }) => (
  <span className="rounded bg-soft-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-soft">{children}</span>
)
