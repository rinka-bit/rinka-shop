/**
 * Rinka Shop Admin - Legacy Order Importer
 *
 * ใช้เพิ่มออเดอร์เก่าโดยไม่ต้องสร้าง Product หรือ Collection
 * และรองรับการผูกออเดอร์กับบัญชีลูกค้าภายหลัง
 */

(function(){

  const originalShowAdminTab =
    window.showAdminTab;

  window.showAdminTab =
    function(tab){

      if(
        typeof originalShowAdminTab ===
        "function"
      ){

        originalShowAdminTab(
          tab
        );

      }

      if(
        tab ===
        "legacy_orders"
      ){

        renderLegacyOrderManager();
        loadLegacyUnlinkedOrders();

      }

    };

})();


let legacyProductRows = [];
let legacyGiftRows = [];
let legacyCustomerSearchResults = [];
let legacySelectedCustomer = null;
let legacyLinkTargetOrderId = "";


function renderLegacyOrderManager(){

  const root =
    document.getElementById(
      "legacyOrderManager"
    );

  if(!root){
    return;
  }

  root.innerHTML = `

<style>

.legacy-layout{
  display:grid;
  grid-template-columns:minmax(0,1.25fr) minmax(330px,.75fr);
  gap:18px;
  align-items:start;
}

.legacy-card{
  background:#fff;
  border:1px solid #dbe7f1;
  border-radius:18px;
  padding:18px;
  margin-bottom:16px;
  box-shadow:0 7px 22px rgba(86,142,178,.07);
}

.legacy-card h2,
.legacy-card h3{
  margin-top:0;
}

.legacy-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
}

.legacy-full{
  grid-column:1/-1;
}

.legacy-label{
  display:block;
  margin-bottom:6px;
  color:#526777;
  font-size:13px;
  font-weight:700;
}

.legacy-required::after{
  content:" *";
  color:#ef4444;
}

.legacy-item{
  position:relative;
  padding:14px;
  margin-bottom:12px;
  border:1px solid #dbe7f1;
  border-radius:15px;
  background:#fbfdff;
}

.legacy-remove{
  width:auto;
  padding:6px 9px;
  background:#fee2e2;
  color:#991b1b;
}

.legacy-row-head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  margin-bottom:12px;
}

.legacy-add{
  width:auto;
  background:#10b981;
}

.legacy-secondary{
  background:#eef8ff;
  color:#3476a2;
  border:1px solid #cce5f4;
}

.legacy-summary-row{
  display:flex;
  justify-content:space-between;
  gap:12px;
  padding:8px 0;
  color:#64748b;
}

.legacy-summary-row strong{
  color:#334155;
  text-align:right;
}

.legacy-summary-total{
  margin-top:9px;
  padding-top:13px;
  border-top:1px solid #dbe7f1;
  font-size:19px;
}

.legacy-summary-total strong{
  color:#2563eb;
  font-size:24px;
}

.legacy-image-preview{
  width:76px;
  height:76px;
  margin-top:8px;
  border-radius:12px;
  object-fit:cover;
  border:1px solid #dbe7f1;
  background:#eef7fc;
}

.legacy-image-preview.hidden{
  display:none;
}

.legacy-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.legacy-actions button{
  flex:1;
  min-width:180px;
}

.legacy-save{
  background:linear-gradient(135deg,#7dcfff,#56b7ed);
}

.legacy-message{
  display:none;
  margin-top:12px;
  padding:12px;
  border-radius:12px;
  line-height:1.6;
}

.legacy-message.show{
  display:block;
}

.legacy-message.success{
  background:#ecfdf5;
  border:1px solid #86efac;
  color:#166534;
}

.legacy-message.error{
  background:#fff1f2;
  border:1px solid #fecdd3;
  color:#9f1239;
}

.legacy-unlinked-row{
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:12px;
  align-items:center;
  padding:12px;
  margin-bottom:10px;
  border:1px solid #dbe7f1;
  border-radius:14px;
  background:#fff;
}

.legacy-unlinked-meta{
  color:#64748b;
  font-size:13px;
  line-height:1.65;
}

.legacy-link-panel{
  margin-top:14px;
  padding:14px;
  border:1px solid #bfdbfe;
  border-radius:15px;
  background:#eff6ff;
}

.legacy-customer-result{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  padding:10px;
  margin-top:8px;
  border:1px solid #dbe7f1;
  border-radius:12px;
  background:#fff;
}

.legacy-selected-customer{
  margin-top:10px;
  padding:11px;
  border-radius:12px;
  background:#dcfce7;
  color:#166534;
  font-weight:700;
}

.legacy-empty{
  padding:22px;
  text-align:center;
  color:#64748b;
  border:1px dashed #cbd5e1;
  border-radius:14px;
  background:#f8fafc;
}

@media(max-width:900px){

  .legacy-layout{
    grid-template-columns:1fr;
  }

}

@media(max-width:620px){

  .legacy-grid{
    grid-template-columns:1fr;
  }

  .legacy-full{
    grid-column:auto;
  }

  .legacy-unlinked-row{
    grid-template-columns:1fr;
  }

}

</style>

<div class="legacy-layout">

<section>

<div class="legacy-card">

<h2>👤 ข้อมูลลูกค้าและรอบพรี</h2>

<div class="legacy-grid">

<div>

<label class="legacy-label legacy-required">
ชื่อแอค / ชื่อลูกค้า
</label>

<input
id="legacyCustomerName"
type="text"
placeholder="@username หรือชื่อลูกค้า">

</div>

<div>

<label class="legacy-label">
อีเมล (ไม่บังคับ)
</label>

<input
id="legacyEmail"
type="email"
placeholder="example@email.com">

</div>

<div>

<label class="legacy-label">
Social / X (ไม่บังคับ)
</label>

<input
id="legacySocial"
type="text"
placeholder="@username">

</div>

<div>

<label class="legacy-label legacy-required">
รอบพรีออเดอร์
</label>

<input
id="legacyPreorderRound"
type="text"
placeholder="เช่น Genshin รอบเดือนกรกฎาคม">

</div>

<div>

<label class="legacy-label legacy-required">
สถานะสินค้า
</label>

<select id="legacyStatus">

<option value="pending">
กดสั่งสินค้าแล้ว
</option>

<option value="china_arrived">
ถึงโกดังจีนแล้ว
</option>

<option value="shipping_to_th">
กำลังมาไทย
</option>

<option value="ready_to_ship">
เตรียมจัดส่ง
</option>

<option value="shipped">
จัดส่งแล้ว
</option>

</select>

</div>

<div>

<label class="legacy-label">
ผูกกับบัญชีตอนนี้
</label>

<button
type="button"
class="legacy-secondary"
onclick="openLegacyCustomerPickerForNewOrder()">
🔗 ค้นหาบัญชีลูกค้า
</button>

<div
id="legacySelectedCustomer"
class="legacy-selected-customer"
style="display:none;">
</div>

</div>

</div>

<div
id="legacyNewOrderCustomerPicker"
class="legacy-link-panel"
style="display:none;">

<h3>ค้นหาบัญชีลูกค้า</h3>

<div style="display:flex;gap:8px;">

<input
id="legacyNewOrderCustomerKeyword"
type="text"
placeholder="ค้นหาชื่อ อีเมล หรือ X">

<button
type="button"
style="width:auto;"
onclick="searchLegacyCustomer('new')">
ค้นหา
</button>

</div>

<div id="legacyNewOrderCustomerResults">
</div>

</div>

</div>


<div class="legacy-card">

<div class="legacy-row-head">

<h2 style="margin:0;">
🛍️ รายการสินค้า
</h2>

<button
type="button"
class="legacy-add"
onclick="addLegacyProductRow()">
+ เพิ่มรายการ
</button>

</div>

<div id="legacyProductRows">
</div>

</div>


<div class="legacy-card">

<div class="legacy-row-head">

<h2 style="margin:0;">
🎁 ของแถม
</h2>

<button
type="button"
class="legacy-add"
onclick="addLegacyGiftRow()">
+ เพิ่มของแถม
</button>

</div>

<p style="color:#64748b;">
ไม่มีก็เว้นไว้ได้ สามารถแนบรูปของแถมเก่าได้
</p>

<div id="legacyGiftRows">
</div>

</div>


<div class="legacy-card">

<h2>🚚 ค่านำเข้าและค่าส่ง</h2>

<div class="legacy-grid">

<div>

<label class="legacy-label legacy-required">
สถานะค่านำเข้า
</label>

<select
id="legacyImportFeeStatus"
onchange="toggleLegacyImportAmount()">

<option value="included">
รวมแล้ว
</option>

<option value="pending">
รอคำนวณ
</option>

</select>

</div>

<div id="legacyImportAmountBox">

<label class="legacy-label">
ค่านำเข้าที่รวมแล้ว
</label>

<input
id="legacyImportFee"
type="number"
min="0"
step="0.01"
value="0"
oninput="renderLegacySummary()">

</div>

<div>

<label class="legacy-label">
ค่าส่งในไทย
</label>

<input
id="legacyDomesticShippingFee"
type="number"
min="0"
step="0.01"
value="0"
oninput="renderLegacySummary()">

</div>

<div>

<label class="legacy-label">
ขนส่ง
</label>

<input
id="legacyCourier"
type="text"
placeholder="ไปรษณีย์ไทย">

</div>

<div>

<label class="legacy-label">
เลขพัสดุ
</label>

<input
id="legacyTrackingNo"
type="text"
placeholder="กรอกเมื่อจัดส่งแล้ว">

</div>

</div>

</div>


<div class="legacy-card">

<div class="legacy-actions">

<button
type="button"
class="legacy-secondary"
onclick="resetLegacyOrderForm()">
ล้างข้อมูล
</button>

<button
id="legacySaveButton"
type="button"
class="legacy-save"
onclick="saveLegacyOrder()">
💾 บันทึกออเดอร์เก่า
</button>

</div>

<div
id="legacyOrderMessage"
class="legacy-message">
</div>

</div>

</section>


<aside>

<div class="legacy-card">

<h2>🧾 สรุปออเดอร์</h2>

<div id="legacySummary">
</div>

</div>

<div class="legacy-card">

<div class="legacy-row-head">

<h2 style="margin:0;">
🔗 ออเดอร์ที่ยังไม่ผูกบัญชี
</h2>

<button
type="button"
class="legacy-secondary"
style="width:auto;"
onclick="loadLegacyUnlinkedOrders()">
รีเฟรช
</button>

</div>

<div id="legacyUnlinkedOrders">
กำลังโหลด...
</div>

</div>

<div
id="legacyExistingOrderLinkPanel"
class="legacy-card"
style="display:none;">

<h2>ผูกออเดอร์กับบัญชี</h2>

<p id="legacyLinkOrderLabel"></p>

<div style="display:flex;gap:8px;">

<input
id="legacyExistingCustomerKeyword"
type="text"
placeholder="ค้นหาชื่อ อีเมล หรือ X">

<button
type="button"
style="width:auto;"
onclick="searchLegacyCustomer('existing')">
ค้นหา
</button>

</div>

<div id="legacyExistingCustomerResults">
</div>

<div
id="legacyExistingSelectedCustomer"
class="legacy-selected-customer"
style="display:none;">
</div>

<div class="legacy-actions" style="margin-top:12px;">

<button
type="button"
class="legacy-secondary"
onclick="closeLegacyLinkPanel()">
ยกเลิก
</button>

<button
id="legacyLinkButton"
type="button"
onclick="linkLegacyOrderToCustomer()">
ผูกบัญชี
</button>

</div>

</div>

</aside>

</div>

`;

  resetLegacyOrderForm();

}


