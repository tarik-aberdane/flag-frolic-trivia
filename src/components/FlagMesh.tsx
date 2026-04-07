import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FlagMeshProps {
  position: [number, number, number];
  team: "red" | "blue";
  visible: boolean;
}

export default function FlagMesh({ position, team, visible }: FlagMeshProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 2;
    }
  });

  if (!visible) return null;

  const color = team === "red" ? "#ef4444" : "#3b82f6";

  return (
    <group ref={ref} position={position}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Flag cloth */}
      <mesh position={[0.6, 2.5, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Base glow */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.2} />
      </mesh>
      {/* Light */}
      <pointLight color={color} intensity={2} distance={10} position={[0, 3, 0]} />
    </group>
  );
}
