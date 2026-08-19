let adminProductOptions = [];

let selectedOptionProductId = "";

let editingOptionGroupName = "";

let optionDraftRows = [];


/*
=========================================================
OPTION MANAGER
=========================================================
*/

function renderOptionManager(){

  const box =
    document.getElementById(
      "optionManager"
    );


  if(!box){
    return;
  }


  const selectedProduct =
    adminProducts.find(
      product =>
        String(
          product.product_id
        ) ===
        String(
          selectedOptionProductId
        )
    );


  const selectedCollectionId =
    selectedProduct
      ? String(
          selectedProduct.collection_id ||
          ""
        )
      : "";


  box.innerHTML = `

<div class="card">

  <h2>
    🎛️ Product Options
  </h2>

  <p
  style="
  color:#64748b;
  margin-top:-5px;
  "
  >
    เพิ่มหรือแก้ไขตัวเลือกหลายรายการ
    แล้วบันทึกทั้งหมดพร้อมกัน
  </p>


  <div class="product-form">

    <div>

      <label>
        Collection
      </label>

      <select
      id="optionCollectionSelect"
      onchange="handleOptionCollectionChange()"
      >

        <option value="">
          -- ทุก Collection --
        </option>

        ${
          adminCollections
            .map(
              collection => `

<option
value="${escapeHtml(
  collection.collection_id || ""
)}"
>

${escapeHtml(
  collection.name ||
  collection.collection_id ||
  "-"
)}

</option>

`
            )
            .join("")
        }

      </select>

    </div>


    <div>

      <label>
        สินค้า
      </label>

      <select
      id="optionProductSelect"
      onchange="handleOptionProductChange()"
      >
      </select>

    </div>

  </div>


  <div
  id="optionProductInfo"
  style="
  margin-top:14px;
  padding:12px 14px;
  border-radius:12px;
  background:#f8fafc;
  color:#475569;
  "
  >
    กรุณาเลือกสินค้า
  </div>

</div>


<div
class="card"
id="optionBatchEditor"
>

  <div
  style="
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  "
  >

    <h2
    style="margin:0;"
    >
      ✏️ จัดการกลุ่มตัวเลือก
    </h2>

    <button
    type="button"
    onclick="startNewOptionGroup()"
    style="
    width:auto;
    "
    >
      ＋ กลุ่มใหม่
    </button>

  </div>


  <div
  id="optionBatchEmpty"
  style="
  margin-top:18px;
  color:#64748b;
  "
  >

    เลือกสินค้าก่อน
    แล้วเริ่มสร้างกลุ่มตัวเลือก

  </div>


  <div
  id="optionBatchForm"
  style="
  display:none;
  margin-top:18px;
  "
  >

    <div class="product-form">

      <div>

        <label>
          ชื่อกลุ่มตัวเลือก
        </label>

        <input
        id="o_group_name"
        placeholder="เช่น ตัวละคร / รูปแบบ / สี"
        >

      </div>


      <div>

        <label>
          ประเภทการเลือก
        </label>

        <select
        id="o_group_selection_type"
        >

          <option value="single">
            เลือกได้รายการเดียว
          </option>

          <option value="multiple">
            เลือกหลายรายการได้
          </option>

        </select>

      </div>

    </div>


    <div
    id="optionGroupEditNotice"
    style="
    display:none;
    margin-top:12px;
    padding:10px 12px;
    border-radius:10px;
    background:#fff7ed;
    color:#9a3412;
    "
    >

      กำลังแก้ไขกลุ่มเดิม
      ชื่อกลุ่มจะถูกล็อกไว้เพื่อป้องกันการสร้างกลุ่มซ้ำ

    </div>


    <hr
    style="
    margin:20px 0;
    border:none;
    border-top:1px solid #e2e8f0;
    "
    >


    <div
    style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    flex-wrap:wrap;
    "
    >

      <h3
      style="margin:0;"
      >
        ตัวเลือกในกลุ่ม
      </h3>

      <button
      type="button"
      onclick="addOptionDraftRow()"
      style="
      width:auto;
      "
      >
        ＋ เพิ่มตัวเลือก
      </button>

    </div>


    <div
    id="optionDraftList"
    style="
    margin-top:15px;
    "
    >
    </div>


    <div
    style="
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-top:20px;
    "
    >

      <button
      id="saveOptionBatchBtn"
      type="button"
      onclick="saveProductOptionsBatchFromAdmin()"
      >
        💾 บันทึกทั้งหมด
      </button>


      <button
      type="button"
      onclick="resetOptionBatchForm()"
      style="
      background:#64748b;
      "
      >
        ยกเลิก
      </button>

    </div>


    <div
    id="saveOptionBatchLoading"
    class="loading-text"
    style="
    display:none;
    margin-top:12px;
    "
    >
      ⏳ กำลังบันทึกตัวเลือก...
    </div>

  </div>

</div>


<div class="card">

  <div
  style="
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  "
  >

    <div>

      <h2
      style="
      margin:0 0 5px;
      "
      >
        📋 กลุ่มตัวเลือกของสินค้า
      </h2>

      <div
      id="currentOptionProduct"
      style="
      font-weight:700;
      color:#2563eb;
      "
      >
        ยังไม่ได้เลือกสินค้า
      </div>

    </div>


    <button
    type="button"
    onclick="backToProductManager()"
    style="
    width:auto;
    background:#64748b;
    "
    >
      ⬅ กลับไปหน้าสินค้า
    </button>

  </div>


  <div
  id="adminOptionList"
  style="
  margin-top:18px;
  "
  >
    กรุณาเลือกสินค้าก่อน
  </div>

</div>

`;


  /*
  =========================================
  PRESELECT COLLECTION
  =========================================
  */

  const collectionSelect =
    document.getElementById(
      "optionCollectionSelect"
    );


  if(collectionSelect){

    collectionSelect.value =
      selectedCollectionId;

  }


  refreshOptionProductSelect();


  /*
  ถ้ามี selected product
  มาจากปุ่ม Product Manager
  */

  if(
    selectedOptionProductId
  ){

    const productSelect =
      document.getElementById(
        "optionProductSelect"
      );


    if(productSelect){

      productSelect.value =
        selectedOptionProductId;

    }


    updateOptionProductInfo();


    loadAdminProductOptions();

  }

}


