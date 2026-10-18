# CODING STANDARDS - QUY CHUẨN LẬP TRÌNH HTML, CSS, JAVASCRIPT THUẦN

Tài liệu này đặt ra quy chuẩn code sạch (Clean Code), tính nhất quán và cấu trúc tiêu chuẩn cho toàn bộ source code của dự án.

---

## 1. Tiêu chuẩn HTML5 (Semantic HTML)
- **Thẻ cấu trúc ngữ nghĩa:** Sử dụng đầy đủ `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
- **Form & Input:**
  - Mọi `<input>` đều phải có `id`, `name`, `type` phù hợp (`tel`, `email`, `date`, `time`).
  - Phải có thẻ `<label for="id">` đi kèm để hỗ trợ accessibility (trải nghiệm người dùng tốt).
  - Có thuộc tính `required` và `placeholder` rõ ràng.
- **Hình ảnh:** Luôn có thuộc tính `alt="..."` mô tả ảnh và thuộc tính `loading="lazy"` cho ảnh bên dưới trang.
- **Không nhúng trực tiếp:** Tuyệt đối không viết CSS `style="..."` hoặc sự kiện JS `onclick="..."` bên trong file HTML.

---

## 2. Tiêu chuẩn CSS3
- **Tập trung biến vào `variables.css`:** Mọi mã màu, kích thước bo góc, bóng mờ phải lấy từ `var(--ten-bien)`.
- **Cấu trúc BEM rút gọn (Block - Element - Modifier):**
  - Tên khối: `.booking-card`
  - Tên thành phần con: `.booking-card__title`, `.booking-card__body`
  - Biến thể trạng thái: `.btn--primary`, `.status-badge--pending`, `.is-active`
- **Flexbox & Grid:**
  - Dùng `display: flex` cho các thanh công cụ, icon kèm chữ, hàng nút bấm.
  - Dùng `display: grid; grid-template-columns: repeat(auto-fit, minmax(...))` cho danh sách dịch vụ, lưới slot giờ.
- **Responsive Web Design:**
  - Thiết kế chuẩn từ Mobile (`max-width: 768px`) đến Desktop (`min-width: 1024px`).
  - Không sử dụng đơn vị `px` cứng cho chiều rộng trang (ưu tiên `%`, `vw`, `rem`, `max-width`).

---

## 3. Tiêu chuẩn JavaScript (ES6+ Vanilla)
- **Khai báo biến:**
  - Dùng `const` cho các giá trị không đổi hoặc mảng/object không gán lại tham chiếu.
  - Dùng `let` khi cần gán lại giá trị (trong vòng lặp, biến đếm).
  - **Tuyệt đối không dùng `var`**.
- **Quy tắc đặt tên:**
  - Hàm và Biến: `camelCase` (ví dụ: `getAppointmentsFromStorage`, `totalPrice`, `isSlotAvailable`).
  - Hằng số cấu hình: `UPPER_SNAKE_CASE` (ví dụ: `STORAGE_KEY_APPOINTMENTS`, `MAX_HOURS_AHEAD`).
  - Tên class / Module: `PascalCase`.
- **Tương tác DOM (DOM Manipulation):**
  - Sử dụng `document.querySelector` và `document.querySelectorAll`.
  - Bắt sự kiện bằng `element.addEventListener('click', (event) => { ... })`.
  - Luôn kiểm tra phần tử tồn tại trước khi gán sự kiện để tránh lỗi `null reference`.
- **Tương tác LocalStorage:**
  - Luôn bọc hàm đọc/ghi `JSON.parse()` và `JSON.stringify()` trong khối `try...catch` an toàn.
  - Xây dựng riêng file `storage.js` làm tầng trung gian (Service layer) xử lý lưu trữ, các file khác chỉ gọi hàm của `storage.js`.
- **Hàm tiện ích định dạng tiền tệ (Currency Helper):**
  - Mọi giá trị tiền hiển thị ra giao diện bắt buộc dùng hàm chuẩn hóa `formatCurrency(amount)` sử dụng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` (ví dụ: `350.000 ₫`) để tránh viết tay định dạng số.

