import { createLocalJsonState } from "./local-json-state.js";

const VALID_THEMES = new Set(["blue", "orange", "green", "dark"]);

function defaultState() {
  return { count: 0, theme: "blue" };
}

function normalizeState(value) {
  const rawCount = Number(value?.count);
  const count = Number.isFinite(rawCount) ? Math.max(0, Math.trunc(rawCount)) : 0;
  const theme = VALID_THEMES.has(value?.theme) ? value.theme : "blue";
  return { count, theme };
}

const storage = createLocalJsonState({
  key: "tap-counter-state-v1",
  createDefault: defaultState,
  normalize: normalizeState,
  onError: (error, operation) => console.warn(`Local state ${operation} failed.`, error)
});

let state = storage.load();

const countElement = document.querySelector("#count");
const addButton = document.querySelector("#addButton");
const subtractButton = document.querySelector("#subtractButton");
const clearButton = document.querySelector("#clearButton");
const themeButtons = [...document.querySelectorAll("[data-set-theme]")];
const themeColor = document.querySelector('meta[name="theme-color"]');

function save() {
  try {
    state = storage.save(state);
  } catch {
    // The counter still works for the current session if storage is unavailable.
  }
}

function render() {
  countElement.textContent = state.count;
  document.body.dataset.theme = state.theme;

  const themeColors = {
    blue: "#2563eb",
    orange: "#e86f18",
    green: "#218653",
    dark: "#101318"
  };
  themeColor.setAttribute("content", themeColors[state.theme]);

  for (const button of themeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.setTheme === state.theme));
  }
}

function changeCount(amount) {
  state.count = Math.max(0, state.count + amount);
  save();
  render();
}

addButton.addEventListener("click", () => changeCount(1));
subtractButton.addEventListener("click", () => changeCount(-1));

clearButton.addEventListener("click", () => {
  if (state.count === 0) return;
  if (!window.confirm(`Clear the current count of ${state.count}?`)) return;
  state.count = 0;
  save();
  render();
});

for (const button of themeButtons) {
  button.addEventListener("click", () => {
    state.theme = button.dataset.setTheme;
    save();
    render();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch((error) => console.warn("Offline support could not be enabled.", error));
  });
}

render();
