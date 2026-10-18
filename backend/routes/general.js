/**
 * Routes: Tin Nhắn Liên Hệ, Đánh Giá & Healthcheck
 */
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../config/db');

// =================== HEALTHCHECK ===================
router.get('/health', async (req, res) => {
  try {
    await getPool();
    res.json({ success: true, message: 'Server và SQL Server hoạt động bình thường!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =================== TIN NHẮN LIÊN HỆ ===================
router.get('/messages', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM ContactMessages ORDER BY createdAt DESC');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('name', sql.NVarChar(150), name)
      .input('phone', sql.VarChar(20), phone)
      .input('email', sql.VarChar(255), email || '')
      .input('subject', sql.NVarChar(255), subject || '')
      .input('message', sql.NVarChar(sql.MAX), message)
      .query(`
        INSERT INTO ContactMessages (name, phone, email, subject, message, createdAt)
        VALUES (@name, @phone, @email, @subject, @message, GETDATE())
      `);
    res.json({ success: true, message: 'Gửi tin nhắn thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =================== ĐÁNH GIÁ ===================
router.get('/reviews', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Reviews ORDER BY createdAt DESC');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { author, role, rating, comment } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('author', sql.NVarChar(150), author)
      .input('role', sql.NVarChar(100), role || 'Khách hàng')
      .input('rating', sql.Int, rating || 5)
      .input('comment', sql.NVarChar(sql.MAX), comment)
      .query(`
        INSERT INTO Reviews (author, role, rating, comment, createdAt)
        VALUES (@author, @role, @rating, @comment, GETDATE())
      `);
    res.json({ success: true, message: 'Gửi đánh giá thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

