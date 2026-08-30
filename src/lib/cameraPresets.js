export const VIEW_ORDER = ['twin', 'plan', 'isometric', 'side', 'top', 'interior']

/** Camera rigs behind the toolbar buttons. CameraRig eases between them. */
export const VIEW_PRESETS = {
  twin:      { id: 'twin',      label: '3D Twin',   position: [40, 30, 46],  target: [0, 5, 0],     fov: 38 },
  plan:      { id: 'plan',      label: 'Plan View', position: [0, 72, 0.01], target: [0, 3, 0],     fov: 34 },
  isometric: { id: 'isometric', label: 'Isometric', position: [46, 42, 46],  target: [0, 5, 0],     fov: 26 },
  side:      { id: 'side',      label: 'Side',      position: [0, 9, 66],    target: [0, 6, 0],     fov: 30 },
  top:       { id: 'top',       label: 'Top',       position: [0, 58, 20],   target: [0, 4, 0],     fov: 40 },
  interior:  { id: 'interior',  label: 'Interior',  position: [-1, 2.6, 11], target: [-9, 2.2, -3], fov: 62 },
}

export const getPreset = (id) => VIEW_PRESETS[id] ?? VIEW_PRESETS.twin

/**
 * Frame a single placement from a comfortable three-quarter angle.
 *
 * `yOffset` carries the cutaway lift applied to the placement floor, so the
 * camera lands on the product where it actually is in the exploded view rather
 * than where its raw coordinates say it is.
 */
export function focusOnPlacement(placement, yOffset = 0) {
  const [x, y, z] = placement.location.positionInScene
  const ly = y + yOffset
  return {
    id: 'focus',
    label: 'Focus',
    target: [x, ly + 1, z],
    position: [x + 4.2, ly + 3.4, z + 4.2],
    fov: 42,
  }
}
