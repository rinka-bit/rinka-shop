let adminProductOptions = [];

let selectedOptionProductId = "";
let editingOptionId = "";

function renderOptionManager(){

  const box =
    document.getElementById(
      "optionManager"
    );

  if(!box){
    return;
  }

  box.innerHTML = `

<div class="card">

<h2>
➕ เพิ่มตัวเลือกสินค้า
</h2>

<div class="product-form">

<div class="full">

<label>
เลือกสินค้า
</label>

<select
id="optionProductSelect"
onchange="
handleOptionProductChange()
">

<option value="">
-- เลือกสินค้า --
</option>

${adminProducts
  .map(product=>`

<option
value="${escapeHtml(
  product.product_id
)}">

${escapeHtml(
  product.name || "-"
)}

(${escapeHtml(
  product.product_id
)})

</option>

`)
  .join("")}

</select>

</div>

<div>

<label>
ชื่อกลุ่มตัวเลือก
</label>

<input
id="o_option_name"
placeholder="เช่น ตัวละคร / แบบ / สี">

</div>

<div>

<label>
ชื่อตัวเลือก
</label>

<input
id="o_option_value"
placeholder="เช่น Phainon / สีขาว / แบบ A">

</div>

<div>

<label>
ราคาเพิ่ม
</label>

<input
id="o_additional_price"
type="number"
min="0"
value="0">

</div>

<div>

<label>
จำนวน Stock
</label>

<input
id="o_stock"
type="number"
min="0"
value="0">

</div>

<div>

<label>
ประเภทการเลือก
</label>

<select
id="o_selection_type">

<option value="multiple">
เลือกหลายรายการได้
</option>

<option value="single">
เลือกได้รายการเดียว
</option>

</select>

</div>

</div>

<br>

<div style="
display:flex;
gap:10px;
flex-wrap:wrap;
">

<button
id="saveOptionBtn"
onclick="submitProductOption()">
💾 บันทึกตัวเลือก
</button>

<button
id="cancelOptionEditBtn"
class="hidden"
style="background:#64748b;"
onclick="cancelOptionEdit()">
ยกเลิกการแก้ไข
</button>

</div>

<div
id="saveOptionLoading"
class="loading-text"
style="display:none;">
⏳ กำลังบันทึกตัวเลือก...
</div>

</div>

<div class="card">

<div
style="
margin-bottom:18px;
">

<button
type="button"
onclick="backToProductManager()"
style="
background:#64748b;
">

⬅ กลับไปหน้าสินค้า

</button>

</div>

<h2>

📋 ตัวเลือกของสินค้า

</h2>

<p
id="currentOptionProduct"
style="
font-weight:700;
color:#2563eb;
margin-top:-6px;
">

ยังไม่ได้เลือกสินค้า

</p>

<div id="adminOptionList">

กรุณาเลือกสินค้าก่อน

</div>

</div>

`;

}

function refreshOptionProductSelect(){

  const select =
    document.getElementById(
      "optionProductSelect"
    );

  if(!select){
    return;
  }

  const previousValue =
    selectedOptionProductId ||
    select.value;

  select.innerHTML = `

<option value="">
-- เลือกสินค้า --
</option>

${adminProducts
  .map(product=>`

<option
value="${escapeHtml(
  product.product_id
)}">

${escapeHtml(
  product.name || "-"
)}

(${escapeHtml(
  product.product_id
)})

</option>

`)
  .join("")}

`;

  if(previousValue){

    select.value =
      previousValue;

  }

}