function resetLegacyOrderForm(){

  legacyProductRows = [];
  legacyGiftRows = [];
  legacySelectedCustomer = null;

  const ids = [
    "legacyCustomerName",
    "legacyEmail",
    "legacySocial",
    "legacyPreorderRound",
    "legacyCourier",
    "legacyTrackingNo"
  ];

  ids.forEach(
    id=>{

      const input =
        document.getElementById(id);

      if(input){
        input.value = "";
      }

    }
  );

  const status =
    document.getElementById(
      "legacyStatus"
    );

  if(status){
    status.value = "pending";
  }

  const importStatus =
    document.getElementById(
      "legacyImportFeeStatus"
    );

  if(importStatus){
    importStatus.value = "included";
  }

  const importFee =
    document.getElementById(
      "legacyImportFee"
    );

  if(importFee){
    importFee.value = "0";
  }

  const domestic =
    document.getElementById(
      "legacyDomesticShippingFee"
    );

  if(domestic){
    domestic.value = "0";
  }

  const selectedBox =
    document.getElementById(
      "legacySelectedCustomer"
    );

  if(selectedBox){
    selectedBox.style.display = "none";
    selectedBox.textContent = "";
  }

  const picker =
    document.getElementById(
      "legacyNewOrderCustomerPicker"
    );

  if(picker){
    picker.style.display = "none";
  }

  addLegacyProductRow();
  renderLegacyGiftRows();
  toggleLegacyImportAmount();
  renderLegacySummary();
  setLegacyMessage("", "");

}


