import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Importamos la función directamente  
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';

export default function Dashboard() {
    const [reportes, setReportes] = useState([]);
    
    // Estados para los filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    
    const navigate = useNavigate();

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
        if (urgencia === 'Alta') return <span style={{ color: '#de350b', fontWeight: 'bold' }}>↑ Alta</span>;
        if (urgencia === 'Media') return <span style={{ color: '#ff8b00', fontWeight: 'bold' }}>→ Media</span>;
        if (urgencia === 'Baja') return <span style={{ color: '#006644', fontWeight: 'bold' }}>↓ Baja</span>;
        return <span style={{ color: '#42526e' }}>{urgencia || 'No asignada'}</span>;
    };

    // Función que faltaba para darle formato a la fecha
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '---';
        const fechaObj = new Date(fechaString);
        if (isNaN(fechaObj.getTime())) return '---';
        
        return fechaObj.toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // ==========================================
    // CEREBRO DE LOS FILTROS
    // ==========================================
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

    // ==========================================
    // FUNCIÓN PARA EXPORTAR A PDF
    // ==========================================
    const exportarPDF = () => {
        const doc = new jsPDF();
        
        // Título del documento
        doc.setFontSize(16);
        doc.text("Reporte de Incidentes - ITSM Krystal Grand", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, 14, 22);
        
        // Estructura de la tabla
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

        // Dibujar la tabla en el PDF usando la función importada
        autoTable(doc, {
            head: [columnas],
            body: filas,
            startY: 28,
            theme: 'striped',
            headStyles: { fillColor: [0, 82, 204] } // Azul corporativo
        });

        // Descargar el archivo
        doc.save(`Reporte_Sistemas_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="dashboard-content">
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn-primary" 
                        style={{ background: '#006644' }} 
                        onClick={exportarPDF}
                    >
                        📄 Descargar PDF
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/nuevo-reporte')}>
                        + Crear Incidente
                    </button>
                </div>

            {/* CONTROLES DE BÚSQUEDA Y FILTROS */}
            <div className="dashboard-controls" style={{ flexWrap: 'wrap' }}>
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

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '13px', color: '#6b778c', fontWeight: '700' }}>Desde:</span>
                    <input 
                        type="date" 
                        className="filter-select" 
                        value={fechaInicio} 
                        onChange={(e) => setFechaInicio(e.target.value)} 
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b778c', fontWeight: '700' }}>Hasta:</span>
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
                                    <td style={{ color: '#0052cc', fontWeight: '600' }}>ITSM-{reporte.id}</td>
                                    <td style={{ fontSize: '13px', color: '#6b778c' }}>
                                        {formatearFecha(reporte.fecha_reporte)}
                                    </td>
                                    <td style={{ fontWeight: '500' }}>{reporte.equipo_afectado}</td>
                                    <td>{reporte.departamento}</td>
                                    <td>{renderPrioridad(reporte.urgencia)}</td>
                                    <td>{reporte.reportado_por}</td>
                                    <td>
                                        <span className="status-chip" style={{ 
                                            background: reporte.estado === 'Resuelto' ? '#e3fcef' : (reporte.estado === 'En Proceso' ? '#ffab00' : '#dfe1e6'),
                                            color: reporte.estado === 'Resuelto' ? '#006644' : (reporte.estado === 'En Proceso' ? '#172b4d' : '#42526e')
                                        }}>
                                            {reporte.estado.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b778c' }}>
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