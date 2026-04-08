export function initCatalogMenu() {
  const btn = document.querySelector(".header__catalog-btn");
  const menu = document.querySelector(".main-menu");

  if (!btn || !menu) return;

  const closeBtn = menu.querySelector(".main-menu__close");

  const openMenu = () => {
    menu.classList.add("main-menu--active");
    btn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    menu.classList.remove("main-menu--active");
    btn.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    menu.classList.contains("main-menu--active") ? closeMenu() : openMenu();
  };

  btn.setAttribute("aria-expanded", "false");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("main-menu--active")) return;

    const clickInsideMenu = menu.contains(e.target);
    const clickOnBtn = btn.contains(e.target);

    if (!clickInsideMenu && !clickOnBtn) {
      closeMenu();
    }
  });
}
