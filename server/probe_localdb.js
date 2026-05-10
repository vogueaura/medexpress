const sql = require('mssql');

async function probe() {
    try {
        console.log('Probing SQL Server LocalDB...');
        let pool = await sql.connect('Server=(localdb)\\MSSQLLocalDB;Database=master;Trusted_Connection=Yes;TrustServerCertificate=True');
        let result = await pool.request().query("SELECT name FROM sys.databases WHERE database_id > 4");
        console.log('Databases found in LocalDB:', result.recordset);
        await pool.close();
    } catch (err) {
        console.error('LocalDB Probe failed:', err.message);
    }
}

probe();
