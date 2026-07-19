async function loadAddressRequests(){

  const response =
    await fetch(API + "?action=addressChanges");

  const result =
    await response.json();

  let html = "";

 const requests =
  Array.isArray(result.requests)
    ? [...result.requests].reverse()
    : [];

    if(req.status === "completed"){
      return;
    }

    html += `
      <div class="warning-card">

        <h3>${req.request_id}</h3>

        <p>Order: ${req.order_id}</p>
        <p>ชื่อ: ${req.customer_name}</p>
        <p>โทร: ${req.phone}</p>
        <p>Social: ${req.social}</p>
        <p>ที่อยู่ใหม่: ${req.address}</p>

        <p>
        สถานะ: ${req.status}
        <br><br>

        <button onclick="completeAddressRequest('${req.request_id}')">
        ✅ ดำเนินการแล้ว
        </button>
        </p>

      </div>
    `;

  });

 const box =
  document.getElementById(
    "addressRequests"
  );

if(!box){
  return;
}

box.innerHTML =
  html ||
  "ไม่มีคำขอเปลี่ยนที่อยู่";

}

async function completeAddressRequest(requestId){

  const formData =
    new FormData();

  formData.append(
    "payload",
    JSON.stringify({
      request_id: requestId
    })
  );

  const response =
    await fetch(
      API + "?action=completeAddressRequest",
      {
        method:"POST",
        body:formData
      }
    );

  const result =
    await response.json();

  alert(
    result.success
      ? "อัปเดตแล้ว"
      : "ผิดพลาด"
  );

  loadAddressRequests();

  try{

   ...

   if(result.success){

      await loadAddressRequests();

   }

}
catch(error){

   console.error(
      "completeAddressRequest error:",
      error
   );

   alert(
      "เกิดข้อผิดพลาด"
   );

}

}
