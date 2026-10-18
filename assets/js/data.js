/**
 * Dữ liệu khởi tạo mặc định cho Hệ thống Spa Booking (Initial Demo Data)
 * Tuân thủ mục 1.3 của PROJECT_RULES.md
 * 
 * Hướng dẫn chỉnh sửa nhanh:
 * - Thêm dịch vụ: Thêm object vào mảng DEFAULT_SERVICES với id duy nhất.
 * - Thêm kỹ thuật viên: Thêm object vào DEFAULT_THERAPISTS.
 * - Thêm mã giảm giá: Thêm object vào DEFAULT_VOUCHERS (type: 'percent' hoặc 'fixed').
 * - Đổi giờ hoạt động: Chỉnh sửa mảng AVAILABLE_TIME_SLOTS.
 */

/* ================= 1. DANH SÁCH DỊCH VỤ SPA (SERVICES) ================= */
const DEFAULT_SERVICES = [
  {
    id: "ser-1",
    name: "Massage Body Đá Nóng",
    category: "Massage Trị Liệu",
    duration: 60,
    price: 390000,
    icon: "fa-hot-tub-person",
    description: "Sử dụng đá bazan núi lửa tự nhiên giúp đả thông kinh lạc, giảm đau nhức xương khớp và phục hồi sinh lực sau ngày dài mệt mỏi.",
    benefits: ["Đả thông khí huyết", "Giảm căng thẳng cơ bắp", "Cải thiện giấc ngủ"]
  },
  {
    id: "ser-2",
    name: "Chăm Sóc Da Mặt Chuyên Sâu",
    category: "Chăm Sóc Da",
    duration: 75,
    price: 450000,
    icon: "fa-wand-magic-sparkles",
    description: "Liệu trình cấp ẩm đa tầng, thải độc chì và điện di tinh chất collagen tái sinh làn da mịn màng, căng bóng tự nhiên.",
    benefits: ["Cấp ẩm tầng sâu", "Thải độc & sáng da", "Trẻ hóa tế bào da"]
  },
  {
    id: "ser-3",
    name: "Gội Đầu Dưỡng Sinh Thảo Dược",
    category: "Dưỡng Sinh",
    duration: 60,
    price: 280000,
    icon: "fa-pump-soap",
    description: "Massage bấm huyệt vùng đầu, cổ vai gáy kết hợp canh thảo dược bồ kết cô đặc giúp ngủ sâu giấc, thư giãn mắt và giảm rụng tóc.",
    benefits: ["Thư giãn hệ thần kinh", "Lưu thông máu não", "Chăm sóc tóc tự nhiên"]
  },
  {
    id: "ser-4",
    name: "Trị Liệu Cổ Vai Gáy Chuyên Biệt",
    category: "Trị Liệu Chuyên Sâu",
    duration: 45,
    price: 320000,
    icon: "fa-hand-holding-heart",
    description: "Liệu pháp đặc trị cho dân văn phòng, xua tan căng cứng cơ, đau đầu co thắt và tê bì vùng bả vai bằng ngải cứu ấm.",
    benefits: ["Giải phóng điểm chèn ép", "Hết tê mỏi bả vai", "Tăng biên độ cổ vai"]
  },
  {
    id: "ser-5",
    name: "Tẩy Tế Bào Chết Toàn Thân & Tắm Thảo Mộc",
    category: "Chăm Sóc Toàn Thân",
    duration: 50,
    price: 350000,
    icon: "fa-shower",
    description: "Tẩy da chết bằng bột cà phê hữu cơ kết hợp sữa chua, sau đó ngâm bồn thảo dược ngải diệp giúp da sáng khỏe mềm mịn.",
    benefits: ["Tẩy sạch sừng già", "Da mịn màng bật tông", "Thải độc lỗ chân lông"]
  },
  {
    id: "ser-6",
    name: "Massage Bấm Huyệt Bàn Chân (Foot Spa)",
    category: "Massage Trị Liệu",
    duration: 45,
    price: 250000,
    icon: "fa-shoe-prints",
    description: "Ngâm chân nước muối hồng Himalaya kết hợp bấm huyệt phản xạ lòng bàn chân giúp điều hòa tạng phủ và giảm tê phù.",
    benefits: ["Kích thích huyệt đạo", "Giảm nhức mỏi chân", "Tăng tuần hoàn chi dưới"]
  }
];

