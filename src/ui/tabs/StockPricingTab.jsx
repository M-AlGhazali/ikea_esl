import {
  formatPrice,
  effectivePrice,
  discountPercent,
  savingAmount,
  stockLabel,
  stockToken,
} from '../../lib/format.js'

const STOCK_COPY = {
  'in-stock': 'Available to take home today from the self-serve area.',
  'low-stock': 'Only a few left at this store — check before travelling.',
  'out-of-stock': 'Not currently available at this store.',
}

export default function StockPricingTab({ product, placements }) {
  const tone = stockToken(product.stockStatus)
  const pct = discountPercent(product)
  const saving = savingAmount(product)

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: `${tone}55`, background: `${tone}14` }}
      >
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: tone }} />
          <span className="text-sm font-semibold" style={{ color: tone }}>
            {stockLabel(product.stockStatus)}
          </span>
          <span className="ml-auto text-2xl font-extrabold tabular-nums text-white">
            {product.stockCount}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{STOCK_COPY[product.stockStatus]}</p>
      </div>

      <div className="rounded-xl border border-line/70 bg-ink-800/60 p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Pricing</p>
        <dl className="space-y-2 text-sm">
          <Row label="List price" value={formatPrice(product.price)} />
          <Row
            label="Promotional price"
            value={product.promoPrice != null ? formatPrice(product.promoPrice) : '—'}
            accent={product.promoPrice != null}
          />
          <Row
            label="Previous price"
            value={product.oldPrice != null ? formatPrice(product.oldPrice) : '—'}
            strike={product.oldPrice != null}
          />
          <div className="border-t border-line/60 pt-2">
            <Row label="Customer saves" value={saving > 0 ? `${formatPrice(saving)} (−${pct}%)` : '—'} accent={saving > 0} />
            <Row label="Price on shelf now" value={formatPrice(effectivePrice(product))} big />
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-line/70 bg-ink-800/40 p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Labels driven by this price
        </p>
        <ul className="space-y-1.5 text-xs">
          {placements.map((pl) => (
            <li key={pl.id} className="flex items-center gap-2">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: pl.labelType === 'hybrid-sign' ? '#e11d2e' : '#35e0d4' }}
              />
              <span className="truncate text-[#c3dbe0]">
                {pl.location.shelf} · {pl.location.zoneLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Row({ label, value, accent, strike, big }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd
        className={[
          'font-semibold tabular-nums',
          big ? 'text-lg text-white' : 'text-sm',
          accent ? 'text-cyan-300' : big ? '' : 'text-white',
          strike ? 'line-through opacity-60' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}
