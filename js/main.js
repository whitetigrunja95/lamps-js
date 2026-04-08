import { initCatalogMenu } from "./components/catalogMenu.js";
import { initLocationMenu } from "./components/locationMenu.js";
import { initFilterCounts } from "./components/filterCounts.js";
import { initCatalogFilterSort } from "./components/catalogFilterSort.js";
import { initBasket } from "./components/basket.js";
import { initAccordion } from "./components/accordion.js";
import { initDayProductsSlider } from "./components/slider.js";
import { initQuestionsForm } from "./components/questionsForm.js";


window.addEventListener("DOMContentLoaded", () => {
  initCatalogMenu();
  initLocationMenu();
  initFilterCounts();
  initCatalogFilterSort();
  initBasket();
  initAccordion();
  initDayProductsSlider();
  initQuestionsForm();

});

