import {
  GameState, Player, Team, Position, Obstacle,
  CANVAS_W, CANVAS_H, PLAYER_R, FLAG_R, PLAYER_SPEED,
  BASE_RED, BASE_BLUE, OBSTACLES, GAME_DURATION,
} from "./types";

// --- CONFIGURACIÓN DEL SERVIDOR DEL INSTITUTO ---
const SOCKET_URL = 'ws://172.24.112.11:2567';
const socket = new WebSocket(SOCKET_URL);

socket.onopen = () => console.log("🚀 CONECTADO AL SERVIDOR 30VS30");
socket.onerror = (err) => console.error("Error de conexión al servidor:", err);

// Estado global para guardar las posiciones de otros jugadores
let remotePlayersData: Record<number, Position> = {};

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'remoteMove') {
      // Guardamos la posición que nos llega de otros PCs
      remotePlayersData[data.id] = data.pos;
    }
  } catch (e) {
    console.error("Error procesando mensaje del servidor", e);
  }
};

export function createInitialState(numPlayers: number): GameState {
  const players: Player[] = [];

  // Creamos 30 jugadores rojos
  for (let i = 0; i < 30; i++) {
    players.push(createPlayer(i, "red", i !== 0, { x: 50, y: (CANVAS_H / 31) * (i + 1) }));
  }

  // Creamos 30 jugadores azules
  for (let i = 30; i < 60; i++) {
    players.push(createPlayer(i, "blue", true, { x: CANVAS_W - 50, y: (CANVAS_H / 31) * (i - 29) }));
  }

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

    // ENVIAR POSICIÓN AL SERVIDOR (Solo si somos el jugador principal, ej: ID 0)
    if (p.id === 0 && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'remoteMove',
        id: p.id,
        pos: p.pos,
        team: p.team
      }));
    }
  }
}

// Esta función debe llamarse en cada frame para actualizar a los enemigos
export function syncRemotePlayers(players: Player[]) {
  players.forEach(p => {
    if (remotePlayersData[p.id]) {
      p.pos.x = remotePlayersData[p.id].x;
      p.pos.y = remotePlayersData[p.id].y;
    }
  });
}

// --- EL RESTO DE FUNCIONES SE QUEDAN IGUAL ---

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

export function dist(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function updateAI(p: Player, state: GameState) {
  if (!p.isAI || p.frozen) return;
  // Si tenemos datos remotos para este ID, no usamos la IA, usamos el socket
  if (remotePlayersData[p.id]) {
    p.pos.x = remotePlayersData[p.id].x;
    p.pos.y = remotePlayersData[p.id].y;
    return;
  }
  
  const enemyFlag = state.flags.find(f => f.team !== p.team)!;
  const base = getBasePos(p.team);
  const target = p.hasFlag ? base : enemyFlag.pos;
  const dx = target.x - p.pos.x;
  const dy = target.y - p.pos.y;
  const rx = dx + (Math.random() - 0.5) * 20;
  const ry = dy + (Math.random() - 0.5) * 20;
  movePlayer(p, rx, ry, state.obstacles);
}

export function checkCollisions(state: GameState): { attacker: Player; defender: Player } | null {
  for (const p of state.players) {
    if (p.frozen) continue;
    for (const f of state.flags) {
      if (f.team !== p.team && f.atBase && dist(p.pos, f.pos) < PLAYER_R + FLAG_R) {
        f.atBase = false;
        f.carriedBy = p.id;
        p.hasFlag = true;
      }
    }
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
    for (const e of state.players) {
      if (e.team === p.team || e.frozen || p.frozen) continue;
      if (dist(p.pos, e.pos) < PLAYER_R * 2) {
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
