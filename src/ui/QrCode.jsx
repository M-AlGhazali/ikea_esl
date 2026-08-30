import { useEffect, useRef } from 'react'
import { qrCanvas } from '../lib/qr.js'

/** Real, scannable QR for a product, drawn into a DOM canvas. */
export default function QrCode({ value, size = 96, className = '' }) {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(qrCanvas(value, 256), 0, 0, canvas.width, canvas.height)
  }, [value, size])

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className={`rounded-sm bg-white ${className}`}
    />
  )
}
