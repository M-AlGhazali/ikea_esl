import ProductGlyph from './ProductGlyph.jsx'
import QrCode from './QrCode.jsx'
import { formatPrice, effectivePrice, stockLabel } from '../lib/format.js'

/**
 * A DOM replica of the shelf-edge ESL, at a size you can actually read.
 *
 * It mirrors the canvas texture deliberately: same e-paper palette, same
 * layout, same cyan powered edge — so the panel and the 3D scene agree about
 * what an ESL looks like.
 */
export default function EslPreview({ product, location }) {
  const promo = product.promoPrice != null
  const d = product.dimensions

  return (
    <div className="overflow-hidden rounded-md border-b-2 border-cyan-400 bg-paper shadow-lg shadow-black/30">
      {/* header rail */}
      <div className="flex items-center gap-2 bg-[#0d1418] px-2.5 py-1.5">
        <span className="text-[11px] font-bold text-white">{location.aisle}</span>
        <span className="truncate text-[10px] font-medium uppercase tracking-wider text-[#9fb6bd]">
          {location.section}
        </span>
        <span
          className="ml-auto size-2 rounded-full"
          style={{ background: product.stockStatus === 'out-of-stock' ? '#e11d2e' : '#3ad39f' }}
        />
      </div>

      <div className="flex gap-2.5 px-2.5 pt-2.5">
        <div className="shrink-0">
          <ProductGlyph category={product.category} tint={product.colorHex} size={52} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight text-[#0d1418]">{product.nameEn}</p>
          <p dir="rtl" className="truncate text-[12px] font-semibold text-[#3b4750]">
            {product.nameAr}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2.5 px-2.5 pb-2.5 pt-1.5">
        <div className="min-w-0 flex-1">
          <p
            className="text-[26px] font-extrabold leading-none"
            style={{ color: promo ? '#e11d2e' : '#0d1418' }}
          >
            {formatPrice(effectivePrice(product))}
          </p>
          <p className="mt-1 flex gap-2 text-[10px] text-[#69747a]">
            {promo && <span className="line-through">{formatPrice(product.price)}</span>}
            {product.oldPrice != null && <span>was {formatPrice(product.oldPrice)}</span>}
          </p>
          <p className="mt-1 text-[10px] text-[#69747a]">
            {product.articleNo} · {d.width}×{d.depth}×{d.height} {d.unit}
          </p>
          <p
            className="text-[10px] font-semibold"
            style={{ color: product.stockStatus === 'out-of-stock' ? '#e11d2e' : '#2b7f63' }}
          >
            {stockLabel(product.stockStatus)} · {product.sku}
          </p>
        </div>
        <QrCode value={product.qrCode} size={62} />
      </div>
    </div>
  )
}
