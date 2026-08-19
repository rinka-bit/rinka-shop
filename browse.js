const BASE_API =
  "https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";

let browseProducts = [];
let searchTimer = null;

function getBrowseParams(){
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get("type") || "",
    value: params.get("value") || "",
    id: params.get("id") || "",
    keyword: params.get("q") || ""
  };
}

document.addEventListener("DOMContentLoaded",()=>{
  updateCartCount();

  const params = getBrowseParams();
  const searchInput = document.getElementById("searchInput");

  if(params.keyword){
    searchInput.value = params.keyword;
  }

  document.getElementById("sortSelect")?.addEventListener("change",renderBrowseResults);
  searchInput?.addEventListener("input",handleSearch);
  document.getElementById("clearSearchButton")?.addEventListener("click",clearBrowseSearch);
  document.getElementById("resetFilterButton")?.addEventListener("click",resetBrowseFilters);
  document.getElementById("emptyResetButton")?.addEventListener("click",resetBrowseFilters);

  updateTitle();
  initBrowse();
});

async function initBrowse(){

  showBrowseLoading();
  clearBrowseStatus();

  const startedAt =
    performance.now();

  try{

    const response =
      await fetch(
        BASE_API +
        "?action=productCards"
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
        "โหลดสินค้าไม่สำเร็จ"
      );

    }

    browseProducts =
      Array.isArray(result)
        ? result
        : Array.isArray(
            result.products
          )
          ? result.products
          : [];

    console.log(
      "BROWSE PRODUCT CARDS:",
      browseProducts.length,
      "items /",
      Math.round(
        performance.now() -
        startedAt
      ),
      "ms"
    );

    renderBrowseResults();

  }catch(error){

    console.error(
      "initBrowse error:",
      error
    );

    hideBrowseLoading();

    const grid =
      document.getElementById(
        "productGrid"
      );

    if(grid){
      grid.innerHTML = "";
    }

    document
      .getElementById(
        "emptyState"
      )
      ?.classList.add(
        "hidden"
      );

    setBrowseStatus(
      "โหลดสินค้าไม่สำเร็จ กรุณาลองใหม่ " +
      `<button
      type="button"
      class="secondary-btn"
      onclick="initBrowse()"
      >
      ลองใหม่
      </button>`
    );

    updateResultCount(0);

  }

}
function handleSearch(){
  updateSearchControls();
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(renderBrowseResults, 180);
}

function renderBrowseResults(){
  clearBrowseStatus();
  let products = filterProducts([...browseProducts]);
  products = sortProducts(products);
  updateTitle();
  updateActiveFilter();
  renderProducts(products);
}

function updateTitle(){
  const { type, value, keyword } = getBrowseParams();
  const title = document.getElementById("browseTitle");
  const description = document.getElementById("browseDescription");
  const pageTitle = document.getElementById("pageTitle");

  let heading = "สินค้าทั้งหมด";
  let detail = "สินค้าทั้งหมดของร้าน";

  switch(type){
    case "new": heading = "⭐ สินค้าใหม่"; detail = "สินค้าใหม่ล่าสุดของร้าน"; break;
    case "sale": heading = "🔥 ลดราคา"; detail = "สินค้าที่กำลังมีโปรโมชั่น"; break;
    case "featured": heading = "✨ สินค้าแนะนำ"; detail = "สินค้าที่ร้านแนะนำ"; break;
    case "fandom": heading = value || "Fandom"; detail = `สินค้าทั้งหมดจาก ${value || "Fandom"}`; break;
    case "collection": heading = "Collection"; detail = "สินค้าใน Collection ที่เลือก"; break;
    case "main_category": heading = value || "หมวดสินค้า"; detail = `หมวด ${value || "สินค้า"}`; break;
    case "sub_category": heading = value || "หมวดสินค้าย่อย"; detail = `หมวดย่อย ${value || "สินค้า"}`; break;
    case "search": heading = `ค้นหา “${keyword || ""}”`; detail = "ผลการค้นหา"; break;
  }

  title.textContent = heading;
  description.textContent = detail;
  pageTitle.textContent = heading.length > 20 ? "สินค้า" : heading;
  document.title = heading + " | Rinka Shop";
}