/*
=========================================================
COLLECTION / PRODUCT SELECT
=========================================================
*/

function refreshOptionProductSelect(){

  const select =
    document.getElementById(
      "optionProductSelect"
    );


  if(!select){
    return;
  }


  const collectionId =
    document
      .getElementById(
        "optionCollectionSelect"
      )
      ?.value ||
    "";


  const previousValue =
    selectedOptionProductId ||
    select.value;


  const products =
    adminProducts.filter(
      product => {

        if(!collectionId){
          return true;
        }


        return (
          String(
            product.collection_id ||
            ""
          ) ===
          String(
            collectionId
          )
        );

      }
    );


  select.innerHTML = `

<option value="">
-- เลือกสินค้า --
</option>

${
  products
    .map(
      product => `

<option
value="${escapeHtml(
  product.product_id
)}"
>

${escapeHtml(
  product.name || "-"
)}

(${escapeHtml(
  product.product_id
)})

</option>

`
    )
    .join("")
}

`;


  if(
    previousValue &&
    products.some(
      product =>
        String(
          product.product_id
        ) ===
        String(
          previousValue
        )
    )
  ){

    select.value =
      previousValue;

  }else{

    selectedOptionProductId =
      "";

  }

}


function handleOptionCollectionChange(){

  selectedOptionProductId =
    "";


  adminProductOptions = [];


  resetOptionBatchForm();


  refreshOptionProductSelect();


  updateOptionProductInfo();


  const list =
    document.getElementById(
      "adminOptionList"
    );


  if(list){

    list.innerHTML =
      "กรุณาเลือกสินค้าก่อน";

  }

}


async function handleOptionProductChange(){

  const select =
    document.getElementById(
      "optionProductSelect"
    );


  selectedOptionProductId =
    select?.value ||
    "";


  adminProductOptions = [];


  resetOptionBatchForm();


  updateOptionProductInfo();


  if(
    !selectedOptionProductId
  ){

    const box =
      document.getElementById(
        "adminOptionList"
      );


    if(box){

      box.innerHTML =
        "กรุณาเลือกสินค้าก่อน";

    }


    return;

  }


  await loadAdminProductOptions();

}


