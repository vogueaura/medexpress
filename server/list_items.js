const { connectDB, getPool } = require('./config/db');

async function listMedicines() {
    await connectDB();
    const pool = getPool();
    if (!pool) return;

    const result = await pool.request().query("SELECT TOP 100 name FROM Items WHERE IsActive = 1");
    console.log(JSON.stringify(result.recordset, null, 2));
    process.exit(0);
}

listMedicines();
