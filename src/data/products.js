/**
 * Master product catalog for the ESL digital-twin demo.
 *
 * Mock data only - no backend. Product names are invented Nordic-morphology
 * words, deliberately not real retail product names.
 *
 * @typedef {Object} ProductLocation
 * @property {string}  id             Globally unique, `loc-*`
 * @property {0|1}     floor          0 = ground, 1 = second
 * @property {string}  floorLabel     "Ground Floor" | "Second Floor"
 * @property {string}  zone           Zone id from storeLayout, e.g. "sf-lighting"
 * @property {string}  zoneLabel      Human label, e.g. "Lighting Showroom"
 * @property {string}  section        e.g. "Floor Lamps"
 * @property {string}  aisle          e.g. "A-14"
 * @property {string}  shelf          e.g. "L2-14"
 * @property {'shelf-edge'|'showroom-display'|'warehouse-rack'|'bin'} displayType
 * @property {'esl'|'hybrid-sign'} labelType   Per-location; may differ from the product default
 * @property {[number,number,number]} positionInScene  World position of the product
 * @property {[number,number,number]} labelPosition    World position of its label
 * @property {number}  rotationY      Y rotation in radians for product + label
 * @property {string}  [note]         Shown in the Locations tab
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {string} sku
 * @property {string} articleNo
 * @property {string} category
 * @property {number} price
 * @property {number|null} promoPrice
 * @property {number|null} oldPrice
 * @property {'SAR'} currency
 * @property {'in-stock'|'low-stock'|'out-of-stock'} stockStatus
 * @property {number} stockCount
 * @property {{width:number,depth:number,height:number,unit:'cm'}} dimensions
 * @property {{width:number,depth:number,height:number,unit:'cm'}} [packaging]
 * @property {number} weightKg
 * @property {string} material
 * @property {string} color
 * @property {string} colorHex     Drives the 3D mesh tint and the glyph
 * @property {string} description
 * @property {string} qrCode
 * @property {'esl'|'hybrid-sign'} labelType
 * @property {ProductLocation[]} locations
 */

export const CURRENCY = 'SAR'

const GF = 'Ground Floor'
const SF = 'Second Floor'

