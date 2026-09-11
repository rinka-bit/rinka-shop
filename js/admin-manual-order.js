/*
=========================================
RINKA ADMIN — DM INVOICE MANAGER
=========================================

ใช้สำหรับสร้าง Invoice จากออเดอร์ทาง DM

ประเภท:
1. สั่งสินค้า
2. แจ้งค่าส่ง

Backend:
createDMInvoice(data)

หมายเหตุ:
- ยังไม่ตัด Stock
- ยังไม่สร้าง Order หลัก
- ยังไม่โหลด Catalog / Products API
- รูปสินค้าใช้ URL ก่อน
=========================================
*/


const DMInvoiceManager = {

  type: "product",

  items: [],

  importIncluded: "included",

  crateType: "no_crate",

  shippingType: "free",

  importFee: 0,

  crateFee: 0,

  domesticShippingFee: 0,

  creating: false

};


/*
=========================================
RENDER MANAGER
=========================================
*/

function renderManualOrderManager(){

  const root =
    document.getElementById(
      "manualOrderManager"
    );


  if(!root){

    console.error(
      "ไม่พบ #manualOrderManager"
    );

    return;

  }


  DMInvoiceManager.type =
    "product";


  DMInvoiceManager.items = [];


  DMInvoiceManager.importIncluded =
    "included";


  DMInvoiceManager.crateType =
    "no_crate";


  DMInvoiceManager.shippingType =
    "free";


  DMInvoiceManager.importFee =
    0;


  DMInvoiceManager.crateFee =
    0;


  DMInvoiceManager.domesticShippingFee =
    0;


  DMInvoiceManager.creating =
    false;


  root.innerHTML = `

<div
  class="card"
  style="
    padding:20px;
    margin-bottom:20px;
  "
>

  <h2 style="margin-top:0;">
    🧾 สร้าง DM Invoice
  </h2>

  <p
    style="
      color:#777;
      margin-top:4px;
    "
  >
    สร้าง Invoice สำหรับออเดอร์ที่คุยกับลูกค้าทาง DM
  </p>


  <!-- TYPE -->

  <div
    style="
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      margin:20px 0;
    "
  >

    <button
      type="button"
      id="dmInvoiceTypeProduct"
      onclick="selectDMInvoiceType('product')"
      style="
        width:auto;
        padding:10px 18px;
      "
    >
      🛍️ สั่งสินค้า
    </button>


    <button
      type="button"
      id="dmInvoiceTypeShipping"
      onclick="selectDMInvoiceType('shipping')"
      style="
        width:auto;
        padding:10px 18px;
      "
    >
      🚚 แจ้งค่าส่ง
    </button>

  </div>


  <!-- PRODUCT FORM -->

  <div
    id="dmInvoiceProductForm"
  >

    <div
      id="dmInvoiceItems"
    ></div>


    <button
      type="button"
      onclick="addDMInvoiceItem()"
      style="
        width:auto;
        margin:12px 0 20px;
      "
    >
      ＋ เพิ่มรายการสินค้า
    </button>


    <div
      style="
        border-top:1px solid #e5e7eb;
        padding-top:18px;
        margin-top:8px;
      "
    >

      <h3>
        ⚙️ เงื่อนไขการคิดเงิน
      </h3>


      <!-- IMPORT -->

      <div
        style="
          margin:14px 0;
        "
      >

        <div
          style="
            font-weight:600;
            margin-bottom:8px;
          "
        >
          ค่านำเข้า
        </div>


        <label
          style="
            display:block;
            margin:6px 0;
          "
        >

          <input
            type="radio"
            name="dmImportIncluded"
            value="included"
            checked
            onchange="setDMImportIncluded(this.value)"
          >

          รวมค่านำเข้าแล้ว

        </label>


        <label
          style="
            display:block;
            margin:6px 0;
          "
        >

          <input
            type="radio"
            name="dmImportIncluded"
            value="not_included"
            onchange="setDMImportIncluded(this.value)"
          >

          ยังไม่รวมค่านำเข้า

        </label>


        <div
          id="dmImportFeeBox"
          style="
            display:none;
            margin-top:10px;
          "
        >

          <label>
            ค่านำเข้า
          </label>

          <input
            id="dmImportFee"
            type="number"
            min="0"
            step="0.01"
            value="0"
            oninput="updateDMInvoiceTotals()"
            style="max-width:240px;"
          >

        </div>

      </div>


      <!-- CRATE -->

      <div
        style="
          margin:14px 0;
        "
      >

        <div
          style="
            font-weight:600;
            margin-bottom:8px;
          "
        >
          ตีลัง
        </div>


        <label
          style="
            display:block;
            margin:6px 0;
          "
        >

          <input
            type="radio"
            name="dmCrateType"
            value="no_crate"
            checked
            onchange="setDMCrateType(this.value)"
          >

          ไม่ตีลัง

        </label>


        <label
          style="
            display:block;
            margin:6px 0;
          "
        >

          <input
            type="radio"
            name="dmCrateType"
            value="crate"
            onchange="setDMCrateType(this.value)"
          >

          ตีลังไม้

        </label>


        <div
          id="dmCrateFeeBox"
          style="
            display:none;
            margin-top:10px;
          "
        >

          <label>
            ค่าตีลังไม้
          </label>

          <input
            id="dmCrateFee"
            type="number"
            min="0"
            step="0.01"
            value="0"
            oninput="updateDMInvoiceTotals()"
            style="max-width:240px;"
          >

        </div>

      </div>


      <!-- SHIPPING -->

      <div
        style="
          margin:14px 0;
        "
      >

        <div
          style="
            font-weight:600;
            margin-bottom:8px;
          "
        >
          ค่าส่งในไทย
        </div>


        <label
          style="
            display:block;
            margin:6px 0;
          "
        >

          <input
            type="radio"
            name="dmShippingType"
            value="free"
            checked
            onchange="setDMShippingType(this.value)"
          >

          ส่งฟรี

        </label>


        <label
          style="
            display:block;
            margin:6px 0;
          "
        >

          <input
            type="radio"
            name="dmShippingType"
            value="included"
            onchange="setDMShippingType(this.value)"
          >

          รวมส่งแล้ว

        </label>


        <label
          style="
            display:block;
            margin:6px 0;
          "
        >

          <input
            type="radio"
            name="dmShippingType"
            value="not_included"
            onchange="setDMShippingType(this.value)"
          >

          ยังไม่รวมส่ง

        </label>


        <div
          id="dmShippingFeeBox"
          style="
            display:none;
            margin-top:10px;
          "
        >

          <label>
            ค่าส่งในไทย
          </label>

          <input
            id="dmShippingFee"
            type="number"
            min="0"
            step="0.01"
            value="0"
            oninput="updateDMInvoiceTotals()"
            style="max-width:240px;"
          >

        </div>

      </div>

    </div>


    <!-- TOTAL -->

    <div
      id="dmInvoiceProductTotals"
      style="
        margin-top:20px;
        padding:18px;
        background:#f6fbff;
        border-radius:14px;
      "
    ></div>

  </div>


  <!-- SHIPPING FORM -->

  <div
    id="dmInvoiceShippingForm"
    style="
      display:none;
    "
  >

    <h3>
      🚚 แจ้งค่าส่ง
    </h3>


    <div
      style="
        display:grid;
        gap:12px;
        max-width:420px;
      "
    >

      <div>

        <label>
          ค่านำเข้า
        </label>

        <input
          id="dmShippingOnlyImportFee"
          type="number"
          min="0"
          step="0.01"
          value="0"
          oninput="updateDMShippingOnlyTotal()"
        >

      </div>


      <div>

        <label>
          ค่าตีลังไม้
        </label>

        <input
          id="dmShippingOnlyCrateFee"
          type="number"
          min="0"
          step="0.01"
          value="0"
          oninput="updateDMShippingOnlyTotal()"
        >

      </div>


      <div>

        <label>
          ค่าส่งในไทย
        </label>

        <input
          id="dmShippingOnlyDomesticFee"
          type="number"
          min="0"
          step="0.01"
          value="0"
          oninput="updateDMShippingOnlyTotal()"
        >

      </div>

    </div>


    <div
      id="dmInvoiceShippingOnlyTotal"
      style="
        margin-top:20px;
        padding:18px;
        background:#f6fbff;
        border-radius:14px;
      "
    ></div>

  </div>


  <!-- ACTION -->

  <div
    style="
      margin-top:24px;
      padding-top:20px;
      border-top:1px solid #e5e7eb;
    "
  >

    <button
      type="button"
      id="dmCreateInvoiceButton"
      onclick="submitDMInvoice()"
    >
      🧾 สร้าง Invoice
    </button>


    <div
      id="dmInvoiceResult"
      style="
        margin-top:16px;
      "
    ></div>

  </div>

</div>

`;


  addDMInvoiceItem();


  updateDMInvoiceTotals();

  updateDMShippingOnlyTotal();

}


