/*
=========================================
RINKA SHOP
CART DRAWER
=========================================
*/


(function(){


  /*
  =========================================
  INIT
  =========================================
  */

  document.addEventListener(
    "DOMContentLoaded",
    function(){

      createCartDrawer();

      refreshCartDrawer();

    }
  );


  /*
  =========================================
  CREATE
  =========================================
  */

  function createCartDrawer(){

    if(
      document.getElementById(
        "cartDrawer"
      )
    ){

      return;

    }


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "cartDrawerOverlay";


    overlay.className =
      "cart-drawer-overlay";


    overlay.addEventListener(
      "click",
      closeCartDrawer
    );


    const drawer =
      document.createElement(
        "aside"
      );


    drawer.id =
      "cartDrawer";


    drawer.className =
      "cart-drawer";


    drawer.setAttribute(
      "aria-label",
      "ตะกร้าสินค้า"
    );


    drawer.innerHTML = `

<div class="cart-drawer-header">

  <h2 class="cart-drawer-title">

    <span>
      🛒 ตะกร้าสินค้า
    </span>

    <span
    id="cartDrawerCount"
    class="cart-drawer-title-count">
      0
    </span>

  </h2>


  <button
  type="button"
  class="cart-drawer-close"
  aria-label="ปิดตะกร้า"
  onclick="closeCartDrawer()">
    ✕
  </button>

</div>


<div
id="cartDrawerBody"
class="cart-drawer-body">
</div>


<div
id="cartDrawerFooter"
class="cart-drawer-footer">
</div>

`;


    document.body.appendChild(
      overlay
    );


    document.body.appendChild(
      drawer
    );


    document.addEventListener(
      "keydown",
      function(event){

        if(
          event.key ===
          "Escape"
        ){

          closeCartDrawer();

        }

      }
    );

  }


  /*
  =========================================
  OPEN / CLOSE
  =========================================
  */

  window.openCartDrawer =
    function(){

      createCartDrawer();

      refreshCartDrawer();


      document
        .getElementById(
          "cartDrawer"
        )
        ?.classList.add(
          "open"
        );


      document
        .getElementById(
          "cartDrawerOverlay"
        )
        ?.classList.add(
          "show"
        );


      document.body.style.overflow =
        "hidden";

    };


  window.closeCartDrawer =
    function(){

      document
        .getElementById(
          "cartDrawer"
        )
        ?.classList.remove(
          "open"
        );


      document
        .getElementById(
          "cartDrawerOverlay"
        )
        ?.classList.remove(
          "show"
        );


      document.body.style.overflow =
        "";

    };


  /*
  =========================================
  STORAGE
  =========================================
  */

  function getCartDrawerItems(){

    try{

      const data =
        JSON.parse(
          localStorage.getItem(
            "cart"
          ) || "[]"
        );


      return Array.isArray(
        data
      )
        ? data
        : [];

    }catch(error){

      console.warn(
        "Cart Drawer อ่าน cart ไม่สำเร็จ:",
        error
      );


      return [];

    }

  }


  function saveCartDrawerItems(
    cart
  ){

    localStorage.setItem(
      "cart",
      JSON.stringify(
        Array.isArray(cart)
          ? cart
          : []
      )
    );


    refreshCartDrawer();


    /*
    แจ้งหน้าอื่นว่าตะกร้าเปลี่ยน
    */

    window.dispatchEvent(
      new CustomEvent(
        "rinka-cart-updated"
      )
    );

  }


  /*
  =========================================
  PRICE
  =========================================
  */

  function getCartDrawerPrice(
    item
  ){

    const price =
      Number(
        item?.final_price ??
        item?.price ??
        0
      );


    return Number.isFinite(
      price
    )
      ? Math.max(
          0,
          price
        )
      : 0;

  }


  /*
  =========================================
  RENDER
  =========================================
  */

  window.refreshCartDrawer =
    function(){

      const body =
        document.getElementById(
          "cartDrawerBody"
        );


      const footer =
        document.getElementById(
          "cartDrawerFooter"
        );


      const countBox =
        document.getElementById(
          "cartDrawerCount"
        );


      if(
        !body ||
        !footer
      ){

        return;

      }


      const cart =
        getCartDrawerItems();


      const totalQty =
        cart.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.qty || 0
            ),
          0
        );


      if(countBox){

        countBox.textContent =
          totalQty > 99
            ? "99+"
            : String(
                totalQty
              );

      }


      /*
      EMPTY
      */

      if(
        cart.length === 0
      ){

        body.innerHTML = `

<div class="cart-drawer-empty">

  <div class="cart-drawer-empty-icon">
    🛒
  </div>

  <div class="cart-drawer-empty-title">
    ยังไม่มีสินค้าในตะกร้า
  </div>

  <div class="cart-drawer-empty-text">
    เลือกสินค้าที่ต้องการแล้วกลับมาเปิดตะกร้าได้เลยค่ะ
  </div>

</div>

`;


        footer.innerHTML = `

<a
href="browse.html"
class="cart-drawer-checkout"
style="
display:flex;
align-items:center;
justify-content:center;
text-decoration:none;
"
>
  เลือกซื้อสินค้า
</a>

`;


        updateExternalCartCounts(
          totalQty
        );


        return;

      }


      /*
      ITEMS
      */

      body.innerHTML =
        cart
          .map(
            (
              item,
              index
            ) =>
              createCartDrawerItem(
                item,
                index
              )
          )
          .join("");


      const subtotal =
        cart.reduce(
          (
            sum,
            item
          ) => {

            const qty =
              Math.max(
                0,
                Number(
                  item.qty || 0
                )
              );


            return (
              sum +
              (
                getCartDrawerPrice(
                  item
                ) *
                qty
              )
            );

          },
          0
        );


      footer.innerHTML = `

<div class="cart-drawer-summary">

  <span class="cart-drawer-summary-label">
    ยอดรวม
  </span>

  <strong class="cart-drawer-summary-total">
    ฿${subtotal.toLocaleString(
      "th-TH"
    )}
  </strong>

</div>


<button
type="button"
class="cart-drawer-checkout"
onclick="cartDrawerCheckout()">
  ไป Checkout
</button>


<a
href="cart.html"
class="cart-drawer-full-link">
  ดูตะกร้าแบบเต็มหน้า
</a>

`;


      updateExternalCartCounts(
        totalQty
      );

    };


  /*
  =========================================
  ITEM HTML
  =========================================
  */

  function createCartDrawerItem(
    item,
    index
  ){

    const qty =
      Math.max(
        1,
        Number(
          item.qty || 1
        )
      );


    const price =
      getCartDrawerPrice(
        item
      );


    const total =
      price *
      qty;


    const options =
      item.selected_options &&
      typeof item.selected_options ===
        "object"
        ? item.selected_options
        : {};


    const optionHtml =
      Object
        .entries(
          options
        )
        .map(
          (
            [
              key,
              value
            ]
          ) => {

            const text =
              Array.isArray(
                value
              )
                ? value.join(
                    ", "
                  )
                : String(
                    value || ""
                  );


            return `

<span class="cart-drawer-option">
  ${escapeCartDrawerHtml(key)}:
  ${escapeCartDrawerHtml(text)}
</span>

`;

          }
        )
        .join("");


    const image =
      String(
        item.option_image ||
        item.image ||
        ""
      );


    return `

<div class="cart-drawer-item">

  ${
    image
      ? `

<img
class="cart-drawer-image"
src="${escapeCartDrawerHtml(
  image
)}"
alt="${escapeCartDrawerHtml(
  item.name ||
  item.product_name ||
  ""
)}"
loading="lazy"
>

