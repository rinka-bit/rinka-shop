const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec?action=products";

let cart = JSON.parse(
  localStorage.getItem("cart") || "[]"
);

window.productsData = [];

async function loadProducts(){

  const container =
    document.getElementById(
      "products"
    );

  if(!container){
    return;
  }

  try{

    const response =
      await fetch(API);

    const result =
      await response.json();

    const products =
      Array.isArray(result)
        ? result
        : Array.isArray(result.products)
          ? result.products
          : [];

    window.productsData =
      products;

    container.innerHTML = "";

    products.forEach(
      (product,index)=>{

        const price =
          Number(
            product.final_price ??
            product.price ??
            0
          );

        container.innerHTML += `

          <div class="card">

            <img
            src="${product.image || ""}"
            alt="${product.name || ""}">

            <div class="card-body">

              <h3>
                ${product.name || "-"}
              </h3>

              <p>
                ${product.fandom || ""}
              </p>

              <p class="price">
                ฿${price}
              </p>

              <div class="actions">

                <button
                onclick="
                  window.location.href=
                  'product.html?id=${product.product_id}'
                ">
                  ดูรายละเอียด
                </button>

                <button
                onclick="
                  addToCartByIndex(${index})
                ">
                  เพิ่มลงตะกร้า
                </button>

              </div>

            </div>

          </div>

        `;

      }
    );

  }catch(error){

    console.error(
      "โหลดสินค้าไม่สำเร็จ",
      error
    );

    container.innerHTML =
      "โหลดสินค้าไม่สำเร็จ";

  }

}

function addToCartByIndex(index){

const product =
window.productsData[index];

addToCart(product);

}

function addToCart(product){

const found =
cart.find(
p => p.product_id === product.product_id
);

if(found){

found.qty++;

}else{

cart.push({
  ...product,
  qty:1
});

}

  saveCart();

  checkout();

}

function increaseQty(productId){

const item =
cart.find(
p => p.product_id === productId
);

if(item){

item.qty++;

saveCart();

checkout();

openCart();
  
}

}

function decreaseQty(productId){

const item =
cart.find(
p => p.product_id === productId
);

if(item){

item.qty--;

if(item.qty <= 0){

  cart =
    cart.filter(
      p => p.product_id !== productId
    );

}

saveCart();

checkout();

openCart();

}

}

function removeItem(productId){

cart =
cart.filter(
p => p.product_id !== productId
);

saveCart();

checkout();

openCart();

}

function saveCart(){

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCartCount();

}

function updateCartCount(){

let total = 0;

cart.forEach(item => {

total += item.qty;

});

const cartCount =
document.getElementById("cartCount");

if(cartCount){

cartCount.textContent = total;

}

}

function openCart(){

const modal =
document.getElementById("cartModal");

const items =
document.getElementById("cartItems");

const totalBox =
document.getElementById("cartTotal");

let total = 0;

items.innerHTML = "";

cart.forEach(item => {

const lineTotal =
  Number(item.price) * item.qty;

total += lineTotal;

items.innerHTML += `
  <div class="cart-item">

    <div>

      <strong>
        ${item.name}
      </strong>

      <br>

      ฿${item.price}

      <br>

      รวม ${lineTotal} บาท

    </div>

    <div class="cart-controls">

      <button onclick="decreaseQty('${item.product_id}')">
        -
      </button>

      <span>${item.qty}</span>

      <button onclick="increaseQty('${item.product_id}')">
        +
      </button>

      <button
        class="remove-btn"
        onclick="removeItem('${item.product_id}')">
        ลบ
      </button>

    </div>

  </div>
`;

});

totalBox.textContent =
`รวมทั้งหมด ${total} บาท`;

modal.style.display = "block";

}

function closeCart(){

document.getElementById(
"cartModal"
).style.display = "none";

}

function checkout(){

  closeCart();

  document.getElementById(
    "checkoutPage"
  ).style.display = "block";

  document.getElementById(
    "checkoutPage"
  ).scrollIntoView({
    behavior:"smooth"
  });

}

