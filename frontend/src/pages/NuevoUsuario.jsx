import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NuevoUsuario() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        departamento: '',
        rol: 'empleado' // Por defecto, creamos empleados/jefes de área
    });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    // Verificamos por seguridad que solo Sistemas esté en esta pantalla
    const rolUsuario = localStorage.getItem('rol');
    if (rolUsuario !== 'admin') {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#de350b' }}>Acceso Denegado. Solo Sistemas puede ver esto.</div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        try {
            const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/usuarios/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (respuesta.ok) {
                setMensaje('Usuario creado exitosamente.');
                setFormData({ nombre: '', email: '', password: '', departamento: '', rol: 'empleado' });
            } else {
                const errorData = await respuesta.json();
                setError(errorData.error || 'Error al crear usuario.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="dashboard-content" style={{ maxWidth: '500px', margin: '40px auto' }}>
            <div className="table-container" style={{ padding: '32px' }}>
                <h2 style={{ marginBottom: '8px', color: '#172b4d' }}>Registrar Nuevo Personal</h2>
                <p style={{ color: '#6b778c', fontSize: '14px', marginBottom: '24px' }}>
                    Da de alta a los Jefes de Área para que puedan reportar incidentes.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>Nombre Completo</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="search-input" style={{ width: '100%' }} required />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>Correo Electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="search-input" style={{ width: '100%' }} required />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>Contraseña Temporal</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="search-input" style={{ width: '100%' }} required />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>Departamento</label>
                        <input type="text" name="departamento" value={formData.departamento} onChange={handleChange} className="search-input" style={{ width: '100%' }} placeholder="Ej. Recepción, Restaurante..." required />
                    </div>

                    {mensaje && <div style={{ color: '#006644', background: '#e3fcef', padding: '10px', borderRadius: '4px' }}>✅ {mensaje}</div>}
                    {error && <div style={{ color: '#de350b', background: '#ffebe6', padding: '10px', borderRadius: '4px' }}>⚠️ {error}</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} style={{ padding: '10px 16px', border: 'none', background: 'transparent', color: '#42526e', fontWeight: '600', cursor: 'pointer' }}>
                            Volver al Dashboard
                        </button>
                        <button type="submit" className="btn-primary">
                            Registrar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}