async function handleOptionProductChange(){

  const select =
    document.getElementById(
      "optionProductSelect"
    );

  selectedOptionProductId =
    select?.value || "";

  const product =
  adminProducts.find(
    p=>
    String(p.product_id)===
    String(selectedOptionProductId)
  );

document
.getElementById(
"currentOptionProduct"
)
.textContent =
product
? product.name
: "ยังไม่ได้เลือกสินค้า";

  editingOptionId = "";

  resetOptionForm();

  if(!selectedOptionProductId){

    adminProductOptions = [];

    document
      .getElementById(
        "adminOptionList"
      )
      .innerHTML =
      "กรุณาเลือกสินค้าก่อน";

    return;

  }

  await loadAdminProductOptions();

}

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

    const result =
      await response.json();

    if(!result.success){

      box.textContent =
        result.error ||
        "โหลดตัวเลือกไม่สำเร็จ";

      return;

    }

    adminProductOptions =
      result.options || [];

    renderAdminProductOptions();

  }catch(error){

    console.error(error);

    box.textContent =
      "โหลดตัวเลือกไม่สำเร็จ";

  }

}

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

    box.innerHTML =
      "สินค้านี้ยังไม่มีตัวเลือก";

    return;

  }

  const grouped = {};

  adminProductOptions.forEach(
    option => {

      const group =
        option.option_name ||
        "ไม่ระบุกลุ่ม";

      if(!grouped[group]){

        grouped[group] = [];

      }

      grouped[group].push(
        option
      );

    }
  );

  let html = "";

  Object.keys(grouped)
    .forEach(groupName=>{

      html += `

<div
style="
margin-bottom:22px;
">

<h3
style="
margin:0 0 10px;
">

${escapeHtml(
  groupName
)}

</h3>

<div class="grid">

`;

      grouped[groupName]
        .forEach(option=>{

          html += `

<div class="card">

<h3
style="
margin-top:0;
">

${escapeHtml(
  option.option_value || "-"
)}

</h3>

<p>
🆔
${escapeHtml(
  option.option_id || "-"
)}
</p>

<p>
💰 ราคาเพิ่ม:
${Number(
  option.additional_price || 0
).toLocaleString()}
บาท
</p>

<p>
📦 Stock:
${Number(
  option.stock || 0
).toLocaleString()}
</p>

<p>
🎛️
${
  option.selection_type ===
  "single"
    ? "เลือกได้รายการเดียว"
    : "เลือกหลายรายการได้"
}
</p>

<div style="
display:flex;
gap:8px;
flex-wrap:wrap;
">

<button
onclick="
editProductOption(
  '${escapeJsString(
    option.option_id
  )}'
)
">
✏️ แก้ไข
</button>

<button
style="background:#ef4444;"
onclick="
removeProductOption(
  '${escapeJsString(
    option.option_id
  )}'
)
">
🗑️ ลบ
</button>

</div>

</div>

`;

        });

      html += `

</div>

</div>

`;

    });

  box.innerHTML = html;

}


