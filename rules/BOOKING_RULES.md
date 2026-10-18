# BOOKING BUSINESS RULES & ALGORITHMS - QUY TẮC NGHIỆP VỤ ĐẶT LỊCH

Tài liệu này quy định toàn bộ logic vận hành nghiệp vụ đặt hẹn của Spa, kiểm soát khung giờ khả dụng và giải thuật ngăn chặn tuyệt đối tình trạng trùng lịch (Double Booking).

---

## 1. Quy định về Khung thời gian phục vụ (Operating Hours)
- **Giờ hoạt động:** `08:30` đến `20:30` hàng ngày (từ Thứ Hai đến Chủ Nhật).
- **Khoảng cách giữa các ca (Slot Interval):** 30 phút hoặc 60 phút mỗi ca.
- **Danh sách ca mẫu trong ngày:**
  - Ca sáng: `08:30`, `09:30`, `10:30`, `11:30`
  - Ca chiều: `13:30`, `14:30`, `15:30`, `16:30`, `17:30`
  - Ca tối: `18:30`, `19:30`
- **Thời gian đặt trước tối thiểu:** Khách chỉ có thể đặt lịch trước giờ thực hiện tối thiểu `60 phút`.
- **Thời gian đặt trước tối đa:** Khách được đặt trước tối đa `30 ngày` so với ngày hiện tại.

---

## 2. Giải thuật Chống trùng lịch (Anti-Conflict Logic)

### Điều kiện một Slot được coi là "KHẢ DỤNG" (Available):
Một khung giờ được phép bấm chọn khi và chỉ khi:
1. **Ngày đặt** >= Ngày hiện tại (nếu là hôm nay, giờ đặt phải sau giờ hiện tại ít nhất 1 tiếng).
2. **Kỹ thuật viên được chọn** chưa có bất kỳ lịch hẹn nào ở trạng thái `pending` hoặc `confirmed` tại đúng ngày và giờ đó.
3. Nếu khách chọn tuỳ chọn *"Chuyên viên bất kỳ"* (`therapistId = 'any'`), hệ thống sẽ kiểm tra xem còn ít nhất một chuyên viên rảnh ca đó hay không.

### Mã giả thuật toán kiểm tra bằng JavaScript thuần:
```javascript
function checkSlotAvailability(targetDate, targetTime, therapistId) {
  const appointments = getAppointmentsFromStorage();
  
  // 1. Nếu chọn chuyên viên cụ thể
  if (therapistId !== 'any') {
    const isBooked = appointments.some(app => 
      app.appointmentDate === targetDate &&
      app.appointmentTime === targetTime &&
      app.therapistId === therapistId &&
      app.status !== 'cancelled'
    );
    return !isBooked; // true nếu rảnh, false nếu đã bận
  }

  // 2. Nếu chọn 'Chuyên viên bất kỳ'
  const allTherapists = getTherapistsFromStorage();
  const busyTherapistIds = appointments
    .filter(app => 
      app.appointmentDate === targetDate && 
      app.appointmentTime === targetTime && 
      app.status !== 'cancelled'
    )
    .map(app => app.therapistId);

  // Còn ít nhất 1 kỹ thuật viên rảnh
  return busyTherapistIds.length < allTherapists.length;
}
```

---

## 3. Vòng đời đơn đặt lịch (Booking Lifecycle)

Mỗi đơn hẹn sẽ trải qua 4 trạng thái:
1. **`pending` (Chờ tiếp nhận):** Khách hàng vừa gửi đơn trên website, đơn được lưu vào hệ thống.
2. **`confirmed` (Đã duyệt):** Lễ tân/Admin xác nhận có đủ phòng và kỹ thuật viên, sẵn sàng đón khách.
3. **`completed` (Hoàn tất):** Khách hàng đã đến spa, hoàn thành liệu trình và thanh toán.
4. **`cancelled` (Đã hủy):** Khách tự hủy (qua trang Tra cứu lịch) hoặc Spa hủy do trường hợp bất khả kháng.

---

## 4. Chính sách Hủy và Dời lịch (Cancellation Policy)
- Khách hàng được phép tự thao tác bấm **Hủy lịch** trên trang `my-bookings.html` nếu thời gian hủy cách giờ hẹn tối thiểu `2 tiếng`.
- Khi khách hủy thành công, trạng thái chuyển thành `cancelled`, khung giờ đó sẽ lập tức được **mở khóa lại** cho khách hàng khác có thể đặt.

---

## 5. Quy tắc Áp dụng Mã giảm giá (Vouchers)
1. **Kiểm tra hợp lệ:**
   - Mã nhập không phân biệt hoa thường (tự động chuyển thành chữ hoa bằng `.trim().toUpperCase()`).
   - Mã phải tồn tại trong danh sách `spa_vouchers` và có thuộc tính `isActive === true`.
2. **Công thức tính tiền:**
   - Nếu `type === "percent"`:
     `discountAmount = (originalPrice * value) / 100`
   - Nếu `type === "fixed"`:
     `discountAmount = Math.min(value, originalPrice)` (không giảm vượt quá giá trị đơn).
   - `finalPrice = Math.max(0, originalPrice - discountAmount)`.
3. **Phản hồi giao diện:**
   - Hợp lệ: Hiển thị nhãn xanh lá báo số tiền được giảm và cập nhật ngay tổng tiền.
   - Không hợp lệ: Hiển thị thông báo lỗi màu đỏ cạnh ô nhập.

---

## 6. Quy trình Thanh toán & Hiển thị Mã QR
1. **Hình thức thanh toán:**
   - `cash`: Thanh toán tiền mặt hoặc quẹt thẻ trực tiếp tại quầy khi đến spa.
   - `banking`: Chuyển khoản ngân hàng qua mã QR.
2. **Cơ chế hiển thị ảnh mã QR:**
   - Hiển thị file ảnh tĩnh tại đường dẫn cố định: `assets/images/qr-bank.png`.
   - Cho phép người dùng/chủ spa thay thế file ảnh này bằng mã QR thật của họ bất cứ lúc nào mà không cần sửa code.
3. **Thông tin đối soát đi kèm mã QR:**
   - Tên ngân hàng & Chi nhánh
   - Số tài khoản (Kèm nút "Sao chép nhanh")
   - Tên chủ tài khoản
   - Nội dung chuyển khoản: Bắt buộc là `Mã lịch hẹn` (ví dụ: `SPA-2026-001`) để nhân viên dễ dàng đối soát trên hệ thống.