/*
=========================================
SELECT TYPE
=========================================
*/

function selectDMInvoiceType(
  type
){

  DMInvoiceManager.type =
    type;


  const productForm =
    document.getElementById(
      "dmInvoiceProductForm"
    );


  const shippingForm =
    document.getElementById(
      "dmInvoiceShippingForm"
    );


  if(productForm){

    productForm.style.display =
      type === "product"
        ? "block"
        : "none";

  }


  if(shippingForm){

    shippingForm.style.display =
      type === "shipping"
        ? "block"
        : "none";

  }


  const productButton =
    document.getElementById(
      "dmInvoiceTypeProduct"
    );


  const shippingButton =
    document.getElementById(
      "dmInvoiceTypeShipping"
    );


  if(productButton){

    productButton.style.opacity =
      type === "product"
        ? "1"
        : "0.55";

  }


  if(shippingButton){

    shippingButton.style.opacity =
      type === "shipping"
        ? "1"
        : "0.55";

  }


  updateDMInvoiceTotals();

  updateDMShippingOnlyTotal();

}


/*
=========================================
ADD ITEM
=========================================
*/

function addDMInvoiceItem(){

  const index =
    DMInvoiceManager.items.length;


  DMInvoiceManager.items.push({

    product_name:"",

    character_name:"",

    quantity:1,

    unit_price:0,

    image_url:""

  });


  renderDMInvoiceItems();


  setTimeout(
    ()=>{

      const input =
        document.getElementById(
          "dmProductName_" +
          index
        );


      input?.focus();

    },
    50
  );

}


