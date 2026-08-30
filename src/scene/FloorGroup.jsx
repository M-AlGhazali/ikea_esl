import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { floorLift } from '../data/storeLayout.js'
import { useStoreState } from '../store/useStoreState.js'
import { damp } from '../lib/anim.js'

/**
 * Wraps everything belonging to one floor and applies the cutaway lift.
 *
 * The upper level rises as the slider opens, so both floors can be read at once
 * without making either of them transparent. Also carries the floor filter, so
 * every consumer gets isolation for free.
 */
export default function FloorGroup({ floor, children, ...props }) {
  const group = useRef()
  const cutaway = useStoreState((s) => s.cutaway)
  const floorFilter = useStoreState((s) => s.floorFilter)

  const visible =
    floorFilter === 'all' || (floorFilter === 'ground' ? floor === 0 : floor === 1)

  useFrame((_, dt) => {
    if (!group.current) return
    group.current.position.y = damp(group.current.position.y, floorLift(floor, cutaway), 4, dt)
  })

  return (
    <group ref={group} visible={visible} position={[0, floorLift(floor, cutaway), 0]} {...props}>
      {children}
    </group>
  )
}
