require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getPool } = require('./config/db');
const sql = require('mssql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

process.on('exit', (code) => {
  console.log(`Process is exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://192.168.100.7:3000'], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Config for Prescriptions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/prescriptions';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const INVENTORY_STORE_ID = Number(process.env.INVENTORY_STORE_ID || 1);
const INVENTORY_OPERATION_CODE = Number(process.env.INVENTORY_OPERATION_CODE || 28);
const INVENTORY_USER_ID = process.env.INVENTORY_USER_ID ? Number(process.env.INVENTORY_USER_ID) : null;

const getStockExpression = () => `ISNULL(dbo.HistoricalStock2(Items.ID, GETDATE(), ${INVENTORY_STORE_ID}), 0)`;

const getMedicineId = (item) => item?.medicine?.id || item?.medicineId || item?.id;
const getMedicineName = (item) => item?.medicine?.name || item?.medicineName || item?.name || 'Unknown medicine';
const getMedicinePrice = (item) => Number(item?.medicine?.price || item?.price || 0);

function splitStockQuantity(quantity, parts) {
  const normalizedParts = Math.max(1, Number(parts) || 1);
  const totalUnits = Math.round(Number(quantity) * normalizedParts);

  return {
    packs: Math.floor(totalUnits / normalizedParts),
    units: totalUnits % normalizedParts
  };
}

function buildInventoryItems(items) {
  const inventoryItems = new Map();

  for (const item of items) {
    const medicineId = Number(getMedicineId(item));
    const quantity = Number(item.quantity);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      const error = new Error('Invalid medicine id in order items');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error('Invalid quantity in order items');
      error.statusCode = 400;
      throw error;
    }

    const existing = inventoryItems.get(medicineId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      inventoryItems.set(medicineId, {
        medicineId,
        medicineName: getMedicineName(item),
        price: getMedicinePrice(item),
        quantity
      });
    }
  }

  return [...inventoryItems.values()];
}

async function deductInventoryItem(transaction, item) {
  const stockResult = await new sql.Request(transaction)
    .input('medicineId', sql.BigInt, item.medicineId)
    .input('storeId', sql.BigInt, INVENTORY_STORE_ID)
    .query(`
      DECLARE @parts BIGINT;

      SELECT @parts = ISNULL(NULLIF(Parts, 0), 1)
      FROM Items WITH (UPDLOCK, HOLDLOCK)
      WHERE ID = @medicineId AND IsActive = 1;

      IF @parts IS NULL
      BEGIN
        SELECT CAST(0 AS BIT) AS Found, CAST(0 AS FLOAT) AS CurrentStock, CAST(1 AS BIGINT) AS Parts;
        RETURN;
      END;

      ;WITH balances AS (
        SELECT
          ISNULL(posItems.StoreNewPacks + CAST(posItems.StoreNewUnits AS FLOAT) / NULLIF(ISNULL(posItems.iParts, @parts), 0), 0) AS CurrentStock,
          posTickets.ztime,
          posItems.ID AS RowID
        FROM posItems WITH (UPDLOCK, HOLDLOCK)
        INNER JOIN posTickets WITH (HOLDLOCK) ON posItems.TicketID = posTickets.ID
        WHERE posItems.ItemID = @medicineId AND posItems.StoreID = @storeId

        UNION ALL

        SELECT
          ISNULL(ItemCards.StoreNewPacks + CAST(ItemCards.StoreNewUnits AS FLOAT) / NULLIF(@parts, 0), 0) AS CurrentStock,
          ItemCards.ztime,
          ItemCards.ID AS RowID
        FROM ItemCards WITH (UPDLOCK, HOLDLOCK)
        WHERE ItemCards.ItemID = @medicineId AND ItemCards.StoreID = @storeId
      ),
      latest AS (
        SELECT TOP 1 CurrentStock
        FROM balances
        ORDER BY ztime DESC, RowID DESC
      )
      SELECT
        CAST(1 AS BIT) AS Found,
        ISNULL((SELECT CurrentStock FROM latest), 0) AS CurrentStock,
        @parts AS Parts;
    `);

  const stock = stockResult.recordset[0];
  if (!stock?.Found) {
    const error = new Error(`${item.medicineName} is no longer available`);
    error.statusCode = 409;
    throw error;
  }

  const currentStock = Number(stock.CurrentStock || 0);
  if (currentStock < item.quantity) {
    const error = new Error(`${item.medicineName} has only ${currentStock} available`);
    error.statusCode = 409;
    throw error;
  }

  const parts = Number(stock.Parts || 1);
  const newStock = currentStock - item.quantity;
  const newBalance = splitStockQuantity(newStock, parts);

  await new sql.Request(transaction)
    .input('medicineId', sql.BigInt, item.medicineId)
    .input('operation', sql.BigInt, INVENTORY_OPERATION_CODE)
    .input('packsDelta', sql.BigInt, -item.quantity)
    .input('unitsDelta', sql.BigInt, 0)
    .input('salesPrice', sql.Float, item.price)
    .input('newPacks', sql.BigInt, newBalance.packs)
    .input('newUnits', sql.BigInt, newBalance.units)
    .input('storeId', sql.BigInt, INVENTORY_STORE_ID)
    .input('userId', sql.BigInt, INVENTORY_USER_ID)
    .query(`
      INSERT INTO ItemCards (
        ItemID, Operation, Packs, Units, SalesPrice, ztime,
        NewPacks, NewUnits, StoreID, StoreNewPacks, StoreNewUnits,
        MachineName, UserID, DateModified
      )
      VALUES (
        @medicineId, @operation, @packsDelta, @unitsDelta, @salesPrice, GETDATE(),
        @newPacks, @newUnits, @storeId, @newPacks, @newUnits,
        'WEB', @userId, GETDATE()
      )
    `);
}

function createEmailTransporter() {
  if (!process.env.ADMIN_EMAIL || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

function formatOrderAlert(orderData) {
  return [
    '🚨 أوردر جديد في MedExpress!',
    `- رقم الطلب: #${orderData.orderId}`,
    `- العميل: ${orderData.customerName}`,
    `- الهاتف: ${orderData.customerPhone}`,
    `- العنوان: ${orderData.address}`,
    `- الإجمالي: ${orderData.totalAmount} EGP`,
    'يرجى مراجعة لوحة التحكم للتفاصيل.'
  ].join('\n');
}

async function sendEmailAlert(orderData) {
  const transporter = createEmailTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New MedExpress Order #${orderData.orderId}`,
    text: formatOrderAlert(orderData)
  });
}

