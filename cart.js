
/* =========================================================
   RINKA SHOP — ตะกร้าสินค้า (เก็บใน localStorage ฝั่งเครื่องลูกค้า)
   ========================================================= */

const RinkaCart = (() => {

  const KEY = "rinka_cart_v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadge();
  }

  function lineKey(item) {
    return item.product_id + "::" + JSON.stringify(item.selected_options || {});
  }

  function add(item) {
    const items = read();
    const key = lineKey(item);
    const existing = items.find(i => lineKey(i) === key);
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      items.push({ ...item, qty: item.qty || 1 });
    }
    write(items);
  }

  function updateQty(key, qty) {
    let items = read();
    items = items.map(i => (lineKey(i) === key ? { ...i, qty: Math.max(1, qty) } : i));
    write(items);
  }

  function remove(key) {
    write(read().filter(i => lineKey(i) !== key));
  }

  function clear() {
    write([]);
  }

  function totals() {
    const items = read();
    const subtotal = items.reduce((sum, i) => sum + (Number(i.price) + (i.crate_selected ? Number(i.crate_fee || 0) : 0)) * i.qty, 0);
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    return { subtotal, count };
  }

  function updateBadge() {
    const badge = document.querySelector("[data-cart-count]");
    if (badge) badge.textContent = totals().count;
  }

  document.addEventListener("DOMContentLoaded", updateBadge);

  return { read, write, add, updateQty, remove, clear, totals, lineKey };
})();
