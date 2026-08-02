/**
 * Rinka Shop - Toast Notification
 */
(function(){
  if(!document.getElementById("rk-toast-style")){
    const style=document.createElement("style");
    style.id="rk-toast-style";
    style.textContent=`
      #rk-toast-container{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:10px;width:calc(100% - 32px);max-width:380px;pointer-events:none}
      .rk-toast{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:14px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.15);font-family:'Kodchasan',sans-serif;font-size:14px;font-weight:600;color:#334155;border-left:5px solid #7dcfff;opacity:0;transform:translateY(12px);transition:.25s;pointer-events:auto}
      .rk-toast.rk-show{opacity:1;transform:translateY(0)}.rk-toast.rk-hide{opacity:0;transform:translateY(-8px)}
      .rk-toast-icon{font-size:18px;flex-shrink:0}.rk-toast-msg{flex:1;line-height:1.4;word-break:break-word}.rk-toast-close{background:none;border:none;font-size:16px;color:#94a3b8;cursor:pointer;padding:0}
      .rk-toast-success{border-left-color:#22c55e}.rk-toast-error{border-left-color:#ef4444}.rk-toast-warning{border-left-color:#f59e0b}.rk-toast-info{border-left-color:#7dcfff}
      @media(max-width:480px){#rk-toast-container{bottom:16px;width:calc(100% - 24px)}}
    `;
    document.head.appendChild(style);
  }

  const icons={success:"✅",error:"❌",warning:"⚠️",info:"ℹ️"};

  function container(){
    let box=document.getElementById("rk-toast-container");
    if(!box){
      box=document.createElement("div");
      box.id="rk-toast-container";
      document.body.appendChild(box);
    }
    return box;
  }

  window.showToast=function(message,type="info",duration=3200){
    const toast=document.createElement("div");
    toast.className=`rk-toast rk-toast-${type}`;
    toast.innerHTML=`<span class="rk-toast-icon">${icons[type]||icons.info}</span><span class="rk-toast-msg"></span><button class="rk-toast-close" aria-label="ปิด">✕</button>`;
    toast.querySelector(".rk-toast-msg").textContent=String(message||"");
    container().appendChild(toast);
    requestAnimationFrame(()=>toast.classList.add("rk-show"));

    let removed=false;
    function remove(){
      if(removed)return;
      removed=true;
      toast.classList.remove("rk-show");
      toast.classList.add("rk-hide");
      setTimeout(()=>toast.remove(),250);
    }

    toast.querySelector(".rk-toast-close").addEventListener("click",remove);
    if(duration>0)setTimeout(remove,duration);
  };
})();
