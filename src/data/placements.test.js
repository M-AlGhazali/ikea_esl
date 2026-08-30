import { describe, expect, it } from 'vitest'
import { PLACEMENTS, getPlacement, placementsForProduct, placementsOnFloor, placementsInZone } from './placements.js'
import { STORE, ZONES, FIXTURES, getZone } from './storeLayout.js'
import { PRODUCTS } from './products.js'

describe('placements', () => {
  it('flattens every product location into one entry', () => {
    const total = PRODUCTS.reduce((n, p) => n + p.locations.length, 0)
    expect(PLACEMENTS).toHaveLength(total)
    expect(PLACEMENTS).toHaveLength(20)
  })

  it('carries the product reference on each placement', () => {
    for (const pl of PLACEMENTS) {
      expect(pl.product.id).toBe(pl.productId)
      expect(pl.location.id).toBe(pl.id)
      expect(pl.labelType).toBe(pl.location.labelType)
    }
  })

  it('looks a placement up by id', () => {
    expect(getPlacement('loc-001a').productId).toBe('p-001')
    expect(getPlacement('missing')).toBeUndefined()
  })

  it('returns both placements for a multi-location product', () => {
    expect(placementsForProduct('p-001').map((p) => p.id)).toEqual(['loc-001a', 'loc-001b'])
  })

  it('splits placements by floor', () => {
    expect(placementsOnFloor(0).every((p) => p.floor === 0)).toBe(true)
    expect(placementsOnFloor(1).every((p) => p.floor === 1)).toBe(true)
    expect(placementsOnFloor(0).length + placementsOnFloor(1).length).toBe(PLACEMENTS.length)
  })

  it('groups placements by zone', () => {
    expect(placementsInZone('sf-living-a').map((p) => p.id).sort())
      .toEqual(['loc-001b', 'loc-002a', 'loc-003a'])
  })

  it('places every product inside its declared zone bounds', () => {
    for (const pl of PLACEMENTS) {
      const zone = getZone(pl.location.zone)
      expect(zone, `unknown zone ${pl.location.zone}`).toBeDefined()
      const [x, , z] = pl.location.positionInScene
      expect(x, pl.id).toBeGreaterThanOrEqual(zone.x[0] - 1)
      expect(x, pl.id).toBeLessThanOrEqual(zone.x[1] + 1)
      expect(z, pl.id).toBeGreaterThanOrEqual(zone.z[0] - 1)
      expect(z, pl.id).toBeLessThanOrEqual(zone.z[1] + 1)
    }
  })

  it('keeps every label inside its zone bounds too', () => {
    for (const pl of PLACEMENTS) {
      const zone = getZone(pl.location.zone)
      const [x, , z] = pl.location.labelPosition
      expect(x, pl.id).toBeGreaterThanOrEqual(zone.x[0] - 2)
      expect(x, pl.id).toBeLessThanOrEqual(zone.x[1] + 2)
      expect(z, pl.id).toBeGreaterThanOrEqual(zone.z[0] - 2)
      expect(z, pl.id).toBeLessThanOrEqual(zone.z[1] + 2)
    }
  })

  it('keeps every product between its floor level and the ceiling above it', () => {
    for (const pl of PLACEMENTS) {
      const floorY = pl.floor === 0 ? STORE.groundY : STORE.secondY
      const ceilY = pl.floor === 0 ? STORE.groundCeilingY : STORE.secondCeilingY
      expect(pl.location.positionInScene[1], pl.id).toBeGreaterThanOrEqual(floorY)
      expect(pl.location.positionInScene[1], pl.id).toBeLessThan(ceilY)
      expect(pl.location.labelPosition[1], pl.id).toBeGreaterThanOrEqual(floorY)
      expect(pl.location.labelPosition[1], pl.id).toBeLessThan(ceilY)
    }
  })

  it('hangs every large sign high enough to clear the product below it', () => {
    for (const pl of PLACEMENTS.filter((p) => p.labelType === 'hybrid-sign')) {
      const floorY = pl.floor === 0 ? STORE.groundY : STORE.secondY
      expect(pl.location.labelPosition[1] - floorY, pl.id).toBeGreaterThan(1.5)
    }
  })

  it('keeps every placement out of the atrium void', () => {
    for (const pl of PLACEMENTS) {
      const [x, , z] = pl.location.positionInScene
      const inAtrium =
        x > STORE.atrium.x[0] && x < STORE.atrium.x[1] &&
        z > STORE.atrium.z[0] && z < STORE.atrium.z[1]
      expect(inAtrium, `${pl.id} sits in the atrium void`).toBe(false)
    }
  })

  it('keeps every placement inside the building footprint', () => {
    for (const pl of PLACEMENTS) {
      const [x, , z] = pl.location.positionInScene
      expect(x, pl.id).toBeGreaterThan(STORE.x[0])
      expect(x, pl.id).toBeLessThan(STORE.x[1])
      expect(z, pl.id).toBeGreaterThan(STORE.z[0])
      expect(z, pl.id).toBeLessThan(STORE.z[1])
    }
  })

  it('defines a zone entry for every zone referenced by a location', () => {
    const referenced = new Set(PLACEMENTS.map((p) => p.location.zone))
    for (const id of referenced) expect(ZONES.some((z) => z.id === id)).toBe(true)
  })

  it('matches each location floor to its zone floor', () => {
    for (const pl of PLACEMENTS) {
      expect(getZone(pl.location.zone).floor, pl.id).toBe(pl.floor)
    }
  })
})

describe('store layout', () => {
  it('keeps the atrium inside the footprint', () => {
    expect(STORE.atrium.x[0]).toBeGreaterThan(STORE.x[0])
    expect(STORE.atrium.x[1]).toBeLessThan(STORE.x[1])
    expect(STORE.atrium.z[0]).toBeGreaterThan(STORE.z[0])
    expect(STORE.atrium.z[1]).toBeLessThan(STORE.z[1])
  })

  it('gives every zone a unique id and non-inverted bounds', () => {
    expect(new Set(ZONES.map((z) => z.id)).size).toBe(ZONES.length)
    for (const z of ZONES) {
      expect(z.x[0], z.id).toBeLessThan(z.x[1])
      expect(z.z[0], z.id).toBeLessThan(z.z[1])
      expect([0, 1]).toContain(z.floor)
      expect(z.accent).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('places every fixture inside its zone', () => {

    for (const fx of FIXTURES) {
      const zone = getZone(fx.zone)
      expect(zone, fx.id).toBeDefined()
      expect(fx.position[0], fx.id).toBeGreaterThanOrEqual(zone.x[0] - 1.5)
      expect(fx.position[0], fx.id).toBeLessThanOrEqual(zone.x[1] + 1.5)
      expect(fx.position[2], fx.id).toBeGreaterThanOrEqual(zone.z[0] - 1.5)
      expect(fx.position[2], fx.id).toBeLessThanOrEqual(zone.z[1] + 1.5)
    }
  })
})
