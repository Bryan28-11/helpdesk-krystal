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
router.get('/:reporte_id', verificarToken, (req, res) => {
    const { reporte_id } = req.params;

    // Traemos los comentarios y los unimos con la tabla Usuarios para saber quién lo escribió
    const query = `
        SELECT c.*, u.nombre AS autor, u.rol 
        FROM comentarios c 
        JOIN usuarios u ON c.usuario_id = u.id 
        WHERE c.reporte_id = ? 
        ORDER BY c.fecha ASC
    `;

    db.query(query, [reporte_id], (err, results) => {
        if (err) {
            console.error('Error al obtener comentarios:', err);
            return res.status(500).json({ error: 'Error al consultar la bitácora' });
        }
        res.json(results);
    });
});

module.exports = router;