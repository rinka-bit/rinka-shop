 /*
=========================================
RINKA ADMIN — ORDER MANAGER
=========================================
*/

let adminOrdersCache = [];

let adminOrderBaseCache = [];


/*
=========================================
SHIPMENT CACHE
=========================================
*/

const adminShipmentCache = {};

const adminShipmentLoading = {};


let adminOrderStatusFilter =
  "pending_order";


let adminShippedDateFilter =
  "30";


let adminShippedSearch =
  "";


let adminShippedCustomStart =
  "";


let adminShippedCustomEnd =
  "";


/*
=========================================
LOAD ORDERS
=========================================
*/

async function loadOrders(){

  const box =
    document.getElementById(
      "orders"
    );


  if(box){

    box.innerHTML = `

<div class="card">
⏳ กำลังโหลดออเดอร์...
</div>

`;

  }


  try{

    const response =
      await fetch(
        API +
        "?action=orders"
      );


    if(!response.ok){

      throw new Error(
        "HTTP " +
        response.status
      );

    }


    const result =
      await response.json();


    const rawOrders =
      Array.isArray(
        result.orders
      )
        ? [
            ...result.orders
          ].reverse()

        : Array.isArray(
            result
          )
          ? [
              ...result
            ].reverse()

          : [];


    /*
    =====================================
    BASE CACHE

    เก็บ Paid Orders ทั้งหมด
    รวม shipped / completed
    =====================================
    */

    adminOrderBaseCache =
      rawOrders.filter(
        order => {

          return (
            String(
              order.payment_status || ""
            )
              .trim()
              .toLowerCase() ===
            "paid"
          );

        }
      );


    /*
    =====================================
    ACTIVE ORDER MANAGER

    - completed ไม่แสดง
    - shipped:
        ถ้ายังไม่เกิน 3 วัน
        ยังแสดงใน Order Manager
    =====================================
    */

    const activeOrders =
      adminOrderBaseCache.filter(
        order =>
          isAdminActiveOrder(
            order
          )
      );


    /*
    โหลด Detail เฉพาะ Active Orders

    ป้องกัน Archive เก่าหลายร้อยออเดอร์
    ยิง getOrder ทีละใบตอนเปิด Admin
    =====================================
    */

   adminOrdersCache =
  activeOrders;

    renderAdminOrders();


    /*
    ถ้าหน้า Archive เปิดอยู่
    ให้อัปเดตหน้า Archive ด้วย
    */

    const shippedTab =
      document.getElementById(
        "tab_shipped_orders"
      );


    if(
      shippedTab &&
      !shippedTab.classList.contains(
        "hidden"
      ) &&
      typeof renderAdminShippedOrders ===
        "function"
    ){

      renderAdminShippedOrders();

    }


  }catch(error){

    console.error(
      "loadOrders error:",
      error
    );


    if(box){

      box.innerHTML = `

<div
class="card"
style="
background:#fff1f2;
border-color:#fecdd3;
color:#be123c;
"
>

โหลดออเดอร์ไม่สำเร็จ

<br><br>

${escapeAdminOrderHtml(
  error.message ||
  String(error)
)}

<br><br>

<button
type="button"
onclick="loadOrders()"
>
ลองใหม่
</button>

</div>

`;

    }


    const shippedBox =
      document.getElementById(
        "shippedOrders"
      );


    if(shippedBox){

      shippedBox.innerHTML = `

<div
class="card"
style="
background:#fff1f2;
border-color:#fecdd3;
color:#be123c;
"
>

โหลดออเดอร์ที่จัดส่งแล้วไม่สำเร็จ

</div>

`;

    }

  }

}

/*
=========================================
ACTIVE / ARCHIVED ORDER HELPERS
=========================================
*/

function getAdminOrderShippedTime(
  order
){

  if(
    !order ||
    !order.shipped_at
  ){

    return null;

  }


  const date =
    new Date(
      order.shipped_at
    );


  if(
    Number.isNaN(
      date.getTime()
    )
  ){

    return null;

  }


  return date;

}


function isAdminShippedOlderThanDays(
  order,
  days
){

  const shippedDate =
    getAdminOrderShippedTime(
      order
    );


  if(!shippedDate){

    return false;

  }


  const age =
    Date.now() -
    shippedDate.getTime();


  return (
    age >
    Number(days) *
    24 *
    60 *
    60 *
    1000
  );

}


function isAdminActiveOrder(
  order
){

  const status =
    String(
      order?.status || ""
    )
      .trim()
      .toLowerCase();


  /*
  Completed เข้า Archive เสมอ
  */

  if(
    status ===
    "completed"
  ){

    return false;

  }


  /*
  Shipped เกิน 3 วัน
  เข้า Archive
  */

  if(
    status ===
      "shipped" &&
    isAdminShippedOlderThanDays(
      order,
      3
    )
  ){

    return false;

  }


  /*
  สถานะอื่นทั้งหมด
  + shipped ภายใน 3 วัน
  อยู่หน้า Order Manager
  */

  return true;

}


function isAdminArchivedOrder(
  order
){

  const status =
    String(
      order?.status || ""
    )
      .trim()
      .toLowerCase();


  if(
    status ===
    "completed"
  ){

    return true;

  }


  if(
    status ===
      "shipped" &&
    isAdminShippedOlderThanDays(
      order,
      3
    )
  ){

    return true;

  }


  return false;

}

/*
=========================================
LOAD ORDER DETAIL
=========================================
*/

async function loadAdminOrderDetail(
  baseOrder
){

  if(!baseOrder){

    return {};

  }

  const hasItems =
    Array.isArray(
      baseOrder.items
    );

  const hasGifts =
    Array.isArray(
      baseOrder.gifts
    );


  if(
    hasItems &&
    hasGifts
  ){

    return baseOrder;

  }


  const orderId =
    String(
      baseOrder.order_id || ""
    ).trim();


  if(!orderId){

    return baseOrder;

  }


 const actions = [

  "getOrder"

];


  for(const action of actions){

    try{

      const response =
        await fetch(

          API +

          "?action=" +
          encodeURIComponent(
            action
          ) +

          "&order_id=" +
          encodeURIComponent(
            orderId
          )

        );


      if(!response.ok){

        continue;

      }


      const result =
        await response.json();


      if(
        result &&
        result.success === false
      ){

        continue;

      }


      const detail =
        result.order &&
        typeof result.order ===
          "object"

          ? result.order

          : result;


      if(
        !detail ||
        typeof detail !==
          "object"
      ){

        continue;

      }


      return {

        ...baseOrder,

        ...detail,

        items:
          Array.isArray(
            detail.items
          )
            ? detail.items
            : Array.isArray(
                result.items
              )
              ? result.items
              : Array.isArray(
                  baseOrder.items
                )
                ? baseOrder.items
                : [],

        gifts:
          Array.isArray(
            detail.gifts
          )
            ? detail.gifts
            : Array.isArray(
                result.gifts
              )
              ? result.gifts
              : Array.isArray(
                  baseOrder.gifts
                )
                ? baseOrder.gifts
                : []

      };

    }catch(error){

      console.warn(
        "โหลดรายละเอียดออเดอร์ไม่สำเร็จ:",
        action,
        orderId,
        error
      );

    }

  }


  return {

    ...baseOrder,

    items:
      Array.isArray(
        baseOrder.items
      )
        ? baseOrder.items
        : [],

    gifts:
      Array.isArray(
        baseOrder.gifts
      )
        ? baseOrder.gifts
        : []

  };

}


/*
=========================================
RENDER ORDER LIST
=========================================
*/

