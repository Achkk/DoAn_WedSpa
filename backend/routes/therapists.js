/**
 * Routes: Kỹ Thuật Viên (Therapists)
 */
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET - Lấy danh sách kỹ thuật viên
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Therapists ORDER BY rating DESC');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

