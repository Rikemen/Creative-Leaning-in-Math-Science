const nav = document.querySelector(".primary-nav");
const navToggle = document.querySelector(".nav-toggle");

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "閉じる" : "メニュー";
  });
}

const tabGroups = document.querySelectorAll("[data-tabs]");

function activateTab(group, nextButton, updateHash = true) {
  const buttons = [...group.querySelectorAll("[role='tab']")];
  const panels = [...group.querySelectorAll("[role='tabpanel']")];
  const targetId = nextButton.getAttribute("aria-controls");

  buttons.forEach((button) => {
    const isSelected = button === nextButton;
    button.setAttribute("aria-selected", String(isSelected));
    button.tabIndex = isSelected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.id !== targetId;
  });

  if (updateHash) {
    const mode = nextButton.dataset.tab;
    history.replaceState(null, "", `#${mode}`);
  }
}

tabGroups.forEach((group) => {
  const buttons = [...group.querySelectorAll("[role='tab']")];
  const requestedTab = window.location.hash.slice(1);
  const initialButton = buttons.find((button) => button.dataset.tab === requestedTab) || buttons[0];

  activateTab(group, initialButton, false);

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => activateTab(group, button));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

      event.preventDefault();
      let nextIndex = index;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;

      activateTab(group, buttons[nextIndex]);
      buttons[nextIndex].focus();
    });
  });
});