function addLegacyProductRow(){

  legacyProductRows.push({

    row_id:
      "LP" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2,7),

    product_name:"",
    character:"",
    option_text:"",
    quantity:1,
    unit_price:0,
    image_base64:"",
    image_name:"",
    preview_url:""

  });

  renderLegacyProductRows();

}


function removeLegacyProductRow(
  rowId
){

  legacyProductRows =
    legacyProductRows.filter(
      item=>
        item.row_id !==
        rowId
    );

  if(!legacyProductRows.length){
    addLegacyProductRow();
    return;
  }

  renderLegacyProductRows();
  renderLegacySummary();

}


function renderLegacyProductRows(){

  const box =
    document.getElementById(
      "legacyProductRows"
    );

  if(!box){
    return;
  }

  box.innerHTML =
    legacyProductRows
      .map(
        (item,index)=>`

<div class="legacy-item">

<div class="legacy-row-head">

<strong>
รายการที่ ${index + 1}
</strong>

<button
type="button"
class="legacy-remove"
onclick='removeLegacyProductRow(${JSON.stringify(item.row_id)})'>
ลบ
</button>

</div>

<div class="legacy-grid">

<div class="legacy-full">

<label class="legacy-label legacy-required">
ชื่อสินค้า
</label>

<input
type="text"
value="${legacyAttr(item.product_name)}"
oninput='updateLegacyProduct(${JSON.stringify(item.row_id)},"product_name",this.value)'
placeholder="ชื่อสินค้าที่สั่งซื้อ">

</div>

<div>

<label class="legacy-label">
ตัวละคร
</label>

<input
type="text"
value="${legacyAttr(item.character)}"
oninput='updateLegacyProduct(${JSON.stringify(item.row_id)},"character",this.value)'
placeholder="เช่น Flins">

</div>

<div>

<label class="legacy-label">
แบบ / ไซส์ / รายละเอียด
</label>

<input
type="text"
value="${legacyAttr(item.option_text)}"
oninput='updateLegacyProduct(${JSON.stringify(item.row_id)},"option_text",this.value)'
placeholder="เช่น ไซส์ L / แบบ A">

</div>

<div>

<label class="legacy-label legacy-required">
จำนวน
</label>

<input
type="number"
min="1"
step="1"
value="${Number(item.quantity || 1)}"
oninput='updateLegacyProduct(${JSON.stringify(item.row_id)},"quantity",this.value)'>

</div>

<div>

<label class="legacy-label legacy-required">
ราคาต่อชิ้น
</label>

<input
type="number"
min="0"
step="0.01"
value="${Number(item.unit_price || 0)}"
oninput='updateLegacyProduct(${JSON.stringify(item.row_id)},"unit_price",this.value)'>

</div>

<div class="legacy-full">

<label class="legacy-label">
รูปสินค้า
</label>

<input
type="file"
accept="image/jpeg,image/png,image/webp"
onchange='selectLegacyProductImage(${JSON.stringify(item.row_id)},this)'>

${
  item.preview_url
    ? `<img class="legacy-image-preview" src="${legacyAttr(item.preview_url)}" alt="ตัวอย่างรูปสินค้า">`
    : `<img class="legacy-image-preview hidden" alt="ตัวอย่างรูปสินค้า">`
}

</div>

</div>

</div>

`
      )
      .join("");

}


