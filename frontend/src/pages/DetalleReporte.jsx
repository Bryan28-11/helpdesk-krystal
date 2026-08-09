import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoHotel from '../assets/Logo-1.png';
import './styles/Dashboard.css'; // Usaremos los estilos de aquí

export default function ReporteDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [reporte, setReporte] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [evidencia, setEvidencia] = useState(null); // Aquí guardaremos la foto en Base64
    const [enviando, setEnviando] = useState(false);

    const rolUsuario = localStorage.getItem('rol'); 
    const nombreUsuario = localStorage.getItem('nombre');

    const cargarDatos = async () => {
        const token = localStorage.getItem('token');
        try {
            // 1. Cargar el ticket
            const resTicket = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resTicket.ok) {
                const datos = await resTicket.json();
                setReporte(datos.find(r => r.id === parseInt(id)));
            }

            // 2. Cargar los comentarios
            const resComentarios = await fetch(`https://helpdesk-krystal.onrender.com/api/comentarios/${id}`);
            if (resComentarios.ok) {
                const datosComentarios = await resComentarios.json();
                setComentarios(datosComentarios);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cambiarEstado = async (nuevoEstado) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`https://helpdesk-krystal.onrender.com/api/reportes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            setReporte({ ...reporte, estado: nuevoEstado });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    // FUNCIÓN MAGICA PARA CONVERTIR IMAGEN A TEXTO BASE64
    const manejarSubidaImagen = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onloadend = () => {
                setEvidencia(lector.result); // Guardamos la imagen codificada
            };
            lector.readAsDataURL(archivo);
        }
    };

    const enviarComentario = async (e) => {
            e.preventDefault();
            setEnviando(true);
            try {
                const res = await fetch('https://helpdesk-krystal.onrender.com/api/comentarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reporte_id: id,
                        autor: nombreUsuario, // <-- Cambiado de usuario_nombre a autor
                        rol: rolUsuario,      // <-- Agregamos el rol
                        comentario: nuevoComentario,
                        evidencia: evidencia
                    })
                });

            if (res.ok) {
                setNuevoComentario('');
                setEvidencia(null);
                // Reseteamos el input file
                document.getElementById('input-evidencia').value = ""; 
                cargarDatos(); // Recargamos el historial
            }
        } catch (error) {
            console.error('Error al enviar:', error);
        } finally {
            setEnviando(false);
        }
    };

// Función auxiliar para las fechas
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '---';
        const fechaObj = new Date(fechaString);
        if (isNaN(fechaObj.getTime())) return '---';
        
        return fechaObj.toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const descargarTicketPDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        // Función para escalar el logo con proporciones exactas
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

        // 1. INCRUSTAR EL LOGO CORPORATIVO
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
        doc.text(`Orden de Trabajo / Incidente ITSM-${reporte.id}`, 105, 20, { align: 'center' });

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

        // 4. DATOS DE LA ORDEN EN FORMATO DE TABLA TÉCNICA
        const filasTicket = [
            ["Clave del Ticket", `ITSM-${reporte.id}`],
            ["Dispositivo Afectado", reporte.equipo_afectado || 'N/D'],
            ["Departamento", reporte.departamento || 'N/D'],
            ["Reportado por", reporte.reportado_por || 'N/D'],
            ["Prioridad", reporte.urgencia || 'No asignada'],
            ["Estado Actual", reporte.estado || 'Abierto'],
            ["Fecha de Registro", formatearFecha(reporte.fecha_reporte)],
            ["Descripción / Falla", reporte.descripcion || reporte.falla || 'Sin descripción detallada']
        ];

        autoTable(doc, {
            startY: 37,
            head: [["Campo de la Orden", "Detalle del Incidente"]],
            body: filasTicket,
            theme: 'grid',
            headStyles: { 
                fillColor: [0, 82, 204], 
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8.5,
                textColor: [40, 40, 40]
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 50, fillColor: [241, 245, 249] },
                1: { cellWidth: 132 }
            }
        });

        // 5. AGREGAR EVIDENCIAS DE LA BITÁCORA AL PDF
        let posicionYFinal = doc.lastAutoTable.finalY + 10;

        if (comentarios && comentarios.length > 0) {
            const comentariosConEvidencia = comentarios.filter(c => c.evidencia && c.evidencia.startsWith('data:image'));

            if (comentariosConEvidencia.length > 0) {
                if (posicionYFinal > 220) {
                    doc.addPage();
                    posicionYFinal = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(30, 41, 59);
                doc.text("Evidencias Fotográficas de la Bitácora", 14, posicionYFinal);
                posicionYFinal += 6;

                for (const item of comentariosConEvidencia) {
                    if (posicionYFinal > 200) {
                        doc.addPage();
                        posicionYFinal = 20;
                    }

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(100, 116, 139);
                    doc.text(`Bitácora por: ${item.autor || 'Técnico'} (${item.rol || 'admin'}) — Fecha: ${formatearFecha(item.fecha)}`, 14, posicionYFinal);
                    posicionYFinal += 4;

                    doc.addImage(item.evidencia, 'PNG', 14, posicionYFinal, 50, 40);
                    posicionYFinal += 45; 
                }
            }
        }

        // 6. PIE DE PÁGINA PROFESIONAL AUTOMÁTICO
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

        // 7. DESCARGAR EL PDF INDIVIDUAL
        doc.save(`Ticket_ITSM_${reporte.id}.pdf`);
    };

    if (!reporte) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando ticket...</div>;

    return (
        <div className="dashboard-content" style={{ maxWidth: '800px', margin: '40px auto' }}>
            <div className="table-container" style={{ padding: '32px' }}>
                
                {/* ENCABEZADO DEL TICKET */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ color: '#172b4d', margin: 0 }}>Ticket ITSM-{reporte.id}</h2>
                        <p style={{ color: '#6b778c', margin: '8px 0 0 0' }}>{reporte.equipo_afectado} - {reporte.departamento}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-primary btn-success" onClick={descargarTicketPDF}>
                            📄 Descargar Ticket PDF
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                            Volver
                        </button>
                    </div>
                </div>

                <div style={{ background: '#fafbfc', padding: '20px', borderRadius: '4px', border: '1px solid #dfe1e6', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#42526e' }}>Descripción de la Falla</h4>
                    <p style={{ margin: 0, color: '#172b4d', lineHeight: '1.6' }}>{reporte.descripcion}</p>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '24px', borderBottom: '2px solid #dfe1e6', marginBottom: '24px' }}>
                    <span style={{ fontWeight: '600', color: '#42526e' }}>Estado del Ticket:</span>
                    {rolUsuario === 'admin' ? (
                        <select className="filter-select" value={reporte.estado} onChange={(e) => cambiarEstado(e.target.value)}>
                            <option value="Abierto">Abierto (Por Hacer)</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Resuelto">Resuelto</option>
                        </select>
                    ) : (
                        <span className="status-chip" style={{ 
                            background: reporte.estado === 'Resuelto' ? '#e3fcef' : '#dfe1e6',
                            color: reporte.estado === 'Resuelto' ? '#006644' : '#42526e'
                        }}>
                            {reporte.estado.toUpperCase()}
                        </span>
                    )}
                </div>

                {/* ==========================================
                    ZONA DE BITÁCORA Y EVIDENCIAS
                    ========================================== */}
                <h3 style={{ color: '#172b4d', marginBottom: '16px' }}>Bitácora de Sistemas</h3>
                
                    <div className="comentarios-lista">
                                            {comentarios.length === 0 ? (
                                                <p style={{ color: '#6b778c', fontStyle: 'italic' }}>No hay actualizaciones en la bitácora aún.</p>
                                            ) : (
                                                comentarios.map(com => (
                                                    <div key={com.id} className="comentario-burbuja">
                                                        <div className="comentario-header">
                                                            {/* Cambiamos com.usuario_nombre por com.autor */}
                                                            <strong>{com.autor} ({com.rol})</strong> 
                                                            <span>{new Date(com.fecha).toLocaleString('es-MX')}</span>
                                                        </div>
                                                        <p>{com.comentario}</p>
                                                        {com.evidencia && (
                                                            <div className="comentario-evidencia">
                                                                <img src={com.evidencia} alt="Evidencia del sistema" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                {/* FORMULARIO SOLO PARA ADMIN */}
                {rolUsuario === 'admin' && (
                    <form onSubmit={enviarComentario} className="comentario-form">
                        <textarea 
                            className="search-input" 
                            style={{ width: '100%', minHeight: '80px', marginBottom: '12px' }}
                            placeholder="Añadir nota técnica o actualización..."
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            required
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <input 
                                type="file" 
                                id="input-evidencia"
                                accept="image/*" 
                                onChange={manejarSubidaImagen} 
                                style={{ fontSize: '13px' }}
                            />
                            <button type="submit" className="btn-primary" disabled={enviando}>
                                {enviando ? 'Guardando...' : 'Guardar en Bitácora'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}