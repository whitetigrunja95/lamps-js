function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("ru-RU");
}

function resolveImageUrl(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const dataJsonUrl = new URL("./data/data.json", window.location.href);
  return new URL(raw, dataJsonUrl).toString();
}

function findBasketButton() {
  const btns = document.querySelectorAll(".header__user-btn");
  for (const btn of btns) {
    const text = btn.querySelector(".header__user-text")?.textContent?.trim();
    if (text === "Корзина") return btn;
  }
  return null;
}

function setCounter(counterEl, count) {
  if (!counterEl) return;
  counterEl.textContent = String(count);
}

function updateBasketUI(emptyBlockEl, checkoutLinkEl, count) {
  if (emptyBlockEl) emptyBlockEl.style.display = count > 0 ? "none" : "";
  if (checkoutLinkEl) checkoutLinkEl.style.display = count > 0 ? "" : "none";
}

function createBasketItem(product) {
  const li = document.createElement("li");
  li.className = "basket__item";
  li.dataset.id = String(product.id);

  const imgSrc = resolveImageUrl(product.image);
  const priceNew = product?.price?.new;

  li.innerHTML = `
    <div class="basket__img">
      <img src="${imgSrc}" alt="Фотография товара" height="60" width="60">
    </div>

    <span class="basket__name"></span>
    <span class="basket__price"></span>

    <button class="basket__item-close" type="button" aria-label="Удалить товар">
      <svg class="main-menu__icon" width="24" height="24" aria-hidden="true">
        <use xlink:href="images/sprite.svg#icon-close"></use>
      </svg>
    </button>
  `;

  li.querySelector(".basket__name").textContent = product.name;
  li.querySelector(".basket__price").textContent = `${formatPrice(priceNew)} руб`;

  return li;
}

function visualFeedbackOnAddButton(addBtn) {
  const textEl = addBtn.querySelector(".btn__text");
  const prevText = textEl ? textEl.textContent : "";

  addBtn.classList.add("is-added");
  addBtn.setAttribute("aria-disabled", "true");
  addBtn.style.pointerEvents = "none";
  if (textEl) textEl.textContent = "Добавлено";

  setTimeout(() => {
    addBtn.classList.remove("is-added");
    addBtn.removeAttribute("aria-disabled");
    addBtn.style.pointerEvents = "";
    if (textEl) textEl.textContent = prevText;
  }, 900);
}

export async function initBasket() {
  const basket = document.querySelector(".basket");
  const basketList = document.querySelector(".basket__list");
  const emptyBlock = document.querySelector(".basket__empty-block");

  const basketBtn = findBasketButton();
  if (!basket || !basketList || !emptyBlock || !basketBtn) return;

  const counterEl =
    basketBtn.querySelector(".header__user-count") ||
    document.querySelector(".header__user-count");

  let checkoutLink = basket.querySelector(".basket__link");
  if (!checkoutLink) {
    checkoutLink = document.createElement("a");
    checkoutLink.className = "basket__link btn";
    checkoutLink.href = "#";
    checkoutLink.textContent = "Перейти к оформлению";
    basket.insertBefore(checkoutLink, emptyBlock);
  }

  let count = basketList.querySelectorAll(".basket__item").length;
  setCounter(counterEl, count);
  updateBasketUI(emptyBlock, checkoutLink, count);

  const openBasket = () => basket.classList.add("basket--active");
  const closeBasket = () => basket.classList.remove("basket--active");
  const toggleBasket = () => {
    basket.classList.contains("basket--active") ? closeBasket() : openBasket();
  };

  basketBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBasket();
  });

  basket.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => closeBasket());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBasket();
  });

  let allProducts = [];
  try {
    const res = await fetch("./data/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allProducts = await res.json();
  } catch (err) {
    console.error("Корзина: не удалось загрузить data.json", err);
  }

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest('[data-action="add-to-basket"]');
    if (!addBtn) return;

    e.preventDefault();

    const id = Number(addBtn.dataset.id);
    if (!Number.isFinite(id)) return;

    visualFeedbackOnAddButton(addBtn);

    const product = allProducts.find((p) => p.id === id);
    if (!product) return;

    const itemEl = createBasketItem(product);
    basketList.append(itemEl);

    count += 1;
    setCounter(counterEl, count);
    updateBasketUI(emptyBlock, checkoutLink, count);

  });

  basketList.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".basket__item-close");
    if (!closeBtn) return;

    const item = closeBtn.closest(".basket__item");
    if (!item) return;

    item.remove();

    count = basketList.querySelectorAll(".basket__item").length;
    setCounter(counterEl, count);
    updateBasketUI(emptyBlock, checkoutLink, count);
  });
}
