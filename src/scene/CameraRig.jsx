import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

const tmpPos = new Vector3()
const tmpTarget = new Vector3()

/**
 * Orbit controls plus eased transitions between camera presets. Once the
 * camera arrives at a goal we drop it, so the user immediately regains free
 * orbit rather than fighting an animation.
 */
export default function CameraRig() {
  const controls = useRef()
  const camera = useThree((s) => s.camera)
  const goal = useRef(null)

  const cameraRequest = useStoreState((s) => s.cameraRequest)
  const consume = useStoreState((s) => s.consumeCameraRequest)

  useFrame((_, dt) => {
    if (cameraRequest) {
      const req = consume()
      if (req) {
        goal.current = {
          position: new Vector3(...req.position),
          target: new Vector3(...req.target),
          fov: req.fov,
        }
      }
    }

    const g = goal.current
    if (!g || !controls.current) return

    tmpPos.copy(camera.position)
    tmpPos.x = damp(tmpPos.x, g.position.x, 3.2, dt)
    tmpPos.y = damp(tmpPos.y, g.position.y, 3.2, dt)
    tmpPos.z = damp(tmpPos.z, g.position.z, 3.2, dt)
    camera.position.copy(tmpPos)

    tmpTarget.copy(controls.current.target)
    tmpTarget.x = damp(tmpTarget.x, g.target.x, 3.2, dt)
    tmpTarget.y = damp(tmpTarget.y, g.target.y, 3.2, dt)
    tmpTarget.z = damp(tmpTarget.z, g.target.z, 3.2, dt)
    controls.current.target.copy(tmpTarget)

    const nextFov = damp(camera.fov, g.fov, 3.2, dt)
    if (Math.abs(nextFov - camera.fov) > 0.01) {
      camera.fov = nextFov
      camera.updateProjectionMatrix()
    }

    controls.current.update()

    if (camera.position.distanceTo(g.position) < 0.06) goal.current = null
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={1.5}
      maxDistance={120}
      maxPolarAngle={Math.PI / 2.02}
      target={[0, 4, 0]}
    />
  )
}
