import { useEffect, useState } from "react";

interface VictoryOverlayProps {
  show: boolean;
  team: "red" | "blue";
}

export default function VictoryOverlay({ show, team }: VictoryOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="animate-scale-in text-center">
        <div className="text-6xl mb-2">🏆</div>
        <h2 className="font-pixel text-2xl text-accent drop-shadow-lg">¡BANDERA CAPTURADA!</h2>
        <p className={`font-pixel text-lg mt-2 ${team === "red" ? "text-red-400" : "text-blue-400"}`}>
          +1 punto para {team === "red" ? "Rojo" : "Azul"}
        </p>
      </div>
    </div>
  );
}
