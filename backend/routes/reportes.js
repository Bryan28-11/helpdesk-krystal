const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// 1. OBTENER REPORTES (AHORA CON JOIN A LA CMDB)
// ==========================================
router.get('/', (req, res) => {
    // Usamos JOIN para mezclar la tabla de reportes con la de dispositivos
    const sql = `
        SELECT 
            r.id, 
            r.descripcion, 
            r.urgencia, 
            r.estado, 
            r.reportado_por, 
            r.fecha_reporte,
            r.dispositivo_id,
            d.nombre AS equipo_afectado, 
            d.departamento
        FROM reportes r
        JOIN dispositivos d ON r.dispositivo_id = d.id
        ORDER BY r.fecha_reporte DESC
    `;
    
    db.query(sql, (err, resultados) => {
        if (err) {
            console.error('Error al obtener reportes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(resultados);
    });
});

// ==========================================
// 2. CREAR UN NUEVO REPORTE 
// ==========================================
router.post('/', (req, res) => {
    const { dispositivo_id, descripcion, urgencia, reportado_por } = req.body;

    if (!dispositivo_id || !descripcion || !reportado_por) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Le agregamos explícitamente la columna "estado" y el valor 'Abierto'
    const sql = `
        INSERT INTO reportes (dispositivo_id, descripcion, urgencia, reportado_por, estado) 
        VALUES (?, ?, ?, ?, 'Abierto')
    `;

    // Convertimos el dispositivo_id a Número por seguridad para MySQL
    db.query(sql, [Number(dispositivo_id), descripcion, urgencia || 'Media', reportado_por], (err, resultado) => {
        if (err) {
            console.error('Error SQL al crear reporte:', err);
            return res.status(500).json({ error: 'Error al guardar el reporte en la base de datos' });
        }
        res.status(201).json({ 
            mensaje: 'Reporte creado exitosamente',
            id: resultado.insertId 
        });
    });
});

// ==========================================
// 3. ACTUALIZAR EL ESTADO DEL REPORTE
// ==========================================
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const sql = 'UPDATE reportes SET estado = ? WHERE id = ?';
    db.query(sql, [estado, id], (err, resultado) => {
        if (err) {
            console.error("Error al actualizar estado:", err);
            return res.status(500).json({ error: 'Error al actualizar' });
        }
        res.json({ mensaje: 'Estado actualizado correctamente' });
    });
});

module.exports = router;