function filterProducts(products){
  const { type, value, id, keyword } = getBrowseParams();
  const inputKeyword = document.getElementById("searchInput")?.value.trim() || "";
  const activeKeyword = inputKeyword || keyword;

  let result = products;

  switch(type){
    case "new": result = result.filter(product=>isTruthy(product.new_arrival)); break;
    case "sale": result = result.filter(product=>isTruthy(product.on_sale) || Number(product.sale_price || 0) > 0); break;
    case "featured": result = result.filter(product=>isTruthy(product.featured)); break;
    case "fandom": result = result.filter(product=>sameText(product.fandom, value)); break;
    case "collection": result = result.filter(product=>String(product.collection_id || "") === String(id || value || "")); break;
    case "main_category": result = result.filter(product=>sameText(product.main_category, value)); break;
    case "sub_category": result = result.filter(product=>sameText(product.sub_category, value)); break;
  }

  if(activeKeyword){
    result = searchProducts(result, activeKeyword);
  }

  return result;
}

function searchProducts(products, keyword){
  const query = String(keyword || "").toLowerCase().trim();
  if(!query) return products;

  return products.filter(product=>{
    const optionText = Array.isArray(product.options)
      ? product.options.map(option=>`${option.option_name || ""} ${option.option_value || ""}`).join(" ")
      : "";

    const haystack = [
      product.name,
      product.fandom,
      product.description,
      product.search_keywords,
      product.main_category,
      product.sub_category,
      product.round,
      optionText
    ].join(" ").toLowerCase();

    return haystack.includes(query);
  });
}

function sortProducts(
  products
){

  const sort =
    document
      .getElementById(
        "sortSelect"
      )
      ?.value ||
    "newest";


  switch(sort){

    case "price_low":

      products.sort(
        (a,b) =>
          getProductMinPrice(a) -
          getProductMinPrice(b)
      );

      break;


    case "price_high":

      products.sort(
        (a,b) =>
          getProductMaxPrice(b) -
          getProductMaxPrice(a)
      );

      break;


    case "name":

      products.sort(
        (a,b) =>
          String(
            a.name || ""
          )
            .localeCompare(
              String(
                b.name || ""
              ),
              "th"
            )
      );

      break;


    default:

      products.sort(
        (a,b) => {

          const sortOrder =
            Number(
              b.sort_order || 0
            ) -
            Number(
              a.sort_order || 0
            );


          if(
            sortOrder !== 0
          ){

            return sortOrder;

          }


          return String(
            b.product_id || ""
          )
            .localeCompare(
              String(
                a.product_id || ""
              )
            );

        }
      );

  }


  return products;

}