function updateLegacyProduct(
  rowId,
  field,
  value
){

  const row =
    legacyProductRows.find(
      item=>
        item.row_id ===
        rowId
    );

  if(!row){
    return;
  }

  if(
    field === "quantity"
  ){

    row[field] =
      Math.max(
        1,
        Math.floor(
          Number(value || 1)
        )
      );

  }else if(
    field === "unit_price"
  ){

    row[field] =
      Math.max(
        0,
        Number(value || 0)
      );

  }else{

    row[field] =
      value;

  }

  renderLegacySummary();

}


async function selectLegacyProductImage(
  rowId,
  input
){

  const file =
    input.files &&
    input.files[0];

  if(!file){
    return;
  }

  try{

    validateLegacyImage(file);

    const row =
      legacyProductRows.find(
        item=>
          item.row_id ===
          rowId
      );

    if(!row){
      return;
    }

    row.image_base64 =
      await legacyFileToBase64(
        file
      );

    row.image_name =
      file.name;

    if(row.preview_url){

      URL.revokeObjectURL(
        row.preview_url
      );

    }

    row.preview_url =
      URL.createObjectURL(
        file
      );

    renderLegacyProductRows();

  }catch(error){

    input.value = "";

    setLegacyMessage(
      error.message ||
      String(error),
      "error"
    );

  }

}


function addLegacyGiftRow(){

  legacyGiftRows.push({

    row_id:
      "LG" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2,7),

    gift_name:"",
    character_name:"",
    image_base64:"",
    image_name:"",
    preview_url:""

  });

  renderLegacyGiftRows();

}


function removeLegacyGiftRow(
  rowId
){

  legacyGiftRows =
    legacyGiftRows.filter(
      item=>
        item.row_id !==
        rowId
    );

  renderLegacyGiftRows();

}


