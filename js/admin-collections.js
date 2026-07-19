let adminCollections = [];

function renderCollectionManager(){

  const box =
    document.getElementById(
      "collectionManager"
    );

  if(!box){
    return;
  }

  box.innerHTML = `

<div class="card">

<h2>
➕ เพิ่ม Collection
</h2>

<div class="product-form">

<div>
<label>ชื่อ Collection</label>
<input
id="c_name"
placeholder="ชื่อ Collection">
</div>

<div>
<label>Fandom</label>
<input
id="c_fandom"
placeholder="เช่น Honkai: Star Rail">
</div>

<div>
<label>ประเภท Collection</label>
<input
id="c_type"
placeholder="เช่น preorder">
</div>

<div>
<label>วันปิดพรี</label>
<input
id="c_deadline"
type="date">
</div>

<div>
<label>รูปการ์ด Collection</label>
<input
id="c_image_file"
type="file"
accept="image/*">
</div>

<div>
<label>รูป Banner</label>
<input
id="c_banner_file"
type="file"
accept="image/*">
</div>

<div class="full">
<label>คำอธิบาย</label>

<textarea
id="c_description"
style="height:110px;"
placeholder="รายละเอียด Collection">
</textarea>
</div>

<div>
<label>
<input
id="c_featured"
type="checkbox"
style="width:auto;">
แสดงเป็น Collection แนะนำ
</label>
</div>

</div>

<br>

<button
id="saveCollectionBtn"
onclick="saveCollectionFromAdmin()">
บันทึก Collection
</button>

<div
id="saveCollectionLoading"
class="loading-text"
style="display:none;">
⏳ กำลังบันทึก Collection...
</div>

</div>

<div class="card">

<h2>
📂 รายการ Collections
</h2>

<input
id="collectionSearch"
placeholder="ค้นหา Collection..."
oninput="renderAdminCollectionList()">

<br><br>

<div id="adminCollectionList">
กำลังโหลด Collections...
</div>

</div>

`;

}

async function loadAdminCollections(){

  const box =
    document.getElementById(
      "adminCollectionList"
    );

  if(!box){
    return;
  }

  try{

    const response =
      await fetch(
        API +
        "?action=adminCollections"
      );

    const result =
      await response.json();

    if(!result.success){

      box.textContent =
        result.error ||
        "โหลด Collections ไม่สำเร็จ";

      return;

    }

    adminCollections =
  result.collections || [];

renderAdminCollectionList();

refreshProductCollectionSelects();

renderGiftManager();

  }catch(error){

    console.error(error);

    box.textContent =
      "โหลด Collections ไม่สำเร็จ";

  }

}


function renderAdminCollectionList(){

  const box =
    document.getElementById(
      "adminCollectionList"
    );

  if(!box){
    return;
  }

  const keyword =
    document
      .getElementById(
        "collectionSearch"
      )
      ?.value
      .trim()
      .toLowerCase() || "";

  const filtered =
    adminCollections.filter(
      collection => {

        return (

          String(
            collection.name || ""
          )
            .toLowerCase()
            .includes(keyword)

          ||

          String(
            collection.fandom || ""
          )
            .toLowerCase()
            .includes(keyword)

          ||

          String(
            collection.collection_id || ""
          )
            .toLowerCase()
            .includes(keyword)

        );

      }
    );

  let html =
    '<div class="grid">';

  filtered.forEach(
    collection => {

      html += `

<div class="card">

<img
src="${collection.image || ""}"
alt="${escapeHtml(
  collection.name || ""
)}"
style="
width:100%;
height:180px;
object-fit:cover;
border-radius:14px;
background:#f1f5f9;
margin-bottom:12px;
">

<h3 style="margin:0 0 8px;">
${escapeHtml(
  collection.name || "-"
)}
</h3>

<button
type="button"
onclick="
  filterProductsByCollection(
    '${escapeJsString(
      collection.collection_id
    )}'
  )
"
style="
  width:auto;
  margin:6px 0;
  padding:6px 10px;
  border:none;
  border-radius:999px;
  background:#e0f2fe;
  color:#0369a1;
  font-weight:700;
  cursor:pointer;
"
>
📦
${getCollectionProductCount(
  collection.collection_id
)}
สินค้า
</button>

<p>
🆔
${escapeHtml(
  collection.collection_id || "-"
)}
</p>

<p>
🎮
${escapeHtml(
  collection.fandom || "-"
)}
</p>

<p>
📦
${escapeHtml(
  collection.collection_type || "-"
)}
</p>

<p>
สถานะ:
<b>
${escapeHtml(
  collection.status || "-"
)}
</b>
</p>

${
  collection.preorder_deadline
  ?
  `
  <p>
  📅 ปิดพรี:
  ${formatDateInput(
    collection.preorder_deadline
  )}
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
onclick="
openEditCollection(
  '${escapeJsString(
    collection.collection_id
  )}'
)
">
✏️ แก้ไข
</button>

<button
onclick="
toggleCollectionStatusAdmin(
  '${escapeJsString(
    collection.collection_id
  )}'
)
"
style="
background:
${
  collection.status === "active"
    ? "#ef4444"
    : "#22c55e"
};
">
${
  collection.status === "active"
    ? "🚫 ปิด Collection"
    : "✅ เปิด Collection"
}
</button>

