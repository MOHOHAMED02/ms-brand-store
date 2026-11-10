// Store data loader: plain one-time HTTPS reads (Firestore Lite) with retries + device cache.
// No live socket connection, so it works the same inside Instagram / WhatsApp / any browser.
import { SEED } from "./seed.js?v=38";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js";

const app = initializeApp(window.MS_CONFIG.firebase, "store");
const db = getFirestore(app);

window.saveOrder = (o) => addDoc(collection(db, "orders"), { ...o, status: "new", createdAt: serverTimestamp() })
  .catch(e => console.error("Order not saved:", e));

/* ---------- device cache (IndexedDB) ---------- */
const idb = (() => { let p; const open = () => p || (p = new Promise((res, rej) => { try { const r = indexedDB.open("ms", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  return { get: k => open().then(d => new Promise(res => { const q = d.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); })),
    set: (k, v) => open().then(d => { d.transaction("kv", "readwrite").objectStore("kv").put(v, k); }) }; })();
try { localStorage.removeItem("ms-covers"); } catch (_) {}

/* ---------- apply data to the page ---------- */
const inCat = (p, s, c) => (p.season === s && p.category === c) || (p.also || []).includes(s + "|" + c);
window.applyCovers = () => { const m = window.__COVERS; if (!m) return;
  const P = window.__LIVE ? (window.__PRODUCTS || []) : [];
  document.querySelectorAll(".cat").forEach(c => {
    const auto = (P.find(p => inCat(p, c.dataset.season, c.dataset.n) && p.price > 0 && !p.hidden && p.image) || {}).image;
    const img = m[c.dataset.season + "-" + c.dataset.n] || auto;
    c.classList.toggle("cover", !!img); c.style.setProperty("--cover", img ? `url("${img}")` : "none"); }); };
const setProducts = (list, live) => {
  const have = new Set(list.map(p => p.image));
  list = list.concat(SEED.filter(p => !have.has(p.image)).map((p, i) => ({ id: "seed-x" + i, ...p })));
  window.__PRODUCTS = list; if (live) window.__LIVE = true;
  window.dispatchEvent(new CustomEvent("products", { detail: list })); window.applyCovers(); };
const setCovers = m => { window.__COVERS = m; window.applyCovers(); try { localStorage.setItem("ms-cov2", JSON.stringify(m)); } catch (_) { try { localStorage.removeItem("ms-cov2"); } catch (e) {} } };
const setCats = d => { if (d && (d.summer || d.winter)) window.dispatchEvent(new CustomEvent("categories", { detail: d })); };
const setHero = h => { const img = document.querySelector(".hero2 img");
  if (img && h) { img.src = h; document.querySelectorAll(".hero2 .hs").forEach(x => x.hidden = true); } };

/* ---------- 1) show what this device saw last time, instantly ---------- */
idb.get("data").then(d => { if (!d || window.__LIVE) return;
  if (d.cats) setCats(d.cats); if (d.covers) setCovers(d.covers); if (d.hero) setHero(d.hero);
  if (d.products && d.products.length) { setProducts(d.products, true); } }).catch(() => {});

/* ---------- 2) fetch fresh data (with timeout + retries) ---------- */
const timeout = (pr, ms) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
async function load(attempt = 1) {
  try {
    const [ps, cs, site, cats] = await timeout(Promise.all([
      getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "covers")),
      getDoc(doc(db, "settings", "site")),
      getDoc(doc(db, "settings", "categories"))]), 25000);
    const products = ps.docs.map(d => ({ id: d.id, ...d.data(), createdAt: null }));
    const covers = {}; cs.docs.forEach(d => covers[d.id] = d.data().image);
    const catsD = cats.exists() ? cats.data() : null, hero = site.exists() ? site.data().heroImage : "";
    setCats(catsD); setCovers(covers); setHero(hero); setProducts(products, true);
    idb.set("data", { products, covers, cats: catsD, hero }).catch(() => {});
  } catch (e) {
    console.error("Load failed (try " + attempt + "):", e);
    if (attempt < 4) return setTimeout(() => load(attempt + 1), 1500 * attempt);
    if (!window.__LIVE) { window.__LIVE = true; window.dispatchEvent(new CustomEvent("products", { detail: window.__PRODUCTS || [] })); }
  }
}
load();
addEventListener("pageshow", e => { if (e.persisted) load(); });

const _cols = document.getElementById("cols");
if (_cols) new MutationObserver(() => window.applyCovers()).observe(_cols, { childList: true });
window.applyCovers();
