/**
 * Brand mark for the portal header.
 *
 * Plain text rather than a retailer logo: this is an unofficial concept demo,
 * so the header names the project and says so, instead of borrowing a
 * trademark. `height` keeps the old prop so the toolbar layout is unchanged.
 */
export default function BrandMark({ height = 38, className = '' }) {
  return (
    <div
      style={{ height }}
      className={`flex flex-col justify-center rounded-xl border border-line bg-white/90 px-3 leading-tight backdrop-blur ${className}`}
    >
      <span className="whitespace-nowrap text-sm font-semibold text-brand">ESL Digital Twin</span>
      <span className="whitespace-nowrap text-[10px] uppercase tracking-wide text-ink-faint">
        Unofficial concept
      </span>
    </div>
  )
}
