import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import CharacterSelector from "@/components/CharacterSelector";
import { ALL_MAPS } from "@/game/maps/MapDefinitions";

interface Room {
  id: string;
  name: string;
  code: string;
  status: string;
  max_players: number;
  red_score: number;
  blue_score: number;
  playerCount?: number;
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("ctf_name") || "");
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChar, setSelectedChar] = useState(() => localStorage.getItem("ctf_char") || "soldier");
  const [selectedMap, setSelectedMap] = useState("arena-classic");
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue" | null>(null);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("ctf_session");
    if (existing) return existing;
    const id = uuidv4();
    localStorage.setItem("ctf_session", id);
    return id;
  });

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadRooms() {
    const { data } = await supabase
      .from("game_rooms")
      .select("*")
      .in("status", ["waiting", "playing"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      const roomIds = data.map(r => r.id);
      const { data: players } = await supabase
        .from("room_players")
        .select("room_id")
        .in("room_id", roomIds);

      const counts: Record<string, number> = {};
      players?.forEach(p => { counts[p.room_id] = (counts[p.room_id] || 0) + 1; });
      setRooms(data.map(r => ({ ...r, playerCount: counts[r.id] || 0 })));
    }
  }

  async function createRoom() {
    if (!playerName.trim() || !newRoomName.trim()) return;
    setLoading(true);
    localStorage.setItem("ctf_name", playerName);
    localStorage.setItem("ctf_char", selectedChar);

    const { data: room, error } = await supabase
      .from("game_rooms")
      .insert({ name: newRoomName.trim() })
      .select()
      .single();

    if (room && !error) {
      // Show team selection
      setPendingRoomId(room.id);
    }
    setLoading(false);
  }

  function requestJoinRoom(roomId: string) {
    if (!playerName.trim()) return;
    setPendingRoomId(roomId);
    setSelectedTeam(null);
  }

  async function confirmJoinWithTeam(team: "red" | "blue") {
    if (!pendingRoomId || !playerName.trim()) return;
    setLoading(true);
    localStorage.setItem("ctf_name", playerName);
    localStorage.setItem("ctf_char", selectedChar);

    await supabase.from("room_players").delete().eq("session_id", sessionId);

    const { data: player, error } = await supabase
      .from("room_players")
      .insert({ room_id: pendingRoomId, player_name: playerName.trim(), session_id: sessionId, team })
      .select()
      .single();

    if (player && !error) {
      navigate(`/game/${pendingRoomId}?playerId=${player.id}&team=${team}&name=${encodeURIComponent(playerName.trim())}&session=${sessionId}&char=${selectedChar}&map=${selectedMap}`);
    }
    setLoading(false);
    setPendingRoomId(null);
    setSelectedTeam(null);
  }

  async function joinByCode() {
    if (!joinCode.trim() || !playerName.trim()) return;
    const { data } = await supabase.from("game_rooms").select("id").eq("code", joinCode.trim().toLowerCase()).single();
    if (data) requestJoinRoom(data.id);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Team selection modal */}
      {pendingRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md">
          <div className="w-full max-w-md mx-4 p-8 rounded-xl bg-card border border-border shadow-2xl text-center">
            <h2 className="font-pixel text-xl text-accent mb-2">ELIGE TU EQUIPO</h2>
            <p className="text-muted-foreground mb-6 text-sm">Debes elegir equipo antes de entrar a la partida</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => confirmJoinWithTeam("red")}
                disabled={loading}
                className="p-6 rounded-xl border-2 border-red-500/40 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500 transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="text-4xl mb-2">🔴</div>
                <div className="font-pixel text-red-400 text-sm">EQUIPO ROJO</div>
              </button>
              <button
                onClick={() => confirmJoinWithTeam("blue")}
                disabled={loading}
                className="p-6 rounded-xl border-2 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500 transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="text-4xl mb-2">🔵</div>
                <div className="font-pixel text-blue-400 text-sm">EQUIPO AZUL</div>
              </button>
            </div>
            <button onClick={() => setPendingRoomId(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl text-accent mb-2">⚑ ATRAPAFLAG SMX</h1>
          <p className="text-muted-foreground">Juego 3D multijugador • Captura la bandera • Preguntas de informática</p>
        </div>

        {/* Player name */}
        <div className="mb-6">
          <label className="block text-sm text-muted-foreground mb-1">Tu nombre</label>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)}
            placeholder="Nombre de jugador..."
            className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={20} />
        </div>

        {/* Character selector */}
        <div className="mb-6">
          <h2 className="font-pixel text-sm text-accent mb-3">ELIGE TU PERSONAJE</h2>
          <CharacterSelector selected={selectedChar} onSelect={setSelectedChar} />
        </div>

        {/* Map selector */}
        <div className="mb-6">
          <h2 className="font-pixel text-sm text-accent mb-3">ELIGE EL MAPA</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_MAPS.slice(0, 3).map(m => (
              <button key={m.id} onClick={() => setSelectedMap(m.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedMap === m.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
                }`}>
                <div className="font-semibold text-foreground text-sm mb-1">{m.name}</div>
                <p className="text-xs text-muted-foreground">{m.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{m.difficulty}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{m.width}m</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create room */}
          <div className="p-6 bg-card rounded-xl border border-border">
            <h2 className="font-pixel text-sm text-accent mb-4">CREAR SALA</h2>
            <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
              placeholder="Nombre de la sala..."
              className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground border border-border mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={30} />
            <button onClick={createRoom}
              disabled={loading || !playerName.trim() || !newRoomName.trim()}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 active:scale-[0.97] transition-transform">
              {loading ? "Creando..." : "Crear Sala"}
            </button>
          </div>

          {/* Join by code */}
          <div className="p-6 bg-card rounded-xl border border-border">
            <h2 className="font-pixel text-sm text-accent mb-4">UNIRSE POR CÓDIGO</h2>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)}
              placeholder="Código de sala..."
              className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground border border-border mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={6} />
            <button onClick={joinByCode}
              disabled={loading || !playerName.trim() || !joinCode.trim()}
              className="w-full px-4 py-3 rounded-lg bg-accent text-accent-foreground font-semibold disabled:opacity-50 active:scale-[0.97] transition-transform">
              Unirse
            </button>
          </div>
        </div>

        {/* Room list */}
        <div>
          <h2 className="font-pixel text-sm text-accent mb-4">SALAS DISPONIBLES</h2>
          {rooms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay salas activas. ¡Crea una!</p>
          ) : (
            <div className="space-y-3">
              {rooms.map(room => (
                <div key={room.id}
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
                  <div>
                    <h3 className="text-foreground font-semibold">{room.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">Código: <span className="text-accent font-mono">{room.code}</span></span>
                      <span className="text-xs text-muted-foreground">👥 {room.playerCount}/{room.max_players}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${room.status === "waiting" ? "bg-green-500/20 text-green-400" : "bg-accent/20 text-accent"}`}>
                        {room.status === "waiting" ? "Esperando" : "Jugando"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => requestJoinRoom(room.id)}
                    disabled={loading || !playerName.trim() || (room.playerCount || 0) >= room.max_players}
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 active:scale-[0.97] transition-transform">
                    Unirse
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
