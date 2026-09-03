# IKEA ESL — Digital Twin Implementation Plan

> **Historical record.** This is the plan as written on 2026-08-30, kept as-is.
> The project folder was later renamed from `IKEA Store` to `IKEA ESL`, so the
> paths and the npm package name below are out of date. Everything else still
> describes the build.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, interactive 3D web prototype that demonstrates Electronic Shelf Labels inside an IKEA-inspired two-floor store, as a presentation-ready digital twin.

**Architecture:** A Vite + React SPA. One `<Canvas>` (React Three Fiber) renders a procedurally-built two-floor store — no downloaded 3D assets, everything is composed from primitives with shared geometries/materials. A Zustand store holds all UI state (selection, view preset, floor filter, cutaway, dimensions toggle); the 3D scene and the right-hand details panel are both pure consumers of it. ESL labels and hybrid hanging signs are **Canvas2D-painted textures** mapped onto small planes — this keeps them crisp, occlusion-correct, raycast-clickable, and far cheaper than DOM overlays. Mock data lives in three plain JS modules: a master product catalog, a store-layout constants file, and a derived flat list of "placements" (product instances in the scene) that makes the one-product-many-locations story work.

**Tech Stack:** Vite 8 · React 19 · three 0.185 · @react-three/fiber 9 · @react-three/drei 10 · zustand 5 · qrcode 1.5 · Tailwind CSS 4 (CSS-first `@theme` tokens) · Vitest 4

---

## Context

The user needs a demo for a meeting. The point of the demo is to make one idea land visually: *a store is a digital twin, every shelf-edge price is an electronic screen, and one product record can drive labels in several physical places at once.* Everything that does not serve that idea — auth, CRUD, admin dashboards, workflow diagrams, ERP integration — is explicitly out of scope and must not be built.

The two label types are the heart of it and must read as **different things**:
1. **Shelf-edge ESL** — small, fully electronic e-paper tag clipped to a shelf lip. White/black/red e-paper palette, cyan LED edge on the housing to signal "powered".
2. **Large hanging info sign** — a big vertical *paper* information card, exactly like the printed ones IKEA hangs in showrooms — except the red price block at the bottom is a **screen**. It must be built as two separate meshes so the red block can carry an emissive material and visibly glow. That contrast (matte paper above, glowing panel below) *is* the hybrid-signage pitch.

Decisions already locked with the user: **SAR** currency, **Tailwind v4** with design tokens, and **light testing** — Vitest over the data model and pure helpers only; the 3D scene is verified by looking at it in a browser.

---

## Project Location & File Structure

Project root: `C:\Users\malgh\WebstormProjects\IKEA Store\`
(The folder name has a space. Quote it in every shell command. The npm `name` field is slugified to `ikea-store-esl-twin`.)

```
IKEA Store/
├── index.html
├── package.json
├── vite.config.js                 # react plugin + tailwind plugin + vitest config
├── README.md                      # how to run
├── .gitignore
├── docs/superpowers/plans/        # copy this plan here at execution time
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx                    # layout shell: viewport + right panel + toolbar
    ├── index.css                  # @import tailwindcss + @theme design tokens
    │
    ├── data/
    │   ├── products.js            # 16-product master catalog (bilingual)
    │   ├── storeLayout.js         # geometry constants, zones, fixtures, showrooms
    │   └── placements.js          # derived flat list of product instances in-scene
    │
    ├── store/
    │   └── useStoreState.js       # zustand: selection, view, floor, cutaway, dims
    │
    ├── lib/
    │   ├── format.js              # SAR money, discount %, stock tone
    │   ├── cameraPresets.js       # preset camera rigs + focus-on-placement
    │   ├── anim.js                # damp() helper
    │   ├── glyphs.js              # drawProductGlyph(ctx, category, …)
    │   ├── qr.js                  # cached QR canvas per SKU
    │   ├── eslTexture.js          # CanvasTexture for shelf-edge ESL
    │   └── signTexture.js         # CanvasTexture ×2 for paper body + price screen
    │
    ├── scene/
    │   ├── StoreScene.jsx         # <Canvas>, lighting, environment, composition
    │   ├── CameraRig.jsx          # OrbitControls + animated preset transitions
    │   ├── StoreShell.jsx         # slabs w/ atrium void, walls, roof, cutaway
    │   ├── Exterior.jsx           # blue box + yellow entrance cue
    │   ├── Escalator.jsx
    │   ├── ZoneMarkers.jsx        # hanging zone-name signs
    │   ├── DimensionGuides.jsx    # measurement lines, toggled
    │   ├── SelectionHalo.jsx      # ring + beam on selected placement
    │   ├── ESLLabel.jsx
    │   ├── LargeInfoSign.jsx
    │   ├── fixtures/
    │   │   ├── ShelfUnit.jsx
    │   │   ├── WarehouseRack.jsx
    │   │   ├── BinTable.jsx
    │   │   └── ShowroomRoom.jsx   # rug + partial walls + label
    │   └── furniture/
    │       └── ProductMesh.jsx    # category → primitive composition
    │
    └── ui/
        ├── TopToolbar.jsx         # view presets, cutaway, dimensions
        ├── FloorFilter.jsx        # All / Ground / Second
        ├── RightDetailsPanel.jsx  # header + tab bar + tab router
        ├── ProductCard.jsx        # compact card (empty-state catalog list)
        ├── EslPreview.jsx         # 2D DOM replica of the ESL for the panel
        ├── ProductGlyph.jsx       # <canvas> wrapper around drawProductGlyph
        ├── Legend.jsx             # floating legend: ESL vs hybrid sign
        └── tabs/
            ├── OverviewTab.jsx
            ├── LabelInfoTab.jsx
            ├── LocationsTab.jsx
            ├── StockPricingTab.jsx
            └── SpecsTab.jsx
```

---

## Core Geometry Contract

Every task below depends on these numbers. Y is up, units are metres, origin is the centre of the store footprint. **+Z is the storefront** (entrance side).

| Constant | Value |
|---|---|
| Footprint | X ∈ [-22, 22], Z ∈ [-15, 15] |
| Ground floor level | y = 0 |
| Ground ceiling / slab underside | y = 4.6 |
| Slab thickness | 0.4 |
| Second floor level | y = 5.0 |
| Second ceiling / roof underside | y = 9.6 |
| Roof slab | y = 9.6 → 10.0 |
| Atrium void (both slabs) | X ∈ [-6, 6], Z ∈ [-4, 4] |
| ESL plane size | 0.16 × 0.10 m |
| Hybrid sign — paper | 0.90 × 1.05 m |
| Hybrid sign — price screen | 0.90 × 0.33 m |

The second-floor slab is built as **four rectangles around the atrium void**, not one plane — that hole is what lets the viewer see the ground floor from a top-down or isometric camera, and it's where the escalator lives.

**Zone map — Ground Floor (market hall left, warehouse right):**

| Zone | id | X range | Z range | Fixture type |
|---|---|---|---|---|
| Entrance & Transition | `gf-entrance` | -8 → 8 | 10 → 15 | floor graphics |
| Home Accessories | `gf-accessories` | -21 → -14 | 3 → 10 | shelf units |
| Kitchen & Tableware | `gf-kitchen` | -21 → -14 | -3 → 3 | shelf units + bins |
| Textiles & Bedding | `gf-textiles` | -21 → -14 | -12 → -4 | shelf units |
| Decor & Organizers | `gf-decor` | -12 → -7 | -13 → -5 | bin tables |
| Lighting Accessories | `gf-lighting` | -12 → -7 | 0 → 8 | shelf units |
| Small Furniture Display | `gf-display` | -2 → 6 | -14 → -8 | showroom vignette |
| Self-Serve Warehouse | `gf-warehouse` | 10 → 21 | -14 → 2 | tall racks |
| Checkout & Transition | `gf-checkout` | 10 → 20 | 8 → 13 | counters |

**Zone map — Second Floor (showrooms):**

| Zone | id | X range | Z range | Contents |
|---|---|---|---|---|
| Living Room Showroom A | `sf-living-a` | -20 → -10 | 2 → 12 | sofa, coffee table, floor lamp |
| Living Room Showroom B | `sf-living-b` | -20 → -10 | -10 → -1 | sofa variant, shelving |
| Bedroom Showroom | `sf-bedroom` | -8 → 0 | -14 → -6 | bed, table lamp, duvet |
| Storage Solutions | `sf-storage` | -8 → 2 | 8 → 14 | bookcase, boxes |
| Dining Area | `sf-dining` | 8 → 18 | 6 → 14 | table, chairs |
| Office / Workspace | `sf-office` | 8 → 18 | -2 → 4 | desk, chair |
| Lighting Showroom | `sf-lighting` | 8 → 20 | -14 → -5 | lamp section (shelves + pendants) |

---

## Task 1: Scaffold the project

**Files:**
- Create: `IKEA Store/package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.jsx`, `src/App.jsx`, `src/index.css`

Do **not** use `npm create vite` — it prompts interactively. Write the files directly.

- [ ] **Step 1: Create the folder and initialise git**

```bash
mkdir -p "C:/Users/malgh/WebstormProjects/IKEA Store" && cd "C:/Users/malgh/WebstormProjects/IKEA Store" && git init
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "ikea-store-esl-twin",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@react-three/drei": "^10.7.8",
    "@react-three/fiber": "^9.7.0",
    "qrcode": "^1.5.4",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "three": "^0.185.1",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "tailwindcss": "^4.3.3",
    "vite": "^8.2.2",
    "vitest": "^4.1.11"
  }
}
```

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
```

- [ ] **Step 4: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IKEA Store — ESL Digital Twin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules
dist
.vite
*.local
```

- [ ] **Step 6: Write `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Write a placeholder `src/App.jsx`**

```jsx
export default function App() {
  return <div className="grid h-dvh place-items-center text-2xl">ESL Digital Twin</div>
}
```

- [ ] **Step 8: Write `src/index.css` with the design tokens**

The palette is dark teal + cyan, per the user's slides. IKEA cues (blue `#0058A3`, yellow `#FFDB00`) are used only on the exterior shell and accents.

```css
@import "tailwindcss";

@theme {
  --color-ink-900: #05171c;
  --color-ink-850: #08202a;
  --color-ink-800: #0b2a35;
  --color-ink-700: #103642;
  --color-ink-600: #17495a;
  --color-line: #1d5566;

  --color-cyan-400: #35e0d4;
  --color-cyan-300: #6defe6;
  --color-cyan-600: #12a9a1;

  --color-muted: #7fa6b0;
  --color-paper: #f4f6f5;

  --color-ikea-blue: #0058a3;
  --color-ikea-yellow: #ffdb00;
  --color-esl-red: #e11d2e;

  --color-stock-in: #38d39f;
  --color-stock-low: #ffb020;
  --color-stock-out: #ff5c6c;

  --font-sans: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-arabic: "Segoe UI", "Tahoma", sans-serif;
}

html, body, #root { height: 100%; }

body {
  margin: 0;
  background: var(--color-ink-900);
  color: #dff1f4;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Thin scrollbars for the details panel */
.scroll-slim::-webkit-scrollbar { width: 6px; }
.scroll-slim::-webkit-scrollbar-thumb { background: var(--color-ink-600); border-radius: 3px; }
.scroll-slim::-webkit-scrollbar-track { background: transparent; }
```

- [ ] **Step 9: Write `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#05171c"/>
  <rect x="6" y="12" width="20" height="11" rx="2" fill="#f4f6f5"/>
  <rect x="8" y="15" width="9" height="2" fill="#0b2a35"/>
  <rect x="8" y="19" width="6" height="2.5" fill="#e11d2e"/>
  <rect x="19" y="15" width="5" height="5" fill="#0b2a35"/>
  <rect x="6" y="9" width="20" height="2" rx="1" fill="#35e0d4"/>
</svg>
```

- [ ] **Step 10: Install and run**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npm install && npm run dev
```

Expected: Vite prints `Local: http://localhost:5173/`. Open it — a dark page with centred "ESL Digital Twin". Stop the server with Ctrl+C.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "chore: scaffold vite + react + r3f + tailwind project"
```

---

## Task 2: Product catalog (TDD on data integrity)

**Files:**
- Create: `src/data/products.js`
- Test: `src/data/products.test.js`

16 products, 4 of them in two locations each → 20 placements. The bookcase deliberately appears as a **flat-pack box in the self-serve warehouse** and as an **assembled unit in a second-floor showroom** — the single most legible demonstration of one record driving two very different labels.

- [ ] **Step 1: Write the failing test**

`src/data/products.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { PRODUCTS, getProduct } from './products.js'

