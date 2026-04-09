import { HALF_MAP } from "./constants";

export interface PowerUpInstance {
  id: string;
  position: [number, number, number];
  type: "speed";
  active: boolean;
  respawnAt: number; // timestamp when it respawns
}

const PICKUP_DISTANCE = 3;
const RESPAWN_TIME = 15000; // 15 seconds
const SPEED_BOOST_DURATION = 5000; // 5 seconds
const SPEED_BOOST_MULTIPLIER = 1.6;

// Generate spawn positions spread across the map
function generatePowerUpPositions(count: number): [number, number, number][] {
  const positions: [number, number, number][] = [];
  const margin = 20;
  const range = HALF_MAP - margin;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = range * 0.4 + Math.random() * range * 0.4;
    positions.push([
      Math.cos(angle) * radius,
      1.5,
      Math.sin(angle) * radius,
    ]);
  }
  return positions;
}

export function createPowerUps(count = 6): PowerUpInstance[] {
  const positions = generatePowerUpPositions(count);
  return positions.map((pos, i) => ({
    id: `pu-${i}`,
    position: pos,
    type: "speed" as const,
    active: true,
    respawnAt: 0,
  }));
}

export function checkPowerUpPickup(
  playerX: number, playerZ: number,
  powerUps: PowerUpInstance[]
): { pickedUp: PowerUpInstance | null; updated: PowerUpInstance[] } {
  const now = Date.now();
  let pickedUp: PowerUpInstance | null = null;

  const updated = powerUps.map(pu => {
    // Respawn check
    if (!pu.active && pu.respawnAt > 0 && now >= pu.respawnAt) {
      return { ...pu, active: true, respawnAt: 0 };
    }
    if (!pu.active) return pu;

    // Pickup check
    if (!pickedUp) {
      const dx = playerX - pu.position[0];
      const dz = playerZ - pu.position[2];
      if (Math.sqrt(dx * dx + dz * dz) < PICKUP_DISTANCE) {
        pickedUp = pu;
        return { ...pu, active: false, respawnAt: now + RESPAWN_TIME };
      }
    }
    return pu;
  });

  return { pickedUp, updated };
}

export { SPEED_BOOST_DURATION, SPEED_BOOST_MULTIPLIER };
