import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';

const Login = () => {
    // Estas variables guardarán lo que el usuario escriba
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Esta herramienta nos permite cambiar de página
    const navigate = useNavigate();

    // Función que se ejecuta al presionar "Entrar"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        setError(''); // Limpiamos errores anteriores

        try {
            // Hacemos la petición a nuestra API (Backend)
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Si la contraseña es correcta, guardamos el Token en el navegador
                localStorage.setItem('token', data.token);
                // Redirigimos al usuario al panel de reportes
                navigate('/dashboard');
            } else {
                // Si hay error (contraseña incorrecta, usuario no existe)
                setError(data.error);
            }
        } catch (err) {
            setError('Error al conectar con el servidor. Revisa que el backend esté encendido.');
        }
    };

   return (
        <div className="login-container">
            <h2>Helpdesk Krystal Grand</h2>
            <p className="login-subtitle">Inicia sesión en tu cuenta</p>
            
            <form onSubmit={handleSubmit} className="login-form">
                <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-input"
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                />
                <button type="submit" className="login-button">
                    Entrar
                </button>
            </form>

            {error && <p className="login-error">{error}</p>}
        </div>
    );
};

export default Login;
