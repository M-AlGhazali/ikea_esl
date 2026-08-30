import { useProgress } from '@react-three/drei'

/** Quiet loading state, so the demo never opens on an empty frame. */
export default function SceneLoader() {
  const { active, progress } = useProgress()
  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-page">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
        <p className="mt-3 text-xs tabular-nums text-ink-faint">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}