function renderLegacyGiftRows(){

  const box =
    document.getElementById(
      "legacyGiftRows"
    );

  if(!box){
    return;
  }

  if(!legacyGiftRows.length){

    box.innerHTML = `

<div class="legacy-empty">
ยังไม่ได้เพิ่มของแถม
</div>

`;

    return;

  }

  box.innerHTML =
    legacyGiftRows
      .map(
        (item,index)=>`

<div class="legacy-item">

<div class="legacy-row-head">

<strong>
ของแถมที่ ${index + 1}
</strong>

<button
type="button"
class="legacy-remove"
onclick='removeLegacyGiftRow(${JSON.stringify(item.row_id)})'>
ลบ
</button>

</div>

<div class="legacy-grid">

<div>

<label class="legacy-label legacy-required">
ชื่อของแถม
</label>

<input
type="text"
value="${legacyAttr(item.gift_name)}"
oninput='updateLegacyGift(${JSON.stringify(item.row_id)},"gift_name",this.value)'
placeholder="ชื่อของแถม">

</div>

<div>

<label class="legacy-label">
ตัวละคร
</label>

<input
type="text"
value="${legacyAttr(item.character_name)}"
oninput='updateLegacyGift(${JSON.stringify(item.row_id)},"character_name",this.value)'
placeholder="ตัวละครของแถม">

</div>

<div class="legacy-full">

<label class="legacy-label">
รูปของแถม
</label>

<input
type="file"
accept="image/jpeg,image/png,image/webp"
onchange='selectLegacyGiftImage(${JSON.stringify(item.row_id)},this)'>

${
  item.preview_url
    ? `<img class="legacy-image-preview" src="${legacyAttr(item.preview_url)}" alt="ตัวอย่างรูปของแถม">`
    : `<img class="legacy-image-preview hidden" alt="ตัวอย่างรูปของแถม">`
}

</div>

</div>

</div>

`
      )
      .join("");

}


function updateLegacyGift(
  rowId,
  field,
  value
){

  const row =
    legacyGiftRows.find(
      item=>
        item.row_id ===
        rowId
    );

  if(!row){
    return;
  }

  row[field] =
    value;

}


async function selectLegacyGiftImage(
  rowId,
  input
){

  const file =
    input.files &&
    input.files[0];

  if(!file){
    return;
  }

  try{

    validateLegacyImage(file);

    const row =
      legacyGiftRows.find(
        item=>
          item.row_id ===
          rowId
      );

    if(!row){
      return;
    }

    row.image_base64 =
      await legacyFileToBase64(
        file
      );

    row.image_name =
      file.name;

    if(row.preview_url){

      URL.revokeObjectURL(
        row.preview_url
      );

    }

    row.preview_url =
      URL.createObjectURL(
        file
      );

    renderLegacyGiftRows();

  }catch(error){

    input.value = "";

    setLegacyMessage(
      error.message ||
      String(error),
      "error"
    );

  }

}


function toggleLegacyImportAmount(){

  const status =
    document.getElementById(
      "legacyImportFeeStatus"
    )?.value ||
    "included";

  const box =
    document.getElementById(
      "legacyImportAmountBox"
    );

  const input =
    document.getElementById(
      "legacyImportFee"
    );

  if(box){

    box.style.display =
      status === "included"
        ? "block"
        : "none";

  }

  if(
    status === "pending" &&
    input
  ){

    input.value = "0";

  }

  renderLegacySummary();

}


function renderLegacySummary(){

  const box =
    document.getElementById(
      "legacySummary"
    );

  if(!box){
    return;
  }

  const subtotal =
    legacyProductRows.reduce(
      (sum,item)=>
        sum +
        (
          Number(
            item.quantity || 0
          ) *
          Number(
            item.unit_price || 0
          )
        ),
      0
    );

  const importStatus =
    document.getElementById(
      "legacyImportFeeStatus"
    )?.value ||
    "included";

  const importFee =
    importStatus === "included"
      ? Math.max(
          0,
          Number(
            document.getElementById(
              "legacyImportFee"
            )?.value ||
            0
          )
        )
      : 0;

  const domesticFee =
    Math.max(
      0,
      Number(
        document.getElementById(
          "legacyDomesticShippingFee"
        )?.value ||
        0
      )
    );

  const total =
    subtotal +
    importFee +
    domesticFee;

  box.innerHTML = `

<div class="legacy-summary-row">
<span>สินค้า</span>
<strong>
${legacyProductRows.length.toLocaleString("th-TH")} รายการ
</strong>
</div>

<div class="legacy-summary-row">
<span>จำนวนรวม</span>
<strong>
${legacyProductRows.reduce(
  (sum,item)=>
    sum +
    Number(item.quantity || 0),
  0
).toLocaleString("th-TH")} ชิ้น
</strong>
</div>

<div class="legacy-summary-row">
<span>ยอดสินค้า</span>
<strong>
฿${subtotal.toLocaleString("th-TH")}
</strong>
</div>

<div class="legacy-summary-row">
<span>ค่านำเข้า</span>
<strong>
${
  importStatus === "pending"
    ? "รอคำนวณ"
    : "฿" +
      importFee.toLocaleString("th-TH")
}
</strong>
</div>

<div class="legacy-summary-row">
<span>ค่าส่งในไทย</span>
<strong>
฿${domesticFee.toLocaleString("th-TH")}
</strong>
</div>

<div class="legacy-summary-row">
<span>ของแถม</span>
<strong>
${legacyGiftRows.length.toLocaleString("th-TH")} ชิ้น
</strong>
</div>

<div class="legacy-summary-row legacy-summary-total">
<span>ยอดรวม</span>
<strong>
฿${total.toLocaleString("th-TH")}
</strong>
</div>

`;

}


