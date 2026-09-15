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

รูปสินค้า:
- เลือกจากเครื่องได้
- Preview ได้
- Browser resize/compress ก่อนส่ง
- Backend อัปโหลดเข้า Google Drive
- บันทึก URL ลง DMInvoiceItems.image_url

=========================================
*/

const DMInvoiceManager = {

  type:
    "product",

  items:
    [],

  importIncluded:
    "included",

  crateType:
    "no_crate",

  shippingType:
    "free",

  importFee:
    0,

  crateFee:
    0,

  domesticShippingFee:
    0,

  createRequestId:
    "",

  creating:
    false

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

  DMInvoiceManager.items =
    [];

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

  DMInvoiceManager.createRequestId =
    "";

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

    product_name:
      "",

    character_name:
      "",

    quantity:
      1,

    unit_price:
      0,

    image_url:
      "",

    image_base64:
      "",

    image_name:
      "",

    image_mime_type:
      ""

  });


  renderDMInvoiceItems();


  requestAnimationFrame(
    () => {

      const input =
        document.getElementById(
          "dmProductName_" +
          index
        );


      if(input){

        input.focus();

        try{

          const length =
            input.value.length;

          input.setSelectionRange(
            length,
            length
          );

        }catch(error){

          // ignore

        }

      }

    }
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

          const hasImage =
            !!String(
              item.image_base64 ||
              item.image_url ||
              ""
            ).trim();


          const previewSrc =
            item.image_base64
              ? item.image_base64
              : item.image_url
                ? item.image_url
                : "";


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

    <!-- PRODUCT NAME -->

    <div>

      <label>
        ชื่อสินค้า
      </label>

      <input
        id="dmProductName_${index}"
        data-dm-field="product_name"
        data-dm-index="${index}"
        type="text"
        value="${dmInvoiceEsc(item.product_name)}"
        placeholder="เช่น Acrylic Stand"
      >

    </div>


    <!-- CHARACTER -->

    <div>

      <label>
        ตัวละคร
      </label>

      <input
        id="dmCharacterName_${index}"
        data-dm-field="character_name"
        data-dm-index="${index}"
        type="text"
        value="${dmInvoiceEsc(item.character_name)}"
        placeholder="ถ้ามี"
      >

    </div>


    <!-- QUANTITY + PRICE -->

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
          id="dmQuantity_${index}"
          data-dm-field="quantity"
          data-dm-index="${index}"
          type="number"
          min="1"
          step="1"
          value="${Number(item.quantity || 1)}"
        >

      </div>


      <div>

        <label>
          ราคา/ชิ้น
        </label>

        <input
          id="dmUnitPrice_${index}"
          data-dm-field="unit_price"
          data-dm-index="${index}"
          type="number"
          min="0"
          step="0.01"
          value="${Number(item.unit_price || 0)}"
        >

      </div>

    </div>


    <!-- IMAGE -->

    <div>

      <label>
        รูปสินค้า
      </label>


      <input
        id="dmImageFile_${index}"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        data-dm-image-index="${index}"
        onchange="handleDMInvoiceImage(this)"
        style="
          width:100%;
          padding:10px;
          border:1px dashed #93c5fd;
          border-radius:10px;
          background:#f8fcff;
        "
      >


      <div
        style="
          color:#64748b;
          font-size:12px;
          margin-top:6px;
          line-height:1.6;
        "
      >
        เลือกรูปจากเครื่องได้เลย
        ระบบจะย่อรูปและอัปโหลดเข้า Google Drive อัตโนมัติ
      </div>


      <div
        id="dmImagePreviewBox_${index}"
        style="
          margin-top:10px;
          ${hasImage ? "" : "display:none;"}
        "
      >

        <div
          style="
            position:relative;
            display:inline-block;
          "
        >

          <img
            id="dmImagePreview_${index}"
            src="${dmInvoiceEsc(previewSrc)}"
            alt="รูปสินค้า"
            style="
              display:block;
              width:180px;
              max-width:100%;
              max-height:240px;
              object-fit:contain;
              border-radius:12px;
              border:1px solid #dbeafe;
              background:#f8fafc;
            "
          >


          <button
            type="button"
            onclick="removeDMInvoiceImage(${index})"
            style="
              position:absolute;
              top:6px;
              right:6px;
              width:auto;
              padding:4px 8px;
              border:0;
              border-radius:999px;
              background:#fff;
              color:#991b1b;
              box-shadow:0 2px 8px rgba(0,0,0,.12);
              cursor:pointer;
            "
          >
            ✕
          </button>

        </div>


        <div
          id="dmImageName_${index}"
          style="
            color:#64748b;
            font-size:12px;
            margin-top:6px;
          "
        >
          ${dmInvoiceEsc(item.image_name || "")}
        </div>

      </div>

    </div>


    <!-- ITEM TOTAL -->

    <div
      id="dmInvoiceItemTotal_${index}"
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


  /*
  =========================================
  EVENT DELEGATION
  =========================================
  */

  if(
    !container.dataset.dmEventsBound
  ){

    container.addEventListener(
      "input",
      function(event){

        const input =
          event.target.closest(
            "input[data-dm-field]"
          );


        if(!input){

          return;

        }


        const index =
          Number(
            input.dataset.dmIndex
          );


        const field =
          input.dataset.dmField;


        if(
          !Number.isInteger(index)
        ){

          return;

        }


        updateDMInvoiceItem(
          index,
          field,
          input.value
        );

      }
    );


    container.dataset.dmEventsBound =
      "true";

  }

}


