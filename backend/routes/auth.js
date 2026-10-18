/**
 * Routes: Đăng Nhập & Đăng Ký (Authentication)
 */
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../config/db');

// POST - Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.VarChar(100), identifier.trim())
      .input('pass', sql.VarChar(255), password.trim())
      .query(`
        SELECT id, username, email, phone, fullName, role, createdAt
        FROM Users
        WHERE (username = @id OR phone = @id OR email = @id) AND password = @pass
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Đăng ký thành viên mới
router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;
    const pool = await getPool();

    // Kiểm tra trùng số điện thoại
    const check = await pool.request()
      .input('phone', sql.VarChar(20), phone)
      .query('SELECT COUNT(*) AS total FROM Users WHERE phone = @phone');

    if (check.recordset[0].total > 0) {
      return res.status(400).json({ success: false, error: 'Số điện thoại đã được đăng ký!' });
    }

    const newId = `u-mem-${Date.now()}`;
    await pool.request()
      .input('id', sql.VarChar(50), newId)
      .input('username', sql.VarChar(100), phone)
      .input('email', sql.VarChar(255), email || '')
      .input('phone', sql.VarChar(20), phone)
      .input('fullName', sql.NVarChar(150), fullName)
      .input('password', sql.VarChar(255), password)
      .input('role', sql.VarChar(20), 'member')
      .query(`
        INSERT INTO Users (id, username, email, phone, fullName, password, role, createdAt)
        VALUES (@id, @username, @email, @phone, @fullName, @password, @role, GETDATE())
      `);

    res.json({
      success: true,
      message: 'Đăng ký thành công!',
      data: { id: newId, fullName, phone, role: 'member' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

