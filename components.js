/**
 * Rinka Shop - Shared Product Components
 */

function normalizeComponentBoolean(value){
  return value === true ||
    value === 1 ||
    ["true","yes","1","active"].includes(
      String(value || "").trim().toLowerCase()
    );
}

function escapeComponentHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function safeStorageArray(key){
  try{
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  }catch(error){
    console.warn("อ่าน localStorage ไม่สำเร็จ:", key, error);
    return [];
  }
}

function getDeadlineText(deadline){
  if(!deadline || String(deadline).trim() === "N/A") return "";

  const end = new Date(deadline);
  if(Number.isNaN(end.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.ceil((endDay - today) / 86400000);

  if(diffDays < 0) return "";
  if(diffDays === 0) return "🔥 ปิดรับวันนี้";
  if(diffDays === 1) return "⏰ เหลือ 1 วัน";
  return `⏰ เหลือ ${diffDays} วัน`;
}

function createProductCard(product){
  const price = Number(product.final_price ?? product.price ?? 0);
  const oldPrice = Number(product.old_price ?? product.price ?? 0);
  const onSale = normalizeComponentBoolean(product.on_sale);
  const isNew = normalizeComponentBoolean(product.new_arrival);
  const type = String(product.product_type || "preorder").trim().toLowerCase();
  const deadline = getDeadlineText(product.preorder_deadline);
  const productUrl = "product.html?id=" + encodeURIComponent(product.product_id || "");

  return `
<article
class="rk-product-card card"
tabindex="0"
role="link"
onclick='window.location.href=${JSON.stringify(productUrl)}'
onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}">

  <div class="rk-product-image image-box">
    ${
      product.image
        ? `<img src="${escapeComponentHtml(product.image)}" alt="${escapeComponentHtml(product.name || "")}" loading="lazy">`
        : `<div class="rk-image-placeholder">ไม่มีรูปสินค้า</div>`
    }

    <div class="rk-product-badges">
      <span class="rk-badge ${type === "instock" ? "rk-badge-stock" : "rk-badge-preorder"}">
        ${type === "instock" ? "พร้อมส่ง" : "PREORDER"}
      </span>

      ${
        onSale
          ? `<span class="rk-badge rk-badge-sale">SALE</span>`
          : isNew
            ? `<span class="rk-badge rk-badge-new">NEW</span>`
            : ""
      }
    </div>
  </div>

  <div class="rk-product-body card-body">
    <h3>${escapeComponentHtml(product.name || "สินค้า")}</h3>

    ${
      product.fandom
        ? `<p class="rk-product-fandom fandom">${escapeComponentHtml(product.fandom)}</p>`
        : ""
    }

    <div class="rk-price-box price-box">
      ${
        onSale
          ? `<span class="rk-sale-price sale-price">฿${price.toLocaleString("th-TH")}</span>
             <span class="rk-old-price old-price">฿${oldPrice.toLocaleString("th-TH")}</span>`
          : `<span class="rk-normal-price normal-price">฿${price.toLocaleString("th-TH")}</span>`
      }
    </div>

    ${deadline ? `<div class="rk-deadline deadline">${escapeComponentHtml(deadline)}</div>` : ""}
  </div>
</article>`;
}