function getSelectedOptionProduct(){

  return (
    adminProducts.find(
      product =>
        String(
          product.product_id
        ) ===
        String(
          selectedOptionProductId
        )
    ) ||
    null
  );

}


function updateOptionProductInfo(){

  const product =
    getSelectedOptionProduct();


  const currentProduct =
    document.getElementById(
      "currentOptionProduct"
    );


  const info =
    document.getElementById(
      "optionProductInfo"
    );


  if(currentProduct){

    currentProduct.textContent =
      product
        ? (
            product.name ||
            product.product_id
          )
        : "ยังไม่ได้เลือกสินค้า";

  }


  if(!info){
    return;
  }


  if(!product){

    info.innerHTML =
      "กรุณาเลือกสินค้า";

    return;

  }


  const priceMode =
    String(
      product.price_mode ||
      "fixed"
    );


  info.innerHTML = `

<b>
${escapeHtml(
  product.name || "-"
)}
</b>

<br>

รูปแบบราคา:
<b>
${
  priceMode === "option"
    ? "หลายราคาตามตัวเลือก"
    : "ราคาเดียว"
}
</b>

${
  priceMode === "fixed"
    ? `
<br>
ราคาสินค้า:
<b>
${Number(
  product.price || 0
).toLocaleString("th-TH")}
บาท
</b>
`
    : `
<br>
<span style="color:#7c3aed;">
💡 กรุณากำหนดราคาที่แต่ละ Option
</span>
`
}

`;

}


/*
=========================================================
LOAD OPTIONS
=========================================================
*/

async function loadAdminProductOptions(){

  const box =
    document.getElementById(
      "adminOptionList"
    );


  if(
    !box ||
    !selectedOptionProductId
  ){

    return;

  }


  box.innerHTML =
    "⏳ กำลังโหลดตัวเลือก...";


  try{

    const response =
      await fetch(
        API +
        "?action=adminProductOptions" +
        "&product_id=" +
        encodeURIComponent(
          selectedOptionProductId
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
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        "โหลดตัวเลือกไม่สำเร็จ"
      );

    }


    adminProductOptions =
      Array.isArray(
        result.options
      )
        ? result.options
        : [];


    renderAdminProductOptions();


  }catch(error){

    console.error(
      "loadAdminProductOptions error:",
      error
    );


    box.textContent =
      error?.message ||
      "โหลดตัวเลือกไม่สำเร็จ";

  }

}


/*
=========================================================
RENDER EXISTING GROUPS
=========================================================
*/

