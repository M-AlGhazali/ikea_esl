import ProductGlyph from '../ProductGlyph.jsx'
import { formatPrice, formatPriceAr, effectivePrice, discountPercent } from '../../lib/format.js'

export default function OverviewTab({ product, placement }) {
  const promo = product.promoPrice != null
  const pct = discountPercent(product)

  return (
    <div className="space-y-5">
      <div className="grid place-items-center rounded-xl bg-soft py-6">
        <ProductGlyph category={product.category} tint={product.colorHex} size={150} />
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-faint">{product.category}</p>
        <h3 className="mt-1 text-lg font-semibold leading-tight text-ink">{product.nameEn}</h3>
        <p dir="rtl" className="text-base text-ink-soft">
          {product.nameAr}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-ink-soft">{product.description}</p>

      <dl className="space-y-1.5 border-t border-line pt-4 text-xs">
        <Row label="List" value={formatPrice(product.price)} />
        {promo && <Row label="Promotional" value={formatPrice(product.promoPrice)} accent />}
        {product.oldPrice != null && (
          <Row label="Previous" value={formatPrice(product.oldPrice)} strike />
        )}
        {pct > 0 && <Row label="Saving" value={`−${pct}%`} accent />}
        <Row label="Arabic price" value={formatPriceAr(effectivePrice(product))} />
      </dl>

      {placement && (
        <p className="border-t border-line pt-3 text-xs text-ink-faint">
          {placement.location.zoneLabel} · {placement.location.shelf}
        </p>
      )}
    </div>
  )
}

function Row({ label, value, accent, strike }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd
        className={[
          'font-medium tabular-nums',
          accent ? 'text-red' : 'text-ink',
          strike ? 'line-through opacity-50' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}
