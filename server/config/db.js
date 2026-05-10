const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
        encrypt: false
    },
    authentication: {
        type: 'default'
    }
};

let pool;

async function connectDB() {
    try {
        const dbConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: 'localhost',
            port: 55666,
            database: 'MedExpressDB',
            options: {
                trustServerCertificate: true,
                encrypt: false
            }
        };
        pool = await sql.connect(dbConfig);
        console.log('✅ Connected to SQL Server: MedExpressDB on port 55666');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
}

module.exports = {
    connectDB,
    getPool: () => pool
};