function renderAdminOrders(){

  const box =
    document.getElementById(
      "orders"
    );

  if(!box){
    return;
  }


  if(
    !Array.isArray(
      adminOrdersCache
    ) ||
    adminOrdersCache.length === 0
  ){

    box.innerHTML = `

<div class="card">
ยังไม่มีออเดอร์ที่ต้องดำเนินการ
</div>

`;

    return;

  }


  const statusGroups = [

    {
      value:"pending_order",
      label:"รอกดสั่งสินค้า"
    },

    {
      value:"pending",
      label:"กดสั่งสินค้าแล้ว"
    },

    {
      value:"china_arrived",
      label:"ถึงโกดังจีน"
    },

    {
      value:"shipping_to_th",
      label:"กำลังมาไทย"
    },

    {
      value:"ready_to_ship",
      label:"เตรียมจัดส่ง"
    },

    {
      value:"shipped",
      label:"จัดส่งแล้ว"
    }

  ];


  /*
  =====================================
  STATUS COUNTS
  =====================================
  */

  const statusCounts = {};

  statusGroups.forEach(
    group => {

      statusCounts[
        group.value
      ] =
        adminOrdersCache.filter(
          order =>

            String(
              order.status ||
"pending_order"
            ).trim() ===
            group.value
        ).length;

    }
  );


  /*
  =====================================
  FILTER BUTTONS
  =====================================
  */

  const filterHtml = `

<div
class="card"
style="
display:flex;
gap:10px;
flex-wrap:wrap;
align-items:center;
"
>

${statusGroups
  .map(
    group => {

      const active =
        adminOrderStatusFilter ===
        group.value;

      return `

<button
type="button"
onclick="
setAdminOrderStatusFilter(
  '${group.value}'
)
"
style="
width:auto;
background:${
  active
    ? "#2563eb"
    : "#e2e8f0"
};
color:${
  active
    ? "#ffffff"
    : "#334155"
};
"
>

${group.label}

(${statusCounts[
  group.value
] || 0})

</button>

`;

    }
  )
  .join("")}

</div>

`;


  /*
  =====================================
  FILTER ORDERS
  =====================================
  */

  const filteredOrders =
    adminOrdersCache.filter(
      order => {

        const status =
  String(
    order.status ||
    "pending_order"
  ).trim();

        return (
          status ===
          adminOrderStatusFilter
        );

      }
    );


  let ordersHtml = "";


  if(
    filteredOrders.length === 0
  ){

    const currentGroup =
      statusGroups.find(
        group =>
          group.value ===
          adminOrderStatusFilter
      );

    ordersHtml = `

<div class="card">

ยังไม่มีออเดอร์ในสถานะ

<b>
${escapeAdminOrderHtml(
  currentGroup
    ? currentGroup.label
    : adminOrderStatusFilter
)}
</b>

</div>

`;

  }else{

    ordersHtml =
      filteredOrders
        .map(
          order =>
            renderOrderCard(
              order
            )
        )
        .join("");

  }


  box.innerHTML =
    filterHtml +
    ordersHtml;


  /*
  =====================================
  INITIALIZE STATUS SELECTS
  =====================================
  */

 filteredOrders.forEach(
  order => {

    const orderId =
      String(
        order.order_id || ""
      ).trim();

    const select =
      document.getElementById(
        "status_" +
        orderId
      );

    if(select){

      select.value =
        order.status ||
        "pending_order";

      toggleOrderFields(
        orderId
      );

    }

    const status =
  String(
    order.status || ""
  )
    .trim()
    .toLowerCase();


if(
  status ===
    "ready_to_ship" ||
  status ===
    "shipped"
){

  loadOrderShipmentsForAdmin(
    orderId
  );

}

  }
);

}

function setAdminOrderStatusFilter(
  status
){

  adminOrderStatusFilter =
    String(
      status || ""
    ).trim();

  renderAdminOrders();

}

/*
=========================================
ORDER CARD
=========================================
*/

function renderOrderCard(
  order
){

  const orderId =
    String(
      order.order_id || ""
    ).trim();

  const status =
  String(
    order.status ||
    "pending_order"
  ).trim();


  const customerName =
    String(
      order.customer_name || "-"
    ).trim();


  const email =
    String(
      order.email || "-"
    ).trim();


  const phone =
    String(
      order.phone || "-"
    ).trim();


  const social =
    String(
      order.social || "-"
    ).trim();


  const total =
    Number(
      order.total || 0
    );


  const createdAt =
    formatAdminOrderDate(
      order.created_at
    );


  const itemsHtml =
    renderAdminOrderItems(
      order.items
    );


  const giftsHtml =
    renderAdminOrderGifts(
      order.gifts
    );


  return `

<div
class="order-card"
id="orderCard_${escapeAdminOrderHtml(
  orderId
)}"
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
margin:0 0 8px;
"
>
📦
${escapeAdminOrderHtml(
  orderId
)}
</h3>

<div
style="
color:#64748b;
font-size:13px;
"
>
${escapeAdminOrderHtml(
  createdAt
)}
</div>

</div>

<div
style="
font-size:20px;
font-weight:700;
color:#2563eb;
"
>
฿${total.toLocaleString(
  "th-TH",
  {
    maximumFractionDigits:2
  }
)}
</div>

</div>

<hr
style="
border:none;
border-top:1px solid #e5e7eb;
margin:14px 0;
"
>

<div
class="grid"
style="
grid-template-columns:
repeat(auto-fit,minmax(180px,1fr));
"
>

<div>

<b>👤 ลูกค้า</b>

<div>
${escapeAdminOrderHtml(
  customerName
)}
</div>

</div>

<div>

<b>📧 อีเมล</b>

<div>
${escapeAdminOrderHtml(
  email
)}
</div>

</div>

<div>

<b>📱 เบอร์โทร</b>

<div>
${escapeAdminOrderHtml(
  phone
)}
</div>

</div>

<div>

<b>💬 แอค X / Social</b>

<div>
${escapeAdminOrderHtml(
  social
)}
</div>

</div>

</div>

${itemsHtml}

${giftsHtml}

<div
style="
margin-top:16px;
padding-top:16px;
border-top:1px solid #e5e7eb;
"
>

<label
for="status_${escapeAdminOrderHtml(
  orderId
)}"
>

<b>
สถานะออเดอร์
</b>

</label>

<br><br>

<select
id="status_${escapeAdminOrderHtml(
  orderId
)}"
onchange="
toggleOrderFields(
'${escapeAdminOrderJs(
  orderId
)}'
)
"
>

<option value="pending_order">
รอกดสั่งสินค้า
</option>

<option value="pending">
กดสั่งสินค้าแล้ว
</option>

<option value="china_arrived">
สินค้าถึงโกดังจีน
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

<br><br>

<div
id="feeBox_${escapeAdminOrderHtml(
  orderId
)}"
style="display:none;"
>

${renderAdminArrivalItems(
  orderId,
  order.items
)}

<div
class="card"
style="
background:#f8fbff;
box-shadow:none;
margin-bottom:12px;
"
>

<h4
style="
margin-top:0;
"
>
💰 ค่านำเข้าและค่าส่งในไทย
</h4>

<label>
ค่านำเข้า
</label>

<input
id="import_${escapeAdminOrderHtml(
  orderId
)}"
type="number"
min="0"
step="0.01"
value="${escapeAdminOrderHtml(
  order.import_fee_round2 ??
  order.import_fee ??
  0
)}"
placeholder="ค่านำเข้า"
>

<br><br>

<label>
ค่าส่งในไทย
</label>

<input
id="domestic_${escapeAdminOrderHtml(
  orderId
)}"
type="number"
min="0"
step="0.01"
value="${escapeAdminOrderHtml(
  order.domestic_shipping_fee ??
  0
)}"
placeholder="ค่าส่งในไทย"
>

</div>

</div>

<button
id="updateOrderBtn_${escapeAdminOrderHtml(
  orderId
)}"
type="button"
onclick="
updateOrderStatus(
'${escapeAdminOrderJs(
  orderId
)}'
)
"
>
💾 อัปเดตสถานะ
</button>

<div
id="orderLoading_${escapeAdminOrderHtml(
  orderId
)}"
class="loading-text"
style="display:none;"
>
⏳ กำลังอัปเดต...
</div>

<div
id="shipmentBox_${escapeAdminOrderHtml(
  orderId
)}"
style="
margin-top:16px;
padding-top:16px;
border-top:1px solid #e5e7eb;
"
>
</div>

</div>

</div>

`;

}


