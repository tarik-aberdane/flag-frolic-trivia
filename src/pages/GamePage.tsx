import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import GameScene from "@/components/GameScene";

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const playerId = searchParams.get("playerId") || "";
  const team = (searchParams.get("team") || "red") as "red" | "blue";
  const playerName = decodeURIComponent(searchParams.get("name") || "Jugador");
  const sessionId = searchParams.get("session") || "";

  if (!roomId || !playerId || !sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Sala no encontrada</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground">
            Volver al Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameScene
      sessionId={sessionId}
      myPlayerId={playerId}
      roomId={roomId}
      team={team}
      playerName={playerName}
      onLeave={() => navigate("/")}
    />
  );
}
