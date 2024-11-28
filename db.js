const mysql = require('mysql2/promise')
require('dotenv').config();

const env = process.env;

const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME
})

async function testConnection(){
    try {
        const [rows] = await pool.query("SELECT NOW()");
        console.log('Connection succesful');
    } catch (error){
        console.error('Database connection error', error);
    }
}

testConnection();

module.exports  = pool;

