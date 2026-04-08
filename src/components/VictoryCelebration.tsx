import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VictoryCelebrationProps {
  position: [number, number, number];
  active: boolean;
}

// Particle burst effect on flag capture
export default function VictoryCelebration({ position, active }: VictoryCelebrationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !active) {
      timeRef.current = 0;
      return;
    }
    timeRef.current += delta;
    const t = timeRef.current;

    // Rotate and scale particles
    groupRef.current.rotation.y += delta * 3;
    const scale = Math.max(0, 1 - t / 2);
    groupRef.current.scale.setScalar(scale);
  });

  if (!active) return null;

  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 3;
    return [Math.cos(angle) * r, 1 + Math.sin(i * 0.5) * 2, Math.sin(angle) * r] as [number, number, number];
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={i} position={p}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#fbbf24" : "#f59e0b"}
            emissive="#ff9900"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      <pointLight color="#fbbf24" intensity={5} distance={15} />
    </group>
  );
}
