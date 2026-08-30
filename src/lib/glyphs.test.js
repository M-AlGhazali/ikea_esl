import { describe, expect, it } from 'vitest'
import { GLYPH_CATEGORIES, shade } from './glyphs.js'
import { PRODUCTS } from '../data/products.js'

describe('glyphs', () => {
  it('has a painter for every category in the catalog', () => {
    const used = new Set(PRODUCTS.map((p) => p.category))
    for (const c of used) expect(GLYPH_CATEGORIES).toContain(c)
  })

  it('lightens and darkens a hex colour without leaving 0..255', () => {
    expect(shade('#000000', -50)).toBe('rgb(0, 0, 0)')
    expect(shade('#ffffff', 50)).toBe('rgb(255, 255, 255)')
    expect(shade('#808080', 16)).toBe('rgb(144, 144, 144)')
  })
})