/* ================= 2. ĐỘI NGŨ CHUYÊN VIÊN (THERAPISTS) ================= */
const DEFAULT_THERAPISTS = [
  {
    id: "ther-1",
    name: "Nguyễn Lan Anh",
    title: "Chuyên Viên Trị Liệu Cổ Vai Gáy",
    icon: "fa-user-nurse",
    rating: 4.9,
    experience: "5 năm kinh nghiệm",
    specialty: "Bấm huyệt đả thông kinh lạc, trị liệu vùng lưng & cổ vai"
  },
  {
    id: "ther-2",
    name: "Trần Thu Trang",
    title: "Kỹ Thuật Viên Chăm Sóc Da (Facial)",
    icon: "fa-wand-magic-sparkles",
    rating: 4.95,
    experience: "4 năm kinh nghiệm",
    specialty: "Điện di tinh chất tái sinh da, phục hồi màng ẩm chuyên sâu"
  },
  {
    id: "ther-3",
    name: "Lê Minh Hạnh",
    title: "Chuyên Gia Dưỡng Sinh & Huyệt Đạo",
    icon: "fa-spa",
    rating: 4.88,
    experience: "6 năm kinh nghiệm",
    specialty: "Gội đầu dưỡng sinh Trung Hoa, bấm huyệt tiền đình ngủ ngon"
  },
  {
    id: "ther-4",
    name: "Phạm Ngọc Bích",
    title: "Chuyên Viên Massage Thư Giãn Toàn Thân",
    icon: "fa-hands-holding-circle",
    rating: 4.92,
    experience: "3 năm kinh nghiệm",
    specialty: "Massage đá núi lửa, tinh dầu hương thảo & thụy điển"
  }
];

/* ================= 3. MÃ GIẢM GIÁ (VOUCHERS) ================= */
const DEFAULT_VOUCHERS = [
  {
    id: "v-1",
    code: "SPA10",
    type: "percent",
    value: 10,
    minOrder: 0,
    description: "Giảm 10% tổng hóa đơn cho mọi khách hàng",
    isActive: true
  },
  {
    id: "v-2",
    code: "RELAX50",
    type: "fixed",
    value: 50000,
    minOrder: 300000,
    description: "Giảm ngay 50.000 ₫ cho hóa đơn từ 300.000 ₫",
    isActive: true
  },
  {
    id: "v-3",
    code: "VIP20",
    type: "percent",
    value: 20,
    minOrder: 500000,
    description: "Ưu đãi tri ân giảm 20% cho đơn từ 500.000 ₫",
    isActive: true
  }
];

/* ================= 4. TÀI KHOẢN MẪU HỆ THỐNG (DEFAULT USERS) ================= */
const DEFAULT_USERS = [
  {
    id: "u-admin",
    username: "admin",
    email: "admin@wedspa.vn",
    phone: "0900000000",
    fullName: "Quản Trị Viên Spa",
    password: "admin123", // Quản trị viên
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "u-member-1",
    username: "maianh",
    email: "maianh@gmail.com",
    phone: "0912345678",
    fullName: "Trần Mai Anh",
    password: "123456", // Thành viên mẫu 1
    role: "member",
    createdAt: "2026-02-15T00:00:00.000Z"
  },
  {
    id: "u-member-2",
    username: "hoangnam",
    email: "hoangnam@gmail.com",
    phone: "0987654321",
    fullName: "Lê Hoàng Nam",
    password: "123456", // Thành viên mẫu 2
    role: "member",
    createdAt: "2026-03-01T00:00:00.000Z"
  }
];

