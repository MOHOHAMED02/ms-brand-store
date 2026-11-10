let CATCFG={summer:[{id:"Dresses",label:"Dresses"},{id:"Suits",label:"Sets"},{id:"Blouses",label:"Tops"},{id:"Jeans",label:"Denim"},{id:"Pants",label:"Trousers"}],winter:[{id:"Jackets",label:"Jackets"},{id:"Blazers",label:"Blazers"},{id:"Blouses",label:"Knitwear"},{id:"Suits",label:"Sets"}]};
const LBL=(s,c)=>((CATCFG[s]||[]).find(x=>x.id===c)||{}).label||c;
const CFG=window.MS_CONFIG||{};const WA="https://wa.me/"+(CFG.whatsapp||"");
const svg={
waze:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15.5C3.4 15 2.6 13.8 3 12.5c.6-.4 1.2-1 1.4-2.2C5 6.6 8.2 4 12.3 4 16.8 4 20.5 7.4 20.5 11.7c0 3.2-2 5.6-5 6.6"/><circle cx="8" cy="19" r="1.8"/><circle cx="15" cy="19" r="1.8"/><path d="M9.8 19h3.4"/><circle cx="10" cy="10" r=".7" fill="currentColor"/><circle cx="15" cy="10" r=".7" fill="currentColor"/><path d="M10 13.2c1.4 1.2 3.6 1.2 5 0"/></svg>',
ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor"/></svg>',
wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.8-1.2s.2-1.1.1-1.2l-.5-.3z"/></svg>'};
const icons=`<a href="${CFG.waze||"#"}" target="_blank" rel="noopener" aria-label="Waze">${svg.waze}</a><a href="https://www.instagram.com/${CFG.instagram||""}" target="_blank" rel="noopener" aria-label="Instagram">${svg.ig}</a><a href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp">${svg.wa}</a>`;
document.querySelectorAll(".ic").forEach(e=>e.innerHTML=icons);
const BAG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
const slug=t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,"-");
const escH=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function buildCats(){
let cols="",m="",mq="";
for(const id of ["summer","winter"]){const en=id.toUpperCase(),ar=id==="summer"?"Summer":"Winter",cs=CATCFG[id]||[];
if(!cs.length)continue;
m+=`<h4>${en}</h4>`+cs.map(c=>`<button class="it" data-k="${id}-${slug(c.id)}" data-t="${escH(c.label)} · ${ar}">${escH(c.label)}<small>${escH(c.label).toUpperCase()}</small></button>`).join("");
cols+=`<section class="season" id="${id}"><div class="shead"><h2>${en}</h2><span>${ar} Collection</span></div><div class="grid">`+
cs.map(c=>`<button class="cat" id="${id}-${slug(c.id)}" data-n="${escH(c.id)}" data-s="${ar}" data-season="${id}"><span class="en">${ar}</span><span class="big">${escH(c.label).toUpperCase()}</span><div class="foot"><h3>${escH(c.label)}</h3><span class="wa">${BAG}</span></div></button>`).join("")+`</div></section>`;
mq+=`<span>${en}</span><i>✦</i><span>${cs.map(c=>escH(c.label)).join(" · ")}</span><i>✦</i>`}
m='<h4>ALL</h4><button class="it" data-k="all">All categories<small>ALL</small></button>'+m;
document.getElementById("cols").innerHTML=cols;document.getElementById("mlist").innerHTML=m;
const q=document.querySelector(".marq div");if(q&&mq)q.innerHTML=mq.repeat(4);
if(typeof decorateCards==="function")try{decorateCards()}catch(e){}
window.applyCovers&&window.applyCovers()}
try{const m=JSON.parse(localStorage.getItem("ms-cov2")||"null");if(m&&Object.keys(m).length)window.__COVERS=m}catch(_){}
window.applyCovers=window.applyCovers||function(){const m=window.__COVERS;if(!m)return;document.querySelectorAll(".cat").forEach(c=>{const img=m[c.dataset.season+"-"+c.dataset.n];if(img){c.classList.add("cover");c.style.setProperty("--cover",`url("${img}")`)}})};
try{const c=JSON.parse(localStorage.getItem("ms-cats")||"null");if(c&&(c.summer||c.winter))CATCFG={summer:c.summer||[],winter:c.winter||[]}}catch(_){}
buildCats();
window.addEventListener("categories",e=>{if(e.detail&&(e.detail.summer||e.detail.winter)){const n={summer:e.detail.summer||[],winter:e.detail.winter||[]};
if(JSON.stringify(n)===JSON.stringify(CATCFG))return;CATCFG=n;try{localStorage.setItem("ms-cats",JSON.stringify(n))}catch(_){}buildCats()}});
const menu=document.getElementById("menu"),btn=document.getElementById("catBtn");
const openM=o=>{menu.hidden=!o;btn.setAttribute("aria-expanded",o)};
btn.onclick=()=>openM(true);document.getElementById("mclose").onclick=()=>openM(false);
menu.onclick=e=>{if(e.target===menu)openM(false)};
function show(k,t){
const all=k==="all";
document.querySelectorAll(".cat").forEach(c=>c.hidden=!all&&c.id!==k);
document.querySelectorAll(".season").forEach(s=>s.hidden=!all&&!s.querySelector(".cat:not([hidden])"));
document.querySelectorAll(".grid").forEach(g=>g.classList.toggle("one",!all));
document.getElementById("filterbar").hidden=all;document.getElementById("ftitle").textContent=t||"";
document.querySelector(".shop").scrollIntoView({behavior:"smooth"});}
document.getElementById("mlist").onclick=e=>{const b=e.target.closest(".it");if(!b)return;openM(false);show(b.dataset.k,b.dataset.t)};
document.getElementById("showAll").onclick=()=>show("all");
const tt=document.getElementById("toTop");
addEventListener("scroll",()=>{tt.hidden=scrollY<400},{passive:true});
tt.onclick=()=>scrollTo({top:0,behavior:"smooth"});

