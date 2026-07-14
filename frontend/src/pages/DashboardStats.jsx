import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardStats() {
    const [stats, setStats] = useState({ urgencia: [], departamento: [] });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerEstadisticas = async () => {
            try {
                const token = localStorage.getItem('token'); // Recuperamos tu token de sesión
                const respuesta = await fetch('https://helpdesk-krystal.onrender.com/api/reportes/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    setStats(datos);
                }
            } catch (error) {
                console.error("Error al conectar con el endpoint de estadísticas", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerEstadisticas();
    }, []);

    // Colores premium para la gráfica de urgencias
    const COLORES = {
        'Alta': '#EF4444',   // Rojo
        'Media': '#F59E0B',  // Amarillo/Naranja
        'Baja': '#10B981'    // Verde
    };

    if (cargando) return <div className="text-center p-5 text-white">Cargando métricas del hotel...</div>;

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">Panel de Control Metas e Indicadores</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Gráfica de Barras - Departamentos */}
                <div className="bg-gray-850 p-6 rounded-xl shadow-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Reportes por Departamento</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.departamento}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                <XAxis dataKey="departamento" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }} />
                                <Legend />
                                <Bar dataKey="total" name="Tickets" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfica de Dona - Urgencia */}
                <div className="bg-gray-850 p-6 rounded-xl shadow-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Distribución por Prioridad</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.urgencia}
                                    dataKey="total"
                                    nameKey="urgencia"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    label
                                >
                                    {stats.urgencia.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORES[entry.urgencia] || '#6B7280'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}