const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('¡Conexión exitosa a la base de datos MySQL!');
});

module.exports = connection;