async function sendWhatsAppAlert(orderData) {
  if (!process.env.WHATSAPP_API_URL || !process.env.WHATSAPP_TOKEN || !process.env.ADMIN_WHATSAPP_NUMBER) {
    return;
  }

  const response = await fetch(process.env.WHATSAPP_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    body: JSON.stringify({
      token: process.env.WHATSAPP_TOKEN,
      to: process.env.ADMIN_WHATSAPP_NUMBER,
      body: formatOrderAlert(orderData)
    })
  });

  if (!response.ok) {
    throw new Error(`WhatsApp alert failed with status ${response.status}`);
  }
}

async function sendOrderNotifications(orderData) {
  const results = await Promise.allSettled([
    sendEmailAlert(orderData),
    sendWhatsAppAlert(orderData)
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Order notification failed:', result.reason);
    }
  }
}

// Middleware to protect admin routes
const protectAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zayed_secret_key');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to protect user routes
const protectUser = (req, res, next) => {
  const token = req.cookies.user_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zayed_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Basic Route
app.get('/', (req, res) => {
  res.send('MedExpress API is running...');
});

// Medicines Route with dynamic categorization and improved search
app.get('/api/medicines', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({ message: 'Database not connected' });
    }
    
    const { q, category } = req.query;
    
    // Mapping Arabic search terms to English for common products
    let searchTerm = q || '';
    const arabicToEnglishMap = {
      'بانادول': 'PANADOL',
      'بنادول': 'PANADOL',
      'كونجستال': 'CONGESTAL',
      'فولتارين': 'VOLTAREN',
      'بروفين': 'BRUFEN',
      'كيتوفان': 'KETOFAN',
      'كتافلام': 'CATAFLAM',
      'اوجمنتين': 'AUGMENTIN',
      'انتينال': 'ANTINAL',
      'جلوير': 'GLUC',
      'اميولانت': 'AMU',
      'ادول': 'ADOL',
      'ابيمول': 'ABIMOL',
      'كولونيا': 'COLOGNE',
      'برفان': 'PERFUME',
      'كريم': 'CREAM',
      'صابون': 'SOAP'
    };

    if (searchTerm) {
      for (const [ar, en] of Object.entries(arabicToEnglishMap)) {
        if (searchTerm.includes(ar)) {
          searchTerm = searchTerm.replace(ar, en);
          break;
        }
      }
    }

    const stockExpression = getStockExpression();
    let baseQuery = `
      SELECT 
        ID as id, 
        name as name, 
        name as genericName,
        SalesPrice as price, 
        DESCRIPTION as description, 
        IsMedicine as isMedicine,
        barcode as barcode,
        ${stockExpression} as stock,
        CASE WHEN ${stockExpression} > 0 THEN 'in-stock' ELSE 'out-of-stock' END as availability,
        'MedExpress' as manufacturer,
        4.5 as rating,
        120 as reviewCount,
        CASE 
          WHEN name LIKE N'%PERFUME%' OR name LIKE N'%COLOGNE%' OR name LIKE N'%كولونيا%' OR name LIKE N'%برفان%' OR name LIKE N'%CREAM%' OR name LIKE N'%كريم%' OR name LIKE N'%SOAP%' OR name LIKE N'%صابون%' OR name LIKE N'%مزيل عرق%' OR name LIKE N'%DEO%' THEN 'personal-care'
          WHEN name LIKE N'%SYP%' OR name LIKE N'%SYRUP%' OR name LIKE N'%NASAL%' OR name LIKE N'%ACTIFED%' OR name LIKE N'%CONGESTAL%' THEN 'cold-flu'
          WHEN name LIKE N'%VIT%' OR name LIKE N'%CALCIUM%' OR name LIKE N'%COMPLEX%' OR name LIKE N'%SUPPLEMENT%' THEN 'vitamins'
          WHEN name LIKE N'%ABIMOL%' OR name LIKE N'%PANADOL%' OR name LIKE N'%ALCOFAN%' OR name LIKE N'%GEL%' OR name LIKE N'%CATAFLAM%' THEN 'pain-relief'
          WHEN name LIKE N'%GLUC%' OR name LIKE N'%DIABETES%' THEN 'diabetes'
          ELSE 'general'
        END as category
      FROM Items 
      WHERE IsActive = 1 
      AND name NOT LIKE N'%مبيعات غير مكودة%'
      AND name NOT LIKE N'%.......%'
      AND LEN(name) > 2
    `;

    let finalQuery = `SELECT TOP 100 * FROM (${baseQuery}) as SubQuery WHERE 1=1`;

    if (searchTerm) {
      finalQuery += ` AND (name LIKE N'%' + @search + N'%' OR description LIKE N'%' + @search + N'%' OR barcode LIKE N'%' + @search + N'%')`;
    }

    if (category) {
      finalQuery += ` AND category = @category`;
    }

    const request = pool.request();
    if (searchTerm) {
      request.input('search', searchTerm);
    }
    if (category) {
      request.input('category', category);
    }

    const result = await request.query(finalQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Search Suggestions (Autocomplete)
app.get('/api/medicines/suggestions', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const result = await pool.request()
      .input('search', q)
      .query(`
        SELECT TOP 8 name, ID as id 
        FROM Items 
        WHERE IsActive = 1 AND name LIKE N'%' + @search + N'%'
        AND name NOT LIKE N'%مبيعات غير مكودة%'
      `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Upload Prescription API
app.post('/api/upload-prescription', upload.single('prescription'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ 
    message: 'File uploaded', 
    path: `/uploads/prescriptions/${req.file.filename}` 
  });
});

// Single Medicine Route
app.get('/api/medicines/:id', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({ message: 'Database not connected' });
    }

    const { id } = req.params;
    const stockExpression = getStockExpression();
    const query = `
      SELECT 
        ID as id, 
        name as name, 
        name as genericName,
        SalesPrice as price, 
        DESCRIPTION as description, 
        IsMedicine as isMedicine,
        barcode as barcode,
        ${stockExpression} as stock,
        CASE WHEN ${stockExpression} > 0 THEN 'in-stock' ELSE 'out-of-stock' END as availability,
        'MedExpress' as manufacturer,
        'tablet' as dosage,
        4.5 as rating,
        120 as reviewCount,
        N'يستخدم هذا الدواء لعلاج الحالات الموصوفة بواسطة الطبيب.' as uses
      FROM Items 
      WHERE ID = @id
    `;

    const result = await pool.request()
      .input('id', id)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching medicine details:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- ORDER MANAGEMENT ---

// Create New Order
app.post('/api/orders', async (req, res) => {
  let transaction;

  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const { 
      userId,
      customerName, 
      customerPhone, 
      address, 
      city, 
      totalAmount, 
      paymentMethod,
      prescriptionPath,
      items 
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one item' });
    }

    const inventoryItems = buildInventoryItems(items);

    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    // 1. Insert into Orders table
    const orderResult = await new sql.Request(transaction)
      .input('userId', userId || null)
      .input('customerName', customerName)
      .input('customerPhone', customerPhone)
      .input('address', address)
      .input('city', city)
      .input('totalAmount', totalAmount)
      .input('paymentMethod', paymentMethod)
      .input('prescriptionPath', prescriptionPath || null)
      .query(`
        INSERT INTO Orders (UserID, CustomerName, CustomerPhone, Address, City, TotalAmount, PaymentMethod, PrescriptionPath, Status)
        OUTPUT INSERTED.ID
        VALUES (@userId, @customerName, @customerPhone, @address, @city, @totalAmount, @paymentMethod, @prescriptionPath, 'pending')
      `);

    const orderId = orderResult.recordset[0].ID;

    // 2. Insert items into OrderItems table
    for (const item of items) {
      await new sql.Request(transaction)
        .input('orderId', orderId)
        .input('medicineId', getMedicineId(item))
        .input('medicineName', getMedicineName(item))
        .input('quantity', item.quantity)
        .input('price', getMedicinePrice(item))
        .query(`
          INSERT INTO OrderItems (OrderID, MedicineID, MedicineName, Quantity, Price)
          VALUES (@orderId, @medicineId, @medicineName, @quantity, @price)
        `);
    }

    // 3. Deduct inventory using the same stock source used by the POS stock function.
    for (const item of inventoryItems) {
      await deductInventoryItem(transaction, item);
    }

    await transaction.commit();
    transaction = null;

    sendOrderNotifications({
      orderId,
      customerName,
      customerPhone,
      address,
      totalAmount,
      items
    }).catch((err) => {
      console.error('Order notification failed:', err);
    });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      orderId: orderId 
    });
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error('Order transaction rollback failed:', rollbackErr);
      }
    }

    console.error('Error creating order:', err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Failed to place order' });
  }
});

