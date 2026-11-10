import { db, auth } from "./firebase.js?v=38";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { addDoc as _add, setDoc as _set, deleteDoc as _del, serverTimestamp as _ts } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { SEED } from "./seed.js?v=38";
const ADMIN_EMAIL = window.MS_CONFIG.adminEmail;
document.querySelectorAll('input[type=email][autocomplete=username]').forEach(i => i.value = ADMIN_EMAIL);
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const colors = { new: "var(--new)", paid: "var(--paid)", sent: "var(--sent)", cancelled: "var(--cancel)" };
let q = "";
let orders = [], filter = "all", unsub = null;
$("login").onsubmit = async e => {
  e.preventDefault(); $("lerr").hidden = true;
  try { await signInWithEmailAndPassword(auth, ADMIN_EMAIL, $("pw").value); }
  catch (err) {
    const m = { "auth/invalid-credential": "Wrong password.", "auth/wrong-password": "Wrong password.",
      "auth/user-not-found": "Admin user not found. Add it in Firebase → Authentication → Users.",
      "auth/operation-not-allowed": "Email/Password sign-in is off. Turn it on in Firebase → Authentication → Sign-in method.",
      "auth/too-many-requests": "Too many tries. Wait a few minutes and try again.",
      "auth/network-request-failed": "No internet connection." };
    $("lerr").textContent = (m[err.code] || "Sign-in failed") + " (" + (err.code || err.message) + ")"; $("lerr").hidden = false; }
};
$("out").onclick = () => signOut(auth);
const pwMsg = (t, ok) => { const m = $("pwMsg"); m.textContent = t; m.className = ok ? "ok" : "err"; m.hidden = false; };
$("pwBtn").onclick = () => { $("pwForm").hidden = false; $("pwMsg").hidden = true; $("cur").focus(); };
$("pwCancel").onclick = () => { $("pwForm").reset(); $("pwForm").hidden = true; };
$("pwForm").onsubmit = async e => {
  e.preventDefault();
  if ($("np1").value !== $("np2").value) return pwMsg("The new passwords don't match.");
  try {
    await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(ADMIN_EMAIL, $("cur").value));
    await updatePassword(auth.currentUser, $("np1").value);
    $("pwForm").reset(); pwMsg("Password changed. Use the new one next time.", true);
  } catch (err) {
    pwMsg(err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" ? "Current password is wrong."
      : err.code === "auth/weak-password" ? "New password is too weak. Use at least 8 characters." : "Couldn't change password: " + err.message);
  }
};
$("stats").onclick = e => { const b = e.target.closest("button"); if (!b) return; filter = b.dataset.f;
  document.querySelectorAll("#stats button").forEach(x => x.classList.toggle("on", x === b)); render(); };
$("search").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); render(); });
const ago = d => { if (!d) return ""; const m = Math.round((Date.now() - d) / 60000);
  if (m < 1) return "just now"; if (m < 60) return m + " min ago"; const h = Math.round(m / 60);
  if (h < 24) return h + "h ago"; return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };
const waNum = p => { const d = String(p || "").replace(/\D/g, ""); return d.startsWith("0") ? "972" + d.slice(1) : d; };
const hr = new Date().getHours();
$("greet").textContent = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
function render() {
  ["all","new","paid","sent","cancelled"].forEach(k => $("c-"+k).textContent = k==="all" ? orders.length : orders.filter(o => o.status===k).length);
  const today = new Date(); today.setHours(0,0,0,0);
  const todayN = orders.filter(o => o.createdAt?.toDate && o.createdAt.toDate() >= today).length;
  const pieces = orders.filter(o => o.status !== "cancelled").reduce((a, o) => a + (o.items||[]).reduce((x, i) => x + (+i.q || 0), 0), 0);
  $("sumToday").textContent = todayN; $("sumPieces").textContent = pieces;
  $("sumNew").textContent = orders.filter(o => o.status === "new").length;
  const rows = orders.filter(o => (filter === "all" || o.status === filter) &&
    (!q || [o.name, o.town, o.phone].join(" ").toLowerCase().includes(q)));
  $("list").innerHTML = rows.length ? rows.map((o, n) => {
    const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
    const count = (o.items||[]).reduce((x, i) => x + (+i.q || 0), 0);
    return `
    <article class="order" style="--c:${colors[o.status] || "var(--new)"};animation-delay:${Math.min(n,8)*40}ms">
      <div class="o-head">
        <div class="avatar">${esc((o.name||"?").trim().charAt(0).toUpperCase())}</div>
        <div class="who"><b>${esc(o.name)}</b><span>${esc(o.town)} · ${ago(d)}</span></div>
        <select data-id="${o.id}" class="st st-${esc(o.status)}">${["new","paid","sent","cancelled"].map(s => `<option value="${s}" ${s===o.status?"selected":""}>${s[0].toUpperCase()+s.slice(1)}</option>`).join("")}</select>
      </div>
      <div class="items">${(o.items||[]).map(i => `<div class="item">${(() => { const im = i.img || (products.find(p => p.id === i.pid) || {}).image; return im ? `<img class="oimg" src="${esc(im)}" alt="">` : ""; })()}<span class="in">${esc(i.n)}</span><span class="tag">${esc(i.s)}</span><span class="tag">Size ${esc(i.z)}</span>${i.c ? `<span class="tag">${esc(i.c)}</span>` : ""}<span class="qty">×${esc(i.q)}</span></div>`).join("")}</div>
      <div class="meta">
        <div><small>Payment</small>${esc(o.payment)}</div>
        <div><small>Area</small>${esc(o.area)}</div>
        <div><small>Delivery</small>${esc(o.delivery)}</div>
        <div><small>Fee</small>${esc(o.fee)}</div>
        <div><small>Pieces</small>${count}</div>
      </div>
      <div class="o-foot">
        <span class="phone">${esc(o.phone)}</span>
        <div class="hb">
          <a class="act" href="https://wa.me/${waNum(o.phone)}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="act" href="tel:${esc(o.phone)}">Call</a>
        </div>
      </div>
    </article>`; }).join("") : `<div class="empty"><img src="img/logo.png" alt=""><p>${q ? "No orders match your search." : "No orders here yet."}</p></div>`;
}
$("list").addEventListener("change", e => { const s = e.target.closest("select[data-id]");
  if (s) { s.className = "st st-" + s.value; } if (s) updateDoc(doc(db, "orders", s.dataset.id), { status: s.value }).catch(err => alert(err.message)); });

onAuthStateChanged(auth, user => {
  $("loginWrap").hidden = !!user; $("app").hidden = !user;
  if (unsub) { unsub(); unsub = null; }
  if (user) unsub = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")),
    snap => { orders = snap.docs.map(d => ({ id: d.id, ...d.data() })); render(); },
    err => { $("list").innerHTML = `<p class="err">No access: ${esc(err.message)}</p>`; });
});


/* ---------- Products ---------- */
let CATCFG={summer:[{id:"Dresses",label:"Dresses"},{id:"Suits",label:"Sets"},{id:"Blouses",label:"Tops"},{id:"Jeans",label:"Denim"},{id:"Pants",label:"Trousers"}],winter:[{id:"Jackets",label:"Jackets"},{id:"Blazers",label:"Blazers"},{id:"Blouses",label:"Knitwear"},{id:"Suits",label:"Sets"}]};
const LBL=(s,c)=>((CATCFG[s]||[]).find(x=>x.id===c)||{}).label||c;
let CATS = {}; const syncCats = () => { CATS = { summer: CATCFG.summer.map(c => c.id), winter: CATCFG.winter.map(c => c.id) }; }; syncCats();
const SIZES = ["One Size","XS","S","M","L","XL","XXL","32","34","36","38","40","42","44"];
let products = [], editId = null, pImages = [], pAlso = new Set(), pSizes = {}, pUnsub = null;
const MAXI = 5;
const money = n => "₪" + (+n || 0).toLocaleString("en-US");
const fillFilter = () => { const v = $("pFilter").value; $("pFilter").innerHTML = `<option value="">All categories</option>` + Object.entries(CATS).flatMap(([s, cs]) => cs.map(c => `<option value="${s}|${c}">${s === "summer" ? "Summer" : "Winter"} · ${LBL(s,c)}</option>`)).join(""); $("pFilter").value = v; }; fillFilter();
const fillCats = () => { $("pCat").innerHTML = CATS[$("pSeason").value].map(c => `<option value="${c}">${LBL($("pSeason").value,c)}</option>`).join(""); };
$("pSeason").onchange = () => { fillCats(); drawAlso(); }; fillCats(); $("pCat").onchange = () => drawAlso();
function drawAlso() { const prim = $("pSeason").value + "|" + $("pCat").value; pAlso.delete(prim);
  $("pAlso").innerHTML = Object.entries(CATS).flatMap(([s, cs]) => cs.filter(c => s + "|" + c !== prim).map(c => { const k = s + "|" + c;
    return `<label class="${pAlso.has(k) ? "on" : ""}"><input type="checkbox" value="${esc(k)}" ${pAlso.has(k) ? "checked" : ""}>${s === "summer" ? "Summer" : "Winter"} · ${esc(LBL(s, c))}</label>`; })).join(""); }