/*
=========================================
REMOVE ITEM
=========================================
*/

function removeDMInvoiceItem(
  index
){

  if(
    DMInvoiceManager.items.length <= 1
  ){

    alert(
      "ต้องมีรายการสินค้าอย่างน้อย 1 รายการ"
    );

    return;

  }


  DMInvoiceManager.items.splice(
    index,
    1
  );


  renderDMInvoiceItems();

  updateDMInvoiceTotals();

}


/*
=========================================
RENDER ITEMS
=========================================
*/

function renderDMInvoiceItems(){

  const container =
    document.getElementById(
      "dmInvoiceItems"
    );


  if(!container){

    return;

  }


  container.innerHTML =
    DMInvoiceManager.items
      .map(
        (
          item,
          index
        ) => {

          return `

<div
  class="card"
  style="
    padding:16px;
    margin-bottom:12px;
    border:1px solid #e5e7eb;
  "
>

  <div
    style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:10px;
      margin-bottom:14px;
    "
  >

    <strong>
      รายการที่ ${index + 1}
    </strong>


    ${
      DMInvoiceManager.items.length > 1
        ? `
          <button
            type="button"
            onclick="removeDMInvoiceItem(${index})"
            style="
              width:auto;
              padding:5px 10px;
              font-size:13px;
            "
          >
            ลบ
          </button>
        `
        : ""
    }

  </div>


  <div
    style="
      display:grid;
      gap:12px;
    "
  >

    <div>

      <label>
        ชื่อสินค้า
      </label>

      <input
        id="dmProductName_${index}"
        type="text"
        value="${dmInvoiceEsc(item.product_name)}"
        placeholder="เช่น Acrylic Stand"
        oninput="updateDMInvoiceItem(${index}, 'product_name', this.value)"
      >

    </div>


    <div>

      <label>
        ตัวละคร
      </label>

      <input
        type="text"
        value="${dmInvoiceEsc(item.character_name)}"
        placeholder="ถ้ามี"
        oninput="updateDMInvoiceItem(${index}, 'character_name', this.value)"
      >

    </div>


    <div
      style="
        display:grid;
        grid-template-columns:
          minmax(100px,1fr)
          minmax(140px,1fr);
        gap:12px;
      "
    >

      <div>

        <label>
          จำนวน
        </label>

        <input
          type="number"
          min="1"
          step="1"
          value="${Number(item.quantity || 1)}"
          oninput="updateDMInvoiceItem(${index}, 'quantity', this.value)"
        >

      </div>


      <div>

        <label>
          ราคา/ชิ้น
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value="${Number(item.unit_price || 0)}"
          oninput="updateDMInvoiceItem(${index}, 'unit_price', this.value)"
        >

      </div>

    </div>


    <div>

      <label>
        รูปสินค้า URL
      </label>

      <input
        type="url"
        value="${dmInvoiceEsc(item.image_url)}"
        placeholder="https://..."
        oninput="updateDMInvoiceItem(${index}, 'image_url', this.value)"
      >

      <small
        style="
          display:block;
          color:#777;
          margin-top:4px;
        "
      >
        ตอนนี้ใส่ URL รูปได้ก่อน ระบบแนบไฟล์จากเครื่องจะเพิ่มในขั้นถัดไป
      </small>

    </div>


    <div
      style="
        text-align:right;
        font-weight:600;
      "
    >

      รวมรายการ:
      ${dmInvoiceMoney(
        Number(item.quantity || 0) *
        Number(item.unit_price || 0)
      )}

      บาท

    </div>

  </div>

</div>

`;

        }
      )
      .join("");

}


