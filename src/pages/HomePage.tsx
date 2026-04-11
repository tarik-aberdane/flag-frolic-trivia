import { useNavigate } from "react-router-dom";
import InstallButton from "@/components/InstallButton";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div className="mb-8">
          <span className="text-6xl mb-4 block">⚑</span>
          <h1 className="font-pixel text-4xl text-accent mb-3">ATRAPAFLAG</h1>
          <h2 className="font-pixel text-lg text-primary mb-4">SMX EDITION</h2>
          <p className="text-muted-foreground leading-relaxed">
            Juego 3D multijugador de captura de bandera. Hasta 60 jugadores por sala.
            Roba la bandera enemiga y llévala a tu base. Si un rival te toca en su territorio,
            ¡responde una pregunta de informática para seguir jugando!
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/lobby")}
            className="w-full px-8 py-4 rounded-xl bg-primary text-primary-foreground font-pixel text-sm active:scale-[0.97] transition-transform"
          >
            🎮 JUGAR
          </button>
          <InstallButton />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-accent font-pixel text-xs mb-1">30v30</p>
            <p className="text-xs text-muted-foreground">Jugadores</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-accent font-pixel text-xs mb-1">3D</p>
            <p className="text-xs text-muted-foreground">Mundo</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-accent font-pixel text-xs mb-1">SMX</p>
            <p className="text-xs text-muted-foreground">Preguntas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
