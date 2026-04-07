import { MAP_SIZE, HALF_MAP, OBSTACLES } from "@/game/constants";

export default function GameMap() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshStandardMaterial color="#2d5a3d" roughness={0.9} />
      </mesh>

      {/* Red half tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-HALF_MAP / 2, 0.01, 0]}>
        <planeGeometry args={[HALF_MAP, MAP_SIZE]} />
        <meshStandardMaterial color="#5a2d2d" transparent opacity={0.15} />
      </mesh>

      {/* Blue half tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[HALF_MAP / 2, 0.01, 0]}>
        <planeGeometry args={[HALF_MAP, MAP_SIZE]} />
        <meshStandardMaterial color="#2d3d5a" transparent opacity={0.15} />
      </mesh>

      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.5, MAP_SIZE]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.2} />
      </mesh>

      {/* Walls */}
      {[
        { pos: [0, 2, -HALF_MAP] as [number, number, number], size: [MAP_SIZE, 4, 1] as [number, number, number] },
        { pos: [0, 2, HALF_MAP] as [number, number, number], size: [MAP_SIZE, 4, 1] as [number, number, number] },
        { pos: [-HALF_MAP, 2, 0] as [number, number, number], size: [1, 4, MAP_SIZE] as [number, number, number] },
        { pos: [HALF_MAP, 2, 0] as [number, number, number], size: [1, 4, MAP_SIZE] as [number, number, number] },
      ].map((wall, i) => (
        <mesh key={`wall-${i}`} position={wall.pos} castShadow>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial color="#333" roughness={0.7} />
        </mesh>
      ))}

      {/* Obstacles */}
      {OBSTACLES.map((obs, i) => (
        <mesh key={`obs-${i}`} position={obs.pos} castShadow receiveShadow>
          <boxGeometry args={obs.size} />
          <meshStandardMaterial color={obs.color} roughness={0.6} metalness={0.1} />
        </mesh>
      ))}

      {/* Base markers */}
      <mesh position={[-HALF_MAP + 15, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.2} />
      </mesh>
      <mesh position={[HALF_MAP - 15, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
