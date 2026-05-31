const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec?action=products";

let cart = JSON.parse(
localStorage.getItem("cart") || "[]"
);

window.productsData = [];

async function loadProducts() {

try {

const response = await fetch(API);
const products = await response.json();

window.productsData = products;

const container =
  document.getElementById("products");

container.innerHTML = "";

products.forEach((product, index) => {

  container.innerHTML += `
    <div class="card">

      <img src="${product.image}" alt="${product.name}">

      <div class="card-body">

        <h3>${product.name}</h3>

        <p>${product.fandom || ""}</p>

        <p class="price">
          ฿${product.price}
        </p>

        <div class="actions">

          <button onclick="viewProduct(${index})">
            ดูรายละเอียด
          </button>

          <button onclick="addToCartByIndex(${index})">
            เพิ่มลงตะกร้า
          </button>

        </div>

      </div>

    </div>
  `;

});

} catch (error) {

console.error("โหลดสินค้าไม่สำเร็จ", error);

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

    alert("ไม่มีสินค้าในตะกร้า");
    return;

  }

  let subtotal = 0;

  cart.forEach(item=>{

    subtotal +=
      Number(item.price) * item.qty;

  });

  const data = {

    customer_name:
      document.getElementById(
        "customerName"
      ).value,

    email:
      document.getElementById(
        "customerEmail"
      ).value,

    phone:
      document.getElementById(
        "customerPhone"
      ).value,

    social:
      document.getElementById(
        "customerSocial"
      ).value,

    receiver_name:
      document.getElementById(
        "receiverName"
      ).value,

    address:
      document.getElementById(
        "address"
      ).value,

    province:
      document.getElementById(
        "province"
      ).value,

    postcode:
      document.getElementById(
        "postcode"
      ).value,

    subtotal: subtotal,

    total: subtotal,

    items: cart

  };

  try{

    const formData =
  new FormData();

formData.append(
  "payload",
  JSON.stringify(data)
);

const response =
  await fetch(
    "https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec",
    {
      method:"POST",
      body: formData
    }
  );

    const result =
      await response.json();
    
console.log(result);
    
    showPaymentPopup(
  result.order_id,
  subtotal
);

    cart = [];

    saveCart();

    checkout();

    document
      .getElementById(
        "summaryItems"
      )
      .innerHTML = "";

  }
  catch(error){

    console.error(error);

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

  const file =
    document.getElementById(
      "paymentSlip"
    ).files[0];

  if(!file){

    alert(
      "กรุณาแนบสลิป"
    );

    return;

  }

  const amount =
    document.getElementById(
      "summaryTotal"
    ).innerText
      .replace("รวม ","")
      .replace(" บาท","");

  const payload = {

    order_id: orderId,

    amount: amount,

    slip_url:
      file.name

  };

  const formData =
    new FormData();

  formData.append(
    "payload",
    JSON.stringify(payload)
  );

  const response =
    await fetch(
      "https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec?action=payment",
      {
        method:"POST",
        body:formData
      }
    );

  const result =
    await response.json();

  alert(
    "แจ้งชำระเงินเรียบร้อย"
  );

  closePayment();

}

function closePayment(){

  document.getElementById(
    "paymentModal"
  ).style.display =
    "none";

}

updateCartCount();
loadProducts();
