
/* =========================================================
   RINKA SHOP — API Layer
   คุยกับ Google Apps Script Web App ตาม action ที่มีจริงใน Code.gs
   ========================================================= */

const RinkaAPI = (() => {

  const BASE = RINKA_CONFIG.API_URL;

  async function get(action, params = {}) {
    const url = new URL(BASE);
    url.searchParams.set("action", action);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString(), { method: "GET" });
    return res.json();
  }

  async function post(action, payload = {}) {
    const body = new URLSearchParams();
    body.set("action", action);
    body.set("payload", JSON.stringify(payload));
    const res = await fetch(BASE, { method: "POST", body });
    return res.json();
  }

  return {
    // ---------- อ่านข้อมูล (GET) ----------
    getProducts:            ()              => get("products"),
    getProductOptions:      (productId)     => get("options", { product_id: productId }),
    getCategories:          ()              => get("categories"),
    getProduct:             (id)            => get("product", { id }),
    getFeatured:            ()              => get("featured"),
    getNewArrivals:         ()              => get("new"),
    getProductsByFandom:    (name)          => get("fandom", { name }),
    getCollections:         ()              => get("collections"),
    getCollection:          (id)            => get("collection", { id }),
    getCollectionProducts:  (id)            => get("collectionProducts", { id }),
    getBanks:               ()              => get("banks"),
    getGifts:               (collectionId)  => get("gifts", { collection_id: collectionId }),
    getGiftRules:           (collectionId, total) => get("giftRules", { collection_id: collectionId, total }),
    getGiftCharacters:      (giftId)        => get("giftCharacters", { gift_id: giftId }),
    getShippingInfo:        (orderId)       => get("shippingInfo", { order_id: orderId }),

    // ---------- ต้อง Login (session_token) ----------
    getOrderAuthenticated:  (sessionToken, orderId) => get("order", { session_token: sessionToken, order_id: orderId }),
    getCustomerOrders:      (sessionToken)  => get("customerOrders", { session_token: sessionToken }),
    getCustomerAddresses:   (sessionToken)  => get("customerAddresses", { session_token: sessionToken }),

    // ---------- เขียนข้อมูล (POST) ----------
    createOrder:            (payload)       => post("__default__", payload), // ดูหมายเหตุด้านล่าง
    submitPayment:          (payload)       => post("payment", payload),
    saveShippingPayment:    (payload)       => post("saveShippingPayment", payload),
    changeAddress:          (payload)       => post("changeAddress", payload),

    registerCustomer:       (payload)       => post("registerCustomer", payload),
    loginCustomer:          (payload)       => post("loginCustomer", payload),
    logoutCustomer:         (payload)       => post("logoutCustomer", payload),
    saveCustomerAddress:    (payload)       => post("saveCustomerAddress", payload),
    saveAddress:            (payload)       => post("saveAddress", payload),

    rawPost: post,
    rawGet: get
  };
})();

/* หมายเหตุสำคัญ: การสร้างออเดอร์ (checkout) ฝั่ง Code.gs ไม่มี action name
   เฉพาะ — มันคือ "ทางตกไปสุดท้าย" ของ doPost เมื่อ action ไม่ตรงกับเคสไหน
   เลย ฟังก์ชันนี้จึงยิง POST แบบไม่ส่ง action (หรือส่ง action ที่ไม่ตรงกับ
   เคสใดๆ) เพื่อให้โค้ดตกไปสร้างออเดอร์ */
RinkaAPI.createOrder = async function (payload) {
  const body = new URLSearchParams();
  body.set("payload", JSON.stringify(payload));
  const res = await fetch(RINKA_CONFIG.API_URL, { method: "POST", body });
  return res.json();
};
