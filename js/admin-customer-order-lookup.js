/*
=========================================
ADMIN CUSTOMER ORDER LOOKUP
ค้นหาออเดอร์เก่า + ใหม่ด้วย Twitter / X
=========================================
*/


function renderAdminCustomerOrderLookup(){

  const root =
    document.getElementById(
      "adminCustomerOrderLookup"
    );


  if(!root){

    return;

  }


  /*
  ถ้า render แล้ว
  ไม่ต้องล้างผลการค้นหา
  */

  if(
    root.dataset.rendered ===
    "true"
  ){

    return;

  }


  root.dataset.rendered =
    "true";


  root.innerHTML = `

<div class="card">

  <h2>
    🔎 ค้นหาออเดอร์ลูกค้า
  </h2>

  <p
  style="
  margin-top:4px;
  color:#64748b;
  line-height:1.6;
  "
  >
    ค้นหาจากแอค Twitter / X
    เพื่อดูออเดอร์ระบบใหม่และออเดอร์เก่าพร้อมกัน
  </p>


  <div
  style="
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  margin-top:16px;
  "
  >

    <input
    id="adminCustomerSocialSearch"
    type="text"
    placeholder="@username หรือ x.com/username"
    autocomplete="off"
    style="
    flex:1 1 260px;
    min-width:0;
    "
    >


    <button
    type="button"
    onclick="searchAdminCustomerOrders()"
    style="
    width:auto;
    "
    >
      ค้นหา
    </button>

  </div>


  <div
  id="adminCustomerOrderSearchStatus"
  style="
  margin-top:12px;
  color:#64748b;
  font-size:13px;
  "
  ></div>

</div>


<div
id="adminCustomerOrderSearchResult"
style="
margin-top:16px;
"
></div>

`;


  const input =
    document.getElementById(
      "adminCustomerSocialSearch"
    );


  input?.addEventListener(
    "keydown",
    event => {

      if(
        event.key ===
        "Enter"
      ){

        searchAdminCustomerOrders();

      }

    }
  );

}


async function searchAdminCustomerOrders(){

  const input =
    document.getElementById(
      "adminCustomerSocialSearch"
    );


  const statusBox =
    document.getElementById(
      "adminCustomerOrderSearchStatus"
    );


  const resultBox =
    document.getElementById(
      "adminCustomerOrderSearchResult"
    );


  if(
    !input ||
    !resultBox
  ){

    return;

  }


  const social =
    normalizeAdminCustomerSocial(
      input.value
    );


  if(!social){

    alert(
      "กรุณากรอกแอค Twitter / X"
    );

    return;

  }


  input.value =
    social;


  if(statusBox){

    statusBox.innerHTML =
      `⏳ กำลังค้นหา <b>${escapeAdminLookupHtml(
        social
      )}</b> ...`;

  }


  resultBox.innerHTML = `

<div class="card">

  กำลังค้นหาออเดอร์...

</div>

`;


  try{

    /*
    โหลดระบบใหม่ + Legacy พร้อมกัน
    */

    const [
      currentResult,
      legacyResult
    ] =
      await Promise.allSettled([

        fetchAdminCustomerOrders(
          "ordersBySocial",
          social
        ),

        fetchAdminCustomerOrders(
          "legacyOrdersBySocial",
          social
        )

      ]);


    const currentOrders =
      currentResult.status ===
      "fulfilled"
        ? extractAdminOrderArray(
            currentResult.value
          )
        : [];


    const legacyOrders =
      legacyResult.status ===
      "fulfilled"
        ? extractAdminOrderArray(
            legacyResult.value
          )
        : [];


    if(
      currentResult.status ===
      "rejected"
    ){

      console.error(
        "ordersBySocial error:",
        currentResult.reason
      );

    }


    if(
      legacyResult.status ===
      "rejected"
    ){

      console.error(
        "legacyOrdersBySocial error:",
        legacyResult.reason
      );

    }


    renderAdminCustomerOrderResults(
      social,
      currentOrders,
      legacyOrders
    );


    if(statusBox){

      statusBox.innerHTML = `

พบระบบใหม่
<b>${currentOrders.length}</b>
ออเดอร์

•

Legacy
<b>${legacyOrders.length}</b>
ออเดอร์

`;

    }


  }catch(error){

    console.error(
      "searchAdminCustomerOrders error:",
      error
    );


    if(statusBox){

      statusBox.textContent =
        "ค้นหาไม่สำเร็จ";

    }


    resultBox.innerHTML = `

<div
class="card"
style="
border:1px solid #fecaca;
background:#fff7f7;
color:#991b1b;
"
>

  ${escapeAdminLookupHtml(
    error.message ||
    String(error)
  )}

</div>

`;

  }

}


