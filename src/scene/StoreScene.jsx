import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Environment, Lightformer, Preload } from '@react-three/drei'
import CameraRig from './CameraRig.jsx'
import StoreShell from './StoreShell.jsx'
import Exterior from './Exterior.jsx'
import Escalator from './Escalator.jsx'
import StoreFixtures from './StoreFixtures.jsx'
import Products from './Products.jsx'
import ZoneMarkers from './ZoneMarkers.jsx'
import DimensionGuides from './DimensionGuides.jsx'
import { useStoreState } from '../store/useStoreState.js'
import { VIEW_PRESETS } from '../lib/cameraPresets.js'

/**
 * The whole 3D viewport. Lighting is deliberately cheap: one shadow-casting
 * key, one fill, a hemisphere, and a LOCAL environment built from lightformers.
 * drei's `<Environment preset>` fetches an HDR from a CDN, which would break
 * the demo on a bad conference network — so it is not used here.
 */
export default function StoreScene() {
  const clearSelection = useStoreState((s) => s.clearSelection)

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{
        position: VIEW_PRESETS.twin.position,
        fov: VIEW_PRESETS.twin.fov,
        near: 0.1,
        far: 400,
      }}
      onPointerMissed={() => clearSelection()}
    >
      <color attach="background" args={['#05171c']} />
      <fog attach="fog" args={['#05171c', 95, 240]} />

      <hemisphereLight args={['#cfe9ef', '#0b2a35', 0.55]} />
      <directionalLight
        position={[26, 34, 18]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-camera-far={120}
      />
      <directionalLight position={[-22, 18, -20]} intensity={0.45} />

      <Environment resolution={256}>
        <Lightformer intensity={2.4} position={[0, 12, 0]} scale={[24, 24, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1.1} position={[-16, 6, 12]} scale={[12, 8, 1]} color="#bfeef2" />
        <Lightformer intensity={0.9} position={[16, 6, -12]} scale={[12, 8, 1]} color="#ffe9b8" />
      </Environment>

      <Suspense fallback={null}>
        <StoreShell />
        <Exterior />
        <Escalator />
        <StoreFixtures />
        <Products />
        <ZoneMarkers />
        <DimensionGuides />
        <Preload all />
      </Suspense>

      <CameraRig />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
