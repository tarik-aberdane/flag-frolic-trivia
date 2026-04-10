export type Team = "red" | "blue";

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: number;
  team: Team;
  pos: Position;
  hasFlag: boolean;
  isAI: boolean;
  frozen: boolean;
  frozenUntil: number;
  speed: number;
}

export interface Flag {
  team: Team;
  pos: Position;
  atBase: boolean;
  carriedBy: number | null;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GameState {
  players: Player[];
  flags: Flag[];
  obstacles: Obstacle[];
  scores: { red: number; blue: number };
  timeLeft: number;
  gameOver: boolean;
  questionTarget: { attacker: Player; defender: Player } | null;
}

export const CANVAS_W = 960;
export const CANVAS_H = 540;
export const PLAYER_R = 14;
export const FLAG_R = 12;
export const PLAYER_SPEED = 3;

export const BASE_RED: Position = { x: 60, y: CANVAS_H / 2 };
export const BASE_BLUE: Position = { x: CANVAS_W - 60, y: CANVAS_H / 2 };

export const OBSTACLES: Obstacle[] = [
  { x: 200, y: 100, w: 30, h: 160 },
  { x: 200, y: 340, w: 30, h: 160 },
  { x: CANVAS_W - 230, y: 100, w: 30, h: 160 },
  { x: CANVAS_W - 230, y: 340, w: 30, h: 160 },
  { x: CANVAS_W / 2 - 15, y: 0, w: 30, h: 180 },
  { x: CANVAS_W / 2 - 15, y: 360, w: 30, h: 180 },
  { x: 380, y: 220, w: 80, h: 20 },
  { x: 500, y: 300, w: 80, h: 20 },
];

export const GAME_DURATION = 600; // 10 minutes
