import { memo, useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

/**
 * Believable low-poly stand-ins for the catalog, composed from primitives and
 * sized from each product real dimensions (cm converted to metres) so the
 * Dimensions overlay tells the truth.
 */

const matCache = new Map()
const mat = (color, roughness = 0.7, metalness = 0.05) => {
  const key = `${color}:${roughness}:${metalness}`
  if (!matCache.has(key)) matCache.set(key, new MeshStandardMaterial({ color, roughness, metalness }))
  return matCache.get(key)
}

const DARK_METAL = '#2b3136'
const LIGHT_METAL = '#9aa6ac'
const SHADE_WARM = '#efe6d4'

function ProductMesh({ product, displayType, lit = false }) {
  const d = product.dimensions
  const w = d.width / 100
  const dp = d.depth / 100
  const h = d.height / 100
  const body = useMemo(() => mat(product.colorHex), [product.colorHex])

  // Flat-pack in the warehouse: a carton, whatever the category.
  if (displayType === 'warehouse-rack') {
    const p = product.packaging ?? { width: d.width, depth: 20, height: d.height }
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, p.height / 200, 0]}>
          <boxGeometry args={[p.width / 100, p.height / 100, p.depth / 100]} />
          <meshStandardMaterial color="#c8a878" roughness={0.95} />
        </mesh>
        <mesh position={[0, p.height / 200, p.depth / 200 + 0.005]}>
          <planeGeometry args={[(p.width / 100) * 0.5, 0.16]} />
          <meshStandardMaterial color="#f0e6d4" roughness={0.9} />
        </mesh>
      </group>
    )
  }

  switch (product.category) {
    case 'Lamps':
      return h > 1
        ? <FloorLamp w={w} h={h} body={body} lit={lit} />
        : <TableLamp w={w} h={h} body={body} lit={lit} />
    case 'Sofas':
      return <Sofa w={w} d={dp} h={h} body={body} />
    case 'Coffee Tables':
      return <Table w={w} d={dp} h={h} body={body} lowShelf />
    case 'Dining':
      return h > 0.9
        ? <Chair w={w} d={dp} h={h} body={body} />
        : <Table w={w} d={dp} h={h} body={body} />
    case 'Shelves':
      return h > 1
        ? <Bookcase w={w} d={dp} h={h} body={body} />
        : <WallShelf w={w} d={dp} h={h} body={body} />
    case 'Bed Textiles':
      return <FoldedTextile w={w} d={dp} body={body} />
    case 'Storage Boxes':
      return <BoxStack w={w} d={dp} h={h} body={body} />
    case 'Kitchen':
      return <Pan w={w} h={h} body={body} />
    case 'Decor':
      return <Vase w={w} h={h} body={body} />
    case 'Bedroom':
      return <Bed w={w} d={dp} h={h} body={body} />
    case 'Office':
      return h > 0.9
        ? <OfficeChair w={w} h={h} body={body} />
        : <Table w={w} d={dp} h={h} body={body} />
    default:
      return (
        <mesh castShadow position={[0, h / 2, 0]} material={body}>
          <boxGeometry args={[w, h, dp]} />
        </mesh>
      )
  }
}

/* -------------------------------------------------------------------------- */

