import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/DetalleReporte.css';

export default function DetalleReporte() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Estados del ticket
    const [reporte, setReporte] = useState(null);
    const [estadoActual, setEstadoActual] = useState('');
    const [cargando, setCargando] = useState(true);

    // Nuevos estados para los comentarios
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // 1. Traer los detalles del ticket
                const resReportes = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (resReportes.ok) {
                    const datos = await resReportes.json();
                    const ticket = datos.find(r => String(r.id) === String(id));
                    setReporte(ticket);
                    setEstadoActual(ticket?.estado || 'Abierto');
                }

                // 2. Traer el historial de comentarios
                const resComentarios = await fetch(`https://helpdesk-krystal.onrender.com/api/comentarios/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resComentarios.ok) {
                    const historial = await resComentarios.json();
                    setComentarios(historial);
                }

            } catch (error) {
                console.error("Error al obtener los detalles:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, [id]);

    // Función para cambiar de Abierto a Resuelto
    const cambiarEstado = async (nuevoEstado) => {
        setEstadoActual(nuevoEstado); 
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://helpdesk-krystal.onrender.com/api/reportes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    };

    // Función para enviar un nuevo comentario
    const agregarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return; // No enviar si está vacío
        
        setEnviandoComentario(true);
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://helpdesk-krystal.onrender.com/api/comentarios/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ comentario: nuevoComentario })
            });

            if (respuesta.ok) {
                const data = await respuesta.json();
                
                // Truco de magia: Agregamos el comentario nuevo a la lista actual para que se vea instantáneo
                const comentarioFresco = {
                    id: data.id,
                    autor: data.autor,
                    rol: data.rol,
                    comentario: data.comentario,
                    fecha: data.fecha
                };
                
                setComentarios([...comentarios, comentarioFresco]);
                setNuevoComentario(''); // Limpiamos la caja de texto
            }
        } catch (error) {
            console.error("Error al enviar comentario:", error);
        } finally {
            setEnviandoComentario(false);
        }
    };

    if (cargando) return <div>Cargando expediente...</div>;
    if (!reporte) return <div>Reporte no encontrado.</div>;

    return (
        <div className="jira-container">
            <div className="main-wrap">
                
                {/* ===================== CENTER CONTENT ===================== */}
                <div className="content">
                    <div className="breadcrumb-row">
                        <span className="issue-key">ITSM-{reporte.id}</span>
                        <a className="return-link" onClick={() => navigate('/dashboard')}>Regresar a la cola</a>
                    </div>

                    <h1 className="issue-title">Falla en {reporte.equipo_afectado}</h1>

                    <div className="action-row">
                        <button className="btn">✎ Editar</button>
                        <button className="btn" onClick={() => document.getElementById('caja-comentario').focus()}>💬 Comentar</button>
                    </div>

                    <div className="field-grid">
                        <div className="field">
                            <label>Type</label>
                            <div className="value">
                                <span className="type-icon">■</span>
                                Incident
                            </div>
                        </div>
                        
                        <div className="field">
                            <label>Status</label>
                            <select 
                                className="status-chip"
                                value={estadoActual}
                                onChange={(e) => cambiarEstado(e.target.value)}
                                style={{ 
                                    background: estadoActual === 'Resuelto' ? '#e3fcef' : (estadoActual === 'En Proceso' ? '#ffab00' : '#dfe1e6'),
                                    color: estadoActual === 'Resuelto' ? '#006644' : (estadoActual === 'En Proceso' ? '#172b4d' : '#42526e')
                                }}
                            >
                                <option value="Abierto">POR HACER</option>
                                <option value="En Proceso">EN PROCESO</option>
                                <option value="Resuelto">RESUELTO</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Priority</label>
                            <div className="value"><span className="priority-icon">↑</span> {reporte.urgencia || 'Alta'}</div>
                        </div>
                        
                        <div className="field">
                            <label>Component/s</label>
                            <div className="value"><a>{reporte.departamento}</a></div>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-heading"><h2>Description</h2></div>
                        <p className="description-text">{reporte.descripcion}</p>
                    </div>

                    {/* ===================== ACTIVITY / COMMENTS ===================== */}
                    <div className="section">
                        <div className="section-heading" style={{ borderBottom: 'none', marginBottom: '6px' }}>
                            <h2>Activity</h2>
                        </div>
                        
                        <div className="tabs">
                            <div className="tab">All</div>
                            <div className="tab active">Comments</div>
                            <div className="tab">History</div>
                        </div>

                        {/* Caja para escribir el nuevo comentario */}
                        <div style={{ marginBottom: '24px' }}>
                            <form onSubmit={agregarComentario}>
                                <textarea 
                                    id="caja-comentario"
                                    placeholder="Escribe un comentario o actualización..."
                                    value={nuevoComentario}
                                    onChange={(e) => setNuevoComentario(e.target.value)}
                                    required
                                    style={{ 
                                        width: '100%', minHeight: '70px', padding: '10px', 
                                        borderRadius: '3px', border: '1px solid #dfe1e6', 
                                        marginBottom: '8px', outline: 'none', fontFamily: 'inherit',
                                        background: '#fafbfc'
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    disabled={enviandoComentario}
                                    style={{
                                        background: '#0052cc', color: '#fff', border: 'none',
                                        padding: '6px 12px', borderRadius: '3px', fontWeight: '500',
                                        cursor: enviandoComentario ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {enviandoComentario ? 'Guardando...' : 'Guardar'}
                                </button>
                            </form>
                        </div>

                        {/* Lista dinámica de comentarios */}
                        {comentarios.length === 0 ? (
                            <p style={{ fontSize: '14px', color: '#6b778c' }}>Aún no hay comentarios en este ticket.</p>
                        ) : (
                            comentarios.map((c, index) => (
                                <div className="comment" key={c.id || index}>
                                    {/* Si el rol es Administrador o Sistemas lo pintamos de azul, si es usuario de rojo */}
                                    <div className={`avatar ${c.rol === 'admin' ? 'blue' : 'rose'}`}></div>
                                    <div className="comment-body">
                                        <div className="comment-meta">
                                            <span className="author">{c.autor}</span>
                                            <span className="action-text"> añadió un comentario - </span>
                                            <span className="time">
                                                {new Date(c.fecha).toLocaleString('es-MX', { 
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                        <div className="comment-text" style={{ whiteSpace: 'pre-wrap' }}>
                                            {c.comentario}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        
                    </div>
                </div>

                {/* ===================== RIGHT PANEL ===================== */}
                <div className="right-panel">
                    <div className="people-grid">
                        <div className="people-row">
                            <div className="p-label">Assignee:</div>
                            <div className="p-value">
                                <div className="avatar blue"></div>
                                <span className="p-name">Sistemas</span>
                            </div>
                        </div>

                        <div className="people-row">
                            <div className="p-label">Reporter:</div>
                            <div className="p-value">
                                <div className="avatar rose"></div>
                                <span className="p-name">{reporte.reportado_por}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}