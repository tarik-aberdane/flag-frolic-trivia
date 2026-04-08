interface ProximityPromptProps {
  label: string;
  visible: boolean;
}

export default function ProximityPrompt({ label, visible }: ProximityPromptProps) {
  if (!visible) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-[30%] z-30 pointer-events-none animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/90 border border-accent/50 backdrop-blur-md shadow-xl">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
          E
        </span>
        <span className="text-foreground font-semibold text-sm">{label}</span>
      </div>
    </div>
  );
}
