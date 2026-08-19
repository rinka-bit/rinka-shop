/* Rinka Admin Manual Order MVP */

const ManualOrder = {

  products:[],
  collections:[],
  campaigns:[],
  rules:[],
  items:[],
  characters:[],
  exclusions:[],
  cart:[],
  gifts:[],
  customers:[],
  selectedCustomer:null,

  loading:false,

  dataLoaded:false,
  dataLoading:false

};

async function loadManualOrderData(force = false){

  if(ManualOrder.dataLoading){
    return;
  }

  if(
    ManualOrder.dataLoaded &&
    !force
  ){
    filterManualProducts();
    renderManualCart();
    renderManualGifts();
    return;
  }

  ManualOrder.dataLoading = true;

  const productBox =
    document.getElementById(
      "mo_products"
    );

  try{

    setManualMessage(
      "กำลังโหลดข้อมูลสินค้าและของแถม...",
      "info"
    );

    const [
      p,
      c,
      gc,
      gr,
      gi,
      ch,
      ex
    ] = await Promise.all([

      moGet("adminProducts"),
      moGet("adminCollections"),
      moGet("getGiftCampaigns"),
      moGet("getGiftRules"),
      moGet("getGiftItems"),
      moGet("getGiftCharacters"),
      moGet("getGiftCampaignExclusions")

    ]);

    ManualOrder.products =
      moArray(p,"products");

    ManualOrder.collections =
      moArray(c,"collections");

    ManualOrder.campaigns =
      moArray(gc,"campaigns");

    ManualOrder.rules =
      moArray(gr,"rules");

    ManualOrder.items =
      moArray(gi,"items","gifts");

    ManualOrder.characters =
      moArray(ch,"characters");

    ManualOrder.exclusions =
      moArray(ex,"exclusions");

    ManualOrder.dataLoaded = true;

    const collectionSelect =
      document.getElementById(
        "mo_collection"
      );

    if(collectionSelect){

      collectionSelect.innerHTML =
        '<option value="">ทั้งหมด</option>' +
        ManualOrder.collections
          .map(
            collection =>
              `<option value="${moEsc(collection.collection_id)}">${moEsc(collection.name)}</option>`
          )
          .join("");

    }

    clearManualMessage();

    filterManualProducts();
    renderManualCart();
    renderManualGifts();

  }catch(error){

    console.error(
      "loadManualOrderData error:",
      error
    );

    if(productBox){

      productBox.innerHTML = `
        <div class="mo-notice mo-error mo-full">
          โหลดข้อมูลไม่สำเร็จ<br>
          ${moEsc(error.message || String(error))}
          <br><br>
          <button type="button" onclick="loadManualOrderData(true)">
            ลองใหม่
          </button>
        </div>
      `;

    }

    setManualMessage(
      "โหลดข้อมูล Manual Order ไม่สำเร็จ: " +
      (error.message || String(error)),
      "error"
    );

  }finally{

    ManualOrder.dataLoading = false;

  }

}

