const panel = document.getElementById("settings-panel");
const trigger = document.getElementById("settings-trigger");
const triggerImg = trigger.querySelector("img");

const GEAR_ICON = new URL("./images/gear.svg", import.meta.url).href;
const CLOSE_ICON = new URL("./images/close.svg", import.meta.url).href;

triggerImg.src = GEAR_ICON;
trigger.style.filter = "invert(1)";

trigger.addEventListener("click", () => {
  const isOpen = panel.classList.toggle("translate-x-0");
  panel.classList.toggle("translate-x-full", !isOpen);
  document.body.classList.toggle("panel-open", isOpen);
  triggerImg.src = isOpen ? CLOSE_ICON : GEAR_ICON;
  trigger.style.filter = isOpen ? "none" : "invert(1)";
});

const msgInput = document.getElementById("message-input");
msgInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    window._sketchMessage = msgInput.value || window._sketchMessage;
    window._sketchMessageChanged = true;
  }
});

const tangentToggle = document.getElementById("tangent-toggle");
tangentToggle?.addEventListener("change", () => {
  window._sketchTangent = tangentToggle.checked;
});

const cycleFillToggle = document.getElementById("cycle-fill-toggle");
const colorPaletteSection = document.getElementById("color-palette-section");

function syncColorSectionVisibility() {
  colorPaletteSection.style.display = cycleFillToggle.checked ? "flex" : "none";
}

cycleFillToggle?.addEventListener("change", () => {
  window._sketchCycleFill = cycleFillToggle.checked;
  syncColorSectionVisibility();
});

const colorList = document.getElementById("color-list");
const addColorBtn = document.getElementById("add-color-btn");

function renderColors() {
  colorList.innerHTML = "";
  const colors = window._sketchFillColors;
  colors.forEach((hex, i) => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch relative group";

    const input = document.createElement("input");
    input.type = "color";
    input.value = hex;
    input.className = "w-10 h-10 rounded-lg cursor-pointer border-2 border-black/10 hover:border-black/40 transition-colors";
    input.title = hex;
    input.addEventListener("input", () => {
      window._sketchFillColors[i] = input.value;
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.className =
      "absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white text-[10px] leading-none items-center justify-center hidden group-hover:flex";
    removeBtn.addEventListener("click", () => {
      if (window._sketchFillColors.length > 2) {
        window._sketchFillColors.splice(i, 1);
        renderColors();
      }
    });

    swatch.appendChild(input);
    swatch.appendChild(removeBtn);
    colorList.appendChild(swatch);
  });
}

const fillStepsInput = document.getElementById("fill-steps-input");
fillStepsInput?.addEventListener("input", () => {
  window._sketchFillSteps = parseInt(fillStepsInput.value) || 0;
});

addColorBtn?.addEventListener("click", () => {
  window._sketchFillColors.push("#ffffff");
  renderColors();
});

const clearCanvasBtn = document.getElementById("clear-canvas-btn");
clearCanvasBtn?.addEventListener("click", () => {
  window._sketchClearCanvas = true;
});

document.addEventListener("DOMContentLoaded", () => {
  if (msgInput) window._sketchMessage = msgInput.value || window._sketchMessage;
  if (tangentToggle) tangentToggle.checked = !!window._sketchTangent;
  if (cycleFillToggle) {
    cycleFillToggle.checked = !!window._sketchCycleFill;
    syncColorSectionVisibility();
  }
  if (fillStepsInput) fillStepsInput.value = window._sketchFillSteps;
  renderColors();
});
