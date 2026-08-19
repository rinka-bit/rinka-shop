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

const adminLoadingTabs = {};

async function adminGetJson(
  url,
  options = {}
){

  const retries =
    Number(
      options.retries ?? 2
    );


  const retryDelay =
    Number(
      options.retryDelay ?? 500
    );


  let lastError =
    null;


  for(
    let attempt = 0;
    attempt <= retries;
    attempt++
  ){

    try{

      const response =
        await fetch(
          url,
          {
            cache:"no-store"
          }
        );


      if(!response.ok){

        throw new Error(
          "HTTP " +
          response.status
        );

      }


      return await response.json();


    }catch(error){

      lastError =
        error;


      console.warn(
        "adminGetJson retry",
        {
          attempt:
            attempt + 1,

          url:
            url,

          error:
            error.message ||
            String(error)
        }
      );


      if(
        attempt >= retries
      ){

        break;

      }


      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            retryDelay *
            (
              attempt + 1
            )
          )
      );

    }

  }


  throw lastError ||
    new Error(
      "โหลดข้อมูลไม่สำเร็จ"
    );

}

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


  /*
  =========================================
  SWITCH TAB UI
  =========================================
  */

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


  /*
  =========================================
  LOAD TAB DATA

  ถ้าแท็บนี้กำลังโหลดอยู่
  ห้ามยิง request ชุดใหม่ซ้ำ
  =========================================
  */

  if(
    !adminLoadingTabs[
      tab
    ]
  ){

    adminLoadingTabs[
      tab
    ] =
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
        )
        .finally(
          ()=>{

            delete adminLoadingTabs[
              tab
            ];

          }
        );

  }


  /*
  =========================================
  MOBILE SIDEBAR
  =========================================
  */

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
  =========================================
  ALREADY LOADED
  =========================================
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
      เก็บ filter เดิมไว้
      เผื่อ render Product Manager ใหม่
      */

      const savedFilterState =
        typeof getAdminProductFilterState ===
          "function"
          ? getAdminProductFilterState()
          : null;


      /*
      แสดงหน้า Product Manager ก่อน
      โดยไม่ต้องรอ API
      */

      renderProductManager();


      /*
      =========================================
      COLLECTIONS

      โหลดก่อน Products
      เพราะหน้าเพิ่มสินค้า + filter ต้องใช้
      =========================================
      */

      if(
        !Array.isArray(
          adminCollections
        ) ||
        adminCollections.length === 0
      ){

        await loadAdminCollections();

      }


      /*
      Collection โหลดแล้ว
      render ใหม่เพื่อเติม dropdown
      */

      renderProductManager();


      if(
        typeof restoreAdminProductFilterState ===
          "function"
      ){

        restoreAdminProductFilterState(
          savedFilterState
        );

      }


      /*
      =========================================
      PRODUCTS
      =========================================
      */

      if(
        !Array.isArray(
          adminProducts
        ) ||
        adminProducts.length === 0
      ){

        await loadAdminProducts();

      }


      /*
      render รายการ
      */

      renderAdminProductList();


      /*
      sync Product dropdown
      ของ Option Manager ถ้ามี
      */

      if(
        typeof refreshOptionProductSelect ===
          "function"
      ){

        refreshOptionProductSelect();

      }


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
      Option Manager ใช้ Products
      */

      if(
        !Array.isArray(
          adminProducts
        ) ||
        adminProducts.length === 0
      ){

        await loadAdminProducts();

      }


      /*
      และ Collections
      */

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
    SHIPPED ORDERS
    =========================================
    */

    if(
      tab ===
      "shipped_orders"
    ){

      /*
      Archive ใช้ cache จาก Orders
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
    CUSTOMER LOOKUP
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
    ถ้าโหลดพัง
    ห้าม mark ว่า loaded
    จะได้กดใหม่แล้ว retry ได้
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
