import { beforeEach, describe, expect, it } from 'vitest'
import { useStoreState } from './useStoreState.js'

const reset = () => useStoreState.setState(useStoreState.getInitialState(), true)

describe('app state', () => {
  beforeEach(reset)

  it('starts with nothing selected on the 3D twin view', () => {
    const s = useStoreState.getState()
    expect(s.selectedPlacementId).toBeNull()
    expect(s.selectedProductId).toBeNull()
    expect(s.view).toBe('twin')
    expect(s.floorFilter).toBe('all')
    expect(s.activeTab).toBe('overview')
    expect(s.cutaway).toBeGreaterThan(0)
    expect(s.showDimensions).toBe(false)
  })

  it('selects a placement and derives the product id', () => {
    useStoreState.getState().selectPlacement('loc-001b')
    const s = useStoreState.getState()
    expect(s.selectedPlacementId).toBe('loc-001b')
    expect(s.selectedProductId).toBe('p-001')
  })

  it('ignores an unknown placement id', () => {
    useStoreState.getState().selectPlacement('nope')
    expect(useStoreState.getState().selectedPlacementId).toBeNull()
  })

  it('resets the tab to overview when the product changes', () => {
    const { selectPlacement, setActiveTab } = useStoreState.getState()
    selectPlacement('loc-001a')
    setActiveTab('specs')
    selectPlacement('loc-002a')
    expect(useStoreState.getState().activeTab).toBe('overview')
  })

  it('keeps the tab when moving between locations of the same product', () => {
    const { selectPlacement, setActiveTab } = useStoreState.getState()
    selectPlacement('loc-001a')
    setActiveTab('locations')
    selectPlacement('loc-001b')
    expect(useStoreState.getState().activeTab).toBe('locations')
  })

  it('selects a product by choosing its first placement', () => {
    useStoreState.getState().selectProduct('p-001')
    expect(useStoreState.getState().selectedPlacementId).toBe('loc-001a')
  })

  it('ignores an unknown product id', () => {
    useStoreState.getState().selectProduct('p-999')
    expect(useStoreState.getState().selectedProductId).toBeNull()
  })

  it('clears the selection', () => {
    const s = useStoreState.getState()
    s.selectPlacement('loc-001a')
    s.clearSelection()
    expect(useStoreState.getState().selectedPlacementId).toBeNull()
    expect(useStoreState.getState().selectedProductId).toBeNull()
  })

  it('clamps the cutaway slider to 0..1', () => {
    const { setCutaway } = useStoreState.getState()
    setCutaway(2)
    expect(useStoreState.getState().cutaway).toBe(1)
    setCutaway(-1)
    expect(useStoreState.getState().cutaway).toBe(0)
    setCutaway(0.4)
    expect(useStoreState.getState().cutaway).toBe(0.4)
  })

  it('switches the floor filter', () => {
    useStoreState.getState().setFloorFilter('second')
    expect(useStoreState.getState().floorFilter).toBe('second')
  })

  it('toggles the dimensions overlay', () => {
    useStoreState.getState().toggleDimensions()
    expect(useStoreState.getState().showDimensions).toBe(true)
    useStoreState.getState().toggleDimensions()
    expect(useStoreState.getState().showDimensions).toBe(false)
  })

  it('queues a camera request that can be consumed once', () => {
    const { setView, consumeCameraRequest } = useStoreState.getState()
    setView('top')
    expect(useStoreState.getState().view).toBe('top')
    const req = consumeCameraRequest()
    expect(req.id).toBe('top')
    expect(consumeCameraRequest()).toBeNull()
  })

  it('queues a focus camera request when a placement is selected', () => {
    const { selectPlacement, consumeCameraRequest } = useStoreState.getState()
    consumeCameraRequest()
    selectPlacement('loc-010a')
    expect(consumeCameraRequest().id).toBe('focus')
  })

  it('tracks the hovered placement', () => {
    useStoreState.getState().setHovered('loc-003a')
    expect(useStoreState.getState().hoveredPlacementId).toBe('loc-003a')
    useStoreState.getState().setHovered(null)
    expect(useStoreState.getState().hoveredPlacementId).toBeNull()
  })
})