async function submitProductOption(){

  const productId =
    document
      .getElementById(
        "optionProductSelect"
      )
      .value;

  const payload = {

    product_id:
      productId,

    option_name:
      document
        .getElementById(
          "o_option_name"
        )
        .value
        .trim(),

    option_value:
      document
        .getElementById(
          "o_option_value"
        )
        .value
        .trim(),

    additional_price:
      Number(
        document
          .getElementById(
            "o_additional_price"
          )
          .value || 0
      ),

    stock:
      Number(
        document
          .getElementById(
            "o_stock"
          )
          .value || 0
      ),

    selection_type:
      document
        .getElementById(
          "o_selection_type"
        )
        .value

  };

  if(editingOptionId){

    payload.option_id =
      editingOptionId;

  }

  if(!payload.product_id){

    alert(
      "กรุณาเลือกสินค้า"
    );

    return;

  }

  if(!payload.option_name){

    alert(
      "กรุณากรอกชื่อกลุ่มตัวเลือก"
    );

    return;

  }

  if(!payload.option_value){

    alert(
      "กรุณากรอกชื่อตัวเลือก"
    );

    return;

  }

  if(
    payload.additional_price < 0
  ){

    alert(
      "ราคาเพิ่มต้องไม่ติดลบ"
    );

    return;

  }

  if(payload.stock < 0){

    alert(
      "จำนวน Stock ต้องไม่ติดลบ"
    );

    return;

  }

  const btn =
    document.getElementById(
      "saveOptionBtn"
    );

  const loading =
    document.getElementById(
      "saveOptionLoading"
    );

  btn.disabled = true;

  btn.textContent =
    "กำลังบันทึก...";

  loading.style.display =
    "block";

  try{

    const action =
      editingOptionId
        ? "updateProductOption"
        : "saveProductOption";

    const formData =
      new FormData();

    formData.append(
      "action",
      action
    );

    formData.append(
      "payload",
      JSON.stringify(payload)
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

    if(!result.success){

      alert(
        result.error ||
        "บันทึกตัวเลือกไม่สำเร็จ"
      );

      return;

    }

    alert(
      editingOptionId
        ? "แก้ไขตัวเลือกแล้ว"
        : "เพิ่มตัวเลือกแล้ว"
    );

    editingOptionId = "";

    resetOptionForm();

    await loadAdminProductOptions();

    await loadAdminProducts();

    refreshOptionProductSelect();

  }catch(error){

    console.error(error);

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }finally{

    btn.disabled = false;

    btn.textContent =
      editingOptionId
        ? "💾 บันทึกการแก้ไข"
        : "💾 บันทึกตัวเลือก";

    loading.style.display =
      "none";

  }

}

function editProductOption(
  optionId
){

  const option =
    adminProductOptions.find(
      item =>
        String(
          item.option_id
        ) ===
        String(optionId)
    );

  if(!option){

    alert(
      "ไม่พบข้อมูลตัวเลือก"
    );

    return;

  }

  editingOptionId =
    option.option_id;

  document
    .getElementById(
      "o_option_name"
    )
    .value =
    option.option_name || "";

  document
    .getElementById(
      "o_option_value"
    )
    .value =
    option.option_value || "";

  document
    .getElementById(
      "o_additional_price"
    )
    .value =
    Number(
      option.additional_price || 0
    );

  document
    .getElementById(
      "o_stock"
    )
    .value =
    Number(
      option.stock || 0
    );

  document
    .getElementById(
      "o_selection_type"
    )
    .value =
    option.selection_type ||
    "multiple";

  document
    .getElementById(
      "saveOptionBtn"
    )
    .textContent =
    "💾 บันทึกการแก้ไข";

  document
    .getElementById(
      "cancelOptionEditBtn"
    )
    .classList.remove(
      "hidden"
    );

  document
    .getElementById(
      "o_option_name"
    )
    .scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

}

function cancelOptionEdit(){

  editingOptionId = "";

  resetOptionForm();

}

function resetOptionForm(){

  const nameInput =
    document.getElementById(
      "o_option_name"
    );

  if(!nameInput){
    return;
  }

  nameInput.value = "";

  document
    .getElementById(
      "o_option_value"
    )
    .value = "";

  document
    .getElementById(
      "o_additional_price"
    )
    .value = 0;

  document
    .getElementById(
      "o_stock"
    )
    .value = 0;

  document
    .getElementById(
      "o_selection_type"
    )
    .value =
    "multiple";

  document
    .getElementById(
      "saveOptionBtn"
    )
    .textContent =
    "💾 บันทึกตัวเลือก";

  document
    .getElementById(
      "cancelOptionEditBtn"
    )
    .classList.add(
      "hidden"
    );

}

  async function removeProductOption(
  optionId
){

  const option =
    adminProductOptions.find(
      item =>
        String(
          item.option_id
        ) ===
        String(optionId)
    );

  const optionName =
    option
      ? option.option_value
      : optionId;

  const ok =
    confirm(
      "ต้องการลบตัวเลือก \"" +
      optionName +
      "\" ใช่ไหม?"
    );

  if(!ok){
    return;
  }

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "deleteProductOption"
    );

    formData.append(
      "payload",
      JSON.stringify({
        option_id:optionId
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

    if(!result.success){

      alert(
        result.error ||
        "ลบตัวเลือกไม่สำเร็จ"
      );

      return;

    }

    alert(
      "ลบตัวเลือกแล้ว"
    );

    if(
      editingOptionId ===
      optionId
    ){

      editingOptionId = "";

      resetOptionForm();

    }

    await loadAdminProductOptions();

    await loadAdminProducts();

    refreshOptionProductSelect();

  }catch(error){

    console.error(error);

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }

}

async function openProductOptions(
  productId
){

  showAdminTab("options");

  selectedOptionProductId =
    String(productId || "");
    
  highlightedProductId =
  selectedOptionProductId;

  const select =
    document.getElementById(
      "optionProductSelect"
    );

  if(select){

    select.value =
      selectedOptionProductId;

  }

  await loadAdminProductOptions();

  requestAnimationFrame(()=>{

    const manager =
      document.getElementById(
        "optionManager"
      );

    if(manager){

      manager.scrollIntoView({
        behavior:"smooth",
        block:"start"
      });

    }

  });

}

function backToProductManager(){

  showAdminTab("products");

  if(selectedOptionProductId){

    filterProductsByCollection("");

    requestAnimationFrame(()=>{

      const keyword =
        document.getElementById(
          "productSearch"
        );

      if(keyword){

        keyword.value =
          selectedOptionProductId;

        renderAdminProductList();

      }

    });

  }

}

function getProductOptionCount(
  product
){

  if(
    product.options &&
    Array.isArray(product.options)
  ){

    return product.options.length;

  }

  return 0;

}
