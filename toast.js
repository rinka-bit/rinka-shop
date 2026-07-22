/**
 * Rinka Shop - Toast Notification
 * ใช้แทน alert() ทั้งเว็บ
 *
 * วิธีใช้:
 *   <script src="toast.js"></script>
 *   showToast("บันทึกที่อยู่เรียบร้อย", "success");
 *   showToast("กรุณากรอกอีเมล", "error");
 *   showToast("เลือกได้สูงสุด 2 ชิ้น", "warning");
 *   showToast("กำลังโหลด...", "info");
 */

(function () {
  // ป้องกันฝัง style ซ้ำถ้ามีการ include toast.js มากกว่า 1 ครั้ง
  if (document.getElementById("rk-toast-style")) return;

  const style = document.createElement("style");
  style.id = "rk-toast-style";
  style.textContent = `
    #rk-toast-container {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: calc(100% - 32px);
      max-width: 380px;
      pointer-events: none;
    }
    .rk-toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 6px 20px rgba(0,0,0,.15);
      font-family: 'Kodchasan', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      border-left: 5px solid #7dcfff;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity .25s ease, transform .25s ease;
      pointer-events: auto;
    }
    .rk-toast.rk-show {
      opacity: 1;
      transform: translateY(0);
    }
    .rk-toast.rk-hide {
      opacity: 0;
      transform: translateY(-8px);
    }
    .rk-toast-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    .rk-toast-msg {
      flex: 1;
      line-height: 1.4;
      word-break: break-word;
    }
    .rk-toast-close {
      background: none;
      border: none;
      font-size: 16px;
      color: #94a3b8;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
    }
    .rk-toast-success { border-left-color: #22c55e; }
    .rk-toast-error   { border-left-color: #ef4444; }
    .rk-toast-warning { border-left-color: #f59e0b; }
    .rk-toast-info    { border-left-color: #7dcfff; }

    @media (max-width: 480px) {
      #rk-toast-container {
        bottom: 16px;
        width: calc(100% - 24px);
      }
    }
  `;
  document.head.appendChild(style);

  function ensureContainer() {
    let container = document.getElementById("rk-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "rk-toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  /**
   * @param {string} message ข้อความที่จะแสดง
   * @param {"success"|"error"|"warning"|"info"} type ประเภทของ toast (default: "info")
   * @param {number} duration ระยะเวลาแสดง (ms) ใส่ 0 ถ้าไม่ต้องการให้ปิดเอง
   */
  window.showToast = function (message, type = "info", duration = 3200) {
    const container = ensureContainer();

    const toast = document.createElement("div");
    toast.className = `rk-toast rk-toast-${type}`;
    toast.innerHTML = `
      <span class="rk-toast-icon">${ICONS[type] || ICONS.info}</span>
      <span class="rk-toast-msg"></span>
      <button class="rk-toast-close" aria-label="ปิด">✕</button>
    `;
    // ใส่ข้อความผ่าน textContent กัน HTML injection จากข้อความ dynamic
    toast.querySelector(".rk-toast-msg").textContent = message;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("rk-show"));

    function remove() {
      toast.classList.remove("rk-show");
      toast.classList.add("rk-hide");
      setTimeout(() => toast.remove(), 250);
    }

    toast.querySelector(".rk-toast-close").onclick = remove;
    if (duration > 0) {
      setTimeout(remove, duration);
    }
  };
})();
