import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css'; // Reutilizamos los estilos corporativos

export default function NuevoReporte() {
    const navigate = useNavigate();
    const [dispositivos, setDispositivos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // El nuevo estado adaptado a la CMDB
    const [formData, setFormData] = useState({
        dispositivo_id: '',
        descripcion: '',
        urgencia: 'Media',
        reportado_por: '' // Más adelante, el Login llenará esto automáticamente
    });

    // 1. DESCARGAMOS EL INVENTARIO AL ABRIR LA PANTALLA
    useEffect(() => {
        const fetchDispositivos = async () => {
            // Por ahora traemos todos. Cuando hagamos el Login, aquí filtraremos por departamento.
            try {
                const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/dispositivos');
                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    setDispositivos(datos);
                }
            } catch (error) {
                console.error('Error al cargar inventario:', error);
            }
        };
        fetchDispositivos();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        if (!formData.dispositivo_id) {
            setError('Por favor, selecciona un equipo del inventario.');
            setCargando(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (respuesta.ok) {
                // Si todo sale bien, regresamos a la cola de trabajo
                navigate('/dashboard');
            } else {
                setError('Hubo un error al generar el ticket.');
            }
        } catch (error) {
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="dashboard-content" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="table-container" style={{ padding: '32px' }}>
                <h2 style={{ marginBottom: '8px', color: '#172b4d' }}>Reportar Incidente</h2>
                <p style={{ color: '#6b778c', fontSize: '14px', marginBottom: '24px' }}>
                    Selecciona el equipo afectado de tu departamento para que Sistemas pueda atenderlo.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* NUEVO SELECTOR DE DISPOSITIVOS (CMDB) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>
                            Equipo o Dispositivo afectado *
                        </label>
                        <select 
                            name="dispositivo_id" 
                            value={formData.dispositivo_id} 
                            onChange={handleChange}
                            className="search-input"
                            style={{ width: '100%', background: '#fafbfc' }}
                            required
                        >
                            <option value="">-- Selecciona un equipo del inventario --</option>
                            {dispositivos.map(equipo => (
                                <option key={equipo.id} value={equipo.id}>
                                    {equipo.nombre} (Serie: {equipo.numero_serie}) - {equipo.departamento}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>
                            Descripción detallada de la falla *
                        </label>
                        <textarea 
                            name="descripcion" 
                            value={formData.descripcion} 
                            onChange={handleChange}
                            className="search-input"
                            style={{ width: '100%', minHeight: '100px', resize: 'vertical', background: '#fafbfc' }}
                            placeholder="Ej. La pantalla parpadea al encender el equipo..."
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>
                                Nivel de Urgencia
                            </label>
                            <select 
                                name="urgencia" 
                                value={formData.urgencia} 
                                onChange={handleChange}
                                className="filter-select"
                                style={{ width: '100%' }}
                            >
                                <option value="Baja">Baja (No afecta la operación)</option>
                                <option value="Media">Media (Afecta parcialmente)</option>
                                <option value="Alta">Alta (Operación detenida)</option>
                            </select>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#42526e', marginBottom: '8px' }}>
                                Tu Nombre *
                            </label>
                            <input 
                                type="text" 
                                name="reportado_por" 
                                value={formData.reportado_por} 
                                onChange={handleChange}
                                className="search-input"
                                style={{ width: '100%' }}
                                placeholder="Ej. Juan Pérez"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: '#ffebe6', color: '#de350b', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} style={{ padding: '10px 16px', border: 'none', background: 'transparent', color: '#42526e', fontWeight: '600', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={cargando}>
                            {cargando ? 'Generando ticket...' : 'Crear Incidente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}