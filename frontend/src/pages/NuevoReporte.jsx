import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/NuevoReporte.css'; // Conectamos el diseño

export default function NuevoReporte() {
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState({
        departamento: '',
        equipo_afectado: '',
        urgencia: 'Baja',
        descripcion: ''
    });
    const [cargando, setCargando] = useState(false);

    // Actualiza los datos conforme el usuario escribe
    const handleChange = (e) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        });
    };

    // Envía los datos al servidor
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formulario)
            });

            if (respuesta.ok) {
                // Si todo sale bien, lo mandamos de regreso a la cola de trabajo
                navigate('/dashboard');
            } else {
                alert('Hubo un error al crear el reporte.');
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h1>Crear Incidente</h1>
                <p>Levanta un nuevo ticket de soporte para el equipo de sistemas.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Departamento / Área Afectada</label>
                    <select 
                        name="departamento" 
                        className="form-control"
                        value={formulario.departamento}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un departamento...</option>
                        <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                        <option value="Recepción">Recepción</option>
                        <option value="Ama de Llaves">Ama de Llaves</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                        <option value="Sistemas">Sistemas</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Equipo en Falla (Resumen)</label>
                    <input 
                        type="text" 
                        name="equipo_afectado" 
                        className="form-control"
                        placeholder="Ej. Impresora HP, Terminal Punto de Venta, Router..."
                        value={formulario.equipo_afectado}
                        onChange={handleChange}
                        required
                        autoComplete="off"
                    />
                </div>

                <div className="form-group">
                    <label>Prioridad</label>
                    <select 
                        name="urgencia" 
                        className="form-control"
                        value={formulario.urgencia}
                        onChange={handleChange}
                    >
                        <option value="Baja">↓ Baja (Afectación menor)</option>
                        <option value="Media">→ Media (Trabajo parcialmente afectado)</option>
                        <option value="Alta">↑ Alta (Operación detenida)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Descripción detallada</label>
                    <textarea 
                        name="descripcion" 
                        className="form-control"
                        placeholder="Describe el comportamiento del equipo, mensajes de error o cualquier detalle útil..."
                        value={formulario.descripcion}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Crear ticket'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}