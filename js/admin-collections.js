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

async function saveCollectionFromAdmin(){

  const btn =
    document.getElementById(
      "saveCollectionBtn"
    );

  const loading =
    document.getElementById(
      "saveCollectionLoading"
    );

  const payload = {

    name:
      document
        .getElementById("c_name")
        .value
        .trim(),

    fandom:
      document
        .getElementById("c_fandom")
        .value
        .trim(),

    collection_type:
      document
        .getElementById("c_type")
        .value
        .trim(),

    preorder_deadline:
      document
        .getElementById("c_deadline")
        .value,

    description:
      document
        .getElementById(
          "c_description"
        )
        .value,

    featured:
      document
        .getElementById("c_featured")
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
        "c_image_file"
      )
      .files[0];

  const bannerFile =
    document
      .getElementById(
        "c_banner_file"
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
      "saveCollection"
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
        "เพิ่ม Collection ไม่สำเร็จ"
      );

      return;

    }

    alert(
      "เพิ่ม Collection แล้ว: " +
      result.collection_id
    );

    renderCollectionManager();

    await loadAdminCollections();

  }catch(error){

    console.error(error);

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }finally{

    const newBtn =
      document.getElementById(
        "saveCollectionBtn"
      );

    const newLoading =
      document.getElementById(
        "saveCollectionLoading"
      );

    if(newBtn){

      newBtn.disabled = false;

      newBtn.textContent =
        "บันทึก Collection";

    }

    if(newLoading){

      newLoading.style.display =
        "none";

    }

  }

}

async function loadAdminCollections(){

  /*
  adminCollectionList
  มีเฉพาะหน้า Collection Manager

  แต่ adminCollections ถูกใช้โดย
  Products / Options / Gifts ด้วย

  ดังนั้นห้าม return เมื่อไม่มี box
  */

  const box =
    document.getElementById(
      "adminCollectionList"
    );


  try{

   const response =
  await fetch(
    API +
      "?action=adminCollections" +
      "&_=" +
      Date.now(),
    {
      cache:"no-store"
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
        "โหลด Collections ไม่สำเร็จ"
      );

    }


    adminCollections =
      Array.isArray(
        result.collections
      )
        ? result.collections
        : [];


    /*
    =========================================
    COLLECTION MANAGER

    render เฉพาะเมื่อ element มีอยู่
    =========================================
    */

    if(
      box &&
      typeof renderAdminCollectionList ===
        "function"
    ){

      renderAdminCollectionList();

    }


    /*
    =========================================
    PRODUCT / OPTION DROPDOWNS
    =========================================
    */

    if(
      typeof refreshProductCollectionSelects ===
        "function"
    ){

      refreshProductCollectionSelects();

    }


    /*
    Gift Manager ไม่จำเป็นต้อง render
    ทุกครั้งที่โหลด Collection

    ถ้าเปิด Gift tab ค่อย render เอง
    */


    return {

      success:true,

      count:
        adminCollections.length

    };


  }catch(error){

    console.error(
      "loadAdminCollections error:",
      error
    );


    if(box){

      box.textContent =
        "โหลด Collections ไม่สำเร็จ";

    }


    throw error;

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

async function toggleCollectionStatusAdmin(
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

  const isActive =
    collection &&
    collection.status ===
    "active";

  const ok =
    confirm(
      isActive
        ? "ต้องการปิด Collection นี้ใช่ไหม?"
        : "ต้องการเปิด Collection นี้ใช่ไหม?"
    );

  if(!ok){
    return;
  }

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "toggleCollectionStatus"
    );

    formData.append(
      "payload",
      JSON.stringify({
        collection_id:
          collectionId
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
        "เปลี่ยนสถานะไม่สำเร็จ"
      );

      return;

    }

    alert(
      result.status === "active"
        ? "เปิด Collection แล้ว"
        : "ปิด Collection แล้ว"
    );

    await loadAdminCollections();

  }catch(error){

    console.error(error);

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

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

  /*
  =========================================
  ADD PRODUCT — COLLECTION
  =========================================
  */

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
  .map(
    collection => `

<option
value="${escapeHtml(
  collection.collection_id
)}"
>

${escapeHtml(
  collection.name || "-"
)}

</option>

`
  )
  .join("")}

`;


    addSelect.value =
      currentValue;

  }


  /*
  =========================================
  EDIT PRODUCT — COLLECTION
  =========================================
  */

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
  .map(
    collection => `

<option
value="${escapeHtml(
  collection.collection_id
)}"
>

${escapeHtml(
  collection.name || "-"
)}

</option>

`
  )
  .join("")}

`;


    editSelect.value =
      currentValue;

  }


  /*
  =========================================
  PRODUCT LIST — COLLECTION FILTER
  =========================================
  */

  const filterSelect =
    document.getElementById(
      "productCollectionFilter"
    );


  if(filterSelect){

    const currentValue =
      filterSelect.value;


    filterSelect.innerHTML = `

<option value="">
ทุก Collection
</option>

${adminCollections
  .map(
    collection => `

<option
value="${escapeHtml(
  collection.collection_id
)}"
>

${escapeHtml(
  collection.name || "-"
)}

</option>

`
  )
  .join("")}

`;


    filterSelect.value =
      currentValue;


    /*
    ถ้าค่าเดิมไม่มีอยู่แล้ว
    ให้กลับไปทุก Collection
    */

    if(
      filterSelect.value !==
      currentValue
    ){

      filterSelect.value = "";

    }

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

