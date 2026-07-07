import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DetalleReporte = () => {
    const { id } = useParams(); // Obtenemos el ID del reporte desde la URL
    const navigate = useNavigate();
    
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Cargar los comentarios de este ticket
    const cargarComentarios = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/comentarios/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setComentarios(data);
            }
        } catch (err) {
            console.error('Error al cargar comentarios:', err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }
        
        cargarComentarios();
    }, [id, navigate]);

    // Función para cambiar el estado del ticket (PUT)
    const handleCambiarEstado = async (nuevoEstado) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/reportes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            const data = await response.json();
            if (response.ok) {
                setMensaje(data.mensaje);
                setEstado(nuevoEstado);
                // Recargamos comentarios porque el backend genera un historial si es necesario
                cargarComentarios(); 
                setTimeout(() => setMensaje(''), 3000);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Error al actualizar el estado.');
        }
    };

    // Función para enviar un comentario nuevo (POST)
    const handleEnviarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/api/comentarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reporte_id: id, comentario: nuevoComentario })
            });

            if (response.ok) {
                setNuevoComentario('');
                cargarComentarios(); // Recargamos la lista para ver el mensaje nuevo
            } else {
                const data = await response.json();
                setError(data.error);
            }
        } catch (err) {
            setError('Error al enviar el comentario.');
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
            <button 
                onClick={() => navigate('/dashboard')} 
                style={{ marginBottom: '20px', padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                ← Volver al Panel
            </button>

            <h2>Gestión de Ticket Folio: #{id}</h2>

            {/* Zona de Acciones de Administrador (Cambiar Estado) */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                <span style={{ fontWeight: 'bold', marginRight: '15px' }}>Actualizar Estado:</span>
                <button onClick={() => handleCambiarEstado('Abierto')} style={{ marginRight: '10px', padding: '6px 12px', backgroundColor: '#f8d7da', color: '#721c24', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Abierto</button>
                <button onClick={() => handleCambiarEstado('En Proceso')} style={{ marginRight: '10px', padding: '6px 12px', backgroundColor: '#fff3cd', color: '#856404', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>En Proceso</button>
                <button onClick={() => handleCambiarEstado('Resuelto')} style={{ padding: '6px 12px', backgroundColor: '#d4edda', color: '#155724', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Resuelto</button>
            </div>

            {mensaje && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Sección de la Bitácora de Comentarios */}
            <h3>Bitácora de Seguimiento</h3>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', height: '300px', overflowY: 'auto', backgroundColor: '#fff', marginBottom: '20px' }}>
                {comentarios.length === 0 ? (
                    <p style={{ color: 'gray', textAlign: 'center', marginTop: '100px' }}>No hay mensajes en este ticket aún.</p>
                ) : (
                    comentarios.map((c) => (
                        <div key={c.id} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #f1f1f1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                                <span><strong style={{ color: '#005b96' }}>{c.autor}</strong> ({c.rol})</span>
                                <span>{new Date(c.fecha).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>{c.comentario}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Formulario para agregar un nuevo comentario */}
            <form onSubmit={handleEnviarComentario} style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Escribe un mensaje o actualización sobre el equipo..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    required
                    style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }}
                />
                <button 
                    type="submit" 
                    style={{ padding: '12px 20px', backgroundColor: '#005b96', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default DetalleReporte;