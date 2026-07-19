const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";
let adminProducts = [];
let adminProductOptions = [];

let selectedOptionProductId = "";
let editingOptionId = "";
let highlightedProductId = "";

function login(){

  const password =
    document.getElementById("adminPassword").value;

  if(password === "Rin@Saeh13579"){

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminContent").style.display = "block";

    sessionStorage.setItem("adminLoggedIn","true");

    loadAdminData();

  }else{
    alert("รหัสผ่านไม่ถูกต้อง");
  }

}

function logout(){
  sessionStorage.removeItem("adminLoggedIn");
  location.reload();
}

if(sessionStorage.getItem("adminLoggedIn") === "true"){
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("adminContent").style.display = "block";
  loadAdminData();
}

function showAdminTab(tab){

const tabs = [
  "dashboard",
  "products",
  "options",
  "orders",
  "address",
  "collections",
  "gifts"
];
  
  tabs.forEach(name=>{

    document
      .getElementById("tab_" + name)
      .classList.toggle(
        "hidden",
        name !== tab
      );

    document
      .getElementById("nav_" + name)
      .classList.toggle(
        "active",
        name === tab
      );

  });

 if(tab === "gifts"){

  renderGiftManager();

  loadGiftCampaigns();

}

}

async function loadAdminData(){

  loadStats();

  loadTopProducts();

  loadTopFandoms();

  loadOrders();

  loadAddressRequests();

  renderCollectionManager();

  await loadAdminCollections();

  renderProductManager();

  renderOptionManager();

  await loadAdminProducts();

}

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

async function loadStats(){

  const response =
    await fetch(API + "?action=stats");

  const stats =
    await response.json();

  document.getElementById("stats").innerHTML = `
    <div class="grid">

      <div class="card">
      📦<br>${stats.totalOrders} ออเดอร์
      </div>

      <div class="card">
      💰<br>${stats.totalSales} บาท
      </div>

      <div class="card">
      🚚<br>${stats.pendingShipping} รอส่ง
      </div>

      <div class="card">
      📍<br>${stats.pendingAddress} คำขอ
      </div>

      <div class="card">
      💸<br>${stats.todaySales} บาท<br>วันนี้
      </div>

      <div class="card">
      📅<br>${stats.monthSales} บาท<br>เดือนนี้
      </div>

    </div>
  `;

}

async function loadTopProducts(){

  const response =
    await fetch(API + "?action=topProducts");

  const result =
    await response.json();

  let html = `
    <div class="card">
    <h2>🏆 สินค้าขายดีที่สุด</h2>
  `;

  result.products.forEach((product,index)=>{

    html += `

<p
style="
display:flex;
justify-content:space-between;
align-items:center;
gap:10px;
">

<span>

${index + 1}.

${escapeHtml(
  product.name
)}

(${product.qty} ชิ้น)

</span>

<button
style="
width:auto;
padding:5px 10px;
font-size:13px;
"
onclick="
openProductSearch(
'${escapeJsString(
  product.name
)}'
)
">

เปิดสินค้า

</button>

</p>

`;

  });

  html += "</div>";

  document.getElementById("topProducts").innerHTML = html;

}

async function loadTopFandoms(){

  const container =
    document.getElementById(
      "topFandoms"
    );

  if(!container){

    return;

  }

  try{

    const response =
      await fetch(
        API + "?action=topFandoms"
      );

    const result =
      await response.json();

    const fandoms =
      Array.isArray(
        result.fandoms
      )
        ? result.fandoms
        : [];

    let html = `
      <div class="card">

        <h2>
          🌟 Fandom ยอดนิยม
        </h2>
    `;

    if(
      fandoms.length === 0
    ){

      html += `

        <p
        style="
        color:#777;
        ">
          ยังไม่มีข้อมูล Fandom
        </p>

      `;

    }
    else{

      fandoms.forEach(
        (
          fandom,
          index
        ) => {

          const fandomName =
            fandom.fandom ||
            fandom.name ||
            "";

          const qty =
            fandom.qty ||
            fandom.quantity ||
            0;

          html += `

            <p
            style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
            ">

              <span>

                ${index + 1}.

                ${escapeHtml(
                  fandomName
                )}

                (${qty} ชิ้น)

              </span>

              <button
              style="
              width:auto;
              padding:5px 10px;
              font-size:13px;
              "
              onclick="
              openProductSearch(
                '${escapeJsString(
                  fandomName
                )}'
              )
              ">
                เปิดสินค้า
              </button>

            </p>

          `;

        }
      );

    }

    html += `
      </div>
    `;

    container.innerHTML =
      html;

  }
  catch(error){

    console.error(
      "loadTopFandoms error:",
      error
    );

    container.innerHTML = `

      <div class="card">

        <h2>
          🌟 Fandom ยอดนิยม
        </h2>

        <p
        style="
        color:#d9534f;
        ">
          โหลดข้อมูลไม่สำเร็จ
        </p>

      </div>

    `;

  }

}
async function loadOrders(){

  const response =
    await fetch(API + "?action=orders");

  const result =
    await response.json();

  let html = "";

  result.orders.reverse();

  result.orders.forEach(order=>{

    if(
      order.payment_status !== "paid" ||
      order.status === "completed"
    ){
      return;
    }

    html += renderOrderCard(order);

  });

  document.getElementById("orders").innerHTML = html;

  result.orders.forEach(order=>{

    const select =
      document.getElementById("status_" + order.order_id);

    if(select){
      select.value = order.status;
      toggleOrderFields(order.order_id);
    }

  });

}