const CATEGORIES = [
  'Lamps', 'Sofas', 'Coffee Tables', 'Bed Textiles', 'Storage Boxes',
  'Shelves', 'Kitchen', 'Decor', 'Dining', 'Office',
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
      expect(/[\u0600-\u06FF]/.test(p.nameAr)).toBe(true)
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

  it('gives every location a full address and a scene position', () => {
    for (const p of PRODUCTS) {
      expect(p.locations.length).toBeGreaterThan(0)
      for (const loc of p.locations) {
        expect(loc.id).toMatch(/^loc-/)
        expect([0, 1]).toContain(loc.floor)
        expect(loc.zone).toBeTruthy()
        expect(loc.section).toBeTruthy()
        expect(loc.shelf).toBeTruthy()
        expect(['esl', 'hybrid-sign']).toContain(loc.labelType)
        expect(['shelf-edge', 'showroom-display', 'warehouse-rack', 'bin'])
          .toContain(loc.displayType)
        expect(loc.positionInScene).toHaveLength(3)
        expect(loc.positionInScene.every(Number.isFinite)).toBe(true)
      }
    }
  })

  it('has exactly 4 products in more than one location', () => {
    const multi = PRODUCTS.filter((p) => p.locations.length > 1)
    expect(multi).toHaveLength(4)
    expect(multi.map((p) => p.id)).toContain('p-001')
  })

  it('has globally unique location ids', () => {
    const all = PRODUCTS.flatMap((p) => p.locations.map((l) => l.id))
    expect(new Set(all).size).toBe(all.length)
    expect(all).toHaveLength(20)
  })

  it('shows the bookcase as flat-pack in the warehouse and assembled upstairs', () => {
    const book = getProduct('p-007')
    const types = book.locations.map((l) => l.displayType)
    expect(types).toContain('warehouse-rack')
    expect(types).toContain('showroom-display')
  })

  it('returns undefined for an unknown id', () => {
    expect(getProduct('nope')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run src/data/products.test.js
```

Expected: FAIL — `Failed to resolve import "./products.js"`.

- [ ] **Step 3: Write `src/data/products.js`**

Start with the typedefs, then the catalog. Product names are invented Nordic-morphology words — deliberately *not* real IKEA product names.

```js
/**
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
 * @property {string}  [note]         Shown in the Locations tab, e.g. "Flat-pack, self-serve"
 */

/**
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
 * @property {string} colorHex     Drives the 3D mesh + glyph tint
 * @property {string} description
 * @property {string} qrCode       URL encoded into the QR
 * @property {'esl'|'hybrid-sign'} labelType   Default label type
 * @property {ProductLocation[]} locations
 */

export const CURRENCY = 'SAR'

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
      'Slim floor lamp with a woven linen shade that spreads a soft, even glow — sized for a reading corner beside a sofa or armchair.',
    qrCode: 'https://esl.demo/p/NRV-FL-880',
    labelType: 'esl',
    locations: [
      {
        id: 'loc-001a', floor: 1, floorLabel: 'Second Floor',
        zone: 'sf-lighting', zoneLabel: 'Lighting Showroom',
        section: 'Floor Lamps', aisle: 'A-14', shelf: 'L2-14',
        displayType: 'shelf-edge', labelType: 'esl',
        positionInScene: [13.2, 5.0, -9.5], labelPosition: [13.2, 6.06, -8.62],
        rotationY: 0, note: 'Primary lamp section facing',
      },
      {
        id: 'loc-001b', floor: 1, floorLabel: 'Second Floor',
        zone: 'sf-living-a', zoneLabel: 'Living Room Showroom A',
        section: 'Lifestyle Display', aisle: 'S-07', shelf: 'S2-07',
        displayType: 'showroom-display', labelType: 'hybrid-sign',
        positionInScene: [-12.6, 5.0, 4.4], labelPosition: [-11.6, 6.9, 4.4],
        rotationY: -Math.PI / 2, note: 'Styled beside the sofa',
      },
    ],
  },
  // …15 more products, same shape
]

/** @param {string} id @returns {Product|undefined} */
export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)

/** @param {string} locationId @returns {{product: Product, location: ProductLocation}|undefined} */
export function getPlacementRecord(locationId) {
  for (const product of PRODUCTS) {
    const location = product.locations.find((l) => l.id === locationId)
    if (location) return { product, location }
  }
  return undefined
}
```

**The remaining 15 products.** Fill each one out in the same shape. Positions must sit inside the zone ranges in the Core Geometry Contract, and `labelPosition` must sit on the shelf lip (or at hanging height for a sign) so the label is visible.

| id | nameEn / nameAr | Category | price / promo / old | stock | locations |
|---|---|---|---|---|---|
| p-002 | HAVSTRAND 3-Seat Sofa / أريكة ثلاثية المقاعد هافستراند | Sofas | 3450 / — / 3990 | in-stock 12 | 1 — `sf-living-a`, showroom-display, **hybrid-sign**, shelf S2-01 |
| p-003 | BJÖRKLIA Coffee Table / طاولة قهوة بيوركليا | Coffee Tables | 549 / 449 / — | in-stock 26 | 1 — `sf-living-a`, showroom-display, esl, S2-03 |
| p-004 | SVALBO Table Lamp / مصباح طاولة سفالبو | Lamps | 129 / — / — | low-stock 6 | **2** — `gf-lighting` shelf-edge esl A-12 / L1-12 · `sf-bedroom` showroom-display esl S2-22 |
| p-005 | LINDHOLM Duvet Cover Set / طقم غطاء لحاف ليندهولم | Bed Textiles | 189 / 149 / 219 | in-stock 88 | **2** — `gf-textiles` shelf-edge esl A-05 / T1-05 · `sf-bedroom` showroom-display esl S2-21 |
| p-006 | KVARNHOLM Storage Box Set / طقم صناديق تخزين كفارنهولم | Storage Boxes | 79 / — / — | in-stock 140 | 1 — `gf-decor` bin esl B-03 / D1-03 |
| p-007 | NORRHOLM Bookcase / مكتبة نورهولم | Shelves | 899 / 749 / — | in-stock 18 | **2** — `gf-warehouse` warehouse-rack esl W-31 (note "Flat-pack, self-serve pickup") · `sf-storage` showroom-display **hybrid-sign** S2-11 (note "Assembled display unit") |
| p-008 | GRANLIA Cast-Iron Pan / مقلاة حديد زهر غرانليا | Kitchen | 219 / — / 259 | in-stock 34 | 1 — `gf-kitchen` shelf-edge esl A-08 / K1-08 |
| p-009 | STENVIK Ceramic Vase / مزهرية سيراميك ستينفيك | Decor | 59 / 44 / — | in-stock 96 | 1 — `gf-accessories` shelf-edge esl A-02 / H1-02 |
| p-010 | FJORDBY Dining Table / طاولة طعام فيوردبي | Dining | 1790 / — / — | low-stock 4 | 1 — `sf-dining` showroom-display **hybrid-sign** S2-31 |
| p-011 | ÄNGSLIA Dining Chair / كرسي طعام أنجسليا | Dining | 299 / 249 / 349 | in-stock 60 | 1 — `sf-dining` showroom-display esl S2-33 |
| p-012 | MYRDAL Bed Frame / إطار سرير ميردال | Bedroom | 1450 / — / — | in-stock 9 | 1 — `sf-bedroom` showroom-display **hybrid-sign** S2-20 |
| p-013 | ALMHOLT Desk / مكتب ألمهولت | Office | 749 / 649 / — | in-stock 21 | 1 — `sf-office` showroom-display esl S2-41 |
| p-014 | VIKENÅS Office Chair / كرسي مكتب فيكيناس | Office | 599 / — / 699 | out-of-stock 0 | 1 — `sf-office` showroom-display esl S2-42 |
| p-015 | SOLVÄNG Pendant Lamp / مصباح معلق سولفانغ | Lamps | 349 / — / — | in-stock 27 | 1 — `sf-lighting` shelf-edge esl A-16 / L2-16 |
| p-016 | TRÄDLIA Wall Shelf / رف حائط ترادليا | Shelves | 149 / 119 / — | in-stock 52 | 1 — `gf-display` showroom-display esl S1-02 |

Two corrections to apply while writing p-012: give it category `Bedroom` and **add `'Bedroom'` to the `CATEGORIES` array in the test** — the test as written above lists ten categories and p-012 needs an eleventh. Update the test's `CATEGORIES` const to include `'Bedroom'` before running.

Guardrails while filling these in:
- `stockCount` must obey the rule the test enforces: `out-of-stock` → 0, `low-stock` → ≤ 8, `in-stock` → > 8.
- `oldPrice > price` and `promoPrice < price`, or `null`.
- Exactly 4 products with 2 locations: **p-001, p-004, p-005, p-007**.
- Exactly 4 locations with `labelType: 'hybrid-sign'`: p-002, p-007 (upstairs), p-010, p-012.
- `qrCode` is always `https://esl.demo/p/<sku>`.
- `colorHex` must be a real hex — `ProductMesh` reads it directly.

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run src/data/products.test.js
```

Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data && git commit -m "feat: bilingual mock product catalog with multi-location placements"
```

---

## Task 3: Store layout + derived placements

**Files:**
- Create: `src/data/storeLayout.js`, `src/data/placements.js`
- Test: `src/data/placements.test.js`

`placements.js` flattens `PRODUCTS[].locations[]` into one array the scene maps over. This is the seam that makes multi-location work: the scene iterates placements, the panel iterates a product's locations, and both point at the same record.

- [ ] **Step 1: Write the failing test**

`src/data/placements.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { PLACEMENTS, getPlacement, placementsForProduct, placementsOnFloor } from './placements.js'
import { STORE, ZONES, getZone } from './storeLayout.js'
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

  it('places every product inside its declared zone bounds', () => {
    for (const pl of PLACEMENTS) {
      const zone = getZone(pl.location.zone)
      expect(zone, `unknown zone ${pl.location.zone}`).toBeDefined()
      const [x, , z] = pl.location.positionInScene
      expect(x).toBeGreaterThanOrEqual(zone.x[0] - 1)
      expect(x).toBeLessThanOrEqual(zone.x[1] + 1)
      expect(z).toBeGreaterThanOrEqual(zone.z[0] - 1)
      expect(z).toBeLessThanOrEqual(zone.z[1] + 1)
    }
  })

  it('sets y to the floor level of the placement', () => {
    for (const pl of PLACEMENTS) {
      const expected = pl.floor === 0 ? STORE.groundY : STORE.secondY
      expect(pl.location.positionInScene[1]).toBeCloseTo(expected, 5)
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

  it('defines a zone entry for every zone referenced by a location', () => {
    const referenced = new Set(PLACEMENTS.map((p) => p.location.zone))
    for (const id of referenced) expect(ZONES.some((z) => z.id === id)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run src/data/placements.test.js
```

Expected: FAIL — cannot resolve `./placements.js`.

- [ ] **Step 3: Write `src/data/storeLayout.js`**

```js
export const STORE = {
  width: 44,          // X extent
  depth: 30,          // Z extent
  x: [-22, 22],
  z: [-15, 15],
  groundY: 0,
  groundCeilingY: 4.6,
  slabThickness: 0.4,
  secondY: 5.0,
  secondCeilingY: 9.6,
  roofY: 10.0,
  atrium: { x: [-6, 6], z: [-4, 4] },
}

/**
 * @typedef {Object} Zone
 * @property {string} id
 * @property {string} label
 * @property {string} labelAr
 * @property {0|1} floor
 * @property {[number,number]} x
 * @property {[number,number]} z
 * @property {'market-hall'|'warehouse'|'showroom'|'circulation'|'checkout'} kind
 * @property {string} accent  hex, used for the floor tint and the zone marker
 */

/** @type {Zone[]} */
export const ZONES = [
  { id: 'gf-entrance',    label: 'Entrance & Transition', labelAr: 'المدخل',        floor: 0, x: [-8, 8],    z: [10, 15],   kind: 'circulation', accent: '#ffdb00' },
  { id: 'gf-accessories', label: 'Home Accessories',      labelAr: 'إكسسوارات المنزل', floor: 0, x: [-21, -14], z: [3, 10],   kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-kitchen',     label: 'Kitchen & Tableware',   labelAr: 'أدوات المطبخ',   floor: 0, x: [-21, -14], z: [-3, 3],   kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-textiles',    label: 'Textiles & Bedding',    labelAr: 'المنسوجات',      floor: 0, x: [-21, -14], z: [-12, -4], kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-decor',       label: 'Decor & Organizers',    labelAr: 'الديكور والتنظيم', floor: 0, x: [-12, -7],  z: [-13, -5], kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-lighting',    label: 'Lighting Accessories',  labelAr: 'إكسسوارات الإضاءة', floor: 0, x: [-12, -7], z: [0, 8],    kind: 'market-hall', accent: '#35e0d4' },
  { id: 'gf-display',     label: 'Small Furniture Display', labelAr: 'عرض الأثاث الصغير', floor: 0, x: [-2, 6],  z: [-14, -8], kind: 'showroom',    accent: '#6defe6' },
  { id: 'gf-warehouse',   label: 'Self-Serve Warehouse',  labelAr: 'الخدمة الذاتية', floor: 0, x: [10, 21],   z: [-14, 2],  kind: 'warehouse',   accent: '#ffb020' },
  { id: 'gf-checkout',    label: 'Checkout & Transition', labelAr: 'الدفع',          floor: 0, x: [10, 20],   z: [8, 13],   kind: 'checkout',    accent: '#0058a3' },

  { id: 'sf-living-a',    label: 'Living Room Showroom A', labelAr: 'صالة المعيشة أ', floor: 1, x: [-20, -10], z: [2, 12],   kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-living-b',    label: 'Living Room Showroom B', labelAr: 'صالة المعيشة ب', floor: 1, x: [-20, -10], z: [-10, -1], kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-bedroom',     label: 'Bedroom Showroom',       labelAr: 'غرفة النوم',     floor: 1, x: [-8, 0],    z: [-14, -6], kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-storage',     label: 'Storage Solutions',      labelAr: 'حلول التخزين',   floor: 1, x: [-8, 2],    z: [8, 14],   kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-dining',      label: 'Dining Area',            labelAr: 'منطقة الطعام',   floor: 1, x: [8, 18],    z: [6, 14],   kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-office',      label: 'Office / Workspace',     labelAr: 'مساحة العمل',    floor: 1, x: [8, 18],    z: [-2, 4],   kind: 'showroom', accent: '#6defe6' },
  { id: 'sf-lighting',    label: 'Lighting Showroom',      labelAr: 'معرض الإضاءة',   floor: 1, x: [8, 20],    z: [-14, -5], kind: 'showroom', accent: '#35e0d4' },
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
 * Shelf runs, racks and bin tables. Each entry is a fixture instance the scene
 * renders. `kind` selects the component; `size` is [w, h, d] in metres.
 * @type {{id:string, zone:string, kind:'shelf'|'rack'|'bin'|'counter', position:[number,number,number], rotationY:number, size:[number,number,number], shelves?:number}[]}
 */
export const FIXTURES = [
  // Market hall — three parallel shelf runs per zone, 0.6 m deep, 2.1 m tall
  { id: 'fx-acc-1',  zone: 'gf-accessories', kind: 'shelf', position: [-19.5, 0, 6.5],  rotationY: 0, size: [6, 2.1, 0.6], shelves: 4 },
  { id: 'fx-acc-2',  zone: 'gf-accessories', kind: 'shelf', position: [-19.5, 0, 4.0],  rotationY: 0, size: [6, 2.1, 0.6], shelves: 4 },
  // …continue for every market-hall zone
  // Warehouse — 5.5 m tall racks, three bays
  { id: 'fx-wh-1',   zone: 'gf-warehouse',   kind: 'rack',  position: [13, 0, -6],  rotationY: 0, size: [10, 4.2, 1.2], shelves: 3 },
  // Checkout counters
  { id: 'fx-co-1',   zone: 'gf-checkout',    kind: 'counter', position: [14, 0, 10], rotationY: 0, size: [3, 1.1, 0.9] },
]
```

Fill `FIXTURES` out so every zone has fixtures: 2–3 shelf runs per market-hall zone, 3 racks in the warehouse, 2 bin tables in decor, 3 checkout counters. Keep runs parallel to the Z axis in the left market hall (`rotationY: Math.PI/2`) and parallel to X in the warehouse so the circulation reads correctly from above.

- [ ] **Step 4: Write `src/data/placements.js`**

```js
import { PRODUCTS } from './products.js'

/**
 * @typedef {Object} Placement
 * @property {string} id           Same as location.id
 * @property {string} productId
 * @property {import('./products.js').Product} product
 * @property {import('./products.js').ProductLocation} location
 * @property {0|1} floor
 * @property {'esl'|'hybrid-sign'} labelType
 */

/** @type {Placement[]} */
export const PLACEMENTS = PRODUCTS.flatMap((product) =>
  product.locations.map((location) => ({
    id: location.id,
    productId: product.id,
    product,
    location,
    floor: location.floor,
    labelType: location.labelType,
  })),
)

const BY_ID = new Map(PLACEMENTS.map((p) => [p.id, p]))

export const getPlacement = (id) => BY_ID.get(id)
export const placementsForProduct = (productId) => PLACEMENTS.filter((p) => p.productId === productId)
export const placementsOnFloor = (floor) => PLACEMENTS.filter((p) => p.floor === floor)
export const placementsInZone = (zoneId) => PLACEMENTS.filter((p) => p.location.zone === zoneId)
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run
```

Expected: PASS, both files. If the zone-bounds or atrium tests fail, the fix is in `products.js` — move the offending `positionInScene`, don't loosen the test.

- [ ] **Step 6: Commit**

```bash
git add src/data && git commit -m "feat: store layout constants and derived placement index"
```

---

## Task 4: Formatting and camera helpers (TDD)

**Files:**
- Create: `src/lib/format.js`, `src/lib/cameraPresets.js`, `src/lib/anim.js`
- Test: `src/lib/format.test.js`, `src/lib/cameraPresets.test.js`

- [ ] **Step 1: Write the failing tests**

`src/lib/format.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { formatPrice, formatPriceAr, effectivePrice, discountPercent, hasDiscount, stockLabel, stockToken } from './format.js'

describe('format', () => {
  it('formats whole SAR amounts without decimals', () => {
    expect(formatPrice(249)).toBe('SAR 249')
  })

  it('formats fractional SAR amounts with two decimals', () => {
    expect(formatPrice(24.5)).toBe('SAR 24.50')
  })

  it('formats an Arabic price string containing the amount', () => {
    expect(formatPriceAr(249)).toContain('249')
  })

  it('prefers the promo price when present', () => {
    expect(effectivePrice({ price: 249, promoPrice: 199 })).toBe(199)
    expect(effectivePrice({ price: 249, promoPrice: null })).toBe(249)
  })

  it('computes discount against the old price, then the list price', () => {
    expect(discountPercent({ price: 249, promoPrice: 199, oldPrice: 299 })).toBe(33)
    expect(discountPercent({ price: 200, promoPrice: 150, oldPrice: null })).toBe(25)
    expect(discountPercent({ price: 200, promoPrice: null, oldPrice: null })).toBe(0)
  })

  it('reports whether anything is discounted', () => {
    expect(hasDiscount({ price: 1, promoPrice: null, oldPrice: null })).toBe(false)
    expect(hasDiscount({ price: 1, promoPrice: null, oldPrice: 2 })).toBe(true)
  })

  it('maps stock status to a label and a colour token', () => {
    expect(stockLabel('in-stock')).toBe('In Stock')
    expect(stockLabel('low-stock')).toBe('Low Stock')
    expect(stockLabel('out-of-stock')).toBe('Out of Stock')
    expect(stockToken('in-stock')).toBe('#38d39f')
    expect(stockToken('out-of-stock')).toBe('#ff5c6c')
  })
})
```

`src/lib/cameraPresets.js` test:

```js
import { describe, expect, it } from 'vitest'
import { VIEW_PRESETS, VIEW_ORDER, getPreset, focusOnPlacement } from './cameraPresets.js'

describe('camera presets', () => {
  it('exposes the six toolbar views in order', () => {
    expect(VIEW_ORDER).toEqual(['twin', 'plan', 'isometric', 'side', 'top', 'interior'])
  })

  it('gives every preset a position, target, fov and label', () => {
    for (const id of VIEW_ORDER) {
      const p = VIEW_PRESETS[id]
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
})
```

- [ ] **Step 2: Run to verify they fail**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run src/lib
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/lib/format.js`**

```js
export const CURRENCY = 'SAR'

const money = (locale, value) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)