function renderManualOrderManager(){
  const root=document.getElementById('manualOrderManager');
  if(!root)return;
  root.innerHTML=`
  <style>
  .mo-shell{max-width:1180px;margin:0 auto}
  .mo-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:20px;margin-bottom:18px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
  .mo-card h3{margin:0 0 16px;font-size:18px;color:#0f172a;display:flex;align-items:center;gap:8px}
  .mo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .mo-full{grid-column:1/-1}
  .mo-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
  .mo-product{border:1px solid #e2e8f0;border-radius:16px;padding:12px;cursor:pointer;background:#fff;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;display:flex;gap:12px;align-items:flex-start;min-height:104px}
  .mo-product:hover{border-color:#38bdf8;transform:translateY(-2px);box-shadow:0 10px 24px rgba(14,165,233,.12)}
  .mo-product-thumb{width:76px;height:76px;border-radius:12px;object-fit:cover;background:#f1f5f9;flex:0 0 auto;border:1px solid #e2e8f0}
  .mo-product-thumb-empty{display:grid;place-items:center;font-size:26px;color:#94a3b8}
  .mo-product-body{min-width:0;flex:1}
  .mo-product-name{font-weight:800;color:#0f172a;line-height:1.35;word-break:break-word}
  .mo-product-price{font-weight:800;color:#2563eb;margin-top:7px}
  .mo-product-meta{font-size:12px;color:#64748b;margin-top:6px;display:flex;flex-wrap:wrap;gap:6px}
  .mo-row{display:flex;justify-content:space-between;gap:12px;align-items:center}
  .mo-item{border:1px solid #e2e8f0;border-radius:16px;padding:14px;margin-top:10px;background:#fff}
  .mo-item-title{font-weight:800;color:#0f172a}
  .mo-item-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  .mo-badge{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:700;background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe}
  .mo-badge-green{background:#f0fdf4;color:#166534;border-color:#bbf7d0}
  .mo-badge-slate{background:#f8fafc;color:#475569;border-color:#e2e8f0}
  .mo-cart-actions{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap}
  .mo-qty{min-width:34px;text-align:center;font-weight:800}
  .mo-icon-btn{width:36px;height:36px;padding:0;display:grid;place-items:center;border-radius:10px}
  .mo-danger{background:#ef4444}.mo-secondary{background:#64748b}.mo-success-btn{background:#10b981}
  .mo-total-box{margin-top:16px;padding:16px 18px;border-radius:16px;background:linear-gradient(135deg,#eff6ff,#f8fbff);border:1px solid #bfdbfe}
  .mo-total{font-size:28px;font-weight:900;color:#1d4ed8}
  .mo-gift{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:14px;margin-top:10px}
  .mo-modal{position:fixed;inset:0;background:rgba(15,23,42,.62);z-index:99999;padding:20px;overflow:auto;backdrop-filter:blur(3px)}
  .mo-modal.hidden{display:none}
  .mo-modal-card{max-width:720px;margin:36px auto;background:white;border-radius:22px;padding:22px;box-shadow:0 28px 70px rgba(15,23,42,.28)}
  .mo-modal-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}
  .mo-option-group{margin-bottom:16px}
  .mo-option-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
  .mo-option-choice{display:flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid #dbeafe;border-radius:999px;background:#fff;cursor:pointer}
  .mo-option-choice:has(input:checked){background:#eff6ff;border-color:#60a5fa;color:#1d4ed8}
  .mo-option-choice input{width:auto}
  .mo-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}
  .mo-product-image{width:140px;height:140px;object-fit:cover;border-radius:16px;background:#f1f5f9;border:1px solid #e2e8f0}
  .mo-empty{padding:24px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:16px;color:#64748b;text-align:center;line-height:1.65}
  .mo-empty-icon{font-size:34px;display:block;margin-bottom:6px}
  .mo-selected-customer{padding:14px 16px;border-radius:16px;background:#ecfeff;border:1px solid #a5f3fc;color:#155e75;display:flex;justify-content:space-between;gap:12px;align-items:center}
  .mo-selected-customer.hidden{display:none}
  .mo-customer-result{padding:14px;margin-bottom:10px;border:1px solid #dbeafe;background:#eff6ff;border-radius:14px}
  .mo-customer-result:hover{border-color:#60a5fa}
  .mo-gift-rule{margin-top:12px;padding-top:12px;border-top:1px solid #dcfce7}
  .mo-gift-choice{display:flex;align-items:flex-start;gap:10px;margin-top:8px;padding:10px;border-radius:12px;background:#fff;border:1px solid #dcfce7}
  .mo-gift-choice input{width:auto;margin-top:4px}
  .mo-gift-character{margin-top:8px}.mo-gift-character select{margin-top:5px}
  .mo-gift-count{font-size:12px;color:#166534;font-weight:800;background:#dcfce7;border-radius:999px;padding:4px 8px}
  .mo-preview-section{border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px}
  .mo-preview-section h4{margin:0 0 12px;color:#0f172a}
  .mo-preview-item{padding:12px 0;border-bottom:1px solid #f1f5f9}
  .mo-preview-total{font-size:26px;font-weight:900;color:#2563eb}
  .mo-preview-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .mo-preview-panel{padding:14px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;line-height:1.65}
  .mo-preview-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;flex-wrap:wrap}
  .mo-notice{padding:12px 14px;border-radius:12px;margin:12px 0;line-height:1.55}
  .mo-notice.hidden{display:none}.mo-error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}.mo-success{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534}.mo-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af}
  .mo-slip-preview{margin-top:10px;padding:12px;border:1px solid #dbeafe;border-radius:12px;background:#f8fafc}.mo-slip-preview img{display:block;max-width:220px;max-height:220px;object-fit:contain;border-radius:10px;margin-top:8px;background:#fff}
  .mo-button-loading{opacity:.7;cursor:not-allowed}button:disabled{opacity:.6;cursor:not-allowed}
  .mo-submit-wrap{position:sticky;bottom:12px;z-index:20;padding:12px;border-radius:18px;background:rgba(248,251,255,.92);backdrop-filter:blur(8px);border:1px solid #dbeafe;box-shadow:0 12px 30px rgba(15,23,42,.12)}
  .mo-submit-wrap button{width:100%;font-size:16px;padding:14px}
  @media(max-width:800px){.mo-shell{max-width:none}.mo-card{padding:16px;border-radius:16px}.mo-grid{grid-template-columns:1fr}.mo-full{grid-column:auto}.mo-preview-grid{grid-template-columns:1fr}.mo-modal{padding:8px}.mo-modal-card{margin:8px auto;padding:16px}.mo-preview-actions button,.mo-modal-actions button{width:100%}.mo-row{align-items:flex-start}.mo-product{min-height:unset}.mo-selected-customer{align-items:flex-start;flex-direction:column}.mo-submit-wrap{bottom:6px}}
  </style>
  <div class="mo-shell">
  <div class="mo-card">

<h3>
👤 ข้อมูลลูกค้า
</h3>

<div class="mo-grid">

<label class="mo-full">

ค้นหาลูกค้าเดิม

<div
style="
display:flex;
gap:8px;
align-items:center;
"
>

<input
id="mo_customer_search"
placeholder="อีเมล / แอค X / เบอร์โทร"
>

<button
id="mo_customer_search_btn"
type="button"
style="
width:auto;
white-space:nowrap;
"
onclick="searchManualCustomer()"
>
🔍 ค้นหา
</button>

</div>

</label>

<div
id="mo_customer_result"
class="mo-full"
></div>

<div id="mo_selected_customer" class="mo-selected-customer hidden mo-full"></div>

<label>
แอค X / Twitter *

<input
id="mo_social"
placeholder="@username"
autocomplete="off"
oninput="handleManualTwitterInput()"
>
</label>

<label>
อีเมล

<input
id="mo_email"
type="email"
placeholder="ไม่บังคับ"
>
</label>

<label>
เบอร์โทร *

<input
id="mo_phone"
>
</label>

<label>
ชื่อผู้รับ *

<input
id="mo_name"
>
</label>

</div>

</div>

  <div class="mo-card"><h3>🛍️ สินค้า</h3><div class="mo-grid">
  <label>ประเภท<select id="mo_type" onchange="filterManualProducts()"><option value="preorder">พรีออเดอร์</option><option value="instock">พร้อมส่ง</option></select></label>
  <label>Collection<select id="mo_collection" onchange="filterManualProducts()"><option value="">ทั้งหมด</option></select></label>
  <label class="mo-full">ค้นหา<input id="mo_search" oninput="filterManualProducts()"></label>
  </div><div id="mo_products" class="mo-products" style="margin-top:14px"><div class="mo-empty"><span class="mo-empty-icon">⏳</span>กำลังโหลดสินค้า...</div></div></div>
  <div class="mo-card"><h3>📦 รายการในออเดอร์</h3><div id="mo_cart"></div><div class="mo-total-box mo-row"><b>ยอดรวมออเดอร์</b><div id="mo_total" class="mo-total">฿0</div></div></div>
  <div class="mo-card"><h3>🎁 ของแถม</h3><div id="mo_gifts">ระบบจะคำนวณหลังเพิ่มสินค้า</div></div>
  <div class="mo-card"><h3>📍 ที่อยู่</h3><div class="mo-grid">
  <label class="mo-full">ที่อยู่<textarea id="mo_address" rows="3"></textarea></label>
  <label>ตำบล/แขวง<input id="mo_subdistrict"></label><label>อำเภอ/เขต<input id="mo_district"></label>
  <label>จังหวัด<input id="mo_province"></label><label>รหัสไปรษณีย์<input id="mo_postcode"></label>
  </div></div>
  <div class="mo-card"><h3>💳 การชำระเงิน</h3><div class="mo-grid">
  <label>ช่องทาง<select id="mo_method"><option value="credit_card_qr">QR บัตรเครดิต</option><option value="bank_transfer">บัญชีธนาคาร</option></select></label>
  <label>สถานะ<select id="mo_paystatus"><option value="paid">ชำระแล้ว</option><option value="pending_verification">รอตรวจสอบ</option><option value="unpaid">ยังไม่ชำระ</option></select></label>
  <label class="mo-full">แนบสลิป<input id="mo_slip" type="file" accept="image/png,image/jpeg,image/webp" onchange="handleManualSlipChange()"></label>
  <div id="mo_slip_preview" class="mo-slip-preview hidden mo-full"></div>
  <label class="mo-full">หมายเหตุ<textarea id="mo_note" rows="2"></textarea></label>
  </div></div>
  <div id="mo_message" class="mo-notice hidden" role="alert"></div>
  <div class="mo-submit-wrap"><button type="button" id="mo_submit" onclick="openManualOrderPreview()">🔎 ตรวจสอบออเดอร์ก่อนบันทึก</button></div>

  <div
  id="mo_product_modal"
  class="mo-modal hidden"
  onclick="handleManualProductModalBackdrop(event)"
  >

    <div class="mo-modal-card">

      <div class="mo-modal-header">

        <h3
        id="mo_modal_title"
        style="margin:0;"
        >
        เพิ่มสินค้า
        </h3>

        <button
        type="button"
        style="background:#64748b;width:auto;"
        onclick="closeManualProductModal()"
        >
        ✕
        </button>

      </div>

      <div id="mo_modal_body"></div>

    </div>

  </div>

  <div
  id="mo_preview_modal"
  class="mo-modal hidden"
  onclick="handleManualPreviewBackdrop(event)"
  >

    <div class="mo-modal-card">

      <div class="mo-modal-header">

        <h3 style="margin:0;">
        🔎 ตรวจสอบออเดอร์
        </h3>

        <button
        type="button"
        style="background:#64748b;width:auto;"
        onclick="closeManualOrderPreview()"
        >
        ✕
        </button>

      </div>

      <div id="mo_preview_body"></div>

    </div>

  </div>`;
}

async function loadManualOrderData(){

  const productBox =
    document.getElementById(
      "mo_products"
    );

  try{

    setManualMessage(
      "กำลังโหลดข้อมูลสินค้าและของแถม...",
      "info"
    );

    const [
      p,
      c,
      gc,
      gr,
      gi,
      ch,
      ex
    ] = await Promise.all([

      moGet("adminProducts"),
      moGet("adminCollections"),
      moGet("getGiftCampaigns"),
      moGet("getGiftRules"),
      moGet("getGiftItems"),
      moGet("getGiftCharacters"),
      moGet("getGiftCampaignExclusions")

    ]);

    ManualOrder.products =
      moArray(p,"products");

    ManualOrder.collections =
      moArray(c,"collections");

    ManualOrder.campaigns =
      moArray(gc,"campaigns");

    ManualOrder.rules =
      moArray(gr,"rules");

    ManualOrder.items =
      moArray(gi,"items","gifts");

    ManualOrder.characters =
      moArray(ch,"characters");

    ManualOrder.exclusions =
      moArray(ex,"exclusions");

    const collectionSelect =
      document.getElementById(
        "mo_collection"
      );

    if(collectionSelect){

      collectionSelect.innerHTML =
        '<option value="">ทั้งหมด</option>' +
        ManualOrder.collections
          .map(
            collection=>
              `<option value="${moEsc(collection.collection_id)}">${moEsc(collection.name)}</option>`
          )
          .join("");

    }

    clearManualMessage();
    filterManualProducts();
    renderManualCart();
    renderManualGifts();

  }catch(error){

    console.error(
      "loadManualOrderData error:",
      error
    );

    if(productBox){

      productBox.innerHTML = `

<div class="mo-notice mo-error mo-full">
  โหลดข้อมูลไม่สำเร็จ<br>
  ${moEsc(error.message || String(error))}
  <br><br>
  <button type="button" onclick="loadManualOrderData()">ลองใหม่</button>
</div>

`;

    }

    setManualMessage(
      "โหลดข้อมูล Manual Order ไม่สำเร็จ: " +
      (error.message || String(error)),
      "error"
    );

  }

}

