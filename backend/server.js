/**
 * ====================================================
 * Server Backend Wed-Spa
 * Kết nối Microsoft SQL Server qua Node.js + Express
 * ====================================================
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// =================== MIDDLEWARE ===================
app.use(cors());
app.use(express.json());

// =================== TRANG CHỦ API ===================
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server Backend Wed-Spa đang hoạt động!' });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'REST API Wed-Spa kết nối SQL Server sẵn sàng!',
    endpoints: [
      'GET  /api/services',
      'GET  /api/therapists',
      'GET  /api/vouchers',
      'GET  /api/appointments',
      'GET  /api/messages',
      'GET  /api/reviews',
      'POST /api/users/login',
      'POST /api/users/register'
    ]
  });
});

// =================== ĐĂNG KÝ ROUTES ===================
app.use('/api/services',     require('./routes/services'));
app.use('/api/therapists',   require('./routes/therapists'));
app.use('/api/vouchers',     require('./routes/vouchers'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/users',        require('./routes/auth'));
app.use('/api',              require('./routes/general'));

// =================== KHỞI ĐỘNG SERVER ===================
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server Wed-Spa chạy tại: http://localhost:${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