/** @type {Product[]} */
export const PRODUCTS = [
  {
    id: 'p-001',
    nameEn: 'NORRVIK Floor Lamp',
    nameAr: 'مصباح أرضي نورفيك',
    sku: 'NRV-FL-880',
    articleNo: '304.881.22',
    category: 'Lamps',
    price: 249,
    promoPrice: 199,
    oldPrice: 299,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 42,
    dimensions: { width: 32, depth: 32, height: 150, unit: 'cm' },
    packaging: { width: 38, depth: 18, height: 96, unit: 'cm' },
    weightKg: 4.2,
    material: 'Powder-coated steel, linen shade',
    color: 'Matte black / natural',
    colorHex: '#2b2b2b',
    description:
      'Slim floor lamp with a woven linen shade that spreads a soft, even glow, sized for a reading corner beside a sofa or armchair.',
    qrCode: 'https://esl.demo/p/NRV-FL-880',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-001a', floor: 1, floorLabel: SF,
        zone: 'sf-lighting', zoneLabel: 'Lighting Showroom',
        section: 'Floor Lamps', aisle: 'A-14', shelf: 'L2-14',
        displayType: 'shelf-edge', labelType: 'esl',
        positionInScene: [13.2, 5.0, -9.3], labelPosition: [13.2, 6.47, -10.16],
        rotationY: 0, note: 'Primary lamp section facing',
      },
      {
        id: 'loc-001b', floor: 1, floorLabel: SF,
        zone: 'sf-living-a', zoneLabel: 'Living Room Showroom A',
        section: 'Lifestyle Display', aisle: 'S-07', shelf: 'S2-07',
        displayType: 'showroom-display', labelType: 'hybrid-sign',
        positionInScene: [-12.6, 5.0, 4.4], labelPosition: [-11.4, 6.9, 4.4],
        rotationY: Math.PI / 2, note: 'Styled beside the sofa',
      },
    ],
  },

  {
    id: 'p-002',
    nameEn: 'HAVSTRAND 3-Seat Sofa',
    nameAr: 'أريكة ثلاثية المقاعد هافستراند',
    sku: 'HVS-SF-310',
    articleNo: '592.104.71',
    category: 'Sofas',
    price: 3450,
    promoPrice: null,
    oldPrice: 3990,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 12,
    dimensions: { width: 218, depth: 90, height: 82, unit: 'cm' },
    packaging: { width: 224, depth: 96, height: 44, unit: 'cm' },
    weightKg: 58,
    material: 'Solid pine frame, polyester-blend cover',
    color: 'Deep teal',
    colorHex: '#3c5b63',
    description:
      'Generous three-seat sofa with removable, washable covers and firm foam seat cushions that keep their shape through everyday use.',
    qrCode: 'https://esl.demo/p/HVS-SF-310',
    labelType: 'hybrid-sign',
    locations: [
      {
        id: 'loc-002a', floor: 1, floorLabel: SF,
        zone: 'sf-living-a', zoneLabel: 'Living Room Showroom A',
        section: 'Sofas', aisle: 'S-01', shelf: 'S2-01',
        displayType: 'showroom-display', labelType: 'hybrid-sign',
        positionInScene: [-15.5, 5.0, 7.0], labelPosition: [-15.5, 6.9, 5.3],
        rotationY: 0, note: 'Hero placement facing the walkway',
      },
    ],
  },

  {
    id: 'p-003',
    nameEn: 'BJORKLIA Coffee Table',
    nameAr: 'طاولة قهوة بيوركليا',
    sku: 'BJK-CT-140',
    articleNo: '203.556.19',
    category: 'Coffee Tables',
    price: 549,
    promoPrice: 449,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 26,
    dimensions: { width: 110, depth: 60, height: 45, unit: 'cm' },
    packaging: { width: 116, depth: 66, height: 12, unit: 'cm' },
    weightKg: 14.5,
    material: 'Birch veneer, solid birch legs',
    color: 'Birch',
    colorHex: '#c9a877',
    description:
      'Low birch-veneer table with a lower shelf for magazines and remotes, light enough to move and sturdy enough to lean on.',
    qrCode: 'https://esl.demo/p/BJK-CT-140',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-003a', floor: 1, floorLabel: SF,
        zone: 'sf-living-a', zoneLabel: 'Living Room Showroom A',
        section: 'Occasional Tables', aisle: 'S-03', shelf: 'S2-03',
        displayType: 'showroom-display', labelType: 'esl',
        positionInScene: [-15.5, 5.0, 4.6], labelPosition: [-15.5, 5.95, 3.9],
        rotationY: 0, note: 'Set in front of the sofa',
      },
    ],
  },

  {
    id: 'p-004',
    nameEn: 'SVALBO Table Lamp',
    nameAr: 'مصباح طاولة سفالبو',
    sku: 'SVB-TL-220',
    articleNo: '104.229.08',
    category: 'Lamps',
    price: 129,
    promoPrice: null,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'low-stock',
    stockCount: 6,
    dimensions: { width: 26, depth: 26, height: 38, unit: 'cm' },
    packaging: { width: 30, depth: 30, height: 42, unit: 'cm' },
    weightKg: 1.4,
    material: 'Ceramic base, cotton shade',
    color: 'Off-white',
    colorHex: '#e8e2d6',
    description:
      'Compact bedside lamp with a ceramic base and a warm cotton shade, bright enough to read by and soft enough to leave on.',
    qrCode: 'https://esl.demo/p/SVB-TL-220',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-004a', floor: 0, floorLabel: GF,
        zone: 'gf-lighting', zoneLabel: 'Lighting Accessories',
        section: 'Table Lamps', aisle: 'A-12', shelf: 'L1-12',
        displayType: 'shelf-edge', labelType: 'esl',
        positionInScene: [-10.2, 1.45, 3.0], labelPosition: [-10.6, 1.47, 3.31],
        rotationY: 0, note: 'Market hall shelf facing',
      },
      {
        id: 'loc-004b', floor: 1, floorLabel: SF,
        zone: 'sf-bedroom', zoneLabel: 'Bedroom Showroom',
        section: 'Bedside Styling', aisle: 'S-22', shelf: 'S2-22',
        displayType: 'showroom-display', labelType: 'esl',
        positionInScene: [-2.2, 5.55, -8.2], labelPosition: [-2.2, 5.44, -7.82],
        rotationY: 0, note: 'Styled on the bedside table',
      },
    ],
  },

  {
    id: 'p-005',
    nameEn: 'LINDHOLM Duvet Cover Set',
    nameAr: 'طقم غطاء لحاف ليندهولم',
    sku: 'LND-DV-240',
    articleNo: '705.412.63',
    category: 'Bed Textiles',
    price: 189,
    promoPrice: 149,
    oldPrice: 219,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 88,
    dimensions: { width: 240, depth: 220, height: 5, unit: 'cm' },
    packaging: { width: 40, depth: 30, height: 12, unit: 'cm' },
    weightKg: 1.9,
    material: '100% cotton percale, 200 thread count',
    color: 'Sage green',
    colorHex: '#9fb39a',
    description:
      'Cotton percale duvet cover and two pillowcases with a cool, crisp finish that softens with every wash. King size.',
    qrCode: 'https://esl.demo/p/LND-DV-240',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-005a', floor: 0, floorLabel: GF,
        zone: 'gf-textiles', zoneLabel: 'Textiles & Bedding',
        section: 'Duvet Covers', aisle: 'A-05', shelf: 'T1-05',
        displayType: 'shelf-edge', labelType: 'esl',
        positionInScene: [-17.5, 1.45, -7.0], labelPosition: [-18.3, 1.47, -6.69],
        rotationY: 0, note: 'Market hall bedding run',
      },
      {
        id: 'loc-005b', floor: 1, floorLabel: SF,
        zone: 'sf-bedroom', zoneLabel: 'Bedroom Showroom',
        section: 'Bed Styling', aisle: 'S-21', shelf: 'S2-21',
        displayType: 'showroom-display', labelType: 'esl',
        positionInScene: [-4.5, 5.62, -10.0], labelPosition: [-6.5, 5.95, -9.2],
        rotationY: 0, note: 'Dressed on the display bed',
      },
    ],
  },

  {
    id: 'p-006',
    nameEn: 'KVARNHOLM Storage Box Set',
    nameAr: 'طقم صناديق تخزين كفارنهولم',
    sku: 'KVH-SB-030',
    articleNo: '803.771.40',
    category: 'Storage Boxes',
    price: 79,
    promoPrice: null,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 140,
    dimensions: { width: 35, depth: 26, height: 30, unit: 'cm' },
    packaging: { width: 36, depth: 27, height: 32, unit: 'cm' },
    weightKg: 1.1,
    material: 'Recycled paperboard, cotton handles',
    color: 'Warm grey',
    colorHex: '#b7b2a6',
    description:
      'Set of three stackable boxes with cut-out handles and fold-flat construction, sized for shelf units and wardrobe tops.',
    qrCode: 'https://esl.demo/p/KVH-SB-030',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-006a', floor: 0, floorLabel: GF,
        zone: 'gf-decor', zoneLabel: 'Decor & Organizers',
        section: 'Boxes & Baskets', aisle: 'B-03', shelf: 'D1-03',
        displayType: 'bin', labelType: 'esl',
        positionInScene: [-9.5, 0.78, -9.0], labelPosition: [-9.5, 0.70, -8.56],
        rotationY: 0, note: 'Open bin table, self-serve',
      },
    ],
  },

  {
    id: 'p-007',
    nameEn: 'NORRHOLM Bookcase',
    nameAr: 'مكتبة نورهولم',
    sku: 'NRH-BC-202',
    articleNo: '402.918.55',
    category: 'Shelves',
    price: 899,
    promoPrice: 749,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 18,
    dimensions: { width: 80, depth: 30, height: 202, unit: 'cm' },
    packaging: { width: 208, depth: 86, height: 14, unit: 'cm' },
    weightKg: 32,
    material: 'Particleboard with oak-effect foil, adjustable shelves',
    color: 'Oak effect',
    colorHex: '#bfa075',
    description:
      'Tall five-shelf bookcase with adjustable boards and an anti-tip wall fixing included. Flat-packed for self-serve collection.',
    qrCode: 'https://esl.demo/p/NRH-BC-202',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-007a', floor: 0, floorLabel: GF,
        zone: 'gf-warehouse', zoneLabel: 'Self-Serve Warehouse',
        section: 'Flat-Pack Furniture', aisle: 'W-31', shelf: 'W1-31',
        displayType: 'warehouse-rack', labelType: 'esl',
        positionInScene: [13.0, 1.35, -6.0], labelPosition: [13.0, 1.24, -5.34],
        rotationY: 0, note: 'Flat-pack carton, self-serve pickup',
      },
      {
        id: 'loc-007b', floor: 1, floorLabel: SF,
        zone: 'sf-storage', zoneLabel: 'Storage Solutions',
        section: 'Bookcases', aisle: 'S-11', shelf: 'S2-11',
        displayType: 'showroom-display', labelType: 'hybrid-sign',
        positionInScene: [-4.0, 5.0, 11.5], labelPosition: [-4.0, 6.9, 10.3],
        rotationY: 0, note: 'Assembled display unit',
      },
    ],
  },

  {
    id: 'p-008',
    nameEn: 'GRANLIA Cast-Iron Pan',
    nameAr: 'مقلاة حديد زهر غرانليا',
    sku: 'GRN-CP-028',
    articleNo: '303.667.12',
    category: 'Kitchen',
    price: 219,
    promoPrice: null,
    oldPrice: 259,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 34,
    dimensions: { width: 28, depth: 28, height: 10, unit: 'cm' },
    packaging: { width: 30, depth: 30, height: 12, unit: 'cm' },
    weightKg: 3.6,
    material: 'Pre-seasoned cast iron',
    color: 'Black',
    colorHex: '#33383b',
    description:
      'Pre-seasoned cast-iron pan that works on every hob including induction, and goes straight from the stove into the oven.',
    qrCode: 'https://esl.demo/p/GRN-CP-028',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-008a', floor: 0, floorLabel: GF,
        zone: 'gf-kitchen', zoneLabel: 'Kitchen & Tableware',
        section: 'Cookware', aisle: 'A-08', shelf: 'K1-08',
        displayType: 'shelf-edge', labelType: 'esl',
        positionInScene: [-16.5, 1.45, 0.0], labelPosition: [-17.2, 1.47, 0.31],
        rotationY: 0, note: 'Cookware run, market hall',
      },
    ],
  },

  {
    id: 'p-009',
    nameEn: 'STENVIK Ceramic Vase',
    nameAr: 'مزهرية سيراميك ستينفيك',
    sku: 'STV-VS-028',
    articleNo: '104.330.87',
    category: 'Decor',
    price: 59,
    promoPrice: 44,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 96,
    dimensions: { width: 16, depth: 16, height: 28, unit: 'cm' },
    packaging: { width: 18, depth: 18, height: 30, unit: 'cm' },
    weightKg: 0.8,
    material: 'Glazed stoneware',
    color: 'Sand',
    colorHex: '#d8c3a5',
    description:
      'Hand-glazed stoneware vase with a narrow neck that holds a small bunch upright, no arranging required.',
    qrCode: 'https://esl.demo/p/STV-VS-028',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-009a', floor: 0, floorLabel: GF,
        zone: 'gf-accessories', zoneLabel: 'Home Accessories',
        section: 'Vases & Bowls', aisle: 'A-02', shelf: 'H1-02',
        displayType: 'shelf-edge', labelType: 'esl',
        positionInScene: [-18.5, 1.45, 6.5], labelPosition: [-19.2, 1.47, 6.81],
        rotationY: 0, note: 'Accessories run, market hall',
      },
    ],
  },

  {
    id: 'p-010',
    nameEn: 'FJORDBY Dining Table',
    nameAr: 'طاولة طعام فيوردبي',
    sku: 'FJB-DT-180',
    articleNo: '592.775.30',
    category: 'Dining',
    price: 1790,
    promoPrice: null,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'low-stock',
    stockCount: 4,
    dimensions: { width: 180, depth: 90, height: 75, unit: 'cm' },
    packaging: { width: 186, depth: 96, height: 16, unit: 'cm' },
    weightKg: 41,
    material: 'Solid oak top, lacquered steel legs',
    color: 'Oak / black',
    colorHex: '#b98f5c',
    description:
      'Solid-oak dining table that seats six comfortably, with a lacquered finish that shrugs off spills and daily wear.',
    qrCode: 'https://esl.demo/p/FJB-DT-180',
    labelType: 'hybrid-sign',
    locations: [
      {
        id: 'loc-010a', floor: 1, floorLabel: SF,
        zone: 'sf-dining', zoneLabel: 'Dining Area',
        section: 'Dining Tables', aisle: 'S-31', shelf: 'S2-31',
        displayType: 'showroom-display', labelType: 'hybrid-sign',
        positionInScene: [13.0, 5.0, 10.0], labelPosition: [13.0, 6.9, 8.4],
        rotationY: 0, note: 'Centre of the dining vignette',
      },
    ],
  },

  {
    id: 'p-011',
    nameEn: 'ANGSLIA Dining Chair',
    nameAr: 'كرسي طعام أنجسليا',
    sku: 'ANG-DC-088',
    articleNo: '203.881.04',
    category: 'Dining',
    price: 299,
    promoPrice: 249,
    oldPrice: 349,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 60,
    dimensions: { width: 45, depth: 52, height: 88, unit: 'cm' },
    packaging: { width: 50, depth: 56, height: 20, unit: 'cm' },
    weightKg: 6.2,
    material: 'Moulded beech ply, powder-coated steel legs',
    color: 'Natural beech',
    colorHex: '#d3b28a',
    description:
      'Stackable dining chair with a moulded ply seat shaped to stay comfortable through a long meal.',
    qrCode: 'https://esl.demo/p/ANG-DC-088',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-011a', floor: 1, floorLabel: SF,
        zone: 'sf-dining', zoneLabel: 'Dining Area',
        section: 'Dining Chairs', aisle: 'S-33', shelf: 'S2-33',
        displayType: 'showroom-display', labelType: 'esl',
        positionInScene: [15.6, 5.0, 10.0], labelPosition: [16.7, 5.9, 10.0],
        rotationY: 0, note: 'Pulled up to the display table',
      },
    ],
  },

  {
    id: 'p-012',
    nameEn: 'MYRDAL Bed Frame',
    nameAr: 'إطار سرير ميردال',
    sku: 'MYR-BF-160',
    articleNo: '692.440.18',
    category: 'Bedroom',
    price: 1450,
    promoPrice: null,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 9,
    dimensions: { width: 160, depth: 200, height: 95, unit: 'cm' },
    packaging: { width: 208, depth: 92, height: 22, unit: 'cm' },
    weightKg: 63,
    material: 'Solid pine frame, slatted base included',
    color: 'White stain',
    colorHex: '#e3ded4',
    description:
      'King bed frame in solid pine with a tall headboard and an included slatted base. Mattress and textiles sold separately.',
    qrCode: 'https://esl.demo/p/MYR-BF-160',
    labelType: 'hybrid-sign',
    locations: [
      {
        id: 'loc-012a', floor: 1, floorLabel: SF,
        zone: 'sf-bedroom', zoneLabel: 'Bedroom Showroom',
        section: 'Bed Frames', aisle: 'S-20', shelf: 'S2-20',
        displayType: 'showroom-display', labelType: 'hybrid-sign',
        positionInScene: [-4.5, 5.0, -10.0], labelPosition: [-4.5, 6.9, -7.4],
        rotationY: 0, note: 'Hero placement in the bedroom set',
      },
    ],
  },

  {
    id: 'p-013',
    nameEn: 'ALMHOLT Desk',
    nameAr: 'مكتب ألمهولت',
    sku: 'ALM-DK-140',
    articleNo: '303.229.66',
    category: 'Office',
    price: 749,
    promoPrice: 649,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 21,
    dimensions: { width: 140, depth: 70, height: 74, unit: 'cm' },
    packaging: { width: 146, depth: 76, height: 12, unit: 'cm' },
    weightKg: 26,
    material: 'Ash veneer top, powder-coated steel frame',
    color: 'Ash / anthracite',
    colorHex: '#c2a882',
    description:
      'Workspace desk with a cable channel along the back edge and adjustable feet for uneven floors.',
    qrCode: 'https://esl.demo/p/ALM-DK-140',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-013a', floor: 1, floorLabel: SF,
        zone: 'sf-office', zoneLabel: 'Office / Workspace',
        section: 'Desks', aisle: 'S-41', shelf: 'S2-41',
        displayType: 'showroom-display', labelType: 'esl',
        positionInScene: [12.5, 5.0, 1.0], labelPosition: [11.0, 5.9, 1.0],
        rotationY: 0, note: 'Workspace vignette',
      },
    ],
  },

  {
    id: 'p-014',
    nameEn: 'VIKENAS Office Chair',
    nameAr: 'كرسي مكتب فيكيناس',
    sku: 'VKN-OC-112',
    articleNo: '404.556.91',
    category: 'Office',
    price: 599,
    promoPrice: null,
    oldPrice: 699,
    currency: 'SAR',
    stockStatus: 'out-of-stock',
    stockCount: 0,
    dimensions: { width: 68, depth: 68, height: 112, unit: 'cm' },
    packaging: { width: 70, depth: 40, height: 62, unit: 'cm' },
    weightKg: 12.8,
    material: 'Mesh back, moulded foam seat, nylon base',
    color: 'Charcoal',
    colorHex: '#3f464b',
    description:
      'Swivel chair with a breathable mesh back, height adjustment and a tilt lock, tested for eight hours of daily use.',
    qrCode: 'https://esl.demo/p/VKN-OC-112',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-014a', floor: 1, floorLabel: SF,
        zone: 'sf-office', zoneLabel: 'Office / Workspace',
        section: 'Office Chairs', aisle: 'S-42', shelf: 'S2-42',
        displayType: 'showroom-display', labelType: 'esl',
        positionInScene: [12.5, 5.0, 2.3], labelPosition: [14.1, 5.9, 2.3],
        rotationY: 0, note: 'Pulled up to the display desk',
      },
    ],
  },

  {
    id: 'p-015',
    nameEn: 'SOLVANG Pendant Lamp',
    nameAr: 'مصباح معلق سولفانغ',
    sku: 'SLV-PL-038',
    articleNo: '804.117.29',
    category: 'Lamps',
    price: 349,
    promoPrice: null,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 27,
    dimensions: { width: 38, depth: 38, height: 32, unit: 'cm' },
    packaging: { width: 42, depth: 42, height: 36, unit: 'cm' },
    weightKg: 2.3,
    material: 'Bamboo weave shade, steel fittings',
    color: 'Natural bamboo',
    colorHex: '#cbab72',
    description:
      'Woven bamboo pendant that throws a patterned glow across the ceiling, sized to hang over a dining table or kitchen island.',
    qrCode: 'https://esl.demo/p/SLV-PL-038',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-015a', floor: 1, floorLabel: SF,
        zone: 'sf-lighting', zoneLabel: 'Lighting Showroom',
        section: 'Pendant Lamps', aisle: 'A-16', shelf: 'L2-16',
        displayType: 'shelf-edge', labelType: 'esl',
        positionInScene: [17.0, 6.45, -10.5], labelPosition: [17.0, 6.47, -10.19],
        rotationY: 0, note: 'Pendant display shelf',
      },
    ],
  },

  {
    id: 'p-016',
    nameEn: 'TRADLIA Wall Shelf',
    nameAr: 'رف حائط ترادليا',
    sku: 'TRD-WS-080',
    articleNo: '203.008.44',
    category: 'Shelves',
    price: 149,
    promoPrice: 119,
    oldPrice: null,
    currency: 'SAR',
    stockStatus: 'in-stock',
    stockCount: 52,
    dimensions: { width: 80, depth: 26, height: 20, unit: 'cm' },
    packaging: { width: 84, depth: 30, height: 6, unit: 'cm' },
    weightKg: 3.4,
    material: 'Solid pine, clear lacquer',
    color: 'Pine',
    colorHex: '#d6b98e',
    description:
      'Solid-pine wall shelf with concealed brackets, rated to eight kilograms once fixed into a stud or a suitable anchor.',
    qrCode: 'https://esl.demo/p/TRD-WS-080',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-016a', floor: 0, floorLabel: GF,
        zone: 'gf-display', zoneLabel: 'Small Furniture Display',
        section: 'Wall Shelves', aisle: 'S-02', shelf: 'S1-02',
        displayType: 'showroom-display', labelType: 'esl',
        positionInScene: [2.0, 1.55, -13.0], labelPosition: [2.0, 1.40, -12.68],
        rotationY: 0, note: 'Mounted on the display wall',
      },
    ],
  },
]

/** @param {string} id @returns {Product|undefined} */
export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)

/**
 * @param {string} locationId
 * @returns {{product: Product, location: ProductLocation}|undefined}
 */
export function getPlacementRecord(locationId) {
  for (const product of PRODUCTS) {
    const location = product.locations.find((l) => l.id === locationId)
    if (location) return { product, location }
  }
  return undefined
}
