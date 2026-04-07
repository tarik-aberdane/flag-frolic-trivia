// Game constants for the 3D capture-the-flag game
export const MAP_SIZE = 200; // Large map
export const HALF_MAP = MAP_SIZE / 2;
export const PLAYER_SPEED = 0.15;
export const PLAYER_RADIUS = 1.5;
export const FLAG_RADIUS = 2;
export const CAPTURE_DISTANCE = 4;
export const TAG_DISTANCE = 5;
export const GAME_DURATION = 300; // 5 minutes
export const BROADCAST_INTERVAL = 50; // ms between position broadcasts (20 updates/sec)

// Base positions
export const RED_BASE = { x: -HALF_MAP + 15, y: 1, z: 0 };
export const BLUE_BASE = { x: HALF_MAP - 15, y: 1, z: 0 };

// Flag positions (at bases)
export const RED_FLAG_POS = { x: -HALF_MAP + 10, y: 2, z: 0 };
export const BLUE_FLAG_POS = { x: HALF_MAP - 10, y: 2, z: 0 };

// Obstacles layout for the large map
export interface ObstacleData {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
}

export const OBSTACLES: ObstacleData[] = [
  // Central divider walls (with gaps)
  { pos: [0, 2, -40], size: [3, 4, 30], color: "#4a5568" },
  { pos: [0, 2, 40], size: [3, 4, 30], color: "#4a5568" },
  { pos: [0, 2, 0], size: [3, 4, 15], color: "#4a5568" },
  
  // Red side structures
  { pos: [-40, 2, -25], size: [8, 4, 3], color: "#742a2a" },
  { pos: [-40, 2, 25], size: [8, 4, 3], color: "#742a2a" },
  { pos: [-60, 2, 0], size: [3, 4, 12], color: "#742a2a" },
  { pos: [-25, 2, -50], size: [4, 4, 8], color: "#742a2a" },
  { pos: [-25, 2, 50], size: [4, 4, 8], color: "#742a2a" },
  { pos: [-55, 2, -45], size: [6, 4, 3], color: "#742a2a" },
  { pos: [-55, 2, 45], size: [6, 4, 3], color: "#742a2a" },
  
  // Blue side structures
  { pos: [40, 2, -25], size: [8, 4, 3], color: "#1a365d" },
  { pos: [40, 2, 25], size: [8, 4, 3], color: "#1a365d" },
  { pos: [60, 2, 0], size: [3, 4, 12], color: "#1a365d" },
  { pos: [25, 2, -50], size: [4, 4, 8], color: "#1a365d" },
  { pos: [25, 2, 50], size: [4, 4, 8], color: "#1a365d" },
  { pos: [55, 2, -45], size: [6, 4, 3], color: "#1a365d" },
  { pos: [55, 2, 45], size: [6, 4, 3], color: "#1a365d" },
  
  // Scattered cover
  { pos: [-15, 2, -15], size: [4, 4, 4], color: "#555" },
  { pos: [15, 2, 15], size: [4, 4, 4], color: "#555" },
  { pos: [-15, 2, 30], size: [3, 4, 6], color: "#555" },
  { pos: [15, 2, -30], size: [3, 4, 6], color: "#555" },
  { pos: [-70, 2, -70], size: [5, 4, 5], color: "#555" },
  { pos: [70, 2, 70], size: [5, 4, 5], color: "#555" },
  { pos: [-70, 2, 70], size: [5, 4, 5], color: "#555" },
  { pos: [70, 2, -70], size: [5, 4, 5], color: "#555" },
];