function collectLegacyOrderPayload(){

  const customerName =
    document.getElementById(
      "legacyCustomerName"
    )
      .value
      .trim();

  const preorderRound =
    document.getElementById(
      "legacyPreorderRound"
    )
      .value
      .trim();

  if(!customerName){

    throw new Error(
      "กรุณากรอกชื่อแอคหรือชื่อลูกค้า"
    );

  }

  if(!preorderRound){

    throw new Error(
      "กรุณากรอกรอบพรีออเดอร์"
    );

  }

  if(!legacyProductRows.length){

    throw new Error(
      "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ"
    );

  }

  const products =
    legacyProductRows.map(
      (item,index)=>{

        const productName =
          String(
            item.product_name || ""
          ).trim();

        const quantity =
          Math.max(
            1,
            Math.floor(
              Number(
                item.quantity || 1
              )
            )
          );

        const unitPrice =
          Math.max(
            0,
            Number(
              item.unit_price || 0
            )
          );

        if(!productName){

          throw new Error(
            `กรุณากรอกชื่อสินค้ารายการที่ ${index + 1}`
          );

        }

        return {

          product_name:
            productName,

          character:
            String(
              item.character || ""
            ).trim(),

          option_text:
            String(
              item.option_text || ""
            ).trim(),

          quantity:
            quantity,

          unit_price:
            unitPrice,

          image_base64:
            item.image_base64 ||
            "",

          image_name:
            item.image_name ||
            ""

        };

      }
    );

  const gifts =
    legacyGiftRows.map(
      (item,index)=>{

        const giftName =
          String(
            item.gift_name || ""
          ).trim();

        if(!giftName){

          throw new Error(
            `กรุณากรอกชื่อของแถมรายการที่ ${index + 1}`
          );

        }

        return {

          gift_name:
            giftName,

          character_name:
            String(
              item.character_name || ""
            ).trim(),

          image_base64:
            item.image_base64 ||
            "",

          image_name:
            item.image_name ||
            ""

        };

      }
    );

  const importStatus =
    document.getElementById(
      "legacyImportFeeStatus"
    ).value;

  return {

    customer_name:
      customerName,

    email:
      document.getElementById(
        "legacyEmail"
      )
        .value
        .trim(),

    social:
      document.getElementById(
        "legacySocial"
      )
        .value
        .trim(),

    customer_id:
      legacySelectedCustomer
        ? legacySelectedCustomer.customer_id ||
          ""
        : "",

    preorder_round:
      preorderRound,

    status:
      document.getElementById(
        "legacyStatus"
      ).value,

    import_fee_status:
      importStatus,

    import_fee:
      importStatus === "included"
        ? Math.max(
            0,
            Number(
              document.getElementById(
                "legacyImportFee"
              ).value ||
              0
            )
          )
        : 0,

    domestic_shipping_fee:
      Math.max(
        0,
        Number(
          document.getElementById(
            "legacyDomesticShippingFee"
          ).value ||
          0
        )
      ),

    courier:
      document.getElementById(
        "legacyCourier"
      )
        .value
        .trim(),

    tracking_no:
      document.getElementById(
        "legacyTrackingNo"
      )
        .value
        .trim(),

    products:
      products,

    gifts:
      gifts

  };

}


async function saveLegacyOrder(){

  const button =
    document.getElementById(
      "legacySaveButton"
    );

  if(button.disabled){
    return;
  }

  try{

    const payload =
      collectLegacyOrderPayload();

    button.disabled = true;
    button.textContent =
      "กำลังบันทึก...";

    setLegacyMessage(
      "กำลังอัปโหลดรูปและบันทึกออเดอร์...",
      "success"
    );

    const result =
      await legacyPost(
        "adminLegacyOrder",
        payload
      );

    if(
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        result?.message ||
        "บันทึกออเดอร์ไม่สำเร็จ"
      );

    }

    setLegacyMessage(
      `บันทึกเรียบร้อย เลขออเดอร์ ${result.order_id}`,
      "success"
    );

    alert(
      "บันทึกออเดอร์เก่าเรียบร้อย\n" +
      result.order_id
    );

    resetLegacyOrderForm();
    await loadLegacyUnlinkedOrders();

  }catch(error){

    console.error(
      "saveLegacyOrder error:",
      error
    );

    setLegacyMessage(
      error.message ||
      String(error),
      "error"
    );

  }finally{

    button.disabled = false;
    button.textContent =
      "💾 บันทึกออเดอร์เก่า";

  }

}


