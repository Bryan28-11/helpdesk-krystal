import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <>
            {/* BARRA AZUL DELGADA (RAIL) */}
            <div className="rail">
                <div className="rail-icon" title="Inicio" onClick={() => navigate('/dashboard')}>🏠</div>
                <div className="rail-icon" title="Buscar">🔍</div>
                <div className="spacer"></div>
                <div className="rail-icon" title="Cerrar Sesión" onClick={cerrarSesion}>🚪</div>
            </div>

            {/* MENÚ DE NAVEGACIÓN GRIS (SIDEBAR) */}
            <div className="sidebar">
                <div className="project-header">
                    <div className="project-icon">IT</div>
                    <div className="project-title">
                        <div className="name">ITSM Krystal</div>
                        <div className="sub">Mesa de Servicio</div>
                    </div>
                </div>

                <ul className="nav-list">
                    <li 
                        className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        📋 Cola de Trabajo
                    </li>
                    <li 
                        className={`nav-item ${location.pathname === '/nuevo-reporte' ? 'active' : ''}`}
                        onClick={() => navigate('/nuevo-reporte')}
                    >
                        ➕ Crear Incidente
                    </li>
                    <li 
                        className={`nav-item ${location.pathname === '/estadisticas' ? 'active' : ''}`}
                        onClick={() => navigate('/estadisticas')}
                    >
                        📊 Estadísticas
                    </li>
                </ul>
            </div>
        </>
    );
}