import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css'; // O tu archivo de estilos correspondiente

export default function ListaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const navigate = useNavigate();
    const rolUsuario = localStorage.getItem('rol');

    useEffect(() => {
        // Validación de seguridad por si no es admin
        if (rolUsuario !== 'admin') {
            navigate('/dashboard');
            return;
        }
        cargarUsuarios();
    }, [navigate, rolUsuario]);

    const cargarUsuarios = async () => {
        const token = localStorage.getItem('token');
        try {
            const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (respuesta.ok) {
                const datos = await respuesta.json();
                setUsuarios(datos);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

        const eliminarUsuario = async (id, nombre) => {
            if (!window.confirm(`¿Estás seguro de eliminar al usuario ${nombre}?`)) return;

            const token = localStorage.getItem('token');
            try {
                const respuesta = await fetch(`https://helpdesk-krystal.onrender.com/api/usuarios/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (respuesta.ok) {
                    alert('Usuario eliminado correctamente');
                    cargarUsuarios(); // Recarga la tabla de inmediato
                } else {
                    const errorData = await respuesta.json();
                    alert(errorData.error || 'No se pudo eliminar el usuario');
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
            }
        };

    return (
        <div className="dashboard-content">
            <div className="dashboard-header-actions" style={{ marginBottom: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Directorio de Personal</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Usuarios con acceso al sistema ITSM</p>
                </div>
                <div>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
                        Volver al Dashboard
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/nuevo-usuario')}>
                        + Registrar Usuario
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="jira-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo Electrónico</th>
                            <th>Departamento</th>
                            <th>Rol en el Sistema</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length > 0 ? (
                            usuarios.map((u) => (
                                <tr key={u.id}>
                                    <td className="td-resumen" style={{ fontWeight: '600' }}>{u.nombre}</td>
                                    <td>{u.email}</td>
                                    <td>{u.departamento || 'No asignado'}</td>
                                    <td>
                                        <span className={`status-chip ${u.rol === 'admin' ? 'status-resuelto' : 'status-en-proceso'}`}>
                                            {u.rol ? u.rol.toUpperCase() : 'EMPLEADO'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button 
                                            onClick={() => navigate(`/editar-usuario/${u.id}`)}
                                            style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '12px', fontWeight: 'bold' }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => eliminarUsuario(u.id, u.nombre)}
                                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="td-empty">No hay usuarios registrados en el sistema.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}