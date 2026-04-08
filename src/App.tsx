import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// CAMBIA ESTA LÍNEA:
import { HashRouter as Router, Routes, Route } from "react-router-dom"; 
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* CAMBIA BrowserRouter por Router (que ahora es HashRouter) */}
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Añade esto para capturar rutas inexistentes si no lo tienes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
