export const CURRENCY = 'SAR'

const money = (locale, value) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)

/** "SAR 3,450" — normalised to a plain space so it renders identically on canvas. */
export const formatPrice = (value) => money('en-SA', value).replace(/ /g, ' ')
/** Arabic locale but Latin digits, so the AR and EN prices read consistently. */
export const formatPriceAr = (value) => money('ar-SA-u-nu-latn', value)

export const effectivePrice = (p) => p.promoPrice ?? p.price
export const hasDiscount = (p) => p.promoPrice != null || p.oldPrice != null

/** Discount measured against the previous price if there is one, else the list price. */
export function discountPercent(p) {
  const base = p.oldPrice ?? p.price
  const now = effectivePrice(p)
  if (!base || now >= base) return 0
  return Math.round(((base - now) / base) * 100)
}

export function savingAmount(p) {
  const base = p.oldPrice ?? p.price
  const now = effectivePrice(p)
  return now >= base ? 0 : Math.round((base - now) * 100) / 100
}

const STOCK_LABELS = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
}

const STOCK_TOKENS = {
  'in-stock': '#0f8a5f',
  'low-stock': '#b8730a',
  'out-of-stock': '#d13b3b',
}

export const stockLabel = (status) => STOCK_LABELS[status] ?? 'Unknown'
export const stockToken = (status) => STOCK_TOKENS[status] ?? '#7fa6b0'

export const LABEL_TYPE_LABELS = {
  esl: 'Shelf-edge ESL',
  'hybrid-sign': 'Showroom sign — paper body, electronic price',
}

export const labelTypeLabel = (t) => LABEL_TYPE_LABELS[t] ?? t

export const DISPLAY_TYPE_LABELS = {
  'shelf-edge': 'Shelf edge',
  'showroom-display': 'Showroom display',
  'warehouse-rack': 'Warehouse rack',
  bin: 'Bin table',
}

export const displayTypeLabel = (t) => DISPLAY_TYPE_LABELS[t] ?? t
