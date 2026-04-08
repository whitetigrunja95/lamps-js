function getProductsFromData(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function countByType(products) {
  const map = new Map();

  products.forEach((p) => {
    const types = Array.isArray(p.type) ? p.type : [];
    types.forEach((t) => {
      map.set(t, (map.get(t) || 0) + 1);
    });
  });

  return map;
}

const TYPE_BY_LABEL_TEXT = {
  "Подвесные": "pendant",
  "Потолочные": "ceiling",
  "Накладные": "overhead",
  "Точечные": "point",
  "Ночники": "nightlights",
};

function getTypeKey(inputEl) {

  const v = (inputEl.value || "").trim();
  if (v) return v;

  const label = inputEl.closest("label") || inputEl.parentElement;
  const text = label ? label.textContent.trim() : "";

  for (const [ru, key] of Object.entries(TYPE_BY_LABEL_TEXT)) {
    if (text.includes(ru)) return key;
  }
  return "";
}

export async function initFilterCounts() {

  const filterRoot = document.querySelector(".filters") || document;
  const inputs = filterRoot.querySelectorAll('input[type="checkbox"]');

  if (!inputs.length) return;

  try {
    const res = await fetch("./data/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const products = getProductsFromData(data);
    const typeCounts = countByType(products);

    inputs.forEach((input) => {
      const key = getTypeKey(input);
      if (!key) return;

      const count = typeCounts.get(key) || 0;

      const label = input.closest("label") || input.parentElement;
      if (!label) return;

      const countEl =
        label.querySelector(".filter__count") ||
        label.querySelector(".checkbox__count") ||
        label.querySelector(".catalog-filter__count") ||
        label.querySelector(".filters__count") ||
        label.querySelector('span[data-role="count"]');

      if (countEl) {
        countEl.textContent = String(count);
        return;
      }

      const spans = label.querySelectorAll("span");
      if (spans.length) {
        const last = spans[spans.length - 1];

        if (/^\d+$/.test(last.textContent.trim())) {
          last.textContent = String(count);
        }
      }
    });
  } catch (err) {
    console.error("Не удалось посчитать товары по фильтрам:", err);
  }
}
