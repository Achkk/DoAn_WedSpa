/**
 * Routes: Dịch Vụ Spa (Services CRUD)
 */
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../config/db');

// GET - Lấy danh sách dịch vụ
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Services ORDER BY price ASC');
    const services = result.recordset.map(s => ({
      ...s,
      benefits: s.benefits ? s.benefits.split(',') : []
    }));
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Thêm dịch vụ mới
router.post('/', async (req, res) => {
  try {
    const { name, category, duration, price, icon, description, benefits } = req.body;
    const pool = await getPool();

    const countRes = await pool.request().query('SELECT COUNT(*) AS total FROM Services');
    const newId = `ser-${countRes.recordset[0].total + 1}`;
    const benefitsStr = Array.isArray(benefits) ? benefits.join(',') : (benefits || '');

    await pool.request()
      .input('id', sql.VarChar(20), newId)
      .input('name', sql.NVarChar(255), name)
      .input('category', sql.NVarChar(100), category)
      .input('duration', sql.Int, duration)
      .input('price', sql.Decimal(18, 0), price)
      .input('icon', sql.VarChar(50), icon || 'fa-spa')
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('benefits', sql.NVarChar(sql.MAX), benefitsStr)
      .query(`
        INSERT INTO Services (id, name, category, duration, price, icon, description, benefits)
        VALUES (@id, @name, @category, @duration, @price, @icon, @description, @benefits)
      `);

    res.json({ success: true, message: 'Thêm dịch vụ thành công!', id: newId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE - Xóa dịch vụ
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.VarChar(20), req.params.id)
      .query('DELETE FROM Services WHERE id = @id');
    res.json({ success: true, message: 'Đã xóa dịch vụ!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