/*
=========================================
ORDER ITEMS
=========================================
*/

function renderAdminOrderItems(
  items
){

  if(
    !Array.isArray(
      items
    ) ||
    items.length === 0
  ){

    return "";

  }


  let html = `

<div
style="
margin-top:16px;
padding-top:16px;
border-top:1px solid #e5e7eb;
"
>

<h4
style="
margin:0 0 10px;
"
>
🛍️ รายการสินค้า
</h4>

`;


  items.forEach(
    item => {

      const name =
        String(
          item.product_name ||
          item.name ||
          "สินค้า"
        ).trim();


      const quantity =
        Math.max(
          1,
          Number(
            item.quantity ??
            item.qty ??
            1
          )
        );


      const unitPrice =
        Number(
          item.unit_price ??
          item.price ??
          0
        );


      const finalPrice =
        Number(
          item.final_price ??
          (
            unitPrice *
            quantity
          )
        );


      const selectedOption =
        formatAdminSelectedOption(
          item.selected_option ??
          item.selected_options
        );


      html += `

<div
style="
padding:10px 12px;
margin-bottom:8px;
border:1px solid #e5e7eb;
border-radius:12px;
background:#fff;
"
>

<div
style="
display:flex;
justify-content:space-between;
gap:10px;
"
>

<div>

<b>
${escapeAdminOrderHtml(
  name
)}
</b>

${
  selectedOption
    ? `

<div
style="
margin-top:4px;
font-size:13px;
color:#64748b;
"
>
${escapeAdminOrderHtml(
  selectedOption
)}
</div>

`
    : ""
}

<div
style="
margin-top:4px;
font-size:13px;
color:#64748b;
"
>
${quantity} ชิ้น
×
฿${unitPrice.toLocaleString(
  "th-TH",
  {
    maximumFractionDigits:2
  }
)}
</div>

</div>

<b>
฿${finalPrice.toLocaleString(
  "th-TH",
  {
    maximumFractionDigits:2
  }
)}
</b>

</div>

</div>

`;

    }
  );


  html += `

</div>

`;

  return html;

}

function renderAdminArrivalItems(
  orderId,
  items
){

  if(
    !Array.isArray(items) ||
    items.length === 0
  ){

    return `

<div
style="
padding:12px;
border:1px dashed #cbd5e1;
border-radius:12px;
color:#64748b;
"
>
ไม่พบรายการสินค้า
</div>

`;

  }


  let html = `

<div
style="
margin-bottom:16px;
padding:14px;
border:1px solid #dbeafe;
border-radius:14px;
background:#ffffff;
"
>

<h4
style="
margin:0 0 6px;
"
>
📦 สินค้าที่ถึงไทยแล้ว
</h4>

<div
style="
font-size:13px;
color:#64748b;
margin-bottom:12px;
"
>
ติ๊กเฉพาะรายการที่ถึงไทยในรอบนี้
และระบุจำนวนที่ถึงแล้ว
</div>

`;


  items.forEach(
    (
      item,
      index
    ) => {

      const name =
        String(
          item.product_name ||
          item.name ||
          "สินค้า"
        ).trim();

      const quantity =
        Math.max(
          1,
          Math.floor(
            Number(
              item.quantity ??
              item.qty ??
              1
            )
          )
        );

      const arrivedQty =
        Math.max(
          0,
          Math.min(
            quantity,
            Math.floor(
              Number(
                item.arrived_th_qty ||
                0
              )
            )
          )
        );

      const checked =
        arrivedQty > 0;


      html += `

<div
style="
display:grid;
grid-template-columns:auto minmax(0,1fr) 110px;
gap:10px;
align-items:center;
padding:11px 0;
border-bottom:1px solid #e5e7eb;
"
>

<input
type="checkbox"
id="arrivalCheck_${escapeAdminOrderHtml(orderId)}_${index}"
${checked ? "checked" : ""}
onchange="
toggleAdminArrivalItem(
  '${escapeAdminOrderJs(orderId)}',
  ${index},
  ${quantity}
)
"
style="
width:auto;
"
>

<div>

<div
style="
font-weight:700;
word-break:break-word;
"
>
${escapeAdminOrderHtml(name)}
</div>

<div
style="
font-size:12px;
color:#64748b;
margin-top:3px;
"
>
สั่งทั้งหมด ${quantity} ชิ้น
</div>

</div>

<div>

<input
type="number"
id="arrivalQty_${escapeAdminOrderHtml(orderId)}_${index}"
min="0"
max="${quantity}"
step="1"
value="${arrivedQty}"
${checked ? "" : "disabled"}
style="
width:100%;
"
>

<div
style="
font-size:11px;
color:#64748b;
text-align:center;
margin-top:3px;
"
>
/ ${quantity}
</div>

</div>

</div>

`;

    }
  );


  html += `

</div>

`;

  return html;

}

/*
=========================================
ORDER GIFTS
=========================================
*/

function renderAdminOrderGifts(
  gifts
){

  if(
    !Array.isArray(
      gifts
    ) ||
    gifts.length === 0
  ){

    return "";

  }


  const groupedGifts =
    groupAdminOrderGifts(
      gifts
    );


  let html = `

<div
style="
margin-top:16px;
padding:16px;
border:1px solid #bbf7d0;
border-radius:14px;
background:#f0fdf4;
"
>

<h4
style="
margin:0 0 12px;
color:#166534;
"
>
🎁 ของแถม
</h4>

`;


  groupedGifts.forEach(
    gift => {

      html += `

<div
style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:10px;
padding:10px 0;
border-bottom:1px solid #dcfce7;
"
>

<div>

<b>
${escapeAdminOrderHtml(
  gift.gift_name ||
  "ของแถม"
)}
</b>

${
  gift.character_name
    ? `

<div
style="
margin-top:4px;
font-size:13px;
color:#166534;
"
>
ตัวละคร:
${escapeAdminOrderHtml(
  gift.character_name
)}
</div>

`
    : ""
}

</div>

<div
style="
font-weight:700;
color:#166534;
white-space:nowrap;
"
>
× ${gift.quantity}
</div>

</div>

`;

    }
  );


  html += `

</div>

`;

  return html;

}


function groupAdminOrderGifts(
  gifts
){

  const map = {};


  gifts.forEach(
    gift => {

      const giftItemId =
        String(
          gift.gift_item_id ||
          gift.gift_id ||
          ""
        ).trim();


      const giftName =
        String(
          gift.gift_name ||
          "ของแถม"
        ).trim();


      const characterId =
        String(
          gift.character_id || ""
        ).trim();


      const characterName =
        String(
          gift.character_name || ""
        ).trim();


      const key =

        giftItemId +

        "::" +

        giftName +

        "::" +

        characterId +

        "::" +

        characterName;


      if(!map[key]){

        map[key] = {

          gift_item_id:
            giftItemId,

          gift_name:
            giftName,

          character_id:
            characterId,

          character_name:
            characterName,

          quantity:
            0

        };

      }


      map[key].quantity++;

    }
  );


  return Object.values(
    map
  );

}

