/**
 * Rinka Shop — Shared utilities
 * โหลดคู่กับ toast.js เสมอ: <script src="toast.js"></script><script src="shared.js"></script>
 *
 * รวม: API wrapper, cart storage, header/bottom-nav renderer,
 * image compression ก่อนอัปโหลดสลิป, currency format, validation เบื้องต้น
 *
 * NOTE: BASE_API ใช้ endpoint Apps Script ตัวเดิมของร้าน — ถ้าร้าน deploy
 * เวอร์ชันใหม่แล้ว URL เปลี่ยน ให้แก้ค่านี้ที่เดียวจบ (เดิมแต่ละหน้า hardcode
 * ค่านี้แยกกัน ต้องไล่แก้ทีละไฟล์)
 */

const BASE_API =
  "https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";

/* ================= API wrapper ================= */
const RinkaAPI = {
  async get(action, params = {}) {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${BASE_API}?${qs}`);
    if (!res.ok) throw new Error(`API error (${res.status})`);
    return res.json();
  },
  async post(action, payload) {
    const formData = new FormData();
    formData.append("action", action);
    formData.append("payload", JSON.stringify(payload));
    const res = await fetch(BASE_API, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`API error (${res.status})`);
    return res.json();
  },
  // บาง action เดิมของร้านส่ง action มาทาง query string ตอน POST (เช่น saveAddress)
  // เก็บ path นี้ไว้ให้ compatible กับโค้ดเดิม
  async postQuery(action, payload) {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    const res = await fetch(`${BASE_API}?action=${action}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`API error (${res.status})`);
    return res.json();
  },
};

/* ================= Cart storage ================= */
const RinkaCart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  },
  save(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    RinkaCart.updateBadge();
  },
  add(item) {
    const cart = RinkaCart.get();
    // ถ้าสินค้า + ตัวเลือกเหมือนกันเป๊ะ ให้บวก qty แทนการเพิ่มแถวใหม่
    const key = JSON.stringify({
      id: item.product_id,
      opt: item.selected_options || null,
    });
    const existing = cart.find(
      (c) =>
        JSON.stringify({ id: c.product_id, opt: c.selected_options || null }) ===
        key
    );
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      cart.push({ ...item, qty: item.qty || 1 });
    }
    RinkaCart.save(cart);
  },
  count() {
    return RinkaCart.get().reduce((sum, i) => sum + Number(i.qty || 0), 0);
  },
  total(cart = RinkaCart.get()) {
    return cart.reduce((sum, i) => {
      const price = Number(i.final_price ?? i.price ?? 0);
      return sum + price * Number(i.qty || 0);
    }, 0);
  },
  updateBadge() {
    const count = RinkaCart.count();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.classList.toggle("rk-hidden", count === 0);
    });
  },
};

/* ================= Format helpers ================= */
function formatBaht(n) {
  return "฿" + Number(n || 0).toLocaleString("th-TH");
}

function getDeadlineInfo(deadline) {
  if (!deadline || deadline === "N/A") return null;
  const diffDays = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) return null;
  if (diffDays === 0) return { text: "ปิดรับวันนี้", urgent: true };
  if (diffDays <= 2) return { text: `เหลือ ${diffDays} วัน`, urgent: true };
  return { text: `เหลือ ${diffDays} วัน`, urgent: false };
}

/* ================= Validation (เบื้องต้น กันพิมพ์ผิดก่อนยิง backend) ================= */
const RinkaValidate = {
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  },
  thaiPhone(value) {
    const digits = String(value || "").replace(/[^0-9]/g, "");
    return /^0[0-9]{9}$/.test(digits);
  },
  notEmpty(value) {
    return String(value || "").trim().length > 0;
  },
  /**
   * ผูก error ให้ input โดยอิงโครงสร้าง .rk-field > input + .rk-field-msg
   * ใช้: markFieldError(inputEl, "กรอกอีเมลให้ถูกต้อง")
   *      clearFieldError(inputEl)
   */
  markError(inputEl, message) {
    const field = inputEl.closest(".rk-field") || inputEl.parentElement;
    field.classList.add("rk-error");
    const msg = field.querySelector(".rk-field-msg");
    if (msg) msg.textContent = message;
  },
  clearError(inputEl) {
    const field = inputEl.closest(".rk-field") || inputEl.parentElement;
    field.classList.remove("rk-error");
  },
};

/* ================= Image compression ก่อนอัปโหลดสลิป =================
 * ย่อรูปสลิปให้กว้างไม่เกิน maxWidth และบีบคุณภาพ JPEG ก่อนแปลง base64
 * ลดปัญหาไฟล์ใหญ่จากกล้องมือถือ (5-10MB) ส่งช้า/หลุดตอนเน็ตไม่ดี
 */
function compressImage(file, maxWidth = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ================= Header + Bottom Nav (กัน markup ซ้ำทุกหน้า) =================
 * ใช้: <div id="rkChrome"></div>  แล้วเรียก renderChrome("home", "หน้าแรก")
 * page = "home" | "browse" | "cart" | "account"  (ใช้ไฮไลต์ bottom nav)
 */
function renderChrome(page, title) {
  const mount = document.getElementById("rkChrome");
  if (!mount) return;
  const isActive = (p) => (p === page ? "active" : "");
  mount.innerHTML = `
    <header class="rk-header">
      <button class="rk-icon-btn" onclick="history.length>1?history.back():location.href='home.html'">
        ${page === "home" ? "☰" : "←"}
      </button>
      <h1>${title || "Rinka Shop"}</h1>
      <a href="cart.html" class="rk-icon-btn rk-cart-btn">
        🛒<span class="rk-cart-count" data-cart-count>0</span>
      </a>
    </header>
    <nav class="rk-bottom-nav">
      <a href="home.html" class="${isActive("home")}">
        <span class="rk-nav-icon">🏠</span>หน้าแรก
      </a>
      <a href="browse.html" class="${isActive("browse")}">
        <span class="rk-nav-icon">🔍</span>ค้นหา
      </a>
      <a href="cart.html" class="${isActive("cart")}">
        <span class="rk-nav-icon">🛒</span>ตะกร้า
        <span class="rk-nav-badge rk-hidden" data-cart-count>0</span>
      </a>
      <a href="account.html" class="${isActive("account")}">
        <span class="rk-nav-icon">👤</span>บัญชี
      </a>
    </nav>
  `;
  RinkaCart.updateBadge();
}

document.addEventListener("DOMContentLoaded", RinkaCart.updateBadge);
