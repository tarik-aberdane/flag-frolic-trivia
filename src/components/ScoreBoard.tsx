interface ScoreBoardProps {
  redScore: number;
  blueScore: number;
  timeLeft: number;
  redPlayers: number;
  bluePlayers: number;
  roomCode: string;
  myTeam: "red" | "blue";
}

export default function ScoreBoard({ redScore, blueScore, timeLeft, redPlayers, bluePlayers, roomCode, myTeam }: ScoreBoardProps) {
  const mins = Math.floor(timeLeft / 60);
  const secs = Math.floor(timeLeft % 60);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-card/90 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-sm bg-team-red" />
        <span className="font-pixel text-sm text-team-red">{redScore}</span>
        <span className="text-xs text-muted-foreground">({redPlayers}👥)</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="font-pixel text-lg text-accent">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-muted-foreground">Sala: {roomCode}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">({bluePlayers}👥)</span>
        <span className="font-pixel text-sm text-team-blue">{blueScore}</span>
        <div className="w-4 h-4 rounded-sm bg-team-blue" />
      </div>

      <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2">
        <span className={`font-pixel text-[10px] px-2 py-0.5 rounded ${myTeam === 'red' ? 'bg-team-red/30 text-team-red-light' : 'bg-team-blue/30 text-team-blue-light'}`}>
          Equipo {myTeam === 'red' ? 'Rojo' : 'Azul'}
        </span>
      </div>
    </div>
  );
}