let cart=[];try{cart=JSON.parse(localStorage.getItem("ms-cart")||"[]")}catch(e){}
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem("ms-cart",JSON.stringify(cart))}catch(e){}renderCart()};
const toast=t=>{const x=$("toast");x.textContent=t;x.hidden=false;clearTimeout(x._t);x._t=setTimeout(()=>x.hidden=true,1800)};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest(".modal").hidden=true);
document.querySelectorAll(".modal").forEach(mo=>mo.addEventListener("click",e=>{if(e.target===mo)mo.hidden=true}));
let cur=null,size="M",q=1;
$("sizes").innerHTML=["XS","S","M","L","XL","XXL"].map(z=>`<button type="button" data-z="${z}">${z}</button>`).join("");
const setSize=z=>{size=z;$("sizes").querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.z===z))};
$("sizes").onclick=e=>{const b=e.target.closest("button");if(b)setSize(b.dataset.z)};
$("qm").onclick=()=>{q=Math.max(1,q-1);$("qv").textContent=q};$("qp").onclick=()=>{q++;$("qv").textContent=q};
let PRODUCTS=[],curP=null,color="",cv=null;
const money=n=>"₪"+(+n).toLocaleString("en-US");
const esc=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const inCat=(p,season,cat)=>(p.season===season&&p.category===cat)||(p.also||[]).includes(season+"|"+cat);
const prodsOf=(season,cat)=>PRODUCTS.filter(p=>inCat(p,season,cat)&&!p.hidden&&p.price>0);
const imgsOf=p=>p?(p.images&&p.images.length?p.images:(p.image?[p.image]:[])):[];
const slider=(imgs,alt)=>`<div class="sl"><div class="sl-t">${imgs.map((u,i)=>`<img src="${esc(u)}" alt="${esc(alt)}" ${i?'loading="lazy"':""} decoding="async">`).join("")}</div>${imgs.length>1?`<span class="sl-a l" role="button" aria-label="Previous photo">‹</span><span class="sl-a r" role="button" aria-label="Next photo">›</span><span class="sl-n">1/${imgs.length}</span>`:""}</div>`;
document.addEventListener("click",e=>{const a=e.target.closest(".sl-a");if(!a)return;e.preventDefault();e.stopPropagation();
 const t=a.parentElement.querySelector(".sl-t"),n=t.children.length,i=Math.round(t.scrollLeft/t.clientWidth);
 const j=(i+(a.classList.contains("r")?1:-1)+n)%n;t.scrollTo({left:j*t.clientWidth,behavior:"smooth"})},true);
document.addEventListener("scroll",e=>{const t=e.target;if(!t.classList||!t.classList.contains("sl-t"))return;
 const c=t.parentElement.querySelector(".sl-n");if(c)c.textContent=(Math.round(t.scrollLeft/t.clientWidth)+1)+"/"+t.children.length},true);
const priceOf=p=>p.salePrice>0&&p.salePrice<p.price?p.salePrice:p.price;
const allOut=p=>(p.sizes||[]).length&&(p.sizes||[]).every(z=>z.out);
function decorateCards(){document.querySelectorAll(".cat").forEach(c=>{const ps=prodsOf(c.dataset.season,c.dataset.n);
 const im=ps.find(p=>p.image);
 let cnt=c.querySelector(".cnt");if(!cnt){cnt=document.createElement("span");cnt.className="cnt";c.querySelector(".foot").prepend(cnt)}
 cnt.textContent=ps.length?ps.length+(ps.length>1?" pieces":" piece"):"";});
 if(!$("catView").hidden&&cv)openCat(cv.season,cv.cat,true)}
