import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css'; // Importamos el diseño de la tabla

export default function Dashboard() {
    const [reportes, setReportes] = useState([]);
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

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div>
                    <h1>Cola de Trabajo (Queues)</h1>
                    <p>Gestiona los incidentes reportados en los departamentos.</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/nuevo-reporte')}>
                    + Crear Incidente
                </button>
            </div>

            <table className="jira-table">
                <thead>
                    <tr>
                        <th>Clave</th>
                        <th>Resumen (Falla)</th>
                        <th>Departamento</th>
                        <th>Solicitante</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {reportes.map((reporte) => (
                        <tr key={reporte.id} onClick={() => navigate(`/reporte/${reporte.id}`)}>
                            <td style={{ color: '#0052cc', fontWeight: '600' }}>ITSM-{reporte.id}</td>
                            <td style={{ fontWeight: '500' }}>{reporte.equipo_afectado}</td>
                            <td>{reporte.departamento}</td>
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
                    ))}
                </tbody>
            </table>
        </div>
    );
}