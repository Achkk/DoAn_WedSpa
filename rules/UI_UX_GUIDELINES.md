# UI/UX DESIGN GUIDELINES - PHONG CÁCH GIAO DIỆN HIỆN ĐẠI

Tài liệu này định hình phong cách thiết kế giao diện cho dự án Spa, lấy cảm hứng trực tiếp từ phong cách **Clean Dashboard / Fintech Modern UI** (theo hình ảnh mẫu TrustVest), kết hợp tính thẩm mỹ nhẹ nhàng, thư thái của ngành Spa & Chăm sóc sức khỏe.

---

## 1. Triết lý Thiết kế (Design Philosophy)
- **Thư giãn & Sang trọng:** Sử dụng các tone màu dịu mắt, tránh các màu sắc quá chói hoặc tương phản gắt.
- **Thẻ bo góc mềm mại (Soft Rounded Cards):** Toàn bộ các khối nội dung, card thông tin, banner và modal đều sử dụng bo góc lớn (`16px - 24px`) tạo cảm giác thân thiện, tinh tế.
- **Bố cục rõ ràng, tối giản (Clean & Spacious):** Phân định khoảng trắng (whitespace) hợp lý, không nhồi nhét chữ.
- **Thanh điều hướng Sidebar (Admin Dashboard):** Bố cục 2 cột (Sidebar bên trái cố định + Nội dung bên phải) như hình ảnh mẫu.

---

## 2. Hệ Thống Màu Sắc (Color Palette)

### 2.1. Màu thương hiệu (Brand Colors)
- **Primary Green (Xanh lá Mint):** `#10B981` (Tượng trưng cho sự phục hồi, thiên nhiên, thanh lọc).
- **Primary Dark (Hover state):** `#059669`.
- **Primary Light (Nền điểm nhấn):** `#E8F8EE` / `#F0FDF4` (Dùng cho các banner highlight, card thông báo, tab đang chọn).
- **Primary Accent (Vàng Gold phụ trợ):** `#F59E0B` (Dành cho icon đánh giá 5 sao, ưu đãi đặc biệt).

### 2.2. Màu nền & Chữ (Neutrals)
- **Nền toàn trang (Body Background):** `#F8FAFC` (Xám khói rất nhẹ, không làm lóa mắt khi nhìn lâu).
- **Nền Card / Khối nội dung:** `#FFFFFF` (Trắng tinh khiết).
- **Màu chữ chính (Heading / Body text):** `#1E293B` (Ghi than đậm, sắc nét).
- **Màu chữ phụ (Subtext / Timestamp):** `#64748B` (Ghi nhạt).
- **Đường viền (Borders):** `#E2E8F0` hoặc `rgba(0, 0, 0, 0.06)`.

### 2.3. Màu trạng thái lịch hẹn (Status Badges)
| Trạng thái | Mã màu chữ | Mã màu nền | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| **Pending** | `#D97706` (Amber) | `#FEF3C7` | Chờ xác nhận |
| **Confirmed** | `#4338CA` (Indigo) | `#E0E7FF` | Đã xác nhận hẹn |
| **Completed** | `#059669` (Green) | `#D1FAE5` | Đã hoàn tất dịch vụ |
| **Cancelled** | `#DC2626` (Red) | `#FEE2E2` | Đã hủy hẹn |

---

## 3. Kiểu chữ & Typography
- **Font chữ ưu tiên:** `Plus Jakarta Sans`, `Inter` hoặc `Be Vietnam Pro` (thông qua Google Fonts CDN).
- **Hệ phân cấp chữ (Hierarchy):**
  - H1 (Tiêu đề chính): `28px - 32px`, font-weight: 700.
  - H2 (Tiêu đề mục): `20px - 24px`, font-weight: 600.
  - H3 (Tiêu đề card): `16px - 18px`, font-weight: 600.
  - Body (Nội dung thông thường): `14px - 15px`, line-height: 1.6.
  - Caption / Tag / Badge: `12px - 13px`, font-weight: 500.

---

## 4. Các Thành Phần Giao Diện Chuẩn (Components Spec)

### 4.1. Khối Banner Highlight (Giống khối "Payment Request" trong ảnh mẫu)
- Background: Gradient nhẹ hoặc nền `#E8F8EE`.
- Góc bo: `20px`.
- Nội dung: Tiêu đề to bản, minh họa sinh động ở góc phải, nút hành động nhanh.

### 4.2. Khối Avatar Kỹ thuật viên & Người dùng
- Ảnh hình tròn (`border-radius: 50%`), kích thước `40x40px` hoặc `48x48px`.
- Kèm theo tên chuyên viên ở trên (chữ đậm) và vị trí/số điện thoại ở dưới (chữ mờ), có icon trạng thái sẵn sàng.

### 4.3. Nút bấm (Buttons)
- **Primary Button:** Nền xanh mint (`#10B981`), chữ trắng, bo góc `12px`, padding `10px 20px`, hiệu ứng hover nâng nhẹ (`transform: translateY(-1px)`).
- **Secondary / Ghost Button:** Nền trắng, viền `#E2E8F0`, chữ `#1E293B`, hover đổi màu nền sang `#F1F5F9`.

### 4.4. Thông báo nổi (Toast Notification)
- Tự động bật lên ở góc trên bên phải khi: Khách đặt lịch thành công, Hủy lịch, Cập nhật trạng thái Admin.
- Tự biến mất sau 3.5 giây kèm thanh tiến trình mờ dần.

### 4.5. Khung thanh toán chuyển khoản & Ảnh mã QR (QR Payment Card)
- Nằm gọn gàng trong thẻ Card bo góc `16px`, nền `#F8FAFC`, viền nét đứt hoặc viền mờ `#E2E8F0`.
- Ảnh mã QR hiển thị ở trung tâm với kích thước chuẩn `180x180px` hoặc `200x200px`, có bo góc nhẹ `12px` và viền trắng.
- Các dòng thông tin (STK, Chủ TK, Nội dung chuyển khoản) trình bày dạng danh sách gọn gàng kèm nút icon Copy tiện lợi.

### 4.6. Khối nhập mã giảm giá (Voucher Input Component)
- Thiết kế thanh lịch: Gồm một trường `<input>` bo góc tròn `12px` đặt cạnh một nút bấm "Áp dụng" nhỏ gọn.
- Khi áp dụng thành công: Hiện hiệu ứng chuyển động nhẹ (fade-in) thông báo số tiền được giảm với tag màu xanh mint (`#D1FAE5`).
- Khi mã không đúng: Viền input chuyển màu đỏ pastel nhẹ và hiện câu báo lỗi ngắn gọn bên dưới.

