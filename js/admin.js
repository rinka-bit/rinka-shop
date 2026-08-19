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
