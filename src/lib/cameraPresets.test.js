import { describe, expect, it } from 'vitest'
import { VIEW_PRESETS, VIEW_ORDER, getPreset, focusOnPlacement } from './cameraPresets.js'

describe('camera presets', () => {
  it('exposes the six toolbar views in order', () => {
    expect(VIEW_ORDER).toEqual(['twin', 'plan', 'isometric', 'side', 'top', 'interior'])
  })

  it('gives every preset a position, target, fov and label', () => {
    for (const id of VIEW_ORDER) {
      const p = VIEW_PRESETS[id]
      expect(p.id).toBe(id)
      expect(p.label).toBeTruthy()
      expect(p.position).toHaveLength(3)
      expect(p.target).toHaveLength(3)
      expect(p.fov).toBeGreaterThan(10)
      expect(p.fov).toBeLessThan(90)
    }
  })

  it('falls back to the twin view for an unknown id', () => {
    expect(getPreset('nope')).toBe(VIEW_PRESETS.twin)
  })

  it('targets a placement and stands off from it', () => {
    const placement = { location: { positionInScene: [13.2, 5, -9.5] } }
    const cam = focusOnPlacement(placement)
    expect(cam.target).toEqual([13.2, 6, -9.5])
    expect(cam.position[0]).toBeGreaterThan(13.2)
    expect(cam.position[1]).toBeGreaterThan(6)
  })

  it('keeps the focus camera above the floor for a ground-floor placement', () => {
    const cam = focusOnPlacement({ location: { positionInScene: [0, 0, 0] } })
    expect(cam.position[1]).toBeGreaterThan(1)
  })
})
