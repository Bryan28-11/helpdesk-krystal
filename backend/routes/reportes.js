const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth'); // Importamos a nuestro guardia

// 1. PRIMERO LA RUTA DE ESTADÍSTICAS (Hasta arriba para que no haya error 404)
router.get('/dashboard/stats', verificarToken, (req, res) => {
    // Consulta 1: Contar reportes por nivel de urgencia
    const queryUrgencia = `SELECT urgencia, COUNT(*) as total FROM reportes GROUP BY urgencia`;

    db.query(queryUrgencia, (err, urgenciaResults) => {
        if (err) {
            console.error('Error en stats de urgencia:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }

        // Consulta 2: Contar reportes por departamento
        const queryDepartamento = `SELECT departamento, COUNT(*) as total FROM reportes GROUP BY departamento`;

        db.query(queryDepartamento, (err, deptoResults) => {
            if (err) {
                console.error('Error en stats de departamento:', err);
                return res.status(500).json({ error: 'Error al obtener estadísticas' });
            }

            // Enviamos ambos resultados agrupados en un solo objeto JSON
            res.json({
                urgencia: urgenciaResults,
                departamento: deptoResults
            });
        });
    });
});

// 2. RUTA PARA CREAR UN NUEVO REPORTE (POST /api/reportes)
router.post('/', verificarToken, (req, res) => {
    const { departamento, equipo_afectado, descripcion, urgencia } = req.body;
    
    const reportado_por = req.usuario.nombre || req.usuario.email || String(req.usuario.id);

    const query = `
        INSERT INTO reportes 
        (departamento, equipo_afectado, descripcion, urgencia, reportado_por) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const parametros = [departamento, equipo_afectado, descripcion, urgencia, reportado_por];

    db.query(query, parametros, (err, results) => {
        if (err) {
            console.error('Error al crear el reporte:', err);
            return res.status(500).json({ error: 'Error al guardar en la base de datos' });
        }
        res.status(201).json({ mensaje: 'Reporte creado exitosamente', id: results.insertId });
    });
});

// 3. RUTA PARA OBTENER LOS REPORTES (GET /api/reportes)
router.get('/', verificarToken, (req, res) => {
    const { id, rol, nombre } = req.usuario; 

    let query = '';
    let parametros = [];

    if (rol === 'admin') {
        query = `SELECT * FROM reportes ORDER BY fecha_reporte DESC`;
    } else {
        query = `SELECT * FROM reportes WHERE reportado_por = ? ORDER BY fecha_reporte DESC`;
        parametros = [nombre || id]; 
    }

    db.query(query, parametros, (err, results) => {
        if (err) {
            console.error('Error al obtener los reportes:', err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results); 
    });
});

// 4. RUTA PARA ACTUALIZAR EL ESTADO DE UN REPORTE (PUT /api/reportes/:id)
router.put('/:id', verificarToken, (req, res) => {
    const { id } = req.params; 
    const { estado } = req.body; 

    if (!['Abierto', 'En Proceso', 'Resuelto'].includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido. Usa: Abierto, En Proceso o Resuelto' });
    }

    // Tabla en minúsculas para que Linux no marque error
    let query = 'UPDATE reportes SET estado = ?';
    
    if (estado === 'Resuelto') {
        query += ', fecha_resolucion = CURRENT_TIMESTAMP';
    } else {
        query += ', fecha_resolucion = NULL'; 
    }

    query += ' WHERE id = ?';

    db.query(query, [estado, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar:', err);
            return res.status(500).json({ error: 'Error al actualizar el reporte' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró un reporte con ese ID' });
        }
        
        res.json({ mensaje: `¡El ticket #${id} ahora está ${estado}!` });
    });
});

module.exports = router;