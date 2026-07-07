import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';

const Dashboard = () => {
    const [reportes, setReportes] = useState([]);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReportes = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setReportes(data);
                } else {
                    setError(data.error || 'Error al obtener los reportes');
                }
            } catch (err) {
                setError('Error de conexión con el servidor. ¿Está encendido el backend?');
            }
        };

        fetchReportes();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title-group">
                    <h2>Panel de Reportes</h2>
                    <button onClick={() => navigate('/nuevo-reporte')} className="btn-crear">
                        + Crear Reporte
                    </button>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                    Cerrar Sesión
                </button>
            </div>
            
            {error && <p className="dashboard-error">{error}</p>}

            <div className="table-container">
                {reportes.length === 0 ? (
                    <p className="empty-message">No hay reportes registrados en este momento.</p>
                ) : (
                    <table className="reportes-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Departamento</th>
                                <th>Falla</th>
                                <th>Reportado por</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.map((ticket) => (
                                <tr 
                                    key={ticket.id} 
                                    className="table-row"
                                    onClick={() => navigate(`/reporte/${ticket.id}`)}
                                >
                                    <td className="folio-bold">#{ticket.id}</td>
                                    <td>{ticket.departamento}</td>
                                    <td>{ticket.equipo_afectado}</td>
                                    <td>{ticket.reportado_por}</td>
                                    <td>
                                        <span className={`badge ${
                                            ticket.estado === 'Resuelto' ? 'badge-resuelto' : 
                                            ticket.estado === 'En Proceso' ? 'badge-proceso' : 'badge-abierto'
                                        }`}>
                                            {ticket.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;