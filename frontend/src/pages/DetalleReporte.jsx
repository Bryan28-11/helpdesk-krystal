import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/DetalleReporte.css'; // <-- Importación directa del CSS puro

export default function DetalleReporte() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [reporte, setReporte] = useState(null);
    const [estadoActual, setEstadoActual] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    const ticket = datos.find(r => String(r.id) === String(id));
                    setReporte(ticket);
                    setEstadoActual(ticket?.estado || 'Abierto');
                }
            } catch (error) {
                console.error("Error al obtener los detalles:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, [id]);

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
                        <button className="btn">💬 Comentar</button>
                        <button className="btn">Asignar</button>
                        <button className="btn">Resolver este ticket</button>
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

                        {/* Comentario de ejemplo */}
                        <div className="comment">
                            <div className="avatar blue"></div>
                            <div className="comment-body">
                                <div className="comment-meta">
                                    <span className="author">Sistemas</span>
                                    <span className="action-text"> añadió un comentario - </span>
                                    <span className="time">Hace 2 horas</span>
                                </div>
                                <div className="comment-text">
                                    Se revisó el equipo de Alimentos y Bebidas. Estamos a la espera de que el proveedor entregue el nuevo tóner esta tarde.
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div> {/* <-- Aquí termina el div className="content" */}
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
    );
}