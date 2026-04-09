import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PowerUp3DProps {
  position: [number, number, number];
  type: "speed";
  active: boolean;
}

export default function PowerUp3D({ position, type, active }: PowerUp3DProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current || !active) return;
    ref.current.rotation.y += delta * 3;
    ref.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.4;
  });

  if (!active) return null;

  return (
    <group ref={ref} position={position}>
      {/* Glowing orb */}
      <mesh>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#fbbf24" emissive="#ff9900" emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
      {/* Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.08, 8, 24]} />
        <meshStandardMaterial color="#fbbf24" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
      <pointLight color="#fbbf24" intensity={3} distance={8} />
    </group>
  );
}
