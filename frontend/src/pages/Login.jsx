import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [credenciales, setCredenciales] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credenciales)
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                
                // GUARDAMOS EL TOKEN Y LOS DATOS DEL USUARIO
                localStorage.setItem('token', datos.token);
                localStorage.setItem('nombre', datos.usuario.nombre);
                localStorage.setItem('departamento', datos.usuario.departamento);
                localStorage.setItem('rol', datos.usuario.rol);
                
                // Redirigimos al panel principal
                navigate('/dashboard');
            } else {
                const errorData = await respuesta.json();
                setError(errorData.error || 'Credenciales incorrectas.');
            }
        } catch (error) {
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f5f7' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#172b4d' }}>Krystal Grand ITSM</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '4px' }}>
                            Correo Electrónico
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            value={credenciales.email} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '10px', border: '2px solid #dfe1e6', borderRadius: '4px', outline: 'none' }} 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '4px' }}>
                            Contraseña
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            value={credenciales.password} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '10px', border: '2px solid #dfe1e6', borderRadius: '4px', outline: 'none' }} 
                        />
                    </div>
                    
                    {error && (
                        <div style={{ color: '#de350b', fontSize: '14px', background: '#ffebe6', padding: '10px', borderRadius: '4px', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={cargando} 
                        style={{ background: '#0052cc', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}
                    >
                        {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}