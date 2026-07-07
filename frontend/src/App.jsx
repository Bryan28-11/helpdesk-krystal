import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevoReporte from './pages/NuevoReporte';
import DetalleReporte from './pages/DetalleReporte';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta inicial: El Login */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta del sistema: El panel de reportes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nuevo-reporte" element={<NuevoReporte />} />
        <Route path="/reporte/:id" element={<DetalleReporte />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;