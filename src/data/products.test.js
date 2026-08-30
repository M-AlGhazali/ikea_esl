import { describe, expect, it } from 'vitest'
import { PRODUCTS, getProduct, getPlacementRecord } from './products.js'

const CATEGORIES = [
  'Lamps', 'Sofas', 'Coffee Tables', 'Bed Textiles', 'Storage Boxes',
  'Shelves', 'Kitchen', 'Decor', 'Dining', 'Office', 'Bedroom',
]

describe('product catalog', () => {
  it('has 16 products', () => {
    expect(PRODUCTS).toHaveLength(16)
  })

  it('has unique ids, skus and article numbers', () => {
    const ids = PRODUCTS.map((p) => p.id)
    const skus = PRODUCTS.map((p) => p.sku)
    const arts = PRODUCTS.map((p) => p.articleNo)
    expect(new Set(ids).size).toBe(PRODUCTS.length)
    expect(new Set(skus).size).toBe(PRODUCTS.length)
    expect(new Set(arts).size).toBe(PRODUCTS.length)
  })

  it('gives every product bilingual names and a description', () => {
    for (const p of PRODUCTS) {
      expect(p.nameEn.length).toBeGreaterThan(2)
      expect(p.nameAr.length).toBeGreaterThan(2)
      expect(/[؀-ۿ]/.test(p.nameAr)).toBe(true)
      expect(p.description.length).toBeGreaterThan(20)
    }
  })

  it('uses SAR and sane price relationships', () => {
    for (const p of PRODUCTS) {
      expect(p.currency).toBe('SAR')
      expect(p.price).toBeGreaterThan(0)
      if (p.promoPrice != null) expect(p.promoPrice).toBeLessThan(p.price)
      if (p.oldPrice != null) expect(p.oldPrice).toBeGreaterThan(p.price)
    }
  })

  it('keeps stockStatus consistent with stockCount', () => {
    for (const p of PRODUCTS) {
      expect(['in-stock', 'low-stock', 'out-of-stock']).toContain(p.stockStatus)
      if (p.stockStatus === 'out-of-stock') expect(p.stockCount).toBe(0)
      if (p.stockStatus === 'low-stock') expect(p.stockCount).toBeLessThanOrEqual(8)
      if (p.stockStatus === 'in-stock') expect(p.stockCount).toBeGreaterThan(8)
    }
  })

  it('covers every demo category', () => {
    const used = new Set(PRODUCTS.map((p) => p.category))
    for (const c of CATEGORIES) expect(used).toContain(c)
  })

  it('gives every product a hex colour and a qr target', () => {
    for (const p of PRODUCTS) {
      expect(p.colorHex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(p.qrCode).toBe(`https://esl.demo/p/${p.sku}`)
      expect(['esl', 'hybrid-sign']).toContain(p.labelType)
    }
  })

  it('gives every location a full address and a scene position', () => {
    for (const p of PRODUCTS) {
      expect(p.locations.length).toBeGreaterThan(0)
      for (const loc of p.locations) {
        expect(loc.id).toMatch(/^loc-/)
        expect([0, 1]).toContain(loc.floor)
        expect(loc.zone).toBeTruthy()
        expect(loc.zoneLabel).toBeTruthy()
        expect(loc.section).toBeTruthy()
        expect(loc.aisle).toBeTruthy()
        expect(loc.shelf).toBeTruthy()
        expect(['esl', 'hybrid-sign']).toContain(loc.labelType)
        expect(['shelf-edge', 'showroom-display', 'warehouse-rack', 'bin'])
          .toContain(loc.displayType)
        expect(loc.positionInScene).toHaveLength(3)
        expect(loc.labelPosition).toHaveLength(3)
        expect(loc.positionInScene.every(Number.isFinite)).toBe(true)
        expect(loc.labelPosition.every(Number.isFinite)).toBe(true)
        expect(Number.isFinite(loc.rotationY)).toBe(true)
      }
    }
  })

  it('has exactly 4 products in more than one location', () => {
    const multi = PRODUCTS.filter((p) => p.locations.length > 1)
    expect(multi).toHaveLength(4)
    expect(multi.map((p) => p.id).sort()).toEqual(['p-001', 'p-004', 'p-005', 'p-007'])
  })

  it('has globally unique location ids', () => {
    const all = PRODUCTS.flatMap((p) => p.locations.map((l) => l.id))
    expect(new Set(all).size).toBe(all.length)
    expect(all).toHaveLength(20)
  })

  it('has exactly 5 hybrid-sign locations', () => {
    const signs = PRODUCTS.flatMap((p) => p.locations).filter((l) => l.labelType === 'hybrid-sign')
    expect(signs).toHaveLength(5)
  })

  it('shows the bookcase as flat-pack in the warehouse and assembled upstairs', () => {
    const book = getProduct('p-007')
    const types = book.locations.map((l) => l.displayType)
    expect(types).toContain('warehouse-rack')
    expect(types).toContain('showroom-display')
  })

  it('puts both lamp instances on the second floor', () => {
    const lamp = getProduct('p-001')
    expect(lamp.locations).toHaveLength(2)
    expect(lamp.locations.every((l) => l.floor === 1)).toBe(true)
  })

  it('looks a placement record up by location id', () => {
    const rec = getPlacementRecord('loc-001b')
    expect(rec.product.id).toBe('p-001')
    expect(rec.location.zone).toBe('sf-living-a')
    expect(getPlacementRecord('nope')).toBeUndefined()
  })

  it('returns undefined for an unknown id', () => {
    expect(getProduct('nope')).toBeUndefined()
  })
})

describe('the lamp demonstrates both label types', () => {
  it('labels p-001 with an ESL in one location and a hybrid sign in the other', () => {
    const lamp = getProduct('p-001')
    expect(lamp.locations.map((l) => l.labelType).sort()).toEqual(['esl', 'hybrid-sign'])
  })
})