function renderOrderCard(order){

  return `
    <div class="order-card">

      <h3>${order.order_id}</h3>

      <p>ลูกค้า: ${order.customer_name}</p>
      <p>${order.email}</p>
      <p>สถานะปัจจุบัน: ${order.status}</p>

      <select
      id="status_${order.order_id}"
      onchange="toggleOrderFields('${order.order_id}')"
      >
        <option value="pending">รอจัดการ</option>
        <option value="china_arrived">ถึงโกดังจีนแล้ว</option>
        <option value="shipping_to_th">กำลังมาไทย</option>
        <option value="ready_to_ship">เตรียมจัดส่ง</option>
        <option value="shipped">จัดส่งแล้ว</option>
      </select>

      <br><br>

      <div
      id="feeBox_${order.order_id}"
      style="display:none;"
      >
        <p>ค่านำเข้า / ค่าส่งในไทย</p>

        <input
        id="import_${order.order_id}"
        type="number"
        placeholder="ค่านำเข้า">

        <br><br>

        <input
        id="domestic_${order.order_id}"
        type="number"
        placeholder="ค่าส่งในไทย">

        <br><br>
      </div>

      <div
      id="trackingBox_${order.order_id}"
      style="display:none;"
      >
        <input
        id="courier_${order.order_id}"
        placeholder="ขนส่ง">

        <br><br>

        <input
        id="tracking_${order.order_id}"
        placeholder="เลขพัสดุ">

        <br><br>
      </div>

      <button onclick="updateOrderStatus('${order.order_id}')">
      อัปเดตสถานะ
      </button>

    </div>
  `;

}

function toggleOrderFields(orderId){

  const status =
    document.getElementById("status_" + orderId).value;

  const feeBox =
    document.getElementById("feeBox_" + orderId);

  const trackingBox =
    document.getElementById("trackingBox_" + orderId);

  if(!feeBox || !trackingBox){
    return;
  }

  feeBox.style.display =
    status === "ready_to_ship"
      ? "block"
      : "none";

  trackingBox.style.display =
    status === "shipped"
      ? "block"
      : "none";

}

async function updateOrderStatus(orderId){

  const status =
    document.getElementById("status_" + orderId).value;

  const payload = {
    order_id: orderId,
    status: status
  };

  if(status === "ready_to_ship"){

    payload.import_fee_round2 =
      Number(
        document.getElementById("import_" + orderId).value || 0
      );

    payload.domestic_shipping_fee =
      Number(
        document.getElementById("domestic_" + orderId).value || 0
      );

  }

  if(status === "shipped"){

    payload.courier =
      document.getElementById("courier_" + orderId).value;

    payload.tracking_no =
      document.getElementById("tracking_" + orderId).value;

  }

  const formData =
    new FormData();

  formData.append(
    "payload",
    JSON.stringify(payload)
  );

  const response =
    await fetch(
      API + "?action=updateOrderStatus",
      {
        method:"POST",
        body:formData
      }
    );

  const result =
    await response.json();

  alert(
    result.success
      ? "อัปเดตสถานะแล้ว"
      : result.error || "อัปเดตไม่สำเร็จ"
  );

  loadOrders();

}

async function loadAddressRequests(){

  const response =
    await fetch(API + "?action=addressChanges");

  const result =
    await response.json();

  let html = "";

  result.requests.reverse();

  result.requests.forEach(req=>{

    if(req.status === "completed"){
      return;
    }

    html += `
      <div class="warning-card">

        <h3>${req.request_id}</h3>

        <p>Order: ${req.order_id}</p>
        <p>ชื่อ: ${req.customer_name}</p>
        <p>โทร: ${req.phone}</p>
        <p>Social: ${req.social}</p>
        <p>ที่อยู่ใหม่: ${req.address}</p>

        <p>
        สถานะ: ${req.status}
        <br><br>

        <button onclick="completeAddressRequest('${req.request_id}')">
        ✅ ดำเนินการแล้ว
        </button>
        </p>

      </div>
    `;

  });

  document.getElementById("addressRequests").innerHTML = html;

}

async function completeAddressRequest(requestId){

  const formData =
    new FormData();

  formData.append(
    "payload",
    JSON.stringify({
      request_id: requestId
    })
  );

  const response =
    await fetch(
      API + "?action=completeAddressRequest",
      {
        method:"POST",
        body:formData
      }
    );

  const result =
    await response.json();

  alert(
    result.success
      ? "อัปเดตแล้ว"
      : "ผิดพลาด"
  );

  loadAddressRequests();

}

function fileToBase64(file){

  return new Promise((resolve,reject)=>{

    const reader =
      new FileReader();

    reader.onload =
      () => resolve(reader.result);

    reader.onerror =
      reject;

    reader.readAsDataURL(file);

  });

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
  result.products || [];

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

  function openProductSearch(
  keyword
){

  showAdminTab(
    "products"
  );

  requestAnimationFrame(()=>{

    const input =
      document.getElementById(
        "productSearch"
      );

    if(!input){
      return;
    }

    input.value =
      String(keyword || "");

    renderAdminProductList();

    document
      .getElementById(
        "productManager"
      )
      ?.scrollIntoView({

        behavior:"smooth",
        block:"start"

      });

  });

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

function escapeHtml(value){

  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}

function formatDateInput(value){

  if(!value){
    return "";
  }

  const date =
    new Date(value);

  if(isNaN(date.getTime())){
    return "";
  }

  return date
    .toISOString()
    .split("T")[0];

}

function isCheckedValue(value){

  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "1"
  );

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

function escapeJsString(
  value
){

  return String(
    value || ""
  )
    .replaceAll(
      "\\",
      "\\\\"
    )
    .replaceAll(
      "'",
      "\\'"
    )
    .replaceAll(
      "\n",
      "\\n"
    )
    .replaceAll(
      "\r",
      ""
    );

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
