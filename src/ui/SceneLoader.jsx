import { useProgress } from '@react-three/drei'

/** Cyan pulse over the canvas while textures build, so the demo never opens on black. */
export default function SceneLoader() {
  const { active, progress } = useProgress()
  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-ink-900">
      <div className="text-center">
        <div className="mx-auto size-10 animate-pulse rounded-full border-2 border-cyan-400/40 border-t-cyan-400" />
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Building digital twin
        </p>
        <p className="mt-1 text-xs tabular-nums text-muted">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}
