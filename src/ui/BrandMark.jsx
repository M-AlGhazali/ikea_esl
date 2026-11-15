/**
 * Brand mark for the portal header.
 *
 * Built from BASE_URL rather than a bare "/" path: Vite rewrites asset URLs in
 * HTML and CSS for the configured base, but not string literals in JS, so a
 * hard-coded path 404s when the site is served from a sub-path.
 * The source is 264 x 148, so height drives the width.
 */
const LOGO_SRC = `${import.meta.env.BASE_URL}ikea-logo.png`

export default function BrandMark({ height = 38, className = '' }) {
  return (
    <img
      src={LOGO_SRC}
      alt="IKEA"
      style={{ height, width: 'auto', display: 'block' }}
      className={`rounded-xl ${className}`}
    />
  )
}
