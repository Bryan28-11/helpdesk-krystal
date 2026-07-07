const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Librería para encriptar contraseñas
const db = require('../db'); // Subimos un nivel de carpeta para llamar a db.js
const jwt = require('jsonwebtoken'); //libreria JWT para generar tokens de autenticación

// Ruta para registrar un nuevo usuario (POST /api/auth/registro)
router.post('/registro', async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    try {
        // 1. Encriptar la contraseña (nadie podrá verla en la base de datos)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Definir el rol por defecto si no se envía
        const rolUsuario = rol ? rol : 'usuario';

        // 3. Insertar el usuario en la base de datos
        const query = 'INSERT INTO Usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
        
        db.query(query, [nombre, email, hashedPassword, rolUsuario], (err, results) => {
            if (err) {
                console.error('Error en base de datos:', err);
                return res.status(500).json({ error: 'Error al registrar el usuario, tal vez el email ya existe.' });
            }
            res.status(201).json({ 
                mensaje: '¡Usuario registrado exitosamente!', 
                userId: results.insertId 
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para iniciar sesión (POST /api/auth/login)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // 1. Buscar si el correo existe en la base de datos
    const query = 'SELECT * FROM Usuarios WHERE email = ?';
    
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        // Si no hay resultados, el correo no está registrado
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0]; // Extraemos los datos del usuario

        // 2. Comparar la contraseña enviada con la encriptada en la BD
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // 3. Si todo es correcto, generamos el "gafete" (Token JWT)
        const token = jwt.sign(
            { id: user.id, rol: user.rol, nombre: user.nombre }, // Datos que guardará el token
            process.env.JWT_SECRET, // Nuestra clave del archivo .env
            { expiresIn: '8h' } // El token caduca en 8 horas por seguridad
        );

        // 4. Respondemos enviando el token y los datos básicos del usuario
        res.json({
            mensaje: '¡Bienvenido al sistema!',
            token: token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol
            }
        });
    });
});

module.exports = router;