// 1. Cambia la importación
import { HashRouter as Router, Routes, Route } from "react-router-dom"; 

// 2. Asegúrate de que tu componente principal use <Router> (que ahora es HashRouter)
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Index />} />
      {/* Tus otras rutas */}
    </Routes>
  </Router>
);
