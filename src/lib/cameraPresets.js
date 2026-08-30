export const VIEW_ORDER = ['twin', 'plan', 'isometric', 'side', 'top', 'interior']

/** Camera rigs behind the toolbar buttons. CameraRig eases between them. */
export const VIEW_PRESETS = {
  twin:      { id: 'twin',      label: '3D Twin',   position: [34, 26, 40],  target: [0, 4, 0],     fov: 38 },
  plan:      { id: 'plan',      label: 'Plan View', position: [0, 64, 0.01], target: [0, 0, 0],     fov: 34 },
  isometric: { id: 'isometric', label: 'Isometric', position: [40, 36, 40],  target: [0, 3, 0],     fov: 26 },
  side:      { id: 'side',      label: 'Side',      position: [0, 8, 58],    target: [0, 5, 0],     fov: 30 },
  top:       { id: 'top',       label: 'Top',       position: [0, 50, 16],   target: [0, 2, 0],     fov: 40 },
  interior:  { id: 'interior',  label: 'Interior',  position: [-2, 2.6, 11], target: [-9, 2.2, -2], fov: 62 },
}

export const getPreset = (id) => VIEW_PRESETS[id] ?? VIEW_PRESETS.twin

/** Frame a single placement from a comfortable three-quarter angle. */
export function focusOnPlacement(placement) {
  const [x, y, z] = placement.location.positionInScene
  return {
    id: 'focus',
    label: 'Focus',
    target: [x, y + 1, z],
    position: [x + 4.2, y + 3.4, z + 4.2],
    fov: 42,
  }
}
