import { CanvasTexture, SRGBColorSpace } from 'three'
import { drawProductGlyph } from './glyphs.js'
import { qrCanvas } from './qr.js'
import { formatPrice, formatPriceAr, effectivePrice, stockLabel } from './format.js'

/**
 * Shelf-edge ESL face, painted at 512x320 for a 0.16 x 0.10 m plane.
 *
 * The palette is deliberately e-paper: paper white, near-black ink, one red.
 * That restraint is what makes it read as a real electronic tag rather than a
 * printed card — the "powered" cue lives on the housing, not the screen.
 */

const W = 512
const H = 320
const INK = '#0d1418'
const PAPER = '#f6f7f5'
const RED = '#e11d2e'
const GREY = '#69747a'

const cache = new Map()

/**
 * @param {import('../data/products.js').Product} product
 * @param {import('../data/products.js').ProductLocation} location
 * @returns {CanvasTexture}
 */
export function eslTexture(product, location) {
  const key = `${product.id}:${location.id}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)

  // --- header strip: aisle chip, section, stock pip -------------------------
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, W, 46)
  ctx.textBaseline = 'middle'
  ctx.fillStyle = PAPER
  ctx.font = '700 24px Inter, Segoe UI, sans-serif'
  ctx.fillText(location.aisle, 16, 24)
  ctx.fillStyle = '#9fb6bd'
  ctx.font = '500 19px Inter, Segoe UI, sans-serif'
  ctx.fillText(fit(ctx, location.section.toUpperCase(), 300), 92, 24)
  ctx.fillStyle = product.stockStatus === 'out-of-stock' ? RED : '#3ad39f'
  ctx.beginPath()
  ctx.arc(W - 26, 23, 8, 0, Math.PI * 2)
  ctx.fill()

  // --- product illustration --------------------------------------------------
  drawProductGlyph(ctx, product.category, 14, 58, 100, product.colorHex)

  // --- bilingual names -------------------------------------------------------
  ctx.textBaseline = 'top'
  ctx.fillStyle = INK
  ctx.font = '700 29px Inter, Segoe UI, sans-serif'
  ctx.fillText(fit(ctx, product.nameEn, 356), 126, 60)

  ctx.direction = 'rtl'
  ctx.textAlign = 'right'
  ctx.font = '600 23px Segoe UI, Tahoma, sans-serif'
  ctx.fillStyle = '#3b4750'
  ctx.fillText(product.nameAr, W - 16, 96)
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'

  // --- price block -----------------------------------------------------------
  const promo = product.promoPrice != null
  ctx.fillStyle = promo ? RED : INK
  ctx.font = '800 58px Inter, Segoe UI, sans-serif'
  ctx.fillText(formatPrice(effectivePrice(product)), 14, 150)

  ctx.font = '500 20px Segoe UI, Tahoma, sans-serif'
  ctx.fillStyle = GREY
  ctx.fillText(formatPriceAr(effectivePrice(product)), 16, 214)

  let x = 16
  ctx.font = '500 21px Inter, Segoe UI, sans-serif'
  if (promo) {
    const was = formatPrice(product.price)
    ctx.fillStyle = GREY
    ctx.fillText(was, x, 242)
    const w = ctx.measureText(was).width
    ctx.strokeStyle = GREY
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, 253)
    ctx.lineTo(x + w, 253)
    ctx.stroke()
    x += w + 14
  }
  if (product.oldPrice != null) {
    ctx.fillStyle = GREY
    ctx.fillText(`was ${formatPrice(product.oldPrice)}`, x, 242)
  }

  // --- footer: article, dimensions, stock -------------------------------------
  const d = product.dimensions
  ctx.font = '500 18px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = GREY
  ctx.fillText(fit(ctx, `${product.articleNo}  ·  ${d.width}×${d.depth}×${d.height} ${d.unit}`, 350), 16, 274)
  ctx.fillStyle = product.stockStatus === 'out-of-stock' ? RED : '#2b7f63'
  ctx.font = '600 18px Inter, Segoe UI, sans-serif'
  ctx.fillText(`${stockLabel(product.stockStatus)}  ·  ${product.sku}`, 16, 296)

  // --- QR, bottom-right on a white quiet zone --------------------------------
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(W - 140, H - 140, 128, 128)
  ctx.drawImage(qrCanvas(product.qrCode, 116), W - 134, H - 134, 116, 116)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

/** Truncate a string to a pixel width, adding an ellipsis. */
function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let out = text
  while (out.length > 3 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1)
  return `${out}…`
}

export function disposeEslTextures() {
  for (const t of cache.values()) t.dispose()
  cache.clear()
}
