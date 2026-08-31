/**
 * Small brand mark for the portal header.
 *
 * Drawn as inline SVG so it scales cleanly and needs no asset file. Like the 3D
 * fascia, this is a stylised mark for the concept demo — swap in the official
 * artwork before any external use.
 */
export default function BrandMark({ height = 26, className = '' }) {
  return (
    <svg
      viewBox="0 0 132 60"
      height={height}
      role="img"
      aria-label="IKEA"
      className={className}
      style={{ display: 'block' }}
    >
      <ellipse cx="66" cy="30" rx="65" ry="29" fill="#ffdb00" />
      <ellipse cx="66" cy="30" rx="60" ry="24" fill="none" stroke="#0058a3" strokeWidth="2.5" />
      <text
        x="66"
        y="31"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#0058a3"
        fontFamily="Inter, 'Segoe UI', Arial, sans-serif"
        fontSize="28"
        fontWeight="800"
        letterSpacing="1.5"
      >
        IKEA
      </text>
    </svg>
  )
}
