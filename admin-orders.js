async function loadOrders(){

  const response =
    await fetch(
      API + "?action=orders"
    );

  const result =
    await response.json();

  const orders =
    Array.isArray(result.orders)
      ? [...result.orders].reverse()
      : [];

  let html = "";

  orders.forEach(order=>{

    if(
      order.payment_status !== "paid" ||
      order.status === "completed"
    ){
      return;
    }

    html += renderOrderCard(order);

  });

  const box =
    document.getElementById(
      "orders"
    );

  if(!box){
    return;
  }

  box.innerHTML =
    html ||
    "ยังไม่มีออเดอร์ที่ต้องดำเนินการ";

  orders.forEach(order=>{

    const select =
      document.getElementById(
        "status_" + order.order_id
      );

    if(select){

      select.value =
        order.status;

      toggleOrderFields(
        order.order_id
      );

    }

  });

}

function renderOrderCard(order){

  return `
    <div class="order-card">

      <h3>${order.order_id}</h3>

      <p>ลูกค้า: ${order.customer_name}</p>
      <p>${order.email}</p>
      <p>สถานะปัจจุบัน: ${order.status}</p>

      <select
      id="status_${order.order_id}"
      onchange="toggleOrderFields('${order.order_id}')"
      >
        <option value="pending">รอจัดการ</option>
        <option value="china_arrived">ถึงโกดังจีนแล้ว</option>
        <option value="shipping_to_th">กำลังมาไทย</option>
        <option value="ready_to_ship">เตรียมจัดส่ง</option>
        <option value="shipped">จัดส่งแล้ว</option>
      </select>

      <br><br>

      <div
      id="feeBox_${order.order_id}"
      style="display:none;"
      >
        <p>ค่านำเข้า / ค่าส่งในไทย</p>

        <input
        id="import_${order.order_id}"
        type="number"
        placeholder="ค่านำเข้า">

        <br><br>

        <input
        id="domestic_${order.order_id}"
        type="number"
        placeholder="ค่าส่งในไทย">

        <br><br>
      </div>

      <div
      id="trackingBox_${order.order_id}"
      style="display:none;"
      >
        <input
        id="courier_${order.order_id}"
        placeholder="ขนส่ง">

        <br><br>

        <input
        id="tracking_${order.order_id}"
        placeholder="เลขพัสดุ">

        <br><br>
      </div>

      <button onclick="updateOrderStatus('${order.order_id}')">
      อัปเดตสถานะ
      </button>

    </div>
  `;

}

function toggleOrderFields(orderId){

  const status =
    document.getElementById("status_" + orderId).value;

  const feeBox =
    document.getElementById("feeBox_" + orderId);

  const trackingBox =
    document.getElementById("trackingBox_" + orderId);

  if(!feeBox || !trackingBox){
    return;
  }

  feeBox.style.display =
    status === "ready_to_ship"
      ? "block"
      : "none";

  trackingBox.style.display =
    status === "shipped"
      ? "block"
      : "none";

}

async function updateOrderStatus(
  orderId
){

  const statusElement =
    document.getElementById(
      "status_" + orderId
    );

  if(!statusElement){

    console.error(
      "ไม่พบช่องสถานะของออเดอร์:",
      orderId
    );

    return;

  }

  const status =
    statusElement.value;

  const payload = {

    order_id:
      orderId,

    status:
      status

  };

  if(status === "ready_to_ship"){

    payload.import_fee_round2 =
      Number(
        document
          .getElementById(
            "import_" + orderId
          )
          ?.value || 0
      );

    payload.domestic_shipping_fee =
      Number(
        document
          .getElementById(
            "domestic_" + orderId
          )
          ?.value || 0
      );

    if(
      payload.import_fee_round2 < 0 ||
      payload.domestic_shipping_fee < 0
    ){

      alert(
        "ค่านำเข้าและค่าส่งในไทยต้องไม่ติดลบ"
      );

      return;

    }

  }

  if(status === "shipped"){

    payload.courier =
      document
        .getElementById(
          "courier_" + orderId
        )
        ?.value
        .trim() || "";

    payload.tracking_no =
      document
        .getElementById(
          "tracking_" + orderId
        )
        ?.value
        .trim() || "";

    if(
      !payload.courier ||
      !payload.tracking_no
    ){

      alert(
        "กรุณากรอกขนส่งและเลขพัสดุ"
      );

      return;

    }

  }

  try{

    const formData =
      new FormData();

    formData.append(
      "payload",
      JSON.stringify(payload)
    );

    const response =
      await fetch(
        API +
        "?action=updateOrderStatus",
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();

    alert(
      result.success
        ? "อัปเดตสถานะแล้ว"
        : result.error ||
          "อัปเดตไม่สำเร็จ"
    );

    if(result.success){

      await loadOrders();

    }

  }catch(error){

    console.error(
      "updateOrderStatus error:",
      error
    );

    alert(
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }

}