function nextToReview(){

  let total = 0;

  let html = "";

  cart.forEach(item=>{

    const lineTotal =
      Number(item.price) * item.qty;

    total += lineTotal;

    html += `
      <p>
      ${item.name}
      x ${item.qty}
      =
      ${lineTotal}
      บาท
      </p>
    `;

  });

  html += `
    <hr>

    <p>
    ชื่อ:
    ${document.getElementById("customerName").value}
    </p>

    <p>
    Email:
    ${document.getElementById("customerEmail").value}
    </p>

    <p>
    โทร:
    ${document.getElementById("customerPhone").value}
    </p>

    <p>
    Social:
    ${document.getElementById("customerSocial").value}
    </p>

    <p>
    ผู้รับ:
    ${document.getElementById("receiverName").value}
    </p>

    <p>
    ที่อยู่:
    ${document.getElementById("address").value}
    </p>

    <p>
    จังหวัด:
    ${document.getElementById("province").value}
    </p>

    <p>
    รหัสไปรษณีย์:
    ${document.getElementById("postcode").value}
    </p>

    <h3>
    รวม ${total} บาท
    </h3>
  `;

  document.getElementById(
    "reviewContent"
  ).innerHTML = html;

  document.getElementById(
    "reviewPage"
  ).style.display = "block";

  document.getElementById(
    "reviewPage"
  ).scrollIntoView({
    behavior:"smooth"
  });

}

function viewProduct(index){

const product =
window.productsData[index];

document.getElementById(
"productDetail"
).innerHTML = `

<img
  src="${product.image}"
  style="width:100%;max-width:400px;">

<h2>${product.name}</h2>

<p>${product.description || ""}</p>

<p>ราคา ${product.price} บาท</p>

<p>รอบพรี ${product.round || "-"}</p>

<p>กำหนดส่ง ${product.estimated_arrival || "-"}</p>

<button onclick="addToCartByIndex(${index})">
  เพิ่มลงตะกร้า
</button>

`;

document.getElementById(
"productModal"
).style.display = "block";

}

function closeProduct(){

document.getElementById(
"productModal"
).style.display = "none";

}

function confirmOrder(){

  submitOrder();

}

async function submitOrder(){

  if(cart.length === 0){

    alert(
      "ไม่มีสินค้าในตะกร้า"
    );

    return;

  }

  let subtotal = 0;

  const items =
    cart.map(item=>{

      const price =
        Number(
          item.final_price ??
          item.price ??
          0
        );

      const qty =
        Number(
          item.qty || 1
        );

      subtotal +=
        price * qty;

      return {

        product_id:
          item.product_id || "",

        name:
          item.name || "",

        price:
          price,

        qty:
          qty,

        final_price:
          price * qty,

        selected_options:
          item.selected_options || {},

        collection_id:
          item.collection_id || ""

      };

    });

  const payload = {

    customer_name:
      document.getElementById(
        "customerName"
      )?.value.trim() || "",

    email:
      document.getElementById(
        "customerEmail"
      )?.value.trim() || "",

    phone:
      document.getElementById(
        "customerPhone"
      )?.value.trim() || "",

    social:
      document.getElementById(
        "customerSocial"
      )?.value.trim() || "",

    subtotal:
      subtotal,

    shipping_fee:
      0,

    crate_fee:
      0,

    total:
      subtotal,

    status:
      "pending",

    payment_status:
      "unpaid",

    items:
      items

  };

  if(
    !payload.customer_name ||
    !payload.email ||
    !payload.phone
  ){

    alert(
      "กรุณากรอกข้อมูลลูกค้าให้ครบ"
    );

    return;

  }

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "createOrder"
    );

    formData.append(
      "payload",
      JSON.stringify(payload)
    );

    const response =
      await fetch(
        API.replace(
          "?action=products",
          ""
        ),
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();

    if(
      !result.success ||
      !result.order_id
    ){

      alert(
        result.error ||
        "สร้างออเดอร์ไม่สำเร็จ"
      );

      return;

    }

    showPaymentPopup(
      result.order_id,
      subtotal
    );

    cart = [];

    saveCart();

    const summaryItems =
      document.getElementById(
        "summaryItems"
      );

    if(summaryItems){

      summaryItems.innerHTML =
        "";

    }

  }catch(error){

    console.error(
      "submitOrder error:",
      error
    );

    alert(
      "เกิดข้อผิดพลาดในการส่งออเดอร์"
    );

  }

}