async function fetchAdminCustomerOrders(
  action,
  social
){

  const response =
    await fetch(

      API +
      "?action=" +
      encodeURIComponent(
        action
      ) +
      "&social=" +
      encodeURIComponent(
        social
      )

    );


  if(!response.ok){

    throw new Error(
      action +
      " HTTP " +
      response.status
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
      (
        "โหลด " +
        action +
        " ไม่สำเร็จ"
      )
    );

  }


  return result;

}


function extractAdminOrderArray(
  result
){

  if(
    Array.isArray(
      result
    )
  ){

    return result;

  }


  if(
    Array.isArray(
      result?.orders
    )
  ){

    return result.orders;

  }


  if(
    Array.isArray(
      result?.legacy_orders
    )
  ){

    return result.legacy_orders;

  }


  if(
    Array.isArray(
      result?.data
    )
  ){

    return result.data;

  }


  return [];

}


function renderAdminCustomerOrderResults(
  social,
  currentOrders,
  legacyOrders
){

  const root =
    document.getElementById(
      "adminCustomerOrderSearchResult"
    );


  if(!root){

    return;

  }


  const total =
    currentOrders.length +
    legacyOrders.length;


  if(total === 0){

    root.innerHTML = `

<div class="card">

  <div
  style="
  text-align:center;
  padding:25px 10px;
  color:#64748b;
  "
  >

    ไม่พบออเดอร์ของ

    <b>
      ${escapeAdminLookupHtml(
        social
      )}
    </b>

  </div>

</div>

`;

    return;

  }


  root.innerHTML = `

${renderAdminCustomerOrderSummary(
  currentOrders,
  legacyOrders
)}


${renderAdminCustomerOrderGroup(
  "🆕 ออเดอร์ระบบใหม่",
  currentOrders,
  "current"
)}


${renderAdminCustomerOrderGroup(
  "🗂️ ออเดอร์เก่า / Legacy",
  legacyOrders,
  "legacy"
)}

`;

}


function renderAdminCustomerOrderSummary(
  currentOrders,
  legacyOrders
){

  const currentStatus =
    countAdminOrderStatuses(
      currentOrders
    );


  const legacyStatus =
    countAdminOrderStatuses(
      legacyOrders
    );


  return `

<div class="card">

  <h2>
    📊 สรุป
  </h2>


  <div
  style="
  display:grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(150px,1fr)
    );
  gap:10px;
  margin-top:12px;
  "
  >

    <div
    style="
    padding:14px;
    border-radius:12px;
    background:#eff9ff;
    "
    >

      <b>
        ระบบใหม่
      </b>

      <div
      style="
      margin-top:5px;
      font-size:22px;
      font-weight:700;
      "
      >
        ${currentOrders.length}
      </div>

    </div>


    <div
    style="
    padding:14px;
    border-radius:12px;
    background:#f8fafc;
    "
    >

      <b>
        Legacy
      </b>

      <div
      style="
      margin-top:5px;
      font-size:22px;
      font-weight:700;
      "
      >
        ${legacyOrders.length}
      </div>

    </div>


    <div
    style="
    padding:14px;
    border-radius:12px;
    background:#f7fee7;
    "
    >

      <b>
        รวมทั้งหมด
      </b>

      <div
      style="
      margin-top:5px;
      font-size:22px;
      font-weight:700;
      "
      >
        ${
          currentOrders.length +
          legacyOrders.length
        }
      </div>

    </div>

  </div>


  <div
  style="
  margin-top:14px;
  font-size:12px;
  color:#64748b;
  line-height:1.8;
  "
  >

    <b>สถานะระบบใหม่:</b>
    ${
      renderAdminStatusCountText(
        currentStatus
      )
    }

    <br>

    <b>สถานะ Legacy:</b>
    ${
      renderAdminStatusCountText(
        legacyStatus
      )
    }

  </div>

</div>

`;

}


