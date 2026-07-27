import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';

export default function ListaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const navigate = useNavigate();
    
    // Verificamos que solo Sistemas pueda estar aquí
    const rolUsuario = localStorage.getItem('rol');

    useEffect(() => {
        // Si alguien que no es admin intenta entrar, lo pateamos al dashboard
        if (rolUsuario !== 'admin') {
            navigate('/dashboard');
            return;
        }

        const fetchUsuarios = async () => {
            try {
                const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/usuarios');
                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    setUsuarios(datos);
                }
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
            }
        };
        
        fetchUsuarios();
    }, [navigate, rolUsuario]);

    // Si no es admin, no renderizamos nada (por seguridad)
    if (rolUsuario !== 'admin') return null;

    return (
        <div className="dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="dashboard-header-actions" style={{ justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ color: '#172b4d', margin: 0 }}>Directorio de Personal</h2>
                    <p style={{ color: '#6b778c', margin: '8px 0 0 0', fontSize: '14px' }}>
                        Usuarios con acceso al sistema ITSM
                    </p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                    Volver al Dashboard
                </button>
            </div>

            <div className="table-container">
                <table className="jira-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo Electrónico</th>
                            <th>Departamento</th>
                            <th>Rol en el Sistema</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(user => (
                            <tr key={user.id}>
                                <td className="td-resumen">{user.nombre}</td>
                                <td>{user.email}</td>
                                <td>{user.departamento}</td>
                                <td>
                                    <span className="status-chip" style={{
                                        background: user.rol === 'admin' ? '#ffebe6' : '#e3fcef',
                                        color: user.rol === 'admin' ? '#de350b' : '#006644'
                                    }}>
                                        {user.rol.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {usuarios.length === 0 && (
                            <tr>
                                <td colSpan="4" className="td-empty">No hay usuarios registrados aún.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}