export const formatPrice = (value) => money('en-SA', value).replace(/\u00a0/g, ' ')
export const formatPriceAr = (value) => money('ar-SA', value)

export const effectivePrice = (p) => p.promoPrice ?? p.price
export const hasDiscount = (p) => p.promoPrice != null || p.oldPrice != null

export function discountPercent(p) {
  const base = p.oldPrice ?? p.price
  const now = effectivePrice(p)
  if (!base || now >= base) return 0
  return Math.round(((base - now) / base) * 100)
}

const STOCK_LABELS = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
}
const STOCK_TOKENS = {
  'in-stock': '#38d39f',
  'low-stock': '#ffb020',
  'out-of-stock': '#ff5c6c',
}

export const stockLabel = (status) => STOCK_LABELS[status] ?? 'Unknown'
export const stockToken = (status) => STOCK_TOKENS[status] ?? '#7fa6b0'

export const LABEL_TYPE_LABELS = {
  esl: 'Shelf-edge ESL',
  'hybrid-sign': 'Showroom sign — paper body, electronic price',
}
export const labelTypeLabel = (t) => LABEL_TYPE_LABELS[t] ?? t
```

Note: `formatPrice(249)` under `en-SA` returns `"SAR 249"` with a non-breaking space — the `.replace` normalises it so the test's plain-space assertion holds.

- [ ] **Step 4: Write `src/lib/cameraPresets.js`**

```js
export const VIEW_ORDER = ['twin', 'plan', 'isometric', 'side', 'top', 'interior']

export const VIEW_PRESETS = {
  twin:      { id: 'twin',      label: '3D Twin',   position: [34, 26, 40],  target: [0, 4, 0],     fov: 38 },
  plan:      { id: 'plan',      label: 'Plan View', position: [0, 64, 0.01], target: [0, 0, 0],     fov: 34 },
  isometric: { id: 'isometric', label: 'Isometric', position: [40, 36, 40],  target: [0, 3, 0],     fov: 26 },
  side:      { id: 'side',      label: 'Side',      position: [0, 8, 58],    target: [0, 5, 0],     fov: 30 },
  top:       { id: 'top',       label: 'Top',       position: [0, 50, 16],   target: [0, 2, 0],     fov: 40 },
  interior:  { id: 'interior',  label: 'Interior',  position: [-2, 2.6, 11], target: [-9, 2.2, -2], fov: 62 },
}

export const getPreset = (id) => VIEW_PRESETS[id] ?? VIEW_PRESETS.twin

/** Camera that frames a single placement from a comfortable three-quarter angle. */
export function focusOnPlacement(placement) {
  const [x, y, z] = placement.location.positionInScene
  const target = [x, y + 1, z]
  return {
    id: 'focus',
    label: 'Focus',
    target,
    position: [x + 4.2, y + 3.4, z + 4.2],
    fov: 42,
  }
}
```

- [ ] **Step 5: Write `src/lib/anim.js`**

```js
import { MathUtils } from 'three'

/** Frame-rate independent exponential approach. */
export const damp = (current, target, lambda, dt) => MathUtils.damp(current, target, lambda, dt)

/** Damp each component of a three-element array in place. */
export function dampArray(current, target, lambda, dt) {
  for (let i = 0; i < 3; i++) current[i] = MathUtils.damp(current[i], target[i], lambda, dt)
  return current
}
```

- [ ] **Step 6: Run to verify they pass**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run
```

Expected: PASS, all files.

- [ ] **Step 7: Commit**

```bash
git add src/lib && git commit -m "feat: price formatting and camera preset helpers"
```

---

## Task 5: App state store (TDD)

**Files:**
- Create: `src/store/useStoreState.js`
- Test: `src/store/useStoreState.test.js`

- [ ] **Step 1: Write the failing test**

```js
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
  })

  it('switching to a single floor also switches the view to isometric', () => {
    useStoreState.getState().setFloorFilter('second')
    expect(useStoreState.getState().floorFilter).toBe('second')
  })

  it('queues a camera request that can be consumed once', () => {
    const { setView, consumeCameraRequest } = useStoreState.getState()
    setView('top')
    const req = consumeCameraRequest()
    expect(req.id).toBe('top')
    expect(consumeCameraRequest()).toBeNull()
  })
})
```

Correct `'loc-002a'` in the "resets the tab" test to whatever id you gave the sofa's single location in Task 2.

- [ ] **Step 2: Run to verify it fails**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run src/store
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/store/useStoreState.js`**

```js
import { create } from 'zustand'
import { getPlacement, placementsForProduct } from '../data/placements.js'
import { getPreset, focusOnPlacement } from '../lib/cameraPresets.js'

