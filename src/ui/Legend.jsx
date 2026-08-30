import { useState } from 'react'

const wideEnough = () =>
  typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches

/**
 * The one piece of on-screen text that makes the concept legible to somebody
 * seeing the demo cold: what the two label types are, and that everything is
 * clickable.
 */
export default function Legend() {
  const [open, setOpen] = useState(wideEnough)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-4 z-10 rounded-full border border-line/70 bg-ink-850/85 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-md transition hover:text-white"
      >
        Legend
      </button>
    )
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 w-64 rounded-xl border border-line/70 bg-ink-850/85 p-3.5 backdrop-blur-md">
      <div className="mb-2.5 flex items-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Label types</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Hide legend"
          className="ml-auto -mr-1 -mt-1 rounded px-1.5 text-base leading-none text-muted transition hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 h-4 w-6 shrink-0 rounded-sm border-b-2 border-cyan-400 bg-paper" />
          <div>
            <p className="text-xs font-semibold text-white">Shelf-edge ESL</p>
            <p className="text-[11px] leading-snug text-muted">
              Fully electronic e-paper tag, cyan powered edge.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 h-4 w-6 shrink-0 overflow-hidden rounded-sm bg-paper">
            <span className="block h-1.5 w-full translate-y-2.5 bg-esl-red" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Hybrid showroom sign</p>
            <p className="text-[11px] leading-snug text-muted">
              Printed information sheet, electronic red price block.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-line/60 pt-2.5 text-[11px] text-muted">
        Click any product, label or sign. Drag to orbit, scroll to zoom, right-drag to pan.
      </p>
    </div>
  )
}
