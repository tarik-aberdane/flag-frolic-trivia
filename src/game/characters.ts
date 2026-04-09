// Character definitions with different stats
export interface CharacterDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  walkSpeed: number;   // base walk speed multiplier
  sprintSpeed: number; // base sprint speed multiplier
  maxStamina: number;  // max stamina points
  staminaDrain: number; // stamina consumed per second while sprinting
  staminaRegen: number; // stamina recovered per second while not sprinting
  color: string;       // body color override (team color still applies as accent)
  shape: "capsule" | "box" | "sphere";
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: "soldier",
    name: "Soldado",
    emoji: "🪖",
    description: "Equilibrado. Buena velocidad y stamina.",
    walkSpeed: 1.0,
    sprintSpeed: 1.0,
    maxStamina: 100,
    staminaDrain: 20,
    staminaRegen: 12,
    color: "#6b7280",
    shape: "capsule",
  },
  {
    id: "scout",
    name: "Explorador",
    emoji: "🏃",
    description: "Muy rápido, pero poca stamina.",
    walkSpeed: 1.2,
    sprintSpeed: 1.35,
    maxStamina: 70,
    staminaDrain: 30,
    staminaRegen: 15,
    color: "#22c55e",
    shape: "capsule",
  },
  {
    id: "tank",
    name: "Tanque",
    emoji: "🛡️",
    description: "Lento pero mucha stamina. Difícil de parar.",
    walkSpeed: 0.8,
    sprintSpeed: 0.85,
    maxStamina: 150,
    staminaDrain: 12,
    staminaRegen: 18,
    color: "#a855f7",
    shape: "box",
  },
  {
    id: "ninja",
    name: "Ninja",
    emoji: "🥷",
    description: "Sprint ultra rápido. Stamina media.",
    walkSpeed: 1.0,
    sprintSpeed: 1.5,
    maxStamina: 85,
    staminaDrain: 35,
    staminaRegen: 14,
    color: "#1e293b",
    shape: "capsule",
  },
];

export function getCharacterById(id: string): CharacterDef {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
