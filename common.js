/* =========================================================
   RINKA SHOP — Header / Footer / Auth ที่ใช้ร่วมกันทุกหน้า
   ========================================================= */

const RinkaAuth = {
  KEY: "rinka_session_v1",
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { return null; }
  },
  set(session) {
    localStorage.setItem(this.KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(this.KEY);
  },
  isLoggedIn() {
    return !!this.get()?.session_token;
  }
};

function money(n) {
  return RINKA_CONFIG.CURRENCY + Number(n || 0).toLocaleString("th-TH");
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function toast(msg, isError = false) {
  let el = document.getElementById("rinka-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "rinka-toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "rinka-toast show" + (isError ? " error" : "");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3200);
}

function renderHeader() {
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const session = RinkaAuth.get();
  mount.innerHTML = `
    <div class="topbar">
      <div class="wrap topbar-inner">
        <span>📮 พรีออเดอร์จากต่างประเทศ • แจ้งสถานะทุกขั้นตอนทางอีเมล</span>
      </div>
    </div>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">凛</span>
          <span class="brand-text">
            <span class="brand-name">${RINKA_CONFIG.SHOP_NAME}</span>
            <span class="brand-tagline">${RINKA_CONFIG.SHOP_TAGLINE}</span>
          </span>
        </a>
        <nav class="main-nav">
          <a href="index.html">หน้าแรก</a>
          <a href="collections.html">คอลเลกชัน</a>
          <a href="track.html">ติดตามออเดอร์</a>
        </nav>
        <div class="header-actions">
          <form class="search-box" onsubmit="location.href='search.html?q='+encodeURIComponent(this.q.value); return false;">
            <input name="q" type="search" placeholder="ค้นหาสินค้า...">
          </form>
          ${session
            ? `<a class="icon-link" href="account.html" title="บัญชีของฉัน">👤 ${session.username || "บัญชี"}</a>`
            : `<a class="icon-link" href="login.html" title="เข้าสู่ระบบ">👤 เข้าสู่ระบบ</a>`
          }
          <a class="icon-link cart-link" href="cart.html" title="ตะกร้า">
            🛍️ <span class="cart-badge" data-cart-count>0</span>
          </a>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  mount.innerHTML = `
    <footer class="site-footer">
      <div class="wrap footer-inner">
        <div>
          <div class="brand-name">${RINKA_CONFIG.SHOP_NAME}</div>
          <p>รับพรีออเดอร์สินค้าจากต่างประเทศ ตรวจสอบสถานะพัสดุได้ทุกขั้นตอน ตั้งแต่สั่งซื้อจนถึงมือคุณ</p>
        </div>
        <div>
          <div class="footer-title">ช่วยเหลือ</div>
          <a href="track.html">ติดตามออเดอร์</a>
          <a href="collections.html">คอลเลกชันทั้งหมด</a>
          <a href="account.html">บัญชีของฉัน</a>
        </div>
        <div>
          <div class="footer-title">ขั้นตอนพรีออเดอร์</div>
          <p>1. สั่งซื้อ + แนบสลิป &nbsp; 2. รอสินค้าถึงไทย &nbsp; 3. ชำระค่านำเข้า/ค่าส่ง &nbsp; 4. จัดส่งถึงคุณ</p>
        </div>
      </div>
      <div class="wrap footer-bottom">© ${new Date().getFullYear()} ${RINKA_CONFIG.SHOP_NAME}</div>
    </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});