async function moGet(action){

  const separator =
    String(action).includes("&")
      ? "&"
      : "";

  const parts =
    String(action).split("&");

  const actionName =
    parts.shift();

  const query =
    parts.length
      ? "&" + parts.join("&")
      : "";

  const response =
    await fetch(
      API +
      "?action=" +
      encodeURIComponent(
        actionName
      ) +
      query
    );

  if(!response.ok){

    throw new Error(
      "HTTP " +
      response.status +
      " (" +
      actionName +
      ")"
    );

  }

  const result =
    await response.json();

  if(
    result &&
    result.success === false
  ){

    throw new Error(
      result.error ||
      actionName
    );

  }

  return result;

}
function moArray(v,...keys){if(Array.isArray(v))return v;for(const k of keys)if(v&&Array.isArray(v[k]))return v[k];return []}
function moBool(v){return v===true||v===1||['yes','true','1','active'].includes(String(v||'').trim().toLowerCase())}
function moEsc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
function moPrice(p){const n=Number(p.final_price??p.sale_price??p.price??0);return Number.isFinite(n)?n:0}

async function searchManualCustomer(){

  const keyword =
    document
      .getElementById(
        "mo_customer_search"
      )
      ?.value
      .trim() || "";


  const box =
    document.getElementById(
      "mo_customer_result"
    );


  if(!keyword){

    alert(
      "กรุณากรอกอีเมล แอค X หรือเบอร์โทร"
    );

    return;

  }


  if(box){

    box.innerHTML = `

<div
style="
padding:14px;
background:#f8fafc;
border-radius:12px;
"
>
⏳ กำลังค้นหา...
</div>

`;

  }


  try{

    const response =
      await fetch(

        API +

        "?action=adminCustomerSearch" +

        "&keyword=" +

        encodeURIComponent(
          keyword
        )

      );


    if(!response.ok){

      throw new Error(
        "HTTP " +
        response.status
      );

    }


    const result =
      await response.json();


    if(
      result.success === false
    ){

      throw new Error(
        result.error ||
        "ค้นหาลูกค้าไม่สำเร็จ"
      );

    }


    ManualOrder.customers =
      Array.isArray(
        result.customers
      )
        ? result.customers
        : [];


    if(
      ManualOrder.customers.length === 0
    ){

      box.innerHTML = `

<div
style="
padding:14px;
background:#f8fafc;
border-radius:12px;
color:#64748b;
"
>
ไม่พบลูกค้าเดิม สามารถกรอกข้อมูลใหม่ได้
</div>

`;

      return;

    }


    box.innerHTML =
      ManualOrder.customers
        .map(
          (
            customer,
            index
          )=>{

            return `

<div class="mo-customer-result">

<div
style="
font-weight:800;
"
>
${moEsc(
  customer.customer_name ||
  customer.receiver ||
  customer.email ||
  "-"
)}
</div>

<div
style="
margin-top:5px;
font-size:13px;
color:#475569;
"
>

${moEsc(
  customer.email || ""
)}

${
  customer.social
    ? " • " +
      moEsc(
        customer.social
      )
    : ""
}

</div>

<div
style="
margin-top:6px;
font-size:13px;
color:#475569;
"
>

เคยสั่ง
${Number(
  customer.order_count || 0
)}
ออเดอร์

•

ยอดรวม
฿${Number(
  customer.total_spent || 0
).toLocaleString(
  "th-TH",
  {
    maximumFractionDigits:2
  }
)}

</div>

<button
type="button"
style="
width:auto;
margin-top:10px;
"
onclick="
useManualCustomer(
${index}
)
"
>
ใช้ข้อมูลนี้
</button>

</div>

`;

          }
        )
        .join("");


  }catch(error){

    console.error(
      "searchManualCustomer error:",
      error
    );


    if(box){

      box.innerHTML = `

<div
style="
padding:14px;
background:#fef2f2;
border:1px solid #fecaca;
border-radius:12px;
color:#991b1b;
"
>

ค้นหาไม่สำเร็จ

<br>

${moEsc(
  error.message ||
  String(error)
)}

</div>

`;

    }

  }

}

function useManualCustomer(
  index
){

  const customer =
    ManualOrder.customers[
      index
    ];


  if(!customer){

    return;

  }


  ManualOrder.selectedCustomer =
    customer;


  setManualField(
    "mo_social",
    customer.social || ""
  );


  setManualField(
    "mo_email",
    customer.email || ""
  );


  setManualField(
    "mo_phone",
    customer.phone || ""
  );


  setManualField(
    "mo_name",
    customer.customer_name ||
    customer.receiver ||
    ""
  );


  setManualField(
    "mo_address",
    customer.address || ""
  );


  setManualField(
    "mo_subdistrict",
    customer.subdistrict || ""
  );


  setManualField(
    "mo_district",
    customer.district || ""
  );


  setManualField(
    "mo_province",
    customer.province || ""
  );


  setManualField(
    "mo_postcode",
    customer.postcode || ""
  );

  renderManualSelectedCustomer();

  const resultBox =
    document.getElementById(
      "mo_customer_result"
    );

  if(resultBox){
    resultBox.innerHTML = "";
  }

}

function normalizeManualTwitter(
  value
){

  return String(
    value || ""
  )
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

}


function handleManualTwitterInput(){

  const currentTwitter =
    normalizeManualTwitter(
      moVal(
        "mo_social"
      )
    );

  const selectedTwitter =
    normalizeManualTwitter(
      ManualOrder
        .selectedCustomer
        ?.social ||
      ""
    );

  /*
  ถ้าเคยเลือกลูกค้าเดิม
  แต่แก้ Twitter เป็นคนอื่น
  ต้องไม่ส่ง customer_id เก่าติดไป
  */
  if(
    ManualOrder.selectedCustomer &&
    currentTwitter !==
      selectedTwitter
  ){

    ManualOrder.selectedCustomer =
      null;

  }

}

function setManualField(
  id,
  value
){

  const element =
    document.getElementById(
      id
    );


  if(element){

    element.value =
      value || "";

  }

}


function renderManualSelectedCustomer(){

  const box =
    document.getElementById(
      "mo_selected_customer"
    );

  if(!box){
    return;
  }

  const customer =
    ManualOrder.selectedCustomer;

  if(!customer){
    box.innerHTML = "";
    box.classList.add("hidden");
    return;
  }

  box.innerHTML = `

<div>
  <div style="font-weight:900;">✓ กำลังใช้ข้อมูลลูกค้าเดิม</div>
  <div style="margin-top:4px;">
    ${moEsc(customer.customer_name || customer.receiver || customer.email || "-")}
  </div>
  <div style="font-size:13px;margin-top:2px;opacity:.85;">
    ${moEsc(customer.email || "")}
  </div>
</div>

<button
type="button"
class="mo-secondary"
style="width:auto;white-space:nowrap;"
onclick="clearManualSelectedCustomer()"
>
เปลี่ยนลูกค้า
</button>

`;

  box.classList.remove("hidden");

}

function clearManualSelectedCustomer(){

  ManualOrder.selectedCustomer = null;
  renderManualSelectedCustomer();

  const resultBox =
    document.getElementById(
      "mo_customer_result"
    );

  if(resultBox){
    resultBox.innerHTML = "";
  }

  const searchInput =
    document.getElementById(
      "mo_customer_search"
    );

  if(searchInput){
    searchInput.focus();
  }

}

function syncManualSelectedCustomer(){

  const customer =
    ManualOrder.selectedCustomer;

  if(!customer){
    return;
  }

  const currentEmail =
    moVal("mo_email")
      .toLowerCase();

  const selectedEmail =
    String(customer.email || "")
      .trim()
      .toLowerCase();

  if(
    selectedEmail &&
    currentEmail !== selectedEmail
  ){
    ManualOrder.selectedCustomer = null;
    renderManualSelectedCustomer();
  }

}

