import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DetalleReporte() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [reporte, setReporte] = useState(null);
    const [estadoActual, setEstadoActual] = useState('');
    const [cargando, setCargando] = useState(true);

    // 1. Cargar los datos del ticket al abrir la pantalla
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                // Traemos los reportes del backend en Render
                const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    // Buscamos exactamente el ticket al que le dimos clic
                    const ticket = datos.find(r => String(r.id) === String(id));
                    setReporte(ticket);
                    setEstadoActual(ticket?.estado || 'Abierto');
                }
            } catch (error) {
                console.error("Error al obtener los detalles:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, [id]);

    // 2. Función para guardar el nuevo estado en la base de datos
    const cambiarEstado = async (nuevoEstado) => {
        setEstadoActual(nuevoEstado); // Cambio de color visual instantáneo
        
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://helpdesk-krystal.onrender.com/api/reportes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            // Más adelante aquí conectaremos la notificación flotante (Punto 3)
        } catch (error) {
            console.error("Error al actualizar la base de datos:", error);
        }
    };

    // 3. Diccionario de colores según la urgencia de la etiqueta
    const obtenerColorBadge = (estado) => {
        switch(estado) {
            case 'Abierto': 
                return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'En Proceso': 
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'Resuelto': 
                return 'bg-green-500/20 text-green-400 border-green-500/50';
            default: 
                return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    // Pantalla de carga mientras trae los datos
    if (cargando) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-400 font-bold text-xl animate-pulse">Cargando expediente...</div>;
    if (!reporte) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">Reporte no encontrado en la base de datos.</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white flex justify-center">
            <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden h-fit">
                
                {/* ENCABEZADO INTERACTIVO */}
                <div className="p-6 border-b border-gray-700 bg-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-blue-400 tracking-tight">Ticket #{reporte.id}</h1>
                        <p className="text-gray-400 text-sm mt-1">Levantado por: <span className="text-gray-200 font-medium">{reporte.reportado_por}</span></p>
                    </div>
                    
                    {/* SELECTOR DE ESTADO */}
                    <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-700 shadow-inner">
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold ml-2">Fase:</span>
                        <select 
                            value={estadoActual}
                            onChange={(e) => cambiarEstado(e.target.value)}
                            className={`font-bold border rounded-lg px-4 py-2 outline-none appearance-none cursor-pointer transition-all ${obtenerColorBadge(estadoActual)} hover:brightness-125`}
                        >
                            <option value="Abierto" className="bg-gray-900 text-red-400">🔴 Abierto</option>
                            <option value="En Proceso" className="bg-gray-900 text-yellow-400">🟡 En Proceso</option>
                            <option value="Resuelto" className="bg-gray-900 text-green-400">🟢 Resuelto</option>
                        </select>
                    </div>
                </div>

                {/* CUERPO DEL REPORTE */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800/50">
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-sm">
                        <h3 className="text-blue-500 text-xs uppercase tracking-widest font-bold mb-2">Departamento Afectado</h3>
                        <p className="font-medium text-xl text-gray-200">{reporte.departamento}</p>
                    </div>
                    
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-sm">
                        <h3 className="text-blue-500 text-xs uppercase tracking-widest font-bold mb-2">Equipo en Falla</h3>
                        <p className="font-medium text-xl text-gray-200">{reporte.equipo_afectado}</p>
                    </div>
                    
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-sm md:col-span-2">
                        <h3 className="text-blue-500 text-xs uppercase tracking-widest font-bold mb-3">Descripción del Problema</h3>
                        <p className="font-medium text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                            {reporte.descripcion}
                        </p>
                    </div>
                </div>
                
                {/* BARRA INFERIOR DE ACCIÓN */}
                <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-end">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold shadow-md border border-gray-600"
                    >
                        ← Regresar al Panel
                    </button>
                </div>
            </div>
        </div>
    );
}