function FloorLamp({ w, h, body, lit }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.02, 0]} material={mat(DARK_METAL, 0.5, 0.4)}>
        <cylinderGeometry args={[w / 2, w / 2, 0.04, 24]} />
      </mesh>
      <mesh castShadow position={[0, h / 2, 0]} material={mat(DARK_METAL, 0.4, 0.6)}>
        <cylinderGeometry args={[0.018, 0.018, h - 0.24, 12]} />
      </mesh>
      <mesh castShadow position={[0, h - 0.13, 0]}>
        <cylinderGeometry args={[w / 2.1, w / 2.6, 0.28, 24, 1, true]} />
        <meshStandardMaterial
          color={SHADE_WARM}
          roughness={0.9}
          side={2}
          emissive="#ffdca8"
          emissiveIntensity={0.4}
        />
      </mesh>
      {lit && <pointLight position={[0, h - 0.18, 0]} intensity={2.4} distance={3.6} color="#ffdca8" />}
      <mesh position={[0, h - 0.27, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#fff4dd" emissive="#ffe6bc" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  )
}

function TableLamp({ w, h, body, lit }) {
  return (
    <group>
      <mesh castShadow position={[0, h * 0.16, 0]} material={body}>
        <cylinderGeometry args={[w / 2.6, w / 2.2, h * 0.32, 20]} />
      </mesh>
      <mesh position={[0, h * 0.42, 0]} material={mat(LIGHT_METAL, 0.4, 0.5)}>
        <cylinderGeometry args={[0.012, 0.012, h * 0.24, 8]} />
      </mesh>
      <mesh castShadow position={[0, h * 0.74, 0]}>
        <cylinderGeometry args={[w / 2.2, w / 1.75, h * 0.44, 20, 1, true]} />
        <meshStandardMaterial
          color={SHADE_WARM}
          roughness={0.9}
          side={2}
          emissive="#ffdca8"
          emissiveIntensity={0.45}
        />
      </mesh>
      {lit && <pointLight position={[0, h * 0.7, 0]} intensity={1.1} distance={2.2} color="#ffdca8" />}
    </group>
  )
}

function Sofa({ w, d, h, body }) {
  const seatH = h * 0.42
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, seatH, 0]} material={body}>
        <boxGeometry args={[w, seatH * 0.55, d]} />
      </mesh>
      <mesh castShadow position={[0, h * 0.72, -d / 2 + 0.14]} material={body}>
        <boxGeometry args={[w, h * 0.56, 0.24]} />
      </mesh>
      {[-w / 2 + 0.12, w / 2 - 0.12].map((x) => (
        <mesh key={x} castShadow position={[x, h * 0.56, 0]} material={body}>
          <boxGeometry args={[0.24, h * 0.42, d]} />
        </mesh>
      ))}
      {[-w / 4, w / 4].map((x) => (
        <mesh key={`c-${x}`} castShadow position={[x, h * 0.58, 0.02]} material={mat('#e9e4d8', 0.95)}>
          <boxGeometry args={[w / 2.6, 0.14, d * 0.7]} />
        </mesh>
      ))}
      {[
        [-w / 2 + 0.16, -d / 2 + 0.14],
        [w / 2 - 0.16, -d / 2 + 0.14],
        [-w / 2 + 0.16, d / 2 - 0.14],
        [w / 2 - 0.16, d / 2 - 0.14],
      ].map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, seatH * 0.32, z]} material={mat('#8a6a45', 0.6)}>
          <cylinderGeometry args={[0.035, 0.028, seatH * 0.64, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function Table({ w, d, h, body, lowShelf = false }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h - 0.025, 0]} material={body}>
        <boxGeometry args={[w, 0.05, d]} />
      </mesh>
      {lowShelf && (
        <mesh castShadow position={[0, h * 0.3, 0]} material={mat('#b08d5f', 0.8)}>
          <boxGeometry args={[w * 0.82, 0.03, d * 0.78]} />
        </mesh>
      )}
      {[
        [-w / 2 + 0.07, -d / 2 + 0.07],
        [w / 2 - 0.07, -d / 2 + 0.07],
        [-w / 2 + 0.07, d / 2 - 0.07],
        [w / 2 - 0.07, d / 2 - 0.07],
      ].map(([x, z]) => (
        <mesh key={`${x}:${z}`} castShadow position={[x, (h - 0.05) / 2, z]} material={mat(DARK_METAL, 0.45, 0.5)}>
          <boxGeometry args={[0.05, h - 0.05, 0.05]} />
        </mesh>
      ))}
    </group>
  )
}

