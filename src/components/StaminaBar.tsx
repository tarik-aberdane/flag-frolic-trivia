interface StaminaBarProps {
  current: number;
  max: number;
  isSprinting: boolean;
}

export default function StaminaBar({ current, max, isSprinting }: StaminaBarProps) {
  const pct = Math.round((current / max) * 100);
  const low = pct < 20;

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-48">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Stamina</span>
        {isSprinting && <span className="text-[10px] text-accent animate-pulse">SPRINT</span>}
      </div>
      <div className="h-2 bg-secondary/80 rounded-full overflow-hidden backdrop-blur-sm border border-border/50">
        <div
          className={`h-full rounded-full transition-all duration-150 ${
            low ? "bg-red-500 animate-pulse" : "bg-yellow-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
