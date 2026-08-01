import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoKrystal from '../assets/Logo-1.png';
import fondoHotel from '../assets/fondo.jpg';
import './styles/Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('https://helpdesk-krystal.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Error en el servidor. Verifica la ruta o el estado del backend.");
            }

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('rol', data.rol);
                localStorage.setItem('nombre', data.nombre || username);
                navigate('/dashboard');
            } else {
                setError(data.mensaje || 'Credenciales incorrectas');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            setError(err.message || 'No se pudo conectar con el servidor.');
        }
    };

    return (
        <div 
            className="login-container-wrapper"
            style={{
                backgroundImage: `url(${fondoHotel})`,
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
                position: 'relative',
                width: '100%'
            }}
        >
            <section className="login-box">
                <img src={logoKrystal} alt="Logo Krystal Grand" className="logo" />
                <h1>Krystal Grand</h1>
                
                {error && <div className="error-mensaje">{error}</div>}

                <form onSubmit={handleLogin}>
                    <p>Username</p>
                    <input 
                        type="text" 
                        name="username" 
                        placeholder="Enter Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    
                    <p>Password</p>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Enter Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    <input type="submit" name="submit" value="Login" />
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contacte al administrador de sistemas."); }}>
                        Forget Password
                    </a>
                </form>
            </section>
        </div>
    );
}