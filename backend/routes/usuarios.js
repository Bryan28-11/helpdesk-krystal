const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Librería para encriptar contraseñas
const db = require('../db');

// ==========================================
// 1. REGISTRAR UN NUEVO USUARIO (JEFE DE ÁREA)
// ==========================================
router.post('/registro', async (req, res) => {
    const { nombre, email, password, rol, departamento } = req.body;

    // Validamos que no falten datos (el rol puede venir vacío y por defecto será 'empleado')
    if (!nombre || !email || !password || !departamento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // Encriptamos la contraseña (nivel de seguridad corporativo)
        const saltos = 10;
        const passwordEncriptada = await bcrypt.hash(password, saltos);

        const sql = 'INSERT INTO usuarios (nombre, email, password, rol, departamento) VALUES (?, ?, ?, ?, ?)';
        
        db.query(sql, [nombre, email, passwordEncriptada, rol || 'empleado', departamento], (err, resultado) => {
            if (err) {
                // Si el correo ya existe en HostGator, mandamos este error
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Este correo ya está registrado en el sistema' });
                }
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ error: 'Error interno del servidor al guardar en BD' });
            }
            res.status(201).json({ 
                mensaje: 'Jefe de área registrado exitosamente', 
                id: resultado.insertId 
            });
        });
    } catch (error) {
        console.error('Error en la encriptación:', error);
        res.status(500).json({ error: 'Error procesando la seguridad de la contraseña' });
    }
});

// ==========================================
// 2. OBTENER LISTA DE USUARIOS (PARA EL PANEL DE SISTEMAS)
// ==========================================
router.get('/', (req, res) => {
    // No seleccionamos la contraseña por seguridad, solo los datos de contacto
    const sql = 'SELECT id, nombre, email, rol, departamento, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC';
    
    db.query(sql, (err, resultados) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(resultados);
    });
});

// ==========================================
// 3. EDITAR / ACTUALIZAR UN USUARIO EXISTENTE
// ==========================================
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, rol, departamento } = req.body;

    if (!nombre || !email || !departamento) {
        return res.status(400).json({ error: 'Nombre, email y departamento son campos obligatorios' });
    }

    try {
        let sql = '';
        let params = [];

        // Si el usuario mandó una nueva contraseña, la encriptamos. Si viene vacía, no la tocamos.
        if (password && password.trim() !== '') {
            const saltos = 10;
            const passwordEncriptada = await bcrypt.hash(password, saltos);
            sql = 'UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ?, departamento = ? WHERE id = ?';
            params = [nombre, email, passwordEncriptada, rol || 'empleado', departamento, id];
        } else {
            sql = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, departamento = ? WHERE id = ?';
            params = [nombre, email, rol || 'empleado', departamento, id];
        }

        db.query(sql, params, (err, resultado) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Este correo ya está registrado por otro usuario' });
                }
                console.error('Error al actualizar usuario:', err);
                return res.status(500).json({ error: 'Error interno al actualizar en la BD' });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ mensaje: 'Usuario actualizado exitosamente' });
        });
    } catch (error) {
        console.error('Error procesando la actualización:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==========================================
// 4. ELIMINAR UN USUARIO
// ==========================================
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM usuarios WHERE id = ?';

    db.query(sql, [id], (err, resultado) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            return res.status(500).json({ error: 'Error interno al eliminar' });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    });
});

module.exports = router;
