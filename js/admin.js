const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";

var adminProducts = [];
var adminCollections = [];

function login(){

  const password =
    document.getElementById("adminPassword").value;

  if(password === "Rin@Saeh13579"){

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminContent").style.display = "block";

    sessionStorage.setItem("adminLoggedIn","true");

    loadAdminData();

  }else{
    alert("รหัสผ่านไม่ถูกต้อง");
  }

}

function logout(){
  sessionStorage.removeItem("adminLoggedIn");
  location.reload();
}

if(sessionStorage.getItem("adminLoggedIn") === "true"){
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("adminContent").style.display = "block";
  loadAdminData();
}

function showAdminTab(
  tab
){

  const tabs = [

    "dashboard",

    "products",

    "options",

    "orders",

    "address",

    "collections",

    "gifts",

    "manual_order"

  ];


  tabs.forEach(
    name=>{

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


  if(
    tab === "gifts"
  ){

    renderGiftManager();

    loadGiftCampaigns();

  }

if(
  tab === "manual_order"
){

  const manager =
    document.getElementById(
      "manualOrderManager"
    );


  if(
    typeof renderManualOrderManager ===
    "function"
  ){

    renderManualOrderManager();

  }else{

    console.error(
      "โหลด admin-manual-order.js ไม่สำเร็จ หรือไฟล์มี Syntax Error"
    );


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

  }

}

}

async function loadAdminData(){

  try{

    loadStats();

    loadTopProducts();

    loadTopFandoms();

    loadOrders();

    loadAddressRequests();


    /*
    สร้างหน้าต่าง Manager ก่อนโหลดข้อมูล
    */

    renderProductManager();

    renderOptionManager();

    renderCollectionManager();


    /*
    แล้วค่อยโหลดข้อมูล
    */

    await loadAdminProducts();

    await loadAdminCollections();


    /*
    Manual Order ยังไม่ต้อง render ตอนเปิด Admin
    จะ render เมื่อกดแท็บเท่านั้น
    */

  }catch(error){

    console.error(
      "loadAdminData error:",
      error
    );

  }

}
