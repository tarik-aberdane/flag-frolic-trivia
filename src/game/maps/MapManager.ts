import { MapData, ALL_MAPS, getMapById } from './MapDefinitions';

export class MapManager {
  private currentMap: MapData | null = null;
  private selectedMapId: string = '';

  constructor() {
    this.currentMap = null;
    this.selectedMapId = '';
  }

  /**
   * Obtiene todos los mapas disponibles
   */
  getAllMaps(): MapData[] {
    return ALL_MAPS;
  }

  /**
   * Selecciona un mapa por ID
   */
  selectMap(mapId: string): boolean {
    const map = getMapById(mapId);
    if (!map) {
      console.error(`Mapa no encontrado: ${mapId}`);
      return false;
    }
    this.currentMap = map;
    this.selectedMapId = mapId;
    console.log(`Mapa seleccionado: ${map.name}`);
    return true;
  }

  /**
   * Obtiene el mapa actualmente seleccionado
   */
  getCurrentMap(): MapData | null {
    return this.currentMap;
  }

  /**
   * Obtiene el ID del mapa seleccionado
   */
  getSelectedMapId(): string {
    return this.selectedMapId;
  }

  /**
   * Obtiene todos los puntos de spawn para un equipo
   */
  getTeamSpawns(team: 'red' | 'blue'): Array<{ x: number; y: number; z: number }> {
    if (!this.currentMap) return [];
    return this.currentMap.spawnPoints
      .filter((spawn) => spawn.team === team)
      .map((spawn) => spawn.position);
  }

  /**
   * Obtiene la base de la bandera de un equipo
   */
  getFlagBase(team: 'red' | 'blue') {
    if (!this.currentMap) return null;
    return this.currentMap.flagBases.find((base) => base.team === team);
  }

  /**
   * Obtiene todos los obstáculos del mapa
   */
  getObstacles() {
    if (!this.currentMap) return [];
    return this.currentMap.obstacles;
  }

  /**
   * Obtiene información de dificultad y capacidad
   */
  getMapInfo() {
    if (!this.currentMap) return null;
    return {
      name: this.currentMap.name,
      difficulty: this.currentMap.difficulty,
      playerCapacity: this.currentMap.playerCapacity,
      theme: this.currentMap.theme,
      width: this.currentMap.width,
      height: this.currentMap.height,
      depth: this.currentMap.depth,
    };
  }

  /**
   * Obtiene un punto de spawn aleatorio para un equipo
   */
  getRandomSpawn(team: 'red' | 'blue') {
    const spawns = this.getTeamSpawns(team);
    if (spawns.length === 0) return null;
    return spawns[Math.floor(Math.random() * spawns.length)];
  }

  /**
   * Valida si una posición es válida (dentro del mapa)
   */
  isPositionValid(x: number, y: number, z: number): boolean {
    if (!this.currentMap) return false;
    const { width, height, depth } = this.currentMap;
    return (
      Math.abs(x) <= width / 2 &&
      y >= 0 &&
      y <= height &&
      Math.abs(z) <= depth / 2
    );
  }

  /**
   * Calcula la distancia entre dos puntos
   */
  calculateDistance(
    p1: { x: number; y: number; z: number },
    p2: { x: number; y: number; z: number }
  ): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Obtiene el mapa más fácil
   */
  getEasyMap(): MapData | undefined {
    return ALL_MAPS.find((map) => map.difficulty === 'easy');
  }

  /**
   * Obtiene mapas por dificultad
   */
  getMapsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): MapData[] {
    return ALL_MAPS.filter((map) => map.difficulty === difficulty);
  }
}