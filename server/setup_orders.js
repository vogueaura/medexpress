const { connectDB, getPool } = require('./config/db');

async function createTables() {
    await connectDB();
    const pool = getPool();
    if (!pool) return;

    const createOrdersTable = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
        CREATE TABLE Orders (
            ID INT PRIMARY KEY IDENTITY(1,1),
            CustomerName NVARCHAR(255) NOT NULL,
            CustomerPhone NVARCHAR(50) NOT NULL,
            Address NVARCHAR(MAX) NOT NULL,
            City NVARCHAR(100),
            TotalAmount DECIMAL(18, 2) NOT NULL,
            PaymentMethod NVARCHAR(50) NOT NULL,
            Status NVARCHAR(50) DEFAULT 'pending',
            CreatedAt DATETIME DEFAULT GETDATE()
        )
    `;

    const createOrderItemsTable = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
        CREATE TABLE OrderItems (
            ID INT PRIMARY KEY IDENTITY(1,1),
            OrderID INT FOREIGN KEY REFERENCES Orders(ID),
            MedicineID INT,
            MedicineName NVARCHAR(255),
            Quantity INT NOT NULL,
            Price DECIMAL(18, 2) NOT NULL
        )
    `;

    try {
        await pool.request().query(createOrdersTable);
        console.log('Orders table ready.');
        await pool.request().query(createOrderItemsTable);
        console.log('OrderItems table ready.');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
    process.exit(0);
}

createTables();
