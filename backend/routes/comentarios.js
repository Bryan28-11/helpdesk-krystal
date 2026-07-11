const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

// Ruta para agregar un comentario a un reporte (POST /api/comentarios)
router.post('/', verificarToken, (req, res) => {
    const { reporte_id, comentario } = req.body;
    const usuario_id = req.usuario.id; // Quién lo escribe (lo sacamos del token)

    const query = 'INSERT INTO comentarios (reporte_id, usuario_id, comentario) VALUES (?, ?, ?)';

    db.query(query, [reporte_id, usuario_id, comentario], (err, results) => {
        if (err) {
            console.error('Error al guardar comentario:', err);
            return res.status(500).json({ error: 'No se pudo guardar tu mensaje' });
        }
        res.status(201).json({ mensaje: 'Comentario agregado a la bitácora' });
    });
});

// Ruta para ver los comentarios de un reporte específico (GET /api/comentarios/:reporte_id)
// Ruta para obtener los comentarios de un reporte específico
router.get('/:id', verificarToken, (req, res) => {
    const reporteId = req.params.id;
    
    // Consulta limpia apuntando a la tabla en minúsculas
    const query = `SELECT * FROM comentarios WHERE reporte_id = ? ORDER BY fecha ASC`;
    
    db.query(query, [reporteId], (err, results) => {
        if (err) {
            console.error('Error al obtener comentarios:', err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});

// Ruta para agregar un nuevo comentario
router.post('/', verificarToken, (req, res) => {
    const { reporte_id, comentario } = req.body;
    
    // Sacamos quién lo escribe directamente del token
    const autor = req.usuario.nombre || req.usuario.email || String(req.usuario.id);
    const rol = req.usuario.rol || 'empleado';

    // Usamos las columnas exactas que creamos en HostGator: autor y rol
    const query = `
        INSERT INTO comentarios (reporte_id, autor, rol, comentario) 
        VALUES (?, ?, ?, ?)
    `;
    
    db.query(query, [reporte_id, autor, rol, comentario], (err, results) => {
        if (err) {
            console.error('Error al guardar el comentario:', err);
            return res.status(500).json({ error: 'Error al guardar en la base de datos' });
        }
        res.status(201).json({ mensaje: 'Comentario agregado exitosamente' });
    });
});

module.exports = router;