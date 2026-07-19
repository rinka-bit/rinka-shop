let adminProducts = [];

let highlightedProductId = "";

function renderProductManager(){

  document
    .getElementById("productManager")
    .innerHTML = `

<div class="card">

<div class="product-form">

<div>
<label>ชื่อสินค้า</label>
<input id="p_name" placeholder="ชื่อสินค้า">
</div>

<div>
<label>ราคา</label>
<input id="p_price" type="number" placeholder="ราคา">
</div>

<div>
<label>ราคาลด</label>
<input id="p_sale_price" type="number" placeholder="ราคาลด">
</div>

<div>
<label>วันเริ่มลดราคา</label>
<input
id="p_sale_start"
type="date">
</div>

<div>
<label>วันสิ้นสุดลดราคา</label>
<input
id="p_sale_end"
type="date">
</div>

<div>
<label>หมวดหลัก</label>
<input id="p_main_category" placeholder="เช่น Doll / Acrylic / Badge">
</div>

<div>
<label>Fandom</label>
<input id="p_fandom" placeholder="เช่น Honkai: Star Rail">
</div>

<div>
<label>หมวดย่อย</label>
<input id="p_sub_category" placeholder="หมวดย่อย">
</div>

<div>
<label>รอบพรี</label>
<input id="p_round" placeholder="รอบพรี">
</div>

<div>
<label>Collection</label>

<select id="p_collection_id">

<option value="">
ไม่ผูก Collection
</option>

${adminCollections
  .map(collection=>`

<option
value="${escapeHtml(
  collection.collection_id
)}">

${escapeHtml(
  collection.name || "-"
)}

</option>

`)
  .join("")}

</select>
</div>

<div>
<label>ประเภทสินค้า</label>
<select id="p_product_type">
<option value="preorder">Preorder</option>
<option value="instock">พร้อมส่ง</option>
</select>
</div>

<div>
<label>จำนวนสต็อก</label>
<input id="p_stock" type="number" placeholder="จำนวนสต็อก">
</div>

<div>
<label>วันปิดพรี</label>
<input id="p_preorder_deadline" type="date">
</div>

<div>
<label>กำหนดถึงโดยประมาณ</label>
<input id="p_estimated_arrival" placeholder="เช่น ปลายเดือน ก.ค.">
</div>

<div>
<label>รูปหลัก</label>
<input id="p_image_file" type="file" accept="image/*">
</div>

<div>
<label>รูป 2</label>
<input id="p_image2_file" type="file" accept="image/*">
</div>

<div>
<label>รูป 3</label>
<input id="p_image3_file" type="file" accept="image/*">
</div>

<div>
<label>รูป 4</label>
<input id="p_image4_file" type="file" accept="image/*">
</div>

<div class="full">
<label>รายละเอียดสินค้า</label>
<textarea
id="p_description"
placeholder="รายละเอียดสินค้า"
style="height:110px;">
</textarea>
</div>

<div>
<label>
<input id="p_featured" type="checkbox" style="width:auto;">
แสดงในสินค้าแนะนำ
</label>
</div>

<div>
<label>
<input id="p_new_arrival" type="checkbox" style="width:auto;">
สินค้าใหม่
</label>
</div>

</div>

<br>

<button
id="saveProductBtn"
onclick="saveProductFromAdmin()">
บันทึกสินค้า
</button>

<div
id="saveProductLoading"
class="loading-text"
style="display:none;">
⏳ กำลังบันทึกสินค้า...
</div>

<hr>

<h2>📦 รายการสินค้า</h2>

<div class="product-form">

<input
id="productSearch"
placeholder="ค้นหาสินค้า..."
oninput="renderAdminProductList()">

<select
id="productStatusFilter"
onchange="renderAdminProductList()">
<option value="">ทุกสถานะ</option>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
</select>

<select
id="productCollectionFilter"
onchange="renderAdminProductList()"
>

  <option value="">
    ทุก Collection
  </option>

  ${adminCollections.map(
    collection => `
      <option
      value="${escapeHtml(
        collection.collection_id
      )}"
      >
        ${escapeHtml(
          collection.name
        )}
      </option>
    `
  ).join("")}

</select>

<select
id="productTypeFilter"
onchange="renderAdminProductList()">
<option value="">ทุกประเภท</option>
<option value="preorder">Preorder</option>
<option value="instock">พร้อมส่ง</option>
</select>

</div>
<br><br>

<div id="adminProductList">
กำลังโหลดสินค้า...
</div>

</div>

`;

}

