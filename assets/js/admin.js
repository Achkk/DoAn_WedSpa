/**
 * Logic quản trị viên Dashboard (Admin Operations)
 * Tuân thủ mục 1.3, 7 và 8 của PROJECT_RULES.md
 */

document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_PIN = "1234";

  // Elements Auth
  const authOverlay = document.getElementById("admin-auth-overlay");
  const dashboardApp = document.getElementById("admin-dashboard-app");
  const pinForm = document.getElementById("admin-pin-form");
  const pinInput = document.getElementById("admin-pin-input");
  const btnLogout = document.getElementById("btn-admin-logout");

  // Elements Nav Tabs & Views
  const navTabAppointments = document.getElementById("nav-tab-appointments");
  const navTabServices = document.getElementById("nav-tab-services");
  const navTabVouchers = document.getElementById("nav-tab-vouchers");
  const navTabMessages = document.getElementById("nav-tab-messages");

  const viewAppointments = document.getElementById("view-appointments-section");
  const viewServices = document.getElementById("view-services-section");
  const viewVouchers = document.getElementById("view-vouchers-section");
  const viewMessages = document.getElementById("view-messages-section");
  const pageHeading = document.getElementById("page-heading");

  // Metrics & Ratio Elements
  const metricTotal = document.getElementById("metric-total-count");
  const metricPending = document.getElementById("metric-pending-count");
  const metricConfirmed = document.getElementById("metric-confirmed-count");
  const metricRevenue = document.getElementById("metric-revenue");

  const ratioTotalLabel = document.getElementById("ratio-total-label");
  const ratioBarPending = document.getElementById("ratio-bar-pending");
  const ratioBarConfirmed = document.getElementById("ratio-bar-confirmed");
  const ratioBarCompleted = document.getElementById("ratio-bar-completed");
  const ratioBarCancelled = document.getElementById("ratio-bar-cancelled");
  const ratioValPending = document.getElementById("ratio-val-pending");
  const ratioValConfirmed = document.getElementById("ratio-val-confirmed");
  const ratioValCompleted = document.getElementById("ratio-val-completed");
  const ratioValCancelled = document.getElementById("ratio-val-cancelled");

  // Filters & Tables
  const searchInput = document.getElementById("admin-search-input");
  const statusFilter = document.getElementById("admin-status-filter");
  const dateFilter = document.getElementById("admin-date-filter");
  const btnResetFilters = document.getElementById("btn-reset-filters");
  const btnExportCSV = document.getElementById("btn-export-csv");

  const appointmentsTbody = document.getElementById("admin-appointments-tbody");
  const servicesTbody = document.getElementById("admin-services-tbody");
  const vouchersTbody = document.getElementById("admin-vouchers-tbody");
  const messagesTbody = document.getElementById("admin-messages-tbody");

  /* ================= 1. XÁC THỰC MÃ PIN BẢO MẬT ================= */
  function checkAuth() {
    const isLoggedIn = StorageService.isAdminLoggedIn();
    authOverlay.classList.toggle("d-none", isLoggedIn);
    dashboardApp.classList.toggle("d-none", !isLoggedIn);
    if (isLoggedIn) {
      renderDashboard();
    } else {
      setTimeout(() => pinInput.focus(), 100);
    }
  }

  pinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = pinInput.value.trim();
    if (pin === DEFAULT_PIN || pin === "admin123" || pin === "admin") {
      StorageService.setAdminSession(true);
      const adminUser = StorageService.getUserByIdentifier("admin") || {
        id: "admin-master",
        username: "admin",
        fullName: "Quản Trị Viên",
        email: "admin@wedspa.com",
        role: "admin"
      };
      StorageService.setCurrentUser(adminUser);
      showToast("Đăng nhập quản trị thành công!", "success");
      checkAuth();
    } else {
      showToast("Mã PIN hoặc mật khẩu không chính xác! Vui lòng thử lại.", "error");
      pinInput.value = "";
      pinInput.focus();
    }
  });

  btnLogout.addEventListener("click", () => {
    StorageService.logoutUser();
    sessionStorage.setItem("spa_pending_toast", JSON.stringify({
      message: "Đã đăng xuất khỏi phiên quản trị và quay về trang chủ.",
      type: "info"
    }));
    window.location.href = "index.html";
  });

  /* ================= 1.1. ĐẨY RA / THU GỌN THANH SIDEBAR BÊN TRÁI ================= */
  const sidebar = document.getElementById("admin-sidebar");
  const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");

  if (btnToggleSidebar && sidebar) {
    // Đọc trạng thái đã lưu: mặc định là thu gọn (chỉ còn icon) theo yêu cầu
    const isExpanded = localStorage.getItem("spa_admin_sidebar_expanded") === "true";
    sidebar.classList.toggle("is-collapsed", !isExpanded);
    updateToggleBtnState(!isExpanded);

    btnToggleSidebar.addEventListener("click", () => {
      const isCurrentlyCollapsed = sidebar.classList.contains("is-collapsed");
      const willBeCollapsed = !isCurrentlyCollapsed;
      sidebar.classList.toggle("is-collapsed", willBeCollapsed);
      localStorage.setItem("spa_admin_sidebar_expanded", String(!willBeCollapsed));
      updateToggleBtnState(willBeCollapsed);
    });

    function updateToggleBtnState(collapsed) {
      if (collapsed) {
        btnToggleSidebar.setAttribute("title", "Đẩy ra để hiện chữ");
        btnToggleSidebar.setAttribute("aria-label", "Đẩy ra để hiện chữ");
        btnToggleSidebar.innerHTML = `<i class="fa-solid fa-bars"></i>`;
      } else {
        btnToggleSidebar.setAttribute("title", "Thu gọn chỉ còn icon");
        btnToggleSidebar.setAttribute("aria-label", "Thu gọn chỉ còn icon");
        btnToggleSidebar.innerHTML = `<i class="fa-solid fa-angles-left"></i>`;
      }
    }
  }

  /* ================= 2. CHUYỂN TAB ĐIỀU HƯỚNG ================= */
  function switchTab(activeNav, activeView, title) {
    [navTabAppointments, navTabServices, navTabVouchers, navTabMessages].forEach(tab => tab?.classList.remove("is-active"));
    [viewAppointments, viewServices, viewVouchers, viewMessages].forEach(v => v?.classList.add("d-none"));
    activeNav.classList.add("is-active");
    activeView.classList.remove("d-none");
    pageHeading.textContent = title;
  }

  navTabAppointments.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navTabAppointments, viewAppointments, "Bảng Điều Khiển Lịch Hẹn");
    renderAppointmentsTable();
  });

  if (navTabServices) {
    navTabServices.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(navTabServices, viewServices, "Quản Lý Danh Mục Dịch Vụ Spa");
      renderServicesTable();
    });
  }

  navTabVouchers.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navTabVouchers, viewVouchers, "Quản Lý Mã Khuyến Mãi (Vouchers)");
    renderVouchersTable();
  });

  if (navTabMessages) {
    navTabMessages.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(navTabMessages, viewMessages, "Hộp Thư Yêu Cầu & Góp Ý Của Khách");
      renderMessagesTable();
    });
  }

  /* ================= 3. RENDER METRICS & STATUS RATIO BAR ================= */
  function renderMetrics() {
    const list = StorageService.getAppointments();
    const total = list.length;
    const cPending = list.filter(a => a.status === "pending").length;
    const cConfirmed = list.filter(a => a.status === "confirmed").length;
    const cCompleted = list.filter(a => a.status === "completed").length;
    const cCancelled = list.filter(a => a.status === "cancelled").length;

    metricTotal.textContent = total;
    metricPending.textContent = cPending;
    metricConfirmed.textContent = cConfirmed;

    const revenue = list
      .filter(a => a.status !== "cancelled")
      .reduce((sum, a) => sum + (Number(a.finalPrice) || 0), 0);
    metricRevenue.textContent = Utils.formatCurrency(revenue);

    // Tính phần trăm thanh tỷ lệ trực quan
    if (ratioTotalLabel) {
      ratioTotalLabel.textContent = `Tổng cộng: ${total} ca hẹn`;
      const pPending = total ? Math.round((cPending / total) * 100) : 0;
      const pConfirmed = total ? Math.round((cConfirmed / total) * 100) : 0;
      const pCompleted = total ? Math.round((cCompleted / total) * 100) : 0;
      const pCancelled = total ? Math.round((cCancelled / total) * 100) : 0;

      ratioBarPending.style.width = pPending + "%";
      ratioBarConfirmed.style.width = pConfirmed + "%";
      ratioBarCompleted.style.width = pCompleted + "%";
      ratioBarCancelled.style.width = pCancelled + "%";

      ratioValPending.textContent = `${pPending}% (${cPending})`;
      ratioValConfirmed.textContent = `${pConfirmed}% (${cConfirmed})`;
      ratioValCompleted.textContent = `${pCompleted}% (${cCompleted})`;
      ratioValCancelled.textContent = `${pCancelled}% (${cCancelled})`;
    }
  }

  // Xử lý xuất file Excel / CSV
  if (btnExportCSV) {
    btnExportCSV.addEventListener("click", () => {
      try {
        StorageService.exportAppointmentsToCSV();
        showToast("Đã xuất danh sách lịch hẹn ra file CSV (Excel) thành công!", "success");
      } catch (err) {
        showToast("Không thể xuất file: " + err.message, "error");
      }
    });
  }

  /* ================= 4. BẢNG DỮ LIỆU LỊCH HẸN ================= */
  function renderAppointmentsTable() {
    renderMetrics();
    const list = StorageService.getAppointments();
    const q = searchInput.value.trim().toLowerCase();
    const st = statusFilter.value;
    const dt = dateFilter.value;

    const filtered = list.filter(apt => {
      if (st !== "all" && apt.status !== st) return false;
      if (dt && apt.appointmentDate !== dt) return false;
      if (q) {
        const match = apt.id.toLowerCase().includes(q) ||
          apt.customerName.toLowerCase().includes(q) ||
          apt.customerPhone.includes(q);
        if (!match) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      appointmentsTbody.innerHTML = `
        <tr>
          <td colspan="8" class="table-empty-cell">
            Không tìm thấy lịch hẹn nào phù hợp với bộ lọc hiện tại.
          </td>
        </tr>
      `;
      return;
    }

    appointmentsTbody.innerHTML = filtered.map(apt => {
      const service = StorageService.getServiceById(apt.serviceId);
      const therapist = StorageService.getTherapistById(apt.therapistId);
      const therapistName = therapist ? therapist.name : "Bất kỳ";

      return `
        <tr>
          <td><span class="appointment-id">${apt.id}</span></td>
          <td>
            <div class="table-cell-title">${Utils.escapeHTML(apt.customerName)}</div>
            <div class="table-cell-sub">${Utils.escapeHTML(apt.customerPhone)}</div>
          </td>
          <td>
            <div class="table-cell-title">${Utils.escapeHTML(service ? service.name : 'Dịch vụ')}</div>
            <div class="table-cell-sub-sm">${service ? service.duration + ' phút' : ''}</div>
          </td>
          <td><span class="table-cell-sub">${Utils.escapeHTML(therapistName)}</span></td>
          <td>
            <div class="table-cell-title">${apt.appointmentTime}</div>
            <div class="table-cell-sub-sm">${Utils.formatDate(apt.appointmentDate)}</div>
          </td>
          <td>
            <div class="table-cell-price">${Utils.formatCurrency(apt.finalPrice)}</div>
            <div class="table-cell-payment">${apt.paymentMethod === 'banking' ? 'Chuyển khoản QR' : 'Tại quầy'}</div>
          </td>
          <td>${Utils.renderStatusBadge(apt.status)}</td>
          <td class="text-right">
            <div class="table-actions table-actions-end">
              <button type="button" class="action-btn" title="Xem chi tiết" data-action="view" data-id="${apt.id}">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button type="button" class="action-btn action-btn--edit" title="Sửa thông tin lịch hẹn" data-action="edit" data-id="${apt.id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              ${apt.status === 'pending' ? `
                <button type="button" class="action-btn action-btn--approve" title="Duyệt ca" data-action="confirm" data-id="${apt.id}">
                  <i class="fa-solid fa-check"></i>
                </button>
              ` : ''}
              ${apt.status === 'confirmed' ? `
                <button type="button" class="action-btn action-btn--complete" title="Hoàn thành ca" data-action="complete" data-id="${apt.id}">
                  <i class="fa-solid fa-check-double"></i>
                </button>
              ` : ''}
              ${(apt.status === 'pending' || apt.status === 'confirmed') ? `
                <button type="button" class="action-btn action-btn--cancel" title="Hủy ca" data-action="cancel" data-id="${apt.id}">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              ` : ''}
              <button type="button" class="action-btn action-btn--delete" title="Xóa lịch hẹn" data-action="delete" data-id="${apt.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Event delegation cho các nút thao tác trên bảng lịch hẹn
  appointmentsTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    const apt = StorageService.getAppointmentById(id);
    if (!apt) return;

    if (action === "view") {
      showAppointmentDetail(apt);
    } else if (action === "edit") {
      openEditAppointmentModal(apt);
    } else if (action === "confirm") {
      StorageService.updateAppointmentStatus(id, "confirmed");
      showToast(`Đã duyệt lịch hẹn ${id}!`, "success");
      renderAppointmentsTable();
    } else if (action === "complete") {
      StorageService.updateAppointmentStatus(id, "completed");
      showToast(`Đã hoàn thành ca hẹn ${id}!`, "success");
      renderAppointmentsTable();
    } else if (action === "cancel") {
      if (confirm(`Bạn có chắc muốn hủy lịch hẹn ${id}?`)) {
        StorageService.updateAppointmentStatus(id, "cancelled");
        showToast(`Đã hủy ca hẹn ${id}!`, "info");
        renderAppointmentsTable();
      }
    } else if (action === "delete") {
      if (confirm(`Bạn có chắc muốn xóa vĩnh viễn lịch hẹn ${id}? Thao tác này không thể hoàn tác.`)) {
        StorageService.deleteAppointment(id);
        showToast(`Đã xóa vĩnh viễn lịch hẹn ${id}!`, "info");
        renderAppointmentsTable();
      }
    }
  });

  /* ================= 4.1. CHỈNH SỬA LỊCH HẸN (EDIT APPOINTMENT) ================= */
  const formEditAppointment = document.getElementById("form-edit-appointment");
  const editAptId = document.getElementById("edit-apt-id");
  const editAptCode = document.getElementById("edit-apt-code");
  const editAptName = document.getElementById("edit-apt-name");
  const editAptPhone = document.getElementById("edit-apt-phone");
  const editAptService = document.getElementById("edit-apt-service");
  const editAptTherapist = document.getElementById("edit-apt-therapist");
  const editAptDate = document.getElementById("edit-apt-date");
  const editAptTime = document.getElementById("edit-apt-time");
  const editAptStatus = document.getElementById("edit-apt-status");
  const editAptPayment = document.getElementById("edit-apt-payment");
  const editAptPrice = document.getElementById("edit-apt-price");
  const editAptNotes = document.getElementById("edit-apt-notes");

  function openEditAppointmentModal(apt) {
    if (!formEditAppointment) return;
    editAptId.value = apt.id;
    editAptCode.textContent = `(${apt.id})`;
    editAptName.value = apt.customerName;
    editAptPhone.value = apt.customerPhone;

    // Nạp danh sách dịch vụ vào select
    const services = StorageService.getServices();
    editAptService.innerHTML = services.map(s => `
      <option value="${s.id}" ${s.id === apt.serviceId ? 'selected' : ''}>
        ${Utils.escapeHTML(s.name)} - ${Utils.formatCurrency(s.price)}
      </option>
    `).join("");

    // Nạp danh sách KTV vào select
    const therapists = StorageService.getTherapists();
    editAptTherapist.innerHTML = `
      <option value="any">Hệ thống sắp xếp ngẫu nhiên</option>
      ${therapists.map(t => `
        <option value="${t.id}" ${t.id === apt.therapistId ? 'selected' : ''}>
          ${Utils.escapeHTML(t.name)} (${t.title})
        </option>
      `).join("")}
    `;

    // Nạp ngày & giờ
    editAptDate.value = apt.appointmentDate;
    editAptTime.innerHTML = AVAILABLE_TIME_SLOTS.map(slot => `
      <option value="${slot}" ${slot === apt.appointmentTime ? 'selected' : ''}>
        ${slot}
      </option>
    `).join("");

    editAptStatus.value = apt.status;
    editAptPayment.value = apt.paymentMethod || "cash";
    editAptPrice.value = apt.finalPrice;
    editAptNotes.value = apt.notes || "";

    openModal("edit-appointment-modal");
  }

  // Tự cập nhật giá khi đổi dịch vụ trong modal edit
  if (editAptService) {
    editAptService.addEventListener("change", () => {
      const selectedService = StorageService.getServiceById(editAptService.value);
      if (selectedService) {
        editAptPrice.value = selectedService.price;
      }
    });
  }

  if (formEditAppointment) {
    formEditAppointment.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = editAptId.value;
      const updated = {
        customerName: editAptName.value.trim(),
        customerPhone: editAptPhone.value.trim(),
        serviceId: editAptService.value,
        therapistId: editAptTherapist.value,
        appointmentDate: editAptDate.value,
        appointmentTime: editAptTime.value,
        status: editAptStatus.value,
        paymentMethod: editAptPayment.value,
        finalPrice: Number(editAptPrice.value),
        notes: editAptNotes.value.trim()
      };

      if (!Utils.isValidVietnamesePhone(updated.customerPhone)) {
        return showToast("Số điện thoại không đúng định dạng (10 số, bắt đầu 03, 05, 07, 08, 09)!", "error");
      }

      const res = StorageService.updateAppointment(id, updated);
      if (res) {
        closeModal("edit-appointment-modal");
        showToast(`Đã cập nhật lịch hẹn ${id} thành công!`, "success");
        renderAppointmentsTable();
      } else {
        showToast("Không thể cập nhật lịch hẹn!", "error");
      }
    });
  }

  function showAppointmentDetail(apt) {
    const service = StorageService.getServiceById(apt.serviceId);
    const therapist = StorageService.getTherapistById(apt.therapistId);
    const therapistName = therapist ? therapist.name : "Hệ thống sắp xếp ngẫu nhiên";

    document.getElementById("detail-apt-code").textContent = `(${apt.id})`;
    document.getElementById("detail-modal-body").innerHTML = `
      <div class="detail-info-box">
        <div class="detail-row"><span class="label">Trạng thái hiện tại:</span><div>${Utils.renderStatusBadge(apt.status)}</div></div>
        <div class="detail-row"><span class="label">Họ tên khách hàng:</span><strong>${Utils.escapeHTML(apt.customerName)}</strong></div>
        <div class="detail-row"><span class="label">Số điện thoại:</span><a href="tel:${apt.customerPhone}" class="text-primary fw-bold">${Utils.escapeHTML(apt.customerPhone)}</a></div>
        <div class="detail-row"><span class="label">Dịch vụ đã chọn:</span><strong>${Utils.escapeHTML(service ? service.name : '')} (${service ? service.duration + 'p' : ''})</strong></div>
        <div class="detail-row"><span class="label">Kỹ thuật viên:</span><strong>${Utils.escapeHTML(therapistName)}</strong></div>
        <div class="detail-row"><span class="label">Thời gian hẹn:</span><strong class="text-primary">${apt.appointmentTime} - Ngày ${Utils.formatDate(apt.appointmentDate)}</strong></div>
        <div class="detail-row"><span class="label">Hình thức thanh toán:</span><strong>${apt.paymentMethod === 'banking' ? 'Chuyển khoản QR ngân hàng' : 'Thanh toán tại quầy'}</strong></div>
        ${apt.voucherCode ? `
          <div class="detail-row text-success">
            <span>Mã Voucher (${apt.voucherCode}):</span>
            <strong>-${Utils.formatCurrency(apt.discountAmount)}</strong>
          </div>
        ` : ''}
        <div class="detail-total-row">
          <span>Tổng tiền thanh toán:</span>
          <span class="detail-total-val">${Utils.formatCurrency(apt.finalPrice)}</span>
        </div>
      </div>

      <div>
        <label class="form-label">Ghi chú từ khách hàng:</label>
        <div class="detail-notes-box">
          ${apt.notes ? Utils.escapeHTML(apt.notes) : 'Không có ghi chú thêm.'}
        </div>
      </div>

      <div class="detail-created-at">
        Thời gian tạo đơn: ${new Date(apt.createdAt).toLocaleString('vi-VN')}
      </div>
    `;

    openModal("appointment-detail-modal");
  }

  // Filter Listeners
  searchInput.addEventListener("input", renderAppointmentsTable);
  statusFilter.addEventListener("change", renderAppointmentsTable);
  dateFilter.addEventListener("change", renderAppointmentsTable);
  btnResetFilters.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "all";
    dateFilter.value = "";
    const list = StorageService.getAppointments();
    if (!list || list.length === 0) {
      StorageService.resetDefaults();
      showToast("Đã khôi phục 10 lịch hẹn mẫu thành công!", "success");
    }
    renderAppointmentsTable();
  });

  /* ================= 5. BẢNG MÃ GIẢM GIÁ (VOUCHERS) ================= */
  function renderVouchersTable() {
    const list = StorageService.getVouchers();
    vouchersTbody.innerHTML = list.map(v => `
      <tr>
        <td><strong class="voucher-code">${Utils.escapeHTML(v.code)}</strong></td>
        <td>${Utils.escapeHTML(v.description || '--')}</td>
        <td>${v.type === 'percent' ? 'Phần trăm (%)' : 'Cố định (₫)'}</td>
        <td><strong>${v.type === 'percent' ? v.value + '%' : Utils.formatCurrency(v.value)}</strong></td>
        <td>${v.minOrder > 0 ? Utils.formatCurrency(v.minOrder) : 'Mọi đơn hàng'}</td>
        <td>
          <span class="badge ${v.isActive ? 'badge--completed' : 'badge--cancelled'}">
            ${v.isActive ? 'Đang kích hoạt' : 'Tạm dừng'}
          </span>
        </td>
        <td class="text-right">
          <button type="button" class="btn btn--secondary btn-sm btn-toggle-v" data-id="${v.id}" data-code="${v.code}">
            ${v.isActive ? 'Tạm tắt' : 'Bật lại'}
          </button>
        </td>
      </tr>
    `).join("");
  }

  // Event delegation cho bật/tắt voucher
  vouchersTbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-toggle-v");
    if (!btn) return;
    const { id, code } = btn.dataset;
    StorageService.toggleVoucherStatus(id);
    showToast(`Đã thay đổi trạng thái voucher ${code}!`, "info");
    renderVouchersTable();
  });

  // Form Thêm Voucher
  const btnOpenCreateVoucher = document.getElementById("btn-open-create-voucher");
  const formCreateVoucher = document.getElementById("form-create-voucher");

  btnOpenCreateVoucher.addEventListener("click", () => {
    formCreateVoucher.reset();
    openModal("create-voucher-modal");
  });

  formCreateVoucher.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("new-v-code").value.trim().toUpperCase();
    const desc = document.getElementById("new-v-desc").value.trim();
    const type = document.getElementById("new-v-type").value;
    const val = Number(document.getElementById("new-v-val").value);
    const minOrder = Number(document.getElementById("new-v-min").value);

    if (!code || !val) {
      return showToast("Vui lòng điền đầy đủ mã và giá trị giảm!", "error");
    }

    StorageService.addVoucher({
      code,
      description: desc,
      type,
      value: val,
      minOrder,
      isActive: true
    });

    closeModal("create-voucher-modal");
    showToast(`Đã tạo mã giảm giá ${code} thành công!`, "success");
    renderVouchersTable();
  });

  /* ================= 6. BẢNG QUẢN LÝ DỊCH VỤ SPA ================= */
  function renderServicesTable() {
    if (!servicesTbody) return;
    const services = StorageService.getServices();

    servicesTbody.innerHTML = services.map(s => `
      <tr>
        <td><code>${s.id}</code></td>
        <td>
          <div class="table-cell-title"><i class="fa-solid ${s.icon || 'fa-spa'} text-primary"></i> ${Utils.escapeHTML(s.name)}</div>
          <div class="table-cell-sub">${Utils.escapeHTML(s.description ? s.description.substring(0, 50) + '...' : '')}</div>
        </td>
        <td><span class="badge badge--confirmed">${Utils.escapeHTML(s.category)}</span></td>
        <td>${s.duration} phút</td>
        <td><strong class="table-cell-price">${Utils.formatCurrency(s.price)}</strong></td>
        <td class="text-right">
          <div class="table-actions table-actions-end">
            <button type="button" class="btn btn--secondary btn-sm btn-edit-service" data-id="${s.id}" data-price="${s.price}" title="Chỉnh sửa giá">
              <i class="fa-solid fa-pen-to-square"></i> Đổi giá
            </button>
            <button type="button" class="action-btn action-btn--cancel btn-delete-service" data-id="${s.id}" title="Xóa dịch vụ">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  // Event delegation cho bảng dịch vụ (Đổi giá & Xóa)
  if (servicesTbody) {
    servicesTbody.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".btn-edit-service");
      if (editBtn) {
        const id = editBtn.dataset.id;
        const currentPrice = editBtn.dataset.price;
        const newPrice = prompt(`Nhập giá mới (VND) cho dịch vụ ${id}:`, currentPrice);
        if (newPrice && !isNaN(newPrice) && Number(newPrice) > 0) {
          StorageService.updateService(id, { price: Number(newPrice) });
          showToast(`Đã cập nhật giá mới: ${Utils.formatCurrency(Number(newPrice))}`, "success");
          renderServicesTable();
        }
        return;
      }

      const delBtn = e.target.closest(".btn-delete-service");
      if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm(`Bạn có chắc chắn muốn xóa dịch vụ ${id} không?`)) {
          StorageService.deleteService(id);
          showToast(`Đã xóa dịch vụ ${id}!`, "info");
          renderServicesTable();
        }
      }
    });
  }

  // Form Thêm Dịch Vụ Mới
  const btnOpenCreateService = document.getElementById("btn-open-create-service");
  const formCreateService = document.getElementById("form-create-service");

  if (btnOpenCreateService && formCreateService) {
    btnOpenCreateService.addEventListener("click", () => {
      formCreateService.reset();
      openModal("create-service-modal");
    });

    formCreateService.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("new-ser-name").value.trim();
      const category = document.getElementById("new-ser-cat").value;
      const duration = Number(document.getElementById("new-ser-duration").value) || 60;
      const price = Number(document.getElementById("new-ser-price").value) || 300000;
      const desc = document.getElementById("new-ser-desc").value.trim();

      if (!name) return showToast("Vui lòng nhập tên dịch vụ!", "error");

      StorageService.addService({
        name,
        category,
        duration,
        price,
        description: desc,
        icon: "fa-spa"
      });

      closeModal("create-service-modal");
      showToast(`Đã tạo dịch vụ "${name}" thành công!`, "success");
      renderServicesTable();
    });
  }

  /* ================= 7. BẢNG TIN NHẮN TƯ VẤN KHÁCH HÀNG ================= */
  function renderMessagesTable() {
    if (!messagesTbody) return;
    const messages = StorageService.getContactMessages();

    if (messages.length === 0) {
      messagesTbody.innerHTML = `
        <tr>
          <td colspan="5" class="table-empty-cell">Chưa có tin nhắn hoặc yêu cầu tư vấn nào từ khách hàng.</td>
        </tr>
      `;
      return;
    }

    messagesTbody.innerHTML = messages.map(m => `
      <tr>
        <td><strong>${Utils.escapeHTML(m.name)}</strong></td>
        <td><a href="tel:${m.phone}" class="text-primary fw-bold">${Utils.escapeHTML(m.phone)}</a></td>
        <td><span class="badge badge--pending">${Utils.escapeHTML(m.subject)}</span></td>
        <td>${Utils.escapeHTML(m.message)}</td>
        <td class="text-muted">${new Date(m.createdAt).toLocaleString('vi-VN')}</td>
      </tr>
    `).join("");
  }

  /* ================= 8. KHỞI CHẠY TỔNG ================= */
  function renderDashboard() {
    renderAppointmentsTable();
  }

  // Lắng nghe sự kiện quay lại trang từ Back/Forward Cache của trình duyệt
  window.addEventListener("pageshow", () => {
    if (StorageService.isAdminLoggedIn()) {
      renderDashboard();
    }
  });

  // Đồng bộ thời gian thực khi dữ liệu LocalStorage thay đổi giữa các tab
  window.addEventListener("storage", (e) => {
    if (e.key === "spa_appointments" && StorageService.isAdminLoggedIn()) {
      renderAppointmentsTable();
    }
  });

  checkAuth();
});
