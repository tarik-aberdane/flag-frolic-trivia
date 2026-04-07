interface ScoreBoardProps {
  redScore: number;
  blueScore: number;
  timeLeft: number;
}

export default function ScoreBoard({ redScore, blueScore, timeLeft }: ScoreBoardProps) {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-sm bg-team-red" />
        <span className="font-pixel text-sm text-team-red">{redScore}</span>
      </div>

      <div className="font-pixel text-lg text-accent">
        {mins}:{secs.toString().padStart(2, "0")}
      </div>

      <div className="flex items-center gap-3">
        <span className="font-pixel text-sm text-team-blue">{blueScore}</span>
        <div className="w-5 h-5 rounded-sm bg-team-blue" />
      </div>
    </div>
  );
}
