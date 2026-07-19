async function loadAddressRequests(){

  const box =
    document.getElementById(
      "addressRequests"
    );

  if(!box){
    return;
  }

  try{

    const response =
      await fetch(
        API +
        "?action=addressChanges"
      );

    const result =
      await response.json();

    const requests =
      Array.isArray(
        result.requests
      )
        ? [...result.requests].reverse()
        : [];

    let html = "";

    requests.forEach(req=>{

      if(
        req.status === "completed"
      ){
        return;
      }

      html += `

        <div class="warning-card">

          <h3>
            ${escapeHtml(
              req.request_id || "-"
            )}
          </h3>

          <p>
            Order:
            ${escapeHtml(
              req.order_id || "-"
            )}
          </p>

          <p>
            ชื่อ:
            ${escapeHtml(
              req.customer_name || "-"
            )}
          </p>

          <p>
            โทร:
            ${escapeHtml(
              req.phone || "-"
            )}
          </p>

          <p>
            Social:
            ${escapeHtml(
              req.social || "-"
            )}
          </p>

          <p>
            ที่อยู่ใหม่:
            ${escapeHtml(
              req.address || "-"
            )}
          </p>

          <p>

            สถานะ:
            ${escapeHtml(
              req.status || "-"
            )}

            <br><br>

            <button
            onclick="
              completeAddressRequest(
                '${escapeJsString(
                  req.request_id
                )}'
              )
            "
            >
              ✅ ดำเนินการแล้ว
            </button>

          </p>

        </div>

      `;

    });

    box.innerHTML =
      html ||
      "ไม่มีคำขอเปลี่ยนที่อยู่";

  }
  catch(error){

    console.error(
      "loadAddressRequests error:",
      error
    );

    box.innerHTML =
      "โหลดคำขอเปลี่ยนที่อยู่ไม่สำเร็จ";

  }

}

async function completeAddressRequest(
  requestId
){

  const ok =
    confirm(
      "ยืนยันว่าดำเนินการคำขอนี้แล้วใช่ไหม?"
    );

  if(!ok){
    return;
  }

  try{

    const formData =
      new FormData();

    formData.append(
      "payload",
      JSON.stringify({
        request_id:
          requestId
      })
    );

    const response =
      await fetch(
        API +
        "?action=completeAddressRequest",
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();

    if(!result.success){

      alert(
        result.error ||
        "อัปเดตไม่สำเร็จ"
      );

      return;

    }

    alert(
      "อัปเดตแล้ว"
    );

    await loadAddressRequests();

  }
  catch(error){

    console.error(
      "completeAddressRequest error:",
      error
    );

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }

}