function showPaymentPopup(
  orderId,
  amount
){

  document.getElementById(
    "paymentContent"
  ).innerHTML = `

    <h3>
      เลขออเดอร์
    </h3>

    <p>
      ${orderId}
    </p>

    <hr>

    <p>
      ธนาคารกสิกรไทย
    </p>

    <p id="bankNumber">
      123-4-56789-0
    </p>

    <p>
      Rinka Store
    </p>

    <h3>
      ยอดโอน ${amount} บาท
    </h3>

    <button
      onclick="copyBankNumber()">
      คัดลอกเลขบัญชี
    </button>

    <hr>

    <input
      type="file"
      id="paymentSlip">

    <button
      onclick="uploadSlip('${orderId}')">
      ยืนยันการชำระเงิน
    </button>

  `;

  document.getElementById(
    "paymentModal"
  ).style.display =
    "block";

}

function copyBankNumber(){

  navigator.clipboard.writeText(
    "1234567890"
  );

  alert(
    "คัดลอกเลขบัญชีแล้ว"
  );

}

async function uploadSlip(
  orderId
){

  const fileInput =
    document.getElementById(
      "paymentSlip"
    );

  const file =
    fileInput?.files?.[0];

  if(!file){

    alert(
      "กรุณาแนบสลิป"
    );

    return;

  }

  try{

    const slipBase64 =
      await fileToBase64(file);

    const amountText =
      document.getElementById(
        "summaryTotal"
      )?.innerText || "";

    const amount =
      Number(
        amountText.replace(
          /[^0-9.]/g,
          ""
        )
      ) || 0;

    const payload = {

      order_id:
        orderId,

      amount:
        amount,

      slip_base64:
        slipBase64

    };

    const formData =
      new FormData();

    formData.append(
      "action",
      "payment"
    );

    formData.append(
      "payload",
      JSON.stringify(payload)
    );

    const response =
      await fetch(
        API.replace(
          "?action=products",
          ""
        ),
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
        "แจ้งชำระเงินไม่สำเร็จ"
      );

      return;

    }

    alert(
      "แจ้งชำระเงินเรียบร้อย"
    );

    closePayment();

  }catch(error){

    console.error(
      "uploadSlip error:",
      error
    );

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }

}

function closePayment(){

  document.getElementById(
    "paymentModal"
  ).style.display =
    "none";

}

updateCartCount();
loadProducts();

function searchProducts(){

const keyword =
document
.getElementById("search")
.value
.toLowerCase()
.trim();

const container =
document.getElementById("products");

container.innerHTML = "";

const filtered =
window.productsData.filter(product =>

(product.name || "")
.toLowerCase()
.includes(keyword)

||

(product.fandom || "")
.toLowerCase()
.includes(keyword)

||

(product.sub_category || "")
.toLowerCase()
.includes(keyword)

);

filtered.forEach((product,index)=>{

container.innerHTML += `
<div class="card">

<img
src="${product.image}"
alt="${product.name}">

<div class="card-body">

<h3>
${product.name}
</h3>

<p>
${product.fandom || ""}
</p>

<p class="price">
฿${product.price}
</p>

<div class="actions">

<button
onclick="
window.location.href=
'product.html?id=${product.product_id}'
">
ดูรายละเอียด
</button>

<button
onclick="
addToCartByIndex(
window.productsData.findIndex(
p=>p.product_id==='${product.product_id}'
)
)
">
เพิ่มลงตะกร้า
</button>

</div>

</div>

</div>
`;

});

}
