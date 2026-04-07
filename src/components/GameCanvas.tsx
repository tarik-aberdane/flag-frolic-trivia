import { useRef, useEffect, useCallback } from "react";
import { GameState, CANVAS_W, CANVAS_H, PLAYER_R, FLAG_R } from "@/game/types";

interface GameCanvasProps {
  state: GameState;
}

export default function GameCanvas({ state }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#2d5a3d";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Midline
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Team zones
    ctx.fillStyle = "rgba(220,50,50,0.06)";
    ctx.fillRect(0, 0, CANVAS_W / 2, CANVAS_H);
    ctx.fillStyle = "rgba(50,130,220,0.06)";
    ctx.fillRect(CANVAS_W / 2, 0, CANVAS_W / 2, CANVAS_H);

    // Obstacles
    ctx.fillStyle = "#4a5568";
    for (const o of state.obstacles) {
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = "#2d3748";
      ctx.lineWidth = 1;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }

    // Flags
    for (const f of state.flags) {
      if (f.carriedBy !== null) continue;
      ctx.beginPath();
      ctx.arc(f.pos.x, f.pos.y, FLAG_R, 0, Math.PI * 2);
      ctx.fillStyle = f.team === "red" ? "#ef4444" : "#3b82f6";
      ctx.fill();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Flag icon
      ctx.fillStyle = "#fbbf24";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚑", f.pos.x, f.pos.y);
    }

    // Players
    for (const p of state.players) {
      const color = p.team === "red" ? "#ef4444" : "#3b82f6";
      const lightColor = p.team === "red" ? "#fca5a5" : "#93c5fd";

      // Glow
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, PLAYER_R + 4, 0, Math.PI * 2);
      ctx.fillStyle = p.frozen ? "rgba(100,100,100,0.3)" : `${color}33`;
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, PLAYER_R, 0, Math.PI * 2);
      ctx.fillStyle = p.frozen ? "#666" : color;
      ctx.fill();
      ctx.strokeStyle = p.frozen ? "#444" : lightColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Player number
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`P${p.id + 1}`, p.pos.x, p.pos.y);

      // Has flag indicator
      if (p.hasFlag) {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "12px sans-serif";
        ctx.fillText("⚑", p.pos.x, p.pos.y - PLAYER_R - 8);
      }

      // AI label
      if (p.isAI) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "8px Inter, sans-serif";
        ctx.fillText("AI", p.pos.x, p.pos.y + PLAYER_R + 10);
      }
    }
  }, [state]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="rounded-lg border border-border shadow-xl max-w-full"
      style={{ imageRendering: "auto" }}
    />
  );
}
