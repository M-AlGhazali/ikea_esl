import QRCode from 'qrcode'

const cache = new Map()

/**
 * Render a real, scannable QR code onto an offscreen canvas, cached per
 * (text, size). `toCanvas` paints synchronously when handed an existing canvas,
 * so the returned element is safe to sample immediately.
 *
 * @param {string} text
 * @param {number} size  pixels
 * @returns {HTMLCanvasElement}
 */
export function qrCanvas(text, size = 160) {
  const key = `${text}@${size}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b1114ff', light: '#ffffffff' },
  })
  cache.set(key, canvas)
  return canvas
}
