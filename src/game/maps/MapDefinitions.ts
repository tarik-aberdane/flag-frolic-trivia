import * as THREE from 'three';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SpawnPoint {
  position: Vector3;
  team: 'red' | 'blue';
}

export interface FlagBase {
  position: Vector3;
  team: 'red' | 'blue';
  radius: number;
}

export interface Obstacle {
  position: Vector3;
  size: Vector3;
  type: 'wall' | 'tower' | 'rock' | 'building';
}

export interface MapData {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  width: number;
  height: number;
  depth: number;
  spawnPoints: SpawnPoint[];
  flagBases: FlagBase[];
  obstacles: Obstacle[];
  environmentColor: string;
  fogColor: string;
  fogDistance: number;
  difficulty: 'easy' | 'medium' | 'hard';
  playerCapacity: number;
  theme: string;
}

// MAPA 1: ARENA CLÁSICA
export const ARENA_MAP: MapData = {
  id: 'arena-classic',
  name: '⚔️ Arena Clásica',
  description: 'Campo de batalla simétrico y equilibrado. Perfecto para principiantes.',
  thumbnail: 'https://via.placeholder.com/300x200?text=Arena+Clasica',
  width: 200,
  height: 100,
  depth: 200,
  difficulty: 'easy',
  playerCapacity: 120,
  theme: 'Desert',
  environmentColor: '#e8d5c4',
  fogColor: '#ffcc99',
  fogDistance: 500,
  
  spawnPoints: [
    // RED TEAM - 30 puntos (lado izquierdo)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: -80 + Math.cos((i / 30) * Math.PI * 2) * 15,
        y: 2,
        z: -80 + Math.sin((i / 30) * Math.PI * 2) * 15,
      },
      team: 'red' as const,
    })),
    // BLUE TEAM - 30 puntos (lado derecho)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: 80 + Math.cos((i / 30) * Math.PI * 2) * 15,
        y: 2,
        z: 80 + Math.sin((i / 30) * Math.PI * 2) * 15,
      },
      team: 'blue' as const,
    })),
  ],

  flagBases: [
    {
      position: { x: -90, y: 2, z: -90 },
      team: 'red',
      radius: 20,
    },
    {
      position: { x: 90, y: 2, z: 90 },
      team: 'blue',
      radius: 20,
    },
  ],

  obstacles: [
    // Centro: Pilares
    { position: { x: 0, y: 0, z: 0 }, size: { x: 10, y: 30, z: 10 }, type: 'tower' },
    { position: { x: -30, y: 0, z: 0 }, size: { x: 8, y: 25, z: 8 }, type: 'tower' },
    { position: { x: 30, y: 0, z: 0 }, size: { x: 8, y: 25, z: 8 }, type: 'tower' },
    { position: { x: 0, y: 0, z: -30 }, size: { x: 8, y: 25, z: 8 }, type: 'tower' },
    { position: { x: 0, y: 0, z: 30 }, size: { x: 8, y: 25, z: 8 }, type: 'tower' },
    // Muros laterales
    { position: { x: -50, y: 0, z: -50 }, size: { x: 20, y: 20, z: 5 }, type: 'wall' },
    { position: { x: 50, y: 0, z: 50 }, size: { x: 20, y: 20, z: 5 }, type: 'wall' },
  ],
};

