import { createCatalogPaginator } from "./catalogPagination.js";

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

function hasAnyAvailability(availability) {
  if (!availability || typeof availability !== "object") return false;
  return Object.values(availability).some((count) => Number(count) > 0);
}

function getSelectedTypes(formEl) {
  const checked = formEl.querySelectorAll('input[name="type"]:checked');
  return Array.from(checked)
    .map((i) => i.value.trim())
    .filter(Boolean);
}

function getStatus(formEl) {
  const checked = formEl.querySelector('input[name="status"]:checked');
  return checked ? checked.value : "all-item";
}

function getSortValue() {
  const select = document.querySelector(".catalog__sort-select");
  return select ? select.value : "rating-max";
}

function applyFilters(products, { types, status }) {
  let res = products.slice();

  if (types.length) {
    res = res.filter((p) => Array.isArray(p.type) && types.some((t) => p.type.includes(t)));
  }

  if (status === "instock") {
    res = res.filter((p) => hasAnyAvailability(p.availability));
  }

  return res;
}

function applySort(products, sortValue) {
  const arr = products.slice();

  switch (sortValue) {
    case "price-min":
      arr.sort((a, b) => Number(a?.price?.new) - Number(b?.price?.new));
      break;
    case "price-max":
      arr.sort((a, b) => Number(b?.price?.new) - Number(a?.price?.new));
      break;
    case "rating-max":
    default:
      arr.sort((a, b) => Number(b?.rating) - Number(a?.rating));
      break;
  }

  return arr;
}

function createAvailabilityList(availabilityObj) {
  const ul = document.createElement("ul");

  ul.style.listStyle = "none";
  ul.style.padding = "0";
  ul.style.margin = "6px 0 0";
  ul.style.display = "flex";
  ul.style.flexDirection = "column";
  ul.style.gap = "6px";

  const cityNameMap = {
    moscow: "Москва",
    orenburg: "Оренбург",
    saintPetersburg: "Санкт-Петербург",
  };

  Object.entries(availabilityObj).forEach(([key, value]) => {
    const city = cityNameMap[key] || key;

    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "8px";
    li.style.whiteSpace = "nowrap";

    const dot = document.createElement("span");
    dot.style.width = "6px";
    dot.style.height = "6px";
    dot.style.borderRadius = "50%";
    dot.style.background = "#6FCF97";
    dot.style.flex = "0 0 auto";

    const text = document.createElement("span");
    text.style.color = "#111827";
    text.style.fontSize = "13px";
    text.textContent = `${city}: ${value}`;

    li.append(dot, text);
    ul.append(li);
  });

  return ul;
}


function initTooltipsWithin(rootEl) {
  if (typeof window.tippy !== "function") return;

  rootEl.querySelectorAll(".tooltip__btn").forEach((btn) => {
    if (btn._tippy) return;

    const tooltip = btn.closest(".tooltip");
    const contentEl = tooltip?.querySelector(".tooltip__content");
    if (!contentEl) return;

    window.tippy(btn, {
      allowHTML: true,
      interactive: true,
      trigger: "mouseenter focus",
      placement: "top",
      offset: [0, 8],

      content: contentEl.innerHTML,

      maxWidth: 240,
      onShow(instance) {
        const box = instance.popper.querySelector(".tippy-box");
        const content = instance.popper.querySelector(".tippy-content");
        const arrow = instance.popper.querySelector(".tippy-arrow");

        if (box) {
          box.style.background = "#ffffff";
          box.style.color = "#111827";
          box.style.border = "none";
          box.style.borderRadius = "10px";
          box.style.boxShadow = "0 6px 16px rgba(0,0,0,.08)";
          box.style.width = "220px";
          box.style.maxWidth = "220px";
        }

        if (content) {
          content.style.padding = "10px 12px";
        }

        if (arrow) {
          arrow.style.color = "#ffffff";
        }
      },
    });


  });
}

function renderProducts(listEl, products) {
  listEl.innerHTML = "";

  const fragment = document.createDocumentFragment();

  products.forEach((item) => {
    const li = document.createElement("li");
    li.className = "catalog__item";
    li.dataset.id = String(item.id);

    const title = item.name;
    const priceNew = item?.price?.new;
    const priceOld = item?.price?.old;
    const imgSrc = resolveImageUrl(item.image);

    li.innerHTML = `
      <div class="product-card">
        <div class="product-card__visual">
          <img class="product-card__img" height="436" width="290" alt="Изображение товара">
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

      content.innerHTML = `
       <div style="font-weight:600;color:#111827;font-size:13px;">
        Наличие товара по городам:
        </div>
        `;
      content.append(createAvailabilityList(item.availability));


      tooltip.style.display = "";

      initTooltipsWithin(li);
    }

    fragment.append(li);
  });

  listEl.append(fragment);
}

export async function initCatalogFilterSort() {
  const listEl = document.querySelector(".catalog__list");
  const formEl = document.querySelector(".catalog-form");
  const sortSelect = document.querySelector(".catalog__sort-select");
  const paginationEl = document.querySelector(".catalog__pagination");

  if (!listEl || !formEl) return;

  const paginator = createCatalogPaginator({
    listEl,
    paginationEl,
    render: renderProducts,
    perPage: 6,
  });

  let allProducts = [];
  try {
    const res = await fetch("./data/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allProducts = await res.json();
  } catch (e) {
    console.error("Не удалось загрузить data.json:", e);
    return;
  }

  const update = () => {
    const types = getSelectedTypes(formEl);
    const status = getStatus(formEl);
    const sort = getSortValue();

    const filtered = applyFilters(allProducts, { types, status });
    const sorted = applySort(filtered, sort);

    paginator.setItems(sorted);
  };

  update();

  formEl.addEventListener("change", update);
  sortSelect?.addEventListener("change", update);

  formEl.addEventListener("reset", () => {
    setTimeout(update, 0);
  });
}
