# QUY TẮC DỰ ÁN WEBSITE ĐẶT LỊCH SPA (SPA BOOKING PLATFORM)

Tài liệu quy chuẩn toàn diện được cấu trúc theo 9 chuyên mục tiêu chuẩn, định hướng phát triển website Đặt Lịch Spa bằng **HTML5, CSS3, JavaScript thuần (Vanilla)** và cơ chế lưu trữ **`localStorage`**.

---

## 1. Kiến trúc Website (Website Architecture)

### 1.1. Mô hình kiến trúc
- **Kiến trúc ứng dụng:** Multi-Page Application (MPA) thuần Client-side.
- **Công nghệ nền tảng:** HTML5 (Ngữ nghĩa), CSS3 (Modern Flexbox/Grid, CSS Variables), JavaScript (ES6+ Vanilla).
- **Cơ chế dữ liệu:** Toàn bộ dữ liệu được quản lý tập trung và lưu trữ bền vững tại **`localStorage`** của trình duyệt.

### 1.2. Sơ đồ cấu trúc thư mục
```text
d:/DoAn_WedSpa/
├── index.html                 # Trang chủ (Hero, Dịch vụ nổi bật, Giới thiệu, Đánh giá, CTA)
├── services.html              # Trang danh mục dịch vụ & bảng giá chi tiết
├── booking.html               # Trang quy trình đặt lịch 4 bước trực quan
├── my-bookings.html           # Trang tra cứu & quản lý lịch hẹn cá nhân theo SĐT
├── admin.html                 # Trang Dashboard Quản trị viên (quản lý lịch hẹn, duyệt, voucher)
├── privacy.html               # Trang Chính sách bảo mật (Pháp lý)
├── terms.html                 # Trang Điều khoản dịch vụ & Quy chế đặt lịch (Pháp lý)
│
├── rules/                     # Thư mục tài liệu & quy tắc dự án
│   └── PROJECT_RULES.md       # Tài liệu quy tắc chuẩn 9 chuyên mục (File này)
│
├── assets/
│   ├── css/
│   │   ├── variables.css      # Toàn bộ biến CSS: Hệ màu Mint/Pastel, Font, Bo góc, Bóng mờ
│   │   ├── reset.css          # Chuẩn hóa reset CSS mặc định trên các trình duyệt
│   │   ├── style.css          # Style dùng chung: Header, Footer, Button, Card, Toast, Modal
│   │   ├── booking.css        # Style chuyên biệt cho quy trình đặt lịch (Stepper, Time slots)
│   │   └── dashboard.css      # Style chuyên biệt cho Admin Dashboard (Sidebar, Metrics, Bảng)
│   │
│   ├── js/
│   │   ├── data.js            # Dữ liệu khởi tạo mặc định (Dịch vụ, Kỹ thuật viên, Voucher mẫu)
│   │   ├── storage.js         # Tầng dịch vụ (Service Layer) xử lý CRUD với LocalStorage
│   │   ├── main.js            # Xử lý chung: Navigation, Mobile Menu, Toast Notification
│   │   ├── booking.js         # Logic đặt lịch, tính tiền, voucher, kiểm tra chống trùng giờ
│   │   └── admin.js           # Logic Dashboard: Thống kê, lọc lịch, cập nhật trạng thái, tạo voucher
│   │
│   └── images/                # Thư mục tài nguyên: Hình ảnh dịch vụ, avatar chuyên viên, qr-bank.png
```

### 1.3. Cấu trúc CSDL trong LocalStorage
- **`spa_services`**: Danh sách dịch vụ (id, name, category, duration, price, image, description).
- **`spa_therapists`**: Danh sách kỹ thuật viên (id, name, avatar, title, rating, experience).
- **`spa_appointments`**: Danh sách lịch hẹn (id, customerName, customerPhone, serviceId, therapistId, appointmentDate, appointmentTime, originalPrice, voucherCode, discountAmount, finalPrice, paymentMethod, status ['pending', 'confirmed', 'completed', 'cancelled'], notes, createdAt).
- **`spa_vouchers`**: Danh sách mã khuyến mãi (id, code, type ['percent', 'fixed'], value, description, isActive).

---

## 2. Quản lý chất lượng code (Code Quality Management)