// MAPA 2: FORTALEZA
export const FORTRESS_MAP: MapData = {
  id: 'fortress',
  name: '🏰 Fortaleza',
  description: 'Bases defensivas con torres. Estrategia y movimiento táctico.',
  thumbnail: 'https://via.placeholder.com/300x200?text=Fortaleza',
  width: 250,
  height: 120,
  depth: 250,
  difficulty: 'medium',
  playerCapacity: 120,
  theme: 'Medieval',
  environmentColor: '#a89968',
  fogColor: '#d4a574',
  fogDistance: 600,

  spawnPoints: [
    // RED TEAM
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: -100 + Math.cos((i / 30) * Math.PI * 2) * 20,
        y: 10,
        z: -100 + Math.sin((i / 30) * Math.PI * 2) * 20,
      },
      team: 'red' as const,
    })),
    // BLUE TEAM
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: 100 + Math.cos((i / 30) * Math.PI * 2) * 20,
        y: 10,
        z: 100 + Math.sin((i / 30) * Math.PI * 2) * 20,
      },
      team: 'blue' as const,
    })),
  ],

  flagBases: [
    {
      position: { x: -110, y: 10, z: -110 },
      team: 'red',
      radius: 25,
    },
    {
      position: { x: 110, y: 10, z: 110 },
      team: 'blue',
      radius: 25,
    },
  ],

  obstacles: [
    // Torres rojas
    { position: { x: -120, y: 0, z: -120 }, size: { x: 15, y: 40, z: 15 }, type: 'tower' },
    { position: { x: -120, y: 0, z: -80 }, size: { x: 12, y: 35, z: 12 }, type: 'tower' },
    // Torres azules
    { position: { x: 120, y: 0, z: 120 }, size: { x: 15, y: 40, z: 15 }, type: 'tower' },
    { position: { x: 120, y: 0, z: 80 }, size: { x: 12, y: 35, z: 12 }, type: 'tower' },
    // Centro: Laberinto
    { position: { x: -20, y: 0, z: -20 }, size: { x: 30, y: 25, z: 5 }, type: 'wall' },
    { position: { x: 20, y: 0, z: 20 }, size: { x: 30, y: 25, z: 5 }, type: 'wall' },
    { position: { x: -20, y: 0, z: 20 }, size: { x: 5, y: 25, z: 30 }, type: 'wall' },
    { position: { x: 20, y: 0, z: -20 }, size: { x: 5, y: 25, z: 30 }, type: 'wall' },
  ],
};

// MAPA 3: PUENTE
export const BRIDGE_MAP: MapData = {
  id: 'bridge-crossing',
  name: '🌉 Puente Cruzado',
  description: 'Puente central estrecho. Combates intensos en punto de control.',
  thumbnail: 'https://via.placeholder.com/300x200?text=Puente+Cruzado',
  width: 300,
  height: 80,
  depth: 80,
  difficulty: 'hard',
  playerCapacity: 120,
  theme: 'Winter',
  environmentColor: '#e8f4f8',
  fogColor: '#b0d4e3',
  fogDistance: 400,

  spawnPoints: [
    // RED TEAM (arriba)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: -120 + (i % 10) * 8,
        y: 2,
        z: -35 + Math.floor(i / 10) * 8,
      },
      team: 'red' as const,
    })),
    // BLUE TEAM (abajo)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: 120 - (i % 10) * 8,
        y: 2,
        z: 35 - Math.floor(i / 10) * 8,
      },
      team: 'blue' as const,
    })),
  ],

  flagBases: [
    {
      position: { x: -130, y: 2, z: -35 },
      team: 'red',
      radius: 20,
    },
    {
      position: { x: 130, y: 2, z: 35 },
      team: 'blue',
      radius: 20,
    },
  ],

  obstacles: [
    // Puente central
    { position: { x: 0, y: 0, z: 0 }, size: { x: 300, y: 2, z: 15 }, type: 'wall' },
    // Pilares del puente
    { position: { x: -80, y: 0, z: 0 }, size: { x: 8, y: 30, z: 8 }, type: 'tower' },
    { position: { x: -40, y: 0, z: 0 }, size: { x: 8, y: 30, z: 8 }, type: 'tower' },
    { position: { x: 0, y: 0, z: 0 }, size: { x: 8, y: 35, z: 8 }, type: 'tower' },
    { position: { x: 40, y: 0, z: 0 }, size: { x: 8, y: 30, z: 8 }, type: 'tower' },
    { position: { x: 80, y: 0, z: 0 }, size: { x: 8, y: 30, z: 8 }, type: 'tower' },
    // Obstáculos en zona roja
    { position: { x: -100, y: 0, z: -20 }, size: { x: 20, y: 20, z: 5 }, type: 'wall' },
    // Obstáculos en zona azul
    { position: { x: 100, y: 0, z: 20 }, size: { x: 20, y: 20, z: 5 }, type: 'wall' },
  ],
};