/*
=========================================
UPDATE ITEM
=========================================
*/

function updateDMInvoiceItem(
  index,
  field,
  value
){

  const item =
    DMInvoiceManager.items[
      index
    ];


  if(!item){

    return;

  }


  if(
    field === "quantity"
  ){

    item.quantity =
      Math.max(
        1,
        Number(value || 1)
      );

  }else if(
    field === "unit_price"
  ){

    item.unit_price =
      Math.max(
        0,
        Number(value || 0)
      );

  }else{

    item[field] =
      value;

  }


  updateDMInvoiceTotals();


  /*
  อัปเดตเฉพาะยอดของรายการ
  ไม่ render ใหม่ทั้งฟอร์ม
  */

  const cards =
    document.querySelectorAll(
      "#dmInvoiceItems .card"
    );


  const card =
    cards[index];


  if(card){

    const total =
      Number(item.quantity || 0) *
      Number(item.unit_price || 0);


    const totalElement =
      Array.from(
        card.querySelectorAll(
          "div"
        )
      ).find(
        element =>
          element.textContent
            .includes(
              "รวมรายการ:"
            )
      );


    if(totalElement){

      totalElement.innerHTML =
        `
        รวมรายการ:
        ${dmInvoiceMoney(total)}
        บาท
        `;

    }

  }

}


/*
=========================================
IMPORT
=========================================
*/

function setDMImportIncluded(
  value
){

  DMInvoiceManager.importIncluded =
    value;


  const box =
    document.getElementById(
      "dmImportFeeBox"
    );


  if(box){

    box.style.display =
      value === "not_included"
        ? "block"
        : "none";

  }


  updateDMInvoiceTotals();

}


/*
=========================================
CRATE
=========================================
*/

function setDMCrateType(
  value
){

  DMInvoiceManager.crateType =
    value;


  const box =
    document.getElementById(
      "dmCrateFeeBox"
    );


  if(box){

    box.style.display =
      value === "crate"
        ? "block"
        : "none";

  }


  updateDMInvoiceTotals();

}


/*
=========================================
SHIPPING
=========================================
*/

function setDMShippingType(
  value
){

  DMInvoiceManager.shippingType =
    value;


  const box =
    document.getElementById(
      "dmShippingFeeBox"
    );


  if(box){

    box.style.display =
      (
        value === "not_included"
      )
        ? "block"
        : "none";

  }


  updateDMInvoiceTotals();

}


/*
=========================================
CALCULATE PRODUCT TOTAL
=========================================
*/

function getDMProductSubtotal(){

  return DMInvoiceManager.items
    .reduce(
      (
        sum,
        item
      ) => {

        return (
          sum +
          (
            Number(
              item.quantity || 0
            ) *
            Number(
              item.unit_price || 0
            )
          )
        );

      },
      0
    );

}


function getDMProductImportFee(){

  if(
    DMInvoiceManager.importIncluded ===
    "included"
  ){

    return 0;

  }


  return Number(
    document.getElementById(
      "dmImportFee"
    )?.value || 0
  );

}


function getDMProductCrateFee(){

  if(
    DMInvoiceManager.crateType !==
    "crate"
  ){

    return 0;

  }


  return Number(
    document.getElementById(
      "dmCrateFee"
    )?.value || 0
  );

}


