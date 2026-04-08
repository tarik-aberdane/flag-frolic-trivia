import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// CAMBIA BrowserRouter por HashRouter
import { HashRouter as Router, Routes, Route } from "react-router-dom"; 
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Usa Router (que ahora es HashRouter) */}
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Si tienes más rutas, déjalas igual */}
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
