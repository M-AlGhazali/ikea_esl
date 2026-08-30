import { create } from 'zustand'
import { getPlacement, placementsForProduct } from '../data/placements.js'
import { floorLift } from '../data/storeLayout.js'
import { getPreset, focusOnPlacement } from '../lib/cameraPresets.js'

/**
 * Single source of truth for the whole page. The 3D scene and the right-hand
 * details panel are both pure consumers of this store — nothing else holds
 * selection or view state.
 */
export const useStoreState = create((set, get) => ({
  // --- selection ------------------------------------------------------------
  selectedPlacementId: null,
  selectedProductId: null,
  hoveredPlacementId: null,
  activeTab: 'overview',

  // --- view -----------------------------------------------------------------
  view: 'twin',
  floorFilter: 'all', // 'all' | 'ground' | 'second'
  cutaway: 0.7, // 0 = sealed shell, 1 = fully opened up
  showDimensions: false,

  /** One-shot camera goal, consumed by CameraRig on the next frame. */
  cameraRequest: getPreset('twin'),

  selectPlacement(placementId) {
    const placement = getPlacement(placementId)
    if (!placement) return
    const sameProduct = get().selectedProductId === placement.productId
    set({
      selectedPlacementId: placement.id,
      selectedProductId: placement.productId,
      activeTab: sameProduct ? get().activeTab : 'overview',
      cameraRequest: focusOnPlacement(placement, floorLift(placement.floor, get().cutaway)),
    })
  },

  /** Select a product via its first placement — used by the catalog list. */
  selectProduct(productId) {
    const [first] = placementsForProduct(productId)
    if (!first) return
    get().selectPlacement(first.id)
  },

  clearSelection() {
    set({ selectedPlacementId: null, selectedProductId: null, activeTab: 'overview' })
  },

  setHovered: (hoveredPlacementId) => set({ hoveredPlacementId }),
  setActiveTab: (activeTab) => set({ activeTab }),

  setView(view) {
    set({ view, cameraRequest: getPreset(view) })
  },

  setFloorFilter: (floorFilter) => set({ floorFilter }),
  setCutaway: (v) => set({ cutaway: Math.min(1, Math.max(0, v)) }),
  toggleDimensions: () => set((s) => ({ showDimensions: !s.showDimensions })),

  consumeCameraRequest() {
    const req = get().cameraRequest
    if (req) set({ cameraRequest: null })
    return req
  },
}))
