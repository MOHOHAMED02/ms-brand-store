import { SEED } from "./seed.js?v=38";
if (!window.__PRODUCTS) {
  window.__PRODUCTS = SEED.map((p, i) => ({ id: "seed-" + i, ...p }));
  window.dispatchEvent(new CustomEvent("products", { detail: window.__PRODUCTS }));
  setTimeout(() => window.applyCovers && window.applyCovers(), 0);
}
