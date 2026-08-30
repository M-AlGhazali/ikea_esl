import EslPreview from '../EslPreview.jsx'
import QrCode from '../QrCode.jsx'
import { formatPrice, effectivePrice, discountPercent, displayTypeLabel } from '../../lib/format.js'

/** What kind of label is on this shelf, and what it is showing right now. */
export default function LabelInfoTab({ product, placement }) {
  if (!placement) return null
  const { location } = placement
  const isHybrid = location.labelType === 'hybrid-sign'

  return (
    <div className="space-y-5">
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={
            isHybrid
              ? { background: '#fdeaec', color: '#b3162a' }
              : { background: '#eaf2fb', color: '#0058a3' }
          }
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: isHybrid ? '#e11d2e' : '#0058a3' }}
          />
          {isHybrid ? 'Hybrid showroom sign' : 'Shelf-edge ESL'}
        </span>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          {isHybrid
            ? 'Printed sheet with a live electronic price block.'
            : 'Fully electronic e-paper tag. Price and stock update over the air.'}
        </p>
      </div>

      {isHybrid ? <HybridSignPreview product={product} /> : <EslPreview product={product} location={location} />}

      <div className="flex gap-4 border-t border-line pt-4">
        <QrCode value={product.qrCode} size={84} className="border border-line" />
        <dl className="min-w-0 flex-1 space-y-1.5 text-xs">
          <Row label="SKU" value={product.sku} mono />
          <Row label="Article" value={product.articleNo} mono />
          <Row label="Section" value={location.section} />
          <Row label="Aisle" value={location.aisle} />
          <Row label="Shelf" value={location.shelf} />
          <Row label="Fixture" value={displayTypeLabel(location.displayType)} />
        </dl>
      </div>
    </div>
  )
}

/** Miniature of the hanging sign: matte body, electronic red block. */
function HybridSignPreview({ product }) {
  const pct = discountPercent(product)

  return (
    <div className="mx-auto w-52 overflow-hidden rounded-md border border-line shadow-sm">
      <div className="space-y-1.5 bg-white px-3 py-3">
        <p className="text-sm font-bold leading-none text-ink">{product.nameEn.split(' ')[0]}</p>
        <p className="text-[10px] text-ink-soft">{product.nameEn.split(' ').slice(1).join(' ')}</p>
        <p dir="rtl" className="text-[10px] text-ink-soft">
          {product.nameAr}
        </p>
        <div className="h-px bg-ink" />
        <p className="line-clamp-3 text-[9px] leading-snug text-ink-soft">{product.description}</p>
        <div className="space-y-0.5 pt-1 text-[9px]">
          <div className="flex justify-between border-b border-line pb-0.5">
            <span className="text-ink-faint">Article</span>
            <span className="text-ink">{product.articleNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Dimensions</span>
            <span className="text-ink">
              {product.dimensions.width}×{product.dimensions.depth}×{product.dimensions.height}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#f0263a] to-[#c0122a] px-3 py-2.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[8px] font-semibold tracking-wider text-white">
          ◉ ELECTRONIC PRICE
        </span>
        <div className="mt-1 flex items-end justify-between">
          <span className="text-2xl font-bold leading-none text-white">
            {formatPrice(effectivePrice(product))}
          </span>
          {pct > 0 && <span className="text-sm font-bold text-yellow">−{pct}%</span>}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-ink-faint">{label}</dt>
      <dd className={`truncate text-right font-medium text-ink ${mono ? 'font-mono text-[11px]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}
