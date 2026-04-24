# Settings Panel Generator

A self-contained prompt/skill for adding a slide-in right-side settings panel to any Vite + Tailwind v4 project. Hand this file to Claude Code (or paste its contents) and it will generate the panel, tailored to the target project's settings.

The structure (panel chrome, toggle wiring, file layout) is fixed. The **settings themselves are always project-specific** — the agent must discover them per project before writing any code.

---

## Step 0 — Discover the project's settings

Before writing any code, ask the user what settings this particular project needs. Do not assume — every project exposes a different set.

Ask:

1. What settings should the panel expose? For each, capture:
   - **Label** (shown in the panel)
   - **Type** — one of: `text`, `number`, `toggle`, `action-button`, `select`, or a custom control specific to this project
   - **Default value**
   - **Persistence** — none / localStorage
2. Is there a global "clear / reset" action that belongs at the bottom of the panel?

If the user says "just pick reasonable defaults", read the main source file, propose a minimal schema, and confirm before implementing.

---

## Step 1 — Files to create or touch

| Path                                             | Action                                                                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `index.html` (or equivalent entry HTML)          | Add panel `<aside>` and trigger `<button>`                                                                                 |
| `src/main.js` (or a new `src/settings-panel.js`) | Panel toggle + per-control wiring                                                                                          |
| `src/style/style.css`                            | Ensure `@import "tailwindcss";` and `@import "./settings-panel.css";` are at the top, plus the `body.panel-open main` rule |
| `src/style/settings-panel.css`                   | Component CSS the utilities can't express                                                                                  |
| `src/images/gear.svg`                            | Provided by user                                                                                                           |
| `src/images/close.svg`                           | Provided by user                                                                                                           |

If the project doesn't already have `src/style/style.css`, create it and link it from the HTML `<head>`.

---

## Step 2 — HTML blueprint

The panel is a **floating card**: an outer `<aside>` that handles positioning + slide animation with a small padding, and an inner `<div>` that is the visible white card with a black border and rounded corners. This keeps the card visually detached from the viewport edge.

Insert at the end of `<body>`:

```html
<!-- Settings Panel -->
<aside
  id="settings-panel"
  class="fixed top-0 right-0 h-screen w-96 translate-x-full z-1000 overflow-y-auto transition-transform duration-300 ease-in-out p-2"
>
  <div
    class="bg-white border-2 border-black rounded-xl flex flex-col gap-8 pt-4 pb-6 px-6 h-full w-full"
  >
    <h2 class="text-xl font-semibold tracking-widest -translate-y-0.5">
      Settings
    </h2>

    <!-- Repeat one block per project-specific setting (see "Control patterns") -->

    <!-- Optional bottom action -->
    <div class="mt-auto">
      <button
        id="reset-btn"
        class="w-full text-xs font-semibold tracking-wider uppercase py-2 px-4 border border-black/20 rounded-lg hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
      >
        Reset
      </button>
    </div>
  </div>
</aside>

<!-- Gear trigger -->
<button
  id="settings-trigger"
  class="fixed top-6 right-6 w-6 h-6 z-[2000] bg-transparent border-none cursor-pointer flex items-center justify-center opacity-5 hover:opacity-100 [body.panel-open_&]:opacity-100 transition-opacity duration-300"
>
  <img src="" alt="Settings" class="w-full h-full object-contain" />
</button>
```

Notes:

- The trigger sits at `opacity-5` when closed (a faint hint), goes to `opacity-100` on hover, and **stays at full opacity while the panel is open** via the `[body.panel-open_&]:opacity-100` arbitrary variant — so the close icon is always clearly visible.
- Width is `w-96` on the outer aside; the inner card fills it. Adjust to taste, but keep the outer/inner split.

### Control patterns

Use these as building blocks. Generate one block per setting in the schema you collected in Step 0. Don't include patterns the project doesn't need.

**Text input**

```html
<div class="flex flex-col gap-2">
  <h3 class="text-xs font-semibold tracking-widest uppercase">Label</h3>
  <input
    id="my-text"
    type="text"
    value="Default"
    class="w-full text-sm border border-black/20 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-black/50 transition-colors"
  />
  <p class="text-xs">Press Enter to apply.</p>
</div>
```

**Number input (inline row)**

```html
<label class="flex items-center justify-between gap-3 mt-1">
  <span class="text-sm">Label</span>
  <input
    id="my-number"
    type="number"
    min="0"
    max="255"
    value="1"
    class="w-16 text-sm text-left border border-black/20 rounded pl-2 pr-0.5 py-0.5 focus:outline-none focus:border-black/50"
  />
</label>
```

**Toggle pill**

```html
<div class="flex flex-col gap-2">
  <h3 class="text-xs font-semibold tracking-widest uppercase">Label</h3>
  <label class="flex items-center justify-between cursor-pointer">
    <span class="text-sm">Sub-label</span>
    <div class="relative">
      <input type="checkbox" id="my-toggle" class="sr-only peer" />
      <div
        class="w-10 h-5 bg-black/10 rounded-full peer peer-checked:bg-black transition-colors duration-200"
      ></div>
      <div
        class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"
      ></div>
    </div>
  </label>
</div>
```

**Action button (inline, mid-panel)**

```html
<button
  id="my-action"
  class="w-full text-xs font-semibold tracking-wider uppercase py-2 px-4 border border-black/20 rounded-lg hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
>
  Do thing
</button>
```

If the project needs a control type not in this list (sliders, color lists, file pickers, segmented controls, etc.), design it in the same visual language: black-on-white, `border-black/20`, `rounded-lg`, `text-xs uppercase tracking-widest` for section headers.

