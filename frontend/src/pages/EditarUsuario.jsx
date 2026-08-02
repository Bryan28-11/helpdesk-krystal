import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './styles/Dashboard.css';

export default function EditarUsuario() {
    const { id } = useParams(); // Captura el ID desde la URL (/editar-usuario/:id)
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [rol, setRol] = useState('empleado');
    const [password, setPassword] = useState(''); // Opcional si desea cambiarla
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarDatosUsuario = async () => {
            const token = localStorage.getItem('token');
            try {
                // Obtenemos la lista general para filtrar el usuario actual por su ID
                const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/usuarios', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (respuesta.ok) {
                    const lista = await respuesta.json();
                    const usuarioEncontrado = lista.find(u => u.id.toString() === id);
                    if (usuarioEncontrado) {
                        setNombre(usuarioEncontrado.nombre);
                        setEmail(usuarioEncontrado.email);
                        setDepartamento(usuarioEncontrado.departamento || '');
                        setRol(usuarioEncontrado.rol || 'empleado');
                    } else {
                        setError('Usuario no encontrado');
                    }
                }
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('No se pudo conectar con el servidor');
            }
        };
        cargarDatosUsuario();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');

        try {
            const respuesta = await fetch(`https://helpdesk-krystal.onrender.com/api/usuarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre, email, departamento, rol, password })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                alert('¡Usuario actualizado exitosamente!');
                navigate('/usuarios');
            } else {
                setError(data.error || 'Error al actualizar el usuario');
            }
        } catch (err) {
            console.error('Error de red:', err);
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <div className="dashboard-content" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Editar Usuario</h2>
                
                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Nombre Completo:</label>
                        <input 
                            type="text" 
                            className="search-input" 
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Correo Electrónico:</label>
                        <input 
                            type="email" 
                            className="search-input" 
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Departamento:</label>
                        <input 
                            type="text" 
                            className="search-input" 
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={departamento} 
                            onChange={(e) => setDepartamento(e.target.value)} 
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Rol en el Sistema:</label>
                        <select 
                            className="filter-select" 
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={rol} 
                            onChange={(e) => setRol(e.target.value)}
                        >
                            <option value="empleado">Empleado</option>
                            <option value="admin">Administrador (Sistemas)</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Nueva Contraseña (Opcional):</label>
                        <input 
                            type="password" 
                            className="search-input" 
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            placeholder="Dejar en blanco para mantener la actual"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/usuarios')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}