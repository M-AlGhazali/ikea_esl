import {
  formatPrice,
  effectivePrice,
  discountPercent,
  savingAmount,
  stockLabel,
  stockToken,
} from '../../lib/format.js'

export default function StockPricingTab({ product, placements }) {
  const tone = stockToken(product.stockStatus)
  const pct = discountPercent(product)
  const saving = savingAmount(product)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3.5">
        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: tone }}>
          <span className="size-2 rounded-full" style={{ background: tone }} />
          {stockLabel(product.stockStatus)}
        </span>
        <span className="text-2xl font-semibold tabular-nums text-ink">{product.stockCount}</span>
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="List" value={formatPrice(product.price)} />
        <Row
          label="Promotional"
          value={product.promoPrice != null ? formatPrice(product.promoPrice) : '—'}
          accent={product.promoPrice != null}
        />
        <Row
          label="Previous"
          value={product.oldPrice != null ? formatPrice(product.oldPrice) : '—'}
          strike={product.oldPrice != null}
        />
        <div className="space-y-2 border-t border-line pt-2">
          <Row
            label="Saving"
            value={saving > 0 ? `${formatPrice(saving)} (−${pct}%)` : '—'}
            accent={saving > 0}
          />
          <Row label="On shelf now" value={formatPrice(effectivePrice(product))} big />
        </div>
      </dl>

      <div className="border-t border-line pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-ink-faint">Labels on this price</p>
        <ul className="space-y-1.5 text-xs">
          {placements.map((pl) => (
            <li key={pl.id} className="flex items-center gap-2">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: pl.labelType === 'hybrid-sign' ? '#e11d2e' : '#0058a3' }}
              />
              <span className="truncate text-ink-soft">
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
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd
        className={[
          'font-medium tabular-nums',
          big ? 'text-lg font-semibold text-ink' : 'text-sm',
          accent ? 'text-red' : big ? '' : 'text-ink',
          strike ? 'line-through opacity-50' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}
