const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Generador de tokens
const db = require('../db');

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor, ingresa correo y contraseña' });
    }

    // 1. Buscamos al usuario por su correo
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], async (err, resultados) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        // 2. Si no existe el correo
        if (resultados.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = resultados[0];

        // 3. Comparamos la contraseña que escribió con la encriptada en HostGator
        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // 4. Creamos el Token con sus datos operativos
        const token = jwt.sign(
            { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                rol: usuario.rol, 
                departamento: usuario.departamento 
            }, 
            process.env.JWT_SECRET || 'krystal_secret_2026',
            { expiresIn: '12h' } // El token dura un turno laboral completo
        );

        // 5. Se lo enviamos al frontend
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                nombre: usuario.nombre,
                departamento: usuario.departamento,
                rol: usuario.rol
            }
        });
    });
});

module.exports = router;