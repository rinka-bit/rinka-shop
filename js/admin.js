const API =
"https://script.google.com/macros/s/AKfycbxKjVvn8AXrK0wDvKqN-A9yS2Vk8R-w25ar1b9ftiIdUgUvFaShunLnFnAyIDuaTWj76w/exec";


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

function showAdminTab(tab){

const tabs = [
  "dashboard",
  "products",
  "options",
  "orders",
  "address",
  "collections",
  "gifts"
];
  
  tabs.forEach(name=>{

    document
      .getElementById("tab_" + name)
      .classList.toggle(
        "hidden",
        name !== tab
      );

    document
      .getElementById("nav_" + name)
      .classList.toggle(
        "active",
        name === tab
      );

  });

 if(tab === "gifts"){

  renderGiftManager();

  loadGiftCampaigns();

}

}

async function loadAdminData(){

  loadStats();

  loadTopProducts();

  loadTopFandoms();

  loadOrders();

  loadAddressRequests();

  renderCollectionManager();

  await loadAdminCollections();

  renderProductManager();

  renderOptionManager();

  await loadAdminProducts();

}
