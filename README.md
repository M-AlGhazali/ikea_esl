# IKEA ESL — Digital Twin

A single-page, interactive 3D concept prototype demonstrating **Electronic Shelf
Labels** inside an IKEA-inspired two-floor store.

This is a presentation demo, not a system: mock data only, no backend, no auth,
no admin tooling. The whole point is to make one idea land visually — *a store is
a digital twin, every shelf-edge price is a screen, and one product record can
drive labels in several physical places at once.*

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

## Other commands

```bash
npm run test
```

```bash
npm run build
```

`npm run preview` serves the production bundle.

## What you are looking at

**A two-floor store.** The ground floor is market hall (home accessories,
kitchen, textiles, decor, lighting accessories), a self-serve warehouse with
tall racking, a small furniture display and a checkout row. The second floor is
showrooms — two living rooms, a bedroom, dining, office, storage solutions and
the lamp section.

**Two kinds of label, deliberately different:**

| | |
|---|---|
| **Shelf-edge ESL** | Small e-paper tag clipped to the shelf lip. Bilingual name, price, promo and old price, product image, QR, SKU, aisle, stock, dimensions. A blue strip on the housing signals that it is powered; it brightens on hover and pulses when selected. |
| **Hybrid showroom sign** | A large hanging *printed* information sheet whose bottom red price block is a **screen**. Built as two separate meshes so the paper stays matte while the price block glows. That contrast is the hybrid-signage pitch. |

**One product, several labels.** Four products are placed in two locations each.
The clearest is NORRHOLM Bookcase: a flat-pack carton in the self-serve
warehouse and an assembled unit in an upstairs showroom, both driven by one
record. NORRVIK Floor Lamp is the other headline — the lamp section labels it
with an ESL, the living-room showroom labels it with a hybrid sign, and both
show the same price.

Open the **Locations** tab on any of those products and click a row: the camera
flies to that instance, so the claim is verifiable in the scene rather than just
asserted in text.

## Controls

| Action | How |
|---|---|
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll |
| Select | Click a product, an ESL, or a hanging sign |
| Deselect | Click empty space, or × in the panel |
| Camera presets | 3D Twin · Plan · Isometric · Side · Top · Interior |
| Open the building | Cutaway slider |
| Isolate a level | All / Ground / Second |
| Measurements | Dimensions toggle |

**The cutaway slider** does more than fade walls. At 0% the store is sealed — a
blue-and-yellow box you would recognise from a retail park. As it opens, the
roof lifts away and the **entire upper floor rises**, so both levels stay solid
and readable at once instead of one becoming a ghost. The escalator stretches to
keep the two plates connected.

## How it is built

No 3D assets are downloaded and nothing is fetched at runtime. The store is
composed from three.js primitives with shared geometries and materials, and
every label is painted with Canvas2D and mapped onto a plane — which keeps the
labels crisp, correctly occluded, cheap, and clickable by raycast. The QR codes
are real and scannable; they resolve to `https://esl.demo/p/<sku>`.

```
src/data     products, layout constants, derived placements
src/lib      formatting, camera presets, canvas painters, label textures
src/store    zustand app state (selection, view, floor, cutaway)
src/scene    R3F components — shell, fixtures, products, labels
src/ui       toolbar, floor filter, details panel, tabs
```

The seam that makes multi-location work is `src/data/placements.js`: it flattens
`PRODUCTS[].locations[]` into one flat list. The 3D scene iterates *placements*;
the details panel iterates a *product's* locations. Both point at the same
records, so they can never disagree.

### Branding

The portal header uses the supplied logo asset at `public/ikea-logo.png`.

The storefront wordmark in the 3D scene (`src/scene/StorefrontSign.jsx`) is 3D
text in a generic heavy sans — a **stylised stand-in**, not the brand typeface.
Replace it before the deck goes anywhere external.

### Offline-safe

Two things would silently add a network dependency and are avoided on purpose:
drei's `<Environment preset="…">` (fetches an HDR from a CDN — a local
lightformer rig is used instead) and drei's `<Text font="…">`. Keep it that way;
a demo should not depend on conference wifi.

## Tests

`npm run test` covers the data model and the pure helpers — catalog integrity
(unique IDs, price relationships, stock consistency, bilingual names), placement
geometry (everything inside its zone, on its floor, out of the atrium void, and
below its ceiling), price formatting, camera presets, and the state store.

The 3D scene itself is verified by looking at it.

## Scope

Deliberately **not** included: admin dashboards, label-management workflows,
backend CRUD, authentication, ERP/CRM diagrams, or operational controls. All 16
products are mock data in `src/data/products.js`; edit that file to change the
catalog and both the labels and the panel follow.
