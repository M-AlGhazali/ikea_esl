export default function SpecsTab({ product }) {
  const d = product.dimensions
  const p = product.packaging

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric label="Width" value={d.width} />
        <Metric label="Depth" value={d.depth} />
        <Metric label="Height" value={d.height} />
      </div>

      <dl className="space-y-2.5 border-t border-line pt-4 text-sm">
        {p && (
          <Row label="Packaging">
            {p.width} × {p.depth} × {p.height} cm
          </Row>
        )}
        <Row label="Colour">
          <span className="flex items-center justify-end gap-2">
            <span
              className="size-3.5 rounded-full border border-line-strong"
              style={{ background: product.colorHex }}
            />
            {product.color}
          </span>
        </Row>
        <Row label="Material">{product.material}</Row>
        <Row label="Weight">{product.weightKg} kg</Row>
        <Row label="Category">{product.category}</Row>
        <Row label="Article">
          <span className="font-mono text-xs">{product.articleNo}</span>
        </Row>
        <Row label="SKU">
          <span className="font-mono text-xs">{product.sku}</span>
        </Row>
      </dl>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-soft py-3.5">
      <p className="text-xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label} cm</p>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="text-right text-sm text-ink">{children}</dd>
    </div>
  )
}
