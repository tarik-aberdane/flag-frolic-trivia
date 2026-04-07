import {
  GameState, Player, Team, Position, Obstacle,
  CANVAS_W, CANVAS_H, PLAYER_R, FLAG_R, PLAYER_SPEED,
  BASE_RED, BASE_BLUE, OBSTACLES, GAME_DURATION,
} from "./types";

export function createInitialState(numPlayers: number): GameState {
  const players: Player[] = [];

  // Red team: player 0 (human WASD), player 1 (AI or human)
  players.push(createPlayer(0, "red", false, { x: 80, y: CANVAS_H / 2 - 40 }));
  players.push(createPlayer(1, "red", numPlayers < 3, { x: 80, y: CANVAS_H / 2 + 40 }));

  // Blue team: player 2 (human arrows), player 3 (AI or human)
  players.push(createPlayer(2, "blue", numPlayers < 2, { x: CANVAS_W - 80, y: CANVAS_H / 2 - 40 }));
  players.push(createPlayer(3, "blue", numPlayers < 4, { x: CANVAS_W - 80, y: CANVAS_H / 2 + 40 }));

  return {
    players,
    flags: [
      { team: "red", pos: { ...BASE_RED }, atBase: true, carriedBy: null },
      { team: "blue", pos: { ...BASE_BLUE }, atBase: true, carriedBy: null },
    ],
    obstacles: OBSTACLES,
    scores: { red: 0, blue: 0 },
    timeLeft: GAME_DURATION,
    gameOver: false,
    questionTarget: null,
  };
}

function createPlayer(id: number, team: Team, isAI: boolean, pos: Position): Player {
  return { id, team, pos: { ...pos }, hasFlag: false, isAI, frozen: false, frozenUntil: 0, speed: PLAYER_SPEED };
}

export function getBasePos(team: Team): Position {
  return team === "red" ? { ...BASE_RED } : { ...BASE_BLUE };
}

export function collidesObstacle(x: number, y: number, r: number, obstacles: Obstacle[]): boolean {
  for (const o of obstacles) {
    const cx = Math.max(o.x, Math.min(x, o.x + o.w));
    const cy = Math.max(o.y, Math.min(y, o.y + o.h));
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

export function movePlayer(p: Player, dx: number, dy: number, obstacles: Obstacle[]) {
  if (p.frozen) return;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;
  const nx = p.pos.x + (dx / len) * p.speed;
  const ny = p.pos.y + (dy / len) * p.speed;
  const clampX = Math.max(PLAYER_R, Math.min(CANVAS_W - PLAYER_R, nx));
  const clampY = Math.max(PLAYER_R, Math.min(CANVAS_H - PLAYER_R, ny));
  if (!collidesObstacle(clampX, clampY, PLAYER_R, obstacles)) {
    p.pos.x = clampX;
    p.pos.y = clampY;
  }
}

export function dist(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function updateAI(p: Player, state: GameState) {
  if (!p.isAI || p.frozen) return;
  const enemyFlag = state.flags.find(f => f.team !== p.team)!;
  const base = getBasePos(p.team);
  const target = p.hasFlag ? base : enemyFlag.pos;
  const dx = target.x - p.pos.x;
  const dy = target.y - p.pos.y;
  // Add slight randomness
  const rx = dx + (Math.random() - 0.5) * 20;
  const ry = dy + (Math.random() - 0.5) * 20;
  movePlayer(p, rx, ry, state.obstacles);
}

export function checkCollisions(state: GameState): { attacker: Player; defender: Player } | null {
  for (const p of state.players) {
    if (p.frozen) continue;
    // Check flag pickup
    for (const f of state.flags) {
      if (f.team !== p.team && f.atBase && dist(p.pos, f.pos) < PLAYER_R + FLAG_R) {
        f.atBase = false;
        f.carriedBy = p.id;
        p.hasFlag = true;
      }
    }
    // Check flag capture (bring enemy flag to own base)
    if (p.hasFlag) {
      const base = getBasePos(p.team);
      if (dist(p.pos, base) < PLAYER_R + FLAG_R) {
        state.scores[p.team]++;
        p.hasFlag = false;
        const ef = state.flags.find(f => f.carriedBy === p.id)!;
        ef.carriedBy = null;
        ef.atBase = true;
        ef.pos = getBasePos(ef.team);
      }
    }
    // Check player-vs-player (enemy territory tag)
    for (const e of state.players) {
      if (e.team === p.team || e.frozen || p.frozen) continue;
      if (dist(p.pos, e.pos) < PLAYER_R * 2) {
        // The player in enemy territory is the defender
        const pInEnemy = isInEnemyTerritory(p);
        const eInEnemy = isInEnemyTerritory(e);
        if (pInEnemy && !eInEnemy) {
          return { attacker: e, defender: p };
        } else if (eInEnemy && !pInEnemy) {
          return { attacker: p, defender: e };
        }
      }
    }
  }
  return null;
}

function isInEnemyTerritory(p: Player): boolean {
  if (p.team === "red") return p.pos.x > CANVAS_W / 2;
  return p.pos.x < CANVAS_W / 2;
}

export function sendToBase(p: Player, state: GameState) {
  const base = getBasePos(p.team);
  p.pos = { ...base };
  p.pos.y += p.id % 2 === 0 ? -40 : 40;
  if (p.hasFlag) {
    const f = state.flags.find(f => f.carriedBy === p.id);
    if (f) {
      f.carriedBy = null;
      f.atBase = true;
      f.pos = getBasePos(f.team);
    }
    p.hasFlag = false;
  }
}
