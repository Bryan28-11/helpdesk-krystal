import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';

export default function Dashboard() {
    const [reportes, setReportes] = useState([]);
    
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    
    const navigate = useNavigate();
    const rolUsuario = localStorage.getItem('rol'); // Verificamos el rol para mostrar botones ocultos

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
                console.error('Error:', error);
            }
        };
        fetchReportes();
    }, [navigate]);

    const renderPrioridad = (urgencia) => {
        if (urgencia === 'Alta') return <span className="prioridad-alta">↑ Alta</span>;
        if (urgencia === 'Media') return <span className="prioridad-media">→ Media</span>;
        if (urgencia === 'Baja') return <span className="prioridad-baja">↓ Baja</span>;
        return <span className="prioridad-nula">{urgencia || 'No asignada'}</span>;
    };

    const obtenerClaseEstado = (estado) => {
        if (estado === 'Resuelto') return 'status-chip status-resuelto';
        if (estado === 'En Proceso') return 'status-chip status-en-proceso';
        return 'status-chip status-abierto';
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '---';
        const fechaObj = new Date(fechaString);
        if (isNaN(fechaObj.getTime())) return '---';
        
        return fechaObj.toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const reportesFiltrados = reportes.filter(reporte => {
        const coincideBusqueda = reporte.equipo_afectado.toLowerCase().includes(busqueda.toLowerCase()) || 
                                 reporte.departamento.toLowerCase().includes(busqueda.toLowerCase());
        
        const coincideEstado = filtroEstado === 'Todos' || reporte.estado === filtroEstado;
        
        let coincideFecha = true;
        const fechaReporte = new Date(reporte.fecha_reporte); 
        
        if (!isNaN(fechaReporte.getTime())) {
            if (fechaInicio) {
                const inicio = new Date(fechaInicio + 'T00:00:00');
                coincideFecha = coincideFecha && (fechaReporte >= inicio);
            }
            if (fechaFin) {
                const fin = new Date(fechaFin + 'T23:59:59');
                coincideFecha = coincideFecha && (fechaReporte <= fin);
            }
        }

        return coincideBusqueda && coincideEstado && coincideFecha;
    });

    const exportarPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("Reporte de Incidentes - ITSM Krystal Grand", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, 14, 22);
        
        const columnas = ["Clave", "Fecha", "Equipo", "Departamento", "Prioridad", "Estado"];
        const filas = [];

        reportesFiltrados.forEach(reporte => {
            const datosFila = [
                `ITSM-${reporte.id}`,
                formatearFecha(reporte.fecha_reporte),
                reporte.equipo_afectado,
                reporte.departamento,
                reporte.urgencia || 'No asignada',
                reporte.estado
            ];
            filas.push(datosFila);
        });

        autoTable(doc, {
            head: [columnas],
            body: filas,
            startY: 28,
            theme: 'striped',
            headStyles: { fillColor: [0, 82, 204] } 
        });

        doc.save(`Reporte_Sistemas_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="dashboard-content">
            {/* BOTONES PRINCIPALES */}
            <div className="dashboard-header-actions" style={{ marginBottom: '20px', justifyContent: 'flex-end' }}>
                <button className="btn-primary btn-success" onClick={exportarPDF}>
                    📄 Descargar PDF
                </button>
                
               {/* BOTONES PROTEGIDOS: Solo los ve el administrador (Sistemas) */}
                {rolUsuario === 'admin' && (
                    <>
                        <button className="btn-secondary" onClick={() => navigate('/usuarios')}>
                            👥 Ver Usuarios
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/nuevo-usuario')}>
                            👤 Crear Usuario
                        </button>
                    </>
                )}
                
                <button className="btn-primary" onClick={() => navigate('/nuevo-reporte')}>
                    + Crear Incidente
                </button>
            </div>

            {/* CONTROLES DE BÚSQUEDA Y FILTROS */}
            <div className="dashboard-controls">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="🔍 Buscar equipo o departamento..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                
                <select 
                    className="filter-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="Todos">Todos los estados</option>
                    <option value="Abierto">Por Hacer (Abiertos)</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Resuelto">Resueltos</option>
                </select>

                <div className="filter-date-group filter-date-left">
                    <span className="filter-label">Desde:</span>
                    <input 
                        type="date" 
                        className="filter-select" 
                        value={fechaInicio} 
                        onChange={(e) => setFechaInicio(e.target.value)} 
                    />
                </div>
                <div className="filter-date-group">
                    <span className="filter-label">Hasta:</span>
                    <input 
                        type="date" 
                        className="filter-select" 
                        value={fechaFin} 
                        onChange={(e) => setFechaFin(e.target.value)} 
                    />
                </div>
            </div>

            {/* TABLA ENCAPSULADA */}
            <div className="table-container">
                <table className="jira-table">
                    <thead>
                        <tr>
                            <th>Clave</th>
                            <th>Fecha</th>
                            <th>Resumen (Falla)</th>
                            <th>Departamento</th>
                            <th>Prioridad</th>
                            <th>Solicitante</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportesFiltrados.length > 0 ? (
                            reportesFiltrados.map((reporte) => (
                                <tr key={reporte.id} onClick={() => navigate(`/reporte/${reporte.id}`)}>
                                    <td className="td-clave">ITSM-{reporte.id}</td>
                                    <td className="td-fecha">{formatearFecha(reporte.fecha_reporte)}</td>
                                    <td className="td-resumen">{reporte.equipo_afectado}</td>
                                    <td>{reporte.departamento}</td>
                                    <td>{renderPrioridad(reporte.urgencia)}</td>
                                    <td>{reporte.reportado_por}</td>
                                    <td>
                                        <span className={obtenerClaseEstado(reporte.estado)}>
                                            {reporte.estado.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="td-empty">
                                    No se encontraron incidentes en este periodo o con estos filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}