function filterManualProducts(){

  const type =
    document
      .getElementById(
        "mo_type"
      )
      .value;

  const collection =
    document
      .getElementById(
        "mo_collection"
      )
      .value;

  const search =
    document
      .getElementById(
        "mo_search"
      )
      .value
      .trim()
      .toLowerCase();

  const rows =
    ManualOrder.products.filter(
      product=>{

        const productType =
          String(
            product.product_type ||
            "preorder"
          )
            .trim()
            .toLowerCase();

        if(
          productType !== type
        ){
          return false;
        }

        if(
          collection &&
          String(
            product.collection_id || ""
          ) !== collection
        ){
          return false;
        }

        if(search){

          const haystack = [

            product.name,
            product.fandom,
            product.sub_category,
            product.round

          ]
            .join(" ")
            .toLowerCase();

          if(
            !haystack.includes(
              search
            )
          ){
            return false;
          }

        }

        return true;

      }
    );

  const box =
    document.getElementById(
      "mo_products"
    );

  box.innerHTML =
    rows.length

      ? rows.map(
          product=>`

<div
class="mo-product"
onclick="openManualProductModal('${moEsc(product.product_id)}')"
>

${
  product.image
    ? `<img
    class="mo-product-thumb"
    src="${moEsc(product.image)}"
    alt=""
    loading="lazy"
    decoding="async"
  >`
    : `<div class="mo-product-thumb mo-product-thumb-empty">🛍️</div>`
}

<div class="mo-product-body">
  <div class="mo-product-name">${moEsc(product.name)}</div>
  <div class="mo-product-price">฿${moPrice(product).toLocaleString("th-TH")}</div>
  <div class="mo-product-meta">
    ${product.fandom ? `<span class="mo-badge mo-badge-slate">${moEsc(product.fandom)}</span>` : ""}
    <span class="mo-badge ${String(product.product_type || "preorder").toLowerCase() === "instock" ? "mo-badge-green" : ""}">
      ${String(product.product_type || "preorder").toLowerCase() === "instock" ? "พร้อมส่ง" : "พรีออเดอร์"}
    </span>
  </div>
</div>

</div>

`
        ).join("")

      : `<div class="mo-empty" style="grid-column:1/-1;"><span class="mo-empty-icon">🔎</span>ไม่พบสินค้าที่ตรงกับตัวกรอง</div>`;

}


async function openManualProductModal(
  productId
){

  const product =
    ManualOrder.products.find(
      item=>
        String(
          item.product_id
        ) ===
        String(
          productId
        )
    );

  if(!product){
    return;
  }

  const modal =
    document.getElementById(
      "mo_product_modal"
    );

  const title =
    document.getElementById(
      "mo_modal_title"
    );

  const body =
    document.getElementById(
      "mo_modal_body"
    );

  if(
    !modal ||
    !title ||
    !body
  ){
    return;
  }

  title.textContent =
    product.name ||
    "เพิ่มสินค้า";

  body.innerHTML = `

<div class="mo-empty">
⏳ กำลังโหลดตัวเลือกสินค้า...
</div>

`;

  modal.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";

  let options =
    Array.isArray(
      product.options
    )
      ? product.options
      : [];

  if(
    options.length === 0
  ){

    try{

      const optionResult =
        await moGet(
          "adminProductOptions" +
          "&product_id=" +
          encodeURIComponent(
            product.product_id
          )
        );

      options =
        moArray(
          optionResult,
          "options"
        );

    }catch(error){

      console.warn(
        "โหลดตัวเลือกสินค้าไม่สำเร็จ:",
        error
      );

      options = [];

    }

  }

  const groupedOptions = {};

  options.forEach(
    option=>{

      const optionName =
        String(
          option.option_name ||
          "ตัวเลือก"
        ).trim();

      if(
        !groupedOptions[
          optionName
        ]
      ){

        groupedOptions[
          optionName
        ] = [];

      }

      groupedOptions[
        optionName
      ].push(
        option
      );

    }
  );

  let optionHtml = "";

  Object.entries(
    groupedOptions
  ).forEach(
    (
      [
        optionName,
        values
      ]
    )=>{

      const selectionType =
        String(
          values[0]
            ?.selection_type ||
          "single"
        )
          .trim()
          .toLowerCase();

      optionHtml += `

<div
class="mo-option-group"
data-option-name="${moEsc(
  optionName
)}"
data-selection-type="${moEsc(
  selectionType
)}"
>

<b>
${moEsc(
  optionName
)}
</b>

<div class="mo-option-list">

`;

      values.forEach(
        option=>{

          const inputType =
            selectionType ===
            "multiple"
              ? "checkbox"
              : "radio";

          const inputName =
            "mo_option_" +
            product.product_id +
            "_" +
            optionName;

          optionHtml += `

<label class="mo-option-choice">

<input
type="${inputType}"
name="${moEsc(
  inputName
)}"
value="${moEsc(
  option.option_value || ""
)}"
data-additional-price="${Number(
  option.additional_price || 0
)}"
>

<span>

${moEsc(
  option.option_value || "-"
)}

${
  Number(
    option.additional_price || 0
  ) > 0

    ? ` (+฿${Number(
        option.additional_price
      ).toLocaleString()})`

    : ""
}

</span>

</label>

`;

        }
      );

      optionHtml += `

</div>

</div>

`;

    }
  );

  body.innerHTML = `

<div class="mo-grid">

<div class="mo-full">

${
  product.image
    ? `

<img
src="${moEsc(
  product.image
)}"
class="mo-product-image"
>

`
    : ""
}

</div>

<div class="mo-full">

${
  optionHtml ||
  `

<div class="mo-empty">
สินค้านี้ไม่มีตัวเลือกเพิ่มเติม
</div>

`
}

</div>

<label>

จำนวน

<input
id="mo_modal_qty"
type="number"
min="1"
value="1"
>

</label>

<label>

เลือกตีลังไม้

<select id="mo_modal_crate_selected">

<option value="No">
ไม่เลือก
</option>

<option value="Yes">
เลือก
</option>

</select>

</label>

<label>

ค่าตีลังไม้

<input
id="mo_modal_crate_fee"
type="number"
min="0"
step="0.01"
value="0"
>

</label>

</div>

<div class="mo-modal-actions">

<button
type="button"
style="background:#64748b;"
onclick="closeManualProductModal()"
>
ยกเลิก
</button>

<button
type="button"
onclick="
confirmAddManualProduct(
'${moEsc(
  product.product_id
)}'
)
"
>
＋ เพิ่มสินค้า
</button>

</div>

`;

}


function confirmAddManualProduct(
  productId
){

  const product =
    ManualOrder.products.find(
      item=>
        String(
          item.product_id
        ) ===
        String(
          productId
        )
    );

  if(!product){
    return;
  }

  const selectedOptions = {};
  let additionalPrice = 0;

  const groups =
    document.querySelectorAll(
      "#mo_modal_body .mo-option-group"
    );

  for(const group of groups){

    const optionName =
      group.dataset.optionName ||
      "ตัวเลือก";

    const selectionType =
      group.dataset.selectionType ||
      "single";

    const selectedInputs =
      [
        ...group.querySelectorAll(
          "input:checked"
        )
      ];

    if(
      selectedInputs.length === 0
    ){

      alert(
        "กรุณาเลือก " +
        optionName
      );

      return;

    }

    if(
      selectionType ===
      "multiple"
    ){

      selectedOptions[
        optionName
      ] =
        selectedInputs.map(
          input=>
            input.value
        );

    }else{

      selectedOptions[
        optionName
      ] =
        selectedInputs[0].value;

    }

    selectedInputs.forEach(
      input=>{

        additionalPrice +=
          Number(
            input.dataset
              .additionalPrice ||
            0
          );

      }
    );

  }

  const qty =
    Math.max(
      1,
      Math.floor(
        Number(
          document
            .getElementById(
              "mo_modal_qty"
            )
            ?.value || 1
        )
      )
    );

  const crateSelected =
    document
      .getElementById(
        "mo_modal_crate_selected"
      )
      ?.value || "No";

  const crateFee =
    crateSelected === "Yes"
      ? Math.max(
          0,
          Number(
            document
              .getElementById(
                "mo_modal_crate_fee"
              )
              ?.value || 0
          )
        )
      : 0;

  const unitPrice =
    moPrice(
      product
    ) +
    additionalPrice;

  const key =

    product.product_id +

    "::" +

    JSON.stringify(
      selectedOptions
    ) +

    "::" +

    crateSelected +

    "::" +

    crateFee;

  const existing =
    ManualOrder.cart.find(
      item=>
        item._key === key
    );

  if(existing){

    existing.qty +=
      qty;

  }else{

    ManualOrder.cart.push({

      _key:
        key,

      product_id:
        product.product_id,

      product_name:
        product.name,

      name:
        product.name,

      price:
        unitPrice,

      qty:
        qty,

      selected_options:
        selectedOptions,

      crate_selected:
        crateSelected,

      crate_fee:
        crateFee,

      collection_id:
        product.collection_id ||
        "",

      fandom:
        product.fandom ||
        ""

    });

  }

  closeManualProductModal();

  renderManualCart();
  renderManualGifts();

}


