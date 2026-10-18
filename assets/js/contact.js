/**
 * Xử lý logic gửi form liên hệ & bản đồ chi nhánh (Contact Page)
 * Tuân thủ quy định PROJECT_RULES.md
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const subject = document.getElementById("contact-subject").value;
    const message = document.getElementById("contact-message").value.trim();

    if (!name) return showToast("Vui lòng nhập họ và tên của bạn!", "error");
    if (!phone) return showToast("Vui lòng nhập số điện thoại!", "error");
    if (!Utils.isValidVietnamesePhone(phone)) {
      return showToast("Số điện thoại không đúng định dạng (10 số, bắt đầu 03, 05, 07, 08, 09)!", "error");
    }
    if (!message) return showToast("Vui lòng nhập nội dung tin nhắn hoặc câu hỏi!", "error");

    try {
      StorageService.addContactMessage({
        name,
        phone,
        email,
        subject,
        message
      });

      showToast("Cảm ơn bạn! Lễ tân Wed-Spa đã nhận được tin nhắn và sẽ liên hệ lại trong ít phút.", "success");
      form.reset();
    } catch (err) {
      showToast("Có lỗi xảy ra: " + err.message, "error");
    }
  });
});