function renderAdminProductOptions(){

  const box =
    document.getElementById(
      "adminOptionList"
    );


  if(!box){
    return;
  }


  if(
    !adminProductOptions.length
  ){

    box.innerHTML = `

<div
style="
padding:16px;
border-radius:12px;
background:#f8fafc;
color:#64748b;
"
>

สินค้านี้ยังไม่มีตัวเลือก

<br><br>

<button
type="button"
onclick="startNewOptionGroup()"
style="width:auto;"
>
＋ สร้างกลุ่มตัวเลือก
</button>

</div>

`;

    return;

  }


  const grouped = {};


  adminProductOptions.forEach(
    option => {

      const groupName =
        String(
          option.option_name ||
          "ไม่ระบุกลุ่ม"
        );


      if(
        !grouped[
          groupName
        ]
      ){

        grouped[
          groupName
        ] = [];

      }


      grouped[
        groupName
      ].push(
        option
      );

    }
  );


  let html = "";


  Object
    .entries(
      grouped
    )
    .forEach(
      (
        [
          groupName,
          options
        ]
      ) => {

        options.sort(
          (
            first,
            second
          ) =>
            Number(
              first.sort_order || 0
            )
            -
            Number(
              second.sort_order || 0
            )
        );


        const selectionType =
          options[0]
            ?.selection_type ||
          "single";


        html += `

<div
class="card"
style="
margin-bottom:16px;
border:1px solid #e2e8f0;
"
>

<div
style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:12px;
flex-wrap:wrap;
"
>

<div>

<h3
style="
margin:0 0 4px;
"
>
${escapeHtml(
  groupName
)}
</h3>

<div
style="
font-size:13px;
color:#64748b;
"
>

${
  selectionType === "multiple"
    ? "เลือกหลายรายการได้"
    : "เลือกได้รายการเดียว"
}

• ${options.length} ตัวเลือก

</div>

</div>


<div
style="
display:flex;
gap:8px;
flex-wrap:wrap;
"
>

<button
type="button"
onclick="
editOptionGroup(
  '${escapeJsString(
    groupName
  )}'
)
"
style="width:auto;"
>
✏️ แก้ไขกลุ่ม
</button>

<button
type="button"
onclick="
deleteOptionGroup(
  '${escapeJsString(
    groupName
  )}'
)
"
style="
width:auto;
background:#ef4444;
"
>
🗑️ ลบกลุ่ม
</button>

</div>

</div>


<div
style="
display:grid;
grid-template-columns:
repeat(
  auto-fill,
  minmax(180px,1fr)
);
gap:10px;
margin-top:14px;
"
>

${
  options
    .map(
      option => `

<div
style="
padding:12px;
border:1px solid #e2e8f0;
border-radius:12px;
background:#fff;
"
>

${
  option.image
    ? `

<img
src="${escapeHtml(
  option.image
)}"
alt=""
loading="lazy"
decoding="async"
style="
width:100%;
height:120px;
object-fit:cover;
border-radius:9px;
margin-bottom:9px;
"
>

`
    : ""
}

<b>
${escapeHtml(
  option.option_value || "-"
)}
</b>

<div
style="
margin-top:6px;
font-size:13px;
color:#64748b;
"
>

${
  getSelectedOptionProduct()
    ?.price_mode === "option"
    ? `
ราคา:
<b>
${Number(
  option.price ?? 0
).toLocaleString("th-TH")}
บาท
</b>
<br>
`
    : ""
}

Stock:
<b>
${Number(
  option.stock || 0
).toLocaleString("th-TH")}
</b>

</div>

</div>

`
    )
    .join("")
}

</div>

</div>

`;

      }
    );


  box.innerHTML =
    html;

}


/*
=========================================================
START / EDIT GROUP
=========================================================
*/

function startNewOptionGroup(){

  if(
    !selectedOptionProductId
  ){

    alert(
      "กรุณาเลือกสินค้าก่อน"
    );

    return;

  }


  editingOptionGroupName =
    "";


  optionDraftRows = [];


  const form =
    document.getElementById(
      "optionBatchForm"
    );


  const empty =
    document.getElementById(
      "optionBatchEmpty"
    );


  if(form){

    form.style.display =
      "block";

  }


  if(empty){

    empty.style.display =
      "none";

  }


  const nameInput =
    document.getElementById(
      "o_group_name"
    );


  if(nameInput){

    nameInput.value =
      "";

    nameInput.readOnly =
      false;

  }


  const selection =
    document.getElementById(
      "o_group_selection_type"
    );


  if(selection){

    selection.value =
      "single";

  }


  const notice =
    document.getElementById(
      "optionGroupEditNotice"
    );


  if(notice){

    notice.style.display =
      "none";

  }


  addOptionDraftRow();


  nameInput?.focus();

}


