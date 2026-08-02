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
    const rolUsuario = localStorage.getItem('rol');

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
        
        // 1. FRANJA DE ENCABEZADO CORPORATIVA (Azul Krystal Grand)
        doc.setFillColor(0, 82, 204); 
        doc.rect(0, 0, 210, 25, 'F'); 

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text("KRYSTAL GRAND NUEVO VALLARTA", 14, 16);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Departamento de Sistemas - Reporte General de Incidentes", 14, 21);

        // 2. METADATOS Y FECHA DE EMISIÓN
        doc.setTextColor(90, 90, 90);
        doc.setFontSize(9);
        const fechaActual = new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Fecha de emisión: ${fechaActual}`, 14, 33);
        
        // 3. CONSTRUCCIÓN DE LA TABLA PROFESIONAL CON AUTOTABLE
        const columnas = ["Clave", "Fecha", "Resumen (Falla)", "Departamento", "Prioridad", "Solicitante", "Estado"];
        const filas = [];

        reportesFiltrados.forEach(reporte => {
            const datosFila = [
                `ITSM-${reporte.id}`,
                formatearFecha(reporte.fecha_reporte),
                reporte.equipo_afectado,
                reporte.departamento,
                reporte.urgencia || 'No asignada',
                reporte.reportado_por || 'N/D',
                reporte.estado
            ];
            filas.push(datosFila);
        });

        autoTable(doc, {
            startY: 38,
            head: [columnas],
            body: filas,
            theme: 'grid',
            headStyles: { 
                fillColor: [0, 82, 204],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8.5,
                textColor: [40, 40, 40]
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 18 }, // Clave
                1: { cellWidth: 22 },                  // Fecha
                4: { halign: 'center', cellWidth: 22 },  // Prioridad
                6: { halign: 'center', cellWidth: 20 }   // Estado
            }
        });

        // 4. PIE DE PÁGINA AUTOMÁTICO
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Página ${i} de ${pageCount} — Sistema ITSM Krystal Grand`, 
                14, 
                287
            );
        }

        // 5. DESCARGAR EL DOCUMENTO
        doc.save(`Reporte_Sistemas_Krystal_${Date.now()}.pdf`);
    };

    return (
        <div className="dashboard-content">
            {/* BOTONES PRINCIPALES */}
            <div className="dashboard-header-actions" style={{ marginBottom: '20px', justifyContent: 'flex-end' }}>
                <button className="btn-primary btn-success" onClick={exportarPDF}>
                    📄 Descargar PDF
                </button>
                
               {/* BOTONES PROTEGIDOS: Solo los ve el administrador (Sistemas) */}
                {rolUsuario && rolUsuario.toLowerCase().trim() === 'admin' && (
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