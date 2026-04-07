import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlayerMeshProps {
  position: [number, number, number];
  team: "red" | "blue";
  isMe: boolean;
  hasFlag: boolean;
  playerName: string;
  isFrozen: boolean;
}

export default function PlayerMesh({ position, team, isMe, hasFlag, playerName, isFrozen }: PlayerMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3(...position));

  // Smoothly interpolate to target position for remote players
  useFrame(() => {
    if (!meshRef.current) return;
    targetPos.current.set(...position);
    if (isMe) {
      meshRef.current.position.copy(targetPos.current);
    } else {
      meshRef.current.position.lerp(targetPos.current, 0.15);
    }
  });

  const color = isFrozen ? "#666" : team === "red" ? "#ef4444" : "#3b82f6";
  const emissiveColor = team === "red" ? "#ff0000" : "#0066ff";

  return (
    <group>
      <mesh ref={meshRef} position={position} castShadow>
        {/* Body */}
        <capsuleGeometry args={[0.8, 1.2, 8, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={isMe ? emissiveColor : "#000"}
          emissiveIntensity={isMe ? 0.3 : 0}
          roughness={0.4}
          metalness={0.2}
        />
        
        {/* Flag indicator */}
        {hasFlag && (
          <mesh position={[0, 2, 0]}>
            <coneGeometry args={[0.4, 0.8, 4]} />
            <meshStandardMaterial color="#fbbf24" emissive="#ff9900" emissiveIntensity={0.5} />
          </mesh>
        )}
        
        {/* Frozen indicator */}
        {isFrozen && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#88ccff" transparent opacity={0.3} wireframe />
          </mesh>
        )}
      </mesh>
    </group>
  );
}
