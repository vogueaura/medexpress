const sql = require('mssql');

const config = {
    server: 'localhost',
    options: {
        trustServerCertificate: true
    },
    // Try with Windows Authentication (might need extra setup)
};

async function probe() {
    try {
        console.log('Probing SQL Server on localhost...');
        // Note: Without user/pass, this might fail unless using Windows Auth via a specific driver
        // I will try to connect to master DB to list other DBs
        let pool = await sql.connect('Server=localhost;Database=master;Trusted_Connection=Yes;TrustServerCertificate=True');
        let result = await pool.request().query("SELECT name FROM sys.databases WHERE database_id > 4");
        console.log('Databases found:', result.recordset);
        await pool.close();
    } catch (err) {
        console.error('Probe failed:', err.message);
    }
}

probe();
