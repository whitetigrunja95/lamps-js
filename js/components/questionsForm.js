export function initQuestionsForm() {
  const form = document.querySelector(".questions__form");
  if (!form) return;


  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const agreeInput = form.querySelector("#agree");

  const SPRITE_PATH = "./images/sprite.svg";

  const ICON_SUCCESS_ID = "icon-success";
  const ICON_ERROR_ID = "icon-error";
  const ICON_CLOSE_ID = "icon-close";

  const ICON_SUCCESS = `
    <svg class="modal__icon" width="36" height="36" aria-hidden="true">
      <use xlink:href="${SPRITE_PATH}#${ICON_SUCCESS_ID}"></use>
    </svg>
  `;

  const ICON_ERROR = `
    <svg class="modal__icon" width="36" height="36" aria-hidden="true">
      <use xlink:href="${SPRITE_PATH}#${ICON_ERROR_ID}"></use>
    </svg>
  `;

  const lockBody = () => document.body.classList.add("scroll-lock");
  const unlockBody = () => document.body.classList.remove("scroll-lock");

  const MODAL_ROOT_CLASS = "questions-modal";

  const createModal = ({ type, title, text }) => {
    const iconSvg = type === "success" ? ICON_SUCCESS : ICON_ERROR;

    const prev = document.querySelector(`.${MODAL_ROOT_CLASS}`);
    if (prev) prev.remove();

    const modal = document.createElement("div");

    modal.className = `${MODAL_ROOT_CLASS} modal modal--${type}`;

    modal.innerHTML = `
      <div class="modal__overlay" data-close="true"></div>

      <div class="modal__dialog" role="dialog" aria-modal="true" aria-label="${title}">
        <button class="modal__close" type="button" aria-label="Закрыть" data-close="true">
          <svg width="24" height="24" aria-hidden="true">
            <use xlink:href="${SPRITE_PATH}#${ICON_CLOSE_ID}"></use>
          </svg>
        </button>

        <div class="modal__content">
          <div class="modal__status">${iconSvg}</div>
          <h3 class="modal__title">${title}</h3>
          <p class="modal__text">${text}</p>
        </div>
      </div>
    `;

    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.zIndex = "2147483647";

    const overlay = modal.querySelector(".modal__overlay");
    const dialog = modal.querySelector(".modal__dialog");
    const closeBtn = modal.querySelector(".modal__close");

    if (overlay) {
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(0,0,0,.6)";
    }

    if (dialog) {
      dialog.style.position = "relative";
      dialog.style.margin = "15vh auto 0";
      dialog.style.maxWidth = "520px";
      dialog.style.background = "#fff";
      dialog.style.borderRadius = "16px";
      dialog.style.padding = "24px";
    }

    if (closeBtn) {
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "16px";
      closeBtn.style.right = "16px";
      closeBtn.style.left = "auto";

      closeBtn.style.width = "32px";
      closeBtn.style.height = "32px";
      closeBtn.style.display = "inline-flex";
      closeBtn.style.alignItems = "center";
      closeBtn.style.justifyContent = "center";

      closeBtn.style.padding = "0";
      closeBtn.style.border = "0";
      closeBtn.style.background = "transparent";
      closeBtn.style.cursor = "pointer";

      closeBtn.style.outline = "none";
      closeBtn.style.boxShadow = "none";
      closeBtn.style.webkitTapHighlightColor = "transparent";

      closeBtn.addEventListener("mousedown", (e) => e.preventDefault());
    }

    const close = () => {
      document.removeEventListener("keydown", onEsc);
      modal.remove();
      unlockBody();
    };

    const onEsc = (evt) => {
      if (evt.key === "Escape") close();
    };

    modal.addEventListener("click", (evt) => {
      const target = evt.target;

      if (target.closest("[data-close='true']")) {
        close();
      }
    });


    document.addEventListener("keydown", onEsc);
    document.body.append(modal);
    lockBody();
  };

  const openSuccessModal = () => {
    createModal({
      type: "success",
      title: "Благодарим за обращение!",
      text: "Мы получили вашу заявку и свяжемся с вами в ближайшее время",
    });
  };

  const openErrorModal = () => {
    createModal({
      type: "error",
      title: "Не удалось отправить обращение",
      text: "Что-то пошло не так, попробуйте отправить форму еще раз. Если ошибка повторится — свяжитесь со службой поддержки.",
    });
  };
const submitForm = async () => {
  const payload = {
    name: (nameInput?.value || "").trim(),
    email: (emailInput?.value || "").trim(),
    agree: Boolean(agreeInput?.checked),
  };

  try {
    const res = await fetch(form.action, {
      method: form.method || "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    openSuccessModal();
    form.reset();
  } catch (err) {
    console.warn("Ошибка отправки формы:", err);
    openErrorModal();
  }
};


  const JV =
    (typeof window.JustValidate === "function" && window.JustValidate) ||
    (window.JustValidate && typeof window.JustValidate.default === "function" && window.JustValidate.default) ||
    (window.JustValidate && typeof window.JustValidate.JustValidate === "function" && window.JustValidate.JustValidate) ||
    (typeof window.justValidate === "function" && window.justValidate) ||
    (typeof JustValidate === "function" && JustValidate) ||
    null;

  if (!JV) {
    console.warn("JustValidate не найден. Форма будет отправляться без валидации.");

    form.addEventListener("submit", (evt) => {
      evt.preventDefault();
      submitForm();
    });

    return;
  }

  const validator = new JV(form, {
    validateBeforeSubmitting: true,
    errorFieldCssClass: "is-invalid",
    errorLabelCssClass: "form-error",
    errorLabelStyle: {
      color: "#FC5A5A",
      fontSize: "12px",
      marginTop: "6px",
    },
    focusInvalidField: true,
    lockForm: true,
  });

  validator
    .addField("#name", [
      { rule: "required", errorMessage: "Введите ваше имя" },
      { rule: "minLength", value: 3, errorMessage: "Минимальная длина три символа" },
      { rule: "maxLength", value: 20, errorMessage: "Максимальная длина двадцать символов" },
    ])
    .addField("#email", [
      { rule: "required", errorMessage: "Введите вашу почту" },
      { rule: "email", errorMessage: "Почта введена неверно" },
    ])
    .addField("#agree", [{ rule: "required", errorMessage: "Согласие обязательно" }])
    .onSuccess((evt) => {
      evt.preventDefault();
      submitForm();
      validator.refresh();
    });
}
