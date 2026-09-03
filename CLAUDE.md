# CLAUDE.md — IKEA ESL Digital Twin

Project instructions for Claude Code. Read this before changing anything here.

## What this is

A single-page, interactive 3D **concept demo** for a presentation: Electronic
Shelf Labels inside an IKEA-inspired two-floor store. It exists to make one idea
land visually — *a store is a digital twin, every shelf-edge price is a screen,
and one product record can drive labels in several physical places at once.*

It is **not** a system. Do not add: admin dashboards, label-management
workflows, backend CRUD, authentication, ERP/CRM diagrams, or operational
controls. Those were ruled out explicitly and repeatedly.

## Commands

```bash
npm run dev      # vite dev server on 5173
npm run test     # vitest, data model + pure helpers
npm run build    # production bundle
```

## Stack

Vite 8 · React 19 · three 0.185 · @react-three/fiber 9 · @react-three/drei 10 ·
zustand 5 · qrcode · Tailwind 4 (CSS-first `@theme` in `src/index.css`) · Vitest 4.

Plain JavaScript with JSDoc typedefs — no TypeScript.

## Layout

```
src/data     products, layout constants, derived placements
src/lib      formatting, camera presets, canvas painters, label textures
src/store    zustand app state (selection, view, floor, cutaway)
src/scene    R3F components — shell, fixtures, products, labels
src/ui       toolbar, floor filter, details panel, tabs
```

## Rules that matter

**Offline-safe.** Nothing may be fetched at runtime. Two specific traps: drei's
`<Environment preset="…">` fetches an HDR from a CDN (a local `<Lightformer>`
rig is used instead), and drei's `<Text font="…">` fetches a font. Never pass
either. The demo may be shown on bad conference wifi.

**Labels are canvas textures, not DOM overlays.** `src/lib/eslTexture.js` and
`signTexture.js` paint with Canvas2D and map onto planes. This keeps them crisp,
occlusion-correct, cheap, and clickable by raycast. It is also the only way
Arabic shapes correctly — the bundled 3D font has no Arabic coverage, so any
Arabic in the scene must go through a canvas, never drei `<Text>`.

**The hybrid sign is two meshes.** Matte paper body above, emissive red price
block below. Do not merge them into one texture; that contrast *is* the
hybrid-signage concept.

**`src/data/placements.js` is the seam.** It flattens `PRODUCTS[].locations[]`
into one list. The scene iterates *placements*; the panel iterates a *product's*
locations. Both point at the same records, so they cannot disagree. Multi-location
is the headline feature — do not break it.

**Geometry contract.** Y up, metres, origin at the centre of the footprint, **+Z
is the storefront**. Ground floor y=0, second floor y=5.0, roof y=10.0, atrium
void at x∈[-6,6] z∈[-4,4]. All of this lives in `src/data/storeLayout.js`; the
placement tests enforce it.

**Cutaway lifts, it does not ghost.** The slider raises the whole upper floor
(`FloorGroup` + `secondFloorLift`) and floats the roof away, so both levels stay
solid and readable. Anything added on floor 1 must sit inside a `FloorGroup` or
it will not move with the floor.

**Decorative drei `<Line>` needs `raycast={null}`.** Otherwise LineSegments2
throws on every pointer move.

**Give overlapping label meshes real depth separation** (~3mm). A sub-millimetre
gap z-fights at demo camera distances and the face renders black.

## Design

Light and minimal. White surfaces, one blue (`#0058A3`) for anything
interactive, colour reserved for meaning only: red for price, green/amber/red
for stock. Tokens are in `src/index.css` under `@theme`. Keep copy short — the
tabs and panel text were deliberately trimmed.

## Branding

`public/ikea-logo.png` is the supplied asset, used in the portal header.

The 3D storefront wordmark (`src/scene/StorefrontSign.jsx`) is 3D text in a
generic heavy sans — a **stylised stand-in**, not the brand typeface. Replace it
before this goes anywhere external.

## Testing

Vitest covers the data model and pure helpers only: catalog integrity, placement
geometry, formatting, camera presets, the state store. The 3D scene is verified
by looking at it in a browser. Do not add React Testing Library or an R3F test
renderer — that was decided against.

If you change a `positionInScene`, re-run `npm run test`; the placement tests
catch zone-bound, floor and atrium violations, but they cannot catch a label
floating in mid-air. Look at it.

## History

The original implementation plan is in
`docs/superpowers/plans/2026-08-30-ikea-esl-digital-twin.md`.
