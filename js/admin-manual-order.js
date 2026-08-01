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

  loading:false

};

function renderManualOrderManager(){
  const root=document.getElementById('manualOrderManager');
  if(!root)return;
  root.innerHTML=`
  <style>
  .mo-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin-bottom:16px}
  .mo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .mo-full{grid-column:1/-1}.mo-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
  .mo-product{border:1px solid #e5e7eb;border-radius:12px;padding:10px;cursor:pointer}.mo-product:hover{border-color:#7dcfff}
  .mo-row{display:flex;justify-content:space-between;gap:10px;align-items:center}.mo-item{border:1px solid #e5e7eb;border-radius:12px;padding:10px;margin-top:8px}
  .mo-total{font-size:26px;font-weight:800;color:#2563eb}.mo-gift{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:10px;margin-top:8px}
  .mo-modal{position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:99999;padding:20px;overflow:auto}
  .mo-modal.hidden{display:none}
  .mo-modal-card{max-width:650px;margin:40px auto;background:white;border-radius:18px;padding:18px}
  .mo-modal-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}
  .mo-option-group{margin-bottom:16px}
  .mo-option-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
  .mo-option-choice{display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid #dbeafe;border-radius:999px}
  .mo-option-choice input{width:auto}
  .mo-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}
  .mo-product-image{width:120px;height:120px;object-fit:cover;border-radius:14px;background:#f1f5f9}
  .mo-empty{padding:14px;background:#f8fafc;border-radius:12px;color:#64748b}
  .mo-gift-rule{margin-top:10px;padding-top:10px;border-top:1px solid #dcfce7}
  .mo-gift-choice{display:flex;align-items:flex-start;gap:10px;margin-top:8px;padding:8px;border-radius:10px;background:#fff}
  .mo-gift-choice input{width:auto;margin-top:4px}
  .mo-gift-character{margin-top:8px}
  .mo-gift-character select{margin-top:5px}
  .mo-gift-count{font-size:12px;color:#166534;font-weight:700}
  @media(max-width:800px){.mo-grid{grid-template-columns:1fr}.mo-full{grid-column:auto}}
  </style>
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

<label>
แอค X

<input
id="mo_social"
placeholder="@username"
>
</label>

<label>
อีเมล *

<input
id="mo_email"
type="email"
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
  </div><div id="mo_products" class="mo-products" style="margin-top:12px">กำลังโหลด...</div></div>
  <div class="mo-card"><h3>📦 รายการในออเดอร์</h3><div id="mo_cart"></div><div class="mo-row" style="margin-top:14px"><b>ยอดรวม</b><div id="mo_total" class="mo-total">฿0</div></div></div>
  <div class="mo-card"><h3>🎁 ของแถม</h3><div id="mo_gifts">ระบบจะคำนวณหลังเพิ่มสินค้า</div></div>
  <div class="mo-card"><h3>📍 ที่อยู่</h3><div class="mo-grid">
  <label class="mo-full">ที่อยู่<textarea id="mo_address" rows="3"></textarea></label>
  <label>ตำบล/แขวง<input id="mo_subdistrict"></label><label>อำเภอ/เขต<input id="mo_district"></label>
  <label>จังหวัด<input id="mo_province"></label><label>รหัสไปรษณีย์<input id="mo_postcode"></label>
  </div></div>
  <div class="mo-card"><h3>💳 การชำระเงิน</h3><div class="mo-grid">
  <label>ช่องทาง<select id="mo_method"><option value="credit_card_qr">QR บัตรเครดิต</option><option value="bank_transfer">บัญชีธนาคาร</option></select></label>
  <label>สถานะ<select id="mo_paystatus"><option value="paid">ชำระแล้ว</option><option value="pending_verification">รอตรวจสอบ</option><option value="unpaid">ยังไม่ชำระ</option></select></label>
  <label class="mo-full">แนบสลิป<input id="mo_slip" type="file" accept="image/*"></label>
  <label class="mo-full">หมายเหตุ<textarea id="mo_note" rows="2"></textarea></label>
  </div></div>
  <button id="mo_submit" onclick="submitManualOrder()">✅ ยืนยันคำสั่งซื้อ</button>

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

  </div>`;
  loadManualOrderData();
}