function renderAdminCustomerOrderGroup(
  title,
  orders,
  source
){

  if(
    !orders.length
  ){

    return `

<div class="card">

  <h2>
    ${title}
  </h2>

  <p
  style="
  color:#64748b;
  "
  >
    ไม่พบออเดอร์
  </p>

</div>

`;

  }


  return `

<div class="card">

  <h2>
    ${title}
  </h2>


  <div
  style="
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:12px;
  "
  >

    ${orders
      .map(
        order =>
          renderAdminCustomerOrderCard(
            order,
            source
          )
      )
      .join("")}

  </div>

</div>

`;

}


function renderAdminCustomerOrderCard(
  order,
  source
){

  const orderId =
    String(

      order.order_id ??
      order.legacy_id ??
      order.id ??
      "-"

    );


  const status =
    String(
      order.status ||
      order.order_status ||
      "-"
    );


  const paymentStatus =
    String(
      order.payment_status ||
      ""
    );


  const total =
    Number(
      order.total ??
      order.subtotal ??
      0
    );


  const createdAt =
    order.created_at ||
    order.order_date ||
    order.date ||
    "";


  const customerName =
    order.customer_name ||
    order.name ||
    "";


  return `

<div
style="
padding:13px;
border:1px solid #dbe7f1;
border-radius:13px;
background:#fff;
"
>

  <div
  style="
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
  flex-wrap:wrap;
  "
  >

    <div>

      <b>
        ${escapeAdminLookupHtml(
          orderId
        )}
      </b>

      ${
        customerName
          ? `

<div
style="
margin-top:4px;
font-size:12px;
color:#64748b;
"
>
  ${escapeAdminLookupHtml(
    customerName
  )}
</div>

`
          : ""
      }

    </div>


    <span
    style="
    padding:5px 9px;
    border-radius:999px;
    background:#eef8ff;
    color:#3476a2;
    font-size:11px;
    font-weight:700;
    "
    >
      ${escapeAdminLookupHtml(
        getAdminOrderStatusLabel(
          status
        )
      )}
    </span>

  </div>


  <div
  style="
  margin-top:9px;
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  font-size:12px;
  color:#64748b;
  "
  >

    ${
      paymentStatus
        ? `

<span>
  ชำระเงิน:
  <b>
    ${escapeAdminLookupHtml(
      paymentStatus
    )}
  </b>
</span>

`
        : ""
    }


    ${
      Number.isFinite(total) &&
      total > 0
        ? `

<span>
  ยอด:
  <b>
    ฿${total.toLocaleString(
      "th-TH"
    )}
  </b>
</span>

`
        : ""
    }


    ${
      createdAt
        ? `

<span>
  ${escapeAdminLookupHtml(
    formatAdminCustomerOrderDate(
      createdAt
    )
  )}
</span>

`
        : ""
    }

  </div>


  ${
    source === "current"
      ? `

<div
style="
margin-top:9px;
font-size:11px;
color:#16a34a;
"
>
  ● ระบบใหม่
</div>

`
      : `

<div
style="
margin-top:9px;
font-size:11px;
color:#64748b;
"
>
  ● Legacy
</div>

`
  }

  ${renderAdminCustomerOrderDetailButton(
  order,
  source
)}

</div>

`;

}


function countAdminOrderStatuses(
  orders
){

  const result = {};


  orders.forEach(
    order => {

      const status =
        String(
          order.status ||
          order.order_status ||
          "unknown"
        )
          .trim()
          .toLowerCase();


      result[
        status
      ] =
        (
          result[
            status
          ] || 0
        ) + 1;

    }
  );


  return result;

}


function renderAdminStatusCountText(
  map
){

  const entries =
    Object.entries(
      map
    );


  if(!entries.length){

    return "-";

  }


  return entries
    .map(
      (
        [
          status,
          count
        ]
      ) =>
        escapeAdminLookupHtml(
          getAdminOrderStatusLabel(
            status
          )
        ) +
        " " +
        count
    )
    .join(
      " • "
    );

}


