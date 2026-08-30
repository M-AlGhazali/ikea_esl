import ProductGlyph from './ProductGlyph.jsx'
import { formatPrice, effectivePrice, stockToken } from './../lib/format.js'

/** Compact catalog row, used by the panel empty state. */
export default function ProductCard({ product, onSelect }) {
  const multi = product.locations.length > 1

  return (
    <button
      type="button"
      onClick={onSelect}
      className="mb-1 flex w-full items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition hover:border-line hover:bg-soft"
    >
      <div className="shrink-0 rounded-lg bg-soft p-1">
        <ProductGlyph category={product.category} tint={product.colorHex} size={38} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ink">{product.nameEn}</p>
        <p dir="rtl" className="truncate text-[11px] text-ink-faint">
          {product.nameAr}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[13px] font-semibold text-ink">{formatPrice(effectivePrice(product))}</p>
        <div className="mt-0.5 flex items-center justify-end gap-1.5">
          {multi && (
            <span className="rounded bg-brand-soft px-1.5 py-px text-[10px] font-medium text-brand">
              ×{product.locations.length}
            </span>
          )}
          <span className="size-1.5 rounded-full" style={{ background: stockToken(product.stockStatus) }} />
        </div>
      </div>
    </button>
  )
}