function closeManualProductModal(){

  const modal =
    document.getElementById(
      "mo_product_modal"
    );

  if(modal){

    modal.classList.add(
      "hidden"
    );

  }

  document.body.style.overflow =
    "";

}


function handleManualProductModalBackdrop(
  event
){

  if(
    event.target &&
    event.target.id ===
    "mo_product_modal"
  ){

    closeManualProductModal();

  }

}
function renderManualCart(){

  const box =
    document.getElementById(
      "mo_cart"
    );

  if(!box){
    return;
  }

  if(!ManualOrder.cart.length){

    box.innerHTML = `
      <div class="mo-empty">
        <span class="mo-empty-icon">📦</span>
        ยังไม่มีสินค้าในออเดอร์<br>
        เลือกสินค้าจากส่วนด้านบนเพื่อเริ่มสร้างออเดอร์
      </div>
    `;

  }else{

    box.innerHTML =
      ManualOrder.cart
        .map((item,index)=>{

          const optionBadges =
            Object.entries(
              item.selected_options || {}
            )
              .map(([key,value])=>`
                <span class="mo-badge">
                  ${moEsc(key)}: ${moEsc(Array.isArray(value) ? value.join(", ") : value)}
                </span>
              `)
              .join("");

          const lineTotal =
            Number(item.price || 0) *
            Number(item.qty || 0) +
            Number(item.crate_fee || 0);

          return `

<div class="mo-item">
  <div class="mo-row">
    <div style="min-width:0;">
      <div class="mo-item-title">${moEsc(item.name)}</div>
      <div class="mo-item-meta">
        ${optionBadges}
        <span class="mo-badge mo-badge-slate">จำนวน ${Number(item.qty || 0)}</span>
        ${String(item.crate_selected || "").toLowerCase() === "yes"
          ? `<span class="mo-badge mo-badge-green">📦 ตีลัง +฿${Number(item.crate_fee || 0).toLocaleString("th-TH")}</span>`
          : ""}
      </div>
      <div style="font-size:13px;color:#64748b;margin-top:8px;">
        ฿${Number(item.price || 0).toLocaleString("th-TH")} ต่อชิ้น
      </div>
    </div>
    <div style="font-weight:900;color:#1d4ed8;white-space:nowrap;">
      ฿${lineTotal.toLocaleString("th-TH")}
    </div>
  </div>

  <div class="mo-cart-actions">
    <button type="button" class="mo-icon-btn mo-secondary" onclick="moQty(${index},-1)">−</button>
    <span class="mo-qty">${Number(item.qty || 0)}</span>
    <button type="button" class="mo-icon-btn" onclick="moQty(${index},1)">＋</button>
    <button type="button" class="mo-danger" style="margin-left:auto;" onclick="moRemove(${index})">ลบสินค้า</button>
  </div>
</div>

`;

        })
        .join("");

  }

  const totalBox =
    document.getElementById(
      "mo_total"
    );

  if(totalBox){
    totalBox.textContent =
      "฿" +
      moSubtotal().toLocaleString(
        "th-TH",
        {maximumFractionDigits:2}
      );
  }

}

function moQty(i,d){ManualOrder.cart[i].qty=Math.max(1,ManualOrder.cart[i].qty+d);renderManualCart();renderManualGifts()}
function moRemove(i){ManualOrder.cart.splice(i,1);ManualOrder.gifts=[];renderManualCart();renderManualGifts()}
function moSubtotal(){return ManualOrder.cart.reduce((s,x)=>s+x.price*x.qty+Number(x.crate_fee||0),0)}

function getManualEligibleGiftCampaigns(){

  const result = [];

  (ManualOrder.campaigns || [])
    .filter(campaign=>moBool(campaign.active))
    .forEach(campaign=>{

      const campaignId =
        String(campaign.campaign_id || "").trim();

      const collectionId =
        String(campaign.collection_id || "").trim();

      const collection =
        ManualOrder.collections.find(
          item=>
            String(item.collection_id || "").trim() ===
            collectionId
        );

      const fandom =
        String(
          campaign.fandom ||
          collection?.fandom ||
          ""
        ).trim().toLowerCase();

      let scope =
        String(
          campaign.eligibility_scope ||
          "collection_only"
        ).trim().toLowerCase();

      if(scope === "collection"){
        scope = "collection_only";
      }

      if(scope === "fandom"){
        scope = "fandom_all";
      }

      const excluded =
        new Set(
          (ManualOrder.exclusions || [])
            .filter(
              item=>
                String(item.campaign_id || "").trim() ===
                campaignId
            )
            .map(
              item=>
                String(item.product_id || "").trim()
            )
        );

      if(
        moBool(
          campaign.require_campaign_item
        )
      ){

        const hasCampaignItem =
          ManualOrder.cart.some(
            item=>
              !excluded.has(
                String(item.product_id || "").trim()
              ) &&
              String(item.collection_id || "").trim() ===
              collectionId
          );

        if(!hasCampaignItem){
          return;
        }

      }

      const eligibleCart =
        ManualOrder.cart.filter(item=>{

          const productId =
            String(item.product_id || "").trim();

          if(excluded.has(productId)){
            return false;
          }

          if(scope === "collection_only"){

            return (
              String(item.collection_id || "").trim() ===
              collectionId
            );

          }

          if(scope === "fandom_all"){

            return (
              String(item.fandom || "").trim().toLowerCase() ===
              fandom
            );

          }

          return scope === "all";

        });

      const total =
        eligibleCart.reduce(
          (sum,item)=>
            sum +
            Number(item.price || 0) *
            Number(item.qty || 0) +
            Number(item.crate_fee || 0),
          0
        );

      const rules =
        (ManualOrder.rules || [])
          .filter(
            rule=>
              moBool(rule.active) &&
              String(rule.campaign_id || "").trim() ===
              campaignId &&
              total >= Number(rule.min_amount || 0)
          )
          .sort(
            (a,b)=>
              Number(a.min_amount || 0) -
              Number(b.min_amount || 0)
          )
          .map(rule=>({

            ...rule,

            items:
              (ManualOrder.items || [])
                .filter(
                  item=>
                    moBool(item.active) &&
                    String(item.rule_id || "").trim() ===
                    String(rule.rule_id || "").trim()
                )

          }))
          .filter(rule=>rule.items.length);

      if(rules.length){

        result.push({

          ...campaign,

          total,

          rules

        });

      }

    });

  return result;

}


