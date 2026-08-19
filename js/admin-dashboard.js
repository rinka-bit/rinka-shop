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

function renderDashboardStats(
  stats
){

  const container =
    document.getElementById(
      "stats"
    );


  if(!container){
    return;
  }


  container.innerHTML = `

<div class="grid">

  <div class="card">
  📦<br>
  ${Number(
    stats.totalOrders || 0
  ).toLocaleString("th-TH")}
  ออเดอร์
  </div>

  <div class="card">
  💰<br>
  ${Number(
    stats.totalSales || 0
  ).toLocaleString(
    "th-TH",
    {
      maximumFractionDigits:2
    }
  )}
  บาท
  </div>

  <div class="card">
  🚚<br>
  ${Number(
    stats.pendingShipping || 0
  ).toLocaleString("th-TH")}
  รอส่ง
  </div>

  <div class="card">
  📍<br>
  ${Number(
    stats.pendingAddress || 0
  ).toLocaleString("th-TH")}
  คำขอ
  </div>

  <div class="card">
  💸<br>
  ${Number(
    stats.todaySales || 0
  ).toLocaleString(
    "th-TH",
    {
      maximumFractionDigits:2
    }
  )}
  บาท
  <br>
  วันนี้
  </div>

  <div class="card">
  📅<br>
  ${Number(
    stats.monthSales || 0
  ).toLocaleString(
    "th-TH",
    {
      maximumFractionDigits:2
    }
  )}
  บาท
  <br>
  เดือนนี้
  </div>

</div>

`;

}

function renderTopProducts(
  products
){

  const container =
    document.getElementById(
      "topProducts"
    );


  if(!container){
    return;
  }


  const list =
    Array.isArray(
      products
    )
      ? products
      : [];


  let html = `

<div class="card">

  <h2>
    🏆 สินค้าขายดีที่สุด
  </h2>

`;


  if(
    list.length === 0
  ){

    html += `

<p
style="
color:#777;
"
>
ยังไม่มีข้อมูลสินค้า
</p>

`;

  }else{

    list.forEach(
      (
        product,
        index
      ) => {

        const productName =
          String(
            product.name || ""
          );


        const qty =
          Number(
            product.qty || 0
          );


        html += `

<p
style="
display:flex;
justify-content:space-between;
align-items:center;
gap:10px;
"
>

  <span>

    ${index + 1}.

    ${escapeHtml(
      productName || "-"
    )}

    (${qty.toLocaleString(
      "th-TH"
    )} ชิ้น)

  </span>

  <button
  type="button"
  style="
  width:auto;
  padding:5px 10px;
  font-size:13px;
  "
  onclick="
  openProductSearch(
    '${escapeJsString(
      productName
    )}'
  )
  "
  >
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

function renderTopFandoms(
  fandoms
){

  const container =
    document.getElementById(
      "topFandoms"
    );


  if(!container){
    return;
  }


  const list =
    Array.isArray(
      fandoms
    )
      ? fandoms
      : [];


  let html = `

<div class="card">

  <h2>
    🌟 Fandom ยอดนิยม
  </h2>

`;


  if(
    list.length === 0
  ){

    html += `

<p
style="
color:#777;
"
>
ยังไม่มีข้อมูล Fandom
</p>

`;

  }else{

    list.forEach(
      (
        fandom,
        index
      ) => {

        const fandomName =
          String(
            fandom.fandom ||
            fandom.name ||
            ""
          );


        const qty =
          Number(
            fandom.qty ||
            fandom.quantity ||
            0
          );


        html += `

<p
style="
display:flex;
justify-content:space-between;
align-items:center;
gap:10px;
"
>

  <span>

    ${index + 1}.

    ${escapeHtml(
      fandomName || "-"
    )}

    (${qty.toLocaleString(
      "th-TH"
    )} ชิ้น)

  </span>

  <button
  type="button"
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
  "
  >
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

async function loadDashboardData(){

  try{

    const response =
      await fetch(
        API +
        "?action=adminDashboard"
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
        "โหลด Dashboard ไม่สำเร็จ"
      );

    }


    /*
    =========================================
    STATS
    =========================================
    */

    const stats =
      result.stats || {};


    renderDashboardStats(
      stats
    );


    /*
    =========================================
    TOP PRODUCTS
    =========================================
    */

    renderTopProducts(
      Array.isArray(
        result.topProducts
      )
        ? result.topProducts
        : []
    );


    /*
    =========================================
    TOP FANDOMS
    =========================================
    */

    renderTopFandoms(
      Array.isArray(
        result.topFandoms
      )
        ? result.topFandoms
        : []
    );


    console.log(
      "ADMIN DASHBOARD PROFILE:",
      result.performance || {}
    );


  }catch(error){

    console.error(
      "loadDashboardData error:",
      error
    );

  }

}
