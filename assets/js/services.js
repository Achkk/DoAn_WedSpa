/**
 * Xử lý logic hiển thị và lọc danh mục dịch vụ (Services Page)
 * Tuân thủ quy định PROJECT_RULES.md
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("services-list-container");
  const filterTabs = document.querySelectorAll("#service-filter-tabs .tab-btn");
  const services = StorageService.getServices();

  function renderServices(category = "all") {
    if (!container) return;
    const filtered = category === "all" ? services : services.filter(s => s.category === category);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open empty-state-icon"></i>
          <p>Chưa có dịch vụ nào trong phân loại này.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(service => {
      const benefitsHtml = (service.benefits || [])
        .map(b => `<li><i class="fa-solid fa-check"></i> ${Utils.escapeHTML(b)}</li>`)
        .join("");

      return `
        <div class="service-detail-card">
          <div>
            <div class="service-detail-header">
              <span class="service-card_category">${Utils.escapeHTML(service.category)}</span>
              <span class="service-card_duration"><i class="fa-regular fa-clock"></i> ${service.duration} phút</span>
            </div>
            <h3 class="service-detail-title">${Utils.escapeHTML(service.name)}</h3>
            <p class="service-detail-desc">${Utils.escapeHTML(service.description)}</p>
            <ul class="service-benefits">${benefitsHtml}</ul>
          </div>
          <div class="service-detail-footer">
            <div>
              <span class="service-detail-price-label">Giá trọn gói</span>
              <strong class="service-detail-price-val">${Utils.formatCurrency(service.price)}</strong>
            </div>
            <a href="booking.html?serviceId=${encodeURIComponent(service.id)}" class="btn btn--primary">
              <i class="fa-regular fa-calendar-plus"></i> Đặt Ca Này
            </a>
          </div>
        </div>
      `;
    }).join("");
  }

  renderServices("all");

  filterTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      filterTabs.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderServices(btn.getAttribute("data-cat"));
    });
  });
});