function editOptionGroup(
  groupName
){

  if(
    !selectedOptionProductId
  ){

    return;

  }


  syncOptionDraftFromDom();


  const options =
    adminProductOptions
      .filter(
        option =>
          String(
            option.option_name ||
            ""
          ) ===
          String(
            groupName
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          Number(
            first.sort_order || 0
          )
          -
          Number(
            second.sort_order || 0
          )
      );


  if(
    !options.length
  ){

    alert(
      "ไม่พบกลุ่มตัวเลือก"
    );

    return;

  }


  editingOptionGroupName =
    groupName;


  optionDraftRows =
    options.map(
      (
        option,
        index
      ) => ({

        option_id:
          option.option_id || "",

        option_value:
          option.option_value || "",

        price:
          option.price ?? 0,

        stock:
          Number(
            option.stock || 0
          ),

        image:
          option.image || "",

        image_base64:
          "",

        sort_order:
          Number(
            option.sort_order ??
            index
          )

      })
    );


  document
    .getElementById(
      "optionBatchForm"
    )
    .style.display =
    "block";


  document
    .getElementById(
      "optionBatchEmpty"
    )
    .style.display =
    "none";


  const nameInput =
    document.getElementById(
      "o_group_name"
    );


  nameInput.value =
    groupName;


  /*
  ตอนนี้ Backend Batch replace ด้วย
  product_id + option_name

  จึงยังไม่ให้ rename group เดิม
  */

  nameInput.readOnly =
    true;


  document
    .getElementById(
      "o_group_selection_type"
    )
    .value =
    options[0]
      .selection_type ||
    "single";


  document
    .getElementById(
      "optionGroupEditNotice"
    )
    .style.display =
    "block";


  renderOptionDraftRows();


  document
    .getElementById(
      "optionBatchEditor"
    )
    ?.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

}


/*
=========================================================
DRAFT ROWS
=========================================================
*/

function addOptionDraftRow(){

  syncOptionDraftFromDom();


  optionDraftRows.push({

    option_id:"",

    option_value:"",

    price:0,

    stock:0,

    image:"",

    image_base64:"",

    sort_order:
      optionDraftRows.length

  });


  renderOptionDraftRows();

}


function removeOptionDraftRow(
  index
){

  syncOptionDraftFromDom();


  if(
    optionDraftRows.length <= 1
  ){

    alert(
      "ต้องมีตัวเลือกอย่างน้อย 1 รายการ"
    );

    return;

  }


  optionDraftRows.splice(
    index,
    1
  );


  normalizeOptionDraftSort();


  renderOptionDraftRows();

}


function moveOptionDraftRow(
  index,
  direction
){

  syncOptionDraftFromDom();


  const target =
    index +
    direction;


  if(
    target < 0 ||
    target >=
      optionDraftRows.length
  ){

    return;

  }


  const temp =
    optionDraftRows[
      index
    ];


  optionDraftRows[
    index
  ] =
    optionDraftRows[
      target
    ];


  optionDraftRows[
    target
  ] =
    temp;


  normalizeOptionDraftSort();


  renderOptionDraftRows();

}


function normalizeOptionDraftSort(){

  optionDraftRows.forEach(
    (
      option,
      index
    ) => {

      option.sort_order =
        index;

    }
  );

}


function syncOptionDraftFromDom(){

  if(
    !optionDraftRows.length
  ){

    return;

  }


  optionDraftRows.forEach(
    (
      option,
      index
    ) => {

      const valueInput =
        document.getElementById(
          "option_value_" +
          index
        );


      const priceInput =
        document.getElementById(
          "option_price_" +
          index
        );


      const stockInput =
        document.getElementById(
          "option_stock_" +
          index
        );


      if(valueInput){

        option.option_value =
          valueInput.value;

      }


      if(priceInput){

        option.price =
          Number(
            priceInput.value ||
            0
          );

      }


      if(stockInput){

        option.stock =
          Number(
            stockInput.value ||
            0
          );

      }

    }
  );

}


function renderOptionDraftRows(){

  const box =
    document.getElementById(
      "optionDraftList"
    );


  if(!box){
    return;
  }


  const product =
    getSelectedOptionProduct();


  const priceMode =
    String(
      product?.price_mode ||
      "fixed"
    );


  box.innerHTML =
    optionDraftRows
      .map(
        (
          option,
          index
        ) => `

<div
style="
padding:15px;
margin-bottom:12px;
border:1px solid #e2e8f0;
border-radius:14px;
background:#fff;
"
>

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
gap:10px;
margin-bottom:12px;
"
>

<b>
ตัวเลือก ${index + 1}
</b>


<div
style="
display:flex;
gap:5px;
"
>

<button
type="button"
onclick="
moveOptionDraftRow(
  ${index},
  -1
)
"
style="
width:auto;
padding:5px 9px;
"
>
↑
</button>

<button
type="button"
onclick="
moveOptionDraftRow(
  ${index},
  1
)
"
style="
width:auto;
padding:5px 9px;
"
>
↓
</button>

<button
type="button"
onclick="
removeOptionDraftRow(
  ${index}
)
"
style="
width:auto;
padding:5px 9px;
background:#ef4444;
"
>
×
</button>

</div>

</div>


<div
class="product-form"
>

<div>

<label>
ชื่อตัวเลือก
</label>

<input
id="option_value_${index}"
value="${escapeHtml(
  option.option_value || ""
)}"
placeholder="เช่น Phainon / สุ่ม / ยก Box"
>

</div>


${
  priceMode === "option"
    ? `

<div>

<label>
ราคา
</label>

<input
id="option_price_${index}"
type="number"
min="0"
step="0.01"
value="${Number(
  option.price ?? 0
)}"
>

</div>

`
    : `

<div>

<label>
ราคา
</label>

<div
style="
padding:10px 12px;
border-radius:9px;
background:#f8fafc;
color:#64748b;
"
>

ใช้ราคาสินค้า
${Number(
  product?.price || 0
).toLocaleString("th-TH")}
บาท

</div>

</div>

`
}


<div>

<label>
Stock
</label>

<input
id="option_stock_${index}"
type="number"
min="0"
step="1"
value="${Number(
  option.stock || 0
)}"
>

</div>


<div>

<label>
รูปตัวเลือก
</label>

<input
type="file"
accept="image/png,image/jpeg,image/jpg,image/webp"
onchange="
handleOptionImageChange(
  ${index},
  this
)
"
>

</div>

</div>


<div
id="option_image_preview_${index}"
style="
margin-top:12px;
"
>

${
  option.image_base64 ||
  option.image
    ? `

<img
src="${
  option.image_base64 ||
  option.image
}"
alt=""
style="
width:120px;
height:120px;
object-fit:cover;
border-radius:12px;
border:1px solid #e2e8f0;
"
>