function getDMProductShippingFee(){

  if(
    DMInvoiceManager.shippingType ===
    "free"
  ){

    return 0;

  }


  if(
    DMInvoiceManager.shippingType ===
    "included"
  ){

    return 0;

  }


  return Number(
    document.getElementById(
      "dmShippingFee"
    )?.value || 0
  );

}


/*
=========================================
RENDER PRODUCT TOTAL
=========================================
*/

function updateDMInvoiceTotals(){

  const container =
    document.getElementById(
      "dmInvoiceProductTotals"
    );


  if(!container){

    return;

  }


  const subtotal =
    getDMProductSubtotal();


  const importFee =
    getDMProductImportFee();


  const crateFee =
    getDMProductCrateFee();


  const shippingFee =
    getDMProductShippingFee();


  const total =
    subtotal +
    importFee +
    crateFee +
    shippingFee;


  container.innerHTML = `

<div
  style="
    display:grid;
    gap:8px;
  "
>

  <div
    style="
      display:flex;
      justify-content:space-between;
      gap:20px;
    "
  >

    <span>
      ยอดสินค้า
    </span>

    <strong>
      ${dmInvoiceMoney(subtotal)}
      บาท
    </strong>

  </div>


  <div
    style="
      display:flex;
      justify-content:space-between;
      gap:20px;
    "
  >

    <span>
      ค่านำเข้า
    </span>

    <strong>
      ${dmInvoiceMoney(importFee)}
      บาท
    </strong>

  </div>


  <div
    style="
      display:flex;
      justify-content:space-between;
      gap:20px;
    "
  >

    <span>
      ค่าตีลัง
    </span>

    <strong>
      ${dmInvoiceMoney(crateFee)}
      บาท
    </strong>

  </div>


  <div
    style="
      display:flex;
      justify-content:space-between;
      gap:20px;
    "
  >

    <span>
      ค่าส่งในไทย
    </span>

    <strong>
      ${dmInvoiceMoney(shippingFee)}
      บาท
    </strong>

  </div>


  <div
    style="
      border-top:1px solid #dbeafe;
      margin-top:8px;
      padding-top:12px;
      display:flex;
      justify-content:space-between;
      gap:20px;
      font-size:18px;
    "
  >

    <strong>
      ยอดรวมทั้งหมด
    </strong>

    <strong>
      ${dmInvoiceMoney(total)}
      บาท
    </strong>

  </div>

</div>

`;

}


/*
=========================================
SHIPPING ONLY TOTAL
=========================================
*/

function updateDMShippingOnlyTotal(){

  const container =
    document.getElementById(
      "dmInvoiceShippingOnlyTotal"
    );


  if(!container){

    return;

  }


  const importFee =
    Number(
      document.getElementById(
        "dmShippingOnlyImportFee"
      )?.value || 0
    );


  const crateFee =
    Number(
      document.getElementById(
        "dmShippingOnlyCrateFee"
      )?.value || 0
    );


  const shippingFee =
    Number(
      document.getElementById(
        "dmShippingOnlyDomesticFee"
      )?.value || 0
    );


  const total =
    importFee +
    crateFee +
    shippingFee;


  container.innerHTML = `

<div
  style="
    display:flex;
    justify-content:space-between;
    gap:20px;
    font-size:18px;
  "
>

  <strong>
    ยอดรวมทั้งหมด
  </strong>

  <strong>
    ${dmInvoiceMoney(total)}
    บาท
  </strong>

</div>

`;

}


/*
=========================================
SUBMIT
=========================================
*/