function toggleAdminArrivalItem(
  orderId,
  index,
  maxQty
){

  const checkbox =
    document.getElementById(
      "arrivalCheck_" +
      orderId +
      "_" +
      index
    );

  const qtyInput =
    document.getElementById(
      "arrivalQty_" +
      orderId +
      "_" +
      index
    );

  if(
    !checkbox ||
    !qtyInput
  ){

    return;

  }


  qtyInput.disabled =
    !checkbox.checked;


  if(checkbox.checked){

    let currentQty =
      Number(
        qtyInput.value || 0
      );

    if(
      currentQty <= 0
    ){

      currentQty = 1;

    }

    qtyInput.value =
      Math.min(
        Number(maxQty) || 1,
        currentQty
      );

  }else{

    qtyInput.value =
      0;

  }

}

function getAdminArrivalItems(
  orderId
){

  const order =
    adminOrdersCache.find(
      item =>

        String(
          item.order_id || ""
        ).trim() ===
        String(
          orderId || ""
        ).trim()
    );


  if(
    !order ||
    !Array.isArray(
      order.items
    )
  ){

    return [];

  }


  return order.items.map(
    (
      item,
      index
    ) => {

      const checkbox =
        document.getElementById(
          "arrivalCheck_" +
          orderId +
          "_" +
          index
        );

      const qtyInput =
        document.getElementById(
          "arrivalQty_" +
          orderId +
          "_" +
          index
        );


      const quantity =
        Math.max(
          1,
          Math.floor(
            Number(
              item.quantity ??
              item.qty ??
              1
            )
          )
        );


      let arrivedQty = 0;


      if(
        checkbox &&
        checkbox.checked
      ){

        arrivedQty =
          Math.floor(
            Number(
              qtyInput?.value || 0
            )
          );

      }


      if(
        arrivedQty < 0 ||
        arrivedQty > quantity
      ){

        throw new Error(
          "จำนวนสินค้าที่ถึงไทยไม่ถูกต้อง: " +
          (
            item.product_name ||
            item.name ||
            "สินค้า"
          )
        );

      }


      return {

        item_index:
          index,

        arrived_th_qty:
          arrivedQty

      };

    }
  );

}

/*
=========================================
TOGGLE STATUS FIELDS
=========================================
*/

function toggleOrderFields(
  orderId
){

  const statusElement =
    document.getElementById(
      "status_" +
      orderId
    );


  if(!statusElement){
    return;
  }


  const status =
    statusElement.value;


  const feeBox =
    document.getElementById(
      "feeBox_" +
      orderId
    );

  if(feeBox){

    feeBox.style.display =
      status ===
      "ready_to_ship"

        ? "block"

        : "none";

  }

}


/*
=========================================
UPDATE ORDER STATUS
=========================================
*/

