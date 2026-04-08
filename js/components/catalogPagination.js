const DEFAULT_PER_PAGE = 6;

/**
 * Создаёт пагинатор для каталога.
 * @param {Object} params
 * @param {HTMLElement} params.listEl 
 * @param {HTMLElement} params.paginationEl 
 * @param {Function} params.render
 * @param {number} [params.perPage=6] 
 */

export function createCatalogPaginator({ listEl, paginationEl, render, perPage = DEFAULT_PER_PAGE }) {
  let items = [];
  let currentPage = 1;

  const getTotalPages = () => Math.ceil(items.length / perPage);

  const getSliceForPage = (page) => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return items.slice(start, end);
  };

  const renderPagination = () => {
    if (!paginationEl) return;

    const totalPages = getTotalPages();

    if (items.length <= perPage || totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    paginationEl.innerHTML = Array.from({ length: totalPages }, (_, i) => {
      const page = i + 1;
      const isActive = page === currentPage;

      return `
        <li class="catalog__pagination-item">
          <button
            class="catalog__pagination-link ${isActive ? "is-active" : ""}"
            type="button"
            data-page="${page}"
            aria-current="${isActive ? "page" : "false"}"
          >
            ${page}
          </button>
        </li>
      `;
    }).join("");
  };

  const renderPage = (page = 1) => {
    const totalPages = Math.max(1, getTotalPages());
    currentPage = Math.min(Math.max(1, page), totalPages);

    const pageItems = getSliceForPage(currentPage);
    render(listEl, pageItems);

    renderPagination();
  };

  if (paginationEl) {
    paginationEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn) return;

      const nextPage = Number(btn.dataset.page);
      if (!Number.isFinite(nextPage)) return;

      renderPage(nextPage);

      listEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return {
    setItems(nextItems) {
      items = Array.isArray(nextItems) ? nextItems : [];
      renderPage(1); 
    },
    goTo(page) {
      renderPage(page);
    },
    getCurrentPage() {
      return currentPage;
    },
  };
}
