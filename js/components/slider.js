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

function createAvailabilityList(availabilityObj) {
  const ul = document.createElement("ul");
  ul.className = "tooltip__list";

  const cityNameMap = {
    moscow: "Москва",
    orenburg: "Оренбург",
    saintPetersburg: "Санкт-Петербург",
  };

  Object.entries(availabilityObj).forEach(([key, value]) => {
    const li = document.createElement("li");
    li.className = "tooltip__item";

    const span = document.createElement("span");
    span.className = "tooltip__text";

    const city = cityNameMap[key] || key;
    span.innerHTML = `${city}: <span class="tooltip__count">${value}</span>`;

    li.append(span);
    ul.append(li);
  });

  return ul;
}

function createDayProductCard(item) {
  const li = document.createElement("li");
  li.classList.add("day-products__item", "swiper-slide");

  const title = item.name;
  const priceNew = item?.price?.new;
  const priceOld = item?.price?.old;
  const imgSrc = resolveImageUrl(item.image);

  li.innerHTML = `
    <div class="product-card product-card--small">
      <div class="product-card__visual">
        <img class="product-card__img" height="344" width="290" alt="Изображение товара">
        <div class="product-card__more">
          <a href="#" class="product-card__link btn btn--icon" data-action="add-to-basket">
            <span class="btn__text">В корзину</span>
            <svg width="24" height="24" aria-hidden="true">
              <use xlink:href="images/sprite.svg#icon-basket"></use>
            </svg>
          </a>
          <a href="#" class="product-card__link btn btn--secondary" data-action="details">
            <span class="btn__text">Подробнее</span>
          </a>
        </div>
      </div>

      <div class="product-card__info">
        <h2 class="product-card__title"></h2>

        <span class="product-card__old" style="display:none;">
          <span class="product-card__old-number"></span>
          <span class="product-card__old-add">₽</span>
        </span>

        <span class="product-card__price">
          <span class="product-card__price-number"></span>
          <span class="product-card__price-add">₽</span>
        </span>

        <div class="product-card__tooltip tooltip" style="display:none;">
          <button class="tooltip__btn" type="button" aria-label="Показать подсказку">
            <svg class="tooltip__icon" width="5" height="10" aria-hidden="true">
              <use xlink:href="images/sprite.svg#icon-i"></use>
            </svg>
          </button>
          <div class="tooltip__content">
            <span class="tooltip__text">Наличие товара по городам:</span>
          </div>
        </div>
      </div>
    </div>
  `;
  const addBtn = li.querySelector('[data-action="add-to-basket"]');
  if (addBtn) addBtn.dataset.id = String(item.id);

  li.querySelector(".product-card__title").textContent = title;

  const imgEl = li.querySelector(".product-card__img");
  imgEl.src = imgSrc;

  li.querySelector(".product-card__price-number").textContent = formatPrice(priceNew);

  if (priceOld != null && Number.isFinite(Number(priceOld))) {
    li.querySelector(".product-card__old-number").textContent = formatPrice(priceOld);
    li.querySelector(".product-card__old").style.display = "";
  }

  if (item.availability && typeof item.availability === "object") {
    const tooltip = li.querySelector(".product-card__tooltip");
    const content = li.querySelector(".tooltip__content");
    content.append(createAvailabilityList(item.availability));
    tooltip.style.display = "";
  }

  return li;
}

function initSwiper() {
  if (typeof Swiper === "undefined") {
    console.error("Swiper не найден. Подключи swiper-bundle.min.js в vendor перед main.js");
    return null;
  }

  return new Swiper(".day-products__slider", {
    slidesPerView: 4,
    spaceBetween: 20,
    navigation: {
      nextEl: ".day-products__navigation-btn--next",
      prevEl: ".day-products__navigation-btn--prev",
    },
  });
}

export async function initDayProductsSlider() {
  const wrapper = document.querySelector(".day-products__list.swiper-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = "";

  try {
    const res = await fetch("./data/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();
    const dayProducts = products.filter((p) => p.goodsOfDay === true);

    const fragment = document.createDocumentFragment();
    dayProducts.forEach((item) => fragment.append(createDayProductCard(item)));

    wrapper.append(fragment);

    initSwiper();
  } catch (e) {
    console.error("Товары дня: ошибка рендера/инициализации", e);
  }
}
