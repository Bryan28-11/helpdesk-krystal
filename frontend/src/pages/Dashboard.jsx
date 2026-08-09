import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';
import logoHotel from '../assets/Logo-1.png';

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

  const exportarPDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        // Función para escalar el logo a un tamaño mayor manteniendo su proporción
        const obtenerLogoProporcional = (imgSrc) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Aumentamos la altura objetivo a 16mm para que se vea más grande y legible
                    const aspectRatio = img.width / img.height;
                    const targetHeight = 16; 
                    const targetWidth = targetHeight * aspectRatio;

                    resolve({
                        dataUrl: canvas.toDataURL('image/png'),
                        width: targetWidth,
                        height: targetHeight
                    });
                };
                img.onerror = reject;
                img.src = imgSrc;
            });
        };

        // 1. INCRUSTAR EL LOGO MÁS GRANDE Y PROPORCIONAL
        try {
            const logo = await obtenerLogoProporcional(logoHotel);
            doc.addImage(logo.dataUrl, 'PNG', 14, 8, logo.width, logo.height);
        } catch (e) {
            console.log('Aviso: No se pudo cargar el logo dinámico', e);
        }

        // 2. ENCABEZADO EJECUTIVO Y CENTRADO
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text("KRYSTAL GRAND NUEVO VALLARTA", 105, 15, { align: 'center' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Departamento de Sistemas — Reporte General de Incidentes (ITSM)", 105, 20, { align: 'center' });

        // Línea divisoria elegante
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.line(14, 25, 196, 25);

        // 3. FECHA DE EMISIÓN
        doc.setFontSize(8.5);
        doc.setTextColor(70, 70, 70);
        const fechaActual = new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Fecha de emisión: ${fechaActual}`, 14, 32);

        // 4. CONSTRUCCIÓN DE LA TABLA PROFESIONAL
        const columnas = ["Clave", "Fecha", "Resumen (Falla)", "Departamento", "Prioridad", "Solicitante", "Estado"];
        const filas = [];

        reportesFiltrados.forEach(reporte => {
            filas.push([
                `ITSM-${reporte.id}`,
                formatearFecha(reporte.fecha_reporte),
                reporte.equipo_afectado,
                reporte.departamento,
                reporte.urgencia || 'No asignada',
                reporte.reportado_por || 'N/D',
                reporte.estado
            ]);
        });

        autoTable(doc, {
            startY: 37,
            head: [columnas],
            body: filas,
            theme: 'grid',
            headStyles: { 
                fillColor: [0, 82, 204], 
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 8.5
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [40, 40, 40]
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 16 }, 
                1: { cellWidth: 22 },                   
                4: { halign: 'center', cellWidth: 20 }, 
                6: { halign: 'center', cellWidth: 22 }  
            }
        });

        // 5. PIE DE PÁGINA PROFESIONAL AUTOMÁTICO
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(140, 140, 140);
            doc.text(
                `Página ${i} de ${pageCount} — Sistema ITSM Krystal Grand Nuevo Vallarta`, 
                105, 
                287, 
                { align: 'center' }
            );
        }

        // 6. DESCARGAR EL DOCUMENTO
        doc.save(`Reporte_General_Sistemas_${Date.now()}.pdf`);
    };

    return (
        <div className="dashboard-content">
            {/* BOTONES PRINCIPALES */}
            <div className="dashboard-header-actions" style={{ marginBottom: '20px', justifyContent: 'flex-end' }}>
                <button className="btn-primary btn-success" onClick={exportarPDF}>
                    📄 Descargar PDF
                </button>
             
                <button className="btn-primary" onClick={() => navigate('/nuevo-reporte')}>
                    + Crear Incidente
                </button>
            </div>

            {/* CONTROLES DE BÚSQUEDA Y FILTROS */}
            <div className="dashboard-controls">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Buscar equipo o departamento..." 
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