import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BuscadorGlobal({ isOpen, onClose }) {
    const [termino, setTermino] = useState('');
    const [resultadosReportes, setResultadosReportes] = useState([]);
    const [resultadosUsuarios, setResultadosUsuarios] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!termino.trim()) {
            setResultadosReportes([]);
            setResultadosUsuarios([]);
            return;
        }

        const buscarGlobal = async () => {
            const token = localStorage.getItem('token');
            try {
                // Buscamos en reportes
                const resRep = await fetch('https://helpdesk-krystal.onrender.com/api/reportes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resRep.ok) {
                    const data = await resRep.json();
                    const filtrados = data.filter(r => 
                        r.equipo_afectado.toLowerCase().includes(termino.toLowerCase()) ||
                        r.departamento.toLowerCase().includes(termino.toLowerCase()) ||
                        r.id.toString().includes(termino) ||
                        (r.reportado_por && r.reportado_por.toLowerCase().includes(termino.toLowerCase()))
                    );
                    setResultadosReportes(filtrados.slice(0, 5)); // Top 5
                }

                // Buscamos en usuarios (si es admin)
                if (localStorage.getItem('rol') === 'admin') {
                    const resUsu = await fetch('https://helpdesk-krystal.onrender.com/api/usuarios', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resUsu.ok) {
                        const dataUsu = await resUsu.json();
                        const filtradosUsu = dataUsu.filter(u =>
                            u.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                            u.email.toLowerCase().includes(termino.toLowerCase()) ||
                            u.departamento.toLowerCase().includes(termino.toLowerCase())
                        );
                        setResultadosUsuarios(filtradosUsu.slice(0, 5));
                    }
                }
            } catch (error) {
                console.error('Error en búsqueda global:', error);
            }
        };

        const delay = setTimeout(buscarGlobal, 300); // Debounce de 300ms
        return () => clearTimeout(delay);
    }, [termino]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '80px', zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: '#fff', width: '600px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                overflow: 'hidden', border: '1px solid #e2e8f0'
            }} onClick={(e) => e.stopPropagation()}>
                
                {/* Input de búsqueda */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', marginRight: '10px' }}></span>
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="Busca un ticket (ej. ITSM-4), equipo, departamento o persona..."
                        value={termino}
                        onChange={(e) => setTermino(e.target.value)}
                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', color: '#1e293b' }}
                    />
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>✕</button>
                </div>

                {/* Contenedor de resultados */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
                    {termino.trim() === '' ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>Escribe algo para comenzar la búsqueda global...</p>
                    ) : (
                        <>
                            {/* Resultados de Reportes */}
                            {resultadosReportes.length > 0 && (
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', padding: '4px 8px' }}>Incidentes / Tickets</div>
                                    {resultadosReportes.map(r => (
                                        <div key={r.id} onClick={() => { navigate(`/reporte/${r.id}`); onClose(); }} style={{
                                            padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'background 0.2s'
                                        }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <div>
                                                <strong style={{ color: '#0052cc' }}>ITSM-{r.id}</strong> — <span style={{ color: '#334155' }}>{r.equipo_afectado}</span>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>Depto: {r.departamento} | Solicitante: {r.reportado_por}</div>
                                            </div>
                                            <span className={`status-chip ${r.estado === 'Resuelto' ? 'status-resuelto' : 'status-en-proceso'}`} style={{ fontSize: '10px' }}>{r.estado}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Resultados de Usuarios */}
                            {resultadosUsuarios.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', padding: '4px 8px' }}>Personal / Usuarios</div>
                                    {resultadosUsuarios.map(u => (
                                        <div key={u.id} onClick={() => { navigate('/usuarios'); onClose(); }} style={{
                                            padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <div>
                                                <strong style={{ color: '#1e293b' }}>{u.nombre}</strong>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email} — Depto: {u.departamento}</div>
                                            </div>
                                            <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>{u.rol}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {resultadosReportes.length === 0 && resultadosUsuarios.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '14px' }}>No se encontraron coincidencias para "{termino}".</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}