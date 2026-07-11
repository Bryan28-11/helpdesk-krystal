const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth'); // Importamos a nuestro guardia

// Ruta para crear un nuevo reporte (POST /api/reportes)
// Ponemos "verificarToken" justo en medio para proteger la ruta
router.post('/', verificarToken, (req, res) => {
    // 1. Recibimos los datos que escribió el usuario en el formulario
    const { departamento, equipo_afectado, descripcion, urgencia } = req.body;
    
    // 2. ¿Recuerdas que el middleware guardó los datos del token? Los sacamos de aquí:
    const usuario_id = req.usuario.id; 

    // 3. Preparamos la consulta SQL
    const query = `
        INSERT INTO reportes 
        (usuario_id, departamento, equipo_afectado, descripcion, urgencia) 
        VALUES (?, ?, ?, ?, ?)
    `;

    // 4. Guardamos en la base de datos
    db.query(query, [usuario_id, departamento, equipo_afectado, descripcion, urgencia], (err, results) => {
        if (err) {
            console.error('Error al crear el reporte:', err);
            return res.status(500).json({ error: 'Hubo un error al guardar tu reporte.' });
        }
        
        res.status(201).json({
            mensaje: '¡Reporte creado exitosamente en el sistema!',
            folio_ticket: results.insertId
        });
    });
});

// Ruta para obtener los reportes (GET /api/reportes)
router.get('/', verificarToken, (req, res) => {
    const { id, rol, nombre } = req.usuario; // Sacamos los datos del token

    let query = '';
    let parametros = [];

    // Lógica de permisos adaptada a la base de datos de HostGator
    if (rol === 'admin') {
        // El admin ve todos los reportes, ordenados por la columna real 'fecha_reporte'
        query = `SELECT * FROM reportes ORDER BY fecha_reporte DESC`;
    } else {
        // El usuario normal solo ve sus propios reportes (usamos la columna reportado_por)
        query = `SELECT * FROM reportes WHERE reportado_por = ? ORDER BY fecha_reporte DESC`;
        // Si en tu frontend guardas el nombre de la persona, usa 'nombre'. Si guardas el ID, usa 'id'.
        parametros = [nombre || id]; 
    }

    // Ejecutamos la consulta
    db.query(query, parametros, (err, results) => {
        if (err) {
            console.error('Error al obtener los reportes:', err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results); // Devolvemos la lista de tickets
    });
});

// Ruta para actualizar el estado de un reporte (PUT /api/reportes/:id)
router.put('/:id', verificarToken, (req, res) => {
    const { id } = req.params; // Sacamos el número de folio (id) de la URL
    const { estado } = req.body; // Sacamos el nuevo estado que nos mandan

    // Validamos que no escriban un estado que no existe
    if (!['Abierto', 'En Proceso', 'Resuelto'].includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido. Usa: Abierto, En Proceso o Resuelto' });
    }

    let query = 'UPDATE Reportes SET estado = ?';
    
    // Magia: Si el admin lo marca como Resuelto, el sistema le pone la fecha y hora exacta de hoy
    if (estado === 'Resuelto') {
        query += ', fecha_resolucion = CURRENT_TIMESTAMP';
    } else {
        query += ', fecha_resolucion = NULL'; // Si lo regresan a abierto, borramos la fecha
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