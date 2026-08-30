import StoreScene from './scene/StoreScene.jsx'

export default function App() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-ink-900 lg:flex-row">
      <main className="relative min-h-0 flex-1">
        <StoreScene />
      </main>
      <aside className="h-[52dvh] shrink-0 border-t border-line bg-ink-850 lg:h-auto lg:w-[380px] lg:border-l lg:border-t-0">
        {/* RightDetailsPanel lands here next */}
      </aside>
    </div>
  )
}