function renderManualGifts(){

  const box =
    document.getElementById(
      "mo_gifts"
    );

  if(!box){
    return;
  }

  if(!ManualOrder.cart.length){

    box.innerHTML = `
      <div class="mo-empty">
        <span class="mo-empty-icon">🎁</span>
        ระบบจะคำนวณสิทธิ์ของแถมหลังเพิ่มสินค้า
      </div>
    `;

    ManualOrder.gifts = [];

    return;
  }

  const eligible =
    getManualEligibleGiftCampaigns();

  if(!eligible.length){

    box.innerHTML = `
      <div class="mo-empty">
        <span class="mo-empty-icon">🎁</span>
        ยังไม่มีของแถมที่ผ่านเงื่อนไขของออเดอร์นี้
      </div>
    `;

    ManualOrder.gifts = [];

    return;
  }

  const previous =
    Array.isArray(ManualOrder.gifts)
      ? [...ManualOrder.gifts]
      : [];

  box.innerHTML =
    eligible.map(campaign=>`

<div class="mo-gift">

  <b>
    🎁 ${moEsc(
      campaign.campaign_name ||
      "Gift Campaign"
    )}
  </b>

  <div
  style="
  margin-top:4px;
  color:#166534;
  font-size:13px;
  "
  >
    ยอดคำนวณ ฿${Number(
      campaign.total || 0
    ).toLocaleString("th-TH")}
  </div>

  ${campaign.rules.map(rule=>{

    const ruleId =
      String(rule.rule_id || "").trim();

    const maxSelect =
      Math.max(
        1,
        Math.floor(
          Number(rule.max_select || 1)
        )
      );

    const allowDuplicate =
      moBool(rule.allow_duplicate);

    return `

<div class="mo-gift-rule">

  <div class="mo-row">

    <b>
      ${moEsc(rule.rule_name || "Gift Rule")}
    </b>

    <span
    id="mo_gift_count_${moEsc(ruleId)}"
    class="mo-gift-count"
    >
      0 / ${maxSelect}
    </span>

  </div>

  ${rule.items.map(item=>{

    const itemId =
      String(item.gift_item_id || "").trim();

    return `

<div class="mo-gift-choice">

  ${
    allowDuplicate
      ? `

<input
type="number"
min="0"
max="${maxSelect}"
value="0"
data-mo-gift-rule="${moEsc(ruleId)}"
data-mo-gift-item="${moEsc(itemId)}"
onchange="collectManualGiftInputs()"
style="width:72px;"
>

`
      : `

<input
type="checkbox"
data-mo-gift-rule="${moEsc(ruleId)}"
data-mo-gift-item="${moEsc(itemId)}"
onchange="collectManualGiftInputs()"
>

`
  }

  <div style="flex:1;">

    <b>
      ${moEsc(item.gift_name || "ของแถม")}
    </b>

    ${
      moBool(item.has_character)
        ? `

<div
id="mo_gift_character_${moEsc(itemId)}"
class="mo-gift-character"
></div>

`
        : ""
    }

  </div>

</div>

`;

  }).join("")}

</div>

`;

  }).join("")}

</div>

`).join("");

  ManualOrder.gifts =
    previous;

  syncManualGiftControls();
  collectManualGiftInputs(true);

}


function syncManualGiftControls(){

  const grouped = {};

  (ManualOrder.gifts || [])
    .forEach(gift=>{

      const ruleId =
        String(gift.rule_id || "").trim();

      const itemId =
        String(
          gift.gift_item_id ||
          gift.gift_id ||
          ""
        ).trim();

      const key =
        ruleId + "::" + itemId;

      if(!grouped[key]){

        grouped[key] = {

          qty:0,

          characters:[]

        };

      }

      grouped[key].qty++;

      grouped[key].characters.push(
        String(gift.character_id || "").trim()
      );

    });

  Object.entries(grouped)
    .forEach(([key,value])=>{

      const [ruleId,itemId] =
        key.split("::");

      const input =
        document.querySelector(
          `[data-mo-gift-rule="${moCssEscape(ruleId)}"][data-mo-gift-item="${moCssEscape(itemId)}"]`
        );

      if(!input){
        return;
      }

      if(input.type === "checkbox"){

        input.checked =
          value.qty > 0;

      }else{

        input.value =
          value.qty;

      }

      renderManualGiftCharacters(
        ruleId,
        itemId,
        value.qty,
        value.characters
      );

    });

}


function collectManualGiftInputs(
  silent
){

  const next = [];

  for(
    const campaign of
    getManualEligibleGiftCampaigns()
  ){

    for(const rule of campaign.rules){

      const ruleId =
        String(rule.rule_id || "").trim();

      const maxSelect =
        Math.max(
          1,
          Math.floor(
            Number(rule.max_select || 1)
          )
        );

      const inputs =
        [
          ...document.querySelectorAll(
            `[data-mo-gift-rule="${moCssEscape(ruleId)}"]`
          )
        ];

      let count = 0;

      for(const input of inputs){

        const itemId =
          String(
            input.dataset.moGiftItem || ""
          ).trim();

        const item =
          rule.items.find(
            giftItem=>
              String(
                giftItem.gift_item_id || ""
              ).trim() ===
              itemId
          );

        if(!item){
          continue;
        }

        const qty =
          input.type === "checkbox"
            ? (input.checked ? 1 : 0)
            : Math.max(
                0,
                Math.floor(
                  Number(input.value || 0)
                )
              );

        count += qty;

        if(count > maxSelect){

          if(!silent){

            alert(
              `เลือกของแถมได้สูงสุด ${maxSelect} ชิ้น`
            );

          }

          renderManualGifts();

          return false;
        }

        const currentCharacterSelects =
          [
            ...document.querySelectorAll(
              `[data-mo-character-rule="${moCssEscape(ruleId)}"][data-mo-character-item="${moCssEscape(itemId)}"]`
            )
          ];

        const currentCharacters =
          currentCharacterSelects.map(
            select=>
              String(
                select.value || ""
              ).trim()
          );

        const savedCharacters =
          (ManualOrder.gifts || [])
            .filter(
              gift=>
                String(gift.rule_id || "").trim() ===
                ruleId &&
                String(
                  gift.gift_item_id ||
                  gift.gift_id ||
                  ""
                ).trim() ===
                itemId
            )
            .map(
              gift=>
                String(
                  gift.character_id || ""
                ).trim()
            );

        const selectedCharacters =
          currentCharacterSelects.length
            ? currentCharacters
            : savedCharacters;

        renderManualGiftCharacters(
          ruleId,
          itemId,
          qty,
          selectedCharacters
        );

        for(
          let index=0;
          index<qty;
          index++
        ){

          const select =
            document.querySelector(
              `[data-mo-character-rule="${moCssEscape(ruleId)}"][data-mo-character-item="${moCssEscape(itemId)}"][data-mo-character-index="${index}"]`
            );

          next.push({

            campaign_id:
              campaign.campaign_id,

            rule_id:
              rule.rule_id,

            gift_item_id:
              item.gift_item_id,

            gift_id:
              item.gift_item_id,

            character_id:
              select
                ? select.value
                : selectedCharacters[index] || ""

          });

        }

      }

      const countBox =
        document.getElementById(
          "mo_gift_count_" +
          ruleId
        );

      if(countBox){

        countBox.textContent =
          count +
          " / " +
          maxSelect;

      }

    }

  }

  ManualOrder.gifts =
    next;

  return true;

}


function renderManualGiftCharacters(
  ruleId,
  itemId,
  qty,
  selectedIds
){

  const item =
    (ManualOrder.items || [])
      .find(
        giftItem=>
          String(
            giftItem.gift_item_id || ""
          ).trim() ===
          String(itemId || "").trim()
      );

  const box =
    document.getElementById(
      "mo_gift_character_" +
      itemId
    );

  if(
    !box ||
    !item ||
    !moBool(item.has_character)
  ){
    return;
  }

  const characters =
    (ManualOrder.characters || [])
      .filter(
        character=>
          moBool(character.active) &&
          String(
            character.gift_item_id || ""
          ).trim() ===
          String(itemId || "").trim()
      );

  let html = "";

  for(
    let index=0;
    index<qty;
    index++
  ){

    html += `

<label
style="
display:block;
margin-top:8px;
font-size:13px;
"
>

ตัวละครชิ้นที่ ${index + 1}

<select
data-mo-character-rule="${moEsc(ruleId)}"
data-mo-character-item="${moEsc(itemId)}"
data-mo-character-index="${index}"
onchange="collectManualGiftInputs(true)"
>

<option value="">
เลือกตัวละคร
</option>

${characters.map(character=>`

<option
value="${moEsc(
  character.character_id || ""
)}"
>
${moEsc(
  character.character_name || "-"
)}
</option>

`).join("")}

</select>

</label>

`;

  }

  box.innerHTML =
    html;

  [
    ...box.querySelectorAll("select")
  ].forEach(select=>{

    const index =
      Number(
        select.dataset.moCharacterIndex
      );

    select.value =
      Array.isArray(selectedIds)
        ? selectedIds[index] || ""
        : "";

  });

}


function validateManualGiftSelections(){

  collectManualGiftInputs(true);

  for(const gift of ManualOrder.gifts){

    const item =
      (ManualOrder.items || [])
        .find(
          giftItem=>
            String(
              giftItem.gift_item_id || ""
            ).trim() ===
            String(
              gift.gift_item_id || ""
            ).trim()
        );

    if(
      item &&
      moBool(item.has_character) &&
      !String(
        gift.character_id || ""
      ).trim()
    ){

      throw new Error(
        "กรุณาเลือกตัวละครของ " +
        (
          item.gift_name ||
          "ของแถม"
        )
      );

    }

  }

}