window.addEventListener("products",e=>{PRODUCTS=e.detail||[];decorateCards()});
if(window.__PRODUCTS)PRODUCTS=window.__PRODUCTS,decorateCards();
function openCat(season,cat,keep){cv={season,cat};const ps=prodsOf(season,cat);
 $("cvSeason").textContent=(season==="summer"?"Summer":"Winter")+" Collection";$("cvTitle").textContent=LBL(season,cat);
 $("pgrid").innerHTML=!ps.length?`<p class="pempty">${window.__LIVE?`New pieces coming soon ✨<br><a href="${WA}" target="_blank" rel="noopener">Ask us on WhatsApp</a>`:"Loading pieces…"}</p>`:ps.map(p=>{const out=allOut(p),sale=p.salePrice>0&&p.salePrice<p.price;
  return `<button class="pcard${out?" out":""}" data-id="${p.id}"><div class="pimg">${imgsOf(p).length?slider(imgsOf(p),p.name):`<span>${esc(p.name)}</span>`}${out?'<em>Sold out</em>':sale?'<em class="sale">Sale</em>':""}</div>
  <div class="pinfo"><b>${esc(p.name)}</b><span>${sale?`<s>${money(p.price)}</s> `:""}${money(priceOf(p))}</span></div>
  <div class="psz">${(p.sizes||[]).map(z=>`<i class="${z.out?"x":""}">${esc(z.z)}</i>`).join("")}</div></button>`}).join("");
 document.getElementById("cols").hidden=true;$("filterbar").hidden=true;$("catView").hidden=false;
 if(!keep)$("catView").scrollIntoView({behavior:"smooth"})}