function getAdminOrderStatusLabel(
  status
){

  const value =
    String(
      status || ""
    )
      .trim()
      .toLowerCase();


  const map = {

    pending_order:
      "รอกดสั่งสินค้า",

    pending:
      "กดสั่งสินค้าแล้ว",

    china_arrived:
      "ถึงโกดังจีน",

    shipping_to_th:
      "กำลังมาไทย",

    ready_to_ship:
      "เตรียมจัดส่ง",

    shipped:
      "จัดส่งแล้ว",

    completed:
      "เสร็จสิ้น",

    cancelled:
      "ยกเลิก"

  };


  return (
    map[
      value
    ] ||
    status ||
    "-"
  );

}


function normalizeAdminCustomerSocial(
  value
){

  let social =
    String(
      value || ""
    ).trim();


  if(!social){

    return "";

  }


  /*
  URL → username
  */

  social =
    social.replace(
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i,
      ""
    );


  social =
    social.split(
      /[/?#]/
    )[0];


  social =
    social.replace(
      /^@+/,
      ""
    );


  social =
    social.trim();


  if(!social){

    return "";

  }


  return (
    "@" +
    social
  );

}


function formatAdminCustomerOrderDate(
  value
){

  const date =
    new Date(
      value
    );


  if(
    Number.isNaN(
      date.getTime()
    )
  ){

    return String(
      value || ""
    );

  }


  return date.toLocaleString(
    "th-TH",
    {

      dateStyle:
        "medium",

      timeStyle:
        "short"

    }
  );

}


function escapeAdminLookupHtml(
  value
){

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}

function renderAdminCustomerOrderDetailButton(
  order,
  source
){

  const orderId =
    String(
      source === "legacy"
        ? (
            order.legacy_id ??
            order.order_id ??
            order.id ??
            ""
          )
        : (
            order.order_id ??
            order.id ??
            ""
          )
    ).trim();


  if(!orderId){

    return "";

  }


  const detailId =
    "adminCustomerOrderDetail_" +
    source +
    "_" +
    orderId.replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );


  return `

<div
style="
margin-top:12px;
"
>

  <button
  type="button"
  style="
  width:auto;
  padding:7px 11px;
  font-size:12px;
  "
  onclick='toggleAdminCustomerOrderDetail(
    ${JSON.stringify(source)},
    ${JSON.stringify(orderId)},
    ${JSON.stringify(detailId)},
    this
  )'
  >
    ดูรายละเอียด
  </button>


  <div
  id="${escapeAdminLookupHtml(
    detailId
  )}"
  style="
  display:none;
  margin-top:10px;
  "
  ></div>

</div>

`;

}

async function toggleAdminCustomerOrderDetail(
  source,
  orderId,
  detailId,
  button
){

  const box =
    document.getElementById(
      detailId
    );


  if(!box){

    return;

  }


  if(
    box.style.display !==
    "none"
  ){

    box.style.display =
      "none";


    if(button){

      button.textContent =
        "ดูรายละเอียด";

    }


    return;

  }


  box.style.display =
    "block";


  if(button){

    button.textContent =
      "ซ่อนรายละเอียด";

  }


  if(
    box.dataset.loaded ===
    "true"
  ){

    return;

  }


  box.innerHTML = `

<div
style="
padding:12px;
border-radius:10px;
background:#f8fafc;
color:#64748b;
font-size:12px;
"
>
  ⏳ กำลังโหลดรายละเอียดออเดอร์...
</div>

`;


  try{

    const detail =
      source === "legacy"
        ? await fetchAdminLegacyOrderDetail(
            orderId
          )
        : await fetchAdminCurrentOrderDetail(
            orderId
          );


    renderAdminCustomerOrderDetail(
      box,
      detail,
      source
    );


    box.dataset.loaded =
      "true";


  }catch(error){

    console.error(
      "toggleAdminCustomerOrderDetail error:",
      error
    );


    box.innerHTML = `

<div
style="
padding:12px;
border:1px solid #fecaca;
border-radius:10px;
background:#fff7f7;
color:#991b1b;
font-size:12px;
"
>
  โหลดรายละเอียดไม่สำเร็จ:
  ${escapeAdminLookupHtml(
    error.message ||
    String(error)
  )}
</div>

`;

  }

}

