(function(){
  "use strict";

  const KEY = "rinka_theme_mode";
  const MODES = ["system","light","dark"];

  function readMode(){
    try{
      const value = localStorage.getItem(KEY);
      return MODES.includes(value) ? value : "system";
    }catch(_){
      return "system";
    }
  }

  function resolve(mode){
    if(mode === "dark" || mode === "light") return mode;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  }

  function apply(mode){
    const safeMode = MODES.includes(mode) ? mode : "system";
    const resolved = resolve(safeMode);
    document.documentElement.dataset.themeMode = safeMode;
    document.documentElement.dataset.theme = resolved;
    updateButton(safeMode,resolved);
  }

  function save(mode){
    try{ localStorage.setItem(KEY,mode); }catch(_){}
    apply(mode);
  }

  function meta(mode,resolved){
    if(mode === "system") return {icon:"◐",label:"ระบบ",title:"ธีม: ตามระบบ"};
    if(resolved === "dark") return {icon:"☾",label:"มืด",title:"ธีม: มืด"};
    return {icon:"☀",label:"สว่าง",title:"ธีม: สว่าง"};
  }

  function updateButton(mode,resolved){
    const button = document.getElementById("rinkaThemeButton");
    if(!button) return;
    const m = meta(mode,resolved);
    button.innerHTML =
      '<span aria-hidden="true">'+m.icon+'</span>'+
      '<span class="rk-theme-label">'+m.label+'</span>';
    button.setAttribute("aria-label",m.title+" — กดเพื่อเปลี่ยน");
    button.title = m.title+" — กดเพื่อเปลี่ยน";
  }

  function nextMode(){
    const current = readMode();
    const index = MODES.indexOf(current);
    save(MODES[(index + 1) % MODES.length]);
  }

  function mount(){
    if(document.getElementById("rinkaThemeButton")) return;
    const wrap = document.createElement("div");
    wrap.className = "rk-theme-control";
    wrap.innerHTML =
      '<button id="rinkaThemeButton" class="rk-theme-button" type="button"></button>';
    document.body.appendChild(wrap);
    document.getElementById("rinkaThemeButton").addEventListener("click",nextMode);
    apply(readMode());
  }

  const media = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  if(media){
    const onChange = function(){
      if(readMode() === "system") apply("system");
    };
    if(media.addEventListener) media.addEventListener("change",onChange);
    else if(media.addListener) media.addListener(onChange);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",mount,{once:true});
  }else{
    mount();
  }

  window.RinkaTheme = {apply,save,readMode};
})();