$("pAlso").onchange = e => { const i = e.target; if (!i.value) return; i.checked ? pAlso.add(i.value) : pAlso.delete(i.value); i.parentElement.classList.toggle("on", i.checked); };
function drawThumbs() { $("pThumbs").innerHTML = pImages.map((u, i) => `<div class="th"><img src="${esc(u)}" alt="">${i ? `<button type="button" data-first="${i}" title="Make main photo">Set main</button>` : `<em>Main</em>`}<button type="button" class="x" data-rm="${i}" aria-label="Remove photo">×</button></div>`).join("");
  $("pAddImg").hidden = pImages.length >= MAXI; }
$("pThumbs").onclick = e => { const f = e.target.closest("[data-first]"), r = e.target.closest("[data-rm]");
  if (f) { const [m] = pImages.splice(+f.dataset.first, 1); pImages.unshift(m); drawThumbs(); }
  if (r) { pImages.splice(+r.dataset.rm, 1); drawThumbs(); } };
$("tabs").onclick = e => { const b = e.target.closest("button"); if (!b) return;
  document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("on", x === b));
  ["orders","products","cats","settings"].forEach(t => $(t + "Tab").hidden = b.dataset.t !== t);
  $("pageTitle").textContent = { orders: "Orders", products: "Products", settings: "Covers", cats: "Categories" }[b.dataset.t]; };
function drawSizes() { $("pSizes").innerHTML = SIZES.map(z => `<button type="button" data-z="${z}" class="${pSizes[z] === undefined ? "" : pSizes[z] ? "out" : "on"}">${z}${pSizes[z] ? " · out" : ""}</button>`).join(""); }
$("pSizes").onclick = e => { const b = e.target.closest("button"); if (!b) return; const z = b.dataset.z;
  pSizes[z] === undefined ? pSizes[z] = false : pSizes[z] === false ? pSizes[z] = true : delete pSizes[z]; drawSizes(); };
function openForm(p) {
  editId = p ? p.id : null; $("pFormTitle").textContent = p ? "Edit product" : "New product";
  $("pName").value = p?.name || ""; $("pSeason").value = p?.season || "summer"; fillCats(); $("pCat").value = p?.category || CATS[$("pSeason").value][0];
  $("pPrice").value = p?.price ?? ""; $("pSale").value = p?.salePrice || ""; $("pColors").value = p?.colors || ""; $("pHidden").checked = !!p?.hidden;
  pImages = p ? (p.images?.length ? [...p.images] : p.image ? [p.image] : []) : []; drawThumbs();
  pAlso = new Set(p?.also || []); drawAlso();
  pSizes = {}; (p?.sizes || [{z:"S",out:false},{z:"M",out:false},{z:"L",out:false}]).forEach(s => pSizes[s.z] = !!s.out); drawSizes();
  $("pMsg").hidden = true; $("pForm").hidden = false; $("pForm").scrollIntoView({ behavior: "smooth" }); }
$("pNew").onclick = () => openForm(null);
$("pCancel").onclick = () => { $("pForm").hidden = true; };
$("pFile").onchange = async e => { const fs = [...e.target.files].slice(0, MAXI - pImages.length); e.target.value = "";
  $("pAddImg").classList.add("busy");
  for (const f of fs) { try { pImages.push(await shrink(f, 900, 160000)); } catch (_) {} }
  $("pAddImg").classList.remove("busy"); drawThumbs(); };
