const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Prueba de conexión inicial
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar con la base de datos en HostGator:', err);
    } else {
        console.log('¡Conexión exitosa a la base de datos del Helpdesk!');
        connection.release(); // Libera el hilo de inmediato
    }
});

module.exports = db;