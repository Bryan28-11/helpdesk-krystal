import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NuevoReporte = () => {
    const [departamento, setDepartamento] = useState('');
    const [equipoAfectado, setEquipoAfectado] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [urgencia, setUrgencia] = useState('Media'); // 'Media' por defecto
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Enviamos el token para que el backend sepa quién es
                },
                body: JSON.stringify({
                    departamento,
                    equipo_afectado: equipoAfectado,
                    descripcion,
                    urgencia
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje(`¡Reporte creado con éxito! Folio: #${data.folio_ticket}`);
                // Limpiamos el formulario
                setDepartamento('');
                setEquipoAfectado('');
                setDescripcion('');
                
                // Después de 2 segundos, regresamos automáticamente al panel
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setError(data.error || 'No se pudo guardar el reporte');
            }
        } catch (err) {
            setError('Error al conectar con el servidor.');
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
            <button 
                onClick={() => navigate('/dashboard')} 
                style={{ marginBottom: '20px', padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                ← Volver al Panel
            </button>

            <h2>Levantar Nuevo Reporte de Soporte</h2>
            <p style={{ color: 'gray', marginBottom: '25px' }}>Ingresa los detalles del problema técnico.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Departamento:</label>
                    <input 
                        type="text" 
                        placeholder="Ej. Recepción, Alimentos y Bebidas, Ama de llaves"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Equipo Afectado:</label>
                    <input 
                        type="text" 
                        placeholder="Ej. Impresora de tickets, Computadora central, Teléfono"
                        value={equipoAfectado}
                        onChange={(e) => setEquipoAfectado(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción de la Falla:</label>
                    <textarea 
                        rows="4"
                        placeholder="Describe detalladamente qué pasa con el equipo..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px', resize: 'vertical' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prioridad / Urgencia:</label>
                    <select 
                        value={urgencia}
                        onChange={(e) => setUrgencia(e.target.value)}
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px' }}
                    >
                        <option value="Baja">Baja (No afecta la operación general)</option>
                        <option value="Media">Media (Afecta parcialmente)</option>
                        <option value="Alta">Alta (¡Bloquea la operación / Crítico!)</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    style={{ padding: '12px', backgroundColor: '#005b96', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                    Enviar Reporte
                </button>
            </form>

            {mensaje && <p style={{ color: 'green', marginTop: '15px', fontWeight: 'bold', textAlign: 'center' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
        </div>
    );
};

export default NuevoReporte;