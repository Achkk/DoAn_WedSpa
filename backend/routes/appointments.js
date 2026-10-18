/**
 * Routes: Lịch Hẹn (Appointments CRUD - Chức năng chính của đồ án)
 */
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../config/db');

// GET - Lấy danh sách lịch hẹn (hỗ trợ lọc theo SĐT)
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    const pool = await getPool();

    if (phone) {
      const cleanPhone = phone.replace(/[\s.-]/g, '');
      const result = await pool.request()
        .input('phone', sql.VarChar(20), cleanPhone)
        .query(`
          SELECT * FROM Appointments
          WHERE REPLACE(REPLACE(REPLACE(customerPhone, ' ', ''), '.', ''), '-', '') = @phone
          ORDER BY appointmentDate DESC, appointmentTime DESC
        `);
      return res.json({ success: true, data: result.recordset });
    }

    const result = await pool.request().query('SELECT * FROM Appointments ORDER BY createdAt DESC');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Tạo lịch hẹn mới (Thêm)
router.post('/', async (req, res) => {
  try {
    const {
      customerName, customerPhone, serviceId, therapistId,
      appointmentDate, appointmentTime, originalPrice,
      voucherCode, discountAmount, finalPrice, paymentMethod, notes
    } = req.body;

    const pool = await getPool();

    // Kiểm tra chống trùng lịch
    const checkConflict = await pool.request()
      .input('date', sql.Date, appointmentDate)
      .input('time', sql.VarChar(10), appointmentTime)
      .input('therapist', sql.VarChar(20), therapistId || 'any')
      .query(`
        SELECT COUNT(*) AS total FROM Appointments
        WHERE appointmentDate = @date
          AND appointmentTime = @time
          AND status IN ('pending', 'confirmed')
          AND (@therapist = 'any' OR therapistId = @therapist)
      `);

    if (therapistId && therapistId !== 'any' && checkConflict.recordset[0].total > 0) {
      return res.status(400).json({
        success: false,
        error: 'Kỹ thuật viên đã có ca vào khung giờ này. Vui lòng chọn giờ hoặc KTV khác!'
      });
    }

    // Tạo mã lịch hẹn
    const countTotal = await pool.request().query('SELECT COUNT(*) AS total FROM Appointments');
    const seq = String(countTotal.recordset[0].total + 1).padStart(3, '0');
    const newAptId = `SPA-2026-${seq}`;

    // Chèn vào CSDL
    await pool.request()
      .input('id', sql.VarChar(30), newAptId)
      .input('customerName', sql.NVarChar(150), customerName)
      .input('customerPhone', sql.VarChar(20), customerPhone)
      .input('serviceId', sql.VarChar(20), serviceId)
      .input('therapistId', sql.VarChar(20), therapistId || 'any')
      .input('appointmentDate', sql.Date, appointmentDate)
      .input('appointmentTime', sql.VarChar(10), appointmentTime)
      .input('originalPrice', sql.Decimal(18, 0), originalPrice || 0)
      .input('voucherCode', sql.VarChar(50), voucherCode || '')
      .input('discountAmount', sql.Decimal(18, 0), discountAmount || 0)
      .input('finalPrice', sql.Decimal(18, 0), finalPrice || 0)
      .input('paymentMethod', sql.VarChar(20), paymentMethod || 'cash')
      .input('status', sql.VarChar(20), 'pending')
      .input('notes', sql.NVarChar(sql.MAX), notes || '')
      .query(`
        INSERT INTO Appointments (
          id, customerName, customerPhone, serviceId, therapistId,
          appointmentDate, appointmentTime, originalPrice, voucherCode,
          discountAmount, finalPrice, paymentMethod, status, notes, createdAt
        ) VALUES (
          @id, @customerName, @customerPhone, @serviceId, @therapistId,
          @appointmentDate, @appointmentTime, @originalPrice, @voucherCode,
          @discountAmount, @finalPrice, @paymentMethod, @status, @notes, GETDATE()
        )
      `);

    res.json({
      success: true,
      message: 'Đặt lịch hẹn thành công!',
      data: { id: newAptId, ...req.body, status: 'pending' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT - Cập nhật lịch hẹn (Sửa)
router.put('/:id', async (req, res) => {
  try {
    const { status, appointmentDate, appointmentTime, therapistId, notes, finalPrice } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.VarChar(30), req.params.id)
      .input('status', sql.VarChar(20), status)
      .input('appointmentDate', sql.Date, appointmentDate)
      .input('appointmentTime', sql.VarChar(10), appointmentTime)
      .input('therapistId', sql.VarChar(20), therapistId)
      .input('notes', sql.NVarChar(sql.MAX), notes || '')
      .input('finalPrice', sql.Decimal(18, 0), finalPrice)
      .query(`
        UPDATE Appointments SET
          status = ISNULL(@status, status),
          appointmentDate = ISNULL(@appointmentDate, appointmentDate),
          appointmentTime = ISNULL(@appointmentTime, appointmentTime),
          therapistId = ISNULL(@therapistId, therapistId),
          notes = ISNULL(@notes, notes),
          finalPrice = ISNULL(@finalPrice, finalPrice)
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Cập nhật lịch hẹn thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE - Hủy lịch hẹn (Xóa)
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const aptRes = await pool.request()
      .input('id', sql.VarChar(30), req.params.id)
      .query('SELECT * FROM Appointments WHERE id = @id');

    if (aptRes.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy lịch hẹn!' });
    }

    const apt = aptRes.recordset[0];

    // Kiểm tra quy định hủy trước 2 tiếng
    const aptDateTime = new Date(`${apt.appointmentDate.toISOString().split('T')[0]}T${apt.appointmentTime}:00`);
    const diffHours = (aptDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (diffHours < 2 && !req.query.forceAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Chỉ được hủy lịch trước giờ hẹn tối thiểu 2 tiếng!'
      });
    }

    await pool.request()
      .input('id', sql.VarChar(30), req.params.id)
      .query("UPDATE Appointments SET status = 'cancelled' WHERE id = @id");

    res.json({ success: true, message: 'Đã hủy lịch hẹn!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