async function updateOrderStatus(
  orderId
){

  const statusElement =
    document.getElementById(
      "status_" +
      orderId
    );


  if(!statusElement){

    console.error(
      "ไม่พบช่องสถานะของออเดอร์:",
      orderId
    );

    return;

  }


  const status =
    statusElement.value;


  const payload = {

    order_id:
      orderId,

    status:
      status

  };


  if(
    status ===
    "ready_to_ship"
  ){

   try{

  payload.arrival_items =
    getAdminArrivalItems(
      orderId
    );

}catch(error){

  alert(
    error.message ||
    "ข้อมูลสินค้าที่ถึงไทยไม่ถูกต้อง"
  );

  return;

}


const totalArrivedQty =
  payload.arrival_items.reduce(
    (
      sum,
      item
    ) =>

      sum +
      Number(
        item.arrived_th_qty || 0
      ),

    0
  );


if(
  totalArrivedQty <= 0
){

  alert(
    "กรุณาติ๊กสินค้าที่ถึงไทยอย่างน้อย 1 ชิ้น"
  );

  return;

}

    payload.import_fee_round2 =
      Number(
        document
          .getElementById(
            "import_" +
            orderId
          )
          ?.value || 0
      );


    payload.domestic_shipping_fee =
      Number(
        document
          .getElementById(
            "domestic_" +
            orderId
          )
          ?.value || 0
      );


    if(
      !Number.isFinite(
        payload.import_fee_round2
      ) ||
      !Number.isFinite(
        payload.domestic_shipping_fee
      ) ||
      payload.import_fee_round2 < 0 ||
      payload.domestic_shipping_fee < 0
    ){

      alert(
        "ค่านำเข้าและค่าส่งในไทยต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"
      );

      return;

    }

  }

  const button =
    document.getElementById(
      "updateOrderBtn_" +
      orderId
    );


  const loading =
    document.getElementById(
      "orderLoading_" +
      orderId
    );


  if(button){

    button.disabled =
      true;

  }


  if(loading){

    loading.style.display =
      "block";

  }


  try{

    const formData =
      new FormData();


    formData.append(
      "payload",
      JSON.stringify(
        payload
      )
    );


    const response =
      await fetch(

        API +
        "?action=updateOrderStatus",

        {

          method:
            "POST",

          body:
            formData

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


    alert(

      result.success

        ? "อัปเดตสถานะแล้ว"

        : result.error ||
          result.message ||
          "อัปเดตไม่สำเร็จ"

    );


    if(result.success){

      await loadOrders();

    }

  }catch(error){

    console.error(
      "updateOrderStatus error:",
      error
    );


    alert(
      error.message ||
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }finally{

    if(button){

      button.disabled =
        false;

    }


    if(loading){

      loading.style.display =
        "none";

    }

  }

}


/*
=========================================
FORMAT HELPERS
=========================================
*/

function formatAdminSelectedOption(
  value
){

  if(
    value === null ||
    value === undefined ||
    value === ""
  ){

    return "";

  }


  let data =
    value;


  if(
    typeof value ===
    "string"
  ){

    try{

      data =
        JSON.parse(
          value
        );

    }catch(error){

      return value;

    }

  }


  if(
    !data ||
    typeof data !==
      "object"
  ){

    return String(
      data || ""
    );

  }


  return Object.entries(
    data
  )
    .map(
      (
        [
          key,
          itemValue
        ]
      ) => {

        const text =
          Array.isArray(
            itemValue
          )

            ? itemValue.join(
                ", "
              )

            : String(
                itemValue ?? ""
              );


        return (
          key +
          ": " +
          text
        );

      }
    )
    .join(
      " / "
    );

}


function formatAdminOrderDate(
  value
){

  if(!value){

    return "-";

  }


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
      value
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


function escapeAdminOrderHtml(
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


function escapeAdminOrderJs(
  value
){

  return String(
    value ?? ""
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
      "\r",
      "\\r"
    )
    .replaceAll(
      "\n",
      "\\n"
    );

}

/*
=========================================
ADMIN — ORDER SHIPMENTS
=========================================
*/

async function loadOrderShipmentsForAdmin(
  orderId,
  forceReload = false
){

  const normalizedOrderId =
    String(
      orderId || ""
    ).trim();


  if(!normalizedOrderId){

    return;

  }


  const box =
    document.getElementById(
      "shipmentBox_" +
      normalizedOrderId
    );


  if(!box){

    return;

  }


  /*
  =========================================
  USE CACHE
  =========================================
  */

  if(
    !forceReload &&
    Object.prototype.hasOwnProperty.call(
      adminShipmentCache,
      normalizedOrderId
    )
  ){

    renderOrderShipmentsAdmin(
      normalizedOrderId,
      adminShipmentCache[
        normalizedOrderId
      ]
    );

    return;

  }


  /*
  =========================================
  PREVENT DUPLICATE REQUEST
  =========================================
  */

  if(
    adminShipmentLoading[
      normalizedOrderId
    ]
  ){

    try{

      await adminShipmentLoading[
        normalizedOrderId
      ];

    }catch(error){

      /*
      error ถูกจัดการใน request หลักแล้ว
      */

    }

    return;

  }


  box.innerHTML = `

<div
style="
color:#64748b;
font-size:13px;
"
>
⏳ กำลังโหลดรอบจัดส่ง...
</div>

`;


  const requestPromise =
    (
      async ()=>{

        try{

          const response =
            await fetch(
              API +
              "?action=orderShipments" +
              "&order_id=" +
              encodeURIComponent(
                normalizedOrderId
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
              "โหลดรอบจัดส่งไม่สำเร็จ"
            );

          }


          const shipments =
            Array.isArray(
              result.shipments
            )
              ? result.shipments
              : Array.isArray(
                  result
                )
                ? result
                : [];


          /*
          =========================================
          SAVE CACHE
          =========================================
          */

          adminShipmentCache[
            normalizedOrderId
          ] =
            shipments;


          renderOrderShipmentsAdmin(
            normalizedOrderId,
            shipments
          );


        }catch(error){

          console.error(
            "loadOrderShipmentsForAdmin error:",
            normalizedOrderId,
            error
          );


          const currentBox =
            document.getElementById(
              "shipmentBox_" +
              normalizedOrderId
            );


          if(currentBox){

            currentBox.innerHTML = `

<div
style="
padding:12px;
border:1px solid #fecdd3;
border-radius:12px;
background:#fff1f2;
color:#be123c;
font-size:13px;
"
>
⚠️ โหลดข้อมูลรอบจัดส่งไม่สำเร็จ
</div>

`;

          }


          throw error;

        }finally{

          delete adminShipmentLoading[
            normalizedOrderId
          ];

        }

      }
    )();


  adminShipmentLoading[
    normalizedOrderId
  ] =
    requestPromise;


  try{

    await requestPromise;

  }catch(error){

    /*
    UI + console ถูกจัดการด้านบนแล้ว
    */

  }

}

/*
=========================================
RENDER SHIPMENTS
=========================================
*/

function renderOrderShipmentsAdmin(
  orderId,
  shipments
){

  const box =
    document.getElementById(
      "shipmentBox_" +
      orderId
    );

  if(!box){
    return;
  }


  if(
    !Array.isArray(shipments) ||
    shipments.length === 0
  ){

    box.innerHTML = `

      <div
        style="
          padding:12px;
          border:1px dashed #cbd5e1;
          border-radius:12px;
          color:#64748b;
          font-size:13px;
        "
      >
        📭 ยังไม่มีข้อมูลการจัดส่งสำหรับออเดอร์นี้
      </div>

    `;

    return;

  }


  /*
  =========================================
  แยก Shipment ที่ "รอส่งรวม"
  ออกจากรอบจัดส่งจริง
  =========================================
  */

  const waitingShipments =
    shipments.filter(
      shipment => {

        const status =
          String(
            shipment.status || ""
          )
            .trim()
            .toLowerCase();

        return (
          status ===
          "waiting_combine"
        );

      }
    );


  const realShipments =
    shipments.filter(
      shipment => {

        const status =
          String(
            shipment.status || ""
          )
            .trim()
            .toLowerCase();

        return (
          status !==
          "waiting_combine"
        );

      }
    );


  let html = "";


  /*
  =========================================
  WAITING COMBINE
  ไม่ถือเป็น "รอบจัดส่ง"
  =========================================
  */

  waitingShipments.forEach(
    shipment => {

      const shipmentId =
        String(
          shipment.shipment_id || ""
        ).trim();


      const items =
        Array.isArray(
          shipment.items
        )
          ? shipment.items
          : [];


      let itemsHtml = "";


      if(items.length){

        itemsHtml = `

          <div
            style="
              margin-top:12px;
              padding-top:10px;
              border-top:1px solid #fde68a;
            "
          >

            <div
              style="
                font-size:12px;
                font-weight:700;
                color:#92400e;
                margin-bottom:7px;
              "
            >
              📦 สินค้าที่กำลังรอส่งรวม
            </div>

            ${items.map(
              item => {

                const name =
                  String(
                    item.name ||
                    item.product_name ||
                    "สินค้า"
                  ).trim();

                const qty =
                  Math.max(
                    0,
                    Number(
                      item.qty ??
                      item.quantity ??
                      0
                    )
                  );

                return `

                  <div
                    style="
                      display:flex;
                      justify-content:space-between;
                      gap:10px;
                      padding:5px 0;
                      font-size:13px;
                    "
                  >

                    <span>
                      ${escapeAdminOrderHtml(
                        name
                      )}
                    </span>

                    <b>
                      × ${qty}
                    </b>

                  </div>

                `;

              }
            ).join("")}

          </div>

        `;

      }


      html += `

        <div
          style="
            margin-bottom:14px;
            padding:14px;
            border:1px solid #fde68a;
            border-radius:14px;
            background:#fffbeb;
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

              <b
                style="
                  color:#92400e;
                "
              >
                🕒 รอส่งรวม
              </b>

              <div
                style="
                  margin-top:4px;
                  color:#a16207;
                  font-size:12px;
                "
              >
                ${escapeAdminOrderHtml(
                  shipmentId
                )}
              </div>

            </div>


            <span
              style="
                display:inline-block;
                padding:5px 9px;
                border-radius:999px;
                background:#fef3c7;
                color:#92400e;
                font-size:11px;
                font-weight:700;
              "
            >
              ลูกค้าเลือกรอส่งรวม
            </span>

          </div>


          ${itemsHtml}


          <div
            style="
              margin-top:10px;
              padding:9px 10px;
              border-radius:10px;
              background:#ffffff;
              color:#92400e;
              font-size:12px;
            "
          >
            รายการนี้ยังไม่ถือเป็นรอบจัดส่ง
            และยังไม่ต้องกรอกเลขพัสดุ
          </div>

        </div>

      `;

    }
  );


  /*
  =========================================
  REAL SHIPMENTS
  =========================================
  */

  if(realShipments.length){

    html += `

      <div
        style="
          padding:14px;
          border:1px solid #dbeafe;
          border-radius:14px;
          background:#f8fbff;
        "
      >

        <h4
          style="
            margin:0 0 12px;
          "
        >
          📦 รอบจัดส่ง
        </h4>

    `;


    realShipments.forEach(
      (
        shipment,
        index
      ) => {

        const shipmentId =
          String(
            shipment.shipment_id || ""
          ).trim();


        const status =
          String(
            shipment.status || ""
          )
            .trim()
            .toLowerCase();


        const paymentStatus =
          String(
            shipment.payment_status || ""
          )
            .trim()
            .toLowerCase();


        const shippingMethod =
          String(
            shipment.shipping_method || ""
          )
            .trim()
            .toLowerCase();


        const courier =
          String(
            shipment.courier || ""
          ).trim();


        const trackingNo =
          String(
            shipment.tracking_no || ""
          ).trim();


        const importFee =
          Number(
            shipment.import_fee || 0
          );


        const domesticFee =
          Number(
            shipment.domestic_shipping_fee ||
            0
          );


        const total =
          Number(
            shipment.total ??
            (
              importFee +
              domesticFee
            )
          );


        const items =
          Array.isArray(
            shipment.items
          )
            ? shipment.items
            : [];


        const isShipped =
          status ===
          "shipped";


        /*
        จะกรอก Tracking ได้เมื่อ

        - ลูกค้าชำระแล้ว
        - เลือกส่งเลย
        - และยังไม่ได้ shipped
        */

        const canShip =
          !isShipped &&
          paymentStatus === "paid" &&
          shippingMethod === "ship_now";


        /*
        ข้อความสถานะ
        */

        let statusText =
          "รอดำเนินการ";


        let badgeBackground =
          "#fef3c7";


        let badgeColor =
          "#92400e";


        if(isShipped){

          statusText =
            "จัดส่งแล้ว";

          badgeBackground =
            "#dcfce7";

          badgeColor =
            "#166534";

        }else if(canShip){

          statusText =
            "พร้อมจัดส่ง";

          badgeBackground =
            "#dbeafe";

          badgeColor =
            "#1d4ed8";

        }else if(
          paymentStatus ===
          "unpaid"
        ){

          statusText =
            "รอลูกค้าชำระค่าส่ง";

        }else if(
          paymentStatus ===
          "paid"
        ){

          statusText =
            "ชำระค่าส่งแล้ว";

          badgeBackground =
            "#dbeafe";

          badgeColor =
            "#1d4ed8";

        }


        /*
        =====================================
        ITEMS
        =====================================
        */

        let itemsHtml = "";


        if(items.length){

          itemsHtml = `

            <div
              style="
                margin-top:12px;
                padding:10px 12px;
                border:1px solid #dcfce7;
                border-radius:10px;
                background:#f0fdf4;
              "
            >

              <div
                style="
                  margin-bottom:7px;
                  font-size:12px;
                  font-weight:700;
                  color:#166534;
                "
              >
                📦 สินค้าในรอบนี้
              </div>


              ${items.map(
                item => {

                  const name =
                    String(
                      item.name ||
                      item.product_name ||
                      "สินค้า"
                    ).trim();


                  const qty =
                    Math.max(
                      0,
                      Number(
                        item.qty ??
                        item.quantity ??
                        0
                      )
                    );


                  return `

                    <div
                      style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        padding:5px 0;
                        font-size:13px;
                      "
                    >

                      <span>
                        ${escapeAdminOrderHtml(
                          name
                        )}
                      </span>

                      <b>
                        × ${qty}
                      </b>

                    </div>

                  `;

                }
              ).join("")}

            </div>

          `;

        }


        /*
        =====================================
        CARD
        =====================================
        */

        html += `

          <div
            style="
              padding:14px;
              margin-bottom:10px;
              border:1px solid #e5e7eb;
              border-radius:12px;
              background:#ffffff;
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
                  รอบจัดส่ง ${index + 1}
                </b>

                <div
                  style="
                    margin-top:4px;
                    color:#64748b;
                    font-size:12px;
                  "
                >
                  ${escapeAdminOrderHtml(
                    shipmentId
                  )}
                </div>

              </div>


              <span
                style="
                  display:inline-block;
                  padding:5px 9px;
                  border-radius:999px;
                  font-size:11px;
                  font-weight:700;
                  background:${badgeBackground};
                  color:${badgeColor};
                "
              >
                ${statusText}
              </span>

            </div>


            ${itemsHtml}


            <div
              style="
                margin-top:12px;
                display:grid;
                grid-template-columns:
                  repeat(
                    auto-fit,
                    minmax(140px,1fr)
                  );
                gap:8px;
                font-size:13px;
              "
            >

              <div>

                <b>
                  ค่านำเข้า
                </b>

                <br>

                ฿${importFee.toLocaleString(
                  "th-TH",
                  {
                    maximumFractionDigits:2
                  }
                )}

              </div>


              <div>

                <b>
                  ค่าส่งในไทย
                </b>

                <br>

                ฿${domesticFee.toLocaleString(
                  "th-TH",
                  {
                    maximumFractionDigits:2
                  }
                )}

              </div>


              <div>

                <b>
                  รวม
                </b>

                <br>

                ฿${total.toLocaleString(
                  "th-TH",
                  {
                    maximumFractionDigits:2
                  }
                )}

              </div>

            </div>


            ${
              isShipped

                ? `

                  <div
                    style="
                      margin-top:12px;
                      padding:10px;
                      border-radius:10px;
                      background:#f0fdf4;
                      font-size:13px;
                    "
                  >

                    <b>
                      🚚 ${escapeAdminOrderHtml(
                        courier || "-"
                      )}
                    </b>

                    <div
                      style="
                        margin-top:4px;
                      "
                    >
                      เลขพัสดุ:
                      ${escapeAdminOrderHtml(
                        trackingNo || "-"
                      )}
                    </div>

                  </div>

                `

                : canShip

                  ? `

                    <div
                      style="
                        margin-top:14px;
                      "
                    >

                      <label>
                        บริษัทขนส่ง
                      </label>

                      <input
                        id="shipmentCourier_${escapeAdminOrderHtml(
                          shipmentId
                        )}"
                        value="${escapeAdminOrderHtml(
                          courier
                        )}"
                        placeholder="เช่น Flash Express"
                      >

                      <br><br>

                      <label>
                        เลขพัสดุ
                      </label>

                      <input
                        id="shipmentTracking_${escapeAdminOrderHtml(
                          shipmentId
                        )}"
                        value="${escapeAdminOrderHtml(
                          trackingNo
                        )}"
                        placeholder="เลขพัสดุ"
                      >

                      <br><br>

                      <button
                        type="button"
                        id="shipShipmentBtn_${escapeAdminOrderHtml(
                          shipmentId
                        )}"
                        onclick="
                          shipShipmentAdmin(
                            '${escapeAdminOrderJs(
                              orderId
                            )}',
                            '${escapeAdminOrderJs(
                              shipmentId
                            )}'
                          )
                        "
                      >
                        🚚 บันทึกการจัดส่ง
                      </button>

                      <div
                        id="shipShipmentLoading_${escapeAdminOrderHtml(
                          shipmentId
                        )}"
                        class="loading-text"
                        style="
                          display:none;
                          margin-top:8px;
                        "
                      >
                        ⏳ กำลังบันทึก...
                      </div>

                    </div>

                  `

                  : `

                    <div
                      style="
                        margin-top:12px;
                        padding:10px;
                        border-radius:10px;
                        background:#f8fafc;
                        color:#64748b;
                        font-size:12px;
                      "
                    >
                      ${
                        paymentStatus ===
                        "unpaid"

                          ? "⏳ รอลูกค้าชำระค่าส่งก่อน"

                          : "⏳ ยังไม่พร้อมบันทึกเลขพัสดุ"
                      }
                    </div>

                  `
            }

          </div>

        `;

      }
    );


    html += `

      </div>

    `;

  }


  /*
  =========================================
  ถ้ามีแต่ waiting_combine
  จะไม่สร้างหัวข้อ "รอบจัดส่ง"
  =========================================
  */

  box.innerHTML =
    html;

}

