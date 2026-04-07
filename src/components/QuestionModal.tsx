import { useState } from "react";
import { Question } from "@/game/questions";

interface QuestionModalProps {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

export default function QuestionModal({ question, onAnswer }: QuestionModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    setTimeout(() => onAnswer(idx === question.correct), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 p-6 rounded-xl bg-card border border-border shadow-2xl">
        <h3 className="font-pixel text-xs text-accent mb-1">⚡ PREGUNTA SMX</h3>
        <p className="text-foreground font-semibold text-lg mb-5">{question.question}</p>
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt, i) => {
            let cls = "w-full text-left px-4 py-3 rounded-lg border font-medium transition-all ";
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
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