async function saveProductFromAdmin(){
  const btn =
    document.getElementById("saveProductBtn");

  const loading =
    document.getElementById("saveProductLoading");

  const payload = {
    name: document.getElementById("p_name").value,
    price: Number(document.getElementById("p_price").value || 0),
    sale_price: Number(document.getElementById("p_sale_price").value || 0),
    sale_start:
  document.getElementById(
    "p_sale_start"
  ).value,

sale_end:
  document.getElementById(
    "p_sale_end"
  ).value,
    main_category: document.getElementById("p_main_category").value,
    fandom: document.getElementById("p_fandom").value,
    sub_category: document.getElementById("p_sub_category").value,
    round:
  document.getElementById(
    "p_round"
  ).value,

collection_id:
  document.getElementById(
    "p_collection_id"
  ).value,
    description: document.getElementById("p_description").value,
    product_type: document.getElementById("p_product_type").value,
    stock: Number(document.getElementById("p_stock").value || 0),
    preorder_deadline: document.getElementById("p_preorder_deadline").value,
    estimated_arrival: document.getElementById("p_estimated_arrival").value,
    featured: document.getElementById("p_featured").checked ? "yes" : "",
    new_arrival: document.getElementById("p_new_arrival").checked ? "yes" : "",
    status: "active"
  };

  if(!payload.name){
    alert("กรุณากรอกชื่อสินค้า");
    return;
  }

  if(!payload.price){
    alert("กรุณากรอกราคา");
    return;
  }

  if(
  payload.sale_price > 0 &&
  (
    !payload.sale_start ||
    !payload.sale_end
  )
){
  alert(
    "กรุณากรอกวันเริ่มและวันสิ้นสุดลดราคา"
  );
  return;
}

if(
  payload.sale_start &&
  payload.sale_end &&
  payload.sale_start >
  payload.sale_end
){
  alert(
    "วันเริ่มลดราคาต้องไม่เกินวันสิ้นสุด"
  );
  return;
}

  const imageFile =
  document.getElementById("p_image_file").files[0];

const image2File =
  document.getElementById("p_image2_file").files[0];

const image3File =
  document.getElementById("p_image3_file").files[0];

const image4File =
  document.getElementById("p_image4_file").files[0];

if(imageFile){
  payload.image_base64 =
    await fileToBase64(imageFile);
}

if(image2File){
  payload.image2_base64 =
    await fileToBase64(image2File);
}

if(image3File){
  payload.image3_base64 =
    await fileToBase64(image3File);
}

if(image4File){
  payload.image4_base64 =
    await fileToBase64(image4File);
}

  btn.disabled = true;
  btn.textContent = "กำลังบันทึก...";
  loading.style.display = "block";

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "saveProduct"
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

    alert(
      result.success
        ? "เพิ่มสินค้าแล้ว: " + result.product_id
        : result.error || "เพิ่มสินค้าไม่สำเร็จ"
    );
if(result.success){

  renderProductManager();

  await loadAdminProducts();

}

  }catch(error){

    console.error(error);
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่");

  }finally{

    const newBtn =
      document.getElementById("saveProductBtn");

    const newLoading =
      document.getElementById("saveProductLoading");

    if(newBtn){
      newBtn.disabled = false;
      newBtn.textContent = "บันทึกสินค้า";
    }

    if(newLoading){
      newLoading.style.display = "none";
    }

  }

}

async function loadAdminProducts(){

  const response =
    await fetch(
      API + "?action=adminProducts"
    );

  const result =
    await response.json();

  if(!result.success){
    document.getElementById("adminProductList").innerHTML =
      "โหลดสินค้าไม่สำเร็จ";
    return;
  }

adminProducts =
  Array.isArray(result.products)
    ? result.products
    : [];

renderAdminProductList();

refreshOptionProductSelect();

refreshProductCollectionSelects();

renderAdminCollectionList();

}