async function submitDMInvoice(){

  if(
    DMInvoiceManager.creating
  ){

    return;

  }


  const resultBox =
    document.getElementById(
      "dmInvoiceResult"
    );


  const button =
    document.getElementById(
      "dmCreateInvoiceButton"
    );


  try{

    DMInvoiceManager.creating =
      true;


    if(button){

      button.disabled =
        true;

      button.textContent =
        "⏳ กำลังสร้าง Invoice...";

    }


    if(resultBox){

      resultBox.innerHTML = `

<div
  style="
    padding:14px;
    border-radius:12px;
    background:#eff6ff;
  "
>
  กำลังสร้าง Invoice...
</div>

`;

    }


    let payload;


    /*
    =========================================
    PRODUCT
    =========================================
    */

    if(
      DMInvoiceManager.type ===
      "product"
    ){

      const items =
        DMInvoiceManager.items
          .map(
            item => ({

              product_name:
                String(
                  item.product_name || ""
                ).trim(),

              character_name:
                String(
                  item.character_name || ""
                ).trim(),

              quantity:
                Number(
                  item.quantity || 0
                ),

              unit_price:
                Number(
                  item.unit_price || 0
                ),

              image_url:
                String(
                  item.image_url || ""
                ).trim()

            })
          );


      if(
        items.some(
          item =>
            !item.product_name
        )
      ){

        throw new Error(
          "กรุณากรอกชื่อสินค้าให้ครบทุกรายการ"
        );

      }


      if(
        items.some(
          item =>
            !Number.isFinite(
              item.quantity
            ) ||
            item.quantity <= 0
        )
      ){

        throw new Error(
          "จำนวนสินค้าไม่ถูกต้อง"
        );

      }


      if(
        items.some(
          item =>
            !Number.isFinite(
              item.unit_price
            ) ||
            item.unit_price < 0
        )
      ){

        throw new Error(
          "ราคาสินค้าไม่ถูกต้อง"
        );

      }


      payload = {

        invoice_type:
          "product",

        items:
          items,

        import_included:
          DMInvoiceManager.importIncluded,

        crate_type:
          DMInvoiceManager.crateType,

        shipping_type:
          DMInvoiceManager.shippingType,

        import_fee:
          getDMProductImportFee(),

        crate_fee:
          getDMProductCrateFee(),

        domestic_shipping_fee:
          getDMProductShippingFee()

      };

    }


    /*
    =========================================
    SHIPPING
    =========================================
    */

    else{

      const importFee =
        Number(
          document.getElementById(
            "dmShippingOnlyImportFee"
          )?.value || 0
        );


      const crateFee =
        Number(
          document.getElementById(
            "dmShippingOnlyCrateFee"
          )?.value || 0
        );


      const domesticShippingFee =
        Number(
          document.getElementById(
            "dmShippingOnlyDomesticFee"
          )?.value || 0
        );


      if(
        !Number.isFinite(
          importFee
        ) ||
        importFee < 0
      ){

        throw new Error(
          "ค่านำเข้าไม่ถูกต้อง"
        );

      }


      if(
        !Number.isFinite(
          crateFee
        ) ||
        crateFee < 0
      ){

        throw new Error(
          "ค่าตีลังไม่ถูกต้อง"
        );

      }


      if(
        !Number.isFinite(
          domesticShippingFee
        ) ||
        domesticShippingFee < 0
      ){

        throw new Error(
          "ค่าส่งในไทยไม่ถูกต้อง"
        );

      }


      payload = {

        invoice_type:
          "shipping",

        items:[],

        import_included:
          "not_included",

        crate_type:
          crateFee > 0
            ? "crate"
            : "no_crate",

        shipping_type:
          domesticShippingFee > 0
            ? "not_included"
            : "free",

        import_fee:
          importFee,

        crate_fee:
          crateFee,

        domestic_shipping_fee:
          domesticShippingFee

      };

    }


    /*
    =========================================
    API
    =========================================
    */

    const response =
      await fetch(
        API,
        {

          method:
            "POST",

          headers:{
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "createDMInvoice",

              data:
                payload

            })

        }
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
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        "สร้าง Invoice ไม่สำเร็จ"
      );

    }


    showDMInvoiceSuccess(
      result
    );


  }catch(error){

    console.error(
      "submitDMInvoice error:",
      error
    );


    if(resultBox){

      resultBox.innerHTML = `

<div
  style="
    padding:14px;
    border-radius:12px;
    background:#fef2f2;
    border:1px solid #fecaca;
    color:#991b1b;
  "
>

  ❌ สร้าง Invoice ไม่สำเร็จ

  <br><br>

  ${dmInvoiceEsc(
    error.message ||
    String(error)
  )}

</div>

`;

    }


  }finally{

    DMInvoiceManager.creating =
      false;


    if(button){

      button.disabled =
        false;

      button.textContent =
        "🧾 สร้าง Invoice";

    }

  }

}


/*
=========================================
SUCCESS
=========================================
*/

