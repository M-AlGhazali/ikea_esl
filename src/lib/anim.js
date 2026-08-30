import { MathUtils } from 'three'

/** Frame-rate independent exponential approach. */
export const damp = (current, target, lambda, dt) => MathUtils.damp(current, target, lambda, dt)

/** Damp each component of a three-element array in place. */
export function dampArray(current, target, lambda, dt) {
  for (let i = 0; i < 3; i++) current[i] = MathUtils.damp(current[i], target[i], lambda, dt)
  return current
}
