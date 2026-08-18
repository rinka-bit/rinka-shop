/*
=========================================
RINKA UI
=========================================
*/

(function(){

  let toastTimer = null;


  function ensureToast(){

    let toast =
      document.getElementById(
        "rinkaGlobalToast"
      );


    if(toast){

      return toast;

    }


    toast =
      document.createElement(
        "div"
      );


    toast.id =
      "rinkaGlobalToast";


    toast.className =
      "rinka-toast";


    toast.setAttribute(
      "role",
      "status"
    );


    toast.setAttribute(
      "aria-live",
      "polite"
    );


    document.body.appendChild(
      toast
    );


    return toast;

  }


  window.showRinkaToast =
    function(
      message,
      type = ""
    ){

      const toast =
        ensureToast();


      toast.textContent =
        String(
          message || ""
        );


      toast.classList.remove(
        "error",
        "success"
      );


      if(
        type === "error"
      ){

        toast.classList.add(
          "error"
        );

      }


      if(
        type === "success"
      ){

        toast.classList.add(
          "success"
        );

      }


      toast.classList.add(
        "show"
      );


      clearTimeout(
        toastTimer
      );


      toastTimer =
        setTimeout(
          ()=>{

            toast.classList.remove(
              "show"
            );

          },
          2300
        );

    };


  window.rinkaLoadingHtml =
    function(
      text =
        "กำลังโหลด..."
    ){

      return `

<div class="rinka-loading">

  <div class="rinka-spinner"></div>

  <div>
    ${escapeRinkaUiHtml(
      text
    )}
  </div>

</div>

`;

    };


  window.rinkaStateHtml =
    function({
      icon = "☁️",
      title = "",
      text = ""
    } = {}){

      return `

<div class="rinka-state">

  <div class="rinka-state-icon">
    ${escapeRinkaUiHtml(icon)}
  </div>

  <div class="rinka-state-title">
    ${escapeRinkaUiHtml(title)}
  </div>

  ${
    text
      ? `

<div class="rinka-state-text">
  ${escapeRinkaUiHtml(text)}
</div>

`
      : ""
  }

</div>

`;

    };


  function escapeRinkaUiHtml(
    value
  ){

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


})();
