/**
 * Xử lý logic đặt lịch hẹn trực tuyến 4 bước (Booking Workflow)
 * Tuân thủ mục 7 và 8 của PROJECT_RULES.md
 */

document.addEventListener("DOMContentLoaded", () => {
  const bookingState = {
    currentStep: 1,
    selectedService: null,
    selectedTherapist: { id: "any", name: "Chuyên viên bất kỳ (Hệ thống sắp xếp)" },
    selectedDate: "",
    selectedTime: "",
    paymentMethod: "cash",
    appliedVoucher: null,
    discountAmount: 0
  };

  // DOM Elements
  const stepIndicators = document.querySelectorAll(".step-item");
  const stepPanes = document.querySelectorAll(".booking-step-pane");
  const btnPrev = document.getElementById("btn-prev-step");
  const btnNext = document.getElementById("btn-next-step");

  // Summary Sidebar Elements
  const sum = {
    service: document.getElementById("sum-service-name"),
    duration: document.getElementById("sum-duration"),
    therapist: document.getElementById("sum-therapist"),
    datetime: document.getElementById("sum-datetime"),
    origPrice: document.getElementById("sum-original-price"),
    discRow: document.getElementById("sum-discount-row"),
    discAmt: document.getElementById("sum-discount-amount"),
    finalPrice: document.getElementById("sum-final-price")
  };

  // Form Controls
  const voucherInput = document.getElementById("voucher-code-input");
  const btnApplyVoucher = document.getElementById("btn-apply-voucher");
  const voucherMsg = document.getElementById("voucher-message");
  const dateInput = document.getElementById("booking-date-input");
  const slotsContainer = document.getElementById("slots-grid-container");

  /* ================= 1. BƯỚC 1: DỊCH VỤ ================= */
  function renderServices() {
    const container = document.getElementById("service-options-container");
    container.innerHTML = "";
    const services = StorageService.getServices();
    const preSelectedId = new URLSearchParams(window.location.search).get("serviceId");

    services.forEach(service => {
      const item = document.createElement("div");
      item.className = "service-select-item";
      item.setAttribute("data-id", service.id);
      item.innerHTML = `
        <div class="service-select-info">
          <div class="service-select-icon"><i class="fa-solid ${service.icon || 'fa-spa'}"></i></div>
          <div class="service-select-meta">
            <h4>${Utils.escapeHTML(service.name)}</h4>
            <p>${Utils.escapeHTML(service.category)}</p>
          </div>
        </div>
        <div class="service-select-pricing">
          <div class="service-select-price">${Utils.formatCurrency(service.price)}</div>
          <div class="service-select-duration"><i class="fa-regular fa-clock"></i> ${service.duration} phút</div>
        </div>
      `;

      item.addEventListener("click", () => {
        container.querySelectorAll(".service-select-item").forEach(el => el.classList.remove("is-selected"));
        item.classList.add("is-selected");
        bookingState.selectedService = service;

        // Tự động tính toán lại voucher khi đổi dịch vụ (Quy tắc 5)
        if (bookingState.appliedVoucher) {
          const res = StorageService.validateVoucher(bookingState.appliedVoucher.code, service.price);
          if (res.valid) {
            bookingState.discountAmount = res.discountAmount;
            voucherMsg.textContent = res.message;
            voucherMsg.className = "voucher-msg text-success";
          } else {
            bookingState.appliedVoucher = null;
            bookingState.discountAmount = 0;
            voucherMsg.textContent = res.message;
            voucherMsg.className = "voucher-msg text-danger";
          }
        }

        updateSummary();
      });

      container.appendChild(item);
      if (preSelectedId && service.id === preSelectedId) item.click();
    });

    if (!bookingState.selectedService && services.length > 0 && !preSelectedId) {
      container.firstElementChild.click();
    }
  }

  /* ================= 2. BƯỚC 2: CHUYÊN VIÊN ================= */
  function renderTherapists() {
    const container = document.getElementById("therapist-options-container");
    container.innerHTML = "";
    const therapists = StorageService.getTherapists();

    // Thẻ chọn chuyên viên ngẫu nhiên
    const anyCard = document.createElement("div");
    anyCard.className = "therapist-select-card is-selected";
    anyCard.innerHTML = `
      <div class="therapist-select-avatar"><i class="fa-solid fa-users"></i></div>
      <div class="therapist-select-name">Bất Kỳ Chuyên Viên</div>
      <div class="therapist-select-title">Hệ thống phân bổ tối ưu</div>
      <div class="therapist-select-rating"><i class="fa-solid fa-bolt text-primary"></i> Phục vụ nhanh nhất</div>
    `;
    anyCard.addEventListener("click", () => {
      container.querySelectorAll(".therapist-select-card").forEach(c => c.classList.remove("is-selected"));
      anyCard.classList.add("is-selected");
      bookingState.selectedTherapist = { id: "any", name: "Chuyên viên bất kỳ (Hệ thống sắp xếp)" };
      updateSummary();
      renderTimeSlots();
    });
    container.appendChild(anyCard);

    therapists.forEach(t => {
      const card = document.createElement("div");
      card.className = "therapist-select-card";
      card.innerHTML = `
        <div class="therapist-select-avatar"><i class="fa-solid ${t.icon || 'fa-user-nurse'}"></i></div>
        <div class="therapist-select-name">${Utils.escapeHTML(t.name)}</div>
        <div class="therapist-select-title">${Utils.escapeHTML(t.title)}</div>
        <div class="therapist-select-rating"><i class="fa-solid fa-star"></i> ${t.rating} (${t.experience})</div>
      `;
      card.addEventListener("click", () => {
        container.querySelectorAll(".therapist-select-card").forEach(c => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        bookingState.selectedTherapist = t;
        updateSummary();
        renderTimeSlots();
      });
      container.appendChild(card);
    });
  }

  /* ================= 3. BƯỚC 3: NGÀY & KHUNG GIỜ ================= */
  function initDatePicker() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Đặt trước tối đa 30 ngày theo Quy tắc 1
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

    dateInput.min = todayStr;
    dateInput.max = maxDateStr;
    dateInput.value = todayStr;
    bookingState.selectedDate = todayStr;

    dateInput.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val < todayStr) {
        showToast("Không thể chọn ngày trong quá khứ!", "error");
        dateInput.value = todayStr;
        bookingState.selectedDate = todayStr;
      } else if (val > maxDateStr) {
        showToast("Chỉ được đặt lịch trước tối đa 30 ngày theo quy định của Spa!", "error");
        dateInput.value = maxDateStr;
        bookingState.selectedDate = maxDateStr;
      } else {
        bookingState.selectedDate = val;
      }
      bookingState.selectedTime = "";
      updateSummary();
      renderTimeSlots();
    });
  }

  function renderTimeSlots() {
    slotsContainer.innerHTML = "";
    if (!bookingState.selectedDate) return;

    AVAILABLE_TIME_SLOTS.forEach(time => {
      const isAvailable = StorageService.checkSlotAvailability(
        bookingState.selectedDate,
        time,
        bookingState.selectedTherapist?.id || "any"
      );

      const slotBtn = document.createElement("button");
      slotBtn.type = "button";
      slotBtn.className = `time-slot-btn ${isAvailable ? "" : "is-disabled"}`;
      slotBtn.textContent = time;

      if (!isAvailable) {
        const reason = StorageService.getSlotUnavailabilityReason(
          bookingState.selectedDate,
          time,
          bookingState.selectedTherapist?.id || "any"
        );
        slotBtn.title = reason || "Khung giờ này không khả dụng";
        slotBtn.setAttribute("aria-disabled", "true");

        // Nếu khung giờ đang chọn nay không còn khả dụng thì bỏ chọn
        if (bookingState.selectedTime === time) {
          bookingState.selectedTime = "";
          updateSummary();
        }

        slotBtn.addEventListener("click", () => {
          showToast(reason || "Khung giờ này hiện không khả dụng. Vui lòng chọn ca khác!", "error");
        });
      } else {
        slotBtn.title = "Khung giờ khả dụng - Bấm để chọn";
        if (bookingState.selectedTime === time) slotBtn.classList.add("is-selected");

        slotBtn.addEventListener("click", () => {
          slotsContainer.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("is-selected"));
          slotBtn.classList.add("is-selected");
          bookingState.selectedTime = time;
          updateSummary();
        });
      }

      slotsContainer.appendChild(slotBtn);
    });
  }

  /* ================= 4. BƯỚC 4: THANH TOÁN & VOUCHER ================= */
  const paymentCards = document.querySelectorAll(".payment-card");
  const bankQrBox = document.getElementById("bank-qr-box");

  paymentCards.forEach(card => {
    card.addEventListener("click", () => {
      paymentCards.forEach(c => c.classList.remove("is-selected"));
      card.classList.add("is-selected");
      bookingState.paymentMethod = card.getAttribute("data-method");
      bankQrBox.classList.toggle("is-active", bookingState.paymentMethod === "banking");
    });
  });

  // Sao chép nhanh số tài khoản ngân hàng (Quy tắc 6)
  const btnCopyAccNum = document.getElementById("btn-copy-acc-num");
  if (btnCopyAccNum) {
    btnCopyAccNum.addEventListener("click", (e) => {
      e.preventDefault();
      const accNum = document.getElementById("bank-acc-num")?.textContent.trim() || "9988776655";
      navigator.clipboard.writeText(accNum).then(() => {
        showToast(`Đã sao chép số tài khoản: ${accNum}`, "success");
      }).catch(() => {
        showToast(`Số tài khoản: ${accNum}`, "info");
      });
    });
  }

  // Áp dụng voucher giảm giá (Quy tắc 5)
  btnApplyVoucher.addEventListener("click", () => {
    const code = voucherInput.value.trim().toUpperCase();
    if (!bookingState.selectedService) {
      showToast("Vui lòng chọn dịch vụ trước khi áp dụng voucher!", "error");
      return;
    }

    const res = StorageService.validateVoucher(code, bookingState.selectedService.price);
    bookingState.appliedVoucher = res.valid ? res.voucher : null;
    bookingState.discountAmount = res.valid ? res.discountAmount : 0;

    voucherMsg.textContent = res.message;
    voucherMsg.className = `voucher-msg ${res.valid ? "text-success" : "text-danger"}`;
    showToast(res.message, res.valid ? "success" : "error");
    updateSummary();
  });

  /* ================= TỔNG KẾT BẢNG TÍNH TIỀN ================= */
  function updateSummary() {
    if (bookingState.selectedService) {
      const orig = bookingState.selectedService.price;
      const finalPrice = Math.max(0, orig - bookingState.discountAmount);

      sum.service.textContent = bookingState.selectedService.name;
      sum.duration.textContent = `${bookingState.selectedService.duration} phút`;
      sum.origPrice.textContent = Utils.formatCurrency(orig);
      sum.finalPrice.textContent = Utils.formatCurrency(finalPrice);

      const hasDiscount = bookingState.discountAmount > 0;
      sum.discRow.classList.toggle("d-none", !hasDiscount);
      if (hasDiscount) {
        sum.discAmt.textContent = `-${Utils.formatCurrency(bookingState.discountAmount)}`;
      }
    } else {
      sum.service.textContent = "Chưa chọn";
      sum.duration.textContent = "-- phút";
      sum.origPrice.textContent = "0 ₫";
      sum.finalPrice.textContent = "0 ₫";
      sum.discRow.classList.add("d-none");
    }

    sum.therapist.textContent = bookingState.selectedTherapist?.name || "Chuyên viên bất kỳ";
    sum.datetime.textContent = (bookingState.selectedDate && bookingState.selectedTime)
      ? `${bookingState.selectedTime} - ${Utils.formatDate(bookingState.selectedDate)}`
      : (bookingState.selectedDate ? Utils.formatDate(bookingState.selectedDate) : "Chưa chọn");
  }

  /* ================= ĐIỀU HƯỚNG BƯỚC (STEPPER) ================= */
  function setStep(step) {
    bookingState.currentStep = step;
    stepIndicators.forEach((ind, idx) => {
      ind.classList.toggle("is-active", idx + 1 === step);
      ind.classList.toggle("is-completed", idx + 1 < step);
    });
    stepPanes.forEach((pane, idx) => {
      pane.classList.toggle("is-active", idx + 1 === step);
    });

    btnPrev.classList.toggle("invisible", step === 1);
    btnNext.innerHTML = step === 4
      ? `<i class="fa-solid fa-check"></i> Xác Nhận Đặt Hẹn`
      : `<span>Tiếp tục</span> <i class="fa-solid fa-arrow-right"></i>`;

    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  btnPrev.addEventListener("click", () => {
    if (bookingState.currentStep > 1) setStep(bookingState.currentStep - 1);
  });

  btnNext.addEventListener("click", () => {
    if (bookingState.currentStep === 1) {
      if (!bookingState.selectedService) return showToast("Vui lòng chọn 1 dịch vụ trước khi tiếp tục!", "error");
      setStep(2);
    } else if (bookingState.currentStep === 2) {
      setStep(3);
    } else if (bookingState.currentStep === 3) {
      if (!bookingState.selectedDate) return showToast("Vui lòng chọn ngày đến spa!", "error");
      if (!bookingState.selectedTime) return showToast("Vui lòng bấm chọn một khung giờ khả dụng!", "error");

      // Kiểm tra lại tính khả dụng của slot
      const isAvailable = StorageService.checkSlotAvailability(
        bookingState.selectedDate,
        bookingState.selectedTime,
        bookingState.selectedTherapist?.id || "any"
      );
      if (!isAvailable) {
        const reason = StorageService.getSlotUnavailabilityReason(
          bookingState.selectedDate,
          bookingState.selectedTime,
          bookingState.selectedTherapist?.id || "any"
        );
        return showToast(reason || "Khung giờ này không khả dụng. Vui lòng chọn giờ khác!", "error");
      }

      setStep(4);
    } else if (bookingState.currentStep === 4) {
      handleFinalSubmission();
    }
  });

  /* ================= HOÀN TẤT ĐẶT LỊCH ================= */
  function handleFinalSubmission() {
    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");
    const notesInput = document.getElementById("customer-notes");

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
      nameInput.focus();
      return showToast("Vui lòng nhập họ và tên của bạn!", "error");
    }
    if (!phone) {
      phoneInput.focus();
      return showToast("Vui lòng nhập số điện thoại!", "error");
    }
    if (!Utils.isValidVietnamesePhone(phone)) {
      phoneInput.focus();
      return showToast("Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 03, 05, 07, 08, 09)!", "error");
    }

    // Tái kiểm tra chống trùng lịch trước khi ghi vào LocalStorage (Quy tắc 2)
    const isSlotAvailable = StorageService.checkSlotAvailability(
      bookingState.selectedDate,
      bookingState.selectedTime,
      bookingState.selectedTherapist?.id || "any"
    );

    if (!isSlotAvailable) {
      const reason = StorageService.getSlotUnavailabilityReason(
        bookingState.selectedDate,
        bookingState.selectedTime,
        bookingState.selectedTherapist?.id || "any"
      );
      showToast(reason || "Khung giờ này vừa có khách khác đặt trước. Vui lòng chọn khung giờ khác!", "error");
      setStep(3);
      renderTimeSlots();
      return;
    }

    btnNext.disabled = true;
    btnNext.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xác nhận...`;

    try {
      const orig = bookingState.selectedService.price;
      const created = StorageService.addAppointment({
        customerName: name,
        customerPhone: phone,
        serviceId: bookingState.selectedService.id,
        therapistId: bookingState.selectedTherapist?.id || "any",
        appointmentDate: bookingState.selectedDate,
        appointmentTime: bookingState.selectedTime,
        originalPrice: orig,
        voucherCode: bookingState.appliedVoucher?.code || "",
        discountAmount: bookingState.discountAmount,
        finalPrice: Math.max(0, orig - bookingState.discountAmount),
        paymentMethod: bookingState.paymentMethod,
        notes: notesInput.value.trim()
      });

      showToast("Đặt lịch hẹn thành công!", "success");
      renderReceiptModal(created);
      openModal("booking-success-modal");
    } catch (err) {
      showToast("Lỗi khi lưu đơn: " + err.message, "error");
      btnNext.disabled = false;
      btnNext.innerHTML = `<i class="fa-solid fa-check"></i> Xác Nhận Đặt Hẹn`;
    }
  }

  function renderReceiptModal(apt) {
    const service = StorageService.getServiceById(apt.serviceId);
    const therapist = StorageService.getTherapistById(apt.therapistId);
    const therapistName = therapist ? therapist.name : "Hệ thống sắp xếp ngẫu nhiên";

    // Khối hướng dẫn chuyển khoản ngân hàng nếu chọn hình thức banking (Quy tắc 6)
    const qrBankingSection = apt.paymentMethod === "banking" ? `
      <div class="receipt-banking-card mt-20">
        <div class="receipt-banking-title">
          <i class="fa-solid fa-qrcode text-primary"></i> Quét Mã QR Để Hoàn Tất Chuyển Khoản
        </div>
        <img src="assets/images/qr-bank.png" onerror="this.onerror=null; this.src='https://api.vietqr.io/image/970436-9988776655-compact.jpg?accountName=WED%20SPA%20VIET%20NAM';" class="receipt-banking-qr-img" alt="Mã QR Thanh Toán">
        <div class="receipt-banking-info">
          Ngân hàng: <strong>VIETCOMBANK</strong> - Chi nhánh Hà Nội
        </div>
        <div class="receipt-banking-info">
          Số TK: <strong id="receipt-bank-acc">9988776655</strong>
          <button type="button" class="btn-copy-account" id="btn-copy-receipt-acc" title="Sao chép số tài khoản">
            <i class="fa-regular fa-copy"></i> Sao chép
          </button>
        </div>
        <div class="receipt-banking-info">
          Chủ tài khoản: <strong>WED SPA VIET NAM</strong>
        </div>
        <div class="receipt-banking-memo-box">
          Nội dung chuyển khoản (bắt buộc): <strong class="text-primary receipt-banking-memo-code">${apt.id}</strong>
          <button type="button" class="btn-copy-account" id="btn-copy-receipt-memo" title="Sao chép mã hẹn">
            <i class="fa-regular fa-copy"></i> Sao chép mã
          </button>
        </div>
      </div>
    ` : "";

    document.getElementById("modal-receipt-body").innerHTML = `
      <div class="receipt-header">
        <div class="receipt-code-label">MÃ LỊCH HẸN CỦA BẠN</div>
        <div class="receipt-code-value">${apt.id}</div>
        <div class="receipt-status">Trạng thái: ${Utils.renderStatusBadge(apt.status)}</div>
      </div>

      <div class="receipt-box">
        <div class="receipt-row"><span class="label">Khách hàng:</span><strong>${Utils.escapeHTML(apt.customerName)}</strong></div>
        <div class="receipt-row"><span class="label">Số điện thoại:</span><strong>${Utils.escapeHTML(apt.customerPhone)}</strong></div>
        <div class="receipt-row"><span class="label">Dịch vụ:</span><strong>${Utils.escapeHTML(service ? service.name : '')}</strong></div>
        <div class="receipt-row"><span class="label">Kỹ thuật viên:</span><strong>${Utils.escapeHTML(therapistName)}</strong></div>
        <div class="receipt-row"><span class="label">Thời gian:</span><strong class="text-primary">${apt.appointmentTime} - ${Utils.formatDate(apt.appointmentDate)}</strong></div>
        <div class="receipt-row"><span class="label">Hình thức TT:</span><strong>${apt.paymentMethod === 'banking' ? 'Chuyển khoản QR' : 'Tại quầy Spa'}</strong></div>
        <div class="receipt-total-row"><span>Tổng tiền thanh toán:</span><strong class="receipt-total-value">${Utils.formatCurrency(apt.finalPrice)}</strong></div>
      </div>

      ${qrBankingSection}

      <div class="highlight-box mt-20">
        <i class="fa-solid fa-mobile-screen-button text-primary"></i> 
        Đã ghi nhận ca hẹn tức thì trên hệ thống Wed-Spa.
      </div>

      <div class="receipt-footer-note mt-10">
        Lễ tân sẽ liên hệ qua SĐT <strong>${Utils.escapeHTML(apt.customerPhone)}</strong> trước giờ hẹn 30 phút để xác nhận đón tiếp bạn chu đáo nhất.
      </div>
    `;

    // Lắng nghe sự kiện sao chép trong modal biên nhận
    const btnCopyModalAcc = document.getElementById("btn-copy-receipt-acc");
    if (btnCopyModalAcc) {
      btnCopyModalAcc.addEventListener("click", () => {
        navigator.clipboard.writeText("9988776655").then(() => {
          showToast("Đã sao chép số tài khoản: 9988776655", "success");
        });
      });
    }

    const btnCopyModalMemo = document.getElementById("btn-copy-receipt-memo");
    if (btnCopyModalMemo) {
      btnCopyModalMemo.addEventListener("click", () => {
        navigator.clipboard.writeText(apt.id).then(() => {
          showToast(`Đã sao chép mã nội dung chuyển khoản: ${apt.id}`, "success");
        });
      });
    }

    const viewBtn = document.getElementById("btn-view-my-booking");
    if (viewBtn) {
      viewBtn.href = `my-bookings.html?phone=${encodeURIComponent(apt.customerPhone)}`;
    }
  }

  const btnPrint = document.getElementById("btn-print-receipt");
  if (btnPrint) btnPrint.addEventListener("click", () => window.print());

  // Tự động điền thông tin nếu thành viên đã đăng nhập
  const currentUser = StorageService.getCurrentUser();
  if (currentUser) {
    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");
    if (nameInput && currentUser.fullName) nameInput.value = currentUser.fullName;
    if (phoneInput && currentUser.phone) phoneInput.value = currentUser.phone;
  }

  // Khởi động giao diện
  renderServices();
  renderTherapists();
  initDatePicker();
  renderTimeSlots();
  updateSummary();
});
