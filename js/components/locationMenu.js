export function initLocationMenu() {
  const cityBtn = document.querySelector(".location__city");
  const cityName = document.querySelector(".location__city-name");
  const sublist = document.querySelector(".location__sublist");

  if (!cityBtn || !cityName || !sublist) return;

  const ACTIVE_CLASS = "location__city--active";

  const openMenu = () => cityBtn.classList.add(ACTIVE_CLASS);
  const closeMenu = () => cityBtn.classList.remove(ACTIVE_CLASS);
  const toggleMenu = () =>
    cityBtn.classList.contains(ACTIVE_CLASS) ? closeMenu() : openMenu();

  cityBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  sublist.addEventListener("click", (e) => {
    const itemBtn = e.target.closest(".location__sublink");
    if (!itemBtn) return;

    e.preventDefault();

    cityName.textContent = itemBtn.textContent.trim();
    closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!cityBtn.classList.contains(ACTIVE_CLASS)) return;

    const clickInsideLocation = e.target.closest(".location");
    if (!clickInsideLocation) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}
