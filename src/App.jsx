import StoreScene from './scene/StoreScene.jsx'
import TopToolbar from './ui/TopToolbar.jsx'
import Legend from './ui/Legend.jsx'
import SceneLoader from './ui/SceneLoader.jsx'
import RightDetailsPanel from './ui/RightDetailsPanel.jsx'

/**
 * One page: a 3D viewport that takes most of the screen, floating controls over
 * it, and a details panel that updates whenever something in the scene is
 * selected. Below `lg` the panel becomes a bottom sheet.
 */
export default function App() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-page lg:flex-row">
      <main className="relative min-h-0 flex-1">
        <StoreScene />
        <SceneLoader />
        <TopToolbar />
        <Legend />
      </main>

      <aside className="h-[50dvh] shrink-0 border-t border-line bg-panel lg:h-auto lg:w-[380px] lg:border-l lg:border-t-0 xl:w-[400px]">
        <RightDetailsPanel />
      </aside>
    </div>
  )
}
