import React, { useState } from 'react';
import { MapManager } from '@/game/maps/MapManager';
import { MapData } from '@/game/maps/MapDefinitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Zap, Shield, Crosshair } from 'lucide-react';

interface MapSelectorProps {
  onMapSelected: (mapId: string) => void;
  isLoading?: boolean;
  showTeamSelection?: boolean;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  onMapSelected,
  isLoading = false,
  showTeamSelection = true,
}) => {
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<'red' | 'blue'>('red');
  const mapManager = new MapManager();
  const maps = mapManager.getAllMaps();

  const handleMapSelect = (mapId: string) => {
    setSelectedMapId(mapId);
  };

  const handleStartGame = () => {
    if (selectedMapId) {
      onMapSelected(selectedMapId);
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Shield className="w-4 h-4" />;
      case 'medium':
        return <Crosshair className="w-4 h-4" />;
      case 'hard':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-700 border-green-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500';
      case 'hard':
        return 'bg-red-500/20 text-red-700 border-red-500';
      default:
        return '';
    }
  };

  const currentMap = selectedMapId ? maps.find((m) => m.id === selectedMapId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">🎮 Selecciona tu Mapa</h1>
          <p className="text-xl text-slate-300">Elige tu campo de batalla para la batalla 60v60</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map List */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {maps.map((map) => (
                <Card
                  key={map.id}
                  onClick={() => handleMapSelect(map.id)}
                  className={`cursor-pointer transition-all transform hover:scale-105 ${
                    selectedMapId === map.id
                      ? 'ring-2 ring-blue-500 bg-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-white">{map.name}</CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                          {map.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge variant="outline" className={getDifficultyColor(map.difficulty)}>
                          {getDifficultyIcon(map.difficulty)}
                          <span className="ml-1 capitalize">{map.difficulty}</span>
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500">
                          {map.theme}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-sm font-semibold">Tamaño:</span>
                          <span>{map.width}m × {map.depth}m</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-sm font-semibold">Altura:</span>
                          <span>{map.height}m</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-sm font-semibold">Capacidad:</span>
                          <span className="bg-gradient-to-r from-red-400 to-blue-400 text-transparent bg-clip-text font-bold">
                            {map.playerCapacity} jugadores
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 flex flex-col justify-center items-center">
                        <img
                          src={map.thumbnail}
                          alt={map.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <span className="text-xs text-slate-400">Vista previa</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview & Team Selection */}
          <div className="space-y-4">
            {/* Map Preview */}
            {currentMap && (
              <Card className="bg-slate-800 border-slate-700 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-white">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900 rounded-lg overflow-hidden">
                    <img
                      src={currentMap.thumbnail}
                      alt={currentMap.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-white text-lg">{currentMap.name}</h3>
                    <p className="text-sm text-slate-300">{currentMap.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-700 p-2 rounded">
                      <div className="text-slate-400">Dificultad</div>
                      <div className="font-semibold text-white capitalize flex items-center gap-1">
                        {getDifficultyIcon(currentMap.difficulty)}
                        {currentMap.difficulty}
                      </div>
                    </div>
                    <div className="bg-slate-700 p-2 rounded">
                      <div className="text-slate-400">Tema</div>
                      <div className="font-semibold text-white">{currentMap.theme}</div>
                    </div>
                  </div>

                  {showTeamSelection && (
                    <div className="border-t border-slate-700 pt-4">
                      <h4 className="font-semibold text-white mb-2">Elige tu Equipo</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => setSelectedTeam('red')}
                          className={`${
                            selectedTeam === 'red'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          🔴 Rojo
                        </Button>
                        <Button
                          onClick={() => setSelectedTeam('blue')}
                          className={`${
                            selectedTeam === 'blue'
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          🔵 Azul
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleStartGame}
                    disabled={!selectedMapId || isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 mt-4"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isLoading ? 'Cargando...' : 'Iniciar Partida'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!currentMap && (
              <Card className="bg-slate-800 border-slate-700 p-6 text-center">
                <div className="text-6xl mb-2">🗺️</div>
                <p className="text-slate-400">Selecciona un mapa para ver la vista previa</p>
              </Card>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-5 gap-4">
          {maps.map((map) => (
            <div
              key={map.id}
              className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="text-2xl mb-1">{map.name.charAt(0)}</div>
              <div className="text-xs text-slate-400 line-clamp-2">{map.name}</div>
              <div className="text-xs text-slate-500 mt-2">{map.difficulty}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapSelector;