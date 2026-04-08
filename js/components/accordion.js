export function initAccordion() {
  const accordion = document.querySelector(".accordion");
  if (!accordion) return;

  const buttons = accordion.querySelectorAll(".accordion__btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isActive = btn.classList.contains("accordion__btn--active");

      buttons.forEach((b) => {
        b.classList.remove("accordion__btn--active");

        const content = b.nextElementSibling;
        if (content) {
          content.style.maxHeight = null;
        }
      });

      if (!isActive) {
        btn.classList.add("accordion__btn--active");

        const content = btn.nextElementSibling;

        if (content) {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      }
    });
  });
}
