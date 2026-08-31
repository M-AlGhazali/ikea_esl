import { memo } from 'react'
import { Text } from '@react-three/drei'
import { STORE } from '../data/storeLayout.js'

/**
 * The wordmark above the entrance — yellow letters on the storefront, nothing
 * else. It sits just outside the +Z wall so it never occludes the interior, and
 * it stays opaque through the cutaway: once the building opens up, this is the
 * only thing still saying whose store it is.
 *
 * Real text geometry rather than a painted texture, so it stays sharp at any
 * zoom. Latin-only, so the bundled 3D font covers it and no font is fetched.
 *
 * NOTE: a generic heavy sans, not the brand typeface. Swap before external use.
 */
const SIGN_Y = 6.6
const FONT_SIZE = 2.8

function StorefrontSign() {
  return (
    <Text
      position={[0, SIGN_Y, STORE.z[1] + 0.62]}
      fontSize={FONT_SIZE}
      letterSpacing={0.08}
      anchorX="center"
      anchorY="middle"
      color="#ffdb00"
      /* A thin blue edge keeps the yellow readable once the cutaway fades the
         building away and leaves the letters against the light background. */
      outlineWidth={0.055}
      outlineColor="#0058a3"
      fontWeight="bold"
    >
      IKEA
    </Text>
  )
}

export default memo(StorefrontSign)