const pmsg = (t, ok) => { $("pMsg").textContent = t; $("pMsg").className = ok ? "ok" : "err"; $("pMsg").hidden = false; };
$("pForm").onsubmit = async e => { e.preventDefault();
  const sizes = SIZES.filter(z => pSizes[z] !== undefined).map(z => ({ z, out: pSizes[z] }));
  if (!sizes.length) return pmsg("Choose at least one size.");
  const sale = +$("pSale").value || 0, price = +$("pPrice").value || 0;
  if (sale && sale >= price) return pmsg("Sale price must be lower than the price.");
  const data = { name: $("pName").value.trim(), season: $("pSeason").value, category: $("pCat").value, price, salePrice: sale,
    colors: $("pColors").value.trim(), sizes, image: pImages[0] || "", images: pImages, also: [...pAlso], hidden: $("pHidden").checked };
  if (pImages.join("").length > 950000) return pmsg("The photos are too big together. Remove one photo and try again.");
  try { if (editId) await _set(doc(db, "products", editId), data, { merge: true });
    else await _add(collection(db, "products"), { ...data, createdAt: _ts() });
    $("pForm").hidden = true; } catch (err) { pmsg("Couldn't save: " + err.message); } };
const missingSeed = () => { const have = new Set(products.map(p => p.image)); return SEED.filter(p => !have.has(p.image)); };
$("pSeed").onclick = async () => { $("pSeed").disabled = true;
  try { for (const p of missingSeed()) await _add(collection(db, "products"), { ...p, hidden: false, createdAt: _ts() }); }
  catch (err) { alert("Import failed: " + err.message); } $("pSeed").disabled = false; };
$("pFilter").onchange = renderProducts;
function renderProducts() { try { drawCatEditor(); render(); } catch (_) {}
  const miss = missingSeed().length; $("pSeed").hidden = !miss; $("pSeed").textContent = "Add " + miss + " new pieces";
  const f = $("pFilter").value; const rows = products.filter(p => !f || f === p.season + "|" + p.category || (p.also || []).includes(f));
  $("plist").innerHTML = rows.length ? rows.map(p => { const sale = p.salePrice > 0 && p.salePrice < p.price; const out = (p.sizes||[]).every(s => s.out);
    return `<article class="pitem${p.hidden ? " hid" : ""}">
      <div class="pi-img">${p.image ? `<img src="${esc(p.image)}" alt="">` : ""}${out ? "<em>Sold out</em>" : p.hidden ? "<em>Hidden</em>" : ""}</div>
      <div class="pi-body">
        <span class="muted">${p.season === "summer" ? "Summer" : "Winter"} · ${esc(LBL(p.season,p.category))}${(p.also||[]).length ? ` +${p.also.length}` : ""}${(p.images||[]).length > 1 ? ` · ${p.images.length} photos` : ""}</span>
        <b>${esc(p.name)}</b>
        <div class="pi-price">${sale ? `<s>${money(p.price)}</s> ` : ""}${money(sale ? p.salePrice : p.price)}</div>
        <div class="pi-sz">${(p.sizes||[]).map(s => `<button data-id="${p.id}" data-z="${esc(s.z)}" class="${s.out ? "out" : ""}" title="Tap to switch in stock / sold out">${esc(s.z)}</button>`).join("")}</div>
        <div class="hb"><button class="act" data-edit="${p.id}">Edit</button><button class="act" data-del="${p.id}">Delete</button></div>
      </div></article>`; }).join("") : `<div class="empty"><img src="img/logo.png" alt=""><p>No products yet. Tap “+ Add product”.</p></div>`;
}
$("plist").onclick = async e => {
  const sz = e.target.closest(".pi-sz button"); const ed = e.target.closest("[data-edit]"); const dl = e.target.closest("[data-del]");
  if (sz) { const p = products.find(x => x.id === sz.dataset.id); const sizes = p.sizes.map(s => s.z === sz.dataset.z ? { ...s, out: !s.out } : s);
    _set(doc(db, "products", p.id), { sizes }, { merge: true }).catch(err => alert(err.message)); }
  if (ed) openForm(products.find(x => x.id === ed.dataset.edit));
  if (dl) { const b = dl; if (b.dataset.sure) { _del(doc(db, "products", b.dataset.del)).catch(err => alert(err.message)); }
    else { b.dataset.sure = 1; b.textContent = "Tap again to delete"; setTimeout(() => { delete b.dataset.sure; b.textContent = "Delete"; }, 3000); } }
};
onAuthStateChanged(auth, user => { if (pUnsub) { pUnsub(); pUnsub = null; }
  if (user) pUnsub = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")),
    snap => { products = snap.docs.map(d => ({ id: d.id, ...d.data() })); renderProducts(); },
    err => { $("plist").innerHTML = `<p class="err">${esc(err.message)}</p>`; }); });