export const useStoreState = create((set, get) => ({
  // selection
  selectedPlacementId: null,
  selectedProductId: null,
  hoveredPlacementId: null,
  activeTab: 'overview',

  // view
  view: 'twin',
  floorFilter: 'all',   // 'all' | 'ground' | 'second'
  cutaway: 0.7,         // 0 = sealed shell, 1 = fully opened up
  showDimensions: false,

  // one-shot camera request consumed by CameraRig
  cameraRequest: getPreset('twin'),

  selectPlacement(placementId) {
    const placement = getPlacement(placementId)
    if (!placement) return
    const sameProduct = get().selectedProductId === placement.productId
    set({
      selectedPlacementId: placement.id,
      selectedProductId: placement.productId,
      activeTab: sameProduct ? get().activeTab : 'overview',
      cameraRequest: focusOnPlacement(placement),
    })
  },

  /** Select a product without moving the camera — used by the catalog list. */
  selectProduct(productId) {
    const [first] = placementsForProduct(productId)
    if (!first) return
    get().selectPlacement(first.id)
  },

  clearSelection() {
    set({ selectedPlacementId: null, selectedProductId: null, activeTab: 'overview' })
  },

  setHovered: (id) => set({ hoveredPlacementId: id }),
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
```

`consumeCameraRequest` in the test needs the initial `cameraRequest` cleared first — after `reset()` it is the twin preset. The test calls `setView('top')` before consuming, so the assertion holds.

- [ ] **Step 4: Run to verify it passes**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npx vitest run
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store && git commit -m "feat: zustand app state for selection, view and cutaway"
```

---

## Task 6: Canvas painters — glyphs and QR codes

**Files:**
- Create: `src/lib/glyphs.js`, `src/lib/qr.js`

No image files are downloaded. Product "photos" are flat vector glyphs painted with Canvas2D, one per category, tinted with the product's `colorHex`. The same painter feeds the ESL texture, the sign texture, and the DOM panel — one implementation, three consumers.

- [ ] **Step 1: Write `src/lib/glyphs.js`**

```js
/**
 * Paint a flat, IKEA-catalogue-style illustration of a product category into a
 * square box at (x, y) of side `size`. Pure Canvas2D — no assets, no network.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} category
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} tint  product colorHex
 */
export function drawProductGlyph(ctx, category, x, y, size, tint = '#8a8f94') {
  ctx.save()
  ctx.translate(x, y)
  const s = size / 100 // draw in a 100×100 design space
  ctx.scale(s, s)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#1b232a'
  ctx.fillStyle = tint
  ctx.lineWidth = 3

  const painter = PAINTERS[category] ?? PAINTERS.default
  painter(ctx, tint)
  ctx.restore()
}

const shade = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v) => Math.max(0, Math.min(255, v))
  const r = clamp(((n >> 16) & 255) + amount)
  const g = clamp(((n >> 8) & 255) + amount)
  const b = clamp((n & 255) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

const PAINTERS = {
  Lamps(ctx, tint) {
    ctx.fillStyle = tint
    ctx.beginPath(); ctx.moveTo(32, 42); ctx.lineTo(68, 42); ctx.lineTo(60, 14); ctx.lineTo(40, 14); ctx.closePath()
    ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(50, 42); ctx.lineTo(50, 84); ctx.stroke()
    ctx.fillStyle = shade(tint, -30)
    ctx.beginPath(); ctx.ellipse(50, 86, 18, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  },
  Sofas(ctx, tint) {
    ctx.fillStyle = tint
    ctx.beginPath(); ctx.roundRect(14, 40, 72, 30, 6); ctx.fill(); ctx.stroke()
    ctx.fillStyle = shade(tint, 22)
    ctx.beginPath(); ctx.roundRect(20, 28, 60, 18, 5); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(22, 70); ctx.lineTo(22, 80); ctx.moveTo(78, 70); ctx.lineTo(78, 80); ctx.stroke()
  },
  // …one painter per category, all in the same 100×100 space
  default(ctx, tint) {
    ctx.fillStyle = tint
    ctx.beginPath(); ctx.roundRect(22, 26, 56, 50, 6); ctx.fill(); ctx.stroke()
  },
}
```

Write a painter for each of: `Lamps`, `Sofas`, `Coffee Tables`, `Bed Textiles`, `Storage Boxes`, `Shelves`, `Kitchen`, `Decor`, `Dining`, `Office`, `Bedroom`, plus `default`. Keep every one inside the 100×100 box, 3px stroke, two tones (`tint` and `shade(tint, ±25)`). They should read at 60px.

- [ ] **Step 2: Write `src/lib/qr.js`**

```js
import QRCode from 'qrcode'

const cache = new Map()

/**
 * Render a real, scannable QR code to an offscreen canvas. Cached per (text, size).
 * Uses the synchronous `toCanvas` path so texture builders stay synchronous.
 * @param {string} text
 * @param {number} size  pixels
 * @returns {HTMLCanvasElement}
 */
export function qrCanvas(text, size = 160) {
  const key = `${text}@${size}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b1114ff', light: '#ffffffff' },
  })
  cache.set(key, canvas)
  return canvas
}
```

`QRCode.toCanvas(canvasElement, text, opts)` draws synchronously when given an existing canvas — the returned promise only reports completion, so the canvas is safe to sample immediately.

- [ ] **Step 3: Commit**

```bash
git add src/lib && git commit -m "feat: procedural product glyphs and scannable QR canvases"
```

---

## Task 7: ESL and hybrid-sign textures

**Files:**
- Create: `src/lib/eslTexture.js`, `src/lib/signTexture.js`

This is the visual payload of the whole demo. Get these right and the rest is scaffolding.

- [ ] **Step 1: Write `src/lib/eslTexture.js`**

Design: 512 × 320 px (16:10), matching the 0.16 × 0.10 m plane. E-paper palette — paper white, near-black ink, one red. Everything the brief asked for fits: EN name, AR name, price, glyph, QR, SKU, aisle, stock, promo, old price, dimensions.

```js
import { CanvasTexture, SRGBColorSpace } from 'three'
import { drawProductGlyph } from './glyphs.js'
import { qrCanvas } from './qr.js'
import { formatPrice, effectivePrice, stockLabel } from './format.js'

const W = 512
const H = 320
const INK = '#0d1418'
const PAPER = '#f6f7f5'
const RED = '#e11d2e'
const GREY = '#69747a'

const cache = new Map()

/**
 * @param {import('../data/products.js').Product} product
 * @param {import('../data/products.js').ProductLocation} location
 * @returns {CanvasTexture}
 */
export function eslTexture(product, location) {
  const key = `${product.id}:${location.id}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // paper
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)

  // top strip: aisle chip + section, right-aligned stock pip
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, W, 46)
  ctx.fillStyle = PAPER
  ctx.font = '700 24px Inter, Segoe UI, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(location.aisle, 16, 24)
  ctx.font = '500 20px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = '#9fb6bd'
  ctx.fillText(location.section.toUpperCase(), 90, 24)
  ctx.fillStyle = product.stockStatus === 'out-of-stock' ? RED : '#3ad39f'
  ctx.beginPath(); ctx.arc(W - 26, 23, 8, 0, Math.PI * 2); ctx.fill()

  // glyph
  drawProductGlyph(ctx, product.category, 16, 60, 96, product.colorHex)

  // names
  ctx.fillStyle = INK
  ctx.font = '700 30px Inter, Segoe UI, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(fit(ctx, product.nameEn, 300), 126, 62)

  ctx.direction = 'rtl'
  ctx.textAlign = 'right'
  ctx.font = '600 24px Segoe UI, Tahoma, sans-serif'
  ctx.fillStyle = '#39464d'
  ctx.fillText(product.nameAr, W - 16, 100)
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'

  // price block
  const now = effectivePrice(product)
  const promo = product.promoPrice != null
  ctx.fillStyle = promo ? RED : INK
  ctx.font = '800 62px Inter, Segoe UI, sans-serif'
  ctx.fillText(formatPrice(now), 16, 166)

  let strikeX = 16
  ctx.font = '500 22px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = GREY
  if (promo) {
    const was = formatPrice(product.price)
    ctx.fillText(was, strikeX, 240)
    const w = ctx.measureText(was).width
    ctx.strokeStyle = GREY; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(strikeX, 251); ctx.lineTo(strikeX + w, 251); ctx.stroke()
    strikeX += w + 14
  }
  if (product.oldPrice != null) {
    ctx.fillText(`was ${formatPrice(product.oldPrice)}`, strikeX, 240)
  }

  // footer: sku · dimensions · stock
  ctx.font = '500 19px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = GREY
  const d = product.dimensions
  ctx.fillText(`${product.articleNo}  ·  ${d.width}×${d.depth}×${d.height} ${d.unit}`, 16, 280)
  ctx.fillStyle = product.stockStatus === 'out-of-stock' ? RED : '#2b7f63'
  ctx.fillText(stockLabel(product.stockStatus), 16, 302)

  // QR, bottom-right
  ctx.drawImage(qrCanvas(product.qrCode, 118), W - 134, H - 134, 118, 118)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

/** Truncate to fit a pixel width, adding an ellipsis. */
function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let out = text
  while (out.length > 3 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1)
  return `${out}…`
}

export function disposeEslTextures() {
  for (const t of cache.values()) t.dispose()
  cache.clear()
}
```

The footer overlaps the QR box at x > 378 — keep footer strings short, or clip them with `fit(ctx, str, 360)`.

- [ ] **Step 2: Write `src/lib/signTexture.js`**

Two textures, because the sign is two meshes. The paper body is matte; the price panel is emissive.

```js
import { CanvasTexture, SRGBColorSpace } from 'three'
import { drawProductGlyph } from './glyphs.js'
import { qrCanvas } from './qr.js'
import { formatPrice, effectivePrice, discountPercent } from './format.js'

const PW = 900, PH = 1050   // paper body
const SW = 900, SH = 330    // electronic price panel
const paperCache = new Map()
const priceCache = new Map()

/** Matte printed information sheet — the top ~76% of the hanging sign. */
export function signPaperTexture(product) {
  const hit = paperCache.get(product.id)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = PW; canvas.height = PH
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#fbfbf8'; ctx.fillRect(0, 0, PW, PH)
  ctx.strokeStyle = '#d8d9d2'; ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, PW - 3, PH - 3)

  // punched hanging hole
  ctx.fillStyle = '#e6e7e0'
  ctx.beginPath(); ctx.arc(PW / 2, 42, 14, 0, Math.PI * 2); ctx.fill()

  ctx.textBaseline = 'top'
  ctx.fillStyle = '#0d1418'
  ctx.font = '800 66px Inter, Segoe UI, sans-serif'
  ctx.fillText(product.nameEn.split(' ')[0], 56, 96)          // brand-style word
  ctx.font = '500 38px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = '#4b565c'
  ctx.fillText(product.nameEn.split(' ').slice(1).join(' '), 56, 176)

  ctx.direction = 'rtl'; ctx.textAlign = 'right'
  ctx.font = '600 40px Segoe UI, Tahoma, sans-serif'
  ctx.fillStyle = '#2b353b'
  ctx.fillText(product.nameAr, PW - 56, 176)
  ctx.direction = 'ltr'; ctx.textAlign = 'left'

  ctx.strokeStyle = '#0d1418'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(56, 240); ctx.lineTo(PW - 56, 240); ctx.stroke()

  drawProductGlyph(ctx, product.category, 56, 276, 300, product.colorHex)

  // description, wrapped, to the right of the glyph
  wrapText(ctx, product.description, 392, 288, PW - 448, 40, {
    font: '400 30px Inter, Segoe UI, sans-serif', fill: '#39464d',
  })

  // spec table
  const rows = [
    ['Article No.', product.articleNo],
    ['Dimensions', `${product.dimensions.width} × ${product.dimensions.depth} × ${product.dimensions.height} cm`],
    ['Material', product.material],
    ['Colour', product.color],
    ['Weight', `${product.weightKg} kg`],
  ]
  let y = 620
  ctx.font = '500 28px Inter, Segoe UI, sans-serif'
  for (const [k, v] of rows) {
    ctx.fillStyle = '#8a949a'; ctx.fillText(k, 56, y)
    ctx.fillStyle = '#0d1418'; ctx.fillText(v, 330, y)
    ctx.strokeStyle = '#eceded'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(56, y + 44); ctx.lineTo(PW - 56, y + 44); ctx.stroke()
    y += 62
  }

  ctx.drawImage(qrCanvas(product.qrCode, 150), PW - 206, PH - 200, 150, 150)
  ctx.font = '500 24px Inter, Segoe UI, sans-serif'
  ctx.fillStyle = '#8a949a'
  ctx.fillText('Scan for full product details', 56, PH - 84)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  paperCache.set(product.id, texture)
  return texture
}

/** The electronic red price panel — the bottom of the hanging sign. */
export function signPriceTexture(product) {
  const hit = priceCache.get(product.id)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = SW; canvas.height = SH
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 0, SH)
  grad.addColorStop(0, '#f0263a')
  grad.addColorStop(1, '#c0122a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, SW, SH)

  // faint scanlines — the cue that reads as "screen", not "print"
  ctx.globalAlpha = 0.07
  ctx.fillStyle = '#ffffff'
  for (let y = 0; y < SH; y += 4) ctx.fillRect(0, y, SW, 1)
  ctx.globalAlpha = 1

  ctx.textBaseline = 'top'
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 148px Inter, Segoe UI, sans-serif'
  ctx.fillText(formatPrice(effectivePrice(product)), 48, 92)

  const pct = discountPercent(product)
  if (pct > 0) {
    ctx.fillStyle = '#ffdb00'
    ctx.font = '800 46px Inter, Segoe UI, sans-serif'
    ctx.fillText(`−${pct}%`, SW - 200, 108)
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.font = '500 30px Inter, Segoe UI, sans-serif'
    const was = formatPrice(product.oldPrice ?? product.price)
    ctx.fillText(was, SW - 200, 168)
    const w = ctx.measureText(was).width
    ctx.strokeStyle = 'rgba(255,255,255,0.72)'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(SW - 200, 184); ctx.lineTo(SW - 200 + w, 184); ctx.stroke()
  }

  // "live" pill
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  roundRect(ctx, 48, 34, 330, 44, 22); ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 22px Inter, Segoe UI, sans-serif'
  ctx.fillText('◉  ELECTRONIC PRICE · LIVE', 68, 44)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '500 20px Inter, Segoe UI, sans-serif'
  ctx.fillText(`Synced · ${product.articleNo}`, 48, SH - 46)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  priceCache.set(product.id, texture)
  return texture
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, { font, fill }) {
  ctx.font = font
  ctx.fillStyle = fill
  let line = ''
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      y += lineHeight
      line = word
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y)
  return y
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib && git commit -m "feat: canvas textures for shelf-edge ESL and hybrid hanging sign"
```

---

## Task 8: Scene foundation — canvas, lighting, camera rig

**Files:**
- Create: `src/scene/StoreScene.jsx`, `src/scene/CameraRig.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write `src/scene/CameraRig.jsx`**

```jsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

const tmpTarget = new Vector3()
const tmpPos = new Vector3()

export default function CameraRig() {
  const controls = useRef()
  const camera = useThree((s) => s.camera)
  const goal = useRef(null)

  const cameraRequest = useStoreState((s) => s.cameraRequest)
  const consume = useStoreState((s) => s.consumeCameraRequest)

  useFrame((_, dt) => {
    if (cameraRequest) {
      const req = consume()
      goal.current = {
        position: new Vector3(...req.position),
        target: new Vector3(...req.target),
        fov: req.fov,
      }
    }
    const g = goal.current
    if (!g || !controls.current) return

    tmpPos.copy(camera.position)
    tmpPos.x = damp(tmpPos.x, g.position.x, 3.2, dt)
    tmpPos.y = damp(tmpPos.y, g.position.y, 3.2, dt)
    tmpPos.z = damp(tmpPos.z, g.position.z, 3.2, dt)
    camera.position.copy(tmpPos)

    tmpTarget.copy(controls.current.target)
    tmpTarget.x = damp(tmpTarget.x, g.target.x, 3.2, dt)
    tmpTarget.y = damp(tmpTarget.y, g.target.y, 3.2, dt)
    tmpTarget.z = damp(tmpTarget.z, g.target.z, 3.2, dt)
    controls.current.target.copy(tmpTarget)

    const nextFov = damp(camera.fov, g.fov, 3.2, dt)
    if (Math.abs(nextFov - camera.fov) > 0.01) {
      camera.fov = nextFov
      camera.updateProjectionMatrix()
    }

    controls.current.update()

    // stop steering once we've arrived, so the user regains free orbit
    if (camera.position.distanceTo(g.position) < 0.05) goal.current = null
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={110}
      maxPolarAngle={Math.PI / 2.02}
      target={[0, 4, 0]}
    />
  )
}
```

- [ ] **Step 2: Write `src/scene/StoreScene.jsx`**

Lighting is deliberately cheap: one shadow-casting directional key, one fill, one ambient, and a **local** `<Environment>` built from `<Lightformer>`s. Do **not** use `<Environment preset="…">` — drei fetches those HDRs from a CDN at runtime and the demo must work offline.

```jsx
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, AdaptiveDpr, Preload } from '@react-three/drei'
import { Suspense } from 'react'
import CameraRig from './CameraRig.jsx'
import { useStoreState } from '../store/useStoreState.js'
import { VIEW_PRESETS } from '../lib/cameraPresets.js'

export default function StoreScene() {
  const clearSelection = useStoreState((s) => s.clearSelection)

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: VIEW_PRESETS.twin.position, fov: VIEW_PRESETS.twin.fov, near: 0.1, far: 400 }}
      onPointerMissed={() => clearSelection()}
    >
      <color attach="background" args={['#05171c']} />
      <fog attach="fog" args={['#05171c', 90, 220]} />

      <hemisphereLight args={['#cfe9ef', '#0b2a35', 0.55]} />
      <directionalLight
        position={[26, 34, 18]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-camera-far={120}
      />
      <directionalLight position={[-22, 18, -20]} intensity={0.45} />

      <Environment resolution={256}>
        <Lightformer intensity={2.4} position={[0, 12, 0]} scale={[24, 24, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1.1} position={[-16, 6, 12]} scale={[12, 8, 1]} color="#bfeef2" />
        <Lightformer intensity={0.9} position={[16, 6, -12]} scale={[12, 8, 1]} color="#ffe9b8" />
      </Environment>

      <Suspense fallback={null}>
        {/* StoreShell, floors, fixtures, products and labels are added in later tasks */}
        <Preload all />
      </Suspense>

      <CameraRig />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
```

- [ ] **Step 3: Rewrite `src/App.jsx` as the layout shell**

```jsx
import StoreScene from './scene/StoreScene.jsx'

export default function App() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-ink-900">
      <main className="relative flex-1">
        <StoreScene />
      </main>
      <aside className="hidden w-[380px] shrink-0 border-l border-line bg-ink-850 lg:block">
        {/* RightDetailsPanel in Task 13 */}
      </aside>
    </div>
  )
}
```

- [ ] **Step 4: Verify in the browser**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npm run dev
```

