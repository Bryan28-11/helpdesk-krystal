import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/DashboardStats.css';

export default function DashboardStats() {
    const navigate = useNavigate();
    const [reportes, setReportes] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Nuevo estado para el filtro mensual (formato YYYY-MM)
    const [mesFiltro, setMesFiltro] = useState(''); 

    useEffect(() => {
        const fetchReportes = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/');
            
            try {
                const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    setReportes(datos);
                }
            } catch (error) {
                console.error('Error cargando estadísticas:', error);
            } finally {
                setCargando(false);
            }
        };
        fetchReportes();
    }, [navigate]);

    if (cargando) return <div className="stats-container">Cargando métricas...</div>;

    // ==========================================
    // 1. FILTRAMOS LOS REPORTES POR EL MES SELECCIONADO
    // ==========================================
    const reportesFiltrados = reportes.filter(r => {
        if (!mesFiltro) return true; // Si no hay mes seleccionado, muestra el total histórico
        
        const fecha = new Date(r.fecha_creacion || r.fecha);
        if (isNaN(fecha.getTime())) return false;

        const [year, month] = mesFiltro.split('-');
        return fecha.getFullYear() === parseInt(year) && (fecha.getMonth() + 1) === parseInt(month);
    });

    // ==========================================
    // 2. RECALCULAMOS LAS MATEMÁTICAS CON LOS FILTRADOS
    // ==========================================
    const total = reportesFiltrados.length;
    const abiertos = reportesFiltrados.filter(r => r.estado === 'Abierto').length;
    const enProceso = reportesFiltrados.filter(r => r.estado === 'En Proceso').length;
    const resueltos = reportesFiltrados.filter(r => r.estado === 'Resuelto').length;

    const prioridades = { Alta: 0, Media: 0, Baja: 0 };
    reportesFiltrados.forEach(r => {
        if (r.urgencia === 'Alta') prioridades.Alta++;
        else if (r.urgencia === 'Media') prioridades.Media++;
        else prioridades.Baja++; 
    });

    const departamentos = {};
    reportesFiltrados.forEach(r => {
        const dep = r.departamento || 'Sin asignar';
        departamentos[dep] = (departamentos[dep] || 0) + 1;
    });
    const depOrdenados = Object.entries(departamentos).sort((a, b) => b[1] - a[1]);

    const calcularAncho = (valor) => total === 0 ? 0 : (valor / total) * 100;

    return (
        <div className="stats-container">
            <div className="stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Métricas de Servicio (ITSM)</h1>
                    <p>Indicadores clave de rendimiento de la mesa de ayuda del hotel.</p>
                </div>
                
                {/* SELECTOR DE MES */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #dfe1e6' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#172b4d' }}>Filtrar por Mes:</label>
                    <input 
                        type="month" 
                        value={mesFiltro}
                        onChange={(e) => setMesFiltro(e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #dfe1e6', outline: 'none' }}
                    />
                    {mesFiltro && (
                        <button 
                            onClick={() => setMesFiltro('')}
                            style={{ background: 'transparent', border: 'none', color: '#0052cc', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* TARJETAS SUPERIORES */}
            <div className="kpi-grid">
                <div className="kpi-card blue">
                    <div className="kpi-title">Total Incidentes</div>
                    <div className="kpi-value">{total}</div>
                </div>
                <div className="kpi-card gray">
                    <div className="kpi-title">Por Hacer (Abiertos)</div>
                    <div className="kpi-value">{abiertos}</div>
                </div>
                <div className="kpi-card yellow">
                    <div className="kpi-title">En Progreso</div>
                    <div className="kpi-value">{enProceso}</div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-title">Resueltos</div>
                    <div className="kpi-value">{resueltos}</div>
                </div>
            </div>

            <div className="charts-grid">
                {/* PANEL DE PRIORIDADES */}
                <div className="chart-panel">
                    <h2 className="chart-title">Incidentes por Prioridad</h2>
                    
                    <div className="stat-row">
                        <div className="stat-label" style={{ color: '#de350b' }}>↑ Alta</div>
                        <div className="stat-bar-bg">
                            <div className="stat-bar-fill" style={{ width: `${calcularAncho(prioridades.Alta)}%`, background: '#de350b' }}></div>
                        </div>
                        <div className="stat-count">{prioridades.Alta}</div>
                    </div>
                    
                    <div className="stat-row">
                        <div className="stat-label" style={{ color: '#ff8b00' }}>→ Media</div>
                        <div className="stat-bar-bg">
                            <div className="stat-bar-fill" style={{ width: `${calcularAncho(prioridades.Media)}%`, background: '#ff8b00' }}></div>
                        </div>
                        <div className="stat-count">{prioridades.Media}</div>
                    </div>
                    
                    <div className="stat-row">
                        <div className="stat-label" style={{ color: '#006644' }}>↓ Baja</div>
                        <div className="stat-bar-bg">
                            <div className="stat-bar-fill" style={{ width: `${calcularAncho(prioridades.Baja)}%`, background: '#006644' }}></div>
                        </div>
                        <div className="stat-count">{prioridades.Baja}</div>
                    </div>
                </div>

                {/* PANEL DE DEPARTAMENTOS */}
                <div className="chart-panel">
                    <h2 className="chart-title">Carga por Departamento</h2>
                    
                    {depOrdenados.length === 0 ? (
                        <p style={{ color: '#6b778c', fontSize: '13px' }}>No hay datos suficientes para este mes.</p>
                    ) : (
                        depOrdenados.map(([nombre, cantidad], index) => (
                            <div className="stat-row" key={index}>
                                <div className="stat-label" title={nombre}>{nombre}</div>
                                <div className="stat-bar-bg">
                                    <div className="stat-bar-fill" style={{ width: `${calcularAncho(cantidad)}%`, background: '#0052cc' }}></div>
                                </div>
                                <div className="stat-count">{cantidad}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}