import { CHARACTERS, CharacterDef } from "@/game/characters";

interface CharacterSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function CharacterSelector({ selected, onSelect }: CharacterSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CHARACTERS.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            selected === c.id
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{c.emoji}</span>
            <span className="font-semibold text-foreground text-sm">{c.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{c.description}</p>
          <div className="flex gap-2 text-[10px]">
            <StatBar label="VEL" value={c.walkSpeed} max={1.5} color="bg-green-500" />
            <StatBar label="SPRINT" value={c.sprintSpeed} max={1.5} color="bg-blue-500" />
            <StatBar label="STA" value={c.maxStamina} max={150} color="bg-yellow-500" />
          </div>
        </button>
      ))}
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex-1">
      <div className="text-muted-foreground mb-0.5">{label}</div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
