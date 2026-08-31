/**
 * Brand mark for the portal header — the supplied logo asset.
 *
 * Referenced by URL rather than imported, which is how Vite expects files in
 * `public/` to be used. The source is 264 x 148, so height drives the width.
 */
const LOGO_SRC = '/ikea-logo.png'

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