async function loadManualOrderData(){
  const [p,c,gc,gr,gi,ch,ex]=await Promise.all([
    moGet('adminProducts'),moGet('adminCollections'),moGet('getGiftCampaigns'),moGet('getGiftRules'),moGet('getGiftItems'),moGet('getGiftCharacters'),moGet('getGiftCampaignExclusions')
  ]);
  ManualOrder.products=moArray(p,'products');ManualOrder.collections=moArray(c,'collections');
  ManualOrder.campaigns=moArray(gc,'campaigns');ManualOrder.rules=moArray(gr,'rules');ManualOrder.items=moArray(gi,'items','gifts');
  ManualOrder.characters=moArray(ch,'characters');ManualOrder.exclusions=moArray(ex,'exclusions');
  document.getElementById('mo_collection').innerHTML='<option value="">ทั้งหมด</option>'+ManualOrder.collections.map(x=>`<option value="${moEsc(x.collection_id)}">${moEsc(x.name)}</option>`).join('');
  filterManualProducts();renderManualCart();renderManualGifts();
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

<div
style="
padding:14px;
margin-bottom:10px;
border:1px solid #dbeafe;
background:#eff6ff;
border-radius:12px;
"
>

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
onclick="
openManualProductModal(
'${moEsc(
  product.product_id
)}'
)
"
>

<b>
${moEsc(
  product.name
)}
</b>

<div>
฿${moPrice(
  product
).toLocaleString()}
</div>

<small>
${moEsc(
  product.fandom || ""
)}
</small>

</div>

`
        ).join("")

      : "ไม่พบสินค้า";

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
  const box=document.getElementById('mo_cart');
  box.innerHTML=ManualOrder.cart.length?ManualOrder.cart.map((x,i)=>`<div class="mo-item"><div class="mo-row"><div><b>${moEsc(x.name)}</b><div>${moEsc(Object.values(x.selected_options||{}).join(', '))}</div></div><b>฿${(x.price*x.qty+x.crate_fee).toLocaleString()}</b></div><div style="margin-top:8px"><button onclick="moQty(${i},-1)">−</button> ${x.qty} <button onclick="moQty(${i},1)">+</button> <button onclick="moRemove(${i})" style="background:#ef4444">ลบ</button></div></div>`).join(''):'ยังไม่มีสินค้า';
  document.getElementById('mo_total').textContent='฿'+moSubtotal().toLocaleString();
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

    box.innerHTML =
      "ระบบจะคำนวณหลังเพิ่มสินค้า";

    ManualOrder.gifts = [];

    return;
  }

  const eligible =
    getManualEligibleGiftCampaigns();

  if(!eligible.length){

    box.innerHTML =
      "ยังไม่มีของแถมที่ผ่านเงื่อนไข";

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

        const oldCharacters =
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

        renderManualGiftCharacters(
          ruleId,
          itemId,
          qty,
          oldCharacters
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
                : oldCharacters[index] || ""

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
async function submitManualOrder(){
  if(ManualOrder.loading)return;
  const slip=document.getElementById('mo_slip').files[0];const status=document.getElementById('mo_paystatus').value;
  if(!document.getElementById('mo_name').value.trim()||!document.getElementById('mo_email').value.trim()||!document.getElementById('mo_phone').value.trim())return alert('กรอกข้อมูลลูกค้าให้ครบ');
  if(!ManualOrder.cart.length)return alert('เพิ่มสินค้าอย่างน้อย 1 รายการ');
  if(status==='paid'&&!slip)return alert('สถานะชำระแล้วต้องแนบสลิป');

  try{

    validateManualGiftSelections();

  }catch(error){

    alert(
      error.message ||
      String(error)
    );

    return;

  }

  const payload={

  customer_id:
    ManualOrder.selectedCustomer
      ? ManualOrder.selectedCustomer.customer_id || ""
      : "",

  customer_name:
    moVal(
      "mo_name"
    ),

  email:
    moVal(
      "mo_email"
    ),
  phone:moVal('mo_phone'),social:moVal('mo_social'),items:ManualOrder.cart,gifts:ManualOrder.gifts,address:{receiver:moVal('mo_name'),email:moVal('mo_email'),phone:moVal('mo_phone'),address:moVal('mo_address'),subdistrict:moVal('mo_subdistrict'),district:moVal('mo_district'),province:moVal('mo_province'),postcode:moVal('mo_postcode')},payment:{method:document.getElementById('mo_method').value,status,amount:moSubtotal(),slip_base64:slip?await moFile(slip):''},order_source:'admin',admin_note:moVal('mo_note')};
  ManualOrder.loading=true;document.getElementById('mo_submit').disabled=true;
  try{const fd=new FormData();fd.append('payload',JSON.stringify(payload));const r=await fetch(API+'?action=adminManualOrder',{method:'POST',body:fd});const j=await r.json();if(!j.success)throw new Error(j.error||'สร้างออเดอร์ไม่สำเร็จ');alert('สร้างออเดอร์สำเร็จ '+j.order_id);renderManualOrderManager();if(typeof loadOrders==='function')loadOrders()}catch(e){alert(e.message)}finally{ManualOrder.loading=false;const b=document.getElementById('mo_submit');if(b)b.disabled=false}
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

    }

  }
);