/* ================= 5. LỊCH HẸN MẪU (10 DEMO APPOINTMENTS) ================= */
const todayDateStr = new Date().toISOString().split("T")[0];
const DEFAULT_APPOINTMENTS = [
  {
    id: "SPA-1001",
    customerName: "Trần Mai Anh",
    customerPhone: "0912345678",
    serviceId: "ser-1",
    therapistId: "ther-1",
    appointmentDate: todayDateStr,
    appointmentTime: "09:30",
    originalPrice: 390000,
    voucherCode: "SPA10",
    discountAmount: 39000,
    finalPrice: 351000,
    paymentMethod: "cash",
    status: "confirmed",
    notes: "Khách thích massage lực vừa, tinh dầu oải hương thư giãn",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: "SPA-1002",
    customerName: "Lê Hoàng Nam",
    customerPhone: "0987654321",
    serviceId: "ser-4",
    therapistId: "ther-4",
    appointmentDate: todayDateStr,
    appointmentTime: "14:00",
    originalPrice: 320000,
    voucherCode: "",
    discountAmount: 0,
    finalPrice: 320000,
    paymentMethod: "banking",
    status: "pending",
    notes: "Làm êm tay giúp mình, vùng cổ vai đang hơi nhức mỏi",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "SPA-1003",
    customerName: "Nguyễn Thu Hà",
    customerPhone: "0905123456",
    serviceId: "ser-2",
    therapistId: "ther-2",
    appointmentDate: todayDateStr,
    appointmentTime: "10:30",
    originalPrice: 450000,
    voucherCode: "RELAX50",
    discountAmount: 50000,
    finalPrice: 400000,
    paymentMethod: "cash",
    status: "completed",
    notes: "Khách da nhạy cảm, sử dụng mỹ phẩm dịu nhẹ không hương liệu",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "SPA-1004",
    customerName: "Vũ Thị Lan",
    customerPhone: "0938112233",
    serviceId: "ser-3",
    therapistId: "ther-3",
    appointmentDate: todayDateStr,
    appointmentTime: "15:30",
    originalPrice: 280000,
    voucherCode: "",
    discountAmount: 0,
    finalPrice: 280000,
    paymentMethod: "banking",
    status: "confirmed",
    notes: "Gội đầu kỹ nước ấm bồ kết truyền thống",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "SPA-1005",
    customerName: "Đặng Quốc Bảo",
    customerPhone: "0971234888",
    serviceId: "ser-1",
    therapistId: "ther-4",
    appointmentDate: todayDateStr,
    appointmentTime: "16:30",
    originalPrice: 390000,
    voucherCode: "",
    discountAmount: 0,
    finalPrice: 390000,
    paymentMethod: "cash",
    status: "pending",
    notes: "Chuẩn bị phòng đơn yên tĩnh giúp mình",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "SPA-1006",
    customerName: "Phạm Thảo My",
    customerPhone: "0919876543",
    serviceId: "ser-5",
    therapistId: "ther-2",
    appointmentDate: todayDateStr,
    appointmentTime: "11:30",
    originalPrice: 350000,
    voucherCode: "SPA10",
    discountAmount: 35000,
    finalPrice: 315000,
    paymentMethod: "banking",
    status: "completed",
    notes: "Đã hoàn thành xuất sắc, khách khen chuyên viên rất tận tâm",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "SPA-1007",
    customerName: "Bùi Văn Hùng",
    customerPhone: "0962345999",
    serviceId: "ser-6",
    therapistId: "ther-1",
    appointmentDate: todayDateStr,
    appointmentTime: "17:30",
    originalPrice: 250000,
    voucherCode: "",
    discountAmount: 0,
    finalPrice: 250000,
    paymentMethod: "cash",
    status: "cancelled",
    notes: "Khách bận họp đột xuất nên xin phép dời lịch sang tuần sau",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "SPA-1008",
    customerName: "Hoàng Yến Nhi",
    customerPhone: "0945678123",
    serviceId: "ser-4",
    therapistId: "ther-1",
    appointmentDate: todayDateStr,
    appointmentTime: "13:30",
    originalPrice: 320000,
    voucherCode: "VIP20",
    discountAmount: 64000,
    finalPrice: 256000,
    paymentMethod: "banking",
    status: "confirmed",
    notes: "Đắp thảo dược ngải cứu ấm vùng vai gáy",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: "SPA-1009",
    customerName: "Đỗ Tuấn Kiệt",
    customerPhone: "0988776655",
    serviceId: "ser-2",
    therapistId: "ther-2",
    appointmentDate: todayDateStr,
    appointmentTime: "18:30",
    originalPrice: 450000,
    voucherCode: "",
    discountAmount: 0,
    finalPrice: 450000,
    paymentMethod: "cash",
    status: "pending",
    notes: "Cần tư vấn thêm quy trình điện di tái tạo collagen",
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "SPA-1010",
    customerName: "Ngô Phương Linh",
    customerPhone: "0903445566",
    serviceId: "ser-3",
    therapistId: "ther-3",
    appointmentDate: todayDateStr,
    appointmentTime: "08:30",
    originalPrice: 280000,
    voucherCode: "SPA10",
    discountAmount: 28000,
    finalPrice: 252000,
    paymentMethod: "banking",
    status: "completed",
    notes: "Khách quen đi buổi sáng, đánh giá dịch vụ 5 sao",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

/* ================= 5. KHUNG GIỜ HOẠT ĐỘNG (TIME SLOTS) ================= */
const AVAILABLE_TIME_SLOTS = [
  "08:30", "09:30", "10:30", "11:30",
  "13:30", "14:30", "15:30", "16:30",
  "17:30", "18:30", "19:30"
];

/* ================= 6. CÂU HỎI THƯỜNG GẶP (FAQS) ================= */
const DEFAULT_FAQS = [
  {
    question: "Tôi có cần phải đặt lịch hẹn trước khi đến Spa không?",
    answer: "Chúng tôi khuyến khích quý khách nên đặt lịch trước tối thiểu 60 phút qua website để lễ tân kịp chuẩn bị phòng trị liệu riêng biệt và phân bổ kỹ thuật viên chuyên trách chu đáo nhất."
  },
  {
    question: "Nếu có việc bận đột xuất, tôi có thể đổi hoặc hủy lịch hẹn không?",
    answer: "Quý khách hoàn toàn có thể tự hủy hoặc đổi lịch hẹn miễn phí trên trang 'Tra cứu lịch' trước giờ bắt đầu tối thiểu 2 tiếng mà không phát sinh bất kỳ khoản phí nào."
  },
  {
    question: "Phụ nữ mang thai có thể sử dụng các liệu trình massage không?",
    answer: "Wed-Spa có liệu trình chăm sóc nhẹ nhàng và massage chân phù hợp cho mẹ bầu từ tháng thứ 4 trở đi. Đối với liệu trình đá nóng hoặc đả thông kinh lạc chuyên sâu, chúng tôi khuyến cáo phụ nữ mang thai nên tham khảo ý kiến bác sĩ trước khi sử dụng."
  },
  {
    question: "Spa có chỗ đậu xe ô tô và xe máy thuận tiện không?",
    answer: "Cơ sở tại Xã Ngọc Hồi - Hà Nội của Wed-Spa đều có bãi đỗ xe máy và ô tô miễn phí ngay trước cửa, có nhân viên bảo vệ hỗ trợ hướng dẫn tận tình."
  },
  {
    question: "Giá dịch vụ đã bao gồm tiền tip cho chuyên viên chưa?",
    answer: "Mọi chi phí niêm yết trên website đều là giá trọn gói 100%, đã bao gồm khăn ấm, trà dưỡng nhan và bánh điểm tâm thảo mộc. Wed-Spa cam kết KHÔNG áp lực tiền tip bắt buộc đối với khách hàng."
  }
];

/* ================= 7. ĐÁNH GIÁ KHÁCH HÀNG (REVIEWS) ================= */
const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    author: "Thu Thảo",
    role: "Khách hàng thân thiết",
    rating: 5,
    comment: "Không gian mùi tinh dầu sả chanh rất thư thái. KTV Lan Anh bấm huyệt cổ vai gáy cực kỳ êm tay, làm xong ngủ một mạch ngon lành.",
    date: "10/10/2026"
  },
  {
    id: "rev-2",
    author: "Thanh Tùng",
    role: "Lập trình viên",
    rating: 5,
    comment: "Ngồi máy tính nhiều bị mỏi vai gáy kinh niên, thử gói 45 phút thấy nhẹ hẳn cả người. Đặt lịch online trên web nhanh gọn tiện lợi.",
    date: "08/10/2026"
  },
  {
    id: "rev-3",
    author: "Bích Phương",
    role: "Chuyên viên truyền thông",
    rating: 5,
    comment: "Liệu trình chăm sóc da mặt chuyên sâu rất êm, da căng bóng tự nhiên. Thích nhất là không có cảm giác bị ép mua mỹ phẩm hay tip.",
    date: "05/10/2026"
  }
];

/* ================= 8. DANH SÁCH CHI NHÁNH (BRANCHES) ================= */
const DEFAULT_BRANCHES = [
  {
    id: "br-1",
    name: "Wed-Spa Flagship Ngọc Hồi",
    address: "Xã Ngọc Hồi - Hà Nội",
    hotline: "1900 6868 - 0912 345 678",
    hours: "08:30 - 20:30 (Mở cửa cả tuần)",
    mapQuery: "Ngoc+Hoi+Thanh+Tri+Ha+Noi"
  },
  {
    id: "br-2",
    name: "Wed-Spa Garden Lounge Ngọc Hồi",
    address: "Khu Đô Thị Ngọc Hồi, Xã Ngọc Hồi - Hà Nội",
    hotline: "1900 6869 - 0905 123 456",
    hours: "09:00 - 21:00 (Mở cửa cả tuần)",
    mapQuery: "Ngoc+Hoi+Thanh+Tri+Ha+Noi"
  }
];

