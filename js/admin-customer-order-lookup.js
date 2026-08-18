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
