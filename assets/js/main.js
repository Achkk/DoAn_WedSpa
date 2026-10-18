/**
 * Xử lý chung toàn website: Navigation, Mobile Menu, Toast Notification, Modals
 * Tuân thủ mục 2.3 và 8 của PROJECT_RULES.md
 */

document.addEventListener("DOMContentLoaded", () => {
  initPendingToast();
  initMobileMenu();
  initActiveNavLink();
  initModalTriggers();
  initFloatingWidgets();
  initFaqAccordion();
  initFlashSaleCountdown();
  initAuthUI();
});

/* ================= TOAST NOTIFICATION ================= */
/**
 * Hiển thị thông báo Toast góc trên bên phải
 * @param {string} message - Nội dung thông báo
 * @param {string} type - 'success' | 'error' | 'info'
 */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast--error" : ""}`;

  const iconClass = type === "error" 
    ? "fa-solid fa-circle-exclamation" 
    : "fa-solid fa-circle-check";

  toast.innerHTML = `
    <div class="toast-content">
      <i class="${iconClass} toast-icon"></i>
      <span>${Utils.escapeHTML(message)}</span>
    </div>
    <button type="button" class="toast-close" aria-label="Đóng">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
  container.appendChild(toast);

  // Tự động biến mất sau 3.5 giây theo UX rule 8
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("is-fading");
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

/**
 * Hiển thị thông báo chờ từ các trang trước chuyển sang (VD: sau khi đăng xuất admin)
 */
function initPendingToast() {
  try {
    const pending = sessionStorage.getItem("spa_pending_toast");
    if (pending) {
      sessionStorage.removeItem("spa_pending_toast");
      const data = JSON.parse(pending);
      if (data && data.message) {
        setTimeout(() => {
          showToast(data.message, data.type || "info");
        }, 200);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/* ================= MOBILE MENU NAVIGATION ================= */
function initMobileMenu() {
  const burgerBtn = document.querySelector(".header_burger");
  const menu = document.querySelector(".header_menu");
  if (!burgerBtn || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("is-active");
    const icon = burgerBtn.querySelector("i");
    if (icon) icon.className = "fa-solid fa-bars";
  };

  burgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = menu.classList.toggle("is-active");
    const icon = burgerBtn.querySelector("i");
    if (icon) icon.className = isActive ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });

  // Tự động đóng menu khi click ra ngoài hoặc click vào link
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !burgerBtn.contains(e.target)) closeMenu();
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
}

/* ================= ĐÁNH DẤU TRANG HIỆN TẠI (ACTIVE NAV LINK) ================= */
function initActiveNavLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".header_link").forEach(link => {
    const linkPath = link.getAttribute("href");
    const isCurrent = linkPath === currentPath || (!currentPath.endsWith(".html") && linkPath === "index.html");
    link.classList.toggle("is-active", isCurrent);
  });
}

/* ================= HỆ THỐNG MODAL DÙNG CHUNG ================= */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("is-open");
  if (!document.querySelector(".modal-overlay.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

function initModalTriggers() {
  // Lắng nghe các nút đóng modal qua attribute data-close-modal
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay");
      if (modal) closeModal(modal.id);
    });
  });

  // Đóng khi click vào lớp nền overlay
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Đóng bằng phím Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModalElem = document.querySelector(".modal-overlay.is-open");
      if (openModalElem) closeModal(openModalElem.id);
    }
  });
}

/* ================= FLOATING WIDGETS (BACK TO TOP) ================= */
function initFloatingWidgets() {
  // Không hiển thị trên trang Admin để tránh vướng víu bảng biểu
  if (window.location.pathname.includes("admin.html")) return;

  const wrap = document.createElement("div");
  wrap.className = "floating-widgets";
  wrap.innerHTML = `
    <button type="button" class="float-btn float-btn--backtop" id="btn-back-to-top" title="Lên đầu trang" aria-label="Cuộn lên đầu trang">
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  `;
  document.body.appendChild(wrap);

  const backTopBtn = wrap.querySelector("#btn-back-to-top");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backTopBtn.classList.add("is-visible");
    } else {
      backTopBtn.classList.remove("is-visible");
    }
  });

  backTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ================= FAQ ACCORDION ================= */
function initFaqAccordion() {
  document.querySelectorAll(".faq-question").forEach(questionBtn => {
    questionBtn.addEventListener("click", () => {
      const parentItem = questionBtn.closest(".faq-item");
      const isCurrentlyOpen = parentItem.classList.contains("is-open");

      // Đóng các câu hỏi khác cùng nhóm
      document.querySelectorAll(".faq-item").forEach(item => item.classList.remove("is-open"));

      // Đảo trạng thái câu hỏi hiện tại
      if (!isCurrentlyOpen) {
        parentItem.classList.add("is-open");
      }
    });
  });
}

/* ================= FLASH SALE COUNTDOWN TIMER ================= */
function initFlashSaleCountdown() {
  const elHours = document.getElementById("flash-hours");
  const elMinutes = document.getElementById("flash-minutes");
  const elSeconds = document.getElementById("flash-seconds");
  if (!elHours || !elMinutes || !elSeconds) return;

  // Đếm ngược 8 tiếng cố định mỗi ngày
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  function updateTimer() {
    const remaining = Math.max(0, endOfDay.getTime() - new Date().getTime());
    const totalSecs = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    elHours.textContent = String(hours).padStart(2, "0");
    elMinutes.textContent = String(mins).padStart(2, "0");
    elSeconds.textContent = String(secs).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ================= HỆ THỐNG XÁC THỰC THÀNH VIÊN & ADMIN (AUTH MODAL & HEADER) ================= */
function initAuthUI() {
  if (window.location.pathname.includes("admin.html")) return;

  // 1. Khởi tạo nút tài khoản trên Header
  const headerActions = document.querySelector(".header_actions");
  let userSlot = document.getElementById("header-user-slot");
  if (headerActions && !userSlot) {
    userSlot = document.createElement("div");
    userSlot.id = "header-user-slot";
    userSlot.className = "header-user-slot";
    headerActions.prepend(userSlot);
  }

  function renderHeaderUser() {
    if (!userSlot) return;
    const user = StorageService.getCurrentUser();

    if (!user) {
      userSlot.innerHTML = `
        <button type="button" class="btn btn--secondary btn-sm" id="btn-open-auth-modal" title="Đăng nhập hoặc Đăng ký thành viên">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> <span>Đăng Nhập / Đăng Ký</span>
        </button>
      `;
      userSlot.querySelector("#btn-open-auth-modal")?.addEventListener("click", () => {
        openModal("auth-modal");
      });
    } else {
      userSlot.innerHTML = `
        <div class="user-profile-menu-wrap">
          <button type="button" class="btn btn--secondary btn-sm btn-user-profile" id="btn-user-profile-toggle" aria-expanded="false">
            <i class="${user.role === 'admin' ? 'fa-solid fa-user-shield text-primary' : 'fa-solid fa-circle-user text-primary'}"></i>
            <span class="user-display-name">${Utils.escapeHTML(user.fullName || user.username)}</span>
            <i class="fa-solid fa-chevron-down user-caret"></i>
          </button>
          <div class="user-dropdown-popover d-none" id="user-dropdown-popover">
            <div class="user-popover-header">
              <div class="user-popover-name">${Utils.escapeHTML(user.fullName || user.username)}</div>
              <div class="user-popover-role">${user.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên Thân Thiết'}</div>
            </div>
            <div class="user-popover-links">
              ${user.role === 'admin' ? `
                <a href="admin.html" class="user-popover-link"><i class="fa-solid fa-gauge-high text-primary"></i> Bảng Điều Khiển Admin</a>
              ` : `
                <a href="my-bookings.html" class="user-popover-link"><i class="fa-solid fa-calendar-check text-primary"></i> Lịch Hẹn Của Tôi</a>
                <a href="booking.html" class="user-popover-link"><i class="fa-solid fa-calendar-plus text-primary"></i> Đặt Lịch Hẹn Mới</a>
              `}
              <button type="button" class="user-popover-link user-popover-logout" id="btn-global-logout">
                <i class="fa-solid fa-right-from-bracket"></i> Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      `;

      const btnToggle = userSlot.querySelector("#btn-user-profile-toggle");
      const popover = userSlot.querySelector("#user-dropdown-popover");
      const btnLogout = userSlot.querySelector("#btn-global-logout");

      btnToggle?.addEventListener("click", (e) => {
        e.stopPropagation();
        popover?.classList.toggle("d-none");
      });

      btnLogout?.addEventListener("click", () => {
        StorageService.logoutUser();
        showToast("Đã đăng xuất tài khoản thành công.", "info");
        renderHeaderUser();
      });

      document.addEventListener("click", (e) => {
        if (!userSlot.contains(e.target)) {
          popover?.classList.add("d-none");
        }
      });
    }
  }

  renderHeaderUser();

  // 2. Tự động sinh Auth Modal nếu chưa có trong DOM
  if (!document.getElementById("auth-modal")) {
    const authModal = document.createElement("div");
    authModal.className = "modal-overlay";
    authModal.id = "auth-modal";
    authModal.innerHTML = `
      <div class="modal-box modal-auth-box">
        <div class="modal-header">
          <div class="auth-tabs-nav">
            <button type="button" class="auth-tab-btn is-active" id="tab-login-btn">
              <i class="fa-solid fa-right-to-bracket"></i> Đăng Nhập
            </button>
            <button type="button" class="auth-tab-btn" id="tab-register-btn">
              <i class="fa-solid fa-user-plus"></i> Đăng Ký
            </button>
          </div>
          <button type="button" class="modal-close" data-close-modal aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body auth-modal-body">
          <!-- FORM ĐĂNG NHẬP -->
          <form id="form-auth-login" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="login-identifier">Số điện thoại / Email / Tên đăng nhập <span class="required">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-user input-icon"></i>
                <input type="text" id="login-identifier" class="form-control" placeholder="VD: 0912345678 hoặc admin" required autocomplete="username">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Mật khẩu <span class="required">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock input-icon"></i>
                <input type="password" id="login-password" class="form-control" placeholder="Nhập mật khẩu..." required autocomplete="current-password">
              </div>
            </div>

            <!-- GỢI Ý TÀI KHOẢN MẪU -->
            <div class="auth-demo-accounts">
              <div class="auth-demo-title"><i class="fa-solid fa-wand-magic-sparkles text-primary"></i> Tài khoản mẫu dùng thử:</div>
              <div class="auth-demo-pills">
                <button type="button" class="btn-demo-fill" data-user="member">
                  <strong>Thành viên:</strong> 0912345678 / 123456 (Trần Mai Anh)
                </button>
                <button type="button" class="btn-demo-fill" data-user="admin">
                  <strong>Admin:</strong> admin / admin123 (Toàn quyền)
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn--primary w-100 btn-lg mt-10">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng Nhập
            </button>

            <div class="auth-switch-prompt">
              Chưa có tài khoản thành viên? <a href="#" id="link-switch-to-register">Đăng ký ngay tại đây</a>
            </div>
          </form>

          <!-- FORM ĐĂNG KÝ THÀNH VIÊN -->
          <form id="form-auth-register" class="auth-form d-none">
            <div class="form-group">
              <label class="form-label" for="reg-fullname">Họ và tên của bạn <span class="required">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-id-card input-icon"></i>
                <input type="text" id="reg-fullname" class="form-control" placeholder="VD: Nguyễn Thị Lan" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-phone">Số điện thoại di động <span class="required">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-phone input-icon"></i>
                <input type="tel" id="reg-phone" class="form-control" placeholder="VD: 0912 345 678" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Địa chỉ Email <span class="required">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-envelope input-icon"></i>
                <input type="email" id="reg-email" class="form-control" placeholder="VD: lannguyen@gmail.com" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Mật khẩu bảo mật <span class="required">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock input-icon"></i>
                <input type="password" id="reg-password" class="form-control" placeholder="Tối thiểu 6 ký tự" minlength="6" required>
              </div>
            </div>

            <button type="submit" class="btn btn--primary w-100 btn-lg mt-10">
              <i class="fa-solid fa-user-plus"></i> Đăng Ký Tài Khoản
            </button>

            <div class="auth-switch-prompt">
              Đã có tài khoản? <a href="#" id="link-switch-to-login">Đăng nhập tại đây</a>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(authModal);

    // Chuyển tab Đăng nhập / Đăng ký
    const tabLoginBtn = authModal.querySelector("#tab-login-btn");
    const tabRegisterBtn = authModal.querySelector("#tab-register-btn");
    const formLogin = authModal.querySelector("#form-auth-login");
    const formRegister = authModal.querySelector("#form-auth-register");
    const linkSwitchRegister = authModal.querySelector("#link-switch-to-register");
    const linkSwitchLogin = authModal.querySelector("#link-switch-to-login");

    function switchToTab(isLogin) {
      tabLoginBtn.classList.toggle("is-active", isLogin);
      tabRegisterBtn.classList.toggle("is-active", !isLogin);
      formLogin.classList.toggle("d-none", !isLogin);
      formRegister.classList.toggle("d-none", isLogin);
    }

    tabLoginBtn?.addEventListener("click", () => switchToTab(true));
    tabRegisterBtn?.addEventListener("click", () => switchToTab(false));
    linkSwitchRegister?.addEventListener("click", (e) => { e.preventDefault(); switchToTab(false); });
    linkSwitchLogin?.addEventListener("click", (e) => { e.preventDefault(); switchToTab(true); });

    // Nạp nhanh tài khoản demo
    authModal.querySelectorAll(".btn-demo-fill").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.user;
        const inputId = authModal.querySelector("#login-identifier");
        const inputPass = authModal.querySelector("#login-password");
        if (type === "member") {
          inputId.value = "0912345678";
          inputPass.value = "123456";
        } else if (type === "admin") {
          inputId.value = "admin";
          inputPass.value = "admin123";
        }
      });
    });

    // Xử lý nộp form Đăng Nhập
    formLogin?.addEventListener("submit", (e) => {
      e.preventDefault();
      const identifier = authModal.querySelector("#login-identifier").value.trim();
      const password = authModal.querySelector("#login-password").value.trim();

      try {
        const user = StorageService.loginUser(identifier, password);
        closeModal("auth-modal");
        renderHeaderUser();

        if (user.role === "admin") {
          showToast("Đăng nhập Quản trị viên thành công! Đang chuyển hướng...", "success");
          setTimeout(() => window.location.href = "admin.html", 600);
        } else {
          showToast(`Chào mừng ${user.fullName} đã quay trở lại!`, "success");
          // Tự động điền trang booking nếu đang mở
          const nameInput = document.getElementById("customer-name");
          const phoneInput = document.getElementById("customer-phone");
          if (nameInput) nameInput.value = user.fullName;
          if (phoneInput) phoneInput.value = user.phone;

          // Tự động tra cứu nếu đang ở trang my-bookings
          const lookupPhone = document.getElementById("lookup-phone");
          const searchBtn = document.getElementById("search-booking-form")?.querySelector("button[type='submit']");
          if (lookupPhone && searchBtn) {
            lookupPhone.value = user.phone;
            searchBtn.click();
          }
        }
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    // Xử lý nộp form Đăng Ký
    formRegister?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = authModal.querySelector("#reg-fullname").value.trim();
      const phone = authModal.querySelector("#reg-phone").value.trim();
      const email = authModal.querySelector("#reg-email").value.trim();
      const password = authModal.querySelector("#reg-password").value.trim();

      if (!Utils.isValidVietnamesePhone(phone)) {
        return showToast("Số điện thoại không đúng định dạng (10 số, đầu 03, 05, 07, 08, 09)!", "error");
      }

      try {
        const user = StorageService.registerUser({ fullName, phone, email, password });
        closeModal("auth-modal");
        renderHeaderUser();
        showToast(`Đăng ký thành viên thành công! Xin chào ${user.fullName}`, "success");

        const nameInput = document.getElementById("customer-name");
        const phoneInput = document.getElementById("customer-phone");
        if (nameInput) nameInput.value = user.fullName;
        if (phoneInput) phoneInput.value = user.phone;

        // Tự động tra cứu nếu đang ở trang my-bookings
        const lookupPhone = document.getElementById("lookup-phone");
        const searchBtn = document.getElementById("search-booking-form")?.querySelector("button[type='submit']");
        if (lookupPhone && searchBtn) {
          lookupPhone.value = user.phone;
          searchBtn.click();
        }
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    // Đăng ký trigger đóng modal
    authModal.querySelectorAll("[data-close-modal]").forEach(b => {
      b.addEventListener("click", () => closeModal("auth-modal"));
    });
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) closeModal("auth-modal");
    });
  }
}
