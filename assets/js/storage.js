/**
 * Tầng dịch vụ lưu trữ LocalStorage (Storage Service Layer)
 * Xử lý toàn bộ logic đọc/ghi dữ liệu, mã giảm giá và kiểm tra chống trùng giờ
 * Tuân thủ mục 1.3, 2.3 và 7 của PROJECT_RULES.md
 */

// Định nghĩa các khóa định danh trong LocalStorage
const STORAGE_KEYS = {
  SERVICES: "spa_services",
  THERAPISTS: "spa_therapists",
  APPOINTMENTS: "spa_appointments",
  VOUCHERS: "spa_vouchers",
  REVIEWS: "spa_reviews",
  MESSAGES: "spa_contact_messages",
  ADMIN_AUTH: "spa_admin_session",
  USERS: "spa_users",
  CURRENT_USER: "spa_current_user"
};

const StorageService = {
  /**
   * Helper đọc JSON từ LocalStorage với giá trị dự phòng
   * @private
   * @param {string} key - Khóa LocalStorage
   * @param {*} fallback - Giá trị mặc định nếu chưa có hoặc lỗi
   * @returns {*} Dữ liệu parse từ JSON hoặc fallback
   */
  _get(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Helper ghi JSON an toàn vào LocalStorage
   * @private
   * @param {string} key - Khóa LocalStorage
   * @param {*} data - Dữ liệu cần lưu
   * @returns {boolean} true nếu thành công
   */
  _set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Lỗi lưu trữ ${key}:`, e);
      return false;
    }
  },

  API_BASE: "http://localhost:5000/api",

  /**
   * Khởi tạo dữ liệu mặc định và đồng bộ trực tiếp từ Microsoft SQL Server (Node.js API)
   */
  init() {
    const defaults = [
      [STORAGE_KEYS.SERVICES, DEFAULT_SERVICES],
      [STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS],
      [STORAGE_KEYS.VOUCHERS, DEFAULT_VOUCHERS],
      [STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS],
      [STORAGE_KEYS.USERS, typeof DEFAULT_USERS !== "undefined" ? DEFAULT_USERS : []],
      [STORAGE_KEYS.REVIEWS, typeof DEFAULT_REVIEWS !== "undefined" ? DEFAULT_REVIEWS : []]
    ];
    defaults.forEach(([key, val]) => {
      const current = localStorage.getItem(key);
      let parsed = null;
      try { parsed = JSON.parse(current); } catch {}
      // Tự động nạp mẫu khi khóa chưa có dữ liệu hoặc mảng rỗng []
      if (current === null || current === "" || (Array.isArray(parsed) && parsed.length === 0) || (key === STORAGE_KEYS.THERAPISTS && current.includes("unsplash"))) {
        this._set(key, val);
      }
    });

    // Đồng bộ tức thì từ Backend Node.js & SQL Server
    this.syncFromBackend();
  },

  /**
   * Đồng bộ dữ liệu 2 chiều từ máy chủ Microsoft SQL Server
   */
  async syncFromBackend() {
    try {
      const endpoints = [
        { key: STORAGE_KEYS.SERVICES, url: `${this.API_BASE}/services` },
        { key: STORAGE_KEYS.THERAPISTS, url: `${this.API_BASE}/therapists` },
        { key: STORAGE_KEYS.VOUCHERS, url: `${this.API_BASE}/vouchers` },
        { key: STORAGE_KEYS.APPOINTMENTS, url: `${this.API_BASE}/appointments` },
        { key: STORAGE_KEYS.MESSAGES, url: `${this.API_BASE}/messages` },
        { key: STORAGE_KEYS.REVIEWS, url: `${this.API_BASE}/reviews` }
      ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep.url);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              if (ep.key === STORAGE_KEYS.APPOINTMENTS) {
                const normalized = json.data.map(apt => ({
                  ...apt,
                  appointmentDate: apt.appointmentDate ? apt.appointmentDate.split("T")[0] : apt.appointmentDate
                }));
                this._set(ep.key, normalized);
              } else {
                this._set(ep.key, json.data);
              }
            }
          }
        } catch {}
      }
    } catch (e) {
      console.warn("Backend API chưa sẵn sàng, đang dùng dữ liệu cục bộ.", e);
    }
  },

  /**
   * Khôi phục toàn bộ dữ liệu mẫu ban đầu (dùng khi cần reset hệ thống)
   */
  resetDefaults() {
    this._set(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    this._set(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
    this._set(STORAGE_KEYS.VOUCHERS, DEFAULT_VOUCHERS);
    this._set(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    this._set(STORAGE_KEYS.USERS, typeof DEFAULT_USERS !== "undefined" ? DEFAULT_USERS : []);
    this._set(STORAGE_KEYS.REVIEWS, typeof DEFAULT_REVIEWS !== "undefined" ? DEFAULT_REVIEWS : []);
  },

  /* ================= DỊCH VỤ (SERVICES) ================= */
  /**
   * Lấy danh sách toàn bộ dịch vụ spa
   * @returns {Array<Object>}
   */
  getServices() {
    return this._get(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  },

  /**
   * Tìm thông tin dịch vụ theo ID
   * @param {string} id - Mã dịch vụ (VD: 'ser-1')
   * @returns {Object|null}
   */
  getServiceById(id) {
    return this.getServices().find(s => s.id === id) || null;
  },

  /**
   * Thêm dịch vụ mới từ Dashboard Admin
   * @param {Object} data 
   * @returns {Object}
   */
  addService(data) {
    const list = this.getServices();
    const newService = {
      id: "ser-" + Date.now(),
      name: data.name.trim(),
      category: data.category || "Massage Trị Liệu",
      duration: Number(data.duration) || 60,
      price: Number(data.price) || 300000,
      icon: data.icon || "fa-spa",
      description: data.description || "",
      benefits: Array.isArray(data.benefits) ? data.benefits : ["Thư giãn toàn diện", "Phục hồi sức khỏe"]
    };
    list.push(newService);
    this._set(STORAGE_KEYS.SERVICES, list);

    // Đồng bộ lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService)
    }).catch(err => console.warn("Lỗi đồng bộ dịch vụ SQL Server:", err));

    return newService;
  },

  /**
   * Cập nhật thông tin dịch vụ
   * @param {string} id 
   * @param {Object} data 
   * @returns {boolean}
   */
  updateService(id, data) {
    const list = this.getServices();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...data };
    return this._set(STORAGE_KEYS.SERVICES, list);
  },

  /**
   * Xóa một dịch vụ khỏi hệ thống
   * @param {string} id 
   * @returns {boolean}
   */
  deleteService(id) {
    const list = this.getServices();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length === list.length) return false;

    // Đồng bộ xóa trên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/services/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }).catch(err => console.warn("Lỗi xóa dịch vụ SQL Server:", err));

    return this._set(STORAGE_KEYS.SERVICES, filtered);
  },

  /* ================= KỸ THUẬT VIÊN (THERAPISTS) ================= */
  /**
   * Lấy danh sách toàn bộ kỹ thuật viên
   * @returns {Array<Object>}
   */
  getTherapists() {
    return this._get(STORAGE_KEYS.THERAPISTS, DEFAULT_THERAPISTS);
  },

  /**
   * Tìm thông tin kỹ thuật viên theo ID
   * @param {string} id - Mã kỹ thuật viên (VD: 'ther-1')
   * @returns {Object|null}
   */
  getTherapistById(id) {
    if (!id || id === "any") return null;
    return this.getTherapists().find(t => t.id === id) || null;
  },

  /* ================= LỊCH HẸN (APPOINTMENTS) ================= */
  /**
   * Lấy toàn bộ danh sách lịch hẹn
   * @returns {Array<Object>}
   */
  getAppointments() {
    const list = this._get(STORAGE_KEYS.APPOINTMENTS, typeof DEFAULT_APPOINTMENTS !== "undefined" ? DEFAULT_APPOINTMENTS : []);
    if ((!list || list.length === 0) && typeof DEFAULT_APPOINTMENTS !== "undefined" && DEFAULT_APPOINTMENTS.length > 0) {
      this._set(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
      return DEFAULT_APPOINTMENTS;
    }
    return list;
  },

  /**
   * Tìm kiếm đơn lịch hẹn theo ID duy nhất
   * @param {string} id - Mã lịch hẹn (VD: 'SPA-1001')
   * @returns {Object|null}
   */
  getAppointmentById(id) {
    return this.getAppointments().find(a => a.id === id) || null;
  },

  /**
   * Lấy danh sách lịch hẹn theo số điện thoại khách hàng (mới nhất xếp trước)
   * @param {string} phone - Số điện thoại cần tra cứu
   * @returns {Array<Object>}
   */
  getAppointmentsByPhone(phone) {
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    return this.getAppointments()
      .filter(a => a.customerPhone.replace(/\s+/g, "") === cleanPhone)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Tạo mới một lịch hẹn vào hệ thống
   * Tuân thủ Quy tắc 2 & Quy tắc 6 trong BOOKING_RULES.md
   * @param {Object} data - Thông tin ca hẹn từ form
   * @returns {Object} Đơn hẹn đã tạo kèm ID và timestamp
   */
  addAppointment(data) {
    // Kiểm tra tính khả dụng chống trùng lịch trước khi lưu
    if (data.appointmentDate && data.appointmentTime) {
      const isAvailable = this.checkSlotAvailability(
        data.appointmentDate,
        data.appointmentTime,
        data.therapistId || "any"
      );
      if (!isAvailable) {
        const reason = this.getSlotUnavailabilityReason(
          data.appointmentDate,
          data.appointmentTime,
          data.therapistId || "any"
        );
        throw new Error(reason || "Khung giờ này vừa có khách khác đặt trước. Vui lòng chọn giờ khác!");
      }
    }

    const list = this.getAppointments();
    // Tạo mã đơn chuẩn theo Quy tắc 6 (Ví dụ: SPA-2026-001)
    const randomSuffix = String(Math.floor(100 + Math.random() * 900)).padStart(3, "0");
    const newAppointment = {
      id: "SPA-2026-" + randomSuffix,
      createdAt: new Date().toISOString(),
      status: "pending", // Trạng thái 1 trong Booking Lifecycle (Quy tắc 3)
      ...data
    };
    list.unshift(newAppointment);
    if (!this._set(STORAGE_KEYS.APPOINTMENTS, list)) {
      throw new Error("Không thể lưu lịch hẹn vào bộ nhớ trình duyệt.");
    }

    // Đồng bộ tức thì lên Microsoft SQL Server qua Node.js API
    fetch(`${this.API_BASE}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppointment)
    }).catch(err => console.warn("Lỗi lưu ca hẹn lên SQL Server:", err));

    return newAppointment;
  },

  /**
   * Cập nhật trạng thái đơn hẹn ('pending' | 'confirmed' | 'completed' | 'cancelled')
   * Tuân thủ Quy tắc 3: Vòng đời đơn đặt lịch
   * @param {string} id - Mã lịch hẹn
   * @param {string} newStatus - Trạng thái mới
   * @returns {Object|false}
   */
  updateAppointmentStatus(id, newStatus) {
    const list = this.getAppointments();
    const apt = list.find(a => a.id === id);
    if (!apt) return false;

    apt.status = newStatus;
    apt.updatedAt = new Date().toISOString();

    // Đồng bộ trạng thái lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/appointments/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.warn("Lỗi cập nhật trạng thái lên SQL Server:", err));

    return this._set(STORAGE_KEYS.APPOINTMENTS, list) ? apt : false;
  },

  /**
   * Kiểm tra điều kiện khách hàng được tự hủy lịch hẹn
   * Tuân thủ Quy tắc 4 trong BOOKING_RULES.md: Khách chỉ được hủy trước tối thiểu 2 tiếng
   * @param {Object|string} aptOrId - Đơn lịch hẹn hoặc mã ID
   * @returns {{allowed: boolean, reason?: string}}
   */
  canCancelAppointment(aptOrId) {
    const apt = typeof aptOrId === "string" ? this.getAppointmentById(aptOrId) : aptOrId;
    if (!apt) {
      return { allowed: false, reason: "Không tìm thấy thông tin ca hẹn trên hệ thống." };
    }

    if (apt.status === "cancelled") {
      return { allowed: false, reason: "Lịch hẹn này đã được hủy trước đó." };
    }

    if (apt.status === "completed") {
      return { allowed: false, reason: "Lịch hẹn đã hoàn thành liệu trình, không thể hủy." };
    }

    if (apt.status !== "pending" && apt.status !== "confirmed") {
      return { allowed: false, reason: "Trạng thái lịch hẹn hiện tại không cho phép thao tác hủy." };
    }

    if (!apt.appointmentDate || !apt.appointmentTime) {
      return { allowed: true };
    }

    const [year, month, day] = apt.appointmentDate.split("-").map(Number);
    const [hour, minute] = apt.appointmentTime.split(":").map(Number);
    const aptDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    const diffMs = aptDateTime.getTime() - now.getTime();
    const minNoticeMs = 2 * 60 * 60 * 1000; // 2 tiếng = 120 phút

    if (diffMs < minNoticeMs) {
      return {
        allowed: false,
        reason: "Theo chính sách Spa, bạn chỉ có thể tự hủy lịch trước giờ hẹn tối thiểu 2 tiếng. Vui lòng liên hệ Hotline 1900 6868 để được nhân viên hỗ trợ."
      };
    }

    return { allowed: true };
  },

  /**
   * Hủy một ca hẹn (chuyển trạng thái sang 'cancelled')
   * Tuân thủ Quy tắc 4: Mở khóa lại slot cho khách hàng khác đặt
   * @param {string} id - Mã lịch hẹn cần hủy
   * @param {boolean} isAdmin - Nếu là Quản trị viên thì cho phép hủy bất kỳ lúc nào
   * @returns {Object|false}
   */
  cancelAppointment(id, isAdmin = false) {
    if (!isAdmin) {
      const check = this.canCancelAppointment(id);
      if (!check.allowed) {
        throw new Error(check.reason);
      }
    }

    // Đồng bộ hủy lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/appointments/${encodeURIComponent(id)}${isAdmin ? "?forceAdmin=true" : ""}`, {
      method: "DELETE"
    }).catch(err => console.warn("Lỗi hủy ca hẹn trên SQL Server:", err));

    return this.updateAppointmentStatus(id, "cancelled");
  },

  /**
   * Chỉnh sửa toàn diện thông tin một ca hẹn (Dành cho Quản trị viên Admin)
   * @param {string} id - Mã lịch hẹn
   * @param {Object} updatedData - Dữ liệu mới cần cập nhật
   * @returns {Object|false}
   */
  updateAppointment(id, updatedData) {
    const list = this.getAppointments();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return false;

    list[idx] = {
      ...list[idx],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    // Đồng bộ chỉnh sửa lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/appointments/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    }).catch(err => console.warn("Lỗi cập nhật ca hẹn lên SQL Server:", err));

    return this._set(STORAGE_KEYS.APPOINTMENTS, list) ? list[idx] : false;
  },

  /**
   * Xóa vĩnh viễn một ca hẹn khỏi hệ thống
   * @param {string} id - Mã lịch hẹn cần xóa
   * @returns {boolean}
   */
  deleteAppointment(id) {
    const list = this.getAppointments();
    const initialLen = list.length;
    const filtered = list.filter(a => a.id !== id);
    if (filtered.length === initialLen) return false;

    // Đồng bộ xóa vĩnh viễn trên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/appointments/${encodeURIComponent(id)}?forceAdmin=true`, {
      method: "DELETE"
    }).catch(err => console.warn("Lỗi xóa ca hẹn trên SQL Server:", err));

    return this._set(STORAGE_KEYS.APPOINTMENTS, filtered);
  },

  /**
   * GIẢI THUẬT CHỐNG TRÙNG LỊCH (ANTI-CONFLICT LOGIC)
   * Hiện thực chính xác theo mục 1 & mục 2 trong BOOKING_RULES.md
   * Điều kiện một Slot được coi là "KHẢ DỤNG" (Available):
   * 1. Ngày đặt >= Ngày hiện tại; trong vòng 30 ngày; nếu là hôm nay thì giờ đặt phải sau giờ hiện tại ít nhất 60 phút.
   * 2. Nếu chọn KTV cụ thể: KTV chưa có lịch pending hoặc confirmed tại ngày & giờ đó.
   * 3. Nếu chọn 'any': Còn ít nhất một KTV rảnh trong ca đó.
   *
   * @param {string} targetDate - Ngày 'yyyy-mm-dd'
   * @param {string} targetTime - Giờ 'hh:mm'
   * @param {string} therapistId - Mã kỹ thuật viên ('any' hoặc 'ther-1',...)
   * @returns {boolean} true nếu KHẢ DỤNG (Available), false nếu KHÔNG KHẢ DỤNG
   */
  checkSlotAvailability(targetDate, targetTime, therapistId = "any") {
    if (!targetDate || !targetTime) return false;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // 1.1. Ngày đặt phải >= Ngày hiện tại
    if (targetDate < todayStr) return false;

    // 1.2. Thời gian đặt trước tối đa 30 ngày (Mục 1 trong BOOKING_RULES.md)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;
    if (targetDate > maxDateStr) return false;

    // 1.3. Nếu là hôm nay, giờ đặt phải sau giờ hiện tại tối thiểu 60 phút (Mục 1 & 2 trong BOOKING_RULES.md)
    if (targetDate === todayStr) {
      const [slotHour, slotMinute] = targetTime.split(":").map(Number);
      const slotDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour, slotMinute);
      const diffMs = slotDateTime.getTime() - now.getTime();
      if (diffMs < 60 * 60 * 1000) {
        return false;
      }
    }

    const appointments = this.getAppointments();

    // 2. Nếu chọn chuyên viên cụ thể
    if (therapistId && therapistId !== "any") {
      const isBooked = appointments.some(app =>
        app.appointmentDate === targetDate &&
        app.appointmentTime === targetTime &&
        app.therapistId === therapistId &&
        app.status !== "cancelled"
      );
      return !isBooked; // true nếu rảnh, false nếu đã bận
    }

    // 3. Nếu chọn 'Chuyên viên bất kỳ'
    const allTherapists = this.getTherapists();
    const busyTherapistIds = appointments
      .filter(app =>
        app.appointmentDate === targetDate &&
        app.appointmentTime === targetTime &&
        app.status !== "cancelled"
      )
      .map(app => app.therapistId);

    // Còn ít nhất 1 kỹ thuật viên rảnh
    return busyTherapistIds.length < allTherapists.length;
  },

  /**
   * Lấy lý do chi tiết vì sao một khung giờ không khả dụng
   * @param {string} targetDate
   * @param {string} targetTime
   * @param {string} therapistId
   * @returns {string|null} Chuỗi mô tả lý do hoặc null nếu slot khả dụng
   */
  getSlotUnavailabilityReason(targetDate, targetTime, therapistId = "any") {
    if (!targetDate || !targetTime) return "Chưa chọn ngày hoặc giờ";

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (targetDate < todayStr) {
      return "Không thể đặt lịch trong quá khứ";
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;
    if (targetDate > maxDateStr) {
      return "Chỉ được đặt lịch trước tối đa 30 ngày";
    }

    if (targetDate === todayStr) {
      const [slotHour, slotMinute] = targetTime.split(":").map(Number);
      const slotDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour, slotMinute);
      const diffMs = slotDateTime.getTime() - now.getTime();
      if (diffMs < 60 * 60 * 1000) {
        return "Cần đặt trước giờ thực hiện tối thiểu 60 phút";
      }
    }

    const appointments = this.getAppointments();

    if (therapistId && therapistId !== "any") {
      const isBooked = appointments.some(app =>
        app.appointmentDate === targetDate &&
        app.appointmentTime === targetTime &&
        app.therapistId === therapistId &&
        app.status !== "cancelled"
      );
      if (isBooked) {
        return "Chuyên viên đã kín lịch khung giờ này";
      }
    } else {
      const allTherapists = this.getTherapists();
      const busyTherapistIds = appointments
        .filter(app =>
          app.appointmentDate === targetDate &&
          app.appointmentTime === targetTime &&
          app.status !== "cancelled"
        )
        .map(app => app.therapistId);
      if (busyTherapistIds.length >= allTherapists.length) {
        return "Toàn bộ chuyên viên đã kín lịch khung giờ này";
      }
    }

    return null;
  },

  /**
   * Helper kiểm tra khung giờ đã có khách hẹn trước hay chưa
   * @param {string} date - Ngày hẹn 'yyyy-mm-dd'
   * @param {string} time - Giờ hẹn 'hh:mm'
   * @param {string|null} therapistId - Mã kỹ thuật viên (hoặc 'any' / null)
   * @returns {boolean} true nếu đã kín chỗ (không khả dụng)
   */
  isSlotOccupied(date, time, therapistId = null) {
    return !this.checkSlotAvailability(date, time, therapistId || "any");
  },

  /* ================= MÃ GIẢM GIÁ (VOUCHERS) ================= */
  /**
   * Lấy danh sách toàn bộ voucher khuyến mãi
   * @returns {Array<Object>}
   */
  getVouchers() {
    return this._get(STORAGE_KEYS.VOUCHERS, DEFAULT_VOUCHERS);
  },

  /**
   * Kiểm tra tính hợp lệ và tính toán số tiền giảm giá của voucher
   * Tuân thủ chính xác Quy tắc 5 trong BOOKING_RULES.md
   * 1. Kiểm tra: .trim().toUpperCase(), tồn tại trong spa_vouchers, isActive === true
   * 2. Tính tiền:
   *    - type === "percent": discountAmount = (originalPrice * value) / 100
   *    - type === "fixed": discountAmount = Math.min(value, originalPrice)
   *    - finalPrice = Math.max(0, originalPrice - discountAmount)
   *
   * @param {string} code - Mã giảm giá
   * @param {number} orderTotal - Giá trị dịch vụ ban đầu (originalPrice)
   * @returns {{valid: boolean, message: string, voucher?: Object, discountAmount?: number, finalPrice?: number}}
   */
  validateVoucher(code, orderTotal) {
    if (!code) return { valid: false, message: "Vui lòng nhập mã giảm giá." };
    const cleanCode = code.trim().toUpperCase();
    const found = this.getVouchers().find(v => v.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, message: "Mã giảm giá không tồn tại trên hệ thống." };
    }
    if (!found.isActive) {
      return { valid: false, message: "Mã giảm giá này hiện đã hết hạn hoặc tạm dừng." };
    }
    if (found.minOrder && orderTotal < found.minOrder) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu phải từ ${Utils.formatCurrency(found.minOrder)} để áp dụng mã ${found.code}.`
      };
    }

    // Công thức tính tiền theo Quy tắc 5
    let discountAmount = 0;
    if (found.type === "percent") {
      discountAmount = Math.round((orderTotal * found.value) / 100);
    } else {
      discountAmount = Math.min(found.value, orderTotal);
    }

    const finalPrice = Math.max(0, orderTotal - discountAmount);

    return {
      valid: true,
      voucher: found,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      message: `Áp dụng thành công mã ${found.code} (Giảm ${Utils.formatCurrency(discountAmount)})!`
    };
  },

  /**
   * Tạo mã voucher mới từ Dashboard
   * @param {Object} data - Dữ liệu voucher (code, type, value, minOrder, description)
   * @returns {Object|null}
   */
  addVoucher(data) {
    const list = this.getVouchers();
    const newVoucher = {
      id: "v-" + Date.now(),
      code: data.code.trim().toUpperCase(),
      type: data.type || "percent",
      value: Number(data.value),
      minOrder: Number(data.minOrder) || 0,
      description: data.description || "",
      isActive: data.isActive !== false
    };
    list.push(newVoucher);

    // Đồng bộ mã voucher lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/vouchers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVoucher)
    }).catch(err => console.warn("Lỗi lưu voucher lên SQL Server:", err));

    return this._set(STORAGE_KEYS.VOUCHERS, list) ? newVoucher : null;
  },

  /**
   * Bật/tắt trạng thái hoạt động của mã voucher
   * @param {string} id - Mã ID voucher
   * @returns {Object|null}
   */
  toggleVoucherStatus(id) {
    const list = this.getVouchers();
    const v = list.find(item => item.id === id);
    if (!v) return null;
    v.isActive = !v.isActive;

    // Đồng bộ trạng thái voucher lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/vouchers/${encodeURIComponent(v.code)}/toggle`, {
      method: "PUT"
    }).catch(err => console.warn("Lỗi cập nhật voucher lên SQL Server:", err));

    return this._set(STORAGE_KEYS.VOUCHERS, list) ? v : null;
  },

  /* ================= QUẢN LÝ THÀNH VIÊN & TÀI KHOẢN (AUTH & USERS) ================= */
  /**
   * Lấy danh sách toàn bộ tài khoản người dùng
   * @returns {Array<Object>}
   */
  getUsers() {
    const list = this._get(STORAGE_KEYS.USERS, typeof DEFAULT_USERS !== "undefined" ? DEFAULT_USERS : []);
    if ((!list || list.length === 0) && typeof DEFAULT_USERS !== "undefined" && DEFAULT_USERS.length > 0) {
      this._set(STORAGE_KEYS.USERS, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return list;
  },

  /**
   * Tìm người dùng theo Email hoặc Số điện thoại hoặc Username
   * @param {string} identifier
   * @returns {Object|null}
   */
  getUserByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, "");
    return this.getUsers().find(u => 
      u.email.toLowerCase() === clean || 
      u.phone.replace(/\s+/g, "") === cleanPhone || 
      u.username.toLowerCase() === clean
    ) || null;
  },

  /**
   * Đăng ký thành viên mới
   * @param {Object} data - { fullName, phone, email, password }
   * @returns {Object} User object
   */
  registerUser(data) {
    const users = this.getUsers();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim().replace(/\s+/g, "");

    if (users.some(u => u.email.toLowerCase() === email)) {
      throw new Error("Email này đã được đăng ký tài khoản!");
    }
    if (users.some(u => u.phone.replace(/\s+/g, "") === phone)) {
      throw new Error("Số điện thoại này đã được đăng ký tài khoản!");
    }

    const newUser = {
      id: "u-" + Date.now(),
      username: email.split("@")[0] || ("user_" + Math.floor(1000 + Math.random() * 9000)),
      fullName: data.fullName.trim(),
      phone: phone,
      email: email,
      password: data.password,
      role: "member",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this._set(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(newUser);
    return newUser;
  },

  /**
   * Đăng nhập người dùng (hỗ trợ cả thành viên và admin)
   * @param {string} identifier - Email / SĐT / Username
   * @param {string} password - Mật khẩu hoặc PIN
   * @returns {Object} User object
   */
  loginUser(identifier, password) {
    const user = this.getUserByIdentifier(identifier);
    if (!user) {
      throw new Error("Tài khoản không tồn tại trong hệ thống!");
    }
    if (user.password !== password) {
      throw new Error("Mật khẩu không chính xác!");
    }

    this.setCurrentUser(user);
    if (user.role === "admin") {
      this.setAdminSession(true);
    } else {
      this.setAdminSession(false);
    }
    return user;
  },

  /**
   * Lấy thông tin tài khoản đang đăng nhập
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this._get(STORAGE_KEYS.CURRENT_USER, null);
  },

  /**
   * Lưu thông tin người dùng đang đăng nhập
   * @param {Object|null} user
   */
  setCurrentUser(user) {
    if (user) {
      const safeUser = { ...user };
      delete safeUser.password;
      this._set(STORAGE_KEYS.CURRENT_USER, safeUser);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  /**
   * Đăng xuất người dùng hiện tại
   */
  logoutUser() {
    this.setCurrentUser(null);
    this.setAdminSession(false);
  },

  /**
   * Kiểm tra người dùng đã đăng nhập hay chưa
   * @returns {boolean}
   */
  isUserLoggedIn() {
    return !!this.getCurrentUser();
  },

  /* ================= PHIÊN ĐĂNG NHẬP ADMIN ================= */
  /**
   * Kiểm tra xem quản trị viên đã đăng nhập phiên hay chưa
   * @returns {boolean}
   */
  isAdminLoggedIn() {
    const adminSession = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) || sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    const currentUser = this.getCurrentUser();
    return adminSession === "authenticated" || (currentUser && currentUser.role === "admin");
  },

  /**
   * Lưu hoặc xóa phiên đăng nhập quản trị viên
   * @param {boolean} state - true nếu đăng nhập, false nếu đăng xuất
   */
  setAdminSession(state) {
    if (state) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "authenticated");
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "authenticated");
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  },

  /* ================= ĐÁNH GIÁ KHÁCH HÀNG (REVIEWS) ================= */
  /**
   * Lấy danh sách đánh giá của khách hàng
   * @returns {Array<Object>}
   */
  getReviews() {
    return this._get(STORAGE_KEYS.REVIEWS, typeof DEFAULT_REVIEWS !== "undefined" ? DEFAULT_REVIEWS : []);
  },

  /**
   * Thêm đánh giá mới từ khách hàng
   * @param {Object} data
   * @returns {Object}
   */
  addReview(data) {
    const list = this.getReviews();
    const newRev = {
      id: "rev-" + Date.now(),
      author: data.author.trim(),
      role: data.role || "Khách hàng đã trải nghiệm",
      rating: Number(data.rating) || 5,
      comment: data.comment.trim(),
      date: new Date().toLocaleDateString("vi-VN"),
      createdAt: new Date().toISOString()
    };
    list.unshift(newRev);
    this._set(STORAGE_KEYS.REVIEWS, list);

    // Đồng bộ đánh giá lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRev)
    }).catch(err => console.warn("Lỗi lưu đánh giá lên SQL Server:", err));

    return newRev;
  },

  /* ================= TIN NHẮN LIÊN HỆ (CONTACT MESSAGES) ================= */
  /**
   * Lấy danh sách tin nhắn góp ý từ khách hàng
   * @returns {Array<Object>}
   */
  getContactMessages() {
    return this._get(STORAGE_KEYS.MESSAGES, []);
  },

  /**
   * Lưu tin nhắn liên hệ gửi từ form Contact
   * @param {Object} data
   * @returns {Object}
   */
  addContactMessage(data) {
    const list = this.getContactMessages();
    const msg = {
      id: "msg-" + Date.now(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : "",
      subject: data.subject || "Yêu cầu tư vấn dịch vụ",
      message: data.message.trim(),
      createdAt: new Date().toISOString()
    };
    list.unshift(msg);
    this._set(STORAGE_KEYS.MESSAGES, list);

    // Đồng bộ tin nhắn liên hệ lên SQL Server qua Node.js API
    fetch(`${this.API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    }).catch(err => console.warn("Lỗi lưu tin nhắn lên SQL Server:", err));

    return msg;
  },

  /* ================= XUẤT DỮ LIỆU EXCEL / CSV ================= */
  /**
   * Xuất toàn bộ danh sách lịch hẹn ra file CSV (chuẩn UTF-8 mở được trên Excel)
   */
  exportAppointmentsToCSV() {
    const list = this.getAppointments();
    if (!list || list.length === 0) {
      throw new Error("Chưa có dữ liệu lịch hẹn nào để xuất file!");
    }

    const headers = ["Mã Đơn", "Họ Tên", "Số Điện Thoại", "Dịch Vụ", "Kỹ Thuật Viên", "Ngày Hẹn", "Giờ Hẹn", "Tổng Tiền (VND)", "Hình Thức TT", "Trạng Thái", "Ghi Chú", "Ngày Tạo"];
    
    const rows = list.map(apt => {
      const s = this.getServiceById(apt.serviceId);
      const t = this.getTherapistById(apt.therapistId);
      const statusMap = {
        pending: "Chờ duyệt",
        confirmed: "Đã duyệt",
        completed: "Hoàn thành",
        cancelled: "Đã hủy"
      };

      return [
        `"${apt.id}"`,
        `"${(apt.customerName || '').replace(/"/g, '""')}"`,
        `"${apt.customerPhone || ''}"`,
        `"${(s ? s.name : 'Dịch vụ').replace(/"/g, '""')}"`,
        `"${(t ? t.name : 'Bất kỳ').replace(/"/g, '""')}"`,
        `"${apt.appointmentDate || ''}"`,
        `"${apt.appointmentTime || ''}"`,
        apt.finalPrice || 0,
        `"${apt.paymentMethod === 'banking' ? 'Chuyển khoản QR' : 'Tại quầy'}"`,
        `"${statusMap[apt.status] || apt.status}"`,
        `"${(apt.notes || '').replace(/"/g, '""')}"`,
        `"${new Date(apt.createdAt).toLocaleString('vi-VN')}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_Sach_Lich_Hen_WedSpa_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
};

/* ================= HÀM TIỆN ÍCH DÙNG CHUNG (UTILS) ================= */
const Utils = {
  /**
   * Định dạng số tiền sang chuẩn tiền tệ VND (VD: 390.000 ₫)
   * @param {number} amount
   * @returns {string}
   */
  formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return "0 ₫";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
  },

  /**
   * Chuyển đổi chuỗi ngày 'yyyy-mm-dd' sang 'dd/mm/yyyy'
   * @param {string} dateStr
   * @returns {string}
   */
  formatDate(dateStr) {
    if (!dateStr) return "";
    const p = dateStr.split("-");
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr;
  },

  /**
   * Lọc và escape ký tự đặc biệt chống lỗi bảo mật XSS
   * @param {string} str
   * @returns {string}
   */
  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Kiểm tra định dạng số điện thoại di động Việt Nam bằng Regex
   * Chuẩn: 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09
   * @param {string} phone
   * @returns {boolean}
   */
  isValidVietnamesePhone(phone) {
    return /^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(phone.replace(/[\s.-]/g, ""));
  },

  /**
   * Render HTML nhãn trạng thái tiếng Việt kèm biểu tượng và class màu sắc
   * @param {string} status - 'pending' | 'confirmed' | 'completed' | 'cancelled'
   * @returns {string} Chuỗi HTML của thẻ span badge
   */
  renderStatusBadge(status) {
    const map = {
      pending: { cls: "badge--pending", icon: "fa-regular fa-clock", text: "Chờ duyệt" },
      confirmed: { cls: "badge--confirmed", icon: "fa-regular fa-circle-check", text: "Đã duyệt" },
      completed: { cls: "badge--completed", icon: "fa-solid fa-check-double", text: "Hoàn thành" },
      cancelled: { cls: "badge--cancelled", icon: "fa-regular fa-circle-xmark", text: "Đã hủy" }
    };
    const s = map[status];
    if (s) {
      return `<span class="badge ${s.cls}"><i class="${s.icon}"></i> ${s.text}</span>`;
    }
    return `<span class="badge">${this.escapeHTML(status)}</span>`;
  }
};

// Tự động khởi chạy dữ liệu khi nạp script
StorageService.init();
