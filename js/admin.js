const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";

var adminProducts = [];
var adminCollections = [];

const adminLoadedTabs = {

  dashboard:false,

  products:false,

  options:false,

  orders:false,

  shipped_orders:false,

  address:false,

  collections:false,

  gifts:false,

  manual_order:false,

  legacy_orders:false,

  customer_lookup:false

};

function login(){

  const password =
    document.getElementById(
      "adminPassword"
    ).value;


  if(
    password ===
    "Rin@Saeh13579"
  ){

    document
      .getElementById(
        "loginBox"
      )
      .style.display =
      "none";


    document
      .getElementById(
        "adminContent"
      )
      .style.display =
      "block";


    sessionStorage.setItem(
      "adminLoggedIn",
      "true"
    );


    showAdminTab(
      "dashboard"
    );


  }else{

    alert(
      "รหัสผ่านไม่ถูกต้อง"
    );

  }

}

function logout(){
  sessionStorage.removeItem("adminLoggedIn");
  location.reload();
}

if(
  sessionStorage.getItem(
    "adminLoggedIn"
  ) === "true"
){

  document
    .getElementById(
      "loginBox"
    )
    .style.display =
    "none";


  document
    .getElementById(
      "adminContent"
    )
    .style.display =
    "block";


  showAdminTab(
    "dashboard"
  );

}

function showAdminTab(
  tab
){

  const tabs = [

    "dashboard",

    "products",

    "options",

    "orders",

    "shipped_orders",

    "address",

    "collections",

    "gifts",

    "manual_order",

    "legacy_orders",

    "customer_lookup"

  ];


  tabs.forEach(
    name => {

      const section =
        document.getElementById(
          "tab_" +
          name
        );


      const navButton =
        document.getElementById(
          "nav_" +
          name
        );


      if(section){

        section.classList.toggle(
          "hidden",
          name !== tab
        );

      }


      if(navButton){

        navButton.classList.toggle(
          "active",
          name === tab
        );

      }

    }
  );


  loadAdminTabData(
    tab
  )
    .catch(
      error => {

        console.error(
          "เปิดแท็บไม่สำเร็จ:",
          tab,
          error
        );

      }
    );


  if(
  window.innerWidth <= 900
){

  closeAdminSidebar();

}

}

