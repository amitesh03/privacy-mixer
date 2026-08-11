import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

/**
 * A floating cluster of interlocking geometric glass primitives.
 * Uses MeshPhysicalMaterial for a high-fidelity iridescent crystal look.
 * Performance-conscious: low polygon count, no post-processing.
 */
function CrystalShard({
  position,
  scale,
  rotationSpeed,
  color,
  phase = 0,
}: {
  position: [number, number, number]
  scale: [number, number, number]
  rotationSpeed: number
  color: string
  phase?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      meshRef.current.rotation.y = t * rotationSpeed + phase
      meshRef.current.rotation.x = Math.sin(t * 0.4 + phase) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.02}
        metalness={0}
        transmission={0.96}
        thickness={1.5}
        ior={1.5}
        reflectivity={0.5}
        iridescence={0.8}
        iridescenceIOR={1.8}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function GeoRing({ phase = 0 }: { phase?: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.12 + phase
      ref.current.rotation.x = state.clock.elapsedTime * 0.06 + phase
    }
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.4, 0.04, 8, 64]} />
      <meshPhysicalMaterial
        color="#3b82f6"
        roughness={0.1}
        metalness={0.3}
        transparent
        opacity={0.25}
      />
    </mesh>
  )
}

function GeoRing2({ phase = 0 }: { phase?: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * -0.09 + phase
      ref.current.rotation.x = Math.PI / 2 + state.clock.elapsedTime * 0.05
    }
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.8, 0.03, 8, 48]} />
      <meshPhysicalMaterial
        color="#818cf8"
        roughness={0.1}
        metalness={0.2}
        transparent
        opacity={0.2}
      />
    </mesh>
  )
}

function FloatingDots() {
  const count = 40
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    return pos
  }, [])

  const ref = useRef<THREE.Points>(null!)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#93c5fd"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'low-power',
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[5, 8, 5]} intensity={2} color="#dbeafe" />
        <directionalLight position={[-5, -3, 5]} intensity={0.8} color="#ede9fe" />
        <pointLight position={[3, 3, 2]} intensity={1.0} color="#bfdbfe" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Central cluster */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
          <CrystalShard
            position={[0, 0, 0]}
            scale={[0.9, 1.4, 0.9]}
            rotationSpeed={0.12}
            color="#bfdbfe"
            phase={0}
          />
          <CrystalShard
            position={[1.1, 0.5, -0.3]}
            scale={[0.5, 0.8, 0.5]}
            rotationSpeed={-0.18}
            color="#c7d2fe"
            phase={1.2}
          />
          <CrystalShard
            position={[-1.0, -0.5, -0.2]}
            scale={[0.4, 0.65, 0.4]}
            rotationSpeed={0.22}
            color="#f0abfc"
            phase={2.4}
          />
          <CrystalShard
            position={[0.4, -1.0, 0.3]}
            scale={[0.35, 0.55, 0.35]}
            rotationSpeed={-0.15}
            color="#a5f3fc"
            phase={0.6}
          />

          {/* Orbital rings  */}
          <GeoRing phase={0} />
          <GeoRing2 phase={Math.PI / 4} />
        </Float>

        <FloatingDots />
      </Canvas>
    </div>
  )
}
