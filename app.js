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

            <p>${product.fandom}</p>

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
              
              <button onclick="checkout()">
                สรุปคำสั่งซื้อ
              </button>
              
            </div>

          </div>

        </div>
      `;

    });

  } catch (error) {

    console.error(error);

  }

}

function addToCartByIndex(index) {

  const product =
    window.productsData[index];

  addToCart(product);

}

function addToCart(product) {

  const found = cart.find(
    p => p.product_id === product.product_id
  );

  if (found) {

    found.qty++;

  } else {

    cart.push({
      ...product,
      qty: 1
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

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCartCount();

}

function updateCartCount() {

  let total = 0;

  cart.forEach(item => {

    total += item.qty;

  });

  const cartCount =
    document.getElementById("cartCount");

  if (cartCount) {

    cartCount.textContent = total;

  }

}

function openCart() {

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

        <div>

          <button
            onclick="decreaseQty('${item.product_id}')">
            -
          </button>

          ${item.qty}

          <button
            onclick="increaseQty('${item.product_id}')">
            +
          </button>

          <button
            onclick="removeItem('${item.product_id}')">
            ลบ
          </button>

        </div>

      </div>
    `;

  });

  totalBox.textContent =
    `รวมทั้งหมด ${total} บาท`;

  modal.style.display =
    "block";

}

function closeCart() {

  document.getElementById(
    "cartModal"
  ).style.display = "none";

}

function viewProduct(index){

  const product =
    window.productsData[index];

  document.getElementById(
    "productDetail"
  ).innerHTML = `

    <img
      src="${product.image}"
      style="
      width:100%;
      max-width:400px;
      ">

    <h2>
      ${product.name}
    </h2>

    <p>
      ${product.description || ""}
    </p>

    <p>
      ราคา ${product.price} บาท
    </p>

    <p>
      รอบพรี ${product.round || "-"}
    </p>

    <p>
      กำหนดส่ง ${product.estimated_arrival || "-"}
    </p>

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

updateCartCount();
loadProducts();