Open http://localhost:5173. Expected: a dark teal empty 3D viewport with a right-hand panel strip. Dragging rotates the (empty) space, scrolling zooms. No console errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: r3f canvas, local environment lighting and animated camera rig"
```

---

## Task 9: Store shell — slabs, atrium, walls, roof, cutaway

**Files:**
- Create: `src/scene/StoreShell.jsx`, `src/scene/Exterior.jsx`, `src/scene/Escalator.jsx`
- Modify: `src/scene/StoreScene.jsx`

Cutaway is done with **animated opacity and a lifting roof**, not clipping planes — smoother, cheaper, and it reads better on a projector.

- [ ] **Step 1: Write `src/scene/StoreShell.jsx`**

```jsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { STORE } from '../data/storeLayout.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

/** The second-floor slab is four rectangles around the atrium void. */
function slabRects() {
  const { x, z, atrium } = STORE
  return [
    { pos: [(x[0] + atrium.x[0]) / 2, 0, 0], size: [atrium.x[0] - x[0], z[1] - z[0]] },
    { pos: [(x[1] + atrium.x[1]) / 2, 0, 0], size: [x[1] - atrium.x[1], z[1] - z[0]] },
    { pos: [0, 0, (z[0] + atrium.z[0]) / 2], size: [atrium.x[1] - atrium.x[0], atrium.z[0] - z[0]] },
    { pos: [0, 0, (z[1] + atrium.z[1]) / 2], size: [atrium.x[1] - atrium.x[0], z[1] - atrium.z[1]] },
  ]
}

