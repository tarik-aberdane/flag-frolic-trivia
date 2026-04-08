import { useState, useEffect, useRef } from "react";
import { SMXQuestion } from "@/game/questions";

interface DuelModalProps {
  question: SMXQuestion;
  opponentName: string;
  onAnswer: (correct: boolean) => void;
  timeLimit: number; // seconds
  resolved: boolean; // opponent already answered
  resolvedResult?: "won" | "lost";
}

export default function DuelModal({ question, opponentName, onAnswer, timeLimit, resolved, resolvedResult }: DuelModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(timeLimit);
  const answeredRef = useRef(false);

  // Countdown
  useEffect(() => {
    if (revealed || resolved) return;
    const iv = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (!answeredRef.current) {
            answeredRef.current = true;
            onAnswer(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [revealed, resolved, onAnswer]);

  // If opponent resolved first
  useEffect(() => {
    if (resolved && !answeredRef.current) {
      answeredRef.current = true;
      setRevealed(true);
    }
  }, [resolved]);

  const handleSelect = (idx: number) => {
    if (revealed || answeredRef.current) return;
    answeredRef.current = true;
    setSelected(idx);
    setRevealed(true);
    setTimeout(() => onAnswer(idx === question.correct), 800);
  };

  const statusText = resolved
    ? resolvedResult === "won"
      ? "🏆 ¡Tu rival falló! Sigues jugando."
      : "💀 Tu rival respondió primero. Vuelves a base."
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="w-full max-w-lg mx-4 p-6 rounded-xl bg-card border border-border shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">⚔️</span>
            <h3 className="font-pixel text-xs text-accent">DUELO SMX</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-muted-foreground">vs {opponentName}</span>
            <span className={`font-pixel text-sm font-bold ${timer <= 5 ? "text-destructive" : "text-accent"}`}>
              {timer}s
            </span>
          </div>
        </div>

        <p className="text-foreground font-semibold text-lg mb-5">{question.question}</p>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt, i) => {
            let cls = "w-full text-left px-4 py-3 rounded-lg border font-medium transition-all cursor-pointer ";
            if (!revealed) {
              cls += "border-border bg-secondary text-secondary-foreground hover:bg-muted active:scale-[0.97]";
            } else if (i === question.correct) {
              cls += "border-green-500 bg-green-500/20 text-green-300";
            } else if (i === selected) {
              cls += "border-destructive bg-destructive/20 text-destructive";
            } else {
              cls += "border-border bg-secondary/50 text-muted-foreground";
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={revealed}>
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && !resolved && (
          <p className={`mt-4 font-pixel text-xs text-center ${selected === question.correct ? "text-green-400" : "text-destructive"}`}>
            {selected === question.correct ? "✅ ¡Correcto! Tu rival vuelve a base." : "❌ ¡Fallo! Vuelves a la base."}
          </p>
        )}

        {statusText && (
          <p className="mt-4 font-pixel text-xs text-center text-accent">{statusText}</p>
        )}
      </div>
    </div>
  );
}