/*
=========================================
HANDLE IMAGE
=========================================
*/

async function handleDMInvoiceImage(
  input
){

  const index =
    Number(
      input?.dataset?.dmImageIndex
    );


  if(
    !Number.isInteger(index)
  ){

    return;

  }


  const item =
    DMInvoiceManager.items[index];


  if(!item){

    return;

  }


  const file =
    input.files &&
    input.files[0];


  if(!file){

    return;

  }


  if(
    !file.type.startsWith(
      "image/"
    )
  ){

    alert(
      "กรุณาเลือกไฟล์รูปภาพ"
    );

    input.value = "";

    return;

  }


  /*
  จำกัดไฟล์ต้นฉบับไว้ 12 MB
  ก่อน resize
  */

  if(
    file.size >
    12 * 1024 * 1024
  ){

    alert(
      "ไฟล์รูปใหญ่เกินไปค่ะ กรุณาเลือกไฟล์ไม่เกิน 12 MB"
    );

    input.value = "";

    return;

  }


  try{

    /*
    แสดงสถานะก่อน
    */

    const previewBox =
      document.getElementById(
        "dmImagePreviewBox_" +
        index
      );


    const preview =
      document.getElementById(
        "dmImagePreview_" +
        index
      );


    const nameElement =
      document.getElementById(
        "dmImageName_" +
        index
      );


    if(previewBox){

      previewBox.style.display =
        "block";

    }


    if(nameElement){

      nameElement.textContent =
        "⏳ กำลังเตรียมรูป...";

    }


    const compressed =
      await compressDMInvoiceImage(
        file
      );


    item.image_base64 =
      compressed.base64;

    item.image_name =
      compressed.fileName;

    item.image_mime_type =
      compressed.mimeType;


    /*
    เก็บ URL เดิมไว้เฉพาะกรณี
    ไม่ได้อัปโหลดใหม่
    */

    if(preview){

      preview.src =
        compressed.base64;

      preview.style.display =
        "block";

    }


    if(nameElement){

      nameElement.textContent =
        "📷 " +
        compressed.fileName;

    }


  }catch(error){

    console.error(
      "handleDMInvoiceImage error:",
      error
    );


    item.image_base64 =
      "";

    item.image_name =
      "";

    item.image_mime_type =
      "";


    input.value =
      "";


    alert(
      error.message ||
      "ไม่สามารถเตรียมรูปสินค้าได้"
    );

  }

}


/*
=========================================
COMPRESS IMAGE
=========================================
*/

