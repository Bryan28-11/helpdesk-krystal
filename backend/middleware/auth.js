const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
    // 1. Pedimos el token que viene en la cabecera (Header) de la petición
    const token = req.header('Authorization');

    // 2. Si no hay token, lo rebotamos
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No tienes permiso para hacer esto.' });
    }

    try {
        // 3. Limpiamos el token (usualmente la gente manda la palabra "Bearer " antes del token, así que la quitamos)
        const tokenLimpio = token.replace('Bearer ', '');
        
        // 4. Verificamos que el token sea auténtico usando nuestra clave secreta
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
        // 5. Si es válido, guardamos los datos del usuario (id, rol, nombre) en la petición para usarlos después
        req.usuario = verificado;
        
        // 6. ¡Le abrimos la puerta! (pasa a la ruta que el usuario quería)
        next(); 
    } catch (error) {
        res.status(400).json({ error: 'El token no es válido o ya expiró.' });
    }
};

module.exports = verificarToken;