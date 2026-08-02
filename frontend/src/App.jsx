import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevoReporte from './pages/NuevoReporte';
import DetalleReporte from './pages/DetalleReporte';
import DashboardStats from "./pages/DashboardStats";
import NuevoUsuario from './pages/NuevoUsuario';
import ListaUsuarios from './pages/ListaUsuarios';
import logoHotel from "./assets/Logo-1.png";
import EditarUsuario from './pages/EditarUsuario';
import Layout from './components/Layout'; // <-- Aquí llamamos al Layout

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Envolvemos las rutas del sistema dentro de <Layout> para que aparezca el Sidebar */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/nuevo-reporte" element={<Layout><NuevoReporte /></Layout>} />
        <Route path="/reporte/:id" element={<Layout><DetalleReporte /></Layout>} />
        <Route path="/estadisticas" element={<Layout><DashboardStats /></Layout>} />
        <Route path="/nuevo-usuario" element={<Layout><NuevoUsuario /></Layout>} />
        <Route path="/usuarios" element={<Layout><ListaUsuarios /></Layout>} />
        <Route path="/editar-usuario/:id" element={<EditarUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;