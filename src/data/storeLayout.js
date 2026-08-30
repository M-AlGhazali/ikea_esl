/**
 * Geometry contract for the whole scene. Y is up, units are metres, the origin
 * is the centre of the store footprint, and +Z is the storefront.
 */
export const STORE = {
  width: 44,
  depth: 30,
  x: [-22, 22],
  z: [-15, 15],
  groundY: 0,
  groundCeilingY: 4.6,
  slabThickness: 0.4,
  secondY: 5.0,
  secondCeilingY: 9.6,
  roofY: 10.0,
  /** Void cut through the second-floor slab so both levels read at once. */
  atrium: { x: [-6, 6], z: [-4, 4] },
  /** How far the upper floor rises at full cutaway, in metres. */
  liftMax: 5.4,
}

/**
 * Vertical offset applied to everything on the second floor as the cutaway
 * slider opens. Lifting the upper level apart is what lets a viewer read both
 * floors at once without either becoming a ghost.
 */
export const secondFloorLift = (cutaway) => cutaway * STORE.liftMax

/** The lift for a given floor index. Floor 0 never moves. */
export const floorLift = (floor, cutaway) => (floor === 1 ? secondFloorLift(cutaway) : 0)

/**
 * @typedef {Object} Zone
 * @property {string} id
 * @property {string} label
 * @property {string} labelAr
 * @property {0|1} floor
 * @property {[number,number]} x
 * @property {[number,number]} z
 * @property {'market-hall'|'warehouse'|'showroom'|'circulation'|'checkout'} kind
 * @property {string} accent
 */

