/**
 * Flat, catalogue-style product illustrations painted with Canvas2D.
 *
 * No image assets and no network: the same painter feeds the ESL texture, the
 * hanging-sign texture and the DOM details panel, so a product looks identical
 * everywhere it appears.
 */

/**
 * Paint a category illustration into a square box at (x, y) of side `size`.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} category
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} tint  the product's colorHex
 */
export function drawProductGlyph(ctx, category, x, y, size, tint = '#8a8f94') {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 100, size / 100) // every painter draws in a 100x100 space
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#1b232a'
  ctx.fillStyle = tint
  ctx.lineWidth = 3
  ;(PAINTERS[category] ?? PAINTERS.default)(ctx, tint)
  ctx.restore()
}

/** Lighten (positive) or darken (negative) a hex colour by a flat amount. */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
  return `rgb(${clamp(((n >> 16) & 255) + amount)}, ${clamp(((n >> 8) & 255) + amount)}, ${clamp((n & 255) + amount)})`
}

const box = (ctx, x, y, w, h, r = 4) => {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

const PAINTERS = {
  Lamps(ctx, tint) {
    ctx.fillStyle = '#f2e6c9'
    ctx.beginPath()
    ctx.moveTo(32, 44); ctx.lineTo(68, 44); ctx.lineTo(60, 15); ctx.lineTo(40, 15); ctx.closePath()
    ctx.fill(); ctx.stroke()
    ctx.strokeStyle = '#1b232a'
    ctx.beginPath(); ctx.moveTo(50, 44); ctx.lineTo(50, 82); ctx.stroke()
    ctx.fillStyle = tint
    ctx.beginPath(); ctx.ellipse(50, 84, 19, 5.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  },

  Sofas(ctx, tint) {
    ctx.fillStyle = shade(tint, 20)
    box(ctx, 20, 28, 60, 20, 6); ctx.fill(); ctx.stroke()
    ctx.fillStyle = tint
    box(ctx, 14, 42, 72, 28, 6); ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(23, 70); ctx.lineTo(23, 80)
    ctx.moveTo(77, 70); ctx.lineTo(77, 80)
    ctx.stroke()
  },

  'Coffee Tables': (ctx, tint) => {
    ctx.fillStyle = tint
    box(ctx, 12, 36, 76, 8, 3); ctx.fill(); ctx.stroke()
    ctx.fillStyle = shade(tint, -22)
    box(ctx, 22, 58, 56, 6, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(20, 44); ctx.lineTo(20, 76)
    ctx.moveTo(80, 44); ctx.lineTo(80, 76)
    ctx.stroke()
  },

  'Bed Textiles': (ctx, tint) => {
    ctx.fillStyle = tint
    box(ctx, 16, 34, 68, 42, 8); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = shade(tint, -45)
    ctx.lineWidth = 2
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(16 + i * 17, 34); ctx.lineTo(16 + i * 17, 76); ctx.stroke()
    }
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1b232a'
    ctx.fillStyle = shade(tint, 30)
    box(ctx, 24, 22, 30, 16, 6); ctx.fill(); ctx.stroke()
  },

  'Storage Boxes': (ctx, tint) => {
    ctx.fillStyle = shade(tint, 18)
    box(ctx, 22, 24, 40, 24, 3); ctx.fill(); ctx.stroke()
    ctx.fillStyle = tint
    box(ctx, 16, 48, 56, 30, 3); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(36, 60); ctx.lineTo(52, 60); ctx.stroke()
  },

  Shelves(ctx, tint) {
    ctx.fillStyle = shade(tint, 24)
    box(ctx, 20, 16, 60, 68, 3); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = '#1b232a'
    for (const y of [36, 56]) {
      ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(80, y); ctx.stroke()
    }
    ctx.fillStyle = tint
    for (const [x, y, w, h] of [[27, 22, 6, 13], [36, 20, 6, 15], [47, 42, 6, 13], [56, 40, 6, 15]]) {
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
    }
  },

  Kitchen(ctx, tint) {
    ctx.fillStyle = tint
    ctx.beginPath(); ctx.ellipse(46, 52, 26, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = shade(tint, 40)
    ctx.beginPath(); ctx.ellipse(46, 48, 20, 15, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#1b232a'
    ctx.lineWidth = 6
    ctx.beginPath(); ctx.moveTo(70, 44); ctx.lineTo(90, 34); ctx.stroke()
    ctx.lineWidth = 3
  },

  Decor(ctx, tint) {
    ctx.fillStyle = tint
    ctx.beginPath()
    ctx.moveTo(42, 24)
    ctx.bezierCurveTo(30, 42, 28, 62, 40, 80)
    ctx.lineTo(60, 80)
    ctx.bezierCurveTo(72, 62, 70, 42, 58, 24)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
    ctx.strokeStyle = shade(tint, -50)
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(42, 26); ctx.lineTo(58, 26); ctx.stroke()
    ctx.lineWidth = 3
  },

  Dining(ctx, tint) {
    ctx.fillStyle = tint
    box(ctx, 10, 34, 80, 9, 3); ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(20, 43); ctx.lineTo(20, 82)
    ctx.moveTo(80, 43); ctx.lineTo(80, 82)
    ctx.moveTo(20, 50); ctx.lineTo(80, 50)
    ctx.stroke()
  },

  Office(ctx, tint) {
    ctx.fillStyle = tint
    box(ctx, 34, 16, 34, 32, 8); ctx.fill(); ctx.stroke()
    ctx.fillStyle = shade(tint, 22)
    box(ctx, 28, 50, 46, 14, 5); ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(51, 64); ctx.lineTo(51, 76)
    ctx.moveTo(36, 82); ctx.lineTo(66, 82)
    ctx.stroke()
  },

  Bedroom(ctx, tint) {
    ctx.fillStyle = shade(tint, -18)
    box(ctx, 10, 26, 14, 46, 4); ctx.fill(); ctx.stroke()
    ctx.fillStyle = tint
    box(ctx, 22, 46, 66, 26, 5); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#f4f2ec'
    box(ctx, 28, 34, 24, 14, 5); ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(26, 72); ctx.lineTo(26, 80)
    ctx.moveTo(84, 72); ctx.lineTo(84, 80)
    ctx.stroke()
  },

  default(ctx, tint) {
    ctx.fillStyle = tint
    box(ctx, 22, 26, 56, 50, 6); ctx.fill(); ctx.stroke()
  },
}

export const GLYPH_CATEGORIES = Object.keys(PAINTERS).filter((k) => k !== 'default')