---

## Step 3 — CSS files

**`src/style/style.css`** — top of file:

```css
@import "tailwindcss";
@import "./settings-panel.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

main {
  width: 100%;
  height: 100%;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.panel-open main {
  margin-right: 20rem;
}

@media (max-width: 768px) {
  body.panel-open main {
    margin-right: 0;
  }
}
```

**`src/style/settings-panel.css`** — component CSS that Tailwind utilities can't express. Start from this baseline and add only what the project needs:

```css
/* Settings panel — custom properties not expressible in Tailwind utilities */

/* Toggle pill — the peer sibling div needs a pointer-events fix in Safari */
label .peer ~ div {
  pointer-events: none;
}

/* Settings trigger icon inversion (gear vs close).
   Default: inverted so the dark gear shows white against a dark canvas.
   When open: no inversion so the close icon reads as black against the white panel. */
#settings-trigger {
  filter: invert(1);
}
#settings-trigger.is-open {
  filter: none;
}
```

If a setting needs CSS-driven visibility (e.g. show section X only when toggle Y is on), prefer a body class flipped from JS plus a single rule here, rather than inline `style.display`:

```css
body:not(.feature-on) #feature-section {
  display: none;
}
```

---

## Step 4 — Icons

The user provides `src/images/gear.svg` and `src/images/close.svg`. They should be monochrome black so `filter: invert(1)` flips them cleanly between dark and light backgrounds. Do not invent fallback SVGs — if the files are missing, ask the user.

---

## Step 5 — Toggle + wiring logic (`src/main.js`)

Core skeleton — extend the "per-control wiring" section with one block per setting in the schema collected in Step 0.

```js
const panel = document.getElementById("settings-panel");
const trigger = document.getElementById("settings-trigger");
const triggerImg = trigger.querySelector("img");

const GEAR_ICON = new URL("./images/gear.svg", import.meta.url).href;
const CLOSE_ICON = new URL("./images/close.svg", import.meta.url).href;

triggerImg.src = GEAR_ICON;

function setPanelOpen(isOpen) {
  panel.classList.toggle("translate-x-0", isOpen);
  panel.classList.toggle("translate-x-full", !isOpen);
  document.body.classList.toggle("panel-open", isOpen);
  trigger.classList.toggle("is-open", isOpen);
  triggerImg.src = isOpen ? CLOSE_ICON : GEAR_ICON;
}

trigger.addEventListener("click", () => {
  setPanelOpen(!document.body.classList.contains("panel-open"));
});

// Escape closes the panel
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("panel-open")) {
    setPanelOpen(false);
  }
});

// --- Per-control wiring (one block per schema entry — examples) ---

// text
const msgInput = document.getElementById("message-input");
msgInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") window._sketchMessage = msgInput.value;
});

// toggle
const myToggle = document.getElementById("my-toggle");
myToggle?.addEventListener("change", () => {
  window._myToggleState = myToggle.checked;
});

// number
const myNum = document.getElementById("my-number");
myNum?.addEventListener("input", () => {
  window._myNumberState = parseInt(myNum.value) || 0;
});

// action
document.getElementById("reset-btn")?.addEventListener("click", () => {
  window._myReset = true;
});

// Hydrate initial values on load
document.addEventListener("DOMContentLoaded", () => {
  if (msgInput) msgInput.value = window._sketchMessage ?? "";
  if (myToggle) myToggle.checked = !!window._myToggleState;
  if (myNum) myNum.value = window._myNumberState ?? 0;
});
```

The `is-open` class on `#settings-trigger` is what the CSS in Step 3 hooks into to drop the `invert(1)` filter when the close icon is showing.

---

## Step 6 — Verification checklist

- [ ] Panel slides in from the right when the gear is clicked and slides out on second click.
- [ ] Trigger icon swaps gear ↔ close. Gear is faint when closed (5% opacity), full when hovered. Close icon stays at **full opacity** the entire time the panel is open.
- [ ] Trigger filter inverts when closed (white gear over dark bg) and clears when open (black close over white panel).
- [ ] `body.panel-open` is added/removed and main content shifts left on desktop, overlays on mobile.
- [ ] Every project-specific control reads from and writes to the agreed state key.
- [ ] Initial values hydrate from state on page load.
- [ ] Outer `<aside>` keeps its `p-2` padding and the inner card has `rounded-xl border-2 border-black` — the card should look detached from the screen edge.
- [ ] Pressing `Escape` while the panel is open closes it.

---

## Optional extensions

- **localStorage persistence** — wrap state writes in a `save()` that serializes the schema, and hydrate from `JSON.parse(localStorage.getItem(KEY))` at boot.
- **Click-outside-to-close** — listener on `document` that ignores clicks inside `#settings-panel` or `#settings-trigger`.

---

## Prompt to give Claude Code

Paste the block below into a new project to generate the panel:

> Read `SETTINGS_PANEL_GENERATOR.md`. Follow it to add a settings panel to this project.
>
> First, **ask me** what settings this project needs — do not reuse a schema from any other project. For each setting, capture label, type, default, and the state key it writes to. If I say "just guess", read the main source file, propose a minimal schema, and confirm before writing code.
>
> Then generate: the HTML (outer aside + inner card), `src/main.js` wiring (with the `is-open` class toggle), `src/style/settings-panel.css`, and the `style.css` imports + `body.panel-open main` rule. Assume `src/images/gear.svg` and `src/images/close.svg` already exist; if they don't, stop and ask. Run through the verification checklist before reporting done.
