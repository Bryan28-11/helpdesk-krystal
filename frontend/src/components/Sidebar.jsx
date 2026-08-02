import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoHotel from '../assets/Logo-1.png';
import logoBuscar from '../assets/buscar.png';
import iconoHome from '../assets/casa.png';
import iconoCerrar   from '../assets/cerrar-sesion.png';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtenemos el rol y nombre del usuario logueado
    const rolUsuario = localStorage.getItem('rol');
    const nombreUsuario = localStorage.getItem('nombre') || 'Usuario';

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('nombre');
        navigate('/');
    };

    // Función para extraer las iniciales (Ej: "Valerie Rodriguez" -> "VR")
    const obtenerIniciales = (nombre) => {
        const partes = nombre.trim().split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    const iniciales = obtenerIniciales(nombreUsuario);
    const esAdmin = rolUsuario && rolUsuario.toLowerCase().trim() === 'admin';

    return (
        <>
            {/* BARRA AZUL DELGADA (RAIL) */}
            <div className="rail">
                {/* 1. Círculo de Iniciales del Usuario */}
                <div 
                    className="rail-user-avatar" 
                    title={`Sesión iniciada como: ${nombreUsuario}`}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#0052cc',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        margin: '12px auto',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    {iniciales}
                </div>

                {/* 2. Botón de Inicio / Cola de Trabajo */}
                <div className="rail-icon" title="Cola de Trabajo" onClick={() => navigate('/dashboard')}>
                    <img src={iconoHome} alt="Inicio" style={{ width: '24px', height: '24px' }} />
                </div>

                {/* 3. Botón de Búsqueda rápida */}
                <div className="rail-icon" title="Buscar / Reportes" onClick={() => navigate('/dashboard')}>
                    <img src={logoBuscar} alt="Buscar" style={{ width: '24px', height: '24px' }} />
                </div>

                <div className="spacer"></div>

                {/* 4. Botón de Cerrar Sesión abajo */}
                <div className="rail-icon" title="Cerrar Sesión" onClick={cerrarSesion}>
                    <img src={iconoCerrar} alt="Salir" style={{ width: '24px', height: '24px' }} />
                </div>
            </div>

            {/* MENÚ DE NAVEGACIÓN GRIS (SIDEBAR) */}
            <div className="sidebar">
                <div className="project-header">
                    <div className="project-title">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img 
                                src={logoHotel} 
                                alt="Logo Krystal Grand" 
                                style={{ width: '120px', height: 'auto' }} 
                            />
                        </div>
                        <div className="sub">Mesa de Servicio</div>
                    </div>
                </div>

                <ul className="nav-list">
                    <li 
                        className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        Cola de Trabajo
                    </li>
                    <li 
                        className={`nav-item ${location.pathname === '/nuevo-reporte' ? 'active' : ''}`}
                        onClick={() => navigate('/nuevo-reporte')}
                    >
                        Crear Incidente
                    </li>
                    <li 
                        className={`nav-item ${location.pathname === '/estadisticas' ? 'active' : ''}`}
                        onClick={() => navigate('/estadisticas')}
                    >
                        Estadísticas
                    </li>

                    {/* SECCIÓN CONDICIONAL DE ADMINISTRACIÓN */}
                    {esAdmin && (
                        <>
                            <div style={{ 
                                fontSize: '10px', 
                                color: '#64748b', 
                                padding: '16px 16px 6px 16px', 
                                textTransform: 'uppercase', 
                                fontWeight: 'bold',
                                letterSpacing: '0.5px'
                            }}>
                                Administración
                            </div>
                            <li 
                                className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`}
                                onClick={() => navigate('/usuarios')}
                            >
                                Directorio de Personal
                            </li>
                            <li 
                                className={`nav-item ${location.pathname === '/nuevo-usuario' ? 'active' : ''}`}
                                onClick={() => navigate('/nuevo-usuario')}
                            >
                                Registrar Usuario
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </>
    );
}