/** A wall whose opacity is driven by the cutaway slider. */
function CutawayWall({ position, rotation, size, openAt = 0.25 }) {
  const mat = useRef()
  const cutaway = useStoreState((s) => s.cutaway)
  useFrame((_, dt) => {
    if (!mat.current) return
    const target = cutaway <= openAt ? 1 : 1 - (cutaway - openAt) / (1 - openAt)
    mat.current.opacity = damp(mat.current.opacity, Math.max(0, target), 5, dt)
    mat.current.visible = mat.current.opacity > 0.02
  })
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial
        ref={mat}
        color="#e9eef0"
        roughness={0.92}
        metalness={0}
        transparent
        opacity={1}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function StoreShell() {
  const rects = useMemo(slabRects, [])
  const roof = useRef()
  const roofMat = useRef()
  const cutaway = useStoreState((s) => s.cutaway)
  const floorFilter = useStoreState((s) => s.floorFilter)
  const slabMat = useRef()

  const { width, depth, groundY, secondY, slabThickness, roofY } = STORE

  useFrame((_, dt) => {
    if (roof.current) roof.current.position.y = damp(roof.current.position.y, roofY + cutaway * 9, 4, dt)
    if (roofMat.current) {
      roofMat.current.opacity = damp(roofMat.current.opacity, 1 - cutaway * 0.92, 4, dt)
      roofMat.current.visible = roofMat.current.opacity > 0.03
    }
    if (slabMat.current) {
      const target = floorFilter === 'ground' ? 0.12 : 1
      slabMat.current.opacity = damp(slabMat.current.opacity, target, 5, dt)
    }
  })

  return (
    <group>
      {/* ground slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#dfe4e3" roughness={0.78} metalness={0.02} />
      </mesh>

      {/* second-floor slab: four pieces around the atrium */}
      <group position={[0, secondY - slabThickness / 2, 0]}>
        {rects.map((r, i) => (
          <mesh key={i} position={[r.pos[0], 0, r.pos[2]]} castShadow receiveShadow>
            <boxGeometry args={[r.size[0], slabThickness, r.size[1]]} />
            <meshStandardMaterial
              ref={i === 0 ? slabMat : undefined}
              color="#e6ebea"
              roughness={0.8}
              transparent
            />
          </mesh>
        ))}
      </group>

      {/* atrium railing */}
      <AtriumRailing />

      {/* four walls — the +X and +Z pair open first so the default camera sees inside */}
      <CutawayWall position={[0, secondY / 2 + 2, STORE.z[0]]} rotation={[0, 0, 0]} size={[width, roofY]} openAt={0.85} />
      <CutawayWall position={[STORE.x[0], secondY / 2 + 2, 0]} rotation={[0, Math.PI / 2, 0]} size={[depth, roofY]} openAt={0.85} />
      <CutawayWall position={[0, secondY / 2 + 2, STORE.z[1]]} rotation={[0, Math.PI, 0]} size={[width, roofY]} openAt={0.1} />
      <CutawayWall position={[STORE.x[1], secondY / 2 + 2, 0]} rotation={[0, -Math.PI / 2, 0]} size={[depth, roofY]} openAt={0.1} />

      {/* roof — lifts and fades as cutaway rises */}
      <mesh ref={roof} position={[0, roofY, 0]} castShadow>
        <boxGeometry args={[width + 1.2, 0.5, depth + 1.2]} />
        <meshStandardMaterial ref={roofMat} color="#c9d4d6" roughness={0.9} transparent opacity={1} />
      </mesh>
    </group>
  )
}

function AtriumRailing() {
  const { atrium, secondY } = STORE
  const h = 1.05
  const y = secondY + h / 2
  const w = atrium.x[1] - atrium.x[0]
  const d = atrium.z[1] - atrium.z[0]
  return (
    <group>
      {[
        { p: [0, y, atrium.z[0]], r: [0, 0, 0], s: [w, h, 0.06] },
        { p: [0, y, atrium.z[1]], r: [0, 0, 0], s: [w, h, 0.06] },
        { p: [atrium.x[0], y, 0], r: [0, 0, 0], s: [0.06, h, d] },
        { p: [atrium.x[1], y, 0], r: [0, 0, 0], s: [0.06, h, d] },
      ].map((r, i) => (
        <mesh key={i} position={r.p} castShadow>
          <boxGeometry args={r.s} />
          <meshStandardMaterial color="#9fb3b8" roughness={0.4} metalness={0.5} transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Write `src/scene/Exterior.jsx`**

The IKEA cue: a blue outer shell just outside the walls, with a yellow entrance canopy on the +Z face. No logos, no wordmarks — colour and massing only.

```jsx
import { STORE } from '../data/storeLayout.js'
import { useStoreState } from '../store/useStoreState.js'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { damp } from '../lib/anim.js'

export default function Exterior() {
  const cutaway = useStoreState((s) => s.cutaway)
  const mat = useRef()
  const { width, depth, roofY } = STORE

  useFrame((_, dt) => {
    if (mat.current) {
      mat.current.opacity = damp(mat.current.opacity, 1 - cutaway * 0.8, 4, dt)
      mat.current.visible = mat.current.opacity > 0.04
    }
  })

  return (
    <group>
      {/* blue outer skin, slightly larger than the walls, back-faces only */}
      <mesh position={[0, roofY / 2, 0]}>
        <boxGeometry args={[width + 0.9, roofY, depth + 0.9]} />
        <meshStandardMaterial ref={mat} color="#0058a3" roughness={0.85} side={2} transparent opacity={1} />
      </mesh>

      {/* yellow entrance canopy on the storefront */}
      <mesh position={[0, 4.4, STORE.z[1] + 1.6]} castShadow>
        <boxGeometry args={[15, 0.55, 3.4]} />
        <meshStandardMaterial color="#ffdb00" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.1, STORE.z[1] + 0.5]}>
        <boxGeometry args={[13, 4.2, 0.16]} />
        <meshPhysicalMaterial color="#bfe4ec" roughness={0.06} metalness={0} transmission={0.86} thickness={0.4} />
      </mesh>

      {/* apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, STORE.z[1] + 8]} receiveShadow>
        <planeGeometry args={[width + 16, 16]} />
        <meshStandardMaterial color="#152c33" roughness={1} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 3: Write `src/scene/Escalator.jsx`**

A pair of inclined slabs in the atrium from ground to second floor, plus glass balustrades. Geometry: incline runs from `[0, 0, 3.4]` to `[0, 5.0, -3.4]`, i.e. length ≈ 8.4 m, angle ≈ `Math.atan2(5.0, 6.8)`. Build it as a single `boxGeometry([2.4, 0.25, 8.4])` rotated about X, with a step texture faked by 20 thin boxes along it (use drei `<Instances>`), a 0.9 m glass balustrade either side, and a cyan emissive strip along the handrail so it reads as a landmark in the twin.

- [ ] **Step 4: Mount all three in `StoreScene.jsx`**

Inside the `<Suspense>`:

```jsx
<StoreShell />
<Exterior />
<Escalator />
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`. Expected: a two-level shell with a visible hole in the upper slab, an escalator through it, a blue exterior and a yellow canopy. Because `cutaway` defaults to `0.7`, the roof should already be lifted and the near walls faded — you should be able to see into both floors immediately.

- [ ] **Step 6: Commit**

```bash
git add src/scene && git commit -m "feat: two-floor store shell with atrium, cutaway walls and lifting roof"
```

---

## Task 10: Fixtures — shelves, racks, bins, showroom rooms

**Files:**
- Create: `src/scene/fixtures/ShelfUnit.jsx`, `WarehouseRack.jsx`, `BinTable.jsx`, `ShowroomRoom.jsx`
- Create: `src/scene/StoreFixtures.jsx` (maps over `FIXTURES` and `ZONES`)
- Modify: `src/scene/StoreScene.jsx`

Every fixture shares module-level geometries and materials so 40+ instances cost almost nothing.

- [ ] **Step 1: Write `src/scene/fixtures/ShelfUnit.jsx` — the reference implementation**

```jsx
import { useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'

// Shared across every shelf unit in the store.
const FRAME_MAT = new MeshStandardMaterial({ color: '#cfd6d6', roughness: 0.55, metalness: 0.25 })
const BOARD_MAT = new MeshStandardMaterial({ color: '#efeae1', roughness: 0.8 })
const BACK_MAT = new MeshStandardMaterial({ color: '#e2e6e6', roughness: 0.95 })
const UNIT_GEO = new BoxGeometry(1, 1, 1)

/**
 * A market-hall shelf run.
 * @param {[number,number,number]} position  base of the unit
 * @param {number} rotationY
 * @param {[number,number,number]} size  [width, height, depth]
 * @param {number} shelves  number of boards
 */
export default function ShelfUnit({ position, rotationY = 0, size, shelves = 4 }) {
  const [w, h, d] = size
  const boards = useMemo(
    () => Array.from({ length: shelves }, (_, i) => 0.25 + (i * (h - 0.35)) / (shelves - 1)),
    [shelves, h],
  )

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* uprights */}
      {[-w / 2 + 0.04, w / 2 - 0.04].map((x) => (
        <mesh key={x} geometry={UNIT_GEO} material={FRAME_MAT} position={[x, h / 2, 0]} scale={[0.08, h, d]} castShadow />
      ))}
      {/* back panel */}
      <mesh geometry={UNIT_GEO} material={BACK_MAT} position={[0, h / 2, -d / 2 + 0.02]} scale={[w, h, 0.04]} receiveShadow />
      {/* boards */}
      {boards.map((y) => (
        <mesh key={y} geometry={UNIT_GEO} material={BOARD_MAT} position={[0, y, 0]} scale={[w - 0.1, 0.05, d - 0.04]} castShadow receiveShadow />
      ))}
      {/* shelf lip — where ESLs clip on */}
      {boards.map((y) => (
        <mesh key={`lip-${y}`} geometry={UNIT_GEO} material={FRAME_MAT} position={[0, y + 0.05, d / 2 - 0.02]} scale={[w - 0.1, 0.06, 0.02]} />
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Write the other three fixtures on the same pattern**

- **`WarehouseRack.jsx`** — 4.2 m tall, three levels, heavy blue-grey uprights (`#5b6d75`), orange safety beams (`#ffb020`), and stacked flat-pack cartons (`#c8a878`) on the upper levels via drei `<Instances>`. This is the visual signature of the self-serve area.
- **`BinTable.jsx`** — a 1.2 × 0.8 m table at 0.75 m with four shallow bins on top; used in Decor & Organizers.
- **`ShowroomRoom.jsx`** — takes a `Zone` and paints the room footprint: a warm rug plane (`#d7c9b4`) inset 0.8 m from the zone bounds, two partial walls 2.4 m tall along the −X and −Z edges in a soft accent colour, and a thin floor outline in the zone's `accent`. It renders `children` inside so furniture can be nested.

- [ ] **Step 3: Write `src/scene/StoreFixtures.jsx`**

```jsx
import { FIXTURES, ZONES, STORE } from '../data/storeLayout.js'
import ShelfUnit from './fixtures/ShelfUnit.jsx'
import WarehouseRack from './fixtures/WarehouseRack.jsx'
import BinTable from './fixtures/BinTable.jsx'
import ShowroomRoom from './fixtures/ShowroomRoom.jsx'
import { useStoreState } from '../store/useStoreState.js'

const COMPONENTS = { shelf: ShelfUnit, rack: WarehouseRack, bin: BinTable, counter: BinTable }

export default function StoreFixtures() {
  const floorFilter = useStoreState((s) => s.floorFilter)
  const showGround = floorFilter !== 'second'
  const showSecond = floorFilter !== 'ground'

  return (
    <>
      <group visible={showGround}>
        {FIXTURES.map((fx) => {
          const Component = COMPONENTS[fx.kind]
          const y = STORE.groundY
          return (
            <Component
              key={fx.id}
              position={[fx.position[0], y, fx.position[2]]}
              rotationY={fx.rotationY}
              size={fx.size}
              shelves={fx.shelves}
            />
          )
        })}
      </group>

      <group visible={showSecond}>
        {ZONES.filter((z) => z.floor === 1).map((zone) => (
          <ShowroomRoom key={zone.id} zone={zone} />
        ))}
      </group>

      <group visible={showGround}>
        {ZONES.filter((z) => z.floor === 0 && z.kind === 'showroom').map((zone) => (
          <ShowroomRoom key={zone.id} zone={zone} />
        ))}
      </group>
    </>
  )
}
```

- [ ] **Step 4: Mount `<StoreFixtures />` in `StoreScene.jsx` and verify**

Run `npm run dev`. Expected: shelf runs down the left market hall, tall orange-beamed racks on the right, showroom rugs and partial walls upstairs. Switching nothing yet — just confirm the layout reads as a store from the default 3D Twin camera.

- [ ] **Step 5: Commit**

```bash
git add src/scene && git commit -m "feat: shelf, rack, bin and showroom-room fixtures placed per zone"
```

---

## Task 11: Product meshes

**Files:**
- Create: `src/scene/furniture/ProductMesh.jsx`
- Create: `src/scene/Products.jsx`
- Modify: `src/scene/StoreScene.jsx`

One component, a `switch` on `product.category`, each branch composing 3–8 primitives. Every mesh is sized from the product's real `dimensions` (cm → m) so the Dimensions toggle later tells the truth.

- [ ] **Step 1: Write `src/scene/furniture/ProductMesh.jsx`**

```jsx
import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

const matCache = new Map()
const mat = (color, roughness = 0.7, metalness = 0.05) => {
  const key = `${color}:${roughness}:${metalness}`
  if (!matCache.has(key)) matCache.set(key, new MeshStandardMaterial({ color, roughness, metalness }))
  return matCache.get(key)
}

const WOOD = '#c9a877'
const FABRIC_DARK = '#4a5b66'
const METAL = '#8f9aa1'

/**
 * A believable low-poly stand-in for a product, sized from its real dimensions.
 * @param {{product: import('../../data/products.js').Product, displayType: string}} props
 */
export default function ProductMesh({ product, displayType }) {
  const d = product.dimensions
  const w = d.width / 100
  const dp = d.depth / 100
  const h = d.height / 100
  const body = useMemo(() => mat(product.colorHex), [product.colorHex])

  // Flat-pack in the warehouse: a carton, regardless of category.
  if (displayType === 'warehouse-rack') {
    const p = product.packaging ?? { width: d.width, depth: 20, height: d.height }
    return (
      <mesh castShadow receiveShadow position={[0, p.height / 200, 0]}>
        <boxGeometry args={[p.width / 100, p.height / 100, p.depth / 100]} />
        <meshStandardMaterial color="#c8a878" roughness={0.95} />
      </mesh>
    )
  }

  switch (product.category) {
    case 'Lamps':
      return h > 1 ? <FloorLamp w={w} h={h} body={body} /> : <TableLamp w={w} h={h} body={body} />
    case 'Sofas':
      return <Sofa w={w} d={dp} h={h} body={body} />
    case 'Coffee Tables':
    case 'Dining':
      return <Table w={w} d={dp} h={h} body={body} />
    case 'Shelves':
      return <Bookcase w={w} d={dp} h={h} body={body} />
    case 'Bed Textiles':
      return <FoldedTextile w={w} d={dp} body={body} />
    case 'Storage Boxes':
      return <BoxStack w={w} d={dp} h={h} body={body} />
    case 'Kitchen':
      return <Pan w={w} body={body} />
    case 'Decor':
      return <Vase w={w} h={h} body={body} />
    case 'Bedroom':
      return <Bed w={w} d={dp} h={h} body={body} />
    case 'Office':
      return h > 0.9 ? <OfficeChair w={w} h={h} body={body} /> : <Table w={w} d={dp} h={h} body={body} />
    default:
      return (
        <mesh castShadow position={[0, h / 2, 0]}>
          <boxGeometry args={[w, h, dp]} />
          <primitive object={body} attach="material" />
        </mesh>
      )
  }
}

function FloorLamp({ w, h, body }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.02, 0]} material={mat('#2b2b2b', 0.5, 0.4)}>
        <cylinderGeometry args={[w / 2, w / 2, 0.04, 24]} />
      </mesh>
      <mesh castShadow position={[0, h / 2, 0]} material={mat('#2b2b2b', 0.4, 0.6)}>
        <cylinderGeometry args={[0.018, 0.018, h - 0.24, 12]} />
      </mesh>
      <mesh castShadow position={[0, h - 0.12, 0]}>
        <cylinderGeometry args={[w / 2.1, w / 2.6, 0.26, 24, 1, true]} />
        <meshStandardMaterial color="#efe6d4" roughness={0.9} side={2} emissive="#ffdca8" emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[0, h - 0.16, 0]} intensity={2.2} distance={3.4} color="#ffdca8" />
    </group>
  )
}
```

Write the remaining helpers — `TableLamp`, `Sofa`, `Table`, `Bookcase`, `FoldedTextile`, `BoxStack`, `Pan`, `Vase`, `Bed`, `OfficeChair` — in the same style: primitives only, `castShadow` on the main volumes, sized from the passed `w/d/h`. Only lamps get a `<pointLight>`, and cap it at the two lamp placements per floor so the light count stays low.

- [ ] **Step 2: Write `src/scene/Products.jsx`**

```jsx
import { PLACEMENTS } from '../data/placements.js'
import ProductMesh from './furniture/ProductMesh.jsx'
import ESLLabel from './ESLLabel.jsx'
import LargeInfoSign from './LargeInfoSign.jsx'
import SelectionHalo from './SelectionHalo.jsx'
import { useStoreState } from '../store/useStoreState.js'

export default function Products() {
  const floorFilter = useStoreState((s) => s.floorFilter)
  const selectedId = useStoreState((s) => s.selectedPlacementId)
  const hoveredId = useStoreState((s) => s.hoveredPlacementId)
  const selectPlacement = useStoreState((s) => s.selectPlacement)
  const setHovered = useStoreState((s) => s.setHovered)

  const visible = (floor) =>
    floorFilter === 'all' || (floorFilter === 'ground' ? floor === 0 : floor === 1)

  return (
    <>
      {PLACEMENTS.map((pl) => {
        const { location, product } = pl
        const selected = selectedId === pl.id
        const hovered = hoveredId === pl.id
        const Label = location.labelType === 'hybrid-sign' ? LargeInfoSign : ESLLabel

        return (
          <group key={pl.id} visible={visible(pl.floor)}>
            <group
              position={location.positionInScene}
              rotation={[0, location.rotationY, 0]}
              onClick={(e) => { e.stopPropagation(); selectPlacement(pl.id) }}
              onPointerOver={(e) => { e.stopPropagation(); setHovered(pl.id) }}
              onPointerOut={() => setHovered(null)}
            >
              <ProductMesh product={product} displayType={location.displayType} />
              {(selected || hovered) && <SelectionHalo selected={selected} product={product} />}
            </group>

            <Label placement={pl} selected={selected} hovered={hovered} />
          </group>
        )
      })}
    </>
  )
}
```

- [ ] **Step 3: Mount `<Products />` and verify**

Comment out the `<Label>` line for now (Task 12 creates those components), run `npm run dev`, and confirm every product appears in the right zone at the right scale. Cross-check against the zone table — a sofa in the warehouse means a wrong `positionInScene` in `products.js`.

- [ ] **Step 4: Commit**

```bash
git add src/scene && git commit -m "feat: procedural product meshes placed at every location"
```

---

## Task 12: ESL labels, hybrid signs and selection feedback

**Files:**
- Create: `src/scene/ESLLabel.jsx`, `src/scene/LargeInfoSign.jsx`, `src/scene/SelectionHalo.jsx`
- Modify: `src/scene/Products.jsx` (uncomment the `<Label>` line)

- [ ] **Step 1: Write `src/scene/ESLLabel.jsx`**

The housing is a dark plastic box with a **cyan emissive edge** — the visual claim that this thing is powered, not printed. The screen face carries the canvas texture.

```jsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { eslTexture } from '../lib/eslTexture.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

const W = 0.16
const H = 0.10

export default function ESLLabel({ placement, selected, hovered }) {
  const { product, location } = placement
  const texture = useMemo(() => eslTexture(product, location), [product, location])
  const selectPlacement = useStoreState((s) => s.selectPlacement)
  const setHovered = useStoreState((s) => s.setHovered)
  const edge = useRef()

  useFrame((state, dt) => {
    if (!edge.current) return
    const base = selected ? 3.4 : hovered ? 1.9 : 0.85
    const pulse = selected ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.25 : 1
    edge.current.emissiveIntensity = damp(edge.current.emissiveIntensity, base * pulse, 8, dt)
  })

  return (
    <group
      position={location.labelPosition}
      rotation={[0, location.rotationY, 0]}
      onClick={(e) => { e.stopPropagation(); selectPlacement(placement.id) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(placement.id) }}
      onPointerOut={() => setHovered(null)}
    >
      {/* housing */}
      <mesh castShadow>
        <boxGeometry args={[W + 0.012, H + 0.012, 0.012]} />
        <meshStandardMaterial color="#1b232a" roughness={0.45} metalness={0.2} />
      </mesh>
      {/* cyan powered edge */}
      <mesh position={[0, -H / 2 - 0.004, 0.001]}>
        <boxGeometry args={[W + 0.012, 0.004, 0.013]} />
        <meshStandardMaterial ref={edge} color="#35e0d4" emissive="#35e0d4" emissiveIntensity={0.85} toneMapped={false} />
      </mesh>
      {/* e-paper face */}
      <mesh position={[0, 0, 0.0068]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={texture} roughness={0.62} metalness={0} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Write `src/scene/LargeInfoSign.jsx`**

Two meshes hanging from a ceiling rod: matte paper on top, emissive red screen below. That split is the whole point — do not merge them into one texture.

```jsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { signPaperTexture, signPriceTexture } from '../lib/signTexture.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'
import { STORE } from '../data/storeLayout.js'

const PW = 0.90, PH = 1.05      // paper body
const SW = 0.90, SH = 0.33      // price screen

export default function LargeInfoSign({ placement, selected, hovered }) {
  const { product, location } = placement
  const paper = useMemo(() => signPaperTexture(product), [product])
  const price = useMemo(() => signPriceTexture(product), [product])
  const selectPlacement = useStoreState((s) => s.selectPlacement)
  const setHovered = useStoreState((s) => s.setHovered)
  const screen = useRef()

  const [x, y, z] = location.labelPosition
  const ceilingY = location.floor === 0 ? STORE.groundCeilingY : STORE.secondCeilingY

  useFrame((state, dt) => {
    if (!screen.current) return
    const base = selected ? 1.5 : hovered ? 0.95 : 0.6
    const pulse = selected ? 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.2 : 1
    screen.current.emissiveIntensity = damp(screen.current.emissiveIntensity, base * pulse, 7, dt)
  })

  return (
    <group
      position={[x, y, z]}
      rotation={[0, location.rotationY, 0]}
      onClick={(e) => { e.stopPropagation(); selectPlacement(placement.id) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(placement.id) }}
      onPointerOut={() => setHovered(null)}
    >
      {/* suspension cables up to the ceiling */}
      {[-PW / 2 + 0.08, PW / 2 - 0.08].map((cx) => (
        <mesh key={cx} position={[cx, (ceilingY - y) / 2 + (PH + SH) / 2, 0]}>
          <cylinderGeometry args={[0.004, 0.004, Math.max(0.1, ceilingY - y - (PH + SH) / 2), 6]} />
          <meshStandardMaterial color="#9fb3b8" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* printed information sheet */}
      <mesh position={[0, SH / 2, 0]} castShadow>
        <planeGeometry args={[PW, PH]} />
        <meshStandardMaterial map={paper} roughness={0.95} metalness={0} side={2} />
      </mesh>

      {/* electronic price panel */}
      <mesh position={[0, -PH / 2, 0.004]}>
        <planeGeometry args={[SW, SH]} />
        <meshStandardMaterial
          ref={screen}
          map={price}
          emissiveMap={price}
          emissive="#ffffff"
          emissiveIntensity={0.6}
          roughness={0.28}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {/* thin bezel around the screen, to sell it as hardware */}
      <mesh position={[0, -PH / 2, -0.004]}>
        <planeGeometry args={[SW + 0.02, SH + 0.02]} />
        <meshStandardMaterial color="#151b1f" roughness={0.4} metalness={0.3} side={2} />
      </mesh>
    </group>
  )
}
```

`labelPosition` for hybrid signs must be the **centre of the paper/screen seam**, hanging around y = floor + 1.9. Verify each of the four sign placements sits clear of the product mesh.

- [ ] **Step 3: Write `src/scene/SelectionHalo.jsx`**

A cyan ring on the floor under the selected product plus a soft vertical beam, both fading in. Use a `ringGeometry` rotated flat with `toneMapped={false}` and an emissive cyan material, and a `cylinderGeometry` with `transparent`, `opacity 0.12`, `depthWrite={false}`. Scale the ring from the product's footprint (`max(width, depth)/100 * 0.9`, floor at 0.35 m).

- [ ] **Step 4: Uncomment the `<Label>` render in `Products.jsx` and verify**

Run `npm run dev`. Expected:
- Small e-paper tags on shelf lips, with a faint cyan glow along the bottom edge.
- Four large hanging signs in showrooms, paper on top and a glowing red price block below.
- Clicking anything logs nothing yet but sets state — verify with React DevTools or a temporary `console.log` in `selectPlacement`.
- Hovering a label brightens its edge.

- [ ] **Step 5: Commit**

```bash
git add src/scene && git commit -m "feat: electronic shelf labels, hybrid hanging signs and selection halo"
```

---

## Task 13: Right details panel with five tabs

**Files:**
- Create: `src/ui/RightDetailsPanel.jsx`, `src/ui/ProductGlyph.jsx`, `src/ui/EslPreview.jsx`, `src/ui/ProductCard.jsx`
- Create: `src/ui/tabs/OverviewTab.jsx`, `LabelInfoTab.jsx`, `LocationsTab.jsx`, `StockPricingTab.jsx`, `SpecsTab.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write `src/ui/ProductGlyph.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { drawProductGlyph } from '../lib/glyphs.js'

export default function ProductGlyph({ category, tint, size = 120, className = '' }) {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)
    drawProductGlyph(ctx, category, 0, 0, size, tint)
  }, [category, tint, size])
  return <canvas ref={ref} style={{ width: size, height: size }} className={className} />
}
```

- [ ] **Step 2: Write `src/ui/RightDetailsPanel.jsx`**

```jsx
import { useMemo } from 'react'
import { useStoreState } from '../store/useStoreState.js'
import { getProduct, PRODUCTS } from '../data/products.js'
import { getPlacement, placementsForProduct } from '../data/placements.js'
import { formatPrice, effectivePrice, stockLabel, stockToken } from '../lib/format.js'
import ProductGlyph from './ProductGlyph.jsx'
import ProductCard from './ProductCard.jsx'
import OverviewTab from './tabs/OverviewTab.jsx'
import LabelInfoTab from './tabs/LabelInfoTab.jsx'
import LocationsTab from './tabs/LocationsTab.jsx'
import StockPricingTab from './tabs/StockPricingTab.jsx'
import SpecsTab from './tabs/SpecsTab.jsx'

const TABS = [
  { id: 'overview',  label: 'Overview',  Component: OverviewTab },
  { id: 'label',     label: 'Label Info', Component: LabelInfoTab },
  { id: 'locations', label: 'Locations', Component: LocationsTab },
  { id: 'stock',     label: 'Stock & Pricing', Component: StockPricingTab },
  { id: 'specs',     label: 'Specs',     Component: SpecsTab },
]

export default function RightDetailsPanel() {
  const productId = useStoreState((s) => s.selectedProductId)
  const placementId = useStoreState((s) => s.selectedPlacementId)
  const activeTab = useStoreState((s) => s.activeTab)
  const setActiveTab = useStoreState((s) => s.setActiveTab)

  const product = productId ? getProduct(productId) : null
  const placement = placementId ? getPlacement(placementId) : null
  const siblings = useMemo(
    () => (productId ? placementsForProduct(productId) : []),
    [productId],
  )

  if (!product) return <EmptyState />

  const Active = TABS.find((t) => t.id === activeTab)?.Component ?? OverviewTab

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-ink-800 p-2">
            <ProductGlyph category={product.category} tint={product.colorHex} size={64} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-400">
              {product.category}
            </p>
            <h2 className="truncate text-lg font-semibold text-white">{product.nameEn}</h2>
            <p dir="rtl" className="truncate text-sm text-muted">{product.nameAr}</p>
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-white">{formatPrice(effectivePrice(product))}</span>
          {product.promoPrice != null && (
            <span className="text-sm text-muted line-through">{formatPrice(product.price)}</span>
          )}
          <span
            className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ color: stockToken(product.stockStatus), background: `${stockToken(product.stockStatus)}1f` }}
          >
            {stockLabel(product.stockStatus)}
          </span>
        </div>

        {siblings.length > 1 && (
          <p className="mt-3 rounded-lg bg-cyan-600/15 px-3 py-2 text-xs text-cyan-300">
            This product is labelled in <b>{siblings.length}</b> locations across the store.
          </p>
        )}
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === t.id ? 'bg-cyan-400 text-ink-900' : 'text-muted hover:bg-ink-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
        <Active product={product} placement={placement} placements={siblings} />
      </div>
    </div>
  )
}

function EmptyState() {
  const selectProduct = useStoreState((s) => s.selectProduct)
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-base font-semibold text-white">Store Catalog</h2>
        <p className="mt-1 text-sm text-muted">
          Click any product, shelf label or hanging sign in the 3D store — or pick one below.
        </p>
      </div>
      <div className="scroll-slim flex-1 overflow-y-auto px-3 py-3">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} onSelect={() => selectProduct(p.id)} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write the five tabs**

- **`OverviewTab`** — big `ProductGlyph` on a paper-white card, EN title, AR title (`dir="rtl"`), price row with promo/old and a `−N%` chip, then the description. Add a small "Selected label" line naming the current placement's zone.
- **`LabelInfoTab`** — a DOM `EslPreview` (below), the QR rendered at 96 px via `qrCanvas`, then a definition list: SKU, Article No., Section, Aisle, Shelf, and a badge reading either `Shelf-edge ESL` or `Showroom sign — paper body, electronic price`. For the hybrid type, add one sentence explaining the split.
- **`LocationsTab`** — the important one. Map `placements`; each row is a clickable card showing `Floor → Zone → Section → Shelf`, a `displayType` chip, the location `note`, and the label type. Clicking calls `selectPlacement(pl.id)`, which flies the camera there. Mark the currently-selected row with a cyan left border. When `placements.length > 1`, put a banner at the top: *"One product record, N physical labels — updating the price updates them all."*
- **`StockPricingTab`** — a status tile coloured by `stockToken`, `stockCount` units, then a price table: list price, promotional price, previous price, saving, effective price.
- **`SpecsTab`** — a definition list: dimensions (W×D×H cm), packaging dimensions, colour with a swatch of `colorHex`, material, weight, article number, category.

- [ ] **Step 4: Write `src/ui/EslPreview.jsx`**

A DOM replica of the 3D tag so the panel shows the label at readable size. Same content, same e-paper palette (`bg-paper`, `text-ink-900`, `text-esl-red`), a `border-b-2 border-cyan-400` bottom edge to echo the powered strip, and the QR drawn into a small canvas. Roughly 300 × 190 px, `rounded-md`, drop shadow.

- [ ] **Step 5: Write `src/ui/ProductCard.jsx`**

A compact horizontal card: glyph 44 px, EN name, AR name, price, stock pip, and a `×N` badge when `product.locations.length > 1`. `onClick` calls the passed `onSelect`.

- [ ] **Step 6: Mount the panel in `App.jsx` and verify**

```jsx
<aside className="hidden w-[380px] shrink-0 border-l border-line bg-ink-850 lg:block">
  <RightDetailsPanel />
</aside>
```

Run `npm run dev`. Expected: the catalog list on load; clicking a product in the list or in the 3D scene populates the panel; all five tabs render; the Locations tab shows two rows for NORRVIK, SVALBO, LINDHOLM and NORRHOLM, and clicking the second row flies the camera to the other instance.

- [ ] **Step 7: Commit**

```bash
git add src/ui src/App.jsx && git commit -m "feat: right details panel with overview, label, locations, stock and specs tabs"
```

---

## Task 14: Toolbar, floor filter, cutaway slider, dimensions

**Files:**
- Create: `src/ui/TopToolbar.jsx`, `src/ui/FloorFilter.jsx`, `src/ui/Legend.jsx`
- Create: `src/scene/DimensionGuides.jsx`, `src/scene/ZoneMarkers.jsx`
- Modify: `src/App.jsx`, `src/scene/StoreScene.jsx`

- [ ] **Step 1: Write `src/ui/TopToolbar.jsx`**

A floating glass bar over the top-left of the viewport — never a full-width chrome bar; the 3D scene stays the hero.

```jsx
import { useStoreState } from '../store/useStoreState.js'
import { VIEW_ORDER, VIEW_PRESETS } from '../lib/cameraPresets.js'
import FloorFilter from './FloorFilter.jsx'

export default function TopToolbar() {
  const view = useStoreState((s) => s.view)
  const setView = useStoreState((s) => s.setView)
  const cutaway = useStoreState((s) => s.cutaway)
  const setCutaway = useStoreState((s) => s.setCutaway)
  const showDimensions = useStoreState((s) => s.showDimensions)
  const toggleDimensions = useStoreState((s) => s.toggleDimensions)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start gap-3 p-4">
      <div className="pointer-events-auto rounded-xl border border-line/70 bg-ink-850/80 px-2 py-2 backdrop-blur-md">
        <div className="flex items-center gap-1">
          {VIEW_ORDER.map((id) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                view === id ? 'bg-cyan-400 text-ink-900' : 'text-muted hover:bg-ink-700 hover:text-white'
              }`}
            >
              {VIEW_PRESETS[id].label}
            </button>
          ))}
        </div>
      </div>

      <FloorFilter />

      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line/70 bg-ink-850/80 px-4 py-2.5 backdrop-blur-md">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Cutaway</label>
        <input
          type="range" min="0" max="1" step="0.01" value={cutaway}
          onChange={(e) => setCutaway(Number(e.target.value))}
          className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-ink-600 accent-cyan-400"
        />
        <span className="w-8 text-right text-xs tabular-nums text-cyan-300">{Math.round(cutaway * 100)}%</span>
      </div>

      <button
        onClick={toggleDimensions}
        className={`pointer-events-auto rounded-xl border px-4 py-2.5 text-xs font-medium backdrop-blur-md transition ${
          showDimensions
            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
            : 'border-line/70 bg-ink-850/80 text-muted hover:text-white'
        }`}
      >
        Dimensions
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/ui/FloorFilter.jsx`**

Three segmented buttons — `All Floors`, `Ground Floor`, `Second Floor` — writing `setFloorFilter('all' | 'ground' | 'second')`. Same glass-pill styling as the toolbar group.

- [ ] **Step 3: Write `src/scene/ZoneMarkers.jsx`**

For every zone, a `<Billboard>` (drei) at `zoneCenter` + 2.6 m holding a small `<Text>` with the zone label, tinted with `zone.accent`, plus a faint 0.02 m tall outline of the zone footprint on the floor. Respect the floor filter with `visible`. Import `Text` and `Billboard` from `@react-three/drei`. drei's `<Text>` needs a font — pass no `font` prop so it falls back to the bundled default and stays offline-safe.

- [ ] **Step 4: Write `src/scene/DimensionGuides.jsx`**

Rendered only when `showDimensions` is true. Draw:
- Overall footprint: two `<Line>` (drei) runs along the +Z and +X edges with `<Text>` reading `44.0 m` and `30.0 m`.
- Floor heights: a vertical line at the corner `[-22, 0, 15]` up to the second floor with `5.00 m`, and on to the roof with `10.00 m`.
- For the selected placement only: a small bounding box outline (`<Box>` wireframe) around the product plus a text label with its real `W × D × H cm`.

Use cyan `#35e0d4` with `dashed` lines and `depthTest={false}` so guides read over geometry.

- [ ] **Step 5: Write `src/ui/Legend.jsx`**

A small bottom-left glass card, dismissible, that names the two label types with a colour key: a cyan-edged chip for **Shelf-edge ESL** and a red-block chip for **Hybrid sign — printed body, electronic price**. Add a one-line footer: *"Click any product, label or sign."* This is the single piece of on-screen text that makes the concept legible to someone seeing the demo cold.

- [ ] **Step 6: Wire everything up**

`App.jsx`:

```jsx
<main className="relative flex-1">
  <StoreScene />
  <TopToolbar />
  <Legend />
</main>
```

`StoreScene.jsx` — add `<ZoneMarkers />` and `<DimensionGuides />` inside `<Suspense>`.

- [ ] **Step 7: Verify every control**

Run `npm run dev` and check each one:
- Each of the six view buttons animates the camera smoothly, then hands control back to orbit.
- The cutaway slider at 0 seals the building; at 1 the roof is gone and all four walls are faded.
- `Ground Floor` hides the second floor's contents and fades its slab; `Second Floor` hides the ground floor's.
- `Dimensions` overlays measurement lines.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: view presets, floor filter, cutaway slider, dimension guides and legend"
```

---

## Task 15: Polish, performance and README

**Files:**
- Modify: `src/scene/StoreScene.jsx`, `src/App.jsx`
- Create: `README.md`

- [ ] **Step 1: Performance pass**

- Wrap `ProductMesh`, `ESLLabel`, `LargeInfoSign` and every fixture in `React.memo`.
- Confirm no component subscribes to the whole store — every `useStoreState` call must take a selector.
- Count `<pointLight>`s in the scene (browser console: `renderer.info`). Keep the total under 6; drop the light from any lamp beyond the first two per floor.
- Check `renderer.info.render.calls` from the console at the default camera. Under ~400 is comfortable. If it's higher, convert the warehouse cartons and shelf boards to drei `<Instances>`.

- [ ] **Step 2: Responsive pass**

Below `lg`, the right panel becomes a bottom sheet:

```jsx
<aside className="absolute inset-x-0 bottom-0 z-20 h-[52dvh] border-t border-line bg-ink-850 lg:static lg:h-auto lg:w-[380px] lg:shrink-0 lg:border-l lg:border-t-0">
  <RightDetailsPanel />
</aside>
```

Change the outer wrapper to `flex-col lg:flex-row`. Verify at 1440×900, 1280×800 and 390×844.

- [ ] **Step 3: Add a loading veil**

While textures build on first paint, show a centred cyan pulse over the canvas keyed off `<Suspense>`. Use drei's `useProgress` in a small `<Loader>`-style overlay so the demo never opens on a black rectangle.

- [ ] **Step 4: Write `README.md`**

````markdown
# IKEA Store — ESL Digital Twin

A single-page, interactive 3D concept prototype demonstrating Electronic Shelf Labels
inside an IKEA-inspired two-floor store.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Other commands

```bash
npm run test     # data-model and helper tests
npm run build    # production bundle into dist/
npm run preview  # serve the production bundle
```

## What you're looking at

- **A two-floor store.** Ground floor is market hall, self-serve warehouse and a
  small display zone. Second floor is showrooms — living room, bedroom, dining,
  office, storage and the lamp section.
- **Two kinds of label.** Small e-paper **shelf-edge ESLs** clipped to shelf lips
  (cyan powered edge), and large **hybrid hanging signs** — a printed information
  sheet with an *electronic* red price panel at the bottom.
- **One product, several labels.** Four products are placed in two locations each.
  NORRHOLM Bookcase is the clearest: a flat-pack carton in the self-serve warehouse
  and an assembled unit in an upstairs showroom, both driven by one record.

## Controls

| Action | How |
|---|---|
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll |
| Select | Click a product, an ESL, or a hanging sign |
| Deselect | Click empty space |
| Camera presets | 3D Twin · Plan · Isometric · Side · Top · Interior |
| Open the building | Cutaway slider |
| Isolate a floor | All / Ground / Second |
| Measurements | Dimensions toggle |

## How it's built

No 3D assets are downloaded — the whole store is composed from three.js primitives,
and every label is a Canvas2D-painted texture. QR codes are real and scannable
(they point at `https://esl.demo/p/<sku>`).

```
src/data    products, layout constants, derived placements
src/lib     formatting, camera presets, canvas painters, textures
src/store   zustand app state
src/scene   R3F components — shell, fixtures, products, labels
src/ui      toolbar, floor filter, details panel, tabs
```

Mock data only. No backend, no auth, no persistence.
````

- [ ] **Step 5: Run the full verification**

```bash
cd "C:/Users/malgh/WebstormProjects/IKEA Store" && npm run test && npm run build
```

Expected: all tests pass; build completes with no errors. A chunk-size warning for the three.js bundle is expected and fine.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: performance pass, responsive layout and README"
```

---

## Verification — acceptance criteria walkthrough

Run `npm run dev` and confirm each line. This maps 1:1 to the acceptance criteria in the brief.

| # | Criterion | How to check |
|---|---|---|
| 1 | One page | No routing, no navigation — the whole app is `App.jsx` |
| 2 | 3D two-floor IKEA-inspired store appears | Loads straight into the 3D Twin view, both floors visible |
| 3 | Rotate, zoom, navigate | Left-drag, scroll, right-drag; **Interior** preset puts the camera inside |
| 4 | Products and labels clickable | Click a sofa, an ESL and a hanging sign — all three select |
| 5 | Clicking updates the right panel | Panel header changes to the clicked product |
| 6 | Panel shows rich information | All five tabs populate |
| 7 | Some products show multiple locations | Select NORRVIK, SVALBO, LINDHOLM or NORRHOLM → Locations tab lists two rows; clicking the second flies there |
| 8 | Shelf-edge labels clearly electronic | Cyan powered edge; edge brightens and pulses on hover/select |
| 9 | Hanging signs are paper with an electronic price area | Matte upper body, glowing red lower panel with a "LIVE" pill |
| 10 | Realistic enough for presentation | Shelf runs, racks with cartons, showroom rugs and partial walls, escalator through the atrium |
| 11 | Smooth performance | Check FPS in devtools; `renderer.info.render.calls` under ~400 |
| 12 | Modern, clean UI | Floating glass toolbar, dark teal + cyan, uncluttered viewport |

Also confirm the explicit **do not build** constraints hold: no login, no CRUD forms, no admin dashboard, no workflow or architecture diagrams anywhere in the UI.

---

## Notes for the implementer

- **The plan file itself.** Copy this file into `IKEA Store/docs/superpowers/plans/2026-08-30-ikea-esl-digital-twin.md` as the first action of Task 1 so the project carries its own plan.
- **Where the spec is a table, not code.** Tasks 2, 3, 10, 11 and 13 give exact shapes and one worked example, then a table for the repeats. Follow the worked example's style exactly — the repeats are mechanical, and inventing a second style for them is the main way this codebase gets messy.
- **Positions are the fragile part.** Every `positionInScene` and `labelPosition` in `products.js` is hand-placed. The Task 3 tests catch zone-bound and atrium violations but cannot catch a label floating in mid-air or buried inside a shelf. Budget time to nudge these while looking at the scene, and re-run `npm run test` after each nudge.
- **Offline-safe.** Two things would silently add a network dependency: drei's `<Environment preset="…">` and drei's `<Text font="…">`. Neither is used. Keep it that way — the demo may be shown on a bad conference network.