$("cvBack").onclick=()=>{$("catView").hidden=true;document.getElementById("cols").hidden=false;cv=null;document.querySelector(".shop").scrollIntoView({behavior:"smooth"})};
function openAdd(o){cur=o;q=1;$("qv").textContent=1;$("aC").value="";color="";
 $("aN").textContent=o.n;$("aS").textContent=o.s+" Collection";
 const p=curP,ims=imgsOf(p);$("aImgs").hidden=!ims.length;$("aImgs").innerHTML=ims.length?slider(ims,o.n):"";
 $("aP").hidden=!p;if(p){const sale=p.salePrice>0&&p.salePrice<p.price;$("aP").innerHTML=(sale?`<s>${money(p.price)}</s> `:"")+money(priceOf(p))}
 const sz=p&&p.sizes&&p.sizes.length?p.sizes:["XS","S","M","L","XL","XXL"].map(z=>({z}));
 $("sizes").innerHTML=sz.map(z=>`<button type="button" data-z="${esc(z.z)}" ${z.out?"disabled":""}>${esc(z.z)}${z.out?" · sold out":""}</button>`).join("");
 const first=sz.find(z=>!z.out);size="";if(first)setSize(first.z);
 const cols=p&&p.colors?p.colors.split(",").map(x=>x.trim()).filter(Boolean):[];
 $("aColWrap").hidden=!cols.length;$("aCols").innerHTML=cols.map(c=>`<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join("");
 if(cols.length){color=cols[0];$("aCols").firstChild.classList.add("on")}
 $("aCLab").textContent=cols.length?"Note (optional)":"Color / note";$("aC").placeholder=cols.length?"Anything we should know":"e.g. Black";
 $("addF").querySelector(".primary").disabled=!first;$("addF").querySelector(".primary").textContent=first?"Add to bag":"Sold out";
 $("addM").hidden=false}
$("aCols").onclick=e=>{const b=e.target.closest("button");if(!b)return;color=b.dataset.c;$("aCols").querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b))};
$("cols").addEventListener("click",e=>{const c=e.target.closest(".cat");if(!c)return;
 openCat(c.dataset.season,c.dataset.n)});
$("pgrid").addEventListener("click",e=>{const b=e.target.closest(".pcard");if(!b)return;const p=PRODUCTS.find(x=>x.id===b.dataset.id);if(!p)return;
 curP=p;openAdd({n:p.name,s:p.season==="summer"?"Summer":"Winter",cat:p.category})});
$("addF").onsubmit=e=>{e.preventDefault();if(!size)return;const note=$("aC").value.trim();cart.push({...cur,z:size,c:[color,note].filter(Boolean).join(" · "),q,...(curP?{pid:curP.id,p:priceOf(curP),...(imgsOf(curP)[0]&&!String(imgsOf(curP)[0]).startsWith("data:")?{img:imgsOf(curP)[0]}:{})}:{})});save();$("addM").hidden=true;toast("Added to bag")};
var renderCart=function(){const n=cart.reduce((a,b)=>a+b.q,0);$("cnt").hidden=!n;$("cnt").textContent=n;
$("items").innerHTML=cart.map((it,i)=>`<div class="item">${it.img?`<img class="ci" src="${it.img}" alt="">`:""}<div style="flex:1;min-width:0"><b>${esc(it.n)} · ${esc(it.s)}</b><small>Size ${esc(it.z)}${it.c?" · "+esc(it.c):""} · ×${it.q}${it.p?" · "+money(it.p*it.q):""}</small></div><button data-r="${i}">Remove</button></div>`).join("");
$("empty").hidden=!!cart.length;$("coF").hidden=!cart.length;updTotals()};
$("items").onclick=e=>{const b=e.target.closest("[data-r]");if(b){cart.splice(+b.dataset.r,1);save()}};
$("cartBtn").onclick=()=>{renderCart();$("cartM").hidden=false};
$("coF").onsubmit=e=>{e.preventDefault();const f=e.target;
const T=totals();const msg=["New order - MS Brand Clothing","",...cart.map((it,i)=>`${i+1}. ${it.n} (${it.s}) - Size ${it.z}${it.c?" - "+it.c:""} - Qty ${it.q}${it.p?" - "+money(it.p*it.q):""}${it.img?"\n   "+location.origin+it.img:(it.pid&&!String(it.pid).startsWith("seed")?"\n   "+location.origin+"/p?id="+it.pid:"")}`),"",
`Name: ${$("fN").value}`,`Town: ${$("fT").value}`,`Phone: ${$("fP").value}`,`Payment: ${f.pay.value}`,`Area: ${f.area.value}`,...(isLocal()?[`Delivery: ${f.dl.value}`]:[]),`Delivery fee: ${feeText()}`,...(T.priced?[`Total: ${money(T.total)}`+(T.unpriced?" + items without price":"")]:[])].join("\n");
const a=document.createElement("a");a.href=WA+"?text="+encodeURIComponent(msg);a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
try{window.saveOrder&&window.saveOrder({items:cart,name:$("fN").value,town:$("fT").value,phone:$("fP").value,payment:f.pay.value,area:f.area.value,delivery:isLocal()?f.dl.value:"Delivery",fee:feeText(),...(T.priced?{subtotal:T.sub,total:T.total}:{})})}catch(_){}
$("err").hidden=false;$("err").style.color="var(--muted)";$("err").textContent="WhatsApp opened with your order. Tap Send there to place it.";};
renderCart();

const isLocal=()=>document.getElementById("coF").area.value==="Daburiyya / Shibli";
const feeText=()=>{const r=document.querySelector("input[name=area]:checked");if(!r)return "—";const f=+r.dataset.fee;return f?"₪"+f:"Free"};
function totals(){const sub=cart.reduce((a,i)=>a+(i.p||0)*i.q,0);const r=document.querySelector("input[name=area]:checked");const fee=r?+r.dataset.fee:0;
 return{sub,fee,total:sub+fee,priced:cart.some(i=>i.p),unpriced:cart.some(i=>!i.p)}}
function updTotals(){const T=totals();$("subRow").hidden=!T.priced;$("subV").textContent=money(T.sub);
 $("totRow").hidden=!T.priced;$("totV").textContent=money(T.total)+(T.unpriced?" +":"")}
$("area").addEventListener("change",()=>{updTotals();const l=isLocal();$("local").hidden=!l;document.querySelectorAll("input[name=dl]").forEach(x=>{x.required=l;if(!l)x.checked=false});$("feeV").textContent=feeText()});

const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){const el=x.target;el.classList.remove("pre");el.classList.add("in");io.unobserve(el)}}),{rootMargin:"0px 0px -8% 0px"});
document.querySelectorAll(".cat,.shead h2,.visit .ic a").forEach(el=>{
const r=el.getBoundingClientRect();if(r.top>innerHeight){el.classList.add("pre");
const sib=[...el.parentElement.children].indexOf(el);el.style.animationDelay=(sib%3)*0.12+"s";io.observe(el)}});
const _rc=renderCart;renderCart=function(){const before=$("cnt").textContent;_rc();if($("cnt").textContent!==before&&+$("cnt").textContent>+before){$("cartBtn").classList.remove("bump");void $("cartBtn").offsetWidth;$("cartBtn").classList.add("bump")}};

document.getElementById("pay").addEventListener("change",e=>{document.getElementById("payNote").hidden=e.target.value==="מזומן"});