/* ---------- Cover photo ---------- */
let cImage = "";
const cmsg = (t, ok) => { $("cMsg").textContent = t; $("cMsg").className = ok ? "ok" : "err"; $("cMsg").hidden = false; };
$("cFile").onchange = async e => { const f = e.target.files[0]; if (!f) return;
  const img = await createImageBitmap(f); const sc = Math.min(1, 1800 / img.width);
  const c = document.createElement("canvas"); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  let q = .85; cImage = c.toDataURL("image/jpeg", q); while (cImage.length > 900000 && q > .4) { q -= .1; cImage = c.toDataURL("image/jpeg", q); }
  $("cPrev").src = cImage; $("cSave").disabled = false; $("cMsg").hidden = true; };
$("cSave").onclick = async () => { $("cSave").disabled = true;
  try { await _set(doc(db, "settings", "site"), { heroImage: cImage }, { merge: true }); cmsg("Cover saved. It's live on the store now.", true); }
  catch (err) { cmsg("Couldn't save: " + err.message); $("cSave").disabled = false; } };
$("cReset").onclick = async () => {
  try { await _set(doc(db, "settings", "site"), { heroImage: "" }, { merge: true }); $("cPrev").src = "img/hero.jpg"; cmsg("Back to the original cover.", true); }
  catch (err) { cmsg("Couldn't reset: " + err.message); } };
onAuthStateChanged(auth, user => { if (user) onSnapshot(doc(db, "settings", "site"), s => { const h = s.data()?.heroImage; if (h && !cImage) $("cPrev").src = h; }); });

/* ---------- Category covers ---------- */
let covers = {};
const shrink = async (f, max, limit) => { const img = await createImageBitmap(f); const sc = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  let q = .82, d = c.toDataURL("image/jpeg", q); while (d.length > limit && q > .4) { q -= .1; d = c.toDataURL("image/jpeg", q); } return d; };
function drawCovers() {
  $("ccovers").innerHTML = Object.entries(CATS).flatMap(([s, cs]) => cs.map(c => { const id = s + "-" + c, img = covers[id];
    return `<div class="cc"><label class="cc-img">${img ? `<img src="${img}" alt="">` : `<span>${esc(LBL(s, c)).toUpperCase()}</span>`}
      <input type="file" accept="image/*" data-cover="${id}" hidden></label>
      <div class="cc-info"><b>${esc(LBL(s, c))}</b><span class="muted">${s === "summer" ? "Summer" : "Winter"}</span>
      ${img ? `<button class="act" data-uncover="${id}">Remove photo</button>` : `<span class="muted">Tap the box to add a photo</span>`}</div></div>`; })).join("");
}
$("ccovers").addEventListener("change", async e => { const i = e.target.closest("[data-cover]"); if (!i || !i.files[0]) return;
  const box = i.closest(".cc"); box.classList.add("busy");
  try { const d = await shrink(i.files[0], 800, 180000); await _set(doc(db, "covers", i.dataset.cover), { image: d }); }
  catch (err) { alert("Couldn't save: " + err.message); } box.classList.remove("busy"); });
$("ccovers").addEventListener("click", e => { const b = e.target.closest("[data-uncover]"); if (!b) return;
  _del(doc(db, "covers", b.dataset.uncover)).catch(err => alert(err.message)); });
