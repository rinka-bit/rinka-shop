document.addEventListener(
"DOMContentLoaded",
()=>{

const menuButton =
document.getElementById(
"menuButton"
);

const sideMenu =
document.getElementById(
"sideMenu"
);

const overlay =
document.getElementById(
"overlay"
);

if(
!menuButton ||
!sideMenu ||
!overlay
){
return;
}

menuButton.addEventListener(
"click",
()=>{

sideMenu.classList.add(
"open"
);

overlay.classList.remove(
"hidden"
);

}
);

overlay.addEventListener(
"click",
closeMenu
);

function closeMenu(){

sideMenu.classList.remove(
"open"
);

overlay.classList.add(
"hidden"
);

}

});
