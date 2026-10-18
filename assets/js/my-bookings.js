/**
 * Xử lý logic tra cứu và quản lý lịch hẹn cá nhân (My Bookings)
 * Tuân thủ quy định PROJECT_RULES.md
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-booking-form");
  const phoneInput = document.getElementById("lookup-phone");
  const resultsContainer = document.getElementById("booking-results-container");

  let pendingCancelId = null;

  function performLookup(phone) {
    if (!phone) return showToast("Vui lòng nhập số điện thoại!", "error");

    const appointments = StorageService.getAppointmentsByPhone(phone);

    if (appointments.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-face-meh lookup-empty-icon text-muted"></i>
          <h3 class="feature-title">Không tìm thấy lịch hẹn nào!</h3>
          <p class="feature-desc mb-20">
            Số điện thoại <strong>${Utils.escapeHTML(phone)}</strong> hiện chưa có lịch đặt hẹn trên hệ thống.
          </p>
          <a href="booking.html" class="btn btn--primary">
            <i class="fa-regular fa-calendar-plus"></i> Đặt Lịch Hẹn Mới
          </a>
        </div>
      `;
      return;
    }

    const cardsHtml = appointments.map(apt => {
      const service = StorageService.getServiceById(apt.serviceId);
      const therapist = StorageService.getTherapistById(apt.therapistId);
      const therapistName = therapist ? therapist.name : "Hệ thống sắp xếp ngẫu nhiên";
      const cancelCheck = StorageService.canCancelAppointment(apt);
      const isPendingOrConfirmed = (apt.status === "pending" || apt.status === "confirmed");

      // Khối hướng dẫn chuyển khoản nếu khách chưa hoàn tất và thanh toán qua banking
      const bankingPrompt = (apt.paymentMethod === "banking" && apt.status === "pending") ? `
        <div class="apt-banking-prompt">
          <div><i class="fa-solid fa-qrcode text-primary"></i> <strong>Chuyển khoản Vietcombank:</strong> 9988776655 (WED SPA VIET NAM)</div>
          <div class="mt-4">Nội dung CK: <strong class="text-primary">${apt.id}</strong></div>
        </div>
      ` : "";

      let cancelActionHtml = "";
      if (isPendingOrConfirmed) {
        if (cancelCheck.allowed) {
          cancelActionHtml = `
            <button type="button" class="btn btn--danger btn-sm btn-cancel-apt" data-id="${apt.id}">
              <i class="fa-regular fa-circle-xmark"></i> Hủy lịch
            </button>
          `;
        } else {
          cancelActionHtml = `
            <button type="button" class="btn btn--secondary btn-sm btn-disabled-cancel" disabled title="${cancelCheck.reason}">
              <i class="fa-regular fa-circle-xmark"></i> Hủy lịch
            </button>
          `;
        }
      }

      const policyWarningHtml = (isPendingOrConfirmed && !cancelCheck.allowed) ? `
        <p class="cancel-policy-warning">
          <i class="fa-solid fa-circle-info"></i> Không thể tự hủy trực tuyến (dưới 2 tiếng trước giờ hẹn). Vui lòng gọi <strong>1900 6868</strong> để được hỗ trợ.
        </p>
      ` : "";

      return `
        <div class="appointment-card">
          <div>
            <div class="apt-header">
              <span class="apt-code">${apt.id}</span>
              ${Utils.renderStatusBadge(apt.status)}
            </div>
            <h4 class="apt-title">${Utils.escapeHTML(service ? service.name : 'Dịch vụ đã chọn')}</h4>
            <div class="apt-details">
              <div class="apt-details-item">
                <i class="fa-regular fa-clock text-primary"></i>
                <strong>${apt.appointmentTime} - ${Utils.formatDate(apt.appointmentDate)}</strong>
              </div>
              <div class="apt-details-item">
                <i class="fa-solid fa-user-nurse text-primary"></i>
                <span>KTV: ${Utils.escapeHTML(therapistName)}</span>
              </div>
              <div class="apt-details-item">
                <i class="fa-solid fa-money-bill-wave text-primary"></i>
                <strong class="text-primary">${Utils.formatCurrency(apt.finalPrice)}</strong>
                ${apt.discountAmount > 0 ? `<small class="text-success">(Giảm ${Utils.formatCurrency(apt.discountAmount)})</small>` : ''}
              </div>
            </div>
            ${apt.notes ? `<p class="apt-notes">Ghi chú: ${Utils.escapeHTML(apt.notes)}</p>` : ''}
            ${bankingPrompt}
            ${policyWarningHtml}
          </div>
          <div class="apt-actions">
            <button type="button" class="btn btn--secondary btn-sm btn-print-apt">
              <i class="fa-solid fa-print"></i> In phiếu
            </button>
            ${apt.status === "completed" ? `
              <button type="button" class="btn btn--primary btn-sm btn-review-apt" data-id="${apt.id}" data-service="${Utils.escapeHTML(service ? service.name : '')}">
                <i class="fa-solid fa-star"></i> Đánh giá
              </button>
            ` : ''}
            ${cancelActionHtml}
          </div>
        </div>
      `;
    }).join("");

    resultsContainer.innerHTML = `
      <div class="lookup-results-header">
        <h3 class="lookup-results-title">Tìm thấy ${appointments.length} lịch hẹn cho SĐT: ${Utils.escapeHTML(phone)}</h3>
        <a href="booking.html" class="btn btn--primary btn-sm">
          <i class="fa-solid fa-plus"></i> Đặt thêm ca
        </a>
      </div>
      ${cardsHtml}
    `;
  }

  // Event delegation cho in phiếu, hủy lịch và đánh giá
  resultsContainer.addEventListener("click", (e) => {
    if (e.target.closest(".btn-print-apt")) {
      window.print();
    } else if (e.target.closest(".btn-review-apt")) {
      const revBtn = e.target.closest(".btn-review-apt");
      document.getElementById("review-apt-id").value = revBtn.dataset.id;
      openModal("review-modal");
    } else {
      const cancelBtn = e.target.closest(".btn-cancel-apt");
      if (cancelBtn) {
        pendingCancelId = cancelBtn.dataset.id;
        document.getElementById("cancel-apt-code").textContent = pendingCancelId;
        openModal("cancel-confirm-modal");
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    performLookup(phoneInput.value.trim());
  });

  const confirmCancelBtn = document.getElementById("btn-confirm-cancel-action");
  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener("click", () => {
      if (pendingCancelId) {
        try {
          StorageService.cancelAppointment(pendingCancelId);
          closeModal("cancel-confirm-modal");
          showToast("Đã hủy lịch hẹn thành công! Khung giờ đã được mở lại cho khách khác.", "success");
          performLookup(phoneInput.value.trim());
          pendingCancelId = null;
        } catch (err) {
          closeModal("cancel-confirm-modal");
          showToast(err.message, "error");
        }
      }
    });
  }

  // Xử lý chọn số sao đánh giá
  const starsContainer = document.getElementById("rating-stars-container");
  const ratingInput = document.getElementById("review-rating-val");
  if (starsContainer && ratingInput) {
    const stars = starsContainer.querySelectorAll(".star");
    stars.forEach(star => {
      star.addEventListener("click", () => {
        const val = Number(star.dataset.val);
        ratingInput.value = val;
        stars.forEach((s, idx) => {
          s.classList.toggle("is-selected", idx < val);
        });
      });
    });
  }

  // Xử lý nộp đánh giá
  const formReview = document.getElementById("form-submit-review");
  if (formReview) {
    formReview.addEventListener("submit", (e) => {
      e.preventDefault();
      const author = document.getElementById("review-author").value.trim();
      const comment = document.getElementById("review-comment").value.trim();
      const rating = Number(document.getElementById("review-rating-val").value) || 5;

      if (!author || !comment) {
        return showToast("Vui lòng nhập tên và nhận xét của bạn!", "error");
      }

      StorageService.addReview({
        author,
        role: "Khách hàng đã trải nghiệm",
        rating,
        comment
      });

      closeModal("review-modal");
      formReview.reset();
      showToast("Cảm ơn bạn! Đánh giá đã được ghi nhận trên hệ thống Wed-Spa.", "success");
    });
  }

  // Tự động kiểm tra URL query param ?phone=... hoặc số điện thoại thành viên đang đăng nhập
  const phoneParam = new URLSearchParams(window.location.search).get("phone");
  const currentUser = StorageService.getCurrentUser();

  if (phoneParam) {
    phoneInput.value = phoneParam;
    performLookup(phoneParam);
  } else if (currentUser && currentUser.phone) {
    phoneInput.value = currentUser.phone;
    performLookup(currentUser.phone);
  }

  // Tự động cập nhật lại danh sách khi bấm nút Quay lại (Back) trên trình duyệt
  window.addEventListener("pageshow", () => {
    if (phoneInput && phoneInput.value.trim()) {
      performLookup(phoneInput.value.trim());
    }
  });
});