drawCovers();
onAuthStateChanged(auth, user => { if (user) onSnapshot(collection(db, "covers"), snap => {
  covers = {}; snap.docs.forEach(d => covers[d.id] = d.data().image); drawCovers(); slimCovers(); }); });
let slimming = false;
async function slimCovers() { if (slimming) return; slimming = true;
  for (const [id, img] of Object.entries(covers)) { if (!img || !img.startsWith("data:") || img.length < 250000) continue;
    try { const b = await (await fetch(img)).blob(); const d = await shrink(b, 800, 180000);
      if (d.length < img.length) await _set(doc(db, "covers", id), { image: d }); } catch (_) {} }
  slimming = false; }

/* ---------- Categories ---------- */
const cmsg2 = (t, ok) => { $("cMsg2").textContent = t; $("cMsg2").className = ok ? "ok" : "err"; $("cMsg2").hidden = false; setTimeout(() => $("cMsg2").hidden = true, 3000); };
function drawCatEditor() {
  for (const s of ["summer", "winter"]) {
    $("cl-" + s).innerHTML = (CATCFG[s] || []).map((c, i) => { const n = products.filter(p => p.season === s && p.category === c.id).length;
      return `<div class="crow"><input value="${esc(c.label)}" data-s="${s}" data-i="${i}" maxlength="30">
        <span class="muted">${n} pcs</span>
        <button class="act" data-up="${s}|${i}" title="Move up">↑</button>
        <button class="act" data-del="${s}|${i}">Remove</button></div>`; }).join("") || `<p class="muted">No categories yet.</p>`;
  }
}
const saveCats = async (msg) => { try { await _set(doc(db, "settings", "categories"), { summer: CATCFG.summer, winter: CATCFG.winter }); cmsg2(msg, true); }
  catch (err) { cmsg2("Couldn't save: " + err.message); } };
function catsChanged() { syncCats(); fillFilter(); fillCats(); drawCovers(); drawCatEditor(); }
$("catsTab").addEventListener("change", e => { const inp = e.target.closest(".crow input"); if (!inp) return;
  const v = inp.value.trim(); if (!v) { drawCatEditor(); return; }
  CATCFG[inp.dataset.s][+inp.dataset.i].label = v; catsChanged(); saveCats("Name saved."); });
$("catsTab").addEventListener("click", e => {
  const up = e.target.closest("[data-up]"), del = e.target.closest(".crow [data-del]");
  if (up) { const [s, i] = up.dataset.up.split("|"); const k = +i; if (k > 0) { const a = CATCFG[s]; [a[k - 1], a[k]] = [a[k], a[k - 1]]; catsChanged(); saveCats("Order saved."); } }
  if (del) { const [s, i] = del.dataset.del.split("|"); const c = CATCFG[s][+i];
    const n = products.filter(p => p.season === s && p.category === c.id).length;
    if (!del.dataset.sure) { del.dataset.sure = 1; del.textContent = n ? `Has ${n} pcs. Tap again` : "Tap again"; setTimeout(() => { delete del.dataset.sure; del.textContent = "Remove"; }, 3000); return; }
    CATCFG[s].splice(+i, 1); catsChanged(); saveCats("Category removed. Its pieces are hidden until you move them to another category."); }
});
document.querySelectorAll(".cadd").forEach(f => f.onsubmit = e => { e.preventDefault(); const s = f.dataset.s, inp = f.querySelector("input"), label = inp.value.trim(); if (!label) return;
  let id = label.replace(/[^A-Za-z0-9 ]/g, "").trim() || ("Cat" + Date.now()); const all = [...CATCFG.summer, ...CATCFG.winter].map(c => c.id);
  while ((CATCFG[s] || []).some(c => c.id === id)) id += "2";
  (CATCFG[s] = CATCFG[s] || []).push({ id, label }); inp.value = ""; catsChanged(); saveCats(`"${label}" added.`); });
onAuthStateChanged(auth, user => { if (user) onSnapshot(doc(db, "settings", "categories"), s => { if (s.exists()) { const d = s.data(); CATCFG = { summer: d.summer || [], winter: d.winter || [] }; catsChanged(); } else drawCatEditor(); }); });
