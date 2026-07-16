const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth'); 

// 1. OBTENER LOS COMENTARIOS DE UN TICKET (GET /api/comentarios/:reporte_id)
router.get('/:reporte_id', verificarToken, (req, res) => {
    const { reporte_id } = req.params;
    
    // Usamos el nombre exacto de tu columna 'fecha' para ordenarlos del más viejo al más nuevo
    const query = 'SELECT * FROM comentarios WHERE reporte_id = ? ORDER BY fecha ASC';

    db.query(query, [reporte_id], (err, results) => {
        if (err) {
            console.error('Error al obtener comentarios:', err);
            return res.status(500).json({ error: 'Error al cargar el historial de notas' });
        }
        res.json(results);
    });
});

// 2. CREAR UN NUEVO COMENTARIO (POST /api/comentarios/:reporte_id)
router.post('/:reporte_id', verificarToken, (req, res) => {
    const { reporte_id } = req.params;
    const { comentario } = req.body; // El texto que escribas en React

    // Extraemos quién eres directamente de tu inicio de sesión
    const autor = req.usuario.nombre || req.usuario.email || 'Usuario Desconocido';
    const rol = req.usuario.rol || 'Usuario';

    // Insertamos respetando las columnas exactas de tu tabla
    const query = 'INSERT INTO comentarios (reporte_id, autor, rol, comentario) VALUES (?, ?, ?, ?)';

    db.query(query, [reporte_id, autor, rol, comentario], (err, results) => {
        if (err) {
            console.error('Error al guardar comentario:', err);
            return res.status(500).json({ error: 'Error al guardar en la base de datos' });
        }
        
        // Devolvemos los datos para que React los pinte instantáneamente en pantalla
        res.status(201).json({ 
            mensaje: 'Comentario guardado exitosamente', 
            id: results.insertId,
            autor,
            rol,
            comentario,
            fecha: new Date()
        });
    });
});

module.exports = router;