async function fetchAdminCurrentOrderDetail(
  orderId
){

  const response =
    await fetch(

      API +
      "?action=getOrder" +
      "&order_id=" +
      encodeURIComponent(
        orderId
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
    result &&
    result.success === false
  ){

    throw new Error(
      result.error ||
      "โหลดออเดอร์ไม่สำเร็จ"
    );

  }


  return (
    result.order ||
    result
  );

}

async function fetchAdminLegacyOrderDetail(
  orderId
){

  const response =
    await fetch(

      API +
      "?action=adminLegacyOrderDetail" +
      "&order_id=" +
      encodeURIComponent(
        orderId
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
      "โหลด Legacy Order ไม่สำเร็จ"
    );

  }


  return (
    result.order ||
    result
  );

}

function renderAdminCustomerOrderDetail(
  box,
  detail,
  source
){

  const items =
    Array.isArray(
      detail?.items
    )
      ? detail.items
      : Array.isArray(
          detail?.order_items
        )
        ? detail.order_items
        : [];


  const status =
    detail?.status ||
    detail?.order_status ||
    "-";


  const total =
    Number(
      detail?.total ??
      detail?.subtotal ??
      0
    );


  let html = `

<div
style="
padding:12px;
border:1px solid #dbe7f1;
border-radius:12px;
background:#f8fafc;
"
>

  <div
  style="
  display:flex;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
  font-size:12px;
  "
  >

    <span>
      สถานะ:
      <b>
        ${escapeAdminLookupHtml(
          getAdminOrderStatusLabel(
            status
          )
        )}
      </b>
    </span>


    ${
      Number.isFinite(total) &&
      total > 0
        ? `

<span>
  ยอดรวม:
  <b>
    ฿${total.toLocaleString(
      "th-TH"
    )}
  </b>
</span>

`
        : ""
    }

  </div>

`;


  if(
    !items.length
  ){

    html += `

<div
style="
padding:10px 0;
color:#64748b;
font-size:12px;
"
>
  ไม่พบรายการสินค้าใน response นี้
</div>

`;

  }else{

    html += `

<div
style="
display:flex;
flex-direction:column;
gap:8px;
"
>

${items
  .map(
    item =>
      renderAdminCustomerOrderItem(
        item
      )
  )
  .join("")}

</div>

`;

  }


  html += `

</div>

`;


  box.innerHTML =
    html;

}

function renderAdminCustomerOrderItem(
  item
){

  const name =
    item.name ||
    item.product_name ||
    "สินค้า";


  const qty =
    Number(
      item.qty ??
      item.quantity ??
      1
    );


  const price =
    Number(
      item.price ??
      item.unit_price ??
      item.final_price ??
      0
    );


  const image =
    String(
      item.option_image ||
      item.image ||
      ""
    ).trim();


  const selectedOptions =
    item.selected_options &&
    typeof item.selected_options ===
      "object"
      ? item.selected_options
      : {};


  const optionText =
    Object
      .entries(
        selectedOptions
      )
      .map(
        ([key,value]) =>
          escapeAdminLookupHtml(
            key
          ) +
          ": " +
          escapeAdminLookupHtml(
            Array.isArray(value)
              ? value.join(", ")
              : value
          )
      )
      .join(" • ");


  return `

<div
style="
display:grid;
grid-template-columns:
  ${image ? "64px" : "1px"}
  minmax(0,1fr);
gap:${image ? "10px" : "0"};
padding:10px;
border:1px solid #e2e8f0;
border-radius:10px;
background:#fff;
"
>

  ${
    image
      ? `

<img
src="${escapeAdminLookupHtml(
  image
)}"
alt=""
style="
width:64px;
height:64px;
object-fit:cover;
border-radius:9px;
background:#eef7fc;
"
>

`
      : "<div></div>"
  }


  <div>

    <div
    style="
    font-size:13px;
    font-weight:700;
    "
    >
      ${escapeAdminLookupHtml(
        name
      )}
    </div>


    ${
      optionText
        ? `

<div
style="
margin-top:4px;
font-size:11px;
color:#64748b;
"
>
  ${optionText}
</div>

`
        : ""
    }


    <div
    style="
    margin-top:6px;
    display:flex;
    gap:12px;
    flex-wrap:wrap;
    font-size:11px;
    color:#64748b;
    "
    >

      <span>
        จำนวน
        <b>${qty}</b>
      </span>

      ${
        Number.isFinite(price) &&
        price >= 0
          ? `

<span>
  ราคาต่อชิ้น
  <b>
    ฿${price.toLocaleString(
      "th-TH"
    )}
  </b>
</span>

`
          : ""
      }

    </div>

  </div>

</div>

`;

}
