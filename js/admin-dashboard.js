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

