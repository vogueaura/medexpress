require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getPool } = require('./config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

process.on('exit', (code) => {
  console.log(`Process is exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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

    let baseQuery = `
      SELECT 
        ID as id, 
        name as name, 
        name as genericName,
        SalesPrice as price, 
        DESCRIPTION as description, 
        IsMedicine as isMedicine,
        barcode as barcode,
        'in-stock' as availability,
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
    const query = `
      SELECT 
        ID as id, 
        name as name, 
        name as genericName,
        SalesPrice as price, 
        DESCRIPTION as description, 
        IsMedicine as isMedicine,
        barcode as barcode,
        'in-stock' as availability,
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

    // 1. Insert into Orders table
    const orderResult = await pool.request()
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
      await pool.request()
        .input('orderId', orderId)
        .input('medicineId', item.medicine.id)
        .input('medicineName', item.medicine.name)
        .input('quantity', item.quantity)
        .input('price', item.medicine.price)
        .query(`
          INSERT INTO OrderItems (OrderID, MedicineID, MedicineName, Quantity, Price)
          VALUES (@orderId, @medicineId, @medicineName, @quantity, @price)
        `);
    }

    res.status(201).json({ 
      message: 'Order placed successfully', 
      orderId: orderId 
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to place order' });
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