/*
=========================================
SHIP ONE SHIPMENT
=========================================
*/

async function shipShipmentAdmin(
  orderId,
  shipmentId
){

  const courierInput =
    document.getElementById(
      "shipmentCourier_" +
      shipmentId
    );

  const trackingInput =
    document.getElementById(
      "shipmentTracking_" +
      shipmentId
    );


  const courier =
    String(
      courierInput?.value || ""
    ).trim();

  const trackingNo =
    String(
      trackingInput?.value || ""
    ).trim();


  if(!courier){

    alert(
      "กรุณากรอกบริษัทขนส่ง"
    );

    courierInput?.focus();

    return;

  }


  if(!trackingNo){

    alert(
      "กรุณากรอกเลขพัสดุ"
    );

    trackingInput?.focus();

    return;

  }


  const button =
    document.getElementById(
      "shipShipmentBtn_" +
      shipmentId
    );

  const loading =
    document.getElementById(
      "shipShipmentLoading_" +
      shipmentId
    );


  if(button){

    button.disabled =
      true;

  }


  if(loading){

    loading.style.display =
      "block";

  }


  try{

    const payload = {

      order_id:
        orderId,

      shipment_id:
        shipmentId,

      courier:
        courier,

      tracking_no:
        trackingNo

    };


    const formData =
      new FormData();


    formData.append(
      "payload",
      JSON.stringify(
        payload
      )
    );


    const response =
      await fetch(

        API +
        "?action=shipOrderShipment",

        {

          method:
            "POST",

          body:
            formData

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
        result?.message ||
        "บันทึกการจัดส่งไม่สำเร็จ"
      );

    }


    alert(
      "บันทึกการจัดส่งเรียบร้อยแล้ว"
    );


    await loadOrders();


  }catch(error){

    console.error(
      "shipShipmentAdmin error:",
      error
    );


    alert(
      error.message ||
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );


  }finally{

    if(button){

      button.disabled =
        false;

    }


    if(loading){

      loading.style.display =
        "none";

    }

  }

}