### 2.1. Tiêu chuẩn HTML5
- Sử dụng cấu trúc thẻ ngữ nghĩa (Semantic tags): `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
- Tất cả `<input>` bắt buộc có `id`, `name`, `type` tương ứng và phải có thẻ `<label for="...">` liên kết chặt chẽ.
- Hình ảnh luôn có thuộc tính `alt` mô tả nội dung và `loading="lazy"` cho ảnh ngoài màn hình đầu.
- Tuyệt đối không viết CSS trực tiếp (`style="..."`) hoặc gán sự kiện (`onclick="..."`) vào mã HTML.

### 2.2. Tiêu chuẩn CSS3
- Quản lý toàn bộ giá trị thiết kế qua CSS Custom Properties tại `variables.css`.
- Áp dụng quy chuẩn đặt tên class theo chuẩn **BEM rút gọn** (Block - Element - Modifier).
- Bố cục sử dụng Flexbox cho thanh điều hướng/nút bấm và CSS Grid cho danh sách card/lưới khung giờ.
- Thiết kế Responsive mượt mà với Mobile First hoặc Desktop Down (`@media (max-width: 768px)` và `@media (max-width: 1024px)`).

### 2.3. Tiêu chuẩn JavaScript (ES6+ Vanilla)
- Tuyệt đối không sử dụng `var`; chỉ sử dụng `const` cho hằng số/đối tượng không gán lại và `let` cho biến cục bộ.
- Quy tắc đặt tên: `camelCase` cho hàm và biến; `UPPER_SNAKE_CASE` cho hằng số cấu hình; `PascalCase` cho đối tượng/class.
- Sử dụng `element.addEventListener` để lắng nghe sự kiện; luôn kiểm tra phần tử tồn tại trước khi thao tác DOM.
- Tách biệt rõ ràng tầng dữ liệu: Mọi thao tác đọc/ghi `localStorage` phải đi qua file `storage.js` và được bọc trong khối `try...catch` để bắt lỗi parse JSON.
- Sử dụng hàm chuẩn hóa hiển thị tiền tệ: `formatCurrency(amount)` (VD: `390.000 ₫`).

---

## 3. Quy tắc thiết kế UI (UI Design Rules)

### 3.1. Cảm hứng & Bảng màu (Tone Hồng lai Tím Xanh - Rose Lavender & Iris Gradient)
- **Màu thương hiệu (Primary Iris Violet):** `#8B5CF6` (Tím iris hoa phong lan thanh lịch, quý phái).
- **Màu tương tác (Hover Deep Violet):** `#7C3AED` (Tím đậm sang trọng).
- **Màu điểm nhấn phụ trợ (Accents):**
  - Sắc hồng cánh sen (`--accent-pink`): `#EC4899` / `#DB2777`.
  - Sắc xanh ngọc biển (`--accent-blue`): `#0EA5E9` / `#38BDF8`.
  - Sắc xanh tím indigo (`--accent-indigo`): `#6366F1`.
- **Hệ Gradient chủ đạo:** `linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)` (Hồng sen ➔ Tím oải hương ➔ Xanh biển).
- **Màu nền điểm nhấn (Light Lavender Background):** `#F5F3FF` (Nền phớt tím nhạt) và `#FDF2F8` (Nền phớt hồng sen).
- **Màu nền toàn trang (Body Background):** `#FAF8FD` (Tone phớt hồng tím siêu nhẹ, êm dịu mắt, thư thái chuẩn resort spa).
- **Màu thẻ (Card Background):** `#FFFFFF` (Trắng tinh khiết).
- **Màu chữ chính / Phụ:** Chữ chính `#1E1B4B` (Tím than đêm Midnight Indigo sang trọng); Chữ phụ `#64748B`.
- **Đường viền (Borders):** `#EDE8F5` (Viền phớt tím hồng pastel đồng bộ).

### 3.2. Màu sắc trạng thái lịch hẹn (Status Badges)
- **Chờ duyệt (`pending`):** Chữ `#B45309` trên nền `#FEF3C7` (Màu hổ phách pastel).
- **Đã duyệt (`confirmed`):** Chữ `#6D28D9` trên nền `#EDE9FE` (Màu tím oải hương).
- **Hoàn thành (`completed`):** Chữ `#BE185D` trên nền `#FCE7F3` (Màu hồng sen ngọt ngào).
- **Đã hủy (`cancelled`):** Chữ `#DC2626` trên nền `#FEE2E2` (Màu đỏ pastel).

### 3.3. Quy chuẩn khối & Bo góc (Soft Rounded Curves)
- Bo góc thẻ Card và Banner: `16px` đến `24px` (`border-radius: 16px - 24px`).
- Bo góc nút bấm và trường Input: `10px` đến `12px`.
- Avatar chuyên viên và khách hàng: Tròn hoàn toàn (`50%`), kích thước chuẩn `40px` hoặc `48px`.
- Bóng đổ (Box Shadow): Sử dụng đổ bóng đa tầng mềm mại `box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04)`.

---

## 4. Section trang chủ (Homepage Sections)

