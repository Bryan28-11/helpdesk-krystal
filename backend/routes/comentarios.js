const express = require('express');
const router = express.Router();
const db = require('../db');

// OBTENER TODOS LOS COMENTARIOS DE UN TICKET
router.get('/:reporteId', (req, res) => {
    const sql = 'SELECT * FROM comentarios WHERE reporte_id = ? ORDER BY fecha ASC';
    db.query(sql, [req.params.reporteId], (err, resultados) => {
        if (err) {
            console.error('Error al obtener bitácora:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json(resultados);
    });
});

// AGREGAR UN NUEVO COMENTARIO CON EVIDENCIA
router.post('/', (req, res) => {
    // Ajustado para recibir "autor" y "rol" como en tu base de datos
    const { reporte_id, autor, rol, comentario, evidencia } = req.body;

    if (!reporte_id || !comentario) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const sql = 'INSERT INTO comentarios (reporte_id, autor, rol, comentario, evidencia) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [reporte_id, autor, rol || 'admin', comentario, evidencia || null], (err, result) => {
        if (err) {
            console.error('Error al guardar comentario:', err);
            return res.status(500).json({ error: 'Error al guardar en BD' });
        }
        res.status(201).json({ mensaje: 'Bitácora actualizada exitosamente' });
    });
});

module.exports = router;