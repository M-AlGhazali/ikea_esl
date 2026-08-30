import ProductGlyph from '../ProductGlyph.jsx'
import { formatPrice, formatPriceAr, effectivePrice, discountPercent } from '../../lib/format.js'

export default function OverviewTab({ product, placement }) {
  const promo = product.promoPrice != null
  const pct = discountPercent(product)

  return (
    <div className="space-y-4">
      <div className="grid place-items-center rounded-xl bg-paper py-5">
        <ProductGlyph category={product.category} tint={product.colorHex} size={150} />
      </div>

      <div>
        <h3 className="text-lg font-semibold leading-tight text-white">{product.nameEn}</h3>
        <p dir="rtl" className="mt-0.5 text-base text-muted">
          {product.nameAr}
        </p>
      </div>

      <div className="rounded-xl border border-line/70 bg-ink-800/60 p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="text-3xl font-extrabold"
            style={{ color: promo ? '#ff6b78' : '#ffffff' }}
          >
            {formatPrice(effectivePrice(product))}
          </span>
          {pct > 0 && (
            <span className="rounded-md bg-esl-red px-2 py-0.5 text-xs font-bold text-white">−{pct}%</span>
          )}
        </div>

        <p dir="rtl" className="mt-1 text-sm text-muted">
          {formatPriceAr(effectivePrice(product))}
        </p>

        <dl className="mt-3 space-y-1 border-t border-line/60 pt-3 text-xs">
          <Row label="List price" value={formatPrice(product.price)} />
          {promo && <Row label="Promotional price" value={formatPrice(product.promoPrice)} accent />}
          {product.oldPrice != null && (
            <Row label="Previous price" value={formatPrice(product.oldPrice)} strike />
          )}
        </dl>
      </div>

      <p className="text-sm leading-relaxed text-[#c3dbe0]">{product.description}</p>

      {placement && (
        <div className="rounded-lg border border-line/60 bg-ink-800/40 px-3 py-2.5 text-xs">
          <p className="font-semibold uppercase tracking-wider text-cyan-400">Selected label</p>
          <p className="mt-1 text-[#c3dbe0]">
            {placement.location.floorLabel} → {placement.location.zoneLabel} → {placement.location.shelf}
          </p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, accent, strike }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={[
          'font-medium tabular-nums',
          accent ? 'text-cyan-300' : 'text-white',
          strike ? 'line-through opacity-60' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}