async function loadAdminTabData(
  tab
){

  /*
  ถ้าโหลดแล้ว
  ไม่โหลดซ้ำ
  */

  if(
    adminLoadedTabs[
      tab
    ]
  ){

    return;

  }


  try{

    /*
    =========================================
    DASHBOARD
    =========================================
    */

    if(
      tab ===
      "dashboard"
    ){

      await loadDashboardData();

      adminLoadedTabs.dashboard =
        true;

      return;

    }


   /*
=========================================
PRODUCTS
=========================================
*/

if(
  tab ===
  "products"
){

  /*
  Product Manager ใช้ Collections
  ทั้งหน้าเพิ่มสินค้า + filter
  */

  if(
    !Array.isArray(
      adminCollections
    ) ||
    adminCollections.length === 0
  ){

    await loadAdminCollections();

  }


  if(
    !Array.isArray(
      adminProducts
    ) ||
    adminProducts.length === 0
  ){

    await loadAdminProducts();

  }


  renderProductManager();


  adminLoadedTabs.products =
    true;


  return;

}
    /*
    =========================================
    COLLECTIONS
    =========================================
    */

   if(
  tab ===
  "collections"
){

  renderCollectionManager();


  await loadAdminCollections();


  adminLoadedTabs.collections =
    true;


  return;

}


    /*
    =========================================
    OPTIONS
    =========================================
    */

if(
  tab ===
  "options"
){

  /*
  Options ต้องใช้ข้อมูล
  Products + Collections
  แต่ไม่ถือว่าแท็บเหล่านั้นโหลดแล้ว
  */


  if(
    !Array.isArray(
      adminProducts
    ) ||
    adminProducts.length === 0
  ){

    await loadAdminProducts();

  }


  if(
    !Array.isArray(
      adminCollections
    ) ||
    adminCollections.length === 0
  ){

    await loadAdminCollections();

  }


  renderOptionManager();


  adminLoadedTabs.options =
    true;


  return;

}

    /*
    =========================================
    ORDERS
    =========================================
    */

    if(
      tab ===
      "orders"
    ){

      await loadOrders();


      adminLoadedTabs.orders =
        true;


      return;

    }


    /*
    =========================================
    SHIPPED ARCHIVE
    =========================================
    */

    if(
      tab ===
      "shipped_orders"
    ){

      /*
      Archive ใช้ข้อมูลจาก
      adminOrderBaseCache
      */

      if(
        !adminLoadedTabs.orders
      ){

        await loadOrders();


        adminLoadedTabs.orders =
          true;

      }


      if(
        typeof renderAdminShippedOrders !==
        "function"
      ){

        const box =
          document.getElementById(
            "shippedOrders"
          );


        if(box){

          box.innerHTML = `

<div
style="
padding:16px;
background:#fef2f2;
border:1px solid #fecaca;
border-radius:12px;
color:#991b1b;
"
>

ไม่สามารถเปิดหน้าออเดอร์ที่จัดส่งแล้วได้

<br><br>

ไม่พบฟังก์ชัน
<b>renderAdminShippedOrders()</b>

</div>

`;

        }


        throw new Error(
          "ไม่พบ renderAdminShippedOrders()"
        );

      }


      renderAdminShippedOrders();


      adminLoadedTabs.shipped_orders =
        true;


      return;

    }


    /*
    =========================================
    ADDRESS
    =========================================
    */

    if(
      tab ===
      "address"
    ){

      await loadAddressRequests();


      adminLoadedTabs.address =
        true;


      return;

    }


    /*
    =========================================
    GIFTS
    =========================================
    */

    if(
      tab ===
      "gifts"
    ){

      renderGiftManager();


      await loadGiftCampaigns();


      adminLoadedTabs.gifts =
        true;


      return;

    }


    /*
    =========================================
    MANUAL ORDER
    =========================================
    */

    if(
      tab ===
      "manual_order"
    ){

      const manager =
        document.getElementById(
          "manualOrderManager"
        );


      if(
        typeof renderManualOrderManager !==
        "function"
      ){

        if(manager){

          manager.innerHTML = `

<div
style="
padding:16px;
background:#fef2f2;
border:1px solid #fecaca;
border-radius:12px;
color:#991b1b;
"
>

ไม่สามารถเปิดหน้าสร้างออเดอร์ได้

<br><br>

ไม่พบฟังก์ชัน
<b>renderManualOrderManager()</b>

<br>

กรุณาตรวจไฟล์
<b>js/admin-manual-order.js</b>

</div>

`;

        }


        throw new Error(
          "ไม่พบ renderManualOrderManager()"
        );

      }


      renderManualOrderManager();


      adminLoadedTabs.manual_order =
        true;


      return;

    }

    /*
=========================================
LEGACY ORDERS
=========================================
*/

if(
  tab ===
  "legacy_orders"
){

  if(
    typeof renderLegacyOrderManager !==
    "function"
  ){

    throw new Error(
      "ไม่พบ renderLegacyOrderManager()"
    );

  }


  renderLegacyOrderManager();


  if(
    typeof loadLegacyUnlinkedOrders ===
    "function"
  ){

    await loadLegacyUnlinkedOrders();

  }


  adminLoadedTabs.legacy_orders =
    true;


  return;

}

/*
=========================================
CUSTOMER ORDER LOOKUP
=========================================
*/

if(
  tab ===
  "customer_lookup"
){

  if(
    typeof renderAdminCustomerOrderLookup !==
    "function"
  ){

    throw new Error(
      "ไม่พบ renderAdminCustomerOrderLookup()"
    );

  }


  renderAdminCustomerOrderLookup();


  adminLoadedTabs.customer_lookup =
    true;


  return;

}


  }catch(error){

    console.error(
      "loadAdminTabData error:",
      tab,
      error
    );


    /*
    ถ้า error
    อย่า mark loaded
    เพื่อให้กดใหม่แล้ว retry ได้
    */

    throw error;

  }

}

async function loadAdminData(){

  try{

    await loadAdminTabData(
      "dashboard"
    );

  }catch(error){

    console.error(
      "loadAdminData error:",
      error
    );

  }

}

async function reloadAdminTab(
  tab
){

  /*
  Archive พึ่ง Orders cache
  ดังนั้น refresh Archive
  ต้อง reload Orders จริงด้วย
  */

  if(
    tab ===
    "shipped_orders"
  ){

    adminLoadedTabs.orders =
      false;


    adminLoadedTabs.shipped_orders =
      false;


    await loadOrders();


    adminLoadedTabs.orders =
      true;


    if(
      typeof renderAdminShippedOrders ===
      "function"
    ){

      renderAdminShippedOrders();

    }


    adminLoadedTabs.shipped_orders =
      true;


    return;

  }


  adminLoadedTabs[
    tab
  ] =
    false;


  await loadAdminTabData(
    tab
  );

}

function toggleAdminSidebar(){

  const sidebar =
    document.getElementById(
      "adminSidebar"
    );

  const overlay =
    document.getElementById(
      "adminSidebarOverlay"
    );


  sidebar?.classList.toggle(
    "open"
  );


  overlay?.classList.toggle(
    "show"
  );

}


function closeAdminSidebar(){

  document
    .getElementById(
      "adminSidebar"
    )
    ?.classList.remove(
      "open"
    );


  document
    .getElementById(
      "adminSidebarOverlay"
    )
    ?.classList.remove(
      "show"
    );

}
