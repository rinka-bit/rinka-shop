const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec?action=products";

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

          <button>
            ดูสินค้า
          </button>

        </div>

      </div>
    `;

  });

}

loadProducts();