Trang chủ (`index.html`) được cấu trúc thành 9 khối nội dung chuẩn mực:
1. **Header / Navbar:** Logo Spa thanh lịch, menu điều hướng (Trang chủ, Dịch vụ, Tra cứu lịch, Về chúng tôi), nút CTA nổi bật "Đặt lịch ngay".
2. **Hero Banner:** Slogan truyền cảm hứng chăm sóc sức khỏe, hình ảnh không gian spa tĩnh lặng, 2 nút hành động: "Đặt lịch trải nghiệm" & "Khám phá dịch vụ".
3. **Dịch vụ nổi bật (Featured Services):** Lưới các gói dịch vụ bán chạy nhất (Chăm sóc da, Massage đá nóng, Trị liệu cổ vai gáy, Gội đầu dưỡng sinh) kèm thời lượng và giá niêm yết.
4. **Điểm khác biệt / Cam kết (Why Choose Us):** 4 lợi thế vượt trội (100% Thảo mộc tự nhiên, Kỹ thuật viên chứng chỉ quốc tế, Phòng riêng tư chuẩn 5 sao, Cam kết vệ sinh tuyệt đối).
5. **Đội ngũ chuyên viên (Therapist Showcase):** Trưng bày các chuyên viên tay nghề cao với avatar tròn, số năm kinh nghiệm và điểm đánh giá trung bình.
6. **Quy trình đặt lịch 4 bước (How It Works):** Minh họa trực quan: 1. Chọn dịch vụ ➔ 2. Chọn chuyên viên ➔ 3. Chọn thời gian ➔ 4. Tận hưởng liệu trình.
7. **Banner Ưu đãi & Voucher (Promotion Highlight):** Khối banner xanh mint bo góc lớn lấy cảm hứng từ ảnh mẫu, giới thiệu mã giảm giá đặc biệt trong tháng.
8. **Khách hàng đánh giá (Testimonials / Reviews):** Các nhận xét thực tế kèm số sao đánh giá từ khách hàng đã trải nghiệm.
9. **Chân trang (Footer):** Thông tin liên hệ, hotline, địa chỉ cơ sở, giờ mở cửa (`08:30 - 20:30`), biểu tượng mạng xã hội và liên kết đến các trang pháp lý.

---

## 5. Các trang pháp lý (Legal Pages)

Xây dựng 2 trang pháp lý độc lập nhằm bảo đảm tính minh bạch, độ tin cậy và sự chuyên nghiệp:

### 5.1. Trang Chính sách bảo mật (`privacy.html`)
- **Mục đích thu thập:** Chỉ thu thập Họ tên và Số điện thoại nhằm phục vụ công tác liên hệ xác nhận lịch hẹn.
- **Cam kết bảo mật:** Không mua bán, chia sẻ hoặc cung cấp thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào.
- **Quyền của khách hàng:** Khách hàng có quyền yêu cầu xem lại, chỉnh sửa hoặc xóa thông tin lịch sử đặt lịch trên hệ thống.

### 5.2. Trang Điều khoản & Quy chế đặt lịch (`terms.html`)
- **Quy định đặt trước:** Khách hàng đặt hẹn trước giờ thực hiện tối thiểu 60 phút để spa kịp chuẩn bị phòng và kỹ thuật viên.
- **Chính sách Hủy & Dời lịch:** Khách được quyền tự hủy hoặc đổi lịch hẹn miễn phí trước giờ bắt đầu tối thiểu 2 tiếng.
- **Quy định về việc đến trễ (Late Arrival):** Spa giữ chỗ tối đa 15 phút so với giờ hẹn; sau 15 phút nếu khách không có mặt, lịch có thể tự động chuyển sang trạng thái Hủy để nhường chỗ cho khách khác.
- **Quy định thanh toán:** Chấp nhận thanh toán tiền mặt tại quầy hoặc chuyển khoản qua mã QR theo đúng cú pháp mã lịch hẹn.

---

## 6. Tối ưu hiệu suất (Performance Optimization)

- **Tải ảnh lười (Image Lazy Loading):** Bắt buộc gán thuộc tính `loading="lazy"` cho tất cả hình ảnh nằm dưới màn hình cuộn đầu tiên.
- **Tối ưu dung lượng hình ảnh:** Sử dụng ảnh định dạng hiện đại (WebP/JPG nén tối ưu), khống chế dung lượng dưới 150KB/ảnh, kích thước đúng tỷ lệ hiển thị.
- **Không chặn hiển thị (Non-blocking Resources):**
  - Nhúng file CSS ở thẻ `<head>`.
  - Toàn bộ file JavaScript đặt ở cuối thẻ `<body>` hoặc thêm thuộc tính `defer`.
