const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const db = require('./db'); 

const app = express();

// =================================================================
// SEGURIDAD Y LÍMITES DE CARGA (Solución definitiva para error 413)
// =================================================================
// Aumentamos los límites a 50MB para soportar múltiples imágenes Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// =================================================================

app.use(cors()); 

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const reportesRoutes = require('./routes/reportes');
app.use('/api/reportes', reportesRoutes);

const comentariosRoutes = require('./routes/comentarios');
app.use('/api/comentarios', comentariosRoutes);

// ==========================================
// NUEVAS RUTAS PARA CMDB Y CONTROL DE ACCESOS
// ==========================================
const dispositivosRoutes = require('./routes/dispositivos');
app.use('/api/dispositivos', dispositivosRoutes);

const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);
// ==========================================

app.get('/', (req, res) => {
    res.send('¡El servidor del Helpdesk Krystal Grand está funcionando y el inventario está en línea!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});