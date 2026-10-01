/* =========================================================
   RINKA ADMIN API SESSION
   - GET: admin_token is added to the query string.
   - POST FormData / JSON: admin_token is added to the body.
   - Falls back to query string for unknown body types.
========================================================= */

const RINKA_ADMIN_TOKEN_KEY = "rinka_admin_session_token";

function getAdminSessionToken(){
  return String(
    sessionStorage.getItem(RINKA_ADMIN_TOKEN_KEY) || ""
  ).trim();
}

function setAdminSessionToken(token){
  const value = String(token || "").trim();
  if(value){
    sessionStorage.setItem(RINKA_ADMIN_TOKEN_KEY, value);
  }else{
    sessionStorage.removeItem(RINKA_ADMIN_TOKEN_KEY);
  }
}

function clearAdminSession(){
  sessionStorage.removeItem(RINKA_ADMIN_TOKEN_KEY);
  sessionStorage.removeItem("adminLoggedIn");
}

function isRinkaAppsScriptRequest(input){
  const url = typeof input === "string"
    ? input
    : (input && input.url ? String(input.url) : "");

  return url.indexOf("https://script.google.com/macros/s/") === 0;
}

(function installRinkaAdminFetchAuth(){
  if(window.__rinkaAdminFetchAuthInstalled){
    return;
  }

  window.__rinkaAdminFetchAuthInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = function(input, init){
    const token = getAdminSessionToken();

    if(!token || !isRinkaAppsScriptRequest(input)){
      return nativeFetch(input, init);
    }

    let requestInput = input;
    const requestInit = init ? {...init} : {};
    const method = String(requestInit.method || "GET").toUpperCase();

    if(method === "GET" || method === "HEAD"){
      const originalUrl = typeof input === "string" ? input : input.url;
      const url = new URL(originalUrl, window.location.href);
      url.searchParams.set("admin_token", token);
      requestInput = url.toString();
      return nativeFetch(requestInput, requestInit);
    }

    const body = requestInit.body;

    if(body instanceof FormData){
      if(!body.has("admin_token")){
        body.append("admin_token", token);
      }
      return nativeFetch(requestInput, requestInit);
    }

    if(body instanceof URLSearchParams){
      if(!body.has("admin_token")){
        body.set("admin_token", token);
      }
      return nativeFetch(requestInput, requestInit);
    }

    if(typeof body === "string"){
      try{
        const parsed = JSON.parse(body);
        if(parsed && typeof parsed === "object"){
          if(parsed.data && typeof parsed.data === "object"){
            parsed.data.admin_token = token;
          }else{
            parsed.admin_token = token;
          }
          requestInit.body = JSON.stringify(parsed);
          return nativeFetch(requestInput, requestInit);
        }
      }catch(_error){
        // Unknown text body: use query-string fallback below.
      }
    }

    const originalUrl = typeof input === "string" ? input : input.url;
    const url = new URL(originalUrl, window.location.href);
    url.searchParams.set("admin_token", token);
    requestInput = url.toString();

    return nativeFetch(requestInput, requestInit);
  };
})();

function escapeHtml(value){

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

function escapeJsString(
  value
){

  return String(
    value ?? ""
  )
    .replaceAll(
      "\\",
      "\\\\"
    )
    .replaceAll(
      "'",
      "\\'"
    )
    .replaceAll(
      "\n",
      "\\n"
    )
    .replaceAll(
      "\r",
      ""
    )
    .replaceAll(
      "\u2028",
      "\\u2028"
    )
    .replaceAll(
      "\u2029",
      "\\u2029"
    );

}

function fileToBase64(file){

  return new Promise((resolve,reject)=>{

    const reader =
      new FileReader();

    reader.onload =
      () => resolve(reader.result);

    reader.onerror =
      reject;

    reader.readAsDataURL(file);

  });

}

function formatDateInput(value){

  if(!value){
    return "";
  }

  const date =
    new Date(value);

  if(isNaN(date.getTime())){
    return "";
  }

  return date
    .toISOString()
    .split("T")[0];

}

function isCheckedValue(value){

  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "1"
  );

}
