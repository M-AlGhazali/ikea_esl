import { CanvasTexture, SRGBColorSpace } from 'three'
import { drawProductGlyph } from './glyphs.js'
import { qrCanvas } from './qr.js'
import { formatPrice, formatPriceAr, effectivePrice, discountPercent } from './format.js'

/**
 * The large hanging showroom sign, painted as TWO textures on purpose.
 *
 * The upper body stays a matte printed information sheet; the lower red block
 * is a screen and gets its own emissive material in LargeInfoSign. Merging them
 * into one texture would lose exactly the contrast the concept is about.
 */

const PW = 900
const PH = 1050
const SW = 900
const SH = 330

const paperCache = new Map()
const priceCache = new Map()

/** Matte printed information sheet — the top of the hanging sign. */
export function signPaperTexture(product) {
  const hit = paperCache.get(product.id)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = PW
  canvas.height = PH
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#fbfbf8'
  ctx.fillRect(0, 0, PW, PH)
  ctx.strokeStyle = '#d8d9d2'
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, PW - 3, PH - 3)

  // punched hanging hole
  ctx.fillStyle = '#e6e7e0'
  ctx.beginPath()
  ctx.arc(PW / 2, 44, 15, 0, Math.PI * 2)
  ctx.fill()

  ctx.textBaseline = 'top'

  const [first, ...rest] = product.nameEn.split(' ')
  ctx.fillStyle = '#0d1418'
  ctx.font = '800 66px Inter, Segoe UI, sans-serif'
  ctx.fillText(first, 56, 96)
  ctx.font = '500 38px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = '#4b565c'
  ctx.fillText(rest.join(' '), 56, 176)

  ctx.direction = 'rtl'
  ctx.textAlign = 'right'
  ctx.font = '600 40px Segoe UI, Tahoma, sans-serif'
  ctx.fillStyle = '#2b353b'
  ctx.fillText(product.nameAr, PW - 56, 168)
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'

  ctx.strokeStyle = '#0d1418'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(56, 244)
  ctx.lineTo(PW - 56, 244)
  ctx.stroke()

  drawProductGlyph(ctx, product.category, 56, 280, 300, product.colorHex)

  wrapText(ctx, product.description, 392, 292, PW - 448, 40, {
    font: '400 29px Inter, Segoe UI, sans-serif',
    fill: '#39464d',
  })

  const rows = [
    ['Article No.', product.articleNo],
    ['Dimensions', `${product.dimensions.width} × ${product.dimensions.depth} × ${product.dimensions.height} cm`],
    ['Material', product.material],
    ['Colour', product.color],
    ['Weight', `${product.weightKg} kg`],
  ]
  let y = 620
  for (const [k, v] of rows) {
    ctx.font = '500 27px Inter, Segoe UI, sans-serif'
    ctx.fillStyle = '#8a949a'
    ctx.fillText(k, 56, y)
    ctx.fillStyle = '#0d1418'
    ctx.fillText(clip(ctx, v, PW - 400), 340, y)
    ctx.strokeStyle = '#eceded'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(56, y + 44)
    ctx.lineTo(PW - 56, y + 44)
    ctx.stroke()
    y += 62
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(PW - 216, PH - 210, 162, 162)
  ctx.drawImage(qrCanvas(product.qrCode, 150), PW - 210, PH - 204, 150, 150)
  ctx.font = '500 24px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = '#8a949a'
  ctx.fillText('Scan for full product details', 56, PH - 92)
  ctx.font = '500 22px Inter, Segoe UI, sans-serif'
  ctx.fillText(product.sku, 56, PH - 60)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  paperCache.set(product.id, texture)
  return texture
}

/** The electronic red price panel — the bottom of the hanging sign. */
export function signPriceTexture(product) {
  const hit = priceCache.get(product.id)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = SW
  canvas.height = SH
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 0, SH)
  grad.addColorStop(0, '#f0263a')
  grad.addColorStop(1, '#c0122a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, SW, SH)

  // faint scanlines: the cue that reads "screen", not "print"
  ctx.globalAlpha = 0.07
  ctx.fillStyle = '#ffffff'
  for (let y = 0; y < SH; y += 4) ctx.fillRect(0, y, SW, 1)
  ctx.globalAlpha = 1

  ctx.textBaseline = 'top'

  // live pill
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.beginPath()
  ctx.roundRect(48, 30, 344, 44, 22)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 22px Inter, Segoe UI, sans-serif'
  ctx.fillText('◉  ELECTRONIC PRICE · LIVE', 68, 40)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 132px Inter, Segoe UI, sans-serif'
  ctx.fillText(formatPrice(effectivePrice(product)), 48, 100)

  ctx.font = '500 26px Segoe UI, Tahoma, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.fillText(formatPriceAr(effectivePrice(product)), 50, 244)

  const pct = discountPercent(product)
  if (pct > 0) {
    ctx.fillStyle = '#ffdb00'
    ctx.font = '800 46px Inter, Segoe UI, sans-serif'
    ctx.fillText(`−${pct}%`, SW - 210, 110)
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.font = '500 30px Inter, Segoe UI, sans-serif'
    const was = formatPrice(product.oldPrice ?? product.price)
    ctx.fillText(was, SW - 210, 172)
    const w = ctx.measureText(was).width
    ctx.strokeStyle = 'rgba(255,255,255,0.72)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(SW - 210, 188)
    ctx.lineTo(SW - 210 + w, 188)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 20px Inter, Segoe UI, sans-serif'
  ctx.fillText(`Synced · ${product.articleNo}`, SW - 300, 268)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  priceCache.set(product.id, texture)
  return texture
}

function clip(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let out = text
  while (out.length > 3 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1)
  return `${out}…`
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, { font, fill }) {
  ctx.font = font
  ctx.fillStyle = fill
  let line = ''
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      y += lineHeight
      line = word
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y)
  return y
}

export function disposeSignTextures() {
  for (const t of paperCache.values()) t.dispose()
  for (const t of priceCache.values()) t.dispose()
  paperCache.clear()
  priceCache.clear()
}
