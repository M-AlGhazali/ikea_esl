import { useMemo } from 'react'
import { useStoreState } from '../store/useStoreState.js'
import { getProduct, PRODUCTS } from '../data/products.js'
import { getPlacement, placementsForProduct } from '../data/placements.js'
import { formatPrice, effectivePrice, stockLabel, stockToken } from '../lib/format.js'
import ProductGlyph from './ProductGlyph.jsx'
import ProductCard from './ProductCard.jsx'
import OverviewTab from './tabs/OverviewTab.jsx'
import LabelInfoTab from './tabs/LabelInfoTab.jsx'
import LocationsTab from './tabs/LocationsTab.jsx'
import StockPricingTab from './tabs/StockPricingTab.jsx'
import SpecsTab from './tabs/SpecsTab.jsx'

const TABS = [
  { id: 'overview', label: 'Overview', Component: OverviewTab },
  { id: 'label', label: 'Label Info', Component: LabelInfoTab },
  { id: 'locations', label: 'Locations', Component: LocationsTab },
  { id: 'stock', label: 'Stock & Pricing', Component: StockPricingTab },
  { id: 'specs', label: 'Specs', Component: SpecsTab },
]

export default function RightDetailsPanel() {
  const productId = useStoreState((s) => s.selectedProductId)
  const placementId = useStoreState((s) => s.selectedPlacementId)
  const activeTab = useStoreState((s) => s.activeTab)
  const setActiveTab = useStoreState((s) => s.setActiveTab)
  const clearSelection = useStoreState((s) => s.clearSelection)

  const product = productId ? getProduct(productId) : null
  const placement = placementId ? getPlacement(placementId) : null
  const placements = useMemo(() => (productId ? placementsForProduct(productId) : []), [productId])

  if (!product) return <EmptyState />

  const Active = TABS.find((t) => t.id === activeTab)?.Component ?? OverviewTab
  const tone = stockToken(product.stockStatus)

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line px-5 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-paper p-1.5">
            <ProductGlyph category={product.category} tint={product.colorHex} size={56} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
              {product.category}
            </p>
            <h2 className="truncate text-lg font-semibold leading-tight text-white">{product.nameEn}</h2>
            <p dir="rtl" className="truncate text-sm text-muted">
              {product.nameAr}
            </p>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            aria-label="Close details"
            className="-mr-1 -mt-1 shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-muted transition hover:bg-ink-800 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-2xl font-bold text-white">{formatPrice(effectivePrice(product))}</span>
          {product.promoPrice != null && (
            <span className="text-sm text-muted line-through">{formatPrice(product.price)}</span>
          )}
          <span
            className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ color: tone, background: `${tone}1f` }}
          >
            {stockLabel(product.stockStatus)}
          </span>
        </div>

        {placements.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveTab('locations')}
            className="mt-3 w-full rounded-lg bg-cyan-600/15 px-3 py-2 text-left text-xs text-cyan-300 transition hover:bg-cyan-600/25"
          >
            Labelled in <b>{placements.length}</b> locations across the store →
          </button>
        )}
      </header>

      <nav className="scroll-slim flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={[
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
              activeTab === t.id
                ? 'bg-cyan-400 text-ink-900'
                : 'text-muted hover:bg-ink-800 hover:text-white',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <Active product={product} placement={placement} placements={placements} />
      </div>
    </div>
  )
}

function EmptyState() {
  const selectProduct = useStoreState((s) => s.selectProduct)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-base font-semibold text-white">Store Catalog</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Click any product, shelf label or hanging sign in the 3D store — or pick one below.
        </p>
        <p className="mt-3 text-[11px] text-muted">
          <span className="font-semibold text-cyan-300">×2</span> marks a product that is labelled in more
          than one place.
        </p>
      </div>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} onSelect={() => selectProduct(p.id)} />
        ))}
      </div>
    </div>
  )
}