`
      : `

<div class="cart-drawer-image-placeholder">
  ไม่มีรูป
</div>

`
  }


  <div class="cart-drawer-item-main">

    <h3 class="cart-drawer-item-name">

      ${escapeCartDrawerHtml(
        item.name ||
        item.product_name ||
        "สินค้า"
      )}

    </h3>


    ${
      optionHtml
        ? `

<div class="cart-drawer-options">
  ${optionHtml}
</div>

`
        : ""
    }


    <div class="cart-drawer-price">

      ฿${price.toLocaleString(
        "th-TH"
      )}
      ×
      ${qty.toLocaleString(
        "th-TH"
      )}

    </div>


    <div class="cart-drawer-actions">

      <div class="cart-drawer-qty">

        <button
        type="button"
        onclick="changeCartDrawerQty(
          ${index},
          -1
        )">
          −
        </button>


        <span>
          ${qty}
        </span>


        <button
        type="button"
        onclick="changeCartDrawerQty(
          ${index},
          1
        )">
          +
        </button>

      </div>


      <div class="cart-drawer-line-total">

        ฿${total.toLocaleString(
          "th-TH"
        )}

      </div>

    </div>


    <button
    type="button"
    class="cart-drawer-remove"
    onclick="removeCartDrawerItem(
      ${index}
    )">
      ลบสินค้า
    </button>

  </div>

</div>

`;

  }


  /*
  =========================================
  QTY
  =========================================
  */

  window.changeCartDrawerQty =
    function(
      index,
      change
    ){

      const cart =
        getCartDrawerItems();


      const item =
        cart[
          Number(index)
        ];


      if(!item){

        return;

      }


      const nextQty =
        Number(
          item.qty || 1
        ) +
        Number(
          change || 0
        );


      if(
        nextQty <= 0
      ){

        cart.splice(
          Number(index),
          1
        );

      }else{

        item.qty =
          nextQty;

      }


      saveCartDrawerItems(
        cart
      );

    };


  /*
  =========================================
  REMOVE
  =========================================
  */

  window.removeCartDrawerItem =
    function(
      index
    ){

      const cart =
        getCartDrawerItems();


      if(
        !cart[
          Number(index)
        ]
      ){

        return;

      }


      cart.splice(
        Number(index),
        1
      );


      saveCartDrawerItems(
        cart
      );

    };


  /*
  =========================================
  CHECKOUT
  =========================================
  */

  window.cartDrawerCheckout =
    function(){

      const cart =
        getCartDrawerItems();


      if(
        !cart.length
      ){

        return;

      }


      /*
      Cart Drawer =
      checkout ทั้ง cart

      หน้า cart.html
      ยังใช้สำหรับเลือกบางรายการได้
      */

      localStorage.setItem(
        "checkoutCart",
        JSON.stringify(
          cart
        )
      );


      localStorage.setItem(
        "checkoutSource",
        "cart"
      );


      localStorage.removeItem(
        "buyNowCart"
      );


      window.location.href =
        "checkout.html";

    };


  /*
  =========================================
  EXTERNAL CART COUNTS
  =========================================
  */

  function updateExternalCartCounts(
    count
  ){

    const ids = [

      "cartCount",

      "floatingCartCount",

      "checkoutCartCount"

    ];


    ids.forEach(
      id => {

        const box =
          document.getElementById(
            id
          );


        if(box){

          box.textContent =
            count > 99
              ? "99+"
              : String(
                  count
                );

        }

      }
    );

  }


  /*
  =========================================
  ESCAPE
  =========================================
  */

  function escapeCartDrawerHtml(
    value
  ){

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  /*
  =========================================
  LISTEN FOR CART UPDATES
  =========================================
  */

  window.addEventListener(
    "storage",
    function(event){

      if(
        event.key ===
        "cart"
      ){

        refreshCartDrawer();

      }

    }
  );


  window.addEventListener(
    "rinka-cart-updated",
    function(){

      refreshCartDrawer();

    }
  );


})();
