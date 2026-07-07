const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Agregamos dotenv para que lea el archivo .env

// Importamos el archivo de base de datos que creaste
const db = require('./db'); 

// Inicializamos la aplicación
const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 
// Importamos nuestras rutas
const authRoutes = require('./routes/auth');

// Le decimos a express que use esas rutas b    ajo el prefijo /api/auth
app.use('/api/auth', authRoutes);

// Importamos las rutas de reportes
const reportesRoutes = require('./routes/reportes');

// Importamos las rutas de comentarios
const comentariosRoutes = require('./routes/comentarios');
// Le decimos a express que las use
app.use('/api/comentarios', comentariosRoutes);

// Le decimos a express que las use y las proteja bajo /api/reportes
app.use('/api/reportes', reportesRoutes);
// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡El servidor del Helpdesk Krystal Grand está funcicdonando!');
});

// Definimos el puerto
const PORT = process.env.PORT || 3000;

// Encendemos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});