// Get All Orders (for Admin Dashboard) - Must come BEFORE /:id
app.get('/api/orders', protectAdmin, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const result = await pool.request().query(`
      SELECT TOP 50 * FROM Orders ORDER BY CreatedAt DESC
    `);

    // Fetch items for each order
    const orders = result.recordset;
    const ordersWithItems = [];

    for (const order of orders) {
      const stockExpression = getStockExpression();
      const itemsResult = await pool.request()
        .input('orderId', order.ID)
        .query(`
          SELECT oi.*, ${stockExpression} as CurrentStock
          FROM OrderItems oi
          LEFT JOIN Items ON oi.MedicineID = Items.ID
          WHERE oi.OrderID = @orderId
        `);
      
      ordersWithItems.push({
        ...order,
        items: itemsResult.recordset
      });
    }

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Update Order Status
app.patch('/api/orders/:id/status', protectAdmin, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const { id } = req.params;
    const { status } = req.body;

    await pool.request()
      .input('id', id)
      .input('status', status)
      .query('UPDATE Orders SET Status = @status WHERE ID = @id');

    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Get Single Order (Public for Tracking) - Must come AFTER specific routes
app.get('/api/orders/:id', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const { id } = req.params;
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM Orders WHERE ID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Simple check (Can be moved to DB later)
  if (username === 'admin' && password === 'zayed123') {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'zayed_secret_key', { expiresIn: '1d' });
    res.cookie('admin_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 
    });
    return res.json({ message: 'Login successful' });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logout successful' });
});

