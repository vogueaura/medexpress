const http = require('http');

const data = JSON.stringify({
  customerName: "Antigravity Test",
  customerPhone: "01000000000",
  address: "AI Lab, Virtual City",
  city: "Cairo",
  totalAmount: 150.00,
  paymentMethod: "cod",
  items: [
    {
      medicine: { id: 1, name: "Panadol Advance", price: 75.00 },
      quantity: 2
    }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error sending order:', error);
});

req.write(data);
req.end();