// MAPA 4: CAÑÓN
export const CANYON_MAP: MapData = {
  id: 'canyon-depths',
  name: '⛰️ Cañón Profundo',
  description: 'Terreno irregular con elevaciones. Requiere movimiento vertical.',
  thumbnail: 'https://via.placeholder.com/300x200?text=Canion+Profundo',
  width: 280,
  height: 150,
  depth: 200,
  difficulty: 'hard',
  playerCapacity: 120,
  theme: 'Mountain',
  environmentColor: '#8b7355',
  fogColor: '#a0826d',
  fogDistance: 550,

  spawnPoints: [
    // RED TEAM (arriba a la izquierda)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: -100 + Math.cos((i / 30) * Math.PI * 2) * 18,
        y: 30,
        z: -80 + Math.sin((i / 30) * Math.PI * 2) * 18,
      },
      team: 'red' as const,
    })),
    // BLUE TEAM (arriba a la derecha)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: 100 + Math.cos((i / 30) * Math.PI * 2) * 18,
        y: 30,
        z: 80 + Math.sin((i / 30) * Math.PI * 2) * 18,
      },
      team: 'blue' as const,
    })),
  ],

  flagBases: [
    {
      position: { x: -110, y: 30, z: -90 },
      team: 'red',
      radius: 22,
    },
    {
      position: { x: 110, y: 30, z: 90 },
      team: 'blue',
      radius: 22,
    },
  ],

  obstacles: [
    // Centro: formaciones de rocas
    { position: { x: 0, y: 0, z: -50 }, size: { x: 25, y: 35, z: 25 }, type: 'rock' },
    { position: { x: -40, y: 15, z: 0 }, size: { x: 20, y: 25, z: 20 }, type: 'rock' },
    { position: { x: 40, y: 15, z: 0 }, size: { x: 20, y: 25, z: 20 }, type: 'rock' },
    { position: { x: 0, y: 5, z: 50 }, size: { x: 25, y: 30, z: 25 }, type: 'rock' },
    // Muros de cañón
    { position: { x: -140, y: 40, z: 0 }, size: { x: 20, y: 60, z: 200 }, type: 'wall' },
    { position: { x: 140, y: 40, z: 0 }, size: { x: 20, y: 60, z: 200 }, type: 'wall' },
  ],
};

// MAPA 5: URBANO
export const URBAN_MAP: MapData = {
  id: 'urban-district',
  name: '🏙️ Distrito Urbano',
  description: 'Ciudad futurista con edificios. Parkour y combate vertical.',
  thumbnail: 'https://via.placeholder.com/300x200?text=Distrito+Urbano',
  width: 320,
  height: 180,
  depth: 280,
  difficulty: 'hard',
  playerCapacity: 120,
  theme: 'Cyberpunk',
  environmentColor: '#1a1a2e',
  fogColor: '#16213e',
  fogDistance: 700,

  spawnPoints: [
    // RED TEAM (zona oeste)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: -120 + (i % 10) * 12,
        y: 15,
        z: -100 + Math.floor(i / 10) * 12,
      },
      team: 'red' as const,
    })),
    // BLUE TEAM (zona este)
    ...Array.from({ length: 30 }, (_, i) => ({
      position: {
        x: 120 - (i % 10) * 12,
        y: 15,
        z: 100 - Math.floor(i / 10) * 12,
      },
      team: 'blue' as const,
    })),
  ],

  flagBases: [
    {
      position: { x: -130, y: 15, z: -115 },
      team: 'red',
      radius: 25,
    },
    {
      position: { x: 130, y: 15, z: 115 },
      team: 'blue',
      radius: 25,
    },
  ],

  obstacles: [
    // Edificios rojos
    { position: { x: -90, y: 0, z: -80 }, size: { x: 30, y: 50, z: 30 }, type: 'building' },
    { position: { x: -90, y: 0, z: -30 }, size: { x: 25, y: 60, z: 25 }, type: 'building' },
    { position: { x: -50, y: 0, z: -60 }, size: { x: 20, y: 45, z: 20 }, type: 'building' },
    // Edificios centrales
    { position: { x: -30, y: 0, z: 0 }, size: { x: 22, y: 55, z: 22 }, type: 'building' },
    { position: { x: 0, y: 0, z: -30 }, size: { x: 25, y: 60, z: 25 }, type: 'building' },
    { position: { x: 30, y: 0, z: 0 }, size: { x: 22, y: 55, z: 22 }, type: 'building' },
    // Edificios azules
    { position: { x: 90, y: 0, z: 80 }, size: { x: 30, y: 50, z: 30 }, type: 'building' },
    { position: { x: 90, y: 0, z: 30 }, size: { x: 25, y: 60, z: 25 }, type: 'building' },
    { position: { x: 50, y: 0, z: 60 }, size: { x: 20, y: 45, z: 20 }, type: 'building' },
  ],
};

// Lista de todos los mapas
export const ALL_MAPS: MapData[] = [ARENA_MAP, FORTRESS_MAP, BRIDGE_MAP, CANYON_MAP, URBAN_MAP];

export const getMapById = (id: string): MapData | undefined => ALL_MAPS.find((map) => map.id === id);