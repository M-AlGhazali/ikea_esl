export default function SpecsTab({ product }) {
  const d = product.dimensions
  const p = product.packaging

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line/70 bg-ink-800/60 p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Dimensions</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Width" value={d.width} unit={d.unit} />
          <Metric label="Depth" value={d.depth} unit={d.unit} />
          <Metric label="Height" value={d.height} unit={d.unit} />
        </div>
        {p && (
          <p className="mt-3 border-t border-line/60 pt-3 text-xs text-muted">
            Packaging{' '}
            <span className="text-white">
              {p.width} × {p.depth} × {p.height} {p.unit}
            </span>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-line/70 bg-ink-800/60 p-4">
        <dl className="space-y-2.5 text-sm">
          <Row label="Colour">
            <span className="flex items-center gap-2">
              <span
                className="size-3.5 rounded-full border border-white/25"
                style={{ background: product.colorHex }}
              />
              {product.color}
            </span>
          </Row>
          <Row label="Material">{product.material}</Row>
          <Row label="Weight">{product.weightKg} kg</Row>
          <Row label="Category">{product.category}</Row>
          <Row label="Article No.">
            <span className="font-mono text-xs">{product.articleNo}</span>
          </Row>
          <Row label="SKU">
            <span className="font-mono text-xs">{product.sku}</span>
          </Row>
        </dl>
      </div>
    </div>
  )
}

function Metric({ label, value, unit }) {
  return (
    <div className="rounded-lg bg-ink-900/60 py-3">
      <p className="text-xl font-bold tabular-nums text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted">
        {label} ({unit})
      </p>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-white">{children}</dd>
    </div>
  )
}