function showDMInvoiceSuccess(
  result
){

  const resultBox =
    document.getElementById(
      "dmInvoiceResult"
    );


  if(!resultBox){

    return;

  }


  const invoiceId =
    String(
      result.invoice_id || ""
    );


  if(!invoiceId){

    resultBox.innerHTML = `

<div
  style="
    padding:14px;
    background:#fef2f2;
    border-radius:12px;
  "
>
  ❌ สร้าง Invoice สำเร็จแต่ไม่พบ Invoice ID
</div>

`;

    return;

  }


  /*
  =========================================
  INVOICE URL
  =========================================

  ตอนนี้ใช้หน้า invoice.html
  =========================================
  */

  const invoiceUrl =
    new URL(
      "./invoice.html",
      window.location.href
    );


  invoiceUrl.searchParams.set(
    "id",
    invoiceId
  );


  const link =
    invoiceUrl.toString();


  const message =
    buildDMInvoiceCustomerMessage(
      result,
      link
    );


  resultBox.innerHTML = `

<div
  style="
    padding:18px;
    background:#f0fdf4;
    border:1px solid #bbf7d0;
    border-radius:14px;
  "
>

  <div
    style="
      font-size:18px;
      font-weight:700;
      margin-bottom:12px;
    "
  >
    ✅ สร้าง Invoice สำเร็จ
  </div>


  <div
    style="
      margin-bottom:10px;
    "
  >

    Invoice ID:

    <strong>
      ${dmInvoiceEsc(invoiceId)}
    </strong>

  </div>


  <label>
    Link สำหรับลูกค้า
  </label>


  <input
    id="dmInvoiceGeneratedLink"
    type="text"
    readonly
    value="${dmInvoiceEsc(link)}"
    style="
      width:100%;
      margin-top:6px;
    "
  >


  <div
    style="
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      margin-top:10px;
    "
  >

    <button
      type="button"
      onclick="copyDMInvoiceLink()"
      style="
        width:auto;
      "
    >
      🔗 Copy Link
    </button>


    <button
      type="button"
      onclick="copyDMInvoiceMessage()"
      style="
        width:auto;
      "
    >
      💬 Copy ข้อความส่งลูกค้า
    </button>


    <button
      type="button"
      onclick="window.open('${dmInvoiceEsc(link)}', '_blank')"
      style="
        width:auto;
      "
    >
      เปิด Invoice
    </button>

  </div>


  <textarea
    id="dmInvoiceGeneratedMessage"
    readonly
    style="
      width:100%;
      min-height:150px;
      margin-top:14px;
      box-sizing:border-box;
    "
  >${dmInvoiceEsc(message)}</textarea>

</div>

`;

}


/*
=========================================
MESSAGE
=========================================
*/

function buildDMInvoiceCustomerMessage(
  result,
  link
){

  const invoiceId =
    String(
      result.invoice_id || ""
    );


  const total =
    Number(
      result.total || 0
    );


  return `

สวัสดีค่ะ 🩵

แจ้ง Invoice สำหรับรายการที่สั่งทาง DM ค่ะ

เลข Invoice:
${invoiceId}

ยอดรวม:
${dmInvoiceMoney(total)} บาท

สามารถตรวจสอบรายละเอียดสินค้า
กรอกข้อมูลผู้รับ และชำระเงินได้ที่ลิงก์ด้านล่างค่ะ

${link}

ขอบคุณมากนะคะ ♡

`.trim();

}


/*
=========================================
COPY LINK
=========================================
*/

async function copyDMInvoiceLink(){

  const input =
    document.getElementById(
      "dmInvoiceGeneratedLink"
    );


  if(!input){

    return;

  }


  try{

    await navigator.clipboard.writeText(
      input.value
    );


    alert(
      "Copy Link แล้วค่ะ"
    );


  }catch(error){

    input.select();

    document.execCommand(
      "copy"
    );


    alert(
      "Copy Link แล้วค่ะ"
    );

  }

}


/*
=========================================
COPY MESSAGE
=========================================
*/

async function copyDMInvoiceMessage(){

  const textarea =
    document.getElementById(
      "dmInvoiceGeneratedMessage"
    );


  if(!textarea){

    return;

  }


  try{

    await navigator.clipboard.writeText(
      textarea.value
    );


    alert(
      "Copy ข้อความแล้วค่ะ"
    );


  }catch(error){

    textarea.select();

    document.execCommand(
      "copy"
    );


    alert(
      "Copy ข้อความแล้วค่ะ"
    );

  }

}


/*
=========================================
HELPERS
=========================================
*/

function dmInvoiceMoney(
  value
){

  return Number(
    value || 0
  ).toLocaleString(
    "th-TH",
    {
      minimumFractionDigits:2,
      maximumFractionDigits:2
    }
  );

}


function dmInvoiceEsc(
  value
){

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
