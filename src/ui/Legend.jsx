import { useState } from 'react'

const wideEnough = () =>
  typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches

/** Minimal key: what the two label types are. */
export default function Legend() {
  const [open, setOpen] = useState(wideEnough)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-16 right-3 z-10 rounded-full border border-line bg-white/90 px-3 py-1.5 text-xs font-medium text-ink-soft shadow-sm backdrop-blur transition hover:text-ink lg:bottom-4 lg:right-4"
      >
        Key
      </button>
    )
  }

  return (
    <div className="absolute bottom-16 right-3 z-10 rounded-xl border border-line bg-white/90 py-2.5 pl-3.5 pr-2.5 shadow-sm backdrop-blur lg:bottom-4 lg:right-4">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2 text-xs text-ink">
          <span className="h-3.5 w-5 rounded-sm border border-line-strong bg-white shadow-[inset_0_-2px_0_0_#0058a3]" />
          Shelf-edge ESL
        </span>
        <span className="flex items-center gap-2 text-xs text-ink">
          <span className="h-3.5 w-5 overflow-hidden rounded-sm border border-line-strong bg-white">
            <span className="block h-1.5 w-full translate-y-2 bg-red" />
          </span>
          Hybrid sign
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Hide key"
          className="rounded px-1.5 text-base leading-none text-ink-faint transition hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  )
}
