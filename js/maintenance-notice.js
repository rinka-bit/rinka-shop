(function(){

  /*
  =========================================
  RINKA SHOP — MAINTENANCE NOTICE
  =========================================
  */

  const NOTICE_KEY =
    "rinka_maintenance_notice_20260816";


  function showMaintenanceNotice(){

    /*
    กันสร้างซ้ำ
    */

    if(
      document.getElementById(
        "rinkaMaintenanceNotice"
      )
    ){

      return;

    }


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "rinkaMaintenanceNotice";


    overlay.innerHTML = `

<div class="rinka-maintenance-card">

  <button
  type="button"
  class="rinka-maintenance-close"
  aria-label="ปิด"
  >
    ×
  </button>


  <div class="rinka-maintenance-icon">
    🛠️
  </div>


  <h2>
    Rinka Shop กำลังปรับปรุงเว็บไซต์
  </h2>


  <p>
    ขณะนี้เว็บไซต์อยู่ระหว่างการปรับปรุงระบบ
  </p>


  <p>
    หากต้องการสั่งซื้อสินค้า
    สามารถติดต่อร้านผ่าน
    <b>DM ทาง X (Twitter)</b>
    ได้ตามปกติค่ะ 💙
  </p>


  <a
  class="rinka-maintenance-dm"
  href="https://x.com/prewithrinka"
  target="_blank"
  rel="noopener noreferrer"
  >
    💬 สั่งซื้อผ่าน DM
  </a>


  <button
  type="button"
  class="rinka-maintenance-continue"
  >
    เข้าชมเว็บไซต์ต่อ
  </button>


  <div class="rinka-maintenance-note">
    สามารถเข้าชมสินค้าและรายละเอียดต่าง ๆ
    ภายในเว็บไซต์ได้ตามปกติ
  </div>

</div>

`;


    /*
    =========================================
    STYLE
    =========================================
    */

    const style =
      document.createElement(
        "style"
      );


    style.textContent = `

#rinkaMaintenanceNotice{

  position:fixed;

  inset:0;

  z-index:999999;

  display:flex;

  align-items:center;

  justify-content:center;

  padding:20px;

  background:
    rgba(42,67,86,.48);

  backdrop-filter:
    blur(7px);

  -webkit-backdrop-filter:
    blur(7px);

}


.rinka-maintenance-card{

  position:relative;

  width:min(
    440px,
    100%
  );

  padding:
    30px 24px 24px;

  background:#ffffff;

  border:
    1px solid #dcecf5;

  border-radius:24px;

  box-shadow:
    0 22px 60px
    rgba(44,88,118,.20);

  text-align:center;

  color:#334155;

  font-family:
    'Kodchasan',
    sans-serif;

}


.rinka-maintenance-icon{

  display:flex;

  align-items:center;

  justify-content:center;

  width:68px;

  height:68px;

  margin:
    0 auto 15px;

  border-radius:50%;

  background:#eaf7ff;

  font-size:32px;

}


.rinka-maintenance-card h2{

  margin:
    0 0 13px;

  color:#3f6078;

  font-size:21px;

  line-height:1.45;

}


.rinka-maintenance-card p{

  margin:
    8px 0;

  color:#64748b;

  font-size:14px;

  line-height:1.8;

}


.rinka-maintenance-close{

  position:absolute;

  top:12px;

  right:12px;

  width:38px;

  height:38px;

  padding:0;

  border:none;

  border-radius:50%;

  background:#f1f7fb;

  color:#64748b;

  font-size:25px;

  line-height:1;

  cursor:pointer;

}


.rinka-maintenance-dm{

  display:flex;

  align-items:center;

  justify-content:center;

  width:100%;

  min-height:48px;

  margin-top:19px;

  padding:
    10px 18px;

  border-radius:14px;

  background:#7dcfff;

  color:#ffffff;

  font-weight:700;

  text-decoration:none;

  transition:.18s;

}


.rinka-maintenance-dm:hover{

  transform:
    translateY(-1px);

  background:#60bdec;

}


.rinka-maintenance-continue{

  width:100%;

  min-height:46px;

  margin-top:10px;

  padding:
    9px 18px;

  border:
    1px solid #dce8ef;

  border-radius:14px;

  background:#ffffff;

  color:#597386;

  font-family:inherit;

  font-weight:700;

  cursor:pointer;

}


.rinka-maintenance-continue:hover{

  background:#f7fbfd;

}


.rinka-maintenance-note{

  margin-top:13px;

  color:#94a3b8;

  font-size:11px;

  line-height:1.6;

}


@media(
  max-width:480px
){

  .rinka-maintenance-card{

    padding:
      27px 18px 21px;

    border-radius:20px;

  }


  .rinka-maintenance-card h2{

    font-size:18px;

  }


  .rinka-maintenance-card p{

    font-size:13px;

  }

}

`;


    document.head.appendChild(
      style
    );


    document.body.appendChild(
      overlay
    );


    /*
    =========================================
    CLOSE
    =========================================
    */

    function closeNotice(){

      sessionStorage.setItem(
        NOTICE_KEY,
        "shown"
      );


      overlay.remove();

    }


    overlay
      .querySelector(
        ".rinka-maintenance-close"
      )
      .addEventListener(
        "click",
        closeNotice
      );


    overlay
      .querySelector(
        ".rinka-maintenance-continue"
      )
      .addEventListener(
        "click",
        closeNotice
      );


    /*
    กดพื้นที่ดำด้านนอกก็ปิดได้
    */

    overlay.addEventListener(
      "click",
      event => {

        if(
          event.target ===
          overlay
        ){

          closeNotice();

        }

      }
    );

  }


  /*
  =========================================
  START
  =========================================
  */

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      showMaintenanceNotice
    );

  }else{

    showMaintenanceNotice();

  }

})();
