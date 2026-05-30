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

}

function increaseQty(productId){

const item =
cart.find(
p => p.product_id === productId
);

if(item){

item.qty++;

saveCart();

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

openCart();

}

}

function removeItem(productId){

cart =
cart.filter(
p => p.product_id !== productId
);

saveCart();

openCart();

}

function saveCart(){

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCartCount();

  checkout();

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

const summaryItems =
document.getElementById(
"summaryItems"
);

const summaryTotal =
document.getElementById(
"summaryTotal"
);

let total = 0;

summaryItems.innerHTML = "";

cart.forEach(item => {

const lineTotal =
  Number(item.price) * item.qty;

total += lineTotal;

summaryItems.innerHTML += `
  <p>
    ${item.name}
    × ${item.qty}
    = ${lineTotal} บาท
  </p>
`;

});

summaryTotal.innerHTML =
`รวม ${total} บาท`;

document
.getElementById(
"checkoutPage"
)
.scrollIntoView({
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

    const response =
      await fetch(
        "https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec",
      {
        method:"POST",
        headers:{
          "Content-Type":
          "application/json"
        },
        body:
          JSON.stringify(data)
      });

    const result =
      await response.json();

    alert(
      "สั่งซื้อสำเร็จ\nเลขออเดอร์: "
      + result.order_id
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
