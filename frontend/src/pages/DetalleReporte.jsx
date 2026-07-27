import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

    const descargarTicketPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(0, 82, 204);
        doc.text(`Orden de Trabajo - ITSM-${reporte.id}`, 14, 20);
        doc.setFontSize(12);
        doc.setTextColor(23, 43, 77);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, 14, 28);
        
        autoTable(doc, {
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [244, 245, 247], textColor: [23, 43, 77] },
            body: [
                ['Dispositivo Afectado', reporte.equipo_afectado],
                ['Departamento', reporte.departamento],
                ['Reportado por', reporte.reportado_por],
                ['Prioridad', reporte.urgencia],
                ['Estado Actual', reporte.estado],
                ['Falla Reportada', reporte.descripcion]
            ]
        });
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