function compressDMInvoiceImage(
  file
){

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        function(){

          const source =
            String(
              reader.result || ""
            );


          const img =
            new Image();


          img.onload =
            function(){

              try{

                const maxSize =
                  1600;


                let width =
                  img.width;

                let height =
                  img.height;


                /*
                Resize ด้านยาวไม่เกิน 1600px
                */

                if(
                  width > maxSize ||
                  height > maxSize
                ){

                  if(
                    width >= height
                  ){

                    height =
                      Math.round(
                        height *
                        maxSize /
                        width
                      );

                    width =
                      maxSize;

                  }else{

                    width =
                      Math.round(
                        width *
                        maxSize /
                        height
                      );

                    height =
                      maxSize;

                  }

                }


                const canvas =
                  document.createElement(
                    "canvas"
                  );


                canvas.width =
                  width;

                canvas.height =
                  height;


                const ctx =
                  canvas.getContext(
                    "2d"
                  );


                if(!ctx){

                  reject(
                    new Error(
                      "ไม่สามารถเตรียมรูปสินค้าได้"
                    )
                  );

                  return;

                }


                ctx.drawImage(
                  img,
                  0,
                  0,
                  width,
                  height
                );


                /*
                ใช้ JPEG เพื่อให้ payload
                ไม่ใหญ่เกินไป
                */

                const outputMime =
                  "image/jpeg";


                const base64 =
                  canvas.toDataURL(
                    outputMime,
                    0.82
                  );


                const originalName =
                  String(
                    file.name ||
                    "product-image"
                  );


                const baseName =
                  originalName
                    .replace(
                      /\.[^/.]+$/,
                      ""
                    )
                    .replace(
                      /[^a-zA-Z0-9ก-๙_-]+/g,
                      "_"
                    )
                    .slice(
                      0,
                      80
                    );


                resolve({

                  base64:
                    base64,

                  mimeType:
                    outputMime,

                  fileName:
                    (
                      baseName ||
                      "product-image"
                    ) +
                    ".jpg"

                });


              }catch(error){

                reject(
                  error
                );

              }

            };


          img.onerror =
            function(){

              reject(
                new Error(
                  "ไม่สามารถอ่านรูปสินค้าได้"
                )
              );

            };


          img.src =
            source;

        };


      reader.onerror =
        function(){

          reject(
            new Error(
              "ไม่สามารถอ่านไฟล์รูปสินค้าได้"
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/*
=========================================
REMOVE IMAGE
=========================================
*/

function removeDMInvoiceImage(
  index
){

  const item =
    DMInvoiceManager.items[index];


  if(!item){

    return;

  }


  item.image_url =
    "";

  item.image_base64 =
    "";

  item.image_name =
    "";

  item.image_mime_type =
    "";


  renderDMInvoiceItems();

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


  /*
  TEXT
  */

  if(
    field === "product_name" ||
    field === "character_name"
  ){

    item[field] =
      String(
        value ?? ""
      );

  }


  /*
  QUANTITY
  */

  else if(
    field === "quantity"
  ){

    const raw =
      String(
        value ?? ""
      );


    if(
      raw === ""
    ){

      item.quantity =
        0;

    }else{

      const parsed =
        Number(
          raw
        );


      item.quantity =
        Number.isFinite(
          parsed
        )
          ? Math.max(
              0,
              parsed
            )
          : 0;

    }

  }


  /*
  UNIT PRICE
  */

  else if(
    field === "unit_price"
  ){

    const raw =
      String(
        value ?? ""
      );


    if(
      raw === ""
    ){

      item.unit_price =
        0;

    }else{

      const parsed =
        Number(
          raw
        );


      item.unit_price =
        Number.isFinite(
          parsed
        )
          ? Math.max(
              0,
              parsed
            )
          : 0;

    }

  }


  /*
  UPDATE ITEM TOTAL ONLY

  ห้าม renderDMInvoiceItems()
  เพราะจะทำให้ input กระโดด
  */

  const itemTotalElement =
    document.getElementById(
      "dmInvoiceItemTotal_" +
      index
    );


  if(itemTotalElement){

    const total =
      Number(
        item.quantity || 0
      ) *
      Number(
        item.unit_price || 0
      );


    itemTotalElement.textContent =
      "รวมรายการ: " +
      dmInvoiceMoney(
        total
      ) +
      " บาท";

  }


  updateDMInvoiceTotals();

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
      value === "not_included"
        ? "block"
        : "none";

  }


  updateDMInvoiceTotals();

}


/*
=========================================
CALCULATE PRODUCT SUBTOTAL
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


/*
=========================================
IMPORT FEE
=========================================
*/

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


/*
=========================================
CRATE FEE
=========================================
*/

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


/*
=========================================
SHIPPING FEE
=========================================
*/

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
PRODUCT TOTAL
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
CREATE REQUEST ID
=========================================
*/

function getDMInvoiceCreateRequestId(){

  if(DMInvoiceManager.createRequestId){

    return DMInvoiceManager.createRequestId;

  }


  let requestId = "";


  if(
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ){

    requestId =
      "DMREQ-" +
      window.crypto.randomUUID();

  }else{

    requestId =
      "DMREQ-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 12);

  }


  DMInvoiceManager.createRequestId =
    requestId;


  return requestId;

}


/*
=========================================
CREATE REQUEST / RECOVERY
=========================================
*/
async function postCreateDMInvoice(
  payload,
  requestId
){

  const response =
    await fetch(
      API,
      {
        method:"POST",
        headers:{
          "Content-Type":
            "text/plain;charset=utf-8"
        },
        body:JSON.stringify({
          action:"createDMInvoice",
          data:{
            ...payload,
            request_id:requestId
          }
        })
      }
    );


  if(!response.ok){

    throw new Error(
      "HTTP " +
      response.status
    );

  }


  return await response.json();

}


async function recoverDMInvoiceByRequestId(
  requestId
){

  if(!requestId){

    return null;

  }


  try{

    const url =
      new URL(
        API
      );

    url.searchParams.set(
      "action",
      "dmInvoiceByRequestId"
    );

    url.searchParams.set(
      "request_id",
      requestId
    );

    /*
    cache buster เพื่อไม่ให้ browser/CDN
    คืนผล GET เก่าระหว่าง recovery
    */
    url.searchParams.set(
      "_",
      String(Date.now())
    );


    const response =
      await fetch(
        url.toString(),
        {
          method:"GET",
          cache:"no-store"
        }
      );


    if(!response.ok){

      console.warn(
        "DM INVOICE RECOVERY HTTP:",
        response.status
      );

      return null;

    }


    const result =
      await response.json();


    console.log(
      "DM INVOICE RECOVERY RESPONSE:",
      result
    );


    if(
      result &&
      result.success === true &&
      result.found === true &&
      result.invoice_id
    ){

      return result;

    }


    return null;


  }catch(error){

    console.warn(
      "recoverDMInvoiceByRequestId error:",
      error
    );

    return null;

  }

}


async function waitAndRecoverDMInvoice(
  requestId
){

  /*
  Apps Script / Sheets อาจใช้เวลาสั้น ๆ
  ก่อน GET ถัดไปเห็นแถวล่าสุด
  */
  const delays = [
    250,
    700,
    1400
  ];


  for(
    let index = 0;
    index < delays.length;
    index++
  ){

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          delays[index]
        )
    );


    const recovered =
      await recoverDMInvoiceByRequestId(
        requestId
      );


    if(recovered){

      return recovered;

    }

  }


  return null;

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


    const createRequestId =
      getDMInvoiceCreateRequestId();


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
  กำลังเตรียมข้อมูล Invoice...
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

      /*
      ตรวจข้อมูลก่อน
      */

      const rawItems =
        DMInvoiceManager.items;


      if(
        rawItems.length === 0
      ){

        throw new Error(
          "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ"
        );

      }


      if(
        rawItems.some(
          item =>
            !String(
              item.product_name || ""
            ).trim()
        )
      ){

        throw new Error(
          "กรุณากรอกชื่อสินค้าให้ครบทุกรายการ"
        );

      }


      if(
        rawItems.some(
          item =>
            !Number.isFinite(
              Number(item.quantity)
            ) ||
            Number(item.quantity) <= 0
        )
      ){

        throw new Error(
          "จำนวนสินค้าไม่ถูกต้อง"
        );

      }


      if(
        rawItems.some(
          item =>
            !Number.isFinite(
              Number(item.unit_price)
            ) ||
            Number(item.unit_price) < 0
        )
      ){

        throw new Error(
          "ราคาสินค้าไม่ถูกต้อง"
        );

      }


      /*
      =========================================
      UPLOAD IMAGE
      =========================================

      รูปจะถูกอัปโหลดทีละรายการก่อน
      แล้วเปลี่ยนเป็น image_url

      ดังนั้น Backend createDMInvoice()
      จะยังได้รับ image_url แบบเดิม
      และไม่ต้องเก็บ Base64 ลง Sheet
      =========================================
      */

      if(resultBox){

        resultBox.innerHTML = `

<div
  style="
    padding:14px;
    border-radius:12px;
    background:#eff6ff;
  "
>
  ⏳ กำลังอัปโหลดรูปสินค้า...
</div>

`;

      }


      for(
        let i = 0;
        i < rawItems.length;
        i++
      ){

        const item =
          rawItems[i];


        if(
          item.image_base64
        ){

          if(resultBox){

            resultBox.innerHTML = `

<div
  style="
    padding:14px;
    border-radius:12px;
    background:#eff6ff;
  "
>
  ⏳ กำลังอัปโหลดรูปสินค้า
  ${i + 1}/${rawItems.length}...
</div>

`;

          }


          const uploadResponse =
            await uploadDMInvoiceImage(
              item
            );


          if(
            !uploadResponse ||
            uploadResponse.success !== true
          ){

            throw new Error(
              uploadResponse?.error ||
              "ไม่สามารถอัปโหลดรูปสินค้า รายการที่ " +
              (i + 1)
            );

          }


          item.image_url =
            String(
              uploadResponse.url ||
              ""
            ).trim();


          /*
          หลังอัปโหลดสำเร็จ
          ไม่ต้องส่ง Base64 ต่อไป
          */

          item.image_base64 =
            "";

        }

      }


      const items =
        rawItems
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

        items:
          [],

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

    if(resultBox){

      resultBox.innerHTML = `

<div
  style="
    padding:14px;
    border-radius:12px;
    background:#eff6ff;
  "
>
  ⏳ กำลังสร้าง Invoice...
</div>

`;

    }


    let result = null;
    let createError = null;


    try{

      result =
        await postCreateDMInvoice(
          payload,
          createRequestId
        );


      console.log(
        "CREATE DM INVOICE RESPONSE:",
        result
      );


    }catch(error){

      createError =
        error;

      console.warn(
        "CREATE DM INVOICE POST ERROR — TRY RECOVERY:",
        error
      );

    }


    /*
    ถ้า POST ตอบกลับผิดรูป เช่น
    {status:"success", message:"Rinka Shop API Online"}
    หรือเกิด HTTP / network error
    ให้เช็ก request_id ก่อนสรุปว่า fail
    */
    if(
      !result ||
      result.success !== true ||
      !result.invoice_id
    ){

      if(resultBox){

        resultBox.innerHTML = `

<div
  style="
    padding:14px;
    border-radius:12px;
    background:#eff6ff;
  "
>
  ⏳ กำลังตรวจสอบ Invoice ที่สร้าง...
</div>

`;

      }


      const recovered =
        await waitAndRecoverDMInvoice(
          createRequestId
        );


      if(recovered){

        result =
          recovered;

      }else{

        /*
        ยังไม่พบ request_id:
        retry create อีก 1 ครั้งด้วย request_id เดิม
        Backend idempotency จะกันการสร้างซ้ำ
        */
        console.warn(
          "DM INVOICE NOT FOUND — RETRY CREATE ONCE",
          createRequestId
        );


        try{

          const retryResult =
            await postCreateDMInvoice(
              payload,
              createRequestId
            );


          console.log(
            "CREATE DM INVOICE RETRY RESPONSE:",
            retryResult
          );


          if(
            retryResult &&
            retryResult.success === true &&
            retryResult.invoice_id
          ){

            result =
              retryResult;

          }else{

            const recoveredAfterRetry =
              await waitAndRecoverDMInvoice(
                createRequestId
              );


            if(recoveredAfterRetry){

              result =
                recoveredAfterRetry;

            }

          }


        }catch(retryError){

          console.warn(
            "CREATE DM INVOICE RETRY ERROR:",
            retryError
          );


          const recoveredAfterRetry =
            await waitAndRecoverDMInvoice(
              createRequestId
            );


          if(recoveredAfterRetry){

            result =
              recoveredAfterRetry;

          }else if(!createError){

            createError =
              retryError;

          }

        }

      }

    }


    if(
      !result ||
      result.success !== true ||
      !result.invoice_id
    ){

      throw new Error(
        result?.error ||
        createError?.message ||
        "สร้าง Invoice ไม่สำเร็จ"
      );

    }


    DMInvoiceManager.createRequestId =
      "";


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
UPLOAD IMAGE
=========================================
*/

async function uploadDMInvoiceImage(
  item
){

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
              "uploadDMInvoiceImage",

            data:{

              file_name:
                item.image_name ||
                "product-image.jpg",

              mime_type:
                item.image_mime_type ||
                "image/jpeg",

              base64:
                item.image_base64 || ""

            }

          })

      }
    );


  if(!response.ok){

    throw new Error(
      "HTTP " +
      response.status
    );

  }


  return await response.json();

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

แจ้ง Invoice สำหรับรายการที่สั่งทาง DM ค่ะ🩵

เลขที่ใบสั่งซื้อ:
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
