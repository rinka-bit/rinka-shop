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