<button
type="button"
onclick="
removeOptionDraftImage(
  ${index}
)
"
style="
width:auto;
margin-left:8px;
background:#64748b;
"
>
ลบรูป
</button>

`
    : `
<span
style="
font-size:13px;
color:#94a3b8;
"
>
ยังไม่มีรูป
</span>
`
}

</div>

</div>

`
      )
      .join("");

}


/*
=========================================================
OPTION IMAGE
=========================================================
*/

async function optionFileToBase64(
  file
){

  if(
    typeof fileToBase64 ===
    "function"
  ){

    return await fileToBase64(
      file
    );

  }


  return await new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        () =>
          resolve(
            reader.result
          );


      reader.onerror =
        () =>
          reject(
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


async function handleOptionImageChange(
  index,
  input
){

  const file =
    input?.files?.[0];


  if(!file){
    return;
  }


  try{

    const base64 =
      await optionFileToBase64(
        file
      );


    if(
      !optionDraftRows[
        index
      ]
    ){

      return;

    }


    optionDraftRows[
      index
    ].image_base64 =
      base64;


    const preview =
      document.getElementById(
        "option_image_preview_" +
        index
      );


    if(preview){

      preview.innerHTML = `

<img
src="${base64}"
alt=""
style="
width:120px;
height:120px;
object-fit:cover;
border-radius:12px;
border:1px solid #e2e8f0;
"
>

<button
type="button"
onclick="
removeOptionDraftImage(
  ${index}
)
"
style="
width:auto;
margin-left:8px;
background:#64748b;
"
>
ลบรูป
</button>

`;

    }


  }catch(error){

    console.error(
      "handleOptionImageChange:",
      error
    );


    alert(
      error?.message ||
      "อ่านรูปไม่สำเร็จ"
    );

  }

}


function removeOptionDraftImage(
  index
){

  if(
    !optionDraftRows[
      index
    ]
  ){

    return;

  }


  optionDraftRows[
    index
  ].image =
    "";


  optionDraftRows[
    index
  ].image_base64 =
    "";


  renderOptionDraftRows();

}


/*
=========================================================
SAVE BATCH
=========================================================
*/

async function saveProductOptionsBatchFromAdmin(){

  if(
    !selectedOptionProductId
  ){

    alert(
      "กรุณาเลือกสินค้า"
    );

    return;

  }


  syncOptionDraftFromDom();


  const groupName =
    document
      .getElementById(
        "o_group_name"
      )
      ?.value
      .trim() ||
    "";


  const selectionType =
    document
      .getElementById(
        "o_group_selection_type"
      )
      ?.value ||
    "single";


  if(!groupName){

    alert(
      "กรุณากรอกชื่อกลุ่มตัวเลือก"
    );

    return;

  }


  if(
    !optionDraftRows.length
  ){

    alert(
      "กรุณาเพิ่มตัวเลือก"
    );

    return;

  }


  const product =
    getSelectedOptionProduct();


  const priceMode =
    String(
      product?.price_mode ||
      "fixed"
    );


  for(
    let index = 0;
    index <
      optionDraftRows.length;
    index++
  ){

    const option =
      optionDraftRows[
        index
      ];


    option.option_value =
      String(
        option.option_value ||
        ""
      ).trim();


    if(
      !option.option_value
    ){

      alert(
        "กรุณากรอกชื่อตัวเลือก " +
        (
          index + 1
        )
      );

      return;

    }


    if(
      !Number.isInteger(
        Number(
          option.stock
        )
      ) ||
      Number(
        option.stock
      ) < 0
    ){

      alert(
        "Stock ของตัวเลือก " +
        (
          index + 1
        ) +
        " ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป"
      );

      return;

    }


    if(
      priceMode ===
        "option" &&
      (
        !Number.isFinite(
          Number(
            option.price
          )
        ) ||
        Number(
          option.price
        ) < 0
      )
    ){

      alert(
        "ราคาของตัวเลือก " +
        (
          index + 1
        ) +
        " ไม่ถูกต้อง"
      );

      return;

    }

  }


  /*
  duplicate ในหน้า Admin
  */

  const names =
    optionDraftRows.map(
      option =>
        String(
          option.option_value
        )
          .trim()
          .toLowerCase()
    );


  if(
    new Set(
      names
    ).size !==
    names.length
  ){

    alert(
      "มีชื่อตัวเลือกซ้ำกันในกลุ่ม"
    );

    return;

  }


  const payload = {

    product_id:
      selectedOptionProductId,

    option_name:
      groupName,

    selection_type:
      selectionType,

    options:
      optionDraftRows.map(
        (
          option,
          index
        ) => ({

          option_id:
            option.option_id ||
            "",

          option_value:
            option.option_value,

          price:
            priceMode ===
              "option"
              ? Number(
                  option.price
                )
              : 0,

          stock:
            Number(
              option.stock
            ),

          image:
            option.image ||
            "",

          image_base64:
            option.image_base64 ||
            "",

          sort_order:
            index

        })
      )

  };


  const btn =
    document.getElementById(
      "saveOptionBatchBtn"
    );


  const loading =
    document.getElementById(
      "saveOptionBatchLoading"
    );


  if(btn){

    btn.disabled =
      true;

    btn.textContent =
      "กำลังบันทึก...";

  }


  if(loading){

    loading.style.display =
      "block";

  }


  try{

    const formData =
      new FormData();


    formData.append(
      "action",
      "saveProductOptionsBatch"
    );


    formData.append(
      "payload",
      JSON.stringify(
        payload
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
        "บันทึกตัวเลือกไม่สำเร็จ"
      );

    }


    alert(
      "บันทึกตัวเลือกแล้ว " +
      Number(
        result.saved_count ||
        payload.options.length
      ) +
      " รายการ"
    );


    editingOptionGroupName =
      "";


    optionDraftRows = [];


    resetOptionBatchForm();


   await loadAdminProductOptions();

await loadAdminProducts(
  true
);


    refreshOptionProductSelect();


  }catch(error){

    console.error(
      "saveProductOptionsBatchFromAdmin:",
      error
    );


    alert(
      error?.message ||
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );


  }finally{

    const currentBtn =
      document.getElementById(
        "saveOptionBatchBtn"
      );


    const currentLoading =
      document.getElementById(
        "saveOptionBatchLoading"
      );


    if(currentBtn){

      currentBtn.disabled =
        false;

      currentBtn.textContent =
        "💾 บันทึกทั้งหมด";

    }


    if(currentLoading){

      currentLoading.style.display =
        "none";

    }

  }

}


/*
=========================================================
RESET
=========================================================
*/

function resetOptionBatchForm(){

  editingOptionGroupName =
    "";


  optionDraftRows = [];


  const form =
    document.getElementById(
      "optionBatchForm"
    );


  const empty =
    document.getElementById(
      "optionBatchEmpty"
    );


  if(form){

    form.style.display =
      "none";

  }


  if(empty){

    empty.style.display =
      selectedOptionProductId
        ? "block"
        : "block";


    empty.textContent =
      selectedOptionProductId
        ? "กด “กลุ่มใหม่” หรือเลือกแก้ไขกลุ่มด้านล่าง"
        : "เลือกสินค้าก่อน แล้วเริ่มสร้างกลุ่มตัวเลือก";

  }


  const name =
    document.getElementById(
      "o_group_name"
    );


  if(name){

    name.value =
      "";

    name.readOnly =
      false;

  }


  const notice =
    document.getElementById(
      "optionGroupEditNotice"
    );


  if(notice){

    notice.style.display =
      "none";

  }

}


/*
=========================================================
DELETE WHOLE GROUP
=========================================================
*/

async function deleteOptionGroup(
  groupName
){

  const options =
    adminProductOptions.filter(
      option =>
        String(
          option.option_name ||
          ""
        ) ===
        String(
          groupName
        )
    );


  if(
    !options.length
  ){

    return;

  }


  const ok =
    confirm(
      "ต้องการลบกลุ่ม \"" +
      groupName +
      "\" ทั้ง " +
      options.length +
      " ตัวเลือกใช่ไหม?"
    );


  if(!ok){
    return;
  }


  try{

    /*
    endpoint delete เดิมลบทีละ option
    ใช้ชั่วคราวจนกว่าจะมี delete batch
    */

    for(
      const option of options
    ){

      const formData =
        new FormData();


      formData.append(
        "action",
        "deleteProductOption"
      );


      formData.append(
        "payload",
        JSON.stringify({
          option_id:
            option.option_id
        })
      );


      const response =
        await fetch(
          API,
          {
            method:"POST",
            body:formData
          }
        );


      const result =
        await response.json();


      if(
        !result ||
        result.success !== true
      ){

        throw new Error(
          result?.error ||
          "ลบตัวเลือกไม่สำเร็จ"
        );

      }

    }


    alert(
      "ลบกลุ่มตัวเลือกแล้ว"
    );


    resetOptionBatchForm();


    await loadAdminProductOptions();


    await loadAdminProducts();


    refreshOptionProductSelect();


  }catch(error){

    console.error(
      "deleteOptionGroup:",
      error
    );


    alert(
      error?.message ||
      "ลบกลุ่มตัวเลือกไม่สำเร็จ"
    );

  }

}


/*
=========================================================
OPEN FROM PRODUCT MANAGER
=========================================================
*/

async function openProductOptions(
  productId
){

  selectedOptionProductId =
    String(
      productId || ""
    );


  if(
    typeof highlightedProductId !==
    "undefined"
  ){

    highlightedProductId =
      selectedOptionProductId;

  }


  /*
  showAdminTab("options")
  จะเรียก renderOptionManager()
  และ renderOptionManager()
  จะโหลด options ให้เองอยู่แล้ว
  */

  showAdminTab(
    "options"
  );


  requestAnimationFrame(
    () => {

      const product =
        adminProducts.find(
          item =>
            String(
              item.product_id
            ) ===
            String(
              selectedOptionProductId
            )
        );


      const collectionSelect =
        document.getElementById(
          "optionCollectionSelect"
        );


      if(
        collectionSelect &&
        product
      ){

        collectionSelect.value =
          String(
            product.collection_id ||
            ""
          );

      }


      refreshOptionProductSelect();


      const select =
        document.getElementById(
          "optionProductSelect"
        );


      if(select){

        select.value =
          selectedOptionProductId;

      }


      updateOptionProductInfo();


      /*
      ห้าม loadAdminProductOptions() ซ้ำตรงนี้
      renderOptionManager โหลดให้แล้ว
      */


      document
        .getElementById(
          "optionManager"
        )
        ?.scrollIntoView({

          behavior:"smooth",
          block:"start"

        });

    }
  );

}

/*
=========================================================
BACK TO PRODUCT MANAGER
=========================================================
*/

function backToProductManager(){

  showAdminTab(
    "products"
  );


  if(
    selectedOptionProductId
  ){

    filterProductsByCollection(
      ""
    );


    requestAnimationFrame(
      () => {

        const keyword =
          document.getElementById(
            "productSearch"
          );


        if(keyword){

          keyword.value =
            selectedOptionProductId;


          renderAdminProductList();

        }

      }
    );

  }

}


/*
=========================================================
OPTION COUNT
=========================================================
*/

function getProductOptionCount(
  product
){

  if(
    product.options &&
    Array.isArray(
      product.options
    )
  ){

    return product.options.length;

  }


  return 0;

}
