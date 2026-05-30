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

            <button onclick="addToCartByIndex(${index})">
              เพิ่มลงตะกร้า
            </button>

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

    total += Number(item.price) * item.qty;

    items.innerHTML += `
      <div class="cart-item">

        <span>
          ${item.name} x ${item.qty}
        </span>

        <span>
          ฿${Number(item.price) * item.qty}
        </span>

      </div>
    `;

  });

  totalBox.textContent =
    `รวม ${total} บาท`;

  modal.style.display = "block";

}

function closeCart() {

  document.getElementById(
    "cartModal"
  ).style.display = "none";

}

updateCartCount();
loadProducts();