- **Tối ưu DOM Rendering:** Khi hiển thị danh sách dài (lịch hẹn, dịch vụ), sử dụng `DocumentFragment` hoặc tạo chuỗi HTML tổng hợp trước khi gán vào DOM để tránh hiện tượng giật lag (Reflow/Repaint).
- **Tối ưu Web Fonts:** Sử dụng Google Fonts với tham số `display=swap` để chữ hiển thị ngay lập tức trong lúc font đang tải.

---

## 7. Quy tắc bảo mật (Security Rules)

- **Phòng chống tấn công XSS (Cross-Site Scripting):**
  - Tuyệt đối không dùng `innerHTML` để chèn trực tiếp các dữ liệu do người dùng nhập (Tên khách hàng, SĐT, Ghi chú).
  - Bắt buộc dùng `element.textContent` hoặc hàm lọc ký tự đặc biệt (`escapeHTML`) trước khi hiển thị dữ liệu ra màn hình.
- **Xác thực dữ liệu đầu vào (Input Validation):**
  - Kiểm tra Số điện thoại theo đúng định dạng đầu số di động Việt Nam (`Regex: /^(0|84)(3|5|7|8|9)[0-9]{8}$/`).
  - Kiểm tra Ngày đặt lịch: Chặn không cho khách chọn ngày trong quá khứ (`min = today`).
- **Bảo vệ mã giảm giá:** Kiểm tra logic hợp lệ ở phía JavaScript (kiểm tra trạng thái `isActive`, hạn mức áp dụng).
- **Phân quyền truy cập Admin:** Cung cấp mã PIN hoặc cơ chế bảo vệ phiên đơn giản cho trang `admin.html` để ngăn khách hàng tự ý truy cập vào giao diện quản trị viên.

---

## 8. Quy tắc thiết kế UX (UX Design Rules)

- **Quy trình đặt lịch 4 bước phân tách rõ ràng (Step-by-step Stepper):**
  - Bước 1: Chọn gói dịch vụ (có hiển thị giá và thời lượng).
  - Bước 2: Chọn chuyên viên (có avatar và đánh giá sao) hoặc chọn "Chuyên viên bất kỳ".
  - Bước 3: Chọn ngày và khung giờ khả dụng.
  - Bước 4: Nhập thông tin liên hệ, mã giảm giá và xác nhận hình thức thanh toán.
- **Thuật toán Chống trùng lịch tức thời (Real-time Conflict Prevention):**
  - Khung giờ nào đã có khách đặt trước thì tự động bị làm mờ (disabled), đổi màu xám và không thể bấm chọn.
- **Phản hồi tương tác tức thì (Instant Micro-interactions):**
  - Có Toast Notification thông báo kết quả (thành công/thất bại) ở góc trên màn hình, tự động ẩn sau 3.5 giây.
  - Nút bấm tự đổi trạng thái Loading / Disabled khi đang lưu đơn để ngăn khách bấm liên tiếp 2 lần (Double Submission).
- **Biên nhận & In phiếu hẹn:** Sau khi đặt thành công, hiển thị Modal biên nhận tổng kết lịch hẹn kèm nút **"In phiếu hẹn" (`window.print()`)** và nút "Sao chép nhanh số tài khoản".

---

## 9. Thiết kế chuẩn SEO (SEO Best Practices)

- **Thẻ Meta cơ bản trên từng trang:**
  - Thẻ tiêu đề trang `<title>` độc nhất, chứa từ khóa chính (VD: `Đặt Lịch Spa Thư Giãn & Chăm Sóc Sức Khỏe Cao Cấp`).
  - Thẻ mô tả `<meta name="description">` hấp dẫn từ 140 - 160 ký tự.
  - Khai báo `<meta name="viewport" content="width=device-width, initial-scale=1.0">` chuẩn di động.
- **Thẻ Open Graph (Chia sẻ mạng xã hội Zalo/Facebook):**
  - Đầy đủ `og:title`, `og:description`, `og:image`, `og:url` để hiển thị banner xem trước đẹp mắt khi gửi link.
- **Hệ phân cấp thẻ tiêu đề (Heading Hierarchy):**
  - Mỗi trang chỉ duy nhất **1 thẻ `<h1>`**.
  - Các phần mục con phân cấp tuần tự theo `<h2>` và `<h3>`, chứa các từ khóa liên quan đến dịch vụ spa.
- **Cấu trúc URL thân thiện (Semantic Clean URLs):**
  - Đặt tên file ngắn gọn, rõ nghĩa (`services.html`, `booking.html`, `my-bookings.html`).
- **Tối ưu hình ảnh cho SEO:** Thuộc tính `alt` của ảnh phải chứa mô tả rõ ràng bằng tiếng Việt có dấu.
- **Favicon đồng bộ:** Cung cấp icon thương hiệu hoa sen/lá trà trên tab trình duyệt.
