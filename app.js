/**
 * Rinka Shop - Shared App Utilities
 *
 * ไฟล์เดิมเคยรวม Cart / Checkout / Payment รุ่นเก่าไว้ด้วย
 * ตอนนี้แต่ละหน้ามี Flow ของตัวเองแล้ว จึงเหลือเฉพาะ utility ที่ปลอดภัย
 * เพื่อป้องกัน Logic เก่าชนกับ cart.html, checkout.html และ payment.html
 */

window.RinkaApp = window.RinkaApp || {};

window.RinkaApp.safeJson = function(value, fallback){
  try{
    return JSON.parse(value);
  }catch(error){
    return fallback;
  }
};

window.RinkaApp.getCart = function(){
  const value = window.RinkaApp.safeJson(
    localStorage.getItem("cart") || "[]",
    []
  );

  return Array.isArray(value) ? value : [];
};

window.RinkaApp.getCartCount = function(){
  return window.RinkaApp.getCart().reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );
};

window.RinkaApp.updateCartCount = function(targetId = "cartCount"){
  const target = document.getElementById(targetId);
  if(!target) return;

  const count = window.RinkaApp.getCartCount();
  target.textContent = count > 99 ? "99+" : String(count);
};

window.RinkaApp.escapeHtml = function(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
};
