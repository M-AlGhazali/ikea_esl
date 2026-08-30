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
  { id: 'label', label: 'Label', Component: LabelInfoTab },
  { id: 'locations', label: 'Locations', Component: LocationsTab },
  { id: 'stock', label: 'Stock', Component: StockPricingTab },
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
    <div className="flex h-full flex-col bg-panel">
      <header className="border-b border-line px-5 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-soft p-1.5">
            <ProductGlyph category={product.category} tint={product.colorHex} size={52} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold leading-tight text-ink">
              {product.nameEn}
            </h2>
            <p dir="rtl" className="truncate text-sm text-ink-soft">
              {product.nameAr}
            </p>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            aria-label="Close"
            className="-mr-1 -mt-1 shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-ink-faint transition hover:bg-soft hover:text-ink"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-2xl font-semibold text-ink">{formatPrice(effectivePrice(product))}</span>
          {product.promoPrice != null && (
            <span className="text-sm text-ink-faint line-through">{formatPrice(product.price)}</span>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium" style={{ color: tone }}>
            <span className="size-1.5 rounded-full" style={{ background: tone }} />
            {stockLabel(product.stockStatus)}
          </span>
        </div>

        {placements.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveTab('locations')}
            className="mt-3 w-full rounded-lg bg-brand-soft px-3 py-2 text-left text-xs font-medium text-brand transition hover:bg-brand/10"
          >
            {placements.length} locations in store →
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
                ? 'bg-brand text-white'
                : 'text-ink-soft hover:bg-soft hover:text-ink',
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
    <div className="flex h-full flex-col bg-panel">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-base font-semibold text-ink">Catalog</h2>
        <p className="mt-1 text-sm text-ink-soft">Select anything in the store, or pick a product.</p>
      </div>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} onSelect={() => selectProduct(p.id)} />
        ))}
      </div>
    </div>
  )
}
