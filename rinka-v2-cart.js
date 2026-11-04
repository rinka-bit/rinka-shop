/* Rinka Shop V2 DEV cart. Isolated from legacy cart, no checkout or order writes. */
(function (global) {
  'use strict';
  const KEY = 'rinka_v2_dev_cart_v1';
  function read() {
    try { const x = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(x) ? x.filter(i => i && typeof i.slug === 'string' && typeof i.variantId === 'string' && Number.isSafeInteger(i.quantity) && i.quantity > 0).slice(0,100) : []; }
    catch { return []; }
  }
  function write(items) { localStorage.setItem(KEY, JSON.stringify(items)); global.dispatchEvent(new Event('rinka-v2-cart-change')); }
  function add({slug, variantId, quantity}) {
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(slug) || !/^[0-9a-f-]{36}$/i.test(variantId) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) throw Error('INVALID_CART_ITEM');
    const items=read(), item=items.find(i=>i.slug===slug&&i.variantId===variantId);
    if (item) item.quantity=Math.min(999,item.quantity+quantity);
    else items.push({slug,variantId,quantity});
    write(items); return items;
  }
  function setQuantity(slug,variantId,quantity) {
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 999) throw Error('INVALID_QUANTITY');
    const items=read(); const i=items.findIndex(x=>x.slug===slug&&x.variantId===variantId);
    if(i<0)return;
    if(quantity===0)items.splice(i,1);else items[i].quantity=quantity;
    write(items);
  }
  global.RinkaV2Cart=Object.freeze({read,add,setQuantity,clear:()=>write([]),count:()=>read().reduce((s,i)=>s+i.quantity,0)});
})(window);