async function loadLegacyUnlinkedOrders(){

  const box =
    document.getElementById(
      "legacyUnlinkedOrders"
    );

  if(!box){
    return;
  }

  box.innerHTML =
    "กำลังโหลด...";

  try{

    const result =
      await legacyGet(
        "adminLegacyUnlinkedOrders"
      );

    const orders =
      Array.isArray(result)
        ? result
        : Array.isArray(
            result.orders
          )
          ? result.orders
          : [];

    if(!orders.length){

      box.innerHTML = `

<div class="legacy-empty">
ไม่มีออเดอร์เก่าที่รอผูกบัญชี
</div>

`;

      return;

    }

    box.innerHTML =
      orders
        .map(
          order=>`

<div class="legacy-unlinked-row">

<div>

<strong>
${legacyHtml(order.order_id || "-")}
</strong>

<div class="legacy-unlinked-meta">

${legacyHtml(order.customer_name || "-")}

<br>

Social:
${legacyHtml(order.social || "-")}

<br>

รอบ:
${legacyHtml(order.preorder_round || "-")}

</div>

</div>

<button
type="button"
style="width:auto;"
onclick='openLegacyLinkPanel(${JSON.stringify(String(order.order_id || ""))})'>
🔗 ผูกบัญชี
</button>

</div>

`
        )
        .join("");

  }catch(error){

    console.error(
      "loadLegacyUnlinkedOrders error:",
      error
    );

    box.innerHTML = `

<div class="legacy-message error show">
${legacyHtml(
  error.message ||
  String(error)
)}
</div>

`;

  }

}


function openLegacyCustomerPickerForNewOrder(){

  const panel =
    document.getElementById(
      "legacyNewOrderCustomerPicker"
    );

  panel.style.display =
    panel.style.display === "none"
      ? "block"
      : "none";

}


function openLegacyLinkPanel(
  orderId
){

  legacyLinkTargetOrderId =
    String(orderId || "");

  legacySelectedCustomer =
    null;

  const panel =
    document.getElementById(
      "legacyExistingOrderLinkPanel"
    );

  panel.style.display =
    "block";

  document.getElementById(
    "legacyLinkOrderLabel"
  ).textContent =
    "ออเดอร์: " +
    legacyLinkTargetOrderId;

  document.getElementById(
    "legacyExistingSelectedCustomer"
  ).style.display =
    "none";

  document.getElementById(
    "legacyExistingCustomerResults"
  ).innerHTML = "";

  panel.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}


function closeLegacyLinkPanel(){

  legacyLinkTargetOrderId = "";

  const panel =
    document.getElementById(
      "legacyExistingOrderLinkPanel"
    );

  if(panel){
    panel.style.display = "none";
  }

}


async function searchLegacyCustomer(
  mode
){

  const keywordId =
    mode === "existing"
      ? "legacyExistingCustomerKeyword"
      : "legacyNewOrderCustomerKeyword";

  const resultId =
    mode === "existing"
      ? "legacyExistingCustomerResults"
      : "legacyNewOrderCustomerResults";

  const keyword =
    document.getElementById(
      keywordId
    )
      .value
      .trim();

  const box =
    document.getElementById(
      resultId
    );

  if(!keyword){

    box.innerHTML =
      "กรุณากรอกคำค้น";

    return;

  }

  box.innerHTML =
    "กำลังค้นหา...";

  try{

    const result =
      await legacyGet(
        "adminCustomerSearch",
        {
          keyword:
            keyword
        }
      );

    const customers =
      Array.isArray(result)
        ? result
        : Array.isArray(
            result.customers
          )
          ? result.customers
          : [];

    legacyCustomerSearchResults =
      customers;

    if(!customers.length){

      box.innerHTML = `

<div class="legacy-empty">
ไม่พบบัญชีลูกค้า
</div>

`;

      return;

    }

    box.innerHTML =
      customers
        .map(
          (customer,index)=>`

<div class="legacy-customer-result">

<div>

<strong>
${legacyHtml(
  customer.username ||
  customer.customer_name ||
  "-"
)}
</strong>

<div class="legacy-unlinked-meta">

${legacyHtml(customer.email || "-")}

<br>

${legacyHtml(
  customer.twitter ||
  customer.social ||
  "-"
)}

</div>

</div>

<button
type="button"
style="width:auto;"
onclick="selectLegacyCustomer(${index},${JSON.stringify(mode)})">
เลือก
</button>

</div>

`
        )
        .join("");

  }catch(error){

    box.innerHTML = `

<div class="legacy-message error show">
${legacyHtml(
  error.message ||
  String(error)
)}
</div>

`;

  }

}