function Chair({ w, d, h, body }) {
  const seatH = h * 0.5
  return (
    <group>
      <mesh castShadow position={[0, seatH, 0]} material={body}>
        <boxGeometry args={[w, 0.05, d * 0.82]} />
      </mesh>
      <mesh castShadow position={[0, seatH + h * 0.24, -d * 0.34]} material={body}>
        <boxGeometry args={[w, h * 0.44, 0.05]} />
      </mesh>
      {[
        [-w / 2 + 0.05, -d * 0.34],
        [w / 2 - 0.05, -d * 0.34],
        [-w / 2 + 0.05, d * 0.32],
        [w / 2 - 0.05, d * 0.32],
      ].map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, seatH / 2, z]} material={mat(DARK_METAL, 0.45, 0.55)}>
          <cylinderGeometry args={[0.018, 0.018, seatH, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function OfficeChair({ w, h, body }) {
  const seatH = h * 0.42
  return (
    <group>
      <mesh castShadow position={[0, seatH, 0]} material={body}>
        <boxGeometry args={[w * 0.72, 0.09, w * 0.72]} />
      </mesh>
      <mesh castShadow position={[0, seatH + h * 0.26, -w * 0.28]} material={mat('#4d565c', 0.85)}>
        <boxGeometry args={[w * 0.66, h * 0.46, 0.06]} />
      </mesh>
      <mesh position={[0, seatH / 2, 0]} material={mat(LIGHT_METAL, 0.35, 0.6)}>
        <cylinderGeometry args={[0.035, 0.035, seatH, 10]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * w * 0.3, 0.04, Math.sin(a) * w * 0.3]}
            material={mat(DARK_METAL, 0.5, 0.4)}
          >
            <boxGeometry args={[w * 0.34, 0.05, 0.06]} />
          </mesh>
        )
      })}
    </group>
  )
}

function Bookcase({ w, d, h, body }) {
  const shelves = 5
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, -d / 2 + 0.01]} material={mat('#a98d68', 0.9)}>
        <boxGeometry args={[w, h, 0.02]} />
      </mesh>
      {[-w / 2 + 0.01, w / 2 - 0.01].map((x) => (
        <mesh key={x} castShadow position={[x, h / 2, 0]} material={body}>
          <boxGeometry args={[0.03, h, d]} />
        </mesh>
      ))}
      {Array.from({ length: shelves + 1 }, (_, i) => (i * h) / shelves).map((y) => (
        <mesh key={y} castShadow receiveShadow position={[0, Math.min(y, h - 0.015), 0]} material={body}>
          <boxGeometry args={[w, 0.03, d]} />
        </mesh>
      ))}
      {/* a few books, so the unit does not read as an empty box */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((i) => (
          <mesh
            key={`${row}-${i}`}
            castShadow
            position={[-w / 2 + 0.09 + i * 0.055, (row * h) / shelves + h / shelves / 2 + 0.03, 0]}
            material={mat(['#7c95a3', '#b4655e', '#8c9c76', '#c9a877'][i], 0.85)}
          >
            <boxGeometry args={[0.04, h / shelves - 0.14, d * 0.7]} />
          </mesh>
        )),
      )}
    </group>
  )
}

function WallShelf({ w, d, h, body }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]} material={body}>
        <boxGeometry args={[w, 0.04, d]} />
      </mesh>
      {[-w / 2 + 0.12, w / 2 - 0.12].map((x) => (
        <mesh key={x} position={[x, -0.06, -d / 2 + 0.06]} material={mat(LIGHT_METAL, 0.4, 0.5)}>
          <boxGeometry args={[0.03, 0.1, d * 0.7]} />
        </mesh>
      ))}
      <mesh castShadow position={[w * 0.2, 0.09, 0]} material={mat('#b4655e', 0.9)}>
        <boxGeometry args={[0.07, 0.15, d * 0.6]} />
      </mesh>
    </group>
  )
}