/*
=========================================
ADMIN — SHIPPED ORDER ARCHIVE
=========================================
*/

function getAdminArchiveOrderTime(
  order
){

  if(!order){
    return null;
  }


  /*
  ใช้ shipped_at เป็นหลัก

  ออเดอร์เก่าที่ shipped/completed
  ก่อนเพิ่ม shipped_at:
  fallback created_at ชั่วคราว
  เพื่อไม่ให้หายจาก Archive
  */

  const rawValue =
    order.shipped_at ||
    order.created_at ||
    "";


  if(!rawValue){
    return null;
  }


  const date =
    new Date(
      rawValue
    );


  if(
    Number.isNaN(
      date.getTime()
    )
  ){

    return null;

  }


  return date;

}


function normalizeAdminArchiveSearch(
  value
){

  return String(
    value || ""
  )
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

}


function matchesAdminArchiveSearch(
  order
){

  const keyword =
    normalizeAdminArchiveSearch(
      adminShippedSearch
    );


  if(!keyword){

    return true;

  }


  const values = [

    order.order_id,

    order.customer_name,

    order.email,

    order.phone,

    order.social,

    order.courier,

    order.tracking_no

  ];


  return values.some(
    value => {

      return (
        normalizeAdminArchiveSearch(
          value
        )
          .includes(
            keyword
          )
      );

    }
  );

}


function matchesAdminArchiveDate(
  order
){

  if(
    adminShippedDateFilter ===
    "all"
  ){

    return true;

  }


  const date =
    getAdminArchiveOrderTime(
      order
    );


  if(!date){

    return false;

  }


  const timestamp =
    date.getTime();


  const now =
    new Date();


  /*
  =====================================
  TODAY
  =====================================
  */

  if(
    adminShippedDateFilter ===
    "today"
  ){

    return (
      date.getFullYear() ===
        now.getFullYear() &&

      date.getMonth() ===
        now.getMonth() &&

      date.getDate() ===
        now.getDate()
    );

  }


  /*
  =====================================
  LAST 7 / 30 DAYS
  =====================================
  */

  if(
    adminShippedDateFilter ===
      "7" ||
    adminShippedDateFilter ===
      "30"
  ){

    const days =
      Number(
        adminShippedDateFilter
      );


    const start =
      new Date();


    start.setHours(
      0,
      0,
      0,
      0
    );


    start.setDate(
      start.getDate() -
      (
        days - 1
      )
    );


    return (
      timestamp >=
      start.getTime()
    );

  }


  /*
  =====================================
  CUSTOM
  =====================================
  */

  if(
    adminShippedDateFilter ===
    "custom"
  ){

    if(
      adminShippedCustomStart
    ){

      const start =
        new Date(
          adminShippedCustomStart +
          "T00:00:00"
        );


      if(
        timestamp <
        start.getTime()
      ){

        return false;

      }

    }


    if(
      adminShippedCustomEnd
    ){

      const end =
        new Date(
          adminShippedCustomEnd +
          "T23:59:59.999"
        );


      if(
        timestamp >
        end.getTime()
      ){

        return false;

      }

    }


    return true;

  }


  return true;

}


/*
=========================================
RENDER ARCHIVE
=========================================
*/

function renderAdminShippedOrders(){

  const box =
    document.getElementById(
      "shippedOrders"
    );


  if(!box){
    return;
  }


  /*
  ยังโหลด Orders ไม่เสร็จ
  */

  if(
    !Array.isArray(
      adminOrderBaseCache
    )
  ){

    box.innerHTML = `

<div class="card">
⏳ กำลังโหลดออเดอร์...
</div>

`;

    return;

  }


  const archivedOrders =
    adminOrderBaseCache
      .filter(
        order =>
          isAdminArchivedOrder(
            order
          )
      );


  const shippedCount =
    archivedOrders.filter(
      order =>

        String(
          order.status || ""
        )
          .trim()
          .toLowerCase() ===
        "shipped"

    ).length;


  const completedCount =
    archivedOrders.filter(
      order =>

        String(
          order.status || ""
        )
          .trim()
          .toLowerCase() ===
        "completed"

    ).length;


  const filteredOrders =
    archivedOrders
      .filter(
        order =>
          matchesAdminArchiveSearch(
            order
          )
      )
      .filter(
        order =>
          matchesAdminArchiveDate(
            order
          )
      )
      .sort(
        (
          first,
          second
        ) => {

          const firstDate =
            getAdminArchiveOrderTime(
              first
            );

          const secondDate =
            getAdminArchiveOrderTime(
              second
            );


          return (
            (
              secondDate
                ? secondDate.getTime()
                : 0
            )
            -
            (
              firstDate
                ? firstDate.getTime()
                : 0
            )
          );

        }
      );


  box.innerHTML = `

<div
class="card"
>

<div
style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:12px;
flex-wrap:wrap;
margin-bottom:16px;
"
>

<div>

<h3
style="
margin:0 0 5px;
"
>
📦 ประวัติออเดอร์ที่จัดส่งแล้ว
</h3>

<div
style="
font-size:13px;
color:#64748b;
"
>
ออเดอร์ที่ส่งเกิน 3 วัน และออเดอร์ Completed
</div>

</div>


<button
type="button"
onclick="loadOrders()"
style="
width:auto;
background:#64748b;
"
>
🔄 รีเฟรช
</button>

</div>


<div
class="grid"
style="
margin-bottom:16px;
"
>

<div
style="
padding:12px;
border:1px solid #dbeafe;
border-radius:12px;
background:#f8fbff;
"
>

<div
style="
font-size:12px;
color:#64748b;
"
>
จัดส่งแล้ว
</div>

<div
style="
font-size:22px;
font-weight:700;
"
>
${shippedCount}
</div>

</div>


<div
style="
padding:12px;
border:1px solid #dcfce7;
border-radius:12px;
background:#f0fdf4;
"
>

<div
style="
font-size:12px;
color:#64748b;
"
>
Completed
</div>

<div
style="
font-size:22px;
font-weight:700;
"
>
${completedCount}
</div>

</div>

</div>


<div
style="
display:grid;
grid-template-columns:
minmax(220px,2fr)
minmax(160px,1fr);
gap:12px;
margin-bottom:12px;
"
>

<div>

<label>
ค้นหา
</label>

<input
id="adminShippedSearchInput"
value="${escapeAdminOrderHtml(
  adminShippedSearch
)}"
placeholder="Order ID / Twitter / Tracking / ชื่อลูกค้า"
oninput="
setAdminShippedSearch(
  this.value
)
"
>

</div>


<div>

<label>
ช่วงเวลา
</label>

<select
id="adminShippedDateFilter"
onchange="
setAdminShippedDateFilter(
  this.value
)
"
>

<option
value="today"
${
  adminShippedDateFilter ===
    "today"
    ? "selected"
    : ""
}
>
วันนี้
</option>

<option
value="7"
${
  adminShippedDateFilter ===
    "7"
    ? "selected"
    : ""
}
>
7 วันล่าสุด
</option>

<option
value="30"
${
  adminShippedDateFilter ===
    "30"
    ? "selected"
    : ""
}
>
30 วันล่าสุด
</option>

<option
value="all"
${
  adminShippedDateFilter ===
    "all"
    ? "selected"
    : ""
}
>
ทั้งหมด
</option>

<option
value="custom"
${
  adminShippedDateFilter ===
    "custom"
    ? "selected"
    : ""
}
>
กำหนดเอง
</option>

</select>

</div>

</div>


${
  adminShippedDateFilter ===
  "custom"

    ? `

<div
style="
display:grid;
grid-template-columns:
repeat(2,minmax(160px,1fr));
gap:12px;
margin-bottom:14px;
"
>

<div>

<label>
จากวันที่
</label>

<input
type="date"
value="${escapeAdminOrderHtml(
  adminShippedCustomStart
)}"
onchange="
setAdminShippedCustomStart(
  this.value
)
"
>

