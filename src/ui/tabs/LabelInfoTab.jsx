import EslPreview from '../EslPreview.jsx'
import QrCode from '../QrCode.jsx'
import { formatPrice, effectivePrice, discountPercent, labelTypeLabel, displayTypeLabel } from '../../lib/format.js'

/**
 * What kind of label is on this shelf, and what it is showing right now.
 * The hybrid sign gets its own preview because its whole point is that only
 * part of it is a screen.
 */
export default function LabelInfoTab({ product, placement }) {
  if (!placement) return null
  const { location } = placement
  const isHybrid = location.labelType === 'hybrid-sign'

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-cyan-600/40 bg-cyan-600/10 px-3 py-2.5">
        <span className="mt-0.5 size-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px] shadow-cyan-400" />
        <div>
          <p className="text-xs font-semibold text-cyan-300">{labelTypeLabel(location.labelType)}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
            {isHybrid
              ? 'Printed information sheet with a live electronic price block at the bottom. The paper body is reprinted seasonally; the price updates over the air.'
              : 'Fully electronic e-paper tag clipped to the shelf lip. Price, stock and promotion all update over the air.'}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {isHybrid ? 'Electronic price block' : 'Label preview'}
        </p>
        {isHybrid ? <HybridSignPreview product={product} /> : <EslPreview product={product} location={location} />}
      </div>

      <div className="flex gap-4 rounded-xl border border-line/70 bg-ink-800/60 p-4">
        <QrCode value={product.qrCode} size={92} />
        <dl className="min-w-0 flex-1 space-y-1.5 text-xs">
          <Row label="SKU" value={product.sku} mono />
          <Row label="Article No." value={product.articleNo} mono />
          <Row label="Section" value={location.section} />
          <Row label="Aisle" value={location.aisle} />
          <Row label="Shelf" value={location.shelf} />
          <Row label="Fixture" value={displayTypeLabel(location.displayType)} />
        </dl>
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        The QR resolves to <span className="text-cyan-300">{product.qrCode}</span> — scan it from the screen
        to open the product page.
      </p>
    </div>
  )
}

/** Miniature of the hanging sign: matte body, electronic red block. */
function HybridSignPreview({ product }) {
  const pct = discountPercent(product)

  return (
    <div className="mx-auto w-52 overflow-hidden rounded-md shadow-lg shadow-black/40">
      <div className="space-y-1.5 bg-[#fbfbf8] px-3 py-3">
        <p className="text-sm font-extrabold leading-none text-[#0d1418]">
          {product.nameEn.split(' ')[0]}
        </p>
        <p className="text-[10px] text-[#4b565c]">{product.nameEn.split(' ').slice(1).join(' ')}</p>
        <p dir="rtl" className="text-[10px] text-[#2b353b]">
          {product.nameAr}
        </p>
        <div className="h-px bg-[#0d1418]" />
        <p className="line-clamp-3 text-[9px] leading-snug text-[#39464d]">{product.description}</p>
        <div className="space-y-0.5 pt-1 text-[9px]">
          <div className="flex justify-between border-b border-[#eceded] pb-0.5">
            <span className="text-[#8a949a]">Article No.</span>
            <span className="text-[#0d1418]">{product.articleNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a949a]">Dimensions</span>
            <span className="text-[#0d1418]">
              {product.dimensions.width}×{product.dimensions.depth}×{product.dimensions.height}
            </span>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-[#f0263a] to-[#c0122a] px-3 py-2.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[8px] font-bold tracking-wider text-white">
          ◉ ELECTRONIC PRICE · LIVE
        </span>
        <div className="mt-1 flex items-end justify-between">
          <span className="text-2xl font-black leading-none text-white">
            {formatPrice(effectivePrice(product))}
          </span>
          {pct > 0 && <span className="text-sm font-extrabold text-ikea-yellow">−{pct}%</span>}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={`truncate text-right font-medium text-white ${mono ? 'font-mono text-[11px]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}