function FoldedTextile({ w, d, body }) {
  const fw = Math.min(w, 0.42)
  const fd = Math.min(d, 0.3)
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} castShadow position={[0, 0.045 + i * 0.085, 0]} material={body}>
          <boxGeometry args={[fw - i * 0.02, 0.08, fd - i * 0.015]} />
        </mesh>
      ))}
      <mesh position={[0, 0.13, fd / 2 - 0.005]} material={mat('#f4f2ec', 0.95)}>
        <planeGeometry args={[fw * 0.5, 0.06]} />
      </mesh>
    </group>
  )
}

function BoxStack({ w, d, h, body }) {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[i * 0.03 - 0.03, h / 2 + i * h * 0.34, 0]}
          material={i === 1 ? mat('#cfc9bd', 0.9) : body}
        >
          <boxGeometry args={[w - i * 0.04, h * 0.32, d - i * 0.03]} />
        </mesh>
      ))}
    </group>
  )
}

function Pan({ w, h, body }) {
  return (
    <group>
      <mesh castShadow position={[0, h / 2, 0]} material={body}>
        <cylinderGeometry args={[w / 2, w / 2.3, h, 26]} />
      </mesh>
      <mesh position={[0, h * 0.92, 0]} material={mat('#4a5155', 0.5, 0.3)}>
        <torusGeometry args={[w / 2, 0.008, 8, 26]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
      <mesh castShadow position={[w / 2 + 0.07, h * 0.8, 0]} rotation={[0, 0, 0.18]} material={body}>
        <boxGeometry args={[0.16, 0.022, 0.035]} />
      </mesh>
    </group>
  )
}

function Vase({ w, h, body }) {
  return (
    <group>
      <mesh castShadow position={[0, h * 0.42, 0]} material={body}>
        <sphereGeometry args={[w / 1.9, 18, 14]} />
      </mesh>
      <mesh castShadow position={[0, h * 0.8, 0]} material={body}>
        <cylinderGeometry args={[w / 3.6, w / 2.6, h * 0.4, 18]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[(i - 1) * 0.02, h * 1.14, 0]}
          rotation={[0, 0, (i - 1) * 0.25]}
          material={mat('#7d9268', 0.9)}
        >
          <cylinderGeometry args={[0.005, 0.005, h * 0.55, 6]} />
        </mesh>
      ))}
    </group>
  )
}

function Bed({ w, d, h, body }) {
  const mattressY = h * 0.42
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, mattressY * 0.6, 0]} material={body}>
        <boxGeometry args={[w, mattressY * 0.4, d]} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, mattressY + 0.09, 0]} material={mat('#f3f1ea', 0.95)}>
        <boxGeometry args={[w - 0.06, 0.22, d - 0.06]} />
      </mesh>
      <mesh castShadow position={[0, h * 0.62, -d / 2 + 0.05]} material={body}>
        <boxGeometry args={[w, h * 0.72, 0.09]} />
      </mesh>
      {[-w / 4, w / 4].map((x) => (
        <mesh key={x} castShadow position={[x, mattressY + 0.26, -d / 2 + 0.34]} material={mat('#e6e2d6', 0.95)}>
          <boxGeometry args={[w / 2.6, 0.11, 0.4]} />
        </mesh>
      ))}
      {[
        [-w / 2 + 0.1, -d / 2 + 0.1],
        [w / 2 - 0.1, -d / 2 + 0.1],
        [-w / 2 + 0.1, d / 2 - 0.1],
        [w / 2 - 0.1, d / 2 - 0.1],
      ].map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, mattressY * 0.2, z]} material={mat('#b09371', 0.7)}>
          <boxGeometry args={[0.07, mattressY * 0.4, 0.07]} />
        </mesh>
      ))}
    </group>
  )
}

export default memo(ProductMesh)
