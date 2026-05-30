const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec?action=products";

let cart = JSON.parse(
localStorage.getItem("cart")
|| "[]"
);

updateCartCount();

async function loadProducts(){

  const response =
    await fetch(API);

  const products =
    await response.json();

  const container =
    document.getElementById("products");

  container.innerHTML = "";

  products.forEach(product => {

    container.innerHTML += `
      <div class="card">

        <img src="${product.image}">

        <div class="card-body">

          <h3>${product.name}</h3>

          <p>${product.fandom}</p>

          <p class="price">
            ฿${product.price}
          </p>

          <button
            onclick='addToCart(${JSON.stringify(product)})'>
            เพิ่มลงตะกร้า
          </button>

        </div>

      </div>
    `;

  });

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

  document.getElementById(
    "cartCount"
  ).textContent = total;

}

function openCart(){

  const modal =
    document.getElementById(
      "cartModal"
    );

  const items =
    document.getElementById(
      "cartItems"
    );

  const totalBox =
    document.getElementById(
      "cartTotal"
    );

  let total = 0;

  items.innerHTML = "";

  cart.forEach(item => {

    total +=
      item.price * item.qty;

    items.innerHTML += `
      <div class="cart-item">

        <span>
          ${item.name}
          x ${item.qty}
        </span>

        <span>
          ฿${item.price * item.qty}
        </span>

      </div>
    `;

  });

  totalBox.textContent =
    `รวม ${total} บาท`;

  modal.style.display =
    "block";

}

function closeCart(){

  document.getElementById(
    "cartModal"
  ).style.display = "none";

}

loadProducts();