// --- USER AUTHENTICATION ---

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const { name, phone, password } = req.body;
    
    // Check if phone already exists
    const checkUser = await pool.request()
      .input('phone', phone)
      .query('SELECT ID FROM Users WHERE Phone = @phone');
      
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.request()
      .input('name', name)
      .input('phone', phone)
      .input('passwordHash', passwordHash)
      .query(`
        INSERT INTO Users (Name, Phone, PasswordHash)
        OUTPUT INSERTED.ID, INSERTED.Name, INSERTED.Phone
        VALUES (@name, @phone, @passwordHash)
      `);

    const user = result.recordset[0];
    const token = jwt.sign({ id: user.ID, role: 'user' }, process.env.JWT_SECRET || 'zayed_secret_key', { expiresIn: '7d' });

    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ user: { id: user.ID, name: user.Name, phone: user.Phone } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const { phone, password } = req.body;

    const result = await pool.request()
      .input('phone', phone)
      .query('SELECT * FROM Users WHERE Phone = @phone');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    const token = jwt.sign({ id: user.ID, role: 'user' }, process.env.JWT_SECRET || 'zayed_secret_key', { expiresIn: '7d' });

    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user.ID, name: user.Name, phone: user.Phone } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', protectUser, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const result = await pool.request()
      .input('id', req.user.id)
      .query('SELECT ID as id, Name as name, Phone as phone FROM Users WHERE ID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: result.recordset[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error getting profile' });
  }
});

// User Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('user_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logout successful' });
});

// Get User's Orders
app.get('/api/user/orders', protectUser, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(500).json({ message: 'Database not connected' });

    const result = await pool.request()
      .input('userId', req.user.id)
      .query('SELECT * FROM Orders WHERE UserID = @userId ORDER BY CreatedAt DESC');

    const orders = result.recordset;
    const ordersWithItems = [];

    for (const order of orders) {
      const itemsResult = await pool.request()
        .input('orderId', order.ID)
        .query('SELECT * FROM OrderItems WHERE OrderID = @orderId');
      
      ordersWithItems.push({
        ...order,
        items: itemsResult.recordset
      });
    }

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().then(() => {
  console.log('StartServer finished, process should stay alive...');
}).catch(err => {
  console.error('StartServer failed:', err);
});
