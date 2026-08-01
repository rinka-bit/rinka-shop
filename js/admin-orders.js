/*
=========================================
RINKA ADMIN — ORDER MANAGER
=========================================
*/

let adminOrdersCache = [];


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

  if(!box){
    return;
  }

  box.innerHTML = `

<div class="card">
⏳ กำลังโหลดออเดอร์...
</div>

`;

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
        : Array.isArray(result)
          ? [
              ...result
            ].reverse()
          : [];


    /*
    =====================================
    แสดงเฉพาะออเดอร์ที่ชำระแล้ว
    และยังไม่ Completed
    =====================================
    */

    const visibleOrders =
      rawOrders.filter(
        order => {

          return (
            String(
              order.payment_status || ""
            )
              .trim()
              .toLowerCase() ===
              "paid" &&

            String(
              order.status || ""
            )
              .trim()
              .toLowerCase() !==
              "completed"
          );

        }
      );


    /*
    =====================================
    โหลดรายละเอียดเพิ่มเติม

    ถ้า action=orders ยังไม่มี
    items / gifts จะโหลดเป็นรายออเดอร์
    =====================================
    */

    adminOrdersCache =
      await Promise.all(
        visibleOrders.map(
          order =>
            loadAdminOrderDetail(
              order
            )
        )
      );


    renderAdminOrders();

  }catch(error){

    console.error(
      "loadOrders error:",
      error
    );

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

    "order",

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


  box.innerHTML =
    adminOrdersCache
      .map(
        order =>
          renderOrderCard(
            order
          )
      )
      .join("");


  adminOrdersCache.forEach(
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
          "pending";

        toggleOrderFields(
          orderId
        );

      }

    }
  );

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
      "pending"
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

<option value="pending">
รอจัดการ
</option>

<option value="china_arrived">
ถึงโกดังจีนแล้ว
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

<div
id="trackingBox_${escapeAdminOrderHtml(
  orderId
)}"
style="display:none;"
>

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
🚚 ข้อมูลจัดส่ง
</h4>

<label>
บริษัทขนส่ง
</label>

<input
id="courier_${escapeAdminOrderHtml(
  orderId
)}"
value="${escapeAdminOrderHtml(
  order.courier || ""
)}"
placeholder="เช่น Flash Express"
>

<br><br>

<label>
เลขพัสดุ
</label>

<input
id="tracking_${escapeAdminOrderHtml(
  orderId
)}"
value="${escapeAdminOrderHtml(
  order.tracking_no || ""
)}"
placeholder="เลขพัสดุ"
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


  const trackingBox =
    document.getElementById(
      "trackingBox_" +
      orderId
    );


  if(feeBox){

    feeBox.style.display =
      status ===
      "ready_to_ship"

        ? "block"

        : "none";

  }


  if(trackingBox){

    trackingBox.style.display =
      status ===
      "shipped"

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


  if(
    status ===
    "shipped"
  ){

    payload.courier =
      document
        .getElementById(
          "courier_" +
          orderId
        )
        ?.value
        .trim() || "";


    payload.tracking_no =
      document
        .getElementById(
          "tracking_" +
          orderId
        )
        ?.value
        .trim() || "";


    if(
      !payload.courier ||
      !payload.tracking_no
    ){

      alert(
        "กรุณากรอกขนส่งและเลขพัสดุ"
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