/** @type {Zone[]} */
export const ZONES = [
  { id: 'gf-entrance',    label: 'Entrance & Transition',   labelAr: 'المدخل',            floor: 0, x: [-8, 8],    z: [10, 15],   kind: 'circulation', accent: '#ffdb00' },
  { id: 'gf-accessories', label: 'Home Accessories',        labelAr: 'إكسسوارات المنزل',  floor: 0, x: [-21, -14], z: [3, 10],    kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-kitchen',     label: 'Kitchen & Tableware',     labelAr: 'أدوات المطبخ',      floor: 0, x: [-21, -14], z: [-3, 3],    kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-textiles',    label: 'Textiles & Bedding',      labelAr: 'المنسوجات',         floor: 0, x: [-21, -14], z: [-12, -4],  kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-decor',       label: 'Decor & Organizers',      labelAr: 'الديكور والتنظيم',  floor: 0, x: [-12, -7],  z: [-13, -5],  kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-lighting',    label: 'Lighting Accessories',    labelAr: 'إكسسوارات الإضاءة', floor: 0, x: [-12, -7],  z: [0, 8],     kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-display',     label: 'Small Furniture Display', labelAr: 'عرض الأثاث الصغير', floor: 0, x: [-2, 6],    z: [-14, -8],  kind: 'showroom',    accent: '#6defe6' },
  { id: 'gf-warehouse',   label: 'Self-Serve Warehouse',    labelAr: 'الخدمة الذاتية',    floor: 0, x: [10, 21],   z: [-14, 2],   kind: 'warehouse',   accent: '#ffb020' },
  { id: 'gf-checkout',    label: 'Checkout & Transition',   labelAr: 'الدفع',             floor: 0, x: [10, 20],   z: [8, 13],    kind: 'checkout',    accent: '#0058a3' },

  { id: 'sf-living-a',    label: 'Living Room Showroom A',  labelAr: 'صالة المعيشة أ',    floor: 1, x: [-20, -10], z: [2, 12],    kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-living-b',    label: 'Living Room Showroom B',  labelAr: 'صالة المعيشة ب',    floor: 1, x: [-20, -10], z: [-10, -1],  kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-bedroom',     label: 'Bedroom Showroom',        labelAr: 'غرفة النوم',        floor: 1, x: [-8, 0],    z: [-14, -6],  kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-storage',     label: 'Storage Solutions',       labelAr: 'حلول التخزين',      floor: 1, x: [-8, 2],    z: [8, 14],    kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-dining',      label: 'Dining Area',             labelAr: 'منطقة الطعام',      floor: 1, x: [8, 18],    z: [6, 14],    kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-office',      label: 'Office / Workspace',      labelAr: 'مساحة العمل',       floor: 1, x: [8, 18],    z: [-2, 4],    kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-lighting',    label: 'Lighting Showroom',       labelAr: 'معرض الإضاءة',      floor: 1, x: [8, 20],    z: [-14, -5],  kind: 'showroom', accent: '#35e0d4' },
]

export const getZone = (id) => ZONES.find((z) => z.id === id)
export const zonesOnFloor = (floor) => ZONES.filter((z) => z.floor === floor)

export const zoneCenter = (zone) => [
  (zone.x[0] + zone.x[1]) / 2,
  zone.floor === 0 ? STORE.groundY : STORE.secondY,
  (zone.z[0] + zone.z[1]) / 2,
]

export const zoneSize = (zone) => [zone.x[1] - zone.x[0], zone.z[1] - zone.z[0]]

/**
 * Shelf runs, racks, bin tables and counters. `kind` selects the component and
 * `size` is [width, height, depth] in metres.
 *
 * @typedef {Object} Fixture
 * @property {string} id
 * @property {string} zone
 * @property {'shelf'|'rack'|'bin'|'counter'} kind
 * @property {[number,number,number]} position  Base of the unit, world space
 * @property {number} rotationY
 * @property {[number,number,number]} size
 * @property {number} [shelves]
 *
 * @type {Fixture[]}
 */
export const FIXTURES = [
  // --- Home Accessories -----------------------------------------------------
  { id: 'fx-acc-1', zone: 'gf-accessories', kind: 'shelf', position: [-17.5, 0, 6.5], rotationY: 0, size: [6, 2.1, 0.6], shelves: 4 },
  { id: 'fx-acc-2', zone: 'gf-accessories', kind: 'shelf', position: [-17.5, 0, 9.2], rotationY: Math.PI, size: [6, 2.1, 0.6], shelves: 4 },
  { id: 'fx-acc-3', zone: 'gf-accessories', kind: 'shelf', position: [-17.5, 0, 3.6], rotationY: 0, size: [6, 1.6, 0.5], shelves: 3 },

  // --- Kitchen & Tableware --------------------------------------------------
  { id: 'fx-kit-1', zone: 'gf-kitchen', kind: 'shelf', position: [-17.5, 0, 0], rotationY: 0, size: [6, 2.1, 0.6], shelves: 4 },
  { id: 'fx-kit-2', zone: 'gf-kitchen', kind: 'shelf', position: [-17.5, 0, 2.4], rotationY: Math.PI, size: [6, 2.1, 0.6], shelves: 4 },
  { id: 'fx-kit-3', zone: 'gf-kitchen', kind: 'bin', position: [-17.5, 0, -2.2], rotationY: 0, size: [2.4, 0.75, 1.0] },

  // --- Textiles & Bedding ---------------------------------------------------
  { id: 'fx-tex-1', zone: 'gf-textiles', kind: 'shelf', position: [-17.5, 0, -7.0], rotationY: 0, size: [6, 2.1, 0.6], shelves: 4 },
  { id: 'fx-tex-2', zone: 'gf-textiles', kind: 'shelf', position: [-17.5, 0, -4.6], rotationY: Math.PI, size: [6, 2.1, 0.6], shelves: 4 },
  { id: 'fx-tex-3', zone: 'gf-textiles', kind: 'shelf', position: [-17.5, 0, -10.6], rotationY: 0, size: [6, 1.6, 0.5], shelves: 3 },

  // --- Decor & Organizers ---------------------------------------------------
  { id: 'fx-dec-1', zone: 'gf-decor', kind: 'bin', position: [-9.5, 0, -9.0], rotationY: 0, size: [2.6, 0.75, 1.1] },
  { id: 'fx-dec-2', zone: 'gf-decor', kind: 'bin', position: [-9.5, 0, -11.6], rotationY: 0, size: [2.6, 0.75, 1.1] },
  { id: 'fx-dec-3', zone: 'gf-decor', kind: 'shelf', position: [-9.5, 0, -6.2], rotationY: 0, size: [4, 1.6, 0.5], shelves: 3 },

  // --- Lighting Accessories -------------------------------------------------
  { id: 'fx-lig-1', zone: 'gf-lighting', kind: 'shelf', position: [-9.5, 0, 3.0], rotationY: 0, size: [4.4, 2.1, 0.6], shelves: 4 },
  { id: 'fx-lig-2', zone: 'gf-lighting', kind: 'shelf', position: [-9.5, 0, 6.4], rotationY: Math.PI, size: [4.4, 2.1, 0.6], shelves: 4 },
  { id: 'fx-lig-3', zone: 'gf-lighting', kind: 'shelf', position: [-9.5, 0, 0.6], rotationY: 0, size: [4.4, 1.6, 0.5], shelves: 3 },

  // --- Self-Serve Warehouse -------------------------------------------------
  { id: 'fx-wh-1', zone: 'gf-warehouse', kind: 'rack', position: [15.5, 0, -6.0], rotationY: 0, size: [10, 4.2, 1.2], shelves: 3 },
  { id: 'fx-wh-2', zone: 'gf-warehouse', kind: 'rack', position: [15.5, 0, -10.4], rotationY: 0, size: [10, 4.2, 1.2], shelves: 3 },
  { id: 'fx-wh-3', zone: 'gf-warehouse', kind: 'rack', position: [15.5, 0, -1.6], rotationY: 0, size: [10, 4.2, 1.2], shelves: 3 },
  { id: 'fx-wh-4', zone: 'gf-warehouse', kind: 'rack', position: [15.5, 0, -13.4], rotationY: 0, size: [10, 3.2, 1.2], shelves: 2 },

  // --- Checkout -------------------------------------------------------------
  { id: 'fx-co-1', zone: 'gf-checkout', kind: 'counter', position: [12.0, 0, 10.5], rotationY: 0, size: [2.6, 1.05, 0.9] },
  { id: 'fx-co-2', zone: 'gf-checkout', kind: 'counter', position: [15.4, 0, 10.5], rotationY: 0, size: [2.6, 1.05, 0.9] },
  { id: 'fx-co-3', zone: 'gf-checkout', kind: 'counter', position: [18.8, 0, 10.5], rotationY: 0, size: [2.6, 1.05, 0.9] },

  // --- Second floor: lamp section shelving ----------------------------------
  { id: 'fx-sfl-1', zone: 'sf-lighting', kind: 'shelf', position: [13.2, 5, -10.5], rotationY: 0, size: [7, 2.1, 0.6], shelves: 4 },
  { id: 'fx-sfl-2', zone: 'sf-lighting', kind: 'shelf', position: [17.0, 5, -10.5], rotationY: 0, size: [5, 2.1, 0.6], shelves: 4 },
  { id: 'fx-sfl-3', zone: 'sf-lighting', kind: 'shelf', position: [15.0, 5, -13.2], rotationY: 0, size: [8, 1.6, 0.5], shelves: 3 },

  // --- Second floor: storage solutions --------------------------------------
  { id: 'fx-sfs-1', zone: 'sf-storage', kind: 'shelf', position: [0.0, 5, 12.8], rotationY: 0, size: [3.4, 2.1, 0.6], shelves: 4 },
]

/** Shelf-board heights for a ShelfUnit of the given height and board count. */
export function shelfBoardHeights(height, shelves) {
  if (shelves < 2) return [0.25]
  return Array.from({ length: shelves }, (_, i) => 0.25 + (i * (height - 0.35)) / (shelves - 1))
}
