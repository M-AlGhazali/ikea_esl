import { CanvasTexture, SRGBColorSpace } from 'three'

/**
 * The storefront fascia sign: blue panel, Arabic wordmark on the left, and the
 * big yellow oval logo above the entrance — the arrangement in the reference
 * photo of the Saudi store.
 *
 * Painted on canvas rather than drawn with drei <Text> because the bundled 3D
 * font has no Arabic coverage, while the browser 2D context shapes Arabic
 * correctly — the same reason the ESL and sign textures are canvas-painted.
 *
 * NOTE: this is a stylised mark drawn from primitives for the concept demo, not
 * the official brand asset. Swap in the real artwork before any external use.
 */

const W = 2048
const H = 410
const BLUE = '#0058a3'
const YELLOW = '#ffdb00'

let cached = null

export function storefrontSignTexture() {
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = BLUE
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Arabic wordmark, left third
  ctx.fillStyle = YELLOW
  ctx.direction = 'rtl'
  ctx.font = '700 132px "Segoe UI", Tahoma, sans-serif'
  ctx.fillText('ايكيا', 470, H / 2 - 18)
  ctx.direction = 'ltr'
  ctx.font = '500 40px "Segoe UI", Tahoma, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.fillText('مركز الطلب والاستلام', 470, H / 2 + 74)

  // The oval, right of centre
  const cx = 1440
  const cy = H / 2
  const rx = 400
  const ry = 158

  ctx.fillStyle = YELLOW
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()

  // inner keyline, the way the printed mark carries a thin blue edge
  ctx.strokeStyle = BLUE
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx - 20, ry - 20, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = BLUE
  ctx.font = '800 176px "Inter", "Segoe UI", Arial, sans-serif'
  if ('letterSpacing' in ctx) ctx.letterSpacing = '10px'
  ctx.fillText('IKEA', cx + 4, cy + 6)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'

  ctx.font = '600 40px "Inter", "Segoe UI", Arial, sans-serif'
  ctx.fillText('®', cx + rx - 34, cy - ry + 52)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  cached = texture
  return texture
}

export function disposeBrandTexture() {
  cached?.dispose()
  cached = null
}
