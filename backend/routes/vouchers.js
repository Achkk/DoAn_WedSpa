/**
 * Routes: Mã Giảm Giá (Vouchers CRUD)
 */
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../config/db');

// GET - Lấy danh sách voucher
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Vouchers ORDER BY code ASC');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Thêm voucher mới
router.post('/', async (req, res) => {
  try {
    const { code, type, value, minOrder, description } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('code', sql.VarChar(50), code.toUpperCase().trim())
      .input('type', sql.VarChar(20), type)
      .input('value', sql.Int, value)
      .input('minOrder', sql.Decimal(18, 0), minOrder || 0)
      .input('description', sql.NVarChar(255), description || '')
      .input('isActive', sql.Bit, 1)
      .query(`
        INSERT INTO Vouchers (code, type, value, minOrder, description, isActive)
        VALUES (@code, @type, @value, @minOrder, @description, @isActive)
      `);
    res.json({ success: true, message: 'Thêm voucher thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT - Bật/tắt trạng thái voucher
router.put('/:code/toggle', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('code', sql.VarChar(50), req.params.code)
      .query('UPDATE Vouchers SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END WHERE code = @code');
    res.json({ success: true, message: 'Đã cập nhật trạng thái voucher!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE - Xóa voucher
router.delete('/:code', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('code', sql.VarChar(50), req.params.code)
      .query('DELETE FROM Vouchers WHERE code = @code');
    res.json({ success: true, message: 'Đã xóa voucher!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