function renderAdminProductList(){

  const box =
    document.getElementById("adminProductList");

  if(!box){
    return;
  }

  const keyword =
    document.getElementById("productSearch")
      ?.value
      .toLowerCase() || "";

  const statusFilter =
    document.getElementById("productStatusFilter")
      ?.value || "";

  const typeFilter =
    document.getElementById("productTypeFilter")
      ?.value || "";

  const collectionFilter =
  document
    .getElementById(
      "productCollectionFilter"
    )
    ?.value || "";

  const filtered =
    adminProducts.filter(product=>{

      const matchKeyword =
  String(product.name || "").toLowerCase().includes(keyword) ||
  String(product.fandom || "").toLowerCase().includes(keyword) ||
  String(product.product_id || "").toLowerCase().includes(keyword) ||
  String(product.main_category || "").toLowerCase().includes(keyword) ||
  String(product.sub_category || "").toLowerCase().includes(keyword) ||
  String(product.options_text || "").toLowerCase().includes(keyword);

      const matchStatus =
        !statusFilter ||
        product.status === statusFilter;

      const matchType =
        !typeFilter ||
        product.product_type === typeFilter;

      const matchCollection =
  !collectionFilter ||
  String(
    product.collection_id || ""
  ) ===
  String(collectionFilter);

            return (
        matchKeyword &&
        matchStatus &&
        matchType &&
        matchCollection
      );

    });

  let html = `
  <div class="grid">
  `;

  filtered.forEach(product=>{

    const linkedCollection =
  adminCollections.find(
    collection =>
      String(
        collection.collection_id
      ) ===
      String(
        product.collection_id
      )
  );

    html += `

<div
class="card"
style="
border:
${
String(product.product_id)===
String(highlightedProductId)
? "3px solid #7c3aed"
: "1px solid #e5eefc"
};
"
>

<img
src="${product.image || ""}"
style="
width:100%;
height:180px;
object-fit:cover;
border-radius:14px;
background:#f1f5f9;
margin-bottom:12px;
">

<h3 style="margin:0 0 8px;">
${product.name || "-"}
</h3>

<p>
🆔 ${product.product_id}
</p>

<p>
🎮 ${product.fandom || "-"}
</p>

<p>
🖼️ Collection:

${
  linkedCollection
    ? `
      <button
      type="button"
      onclick="
        filterProductsByCollection(
          '${escapeJsString(
            linkedCollection.collection_id
          )}'
        )
      "
      style="
        width:auto;
        padding:4px 9px;
        margin-left:4px;
        border:none;
        border-radius:999px;
        background:#e0f2fe;
        color:#0369a1;
        font-weight:700;
        cursor:pointer;
      "
      >
        ${escapeHtml(
          linkedCollection.name
        )}
      </button>
    `
    : `
      <span
      style="
        color:#94a3b8;
        font-weight:600;
      "
      >
        ไม่ได้ผูก
      </span>
    `
}

</p>

<p>
🏷️ ${product.main_category || "-"}
</p>

<p>

<button
type="button"
onclick="
openProductOptions(
'${escapeJsString(
product.product_id
)}'
)
"
style="
width:auto;
padding:5px 10px;
border:none;
border-radius:999px;
background:#ede9fe;
color:#6d28d9;
font-weight:700;
cursor:pointer;
"
>

🎭
${getProductOptionCount(product)}
ตัวเลือก

</button>

</p>

<p>
💰 <b>${product.price || 0}</b> บาท
</p>

<p>
📦 ${product.product_type || "-"}
</p>

<p>
สถานะ:
<b>${product.status || "-"}</b>
</p>

${
product.preorder_deadline
?
`
<p>
📅 ปิดพรี: ${product.preorder_deadline}
</p>
`
:
""
}

<div style="
display:flex;
gap:8px;
flex-wrap:wrap;
margin-top:12px;
">

<button
onclick="openEditProduct('${product.product_id}')">
✏️ แก้ไข
</button>

<button onclick="alert('เดี๋ยวทำระบบคัดลอกต่อ')">
📋 คัดลอก
</button>

<button onclick="toggleProductStatus('${product.product_id}')">
${product.status === "active" ? "🚫 ปิดขาย" : "✅ เปิดขาย"}
</button>

</div>

</div>

`;

  });

  html += "</div>";

  box.innerHTML =
    filtered.length
      ? html
      : "ไม่พบสินค้า";

}

function filterProductsByCollection(
  collectionId
){

  // เปิดแท็บ Product Manager ก่อน
  showAdminTab("products");

  const filter =
    document.getElementById(
      "productCollectionFilter"
    );

  if(!filter){

    console.error(
      "ไม่พบ productCollectionFilter"
    );

    return;

  }

  filter.value =
    String(collectionId || "");

  renderAdminProductList();

  requestAnimationFrame(()=>{

    const productManager =
      document.getElementById(
        "productManager"
      );

    if(productManager){

      productManager.scrollIntoView({
        behavior:"smooth",
        block:"start"
      });

    }

  });

}

