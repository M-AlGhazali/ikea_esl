import { useEffect, useRef } from 'react'
import { drawProductGlyph } from '../lib/glyphs.js'

/** The same canvas painter the 3D labels use, rendered into the DOM panel. */
export default function ProductGlyph({ category, tint, size = 120, className = '' }) {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    drawProductGlyph(ctx, category, 0, 0, size, tint)
  }, [category, tint, size])

  return <canvas ref={ref} style={{ width: size, height: size }} className={className} />
}