function renderProducts(products){
  hideBrowseLoading();
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const emptyDescription = document.getElementById("emptyDescription");

  updateResultCount(products.length);
  updateSearchControls();

  if(products.length === 0){
    grid.innerHTML = "";
    emptyDescription.textContent = document.getElementById("searchInput")?.value.trim()
      ? "ไม่พบสินค้าที่ตรงกับคำค้น ลองใช้คำที่สั้นลงหรือล้างคำค้นดูนะคะ"
      : "ยังไม่มีสินค้าในหมวดนี้ ลองดูสินค้าทั้งหมดแทนนะคะ";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  grid.innerHTML = products.map(createBrowseProductCard).join("");
}

function createBrowseProductCard(
  product
){

  const productId =
    escapeHtml(
      product.product_id || ""
    );


  const name =
    escapeHtml(
      product.name ||
      "สินค้า"
    );


  const fandom =
    escapeHtml(
      product.fandom || ""
    );


  const image =
    escapeHtml(
      product.image || ""
    );


  const priceMode =
    String(
      product.price_mode ||
      "fixed"
    )
      .trim()
      .toLowerCase();


  const price =
    getProductPrice(
      product
    );


  const minPrice =
    getProductMinPrice(
      product
    );


  const maxPrice =
    getProductMaxPrice(
      product
    );


  const oldPrice =
    Number(
      product.old_price ??
      product.price ??
      0
    );


  const deadlineText =
    getDeadlineText(
      product.preorder_deadline
    );


  /*
  Option pricing
  ไม่ใช้ sale badge ของ Products
  */

  const onSale =
    priceMode === "fixed" &&
    (
      isTruthy(
        product.on_sale
      ) ||
      (
        Number(
          product.sale_price || 0
        ) > 0 &&
        oldPrice > price
      )
    );


  const isNew =
    isTruthy(
      product.new_arrival
    );


  const isPreorder =
    String(
      product.product_type ||
      "preorder"
    )
      .toLowerCase() ===
    "preorder";


  /*
  =========================================
  PRICE HTML
  =========================================
  */

  let priceHtml = "";


  if(
    priceMode === "option"
  ){

    if(
      minPrice > 0 ||
      maxPrice > 0
    ){

      if(
        minPrice !==
        maxPrice
      ){

        priceHtml = `

<span class="normal-price">
  ฿${minPrice.toLocaleString("th-TH")}
  –
  ฿${maxPrice.toLocaleString("th-TH")}
</span>

`;

      }else{

        priceHtml = `

<span class="normal-price">
  ฿${minPrice.toLocaleString("th-TH")}
</span>

`;

      }

    }else{

      priceHtml = `

<span class="normal-price">
  รอกำหนดราคา
</span>

`;

    }

  }
  else if(
    onSale
  ){

    priceHtml = `

<span class="sale-price">
  ฿${price.toLocaleString("th-TH")}
</span>

<span class="old-price">
  ฿${oldPrice.toLocaleString("th-TH")}
</span>

`;

  }
  else{

    priceHtml = `

<span class="normal-price">
  ฿${price.toLocaleString("th-TH")}
</span>

`;

  }


  return `

<article
class="card"
tabindex="0"
role="link"

onclick="
openBrowseProduct(
  '${escapeJs(
    product.product_id || ""
  )}'
)
"

onkeydown="
handleBrowseCardKey(
  event,
  '${escapeJs(
    product.product_id || ""
  )}'
)
"
>

  <div class="image-box">

    <img
    src="${image}"
    alt="${name}"
    loading="lazy"
    onerror="
    this.style.opacity='.18'
    "
    >

    ${
      isNew
        ? `
          <div class="badge-new">
            NEW
          </div>
        `
        : ""
    }

    ${
      onSale
        ? `
          <div class="badge-sale">
            SALE
          </div>
        `
        : ""
    }

    <div
    class="${
      isPreorder
        ? "badge-preorder"
        : "badge-stock"
    }"
    >
      ${
        isPreorder
          ? "PREORDER"
          : "พร้อมส่ง"
      }
    </div>

  </div>


  <div class="card-body">

    <h3>
      ${name}
    </h3>

    ${
      fandom
        ? `
          <p class="fandom">
            ${fandom}
          </p>
        `
        : ""
    }


    <div class="price-box">

      ${priceHtml}

    </div>


    ${
      deadlineText
        ? `
          <div class="deadline">
            ${escapeHtml(
              deadlineText
            )}
          </div>
        `
        : ""
    }

  </div>

</article>

`;

}

function getDeadlineText(deadline){
  if(!deadline || deadline === "N/A") return "";
  const end = new Date(deadline);
  if(Number.isNaN(end.getTime())) return "";

  const today = new Date();
  today.setHours(0,0,0,0);
  end.setHours(23,59,59,999);
  const diffDays = Math.ceil((end-today)/(1000*60*60*24));

  if(diffDays < 0) return "";
  if(diffDays === 0) return "🔥 ปิดรับวันนี้";
  if(diffDays === 1) return "⏰ เหลือ 1 วัน";
  return `⏰ เหลือ ${diffDays} วัน`;
}

function updateActiveFilter(){
  const box = document.getElementById("activeFilter");
  const reset = document.getElementById("resetFilterButton");
  const { type, value } = getBrowseParams();
  const search = document.getElementById("searchInput")?.value.trim() || "";
  const labels = { new:"สินค้าใหม่", sale:"ลดราคา", featured:"สินค้าแนะนำ", fandom:value, collection:"Collection", main_category:value, sub_category:value, search:"ค้นหา" };
  const hasFilter = Boolean(type || search);

  reset.classList.toggle("hidden", !hasFilter);
  if(!hasFilter){ box.classList.add("hidden"); return; }

  const parts = [];
  if(type) parts.push(labels[type] || value || type);
  if(search) parts.push(`ค้นหา: ${search}`);
  box.textContent = "ตัวกรอง: " + parts.join(" • ");
  box.classList.remove("hidden");
}

function clearBrowseSearch(){
  const input = document.getElementById("searchInput");
  input.value = "";
  input.focus();
  renderBrowseResults();
}

function resetBrowseFilters(){
  window.location.href = "browse.html";
}

function updateSearchControls(){
  const hasSearch = Boolean(document.getElementById("searchInput")?.value.trim());
  document.getElementById("clearSearchButton")?.classList.toggle("hidden", !hasSearch);
}

function updateResultCount(count){
  const box = document.getElementById("resultCount");
  if(box) box.textContent = `${Number(count || 0).toLocaleString('th-TH')} รายการ`;
}

function showBrowseLoading(){
  document.getElementById("loading")?.classList.remove("hidden");
  document.getElementById("productGrid").innerHTML = "";
  document.getElementById("emptyState")?.classList.add("hidden");
}

function hideBrowseLoading(){ document.getElementById("loading")?.classList.add("hidden"); }
function setBrowseStatus(html){ const box=document.getElementById("statusMessage"); box.innerHTML=html; box.classList.remove("hidden"); }
function clearBrowseStatus(){ const box=document.getElementById("statusMessage"); box.innerHTML=""; box.classList.add("hidden"); }
function openBrowseProduct(id){ window.location.href = "product.html?id=" + encodeURIComponent(id); }
function handleBrowseCardKey(event,id){ if(event.key === "Enter" || event.key === " "){ event.preventDefault(); openBrowseProduct(id); } }

function getProductPrice(
  product
){

  const priceMode =
    String(
      product.price_mode ||
      "fixed"
    )
      .trim()
      .toLowerCase();


  if(
    priceMode === "option"
  ){

    return getProductMinPrice(
      product
    );

  }


  const value =
    Number(
      product.final_price ??
      product.sale_price ??
      product.price ??
      0
    );


  return Number.isFinite(
    value
  )
    ? value
    : 0;

}


function getProductMinPrice(
  product
){

  const priceMode =
    String(
      product.price_mode ||
      "fixed"
    )
      .trim()
      .toLowerCase();


  if(
    priceMode !== "option"
  ){

    const value =
      Number(
        product.final_price ??
        product.sale_price ??
        product.price ??
        0
      );


    return Number.isFinite(
      value
    )
      ? value
      : 0;

  }


  const value =
    Number(
      product.min_price ??
      product.final_price ??
      product.price ??
      0
    );


  return Number.isFinite(
    value
  )
    ? value
    : 0;

}


function getProductMaxPrice(
  product
){

  const priceMode =
    String(
      product.price_mode ||
      "fixed"
    )
      .trim()
      .toLowerCase();


  if(
    priceMode !== "option"
  ){

    return getProductMinPrice(
      product
    );

  }


  const value =
    Number(
      product.max_price ??
      product.min_price ??
      product.final_price ??
      product.price ??
      0
    );


  return Number.isFinite(
    value
  )
    ? value
    : 0;

}

function sameText(a,b){ return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase(); }
function isTruthy(value){ return value===true || value===1 || ["true","yes","1","active"].includes(String(value || "").trim().toLowerCase()); }
function escapeHtml(value){ return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function escapeJs(value){ return String(value ?? "").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r?\n/g," "); }

function updateCartCount(){
  let cart = [];
  try{
    const parsed = JSON.parse(localStorage.getItem("cart") || "[]");
    cart = Array.isArray(parsed) ? parsed : [];
  }catch(error){
    console.warn("cart localStorage invalid", error);
  }

  const total = cart.reduce((sum,item)=>sum+Number(item.qty || 0),0);
  const cartCount = document.getElementById("cartCount");
  if(cartCount) cartCount.textContent = total;
}
