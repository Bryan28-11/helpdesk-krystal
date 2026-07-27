const express = require('express');
const router = express.Router();
const db = require('../db'); // Tu conexión a HostGator

// Obtener los dispositivos (Todos o por departamento)
router.get('/', (req, res) => {
    const { departamento } = req.query; // Leemos si el frontend nos pide un departamento específico
    
    let sql = 'SELECT * FROM dispositivos';
    let params = [];

    // Si nos envían un departamento, filtramos la búsqueda
    if (departamento) {
        sql += ' WHERE departamento = ?';
        params.push(departamento);
    }

    db.query(sql, params, (err, resultados) => {
        if (err) {
            console.error('Error al obtener el inventario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(resultados);
    });
});

module.exports = router;