function moCssEscape(
  value
){

  if(
    window.CSS &&
    typeof CSS.escape === "function"
  ){

    return CSS.escape(
      String(value || "")
    );

  }

  return String(
    value || ""
  ).replace(
    /["\\]/g,
    "\\$&"
  );

}

function getManualGiftDisplayRows(){

  return (ManualOrder.gifts || [])
    .map(
      gift=>{

        const item =
          (ManualOrder.items || [])
            .find(
              row=>
                String(
                  row.gift_item_id || ""
                ).trim() ===
                String(
                  gift.gift_item_id || ""
                ).trim()
            );

        const character =
          (ManualOrder.characters || [])
            .find(
              row=>
                String(
                  row.character_id || ""
                ).trim() ===
                String(
                  gift.character_id || ""
                ).trim()
            );

        return {

          gift_name:
            item
              ? item.gift_name || "ของแถม"
              : "ของแถม",

          character_name:
            character
              ? character.character_name || ""
              : ""

        };

      }
    );

}


function validateManualOrderForm(){

  clearManualMessage();

  const name = moVal("mo_name");
  const email = moVal("mo_email");
  const phone = moVal("mo_phone");
  const address = moVal("mo_address");
  const subdistrict = moVal("mo_subdistrict");
  const district = moVal("mo_district");
  const province = moVal("mo_province");
  const postcode = moVal("mo_postcode");

  const status =
    document.getElementById(
      "mo_paystatus"
    )?.value || "unpaid";

  const slip =
    document.getElementById(
      "mo_slip"
    )?.files?.[0];

  if(!name){
    throw new Error("กรุณากรอกชื่อผู้รับ");
  }

  if(!email){
    throw new Error("กรุณากรอกอีเมล");
  }

  if(
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ){
    throw new Error("รูปแบบอีเมลไม่ถูกต้อง");
  }

  if(!phone){
    throw new Error("กรุณากรอกเบอร์โทร");
  }

  if(!ManualOrder.cart.length){
    throw new Error("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
  }

  if(
    !address ||
    !subdistrict ||
    !district ||
    !province ||
    !postcode
  ){
    throw new Error(
      "กรุณากรอกที่อยู่ ตำบล/แขวง อำเภอ/เขต จังหวัด และรหัสไปรษณีย์ให้ครบ"
    );
  }

  if(!/^\d{5}$/.test(postcode)){
    throw new Error("รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก");
  }

  if(status === "paid" && !slip){
    throw new Error("สถานะชำระแล้วต้องแนบสลิป");
  }

  validateManualSlipFile(slip);
  validateManualGiftSelections();

  return true;

}


function openManualOrderPreview(){

  try{

    validateManualOrderForm();

  }catch(error){

    alert(
      error.message ||
      String(error)
    );

    return;

  }

  const modal =
    document.getElementById(
      "mo_preview_modal"
    );

  const body =
    document.getElementById(
      "mo_preview_body"
    );

  if(
    !modal ||
    !body
  ){
    return;
  }

  const paymentMethod =
    document
      .getElementById(
        "mo_method"
      )
      ?.value || "";

  const paymentStatus =
    document
      .getElementById(
        "mo_paystatus"
      )
      ?.value || "";

  const paymentMethodLabel =
    paymentMethod ===
    "credit_card_qr"
      ? "QR บัตรเครดิต"
      : "บัญชีธนาคาร";

  const paymentStatusLabel = {

    paid:
      "ชำระแล้ว",

    pending_verification:
      "รอตรวจสอบ",

    unpaid:
      "ยังไม่ชำระ"

  }[
    paymentStatus
  ] || paymentStatus;

  const itemsHtml =
    ManualOrder.cart
      .map(
        item=>`

<div class="mo-preview-item">

  <div class="mo-row">

    <div>

      <b>
        ${moEsc(
          item.name || ""
        )}
      </b>

      ${
        Object.keys(
          item.selected_options || {}
        ).length
          ? `

<div
style="
font-size:13px;
color:#64748b;
margin-top:4px;
"
>
${moEsc(
  Object.entries(
    item.selected_options
  )
    .map(
      ([key,value])=>
        key +
        ": " +
        (
          Array.isArray(value)
            ? value.join(", ")
            : value
        )
    )
    .join(" / ")
)}
</div>

`
          : ""
      }

      <div
      style="
      font-size:13px;
      color:#64748b;
      margin-top:4px;
      "
      >
      ${Number(
        item.qty || 0
      )} ชิ้น
      ×
      ฿${Number(
        item.price || 0
      ).toLocaleString("th-TH")}
      </div>

    </div>

    <b>
      ฿${(
        Number(
          item.price || 0
        ) *
        Number(
          item.qty || 0
        ) +
        Number(
          item.crate_fee || 0
        )
      ).toLocaleString("th-TH")}
    </b>

  </div>

</div>

`
      )
      .join("");

  const gifts =
    getManualGiftDisplayRows();

  const giftsHtml =
    gifts.length
      ? gifts.map(
          gift=>`

<div class="mo-preview-item">

  🎁
  <b>
    ${moEsc(
      gift.gift_name
    )}
  </b>

  ${
    gift.character_name
      ? `

<div
style="
font-size:13px;
color:#166534;
margin-top:4px;
"
>
ตัวละคร:
${moEsc(
  gift.character_name
)}
</div>

`
      : ""
  }

</div>

`
        ).join("")
      : `

<div class="mo-empty">
ไม่มีของแถม
</div>

`;

  const addressText = [

    moVal("mo_name"),
    moVal("mo_phone"),
    moVal("mo_address"),
    moVal("mo_subdistrict"),
    moVal("mo_district"),
    moVal("mo_province"),
    moVal("mo_postcode")

  ]
    .filter(Boolean)
    .join(" ");

  body.innerHTML = `

<div class="mo-preview-grid">

  <div class="mo-preview-panel">

    <b>👤 ลูกค้า</b>

    <div>
      ${moEsc(
        moVal("mo_name")
      )}
    </div>

    <div>
      ${moEsc(
        moVal("mo_email")
      )}
    </div>

    <div>
      ${moEsc(
        moVal("mo_phone")
      )}
    </div>

    ${
      moVal("mo_social")
        ? `

<div>
  ${moEsc(
    moVal("mo_social")
  )}
</div>

`
        : ""
    }

  </div>

  <div class="mo-preview-panel">

    <b>💳 การชำระเงิน</b>

    <div>
      ${moEsc(
        paymentMethodLabel
      )}
    </div>

    <div>
      ${moEsc(
        paymentStatusLabel
      )}
    </div>

  </div>

</div>

<div class="mo-preview-section">

  <h4>
    🛍️ รายการสินค้า
  </h4>

  ${itemsHtml}

</div>

<div class="mo-preview-section">

  <h4>
    🎁 ของแถม
  </h4>

  ${giftsHtml}

</div>

${getManualSlipPreviewHtml()}

<div class="mo-preview-section">

  <h4>
    📍 ที่อยู่จัดส่ง
  </h4>

  <div>
    ${moEsc(
      addressText
    )}
  </div>

</div>

<div
class="mo-row"
style="
margin-top:18px;
padding-top:16px;
border-top:2px solid #dbeafe;
"
>

  <b>
    ยอดรวม
  </b>

  <div class="mo-preview-total">
    ฿${moSubtotal().toLocaleString(
      "th-TH",
      {
        maximumFractionDigits:2
      }
    )}
  </div>

</div>

<div class="mo-preview-actions">

  <button
  type="button"
  style="background:#64748b;"
  onclick="closeManualOrderPreview()"
  >
  กลับไปแก้ไข
  </button>

  <button
  id="mo_confirm_submit"
  type="button"
  onclick="submitManualOrder()"
  >
  ✅ ยืนยันสร้างออเดอร์
  </button>

</div>

`;

  modal.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";

}


function closeManualOrderPreview(){

  const modal =
    document.getElementById(
      "mo_preview_modal"
    );

  if(modal){

    modal.classList.add(
      "hidden"
    );

  }

  document.body.style.overflow =
    "";

}


function handleManualPreviewBackdrop(
  event
){

  if(
    event.target &&
    event.target.id ===
    "mo_preview_modal"
  ){

    closeManualOrderPreview();

  }

}

async function submitManualOrder(){

  if(
    ManualOrder.loading
  ){
    return;
  }

  const name =
    moVal(
      "mo_name"
    );

  const email =
    moVal(
      "mo_email"
    );

  const phone =
    moVal(
      "mo_phone"
    );

  const social =
    normalizeManualTwitter(
      moVal(
        "mo_social"
      )
    );

  const slip =
    document
      .getElementById(
        "mo_slip"
      )
      .files[0];

  const status =
    document
      .getElementById(
        "mo_paystatus"
      )
      .value;


  if(!name){

    alert(
      "กรุณากรอกชื่อผู้รับ"
    );

    return;

  }


  if(!social){

    alert(
      "กรุณากรอกแอค X / Twitter"
    );

    document
      .getElementById(
        "mo_social"
      )
      ?.focus();

    return;

  }


  if(!phone){

    alert(
      "กรุณากรอกเบอร์โทร"
    );

    return;

  }


  if(
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        email
      )
  ){

    alert(
      "รูปแบบอีเมลไม่ถูกต้อง"
    );

    return;

  }


  if(
    !ManualOrder.cart.length
  ){

    alert(
      "เพิ่มสินค้าอย่างน้อย 1 รายการ"
    );

    return;

  }


  if(
    status === "paid" &&
    !slip
  ){

    alert(
      "สถานะชำระแล้วต้องแนบสลิป"
    );

    return;

  }


  const payload = {

    /*
    ส่งไว้ได้ แต่ backend
    จะตรวจ Twitter ซ้ำอีกครั้ง
    และเป็นคนตัดสิน customer_id จริง
    */
    customer_id:
      ManualOrder.selectedCustomer
        ? (
            ManualOrder
              .selectedCustomer
              .customer_id ||
            ""
          )
        : "",

    customer_name:
      name,

    email:
      email,

    phone:
      phone,

    social:
      social,

    items:
      ManualOrder.cart,

    gifts:
      ManualOrder.gifts,

    address:{

      receiver:
        name,

      email:
        email,

      phone:
        phone,

      address:
        moVal(
          "mo_address"
        ),

      subdistrict:
        moVal(
          "mo_subdistrict"
        ),

      district:
        moVal(
          "mo_district"
        ),

      province:
        moVal(
          "mo_province"
        ),

      postcode:
        moVal(
          "mo_postcode"
        )

    },

    payment:{

      method:
        document
          .getElementById(
            "mo_method"
          )
          .value,

      status:
        status,

      amount:
        moSubtotal(),

      slip_base64:
        slip
          ? await moFile(
              slip
            )
          : ""

    },

    order_source:
      "admin",

    admin_note:
      moVal(
        "mo_note"
      )

  };


  ManualOrder.loading =
    true;

  document
    .getElementById(
      "mo_submit"
    )
    .disabled =
      true;


  try{

    const formData =
      new FormData();

    formData.append(
      "payload",
      JSON.stringify(
        payload
      )
    );

    const response =
      await fetch(
        API +
        "?action=adminManualOrder",
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();


    if(
      !result.success
    ){

      throw new Error(
        result.error ||
        "สร้างออเดอร์ไม่สำเร็จ"
      );

    }


    let message =
      "สร้างออเดอร์สำเร็จ " +
      result.order_id;


    if(
      result.customer_linked
    ){

      message +=
        "\n\nเชื่อมกับบัญชีลูกค้าเดิมแล้ว";

    }else{

      message +=
        "\n\nยังไม่มีบัญชีลูกค้า ระบบบันทึกด้วย Twitter ไว้ก่อน";

    }


    alert(
      message
    );


    renderManualOrderManager();


    if(
      typeof loadOrders ===
      "function"
    ){

      loadOrders();

    }

  }catch(error){

    alert(
      error.message
    );

  }finally{

    ManualOrder.loading =
      false;

    const button =
      document
        .getElementById(
          "mo_submit"
        );

    if(button){

      button.disabled =
        false;

    }

  }

}

function setManualLoading(loading){

  ManualOrder.loading =
    Boolean(loading);

  const buttons = [
    document.getElementById("mo_submit"),
    document.getElementById("mo_confirm_submit")
  ].filter(Boolean);

  buttons.forEach(button=>{

    button.disabled =
      ManualOrder.loading;

    button.classList.toggle(
      "mo-button-loading",
      ManualOrder.loading
    );

  });

  const confirmButton =
    document.getElementById(
      "mo_confirm_submit"
    );

  if(confirmButton){

    confirmButton.textContent =
      ManualOrder.loading
        ? "⏳ กำลังสร้างออเดอร์..."
        : "✅ ยืนยันสร้างออเดอร์";

  }

}

function setManualMessage(message,type){

  const box =
    document.getElementById(
      "mo_message"
    );

  if(!box){
    return;
  }

  box.className =
    "mo-notice mo-" +
    (type || "info");

  box.textContent =
    String(message || "");

  box.classList.remove(
    "hidden"
  );

}

function clearManualMessage(){

  const box =
    document.getElementById(
      "mo_message"
    );

  if(!box){
    return;
  }

  box.textContent = "";
  box.className =
    "mo-notice hidden";

}

function showManualError(error){

  const message =
    error && error.message
      ? error.message
      : String(error || "เกิดข้อผิดพลาด");

  setManualMessage(
    message,
    "error"
  );

  alert(message);

}

function validateManualSlipFile(file){

  if(!file){
    return true;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if(
    file.type &&
    !allowedTypes.includes(file.type)
  ){
    throw new Error(
      "รองรับสลิปเฉพาะไฟล์ JPG, PNG หรือ WEBP"
    );
  }

  const maxBytes =
    8 * 1024 * 1024;

  if(file.size > maxBytes){
    throw new Error(
      "ไฟล์สลิปต้องมีขนาดไม่เกิน 8 MB"
    );
  }

  return true;

}

function handleManualSlipChange(){

  const input =
    document.getElementById(
      "mo_slip"
    );

  const box =
    document.getElementById(
      "mo_slip_preview"
    );

  if(!box){
    return;
  }

  const file =
    input?.files?.[0];

  if(!file){
    box.innerHTML = "";
    box.classList.add("hidden");
    return;
  }

  try{
    validateManualSlipFile(file);
  }catch(error){
    if(input){
      input.value = "";
    }
    box.innerHTML = "";
    box.classList.add("hidden");
    showManualError(error);
    return;
  }

  const url =
    URL.createObjectURL(file);

  box.innerHTML = `
    <b>ตัวอย่างสลิป</b>
    <div style="font-size:13px;color:#64748b;margin-top:4px;">
      ${moEsc(file.name)} • ${formatManualFileSize(file.size)}
    </div>
    <img src="${moEsc(url)}" alt="ตัวอย่างสลิป">
  `;

  box.classList.remove("hidden");

}

function getManualSlipPreviewHtml(){

  const file =
    document.getElementById(
      "mo_slip"
    )?.files?.[0];

  if(!file){
    return "";
  }

  const url =
    URL.createObjectURL(file);

  return `

<div class="mo-preview-section">
  <h4>🧾 สลิปที่แนบ</h4>
  <div style="font-size:13px;color:#64748b;">
    ${moEsc(file.name)} • ${formatManualFileSize(file.size)}
  </div>
  <img
    src="${moEsc(url)}"
    alt="ตัวอย่างสลิป"
    style="max-width:240px;max-height:240px;object-fit:contain;border-radius:12px;margin-top:10px;border:1px solid #e5e7eb;"
  >
</div>

`;

}

function formatManualFileSize(bytes){

  const size =
    Number(bytes || 0);

  if(size < 1024){
    return size + " B";
  }

  if(size < 1024 * 1024){
    return (size / 1024).toFixed(1) + " KB";
  }

  return (
    size / 1024 / 1024
  ).toFixed(1) + " MB";

}

function moVal(id){return document.getElementById(id)?.value.trim()||''}
function moFile(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('อ่านสลิปไม่สำเร็จ'));r.readAsDataURL(f)})}

document.addEventListener(
  "keydown",
  event=>{

    if(
      event.key === "Escape"
    ){

      closeManualProductModal();

      closeManualOrderPreview();

    }

  }
);