async function toggleProductStatus(productId){

  const ok =
    confirm("ต้องการเปลี่ยนสถานะสินค้านี้ใช่ไหม?");

  if(!ok){
    return;
  }

  const formData =
    new FormData();

  formData.append(
    "action",
    "toggleProductStatus"
  );

  formData.append(
    "payload",
    JSON.stringify({
      product_id: productId
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

  alert(
    result.success
      ? "อัปเดตสถานะเป็น " + result.status
      : result.error || "อัปเดตไม่สำเร็จ"
  );

  loadAdminProducts();

}

function openEditProduct(productId){

  const product =
    adminProducts.find(
      item =>
        item.product_id === productId
    );

  if(!product){
    alert("ไม่พบข้อมูลสินค้า");
    return;
  }

  document
    .getElementById("editProductForm")
    .innerHTML = `

<input
type="hidden"
id="e_product_id"
value="${product.product_id}">

<div>
<label>ชื่อสินค้า</label>
<input
id="e_name"
value="${escapeHtml(product.name || "")}">
</div>

<div>
<label>ราคา</label>
<input
id="e_price"
type="number"
value="${product.price || 0}">
</div>

<div>
<label>ราคาลด</label>
<input
id="e_sale_price"
type="number"
value="${product.sale_price || 0}">
</div>

<div>
<label>วันเริ่มลดราคา</label>
<input
id="e_sale_start"
type="date"
value="${formatDateInput(
  product.sale_start
)}">
</div>

<div>
<label>วันสิ้นสุดลดราคา</label>
<input
id="e_sale_end"
type="date"
value="${formatDateInput(
  product.sale_end
)}">
</div>

<div>
<label>หมวดหลัก</label>
<input
id="e_main_category"
value="${escapeHtml(product.main_category || "")}">
</div>

<div>
<label>Fandom</label>
<input
id="e_fandom"
value="${escapeHtml(product.fandom || "")}">
</div>

<div>
<label>หมวดย่อย</label>
<input
id="e_sub_category"
value="${escapeHtml(product.sub_category || "")}">
</div>

<div>
<label>รอบพรี</label>
<input
id="e_round"
value="${escapeHtml(product.round || "")}">
</div>

<div>
<label>Collection</label>

<select id="e_collection_id">

<option value="">
ไม่ผูก Collection
</option>

${adminCollections
  .map(collection=>`

<option
value="${escapeHtml(
  collection.collection_id
)}"

${
  String(
    product.collection_id || ""
  ) ===
  String(
    collection.collection_id || ""
  )
    ? "selected"
    : ""
}>

${escapeHtml(
  collection.name || "-"
)}

</option>

`)
  .join("")}

</select>
</div>

<div>
<label>ประเภทสินค้า</label>
<select id="e_product_type">
<option
value="preorder"
${product.product_type === "preorder" ? "selected" : ""}>
Preorder
</option>

<option
value="instock"
${product.product_type === "instock" ? "selected" : ""}>
พร้อมส่ง
</option>
</select>
</div>

<div>
<label>จำนวนสต็อก</label>
<input
id="e_stock"
type="number"
value="${product.stock || 0}">
</div>

<div>
<label>วันปิดพรี</label>
<input
id="e_preorder_deadline"
type="date"
value="${formatDateInput(product.preorder_deadline)}">
</div>

<div>
<label>กำหนดถึงโดยประมาณ</label>
<input
id="e_estimated_arrival"
value="${escapeHtml(product.estimated_arrival || "")}">
</div>

<div class="full">
<label>รายละเอียดสินค้า</label>
<textarea
id="e_description"
style="height:110px;">${escapeHtml(product.description || "")}</textarea>
</div>

<div>
<label>เปลี่ยนรูปหลัก</label>
<input
id="e_image_file"
type="file"
accept="image/*">
</div>

<div>
<label>เปลี่ยนรูป 2</label>
<input
id="e_image2_file"
type="file"
accept="image/*">
</div>

<div>
<label>เปลี่ยนรูป 3</label>
<input
id="e_image3_file"
type="file"
accept="image/*">
</div>

<div>
<label>เปลี่ยนรูป 4</label>
<input
id="e_image4_file"
type="file"
accept="image/*">
</div>

<div>
<label>
<input
id="e_featured"
type="checkbox"
style="width:auto;"
${isCheckedValue(product.featured) ? "checked" : ""}>
สินค้าแนะนำ
</label>
</div>

<div>
<label>
<input
id="e_new_arrival"
type="checkbox"
style="width:auto;"
${isCheckedValue(product.new_arrival) ? "checked" : ""}>
สินค้าใหม่
</label>
</div>

`;

  document
    .getElementById("editProductModal")
    .classList.remove("hidden");

}

function closeEditProductModal(){

  document
    .getElementById("editProductModal")
    .classList.add("hidden");

}

async function submitProductEdit(){

  const btn =
    document.getElementById(
      "updateProductBtn"
    );

  const loading =
    document.getElementById(
      "updateProductLoading"
    );

  const payload = {

    product_id:
      document.getElementById(
        "e_product_id"
      ).value,

    name:
      document.getElementById(
        "e_name"
      ).value.trim(),

    price:
      Number(
        document.getElementById(
          "e_price"
        ).value || 0
      ),

    sale_price:
      Number(
        document.getElementById(
          "e_sale_price"
        ).value || 0
      ),

    sale_start:
  document
    .getElementById(
      "e_sale_start"
    )
    .value,

sale_end:
  document
    .getElementById(
      "e_sale_end"
    )
    .value,

    main_category:
      document.getElementById(
        "e_main_category"
      ).value.trim(),

    fandom:
      document.getElementById(
        "e_fandom"
      ).value.trim(),

    sub_category:
      document.getElementById(
        "e_sub_category"
      ).value.trim(),

    round:
      document.getElementById(
        "e_round"
      ).value.trim(),

    collection_id:
  document
    .getElementById(
      "e_collection_id"
    )
    .value,

    description:
      document.getElementById(
        "e_description"
      ).value,

    product_type:
      document.getElementById(
        "e_product_type"
      ).value,

    stock:
      Number(
        document.getElementById(
          "e_stock"
        ).value || 0
      ),

    preorder_deadline:
      document.getElementById(
        "e_preorder_deadline"
      ).value,

    estimated_arrival:
      document.getElementById(
        "e_estimated_arrival"
      ).value.trim(),

    featured:
      document.getElementById(
        "e_featured"
      ).checked
        ? "yes"
        : "",

    new_arrival:
      document.getElementById(
        "e_new_arrival"
      ).checked
        ? "yes"
        : ""

  };

  if(!payload.name){
    alert("กรุณากรอกชื่อสินค้า");
    return;
  }

  if(!payload.price){
    alert("กรุณากรอกราคา");
    return;
  }

  if(
  payload.sale_price > 0 &&
  (
    !payload.sale_start ||
    !payload.sale_end
  )
){
  alert(
    "กรุณากรอกวันเริ่มและวันสิ้นสุดลดราคา"
  );
  return;
}

if(
  payload.sale_start &&
  payload.sale_end &&
  payload.sale_start >
  payload.sale_end
){
  alert(
    "วันเริ่มลดราคาต้องไม่เกินวันสิ้นสุด"
  );
  return;
}

  btn.disabled = true;
  btn.textContent = "กำลังบันทึก...";
  loading.style.display = "block";

  try{

    const imageFiles = [
      [
        "image_base64",
        document.getElementById(
          "e_image_file"
        ).files[0]
      ],
      [
        "image2_base64",
        document.getElementById(
          "e_image2_file"
        ).files[0]
      ],
      [
        "image3_base64",
        document.getElementById(
          "e_image3_file"
        ).files[0]
      ],
      [
        "image4_base64",
        document.getElementById(
          "e_image4_file"
        ).files[0]
      ]
    ];

    for(const [field,file] of imageFiles){

      if(file){
        payload[field] =
          await fileToBase64(file);
      }

    }

    const formData =
      new FormData();

    formData.append(
      "action",
      "updateProduct"
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
        "บันทึกไม่สำเร็จ"
      );

      return;

    }

    alert("แก้ไขสินค้าเรียบร้อยแล้ว");

    closeEditProductModal();

    await loadAdminProducts();

  }catch(error){

    console.error(error);

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }finally{

    btn.disabled = false;
    btn.textContent =
      "💾 บันทึกการแก้ไข";

    loading.style.display =
      "none";

  }

}
