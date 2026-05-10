const sql = require('mssql');

const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'master',
    options: {
        trustServerCertificate: true,
        encrypt: false // Local connection usually doesn't need it
    },
    authentication: {
        type: 'default' // Uses current user (Windows Auth)
    }
};

async function getFileList() {
    try {
        let pool = await sql.connect('Server=localhost\\SQLEXPRESS;Database=master;Trusted_Connection=Yes;TrustServerCertificate=True');
        console.log('Connected to SQL Server.');
        
        let result = await pool.request().query("RESTORE FILELISTONLY FROM DISK='C:\\Users\\Public\\pfx_OldFullBackup.bak'");
        console.log('Logical Files Found:');
        console.table(result.recordset.map(f => ({ LogicalName: f.LogicalName, Type: f.Type })));
        
        await pool.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

getFileList();