</div>

</div>

`;

    }
  );

  html += "</div>";

  box.innerHTML =
    filtered.length
      ? html
      : "ไม่พบ Collection";

}

function openEditCollection(
  collectionId
){

  const collection =
    adminCollections.find(
      item =>
        String(
          item.collection_id
        ) ===
        String(collectionId)
    );

  if(!collection){

    alert(
      "ไม่พบข้อมูล Collection"
    );

    return;

  }

  document
    .getElementById(
      "editCollectionForm"
    )
    .innerHTML = `

<input
type="hidden"
id="e_edit_collection_id"
value="${escapeHtml(
  collection.collection_id
)}">

<div>
<label>ชื่อ Collection</label>

<input
id="e_collection_name"
value="${escapeHtml(
  collection.name || ""
)}">
</div>

<div>
<label>Fandom</label>

<input
id="e_collection_fandom"
value="${escapeHtml(
  collection.fandom || ""
)}">
</div>

<div>
<label>ประเภท Collection</label>

<input
id="e_collection_type"
value="${escapeHtml(
  collection.collection_type || ""
)}">
</div>

<div>
<label>วันปิดพรี</label>

<input
id="e_collection_deadline"
type="date"
value="${formatDateInput(
  collection.preorder_deadline
)}">
</div>

<div>
<label>เปลี่ยนรูปการ์ด</label>

<input
id="e_collection_image_file"
type="file"
accept="image/*">
</div>

<div>
<label>เปลี่ยนรูป Banner</label>

<input
id="e_collection_banner_file"
type="file"
accept="image/*">
</div>

<div class="full">
<label>คำอธิบาย</label>

<textarea
id="e_collection_description"
style="height:110px;">${escapeHtml(
  collection.description || ""
)}</textarea>
</div>

<div>
<label>

<input
id="e_collection_featured"
type="checkbox"
style="width:auto;"
${
  isCheckedValue(
    collection.featured
  )
    ? "checked"
    : ""
}>

แสดงเป็น Collection แนะนำ

</label>
</div>

`;

  document
    .getElementById(
      "editCollectionModal"
    )
    .classList.remove(
      "hidden"
    );

}

 async function submitCollectionEdit(){

  const btn =
    document.getElementById(
      "updateCollectionBtn"
    );

  const loading =
    document.getElementById(
      "updateCollectionLoading"
    );

  const payload = {

   collection_id:
  document
    .getElementById(
      "e_edit_collection_id"
    )
    .value,

    name:
      document
        .getElementById(
          "e_collection_name"
        )
        .value
        .trim(),

    fandom:
      document
        .getElementById(
          "e_collection_fandom"
        )
        .value
        .trim(),

    collection_type:
      document
        .getElementById(
          "e_collection_type"
        )
        .value
        .trim(),

    preorder_deadline:
      document
        .getElementById(
          "e_collection_deadline"
        )
        .value,

    description:
      document
        .getElementById(
          "e_collection_description"
        )
        .value,

    featured:
      document
        .getElementById(
          "e_collection_featured"
        )
        .checked
        ? "yes"
        : "",

    status:"active"

  };

  if(!payload.name){

    alert(
      "กรุณากรอกชื่อ Collection"
    );

    return;

  }

  const imageFile =
    document
      .getElementById(
        "e_collection_image_file"
      )
      .files[0];

  const bannerFile =
    document
      .getElementById(
        "e_collection_banner_file"
      )
      .files[0];

  btn.disabled = true;

  btn.textContent =
    "กำลังบันทึก...";

  loading.style.display =
    "block";

  try{

    if(imageFile){

      payload.image_base64 =
        await fileToBase64(
          imageFile
        );

    }

    if(bannerFile){

      payload.banner_base64 =
        await fileToBase64(
          bannerFile
        );

    }

    const formData =
      new FormData();

    formData.append(
      "action",
      "updateCollection"
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

    const result =
      await response.json();

    if(!result.success){

      alert(
        result.error ||
        "แก้ไข Collection ไม่สำเร็จ"
      );

      return;

    }

    alert(
      "แก้ไข Collection เรียบร้อยแล้ว"
    );

    closeEditCollectionModal();

    await loadAdminCollections();

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

function closeEditCollectionModal(){

  document
    .getElementById(
      "editCollectionModal"
    )
    .classList.add(
      "hidden"
    );

}

function refreshProductCollectionSelects(){

  const addSelect =
    document.getElementById(
      "p_collection_id"
    );

  if(addSelect){

    const currentValue =
      addSelect.value;

    addSelect.innerHTML = `

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

`;

    addSelect.value =
      currentValue;

  }

  const editSelect =
    document.getElementById(
      "e_collection_id"
    );

  if(editSelect){

    const currentValue =
      editSelect.value;

    editSelect.innerHTML = `

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

`;

    editSelect.value =
      currentValue;

  }

}

function getCollectionProductCount(
  collectionId
){

  return adminProducts.filter(
    product =>
      String(
        product.collection_id || ""
      ) ===
      String(collectionId || "")
  ).length;

}

function getCollectionNameById(
  collectionId
){

  const collection =
    adminCollections.find(item=>

      String(
        item.collection_id
      ) ===
      String(collectionId)

    );

  return collection
    ? collection.name || "-"
    : "-";

}