</div>


<div>

<label>
ถึงวันที่
</label>

<input
type="date"
value="${escapeAdminOrderHtml(
  adminShippedCustomEnd
)}"
onchange="
setAdminShippedCustomEnd(
  this.value
)
"
>

</div>

</div>

`

    : ""
}


<div
style="
font-size:13px;
color:#64748b;
"
>

แสดง
<b>
${filteredOrders.length}
</b>
จาก
<b>
${archivedOrders.length}
</b>
ออเดอร์

</div>

</div>


<div>

${
  filteredOrders.length

    ? filteredOrders
        .map(
          order =>
            renderAdminShippedOrderCard(
              order
            )
        )
        .join("")

    : `

<div class="card">

<div
style="
text-align:center;
padding:22px;
color:#64748b;
"
>

📭 ไม่พบออเดอร์ที่ตรงกับเงื่อนไข

</div>

</div>

`
}

</div>

`;

}

function setAdminShippedSearch(
  value
){

  adminShippedSearch =
    String(
      value || ""
    );


  renderAdminShippedOrders();


  /*
  คืน focus ให้ช่องค้นหา
  หลัง render ใหม่
  */

  const input =
    document.getElementById(
      "adminShippedSearchInput"
    );


  if(input){

    input.focus();

    const length =
      input.value.length;

    input.setSelectionRange(
      length,
      length
    );

  }

}


function setAdminShippedDateFilter(
  value
){

  adminShippedDateFilter =
    String(
      value || "30"
    );


  renderAdminShippedOrders();

}


function setAdminShippedCustomStart(
  value
){

  adminShippedCustomStart =
    String(
      value || ""
    );


  renderAdminShippedOrders();

}


function setAdminShippedCustomEnd(
  value
){

  adminShippedCustomEnd =
    String(
      value || ""
    );


  renderAdminShippedOrders();

}

/*
=========================================
ARCHIVE ORDER CARD
=========================================
*/

function renderAdminShippedOrderCard(
  order
){

  const orderId =
    String(
      order.order_id || ""
    ).trim();


  const status =
    String(
      order.status || ""
    )
      .trim()
      .toLowerCase();


  const customerName =
    String(
      order.customer_name || "-"
    ).trim();


  const socialRaw =
    String(
      order.social || ""
    ).trim();


  const social =
    socialRaw
      ? (
          "@" +
          socialRaw
            .replace(/^@+/, "")
        )
      : "-";


  const courier =
    String(
      order.courier || "-"
    ).trim();


  const trackingNo =
    String(
      order.tracking_no || "-"
    ).trim();


  const total =
    Number(
      order.total || 0
    );


  const archiveDate =
    getAdminArchiveOrderTime(
      order
    );


  const archiveDateText =
    archiveDate
      ? formatAdminOrderDate(
          archiveDate
        )
      : "-";


  const hasRealShippedAt =
    Boolean(
      order.shipped_at
    );


  const statusHtml =
    status ===
    "completed"

      ? `

<span
style="
display:inline-block;
padding:5px 9px;
border-radius:999px;
background:#dcfce7;
color:#166534;
font-size:12px;
font-weight:700;
"
>
✅ Completed
</span>

`

      : `

<span
style="
display:inline-block;
padding:5px 9px;
border-radius:999px;
background:#dbeafe;
color:#1d4ed8;
font-size:12px;
font-weight:700;
"
>
🚚 จัดส่งแล้ว
</span>

`;


  return `

<div
class="order-card"
style="
margin-bottom:14px;
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
margin:0 0 6px;
"
>

📦
${escapeAdminOrderHtml(
  orderId
)}

</h3>

${statusHtml}

</div>


<div
style="
font-size:20px;
font-weight:700;
color:#2563eb;
"
>

฿${total.toLocaleString(
  "th-TH",
  {
    maximumFractionDigits:2
  }
)}

</div>

</div>


<hr
style="
border:none;
border-top:1px solid #e5e7eb;
margin:14px 0;
"
>


<div
class="grid"
style="
grid-template-columns:
repeat(auto-fit,minmax(180px,1fr));
"
>


<div>

<b>
👤 ลูกค้า
</b>

<div
style="
margin-top:4px;
"
>
${escapeAdminOrderHtml(
  customerName
)}
</div>

</div>


<div>

<b>
💬 Twitter / X
</b>

<div
style="
margin-top:4px;
"
>
${escapeAdminOrderHtml(
  social
)}
</div>

</div>


<div>

<b>
🚚 บริษัทขนส่ง
</b>

<div
style="
margin-top:4px;
"
>
${escapeAdminOrderHtml(
  courier
)}
</div>

</div>


<div>

<b>
🔎 Tracking
</b>

<div
style="
margin-top:4px;
word-break:break-all;
"
>
${escapeAdminOrderHtml(
  trackingNo
)}
</div>

</div>


<div>

<b>
📅 วันที่จัดส่ง
</b>

<div
style="
margin-top:4px;
"
>

${escapeAdminOrderHtml(
  archiveDateText
)}

</div>

${
  !hasRealShippedAt

    ? `

<div
style="
margin-top:3px;
font-size:11px;
color:#94a3b8;
"
>
ข้อมูลเก่า — ใช้วันที่สร้างออเดอร์ชั่วคราว
</div>

`

    : ""
}

</div>


<div>

<b>
📧 อีเมล
</b>

<div
style="
margin-top:4px;
word-break:break-word;
"
>
${escapeAdminOrderHtml(
  order.email || "-"
)}
</div>

</div>

</div>

</div>

`;

}