function selectLegacyCustomer(
  index,
  mode
){

  const customer =
    legacyCustomerSearchResults[
      Number(index)
    ];

  if(!customer){
    return;
  }

  legacySelectedCustomer =
    customer;

  const boxId =
    mode === "existing"
      ? "legacyExistingSelectedCustomer"
      : "legacySelectedCustomer";

  const box =
    document.getElementById(
      boxId
    );

  box.style.display =
    "block";

  box.textContent =
    "เลือกแล้ว: " +
    (
      customer.username ||
      customer.customer_name ||
      customer.email ||
      customer.customer_id
    );

  if(mode === "new"){

    if(customer.email){

      document.getElementById(
        "legacyEmail"
      ).value =
        customer.email;

    }

    const social =
      customer.twitter ||
      customer.social ||
      "";

    if(social){

      document.getElementById(
        "legacySocial"
      ).value =
        social;

    }

  }

}


async function linkLegacyOrderToCustomer(){

  if(!legacyLinkTargetOrderId){

    alert(
      "ไม่พบเลขออเดอร์"
    );

    return;

  }

  if(
    !legacySelectedCustomer ||
    !legacySelectedCustomer.customer_id
  ){

    alert(
      "กรุณาเลือกบัญชีลูกค้า"
    );

    return;

  }

  const button =
    document.getElementById(
      "legacyLinkButton"
    );

  button.disabled = true;
  button.textContent =
    "กำลังผูก...";

  try{

    const result =
      await legacyPost(
        "adminLegacyLinkOrder",
        {

          order_id:
            legacyLinkTargetOrderId,

          customer_id:
            legacySelectedCustomer.customer_id,

          email:
            legacySelectedCustomer.email ||
            "",

          social:
            legacySelectedCustomer.twitter ||
            legacySelectedCustomer.social ||
            ""

        }
      );

    if(
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        "ผูกบัญชีไม่สำเร็จ"
      );

    }

    alert(
      "ผูกออเดอร์กับบัญชีเรียบร้อย"
    );

    closeLegacyLinkPanel();
    await loadLegacyUnlinkedOrders();

  }catch(error){

    alert(
      error.message ||
      String(error)
    );

  }finally{

    button.disabled = false;
    button.textContent =
      "ผูกบัญชี";

  }

}


function validateLegacyImage(
  file
){

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if(
    !allowed.includes(
      file.type
    )
  ){

    throw new Error(
      "รองรับเฉพาะรูป JPG, PNG หรือ WEBP"
    );

  }

  if(
    file.size >
    5 * 1024 * 1024
  ){

    throw new Error(
      "รูปแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB"
    );

  }

}


function legacyFileToBase64(
  file
){

  return new Promise(
    (resolve,reject)=>{

      const reader =
        new FileReader();

      reader.onload =
        ()=>resolve(
          reader.result
        );

      reader.onerror =
        ()=>reject(
          new Error(
            "อ่านไฟล์รูปไม่สำเร็จ"
          )
        );

      reader.readAsDataURL(
        file
      );

    }
  );

}


async function legacyGet(
  action,
  params
){

  const query =
    new URLSearchParams({
      action:
        action,
      ...(params || {})
    });

  const response =
    await fetch(
      API +
      "?" +
      query.toString()
    );

  const text =
    await response.text();

  if(!response.ok){

    throw new Error(
      "HTTP " +
      response.status +
      " (" +
      action +
      ")"
    );

  }

  try{

    return JSON.parse(text);

  }catch(error){

    throw new Error(
      "API ไม่ได้ส่ง JSON (" +
      action +
      ")"
    );

  }

}


async function legacyPost(
  action,
  payload
){

  const formData =
    new FormData();

  formData.append(
    "action",
    action
  );

  formData.append(
    "payload",
    JSON.stringify(
      payload || {}
    )
  );

  const response =
    await fetch(
      API,
      {
        method:"POST",
        body:formData
      }
    );

  const text =
    await response.text();

  if(!response.ok){

    throw new Error(
      "HTTP " +
      response.status +
      " (" +
      action +
      ")"
    );

  }

  try{

    return JSON.parse(text);

  }catch(error){

    throw new Error(
      "API ไม่ได้ส่ง JSON (" +
      action +
      ")"
    );

  }

}


function setLegacyMessage(
  message,
  type
){

  const box =
    document.getElementById(
      "legacyOrderMessage"
    );

  if(!box){
    return;
  }

  box.textContent =
    message || "";

  box.className =
    "legacy-message";

  if(message){

    box.classList.add(
      "show",
      type === "error"
        ? "error"
        : "success"
    );

  }

}


function legacyHtml(
  value
){

  return String(
    value ?? ""
  )
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


function legacyAttr(
  value
){

  return legacyHtml(
    value
  );

}
