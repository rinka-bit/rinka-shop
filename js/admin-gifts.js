let adminGiftCampaigns = [];
let adminGiftRules = [];

let editingGiftId = "";

function renderGiftManager(){

  const box =
    document.getElementById(
      "giftManager"
    );

  if(!box){

    return;

  }

  box.innerHTML = `

<div class="card">

<h2 style="margin-top:0;">
🎁 Gift Campaign
</h2>

<p
style="
color:#64748b;
margin-top:-6px;
margin-bottom:20px;
"
>
เพิ่มหรือแก้ไขรายการของแถม
</p>

<div class="product-form">

<div>

<label>
Collection
</label>

<select
id="g_collection_id"
onchange="
updateGiftCampaignTierOptions();
"
>

<option value="">
-- เลือก Collection --
</option>

${adminCollections
  .map(collection=>`

<option
value="${escapeHtml(
  collection.collection_id
)}"
>

${escapeHtml(
  collection.name || "-"
)}

</option>

`)
  .join("")}

</select>

</div>

<div>

<label>
Tier
</label>

<select
id="g_tier_name"
>

<option value="">
-- เลือก Tier --
</option>

</select>

<p
id="giftTierHelp"
style="
font-size:12px;
color:#64748b;
margin:6px 0 0;
"
>
กรุณาเลือก Collection ก่อน
</p>

</div>

<div>

<label>
ชื่อของแถม
</label>

<input
id="g_gift_name"
placeholder="เช่น โปสการ์ด / เข็มกลัด / สแตนดี้"
>

</div>

<div>

<label>
รูปของแถม
</label>

<input
id="g_gift_image_file"
type="file"
accept="image/*"
>

</div>

<div>

<label>
มีตัวเลือกตัวละครหรือไม่
</label>

<select
id="g_has_character_select"
onchange="
toggleGiftCharacterOption()
"
>

<option value="">
ไม่มีตัวเลือกตัวละคร
</option>

<option value="yes">
มีตัวเลือกตัวละคร
</option>

</select>

</div>

<div
id="giftCharacterBox"
style="display:none;"
>

<label>
เลือกตัวละครเดียวกันได้สูงสุด
</label>

<input
id="g_max_same_character"
type="number"
min="1"
step="1"
value="1"
>

<p
style="
font-size:12px;
color:#64748b;
margin:6px 0 0;
"
>
ตัวอย่าง: ใส่ 2 หมายถึงตัวละครเดียวกันเลือกซ้ำได้ไม่เกิน 2 ชิ้น
</p>

</div>

<div>

<label>
สถานะ
</label>

<select id="g_active">

<option value="yes">
เปิดใช้งาน
</option>

<option value="">
ปิดใช้งาน
</option>

</select>

</div>

</div>

<br>

<div
style="
display:flex;
gap:10px;
flex-wrap:wrap;
"
>

<button
id="saveGiftBtn"
type="button"
onclick="
submitGiftCampaign()
"
>
💾 บันทึกของแถม
</button>

<button
id="cancelGiftEditBtn"
type="button"
class="hidden"
style="
background:#64748b;
"
onclick="
cancelGiftEdit()
"
>
ยกเลิกการแก้ไข
</button>

</div>

<div
id="saveGiftLoading"
class="loading-text"
style="display:none;"
>
⏳ กำลังบันทึกของแถม...
</div>

</div>


<div class="card">

<h2 style="margin-top:0;">
⚙️ Gift Rule
</h2>

<p
style="
color:#64748b;
margin-top:-6px;
margin-bottom:20px;
"
>
ตั้งเงื่อนไขการได้รับของแถมแต่ละ Tier
</p>

<div class="product-form">

<div>

<label>
Collection
</label>

<select
id="gr_collection_id"
onchange="
handleGiftRuleCollectionChange()
"
>

<option value="">
-- เลือก Collection --
</option>

${adminCollections
  .map(collection=>`

<option
value="${escapeHtml(
  collection.collection_id
)}"
>

${escapeHtml(
  collection.name || "-"
)}

</option>

`)
  .join("")}

</select>

</div>

<div>

<label>
Tier
</label>

<select
id="gr_tier_name"
onchange="
handleGiftRuleTierChange()
"
>

<option value="">
-- เลือก Tier --
</option>

</select>

</div>

<div>

<label>
ยอดขั้นต่ำ
</label>

<input
id="gr_min_amount"
type="number"
min="0"
step="0.01"
value="0"
>

</div>

<div>

<label>
จำนวนที่เลือกได้
</label>

<input
id="gr_max_select"
type="number"
min="1"
step="1"
value="1"
>

</div>

<div>

<label>
รูปแบบการเลือกของแถม
</label>

<select id="gr_selection_mode">

<option value="checkbox">
เลือกแต่ละรายการได้ 1 ครั้ง
</option>

<option value="quantity">
เพิ่มจำนวนรายการเดิมได้
</option>

<option value="fixed_set">
ได้รับครบทั้งเซ็ต
</option>

</select>

</div>

<div>

<label>
รูปแบบการสะสม Tier
</label>

<select id="gr_rule_mode">

<option value="stack">
สะสมสิทธิ์ Tier ก่อนหน้า
</option>

<option value="replace">
ใช้เฉพาะ Tier สูงสุด
</option>

</select>

</div>

<div>

<label>
ขอบเขตการใช้สิทธิ์
</label>

<select
id="gr_redeem_scope"
onchange="
toggleLowerTierBox()
"
>

<option value="current_only">
รับของแถม Tier ปัจจุบัน
</option>

<option value="current_or_lower">
เปลี่ยนเป็นของแถม Tier ต่ำกว่าได้
</option>

</select>

</div>

<div
id="lowerTierBox"
style="display:none;"
>

<label>
Tier ที่นำมาแลกแทน
</label>

<select id="gr_lower_tier_name">

<option value="">
-- เลือก Tier ต่ำกว่า --
</option>

</select>

</div>

<div
id="lowerTierQtyBox"
style="display:none;"
>

<label>
จำนวนสิทธิ์ของ Tier ต่ำกว่า
</label>

<input
id="gr_lower_tier_quantity"
type="number"
min="1"
step="1"
value="2"
>

<p
style="
font-size:12px;
color:#64748b;
margin:6px 0 0;
"
>
ตัวอย่าง: Tier 2 แลกเป็น Tier 1 ได้ 2 ชิ้น ให้ใส่ 2
</p>

</div>

<div>

<label>
สถานะ
</label>

<select id="gr_active">

<option value="yes">
เปิดใช้งาน
</option>

<option value="">
ปิดใช้งาน
</option>

</select>

</div>

<!--
ช่อง Legacy ชั่วคราว

ฟังก์ชันเดิมบางตัวยังอ้างถึง
gr_allow_duplicate

จึงเก็บไว้แบบซ่อนก่อน
จนกว่าจะเปลี่ยน submitGiftRule()
ในขั้นถัดไป
-->

<div style="display:none;">

<select id="gr_allow_duplicate">

<option value="no">
ไม่อนุญาต
</option>

<option value="yes">
อนุญาต
</option>

</select>

</div>

</div>

<br>

<button
id="saveGiftRuleBtn"
type="button"
onclick="
submitGiftRule()
"
>
💾 บันทึกเงื่อนไขของแถม
</button>

<div
id="saveGiftRuleLoading"
class="loading-text"
style="display:none;"
>
⏳ กำลังบันทึกกติกา...
</div>

</div>


<div class="card">

<h2 style="margin-top:0;">
📋 รายการของแถม
</h2>

<div id="adminGiftList">
ยังไม่มีข้อมูล
</div>

</div>

`;

  toggleGiftCharacterOption();

  toggleLowerTierBox();

  updateGiftCampaignTierOptions();

}

  function getAdminGiftTierNamesByCollection(
  collectionId
){

  const tierMap =
    new Map();

  adminGiftCampaigns
    .filter(gift=>

      String(
        gift.collection_id || ""
      ) ===
      String(
        collectionId || ""
      )

    )
    .forEach(gift=>{

      const tierName =
        String(
          gift.tier_name || ""
        ).trim();

      if(tierName){

        tierMap.set(
          tierName.toLowerCase(),
          tierName
        );

      }

    });

  adminGiftRules
    .filter(rule=>

      String(
        rule.collection_id || ""
      ) ===
      String(
        collectionId || ""
      )

    )
    .forEach(rule=>{

      const tierName =
        String(
          rule.tier_name || ""
        ).trim();

      if(tierName){

        tierMap.set(
          tierName.toLowerCase(),
          tierName
        );

      }

    });

  return Array.from(
    tierMap.values()
  );

}


function updateGiftCampaignTierOptions(
  preferredTierName = ""
){

  const collectionSelect =
    document.getElementById(
      "g_collection_id"
    );

  const tierSelect =
    document.getElementById(
      "g_tier_name"
    );

  const helpText =
    document.getElementById(
      "giftTierHelp"
    );

  if(
    !collectionSelect ||
    !tierSelect
  ){

    return;

  }

  const collectionId =
    String(
      collectionSelect.value || ""
    );

  const previousTierName =
    String(
      preferredTierName ||
      tierSelect.value ||
      ""
    ).trim();

  if(!collectionId){

    tierSelect.innerHTML = `

      <option value="">
        -- เลือก Tier --
      </option>

    `;

    tierSelect.disabled =
      true;

    if(helpText){

      helpText.textContent =
        "กรุณาเลือก Collection ก่อน";

    }

    return;

  }

  const tierNames =
    getAdminGiftTierNamesByCollection(
      collectionId
    );

  tierSelect.disabled =
    false;

  if(!tierNames.length){

    tierSelect.innerHTML = `

      <option value="">
        ยังไม่มี Tier ใน Collection นี้
      </option>

    `;

    if(helpText){

      helpText.textContent =
        "ต้องสร้าง Gift Rule ของ Tier ก่อน จึงจะเพิ่มของแถมได้";

    }

    return;

  }

  tierSelect.innerHTML = `

    <option value="">
      -- เลือก Tier --
    </option>

    ${tierNames
      .map(tierName=>`

        <option
        value="${escapeHtml(
          tierName
        )}"
        >

          ${escapeHtml(
            tierName
          )}

        </option>

      `)
      .join("")}

  `;

  const matchingTier =
    tierNames.find(tierName=>

      String(
        tierName
      )
        .trim()
        .toLowerCase() ===

      previousTierName
        .toLowerCase()

    );

  tierSelect.value =
    matchingTier || "";

  if(helpText){

    helpText.textContent =
      "Tier จะอ้างอิงจาก Gift Rule ของ Collection นี้";

  }

}


function toggleGiftCharacterOption(){

  const select =
    document.getElementById(
      "g_has_character_select"
    );

  const box =
    document.getElementById(
      "giftCharacterBox"
    );

  const maxInput =
    document.getElementById(
      "g_max_same_character"
    );

  if(
    !select ||
    !box
  ){

    return;

  }

  const hasCharacterSelect =
    String(
      select.value || ""
    )
      .trim()
      .toLowerCase() ===
    "yes";

  box.style.display =
    hasCharacterSelect
      ? "block"
      : "none";

  if(
    !hasCharacterSelect &&
    maxInput
  ){

    maxInput.value = 1;

  }

}


function handleGiftRuleCollectionChange(){

  updateGiftRuleTierOptions();

  updateGiftLowerTierOptions();

  toggleLowerTierBox();

}


function handleGiftRuleTierChange(){

  fillGiftRuleForm();

  updateGiftLowerTierOptions();

  toggleLowerTierBox();

}


function updateGiftLowerTierOptions(
  preferredLowerTierName = ""
){

  const collectionSelect =
    document.getElementById(
      "gr_collection_id"
    );

  const currentTierSelect =
    document.getElementById(
      "gr_tier_name"
    );

  const lowerTierSelect =
    document.getElementById(
      "gr_lower_tier_name"
    );

  if(
    !collectionSelect ||
    !currentTierSelect ||
    !lowerTierSelect
  ){

    return;

  }

  const collectionId =
    String(
      collectionSelect.value || ""
    );

  const currentTierName =
    String(
      currentTierSelect.value || ""
    )
      .trim()
      .toLowerCase();

  const previousLowerTierName =
    String(
      preferredLowerTierName ||
      lowerTierSelect.value ||
      ""
    ).trim();

  if(!collectionId){

    lowerTierSelect.innerHTML = `

      <option value="">
        -- เลือก Tier ต่ำกว่า --
      </option>

    `;

    return;

  }

  const tierNames =
    getAdminGiftTierNamesByCollection(
      collectionId
    )
      .filter(tierName=>

        String(
          tierName
        )
          .trim()
          .toLowerCase() !==
        currentTierName

      );

  lowerTierSelect.innerHTML = `

    <option value="">
      -- เลือก Tier ต่ำกว่า --
    </option>

    ${tierNames
      .map(tierName=>`

        <option
        value="${escapeHtml(
          tierName
        )}"
        >

          ${escapeHtml(
            tierName
          )}

        </option>

      `)
      .join("")}

  `;

  const matchingTier =
    tierNames.find(tierName=>

      String(
        tierName
      )
        .trim()
        .toLowerCase() ===

      previousLowerTierName
        .toLowerCase()

    );

  lowerTierSelect.value =
    matchingTier || "";

}


function toggleLowerTierBox(){

  const redeemScopeSelect =
    document.getElementById(
      "gr_redeem_scope"
    );

  const lowerTierBox =
    document.getElementById(
      "lowerTierBox"
    );

  const lowerTierQtyBox =
    document.getElementById(
      "lowerTierQtyBox"
    );

  const lowerTierSelect =
    document.getElementById(
      "gr_lower_tier_name"
    );

  const lowerTierQuantity =
    document.getElementById(
      "gr_lower_tier_quantity"
    );

  if(
    !redeemScopeSelect ||
    !lowerTierBox ||
    !lowerTierQtyBox
  ){

    return;

  }

  const showLowerTier =
    String(
      redeemScopeSelect.value || ""
    )
      .trim()
      .toLowerCase() ===
    "current_or_lower";

  lowerTierBox.style.display =
    showLowerTier
      ? "block"
      : "none";

  lowerTierQtyBox.style.display =
    showLowerTier
      ? "block"
      : "none";

  if(showLowerTier){

    updateGiftLowerTierOptions();

  }
  else{

    if(lowerTierSelect){

      lowerTierSelect.value = "";

    }

    if(lowerTierQuantity){

      lowerTierQuantity.value = 2;

    }

  }

}

  async function loadGiftCampaigns(){

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "getGiftCampaigns"
    );

    const response =
      await fetch(
        API,
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();

    if(!result.success){

      throw new Error(
        result.error ||
        "โหลดข้อมูลของแถมไม่สำเร็จ"
      );

    }

    adminGiftCampaigns =
      Array.isArray(
        result.campaigns
      )
        ? result.campaigns
        : [];

    adminGiftRules =
      Array.isArray(
        result.rules
      )
        ? result.rules
        : [];

    renderAdminGiftList();

    const collectionSelect =
  document.getElementById(
    "gr_collection_id"
  );

if(
  collectionSelect &&
  collectionSelect.value
){

  updateGiftRuleTierOptions();

}
else{

  const tierSelect =
    document.getElementById(
      "gr_tier_name"
    );

  if(tierSelect){

    tierSelect.innerHTML = `

      <option value="">
        เลือก Tier
      </option>

    `;

  }

  fillGiftRuleForm();

}

  }
  catch(error){

    console.error(
      "loadGiftCampaigns error:",
      error
    );

    adminGiftCampaigns = [];

    adminGiftRules = [];

    renderAdminGiftList();

  }

}

function getGiftRule(
  collectionId,
  tierName
){

  const normalizedTier =
    String(
      tierName || ""
    )
      .trim()
      .toLowerCase();

  return adminGiftRules.find(
    rule => {

      const ruleCollectionId =
        String(
          rule.collection_id || ""
        );

      const ruleTierName =
        String(
          rule.tier_name || ""
        )
          .trim()
          .toLowerCase();

      return (
        ruleCollectionId ===
          String(collectionId) &&
        ruleTierName ===
          normalizedTier
      );

    }
  ) || null;

}

  function renderAdminGiftList(){

  const box =
    document.getElementById(
      "adminGiftList"
    );

  if(!box){

    return;

  }

  if(
    !adminGiftCampaigns.length
  ){

    box.innerHTML =
      "ยังไม่มีข้อมูลของแถม";

    return;

  }

  let html =
    '<div class="grid">';

  adminGiftCampaigns.forEach(
    gift => {

      const collection =
        adminCollections.find(
          item =>

            String(
              item.collection_id
            ) ===
            String(
              gift.collection_id
            )

        );

      const rule =
        getGiftRule(
          gift.collection_id,
          gift.tier_name
        );

      const ruleMode =
        rule &&
        String(
          rule.rule_mode || ""
        )
          .trim()
          .toLowerCase() ===
        "replace"
          ? "replace"
          : "stack";

      const ruleModeLabel =
        ruleMode === "replace"
          ? "ตัด Tier ที่ต่ำกว่า"
          : "สะสม Tier ก่อนหน้า";

      const ruleModeIcon =
        ruleMode === "replace"
          ? "🔄"
          : "➕";

      html += `

<div class="card">

${
  gift.gift_image
    ? `
      <img
      src="${escapeHtml(
        gift.gift_image
      )}"
      alt="${escapeHtml(
        gift.gift_name || ""
      )}"
      style="
      width:100%;
      height:180px;
      object-fit:cover;
      border-radius:14px;
      background:#f1f5f9;
      margin-bottom:12px;
      ">
    `
    : ""
}

<h3
style="
margin-top:0;
">

${escapeHtml(
  gift.gift_name || "-"
)}

</h3>

<p>

🆔

${escapeHtml(
  gift.gift_id || "-"
)}

</p>

<p>

🖼️ Collection:

${escapeHtml(
  collection
    ? collection.name
    : gift.collection_id || "-"
)}

</p>

<p>

🎁 ระดับ:

${escapeHtml(
  gift.tier_name || "-"
)}

</p>

<p>

💰 ยอดขั้นต่ำ:

${
  rule
    ? Number(
        rule.min_amount || 0
      ).toLocaleString()
    : "-"
}

บาท

</p>

<p>

🔢 เลือกได้:

${
  rule
    ? Number(
        rule.max_select || 1
      )
    : "-"
}

รายการ

</p>

<p>

♻️ เลือกของแถมซ้ำ:

${
  !rule
    ? "-"
    : String(
        rule.allow_duplicate || ""
      )
        .trim()
        .toLowerCase() ===
      "yes"
        ? "อนุญาต"
        : "ไม่อนุญาต"
}

</p>

<p>

${ruleModeIcon}
รูปแบบ Tier:

<b>

${
  rule
    ? ruleModeLabel
    : "-"
}

</b>

</p>

<p>

สถานะของแถม:

<b>

${
  String(
    gift.active || ""
  )
    .trim()
    .toLowerCase() ===
  "yes"
    ? "เปิดใช้งาน"
    : "ปิดใช้งาน"
}

</b>

</p>

<p>

สถานะกติกา:

<b>

${
  !rule
    ? "ยังไม่ตั้งกติกา"
    : String(
        rule.active || ""
      )
        .trim()
        .toLowerCase() ===
      "yes"
        ? "เปิดใช้งาน"
        : "ปิดใช้งาน"
}

</b>

</p>

<div
style="
display:flex;
gap:8px;
flex-wrap:wrap;
margin-top:12px;
">

<button
onclick="
editGiftCampaign(
  '${escapeJsString(
    gift.gift_id
  )}'
)
">

✏️ แก้ไข

</button>

<button
type="button"
style="
background:#8b5cf6;
"
onclick="
openGiftRule(
  '${escapeJsString(
    gift.collection_id
  )}',
  '${escapeJsString(
    gift.tier_name
  )}'
)
">

⚙️ แก้ไขกติกา

</button>

<button
style="
background:#ef4444;
"
onclick="
removeGiftCampaign(
  '${escapeJsString(
    gift.gift_id
  )}'
)
">

🗑️ ลบ

</button>

</div>

</div>

`;

    }
  );

  html +=
    "</div>";

  box.innerHTML =
    html;

}

 async function submitGiftRule(){

  const btn =
    document.getElementById(
      "saveGiftRuleBtn"
    );

  const loading =
    document.getElementById(
      "saveGiftRuleLoading"
    );

  const collectionId =
    document
      .getElementById(
        "gr_collection_id"
      )
      ?.value || "";

  const tierName =
    document
      .getElementById(
        "gr_tier_name"
      )
      ?.value
      .trim() || "";

  const minAmount =
    Number(
      document
        .getElementById(
          "gr_min_amount"
        )
        ?.value || 0
    );

  const maxSelect =
    Number(
      document
        .getElementById(
          "gr_max_select"
        )
        ?.value || 1
    );

  const allowDuplicate =
    document
      .getElementById(
        "gr_allow_duplicate"
      )
      ?.value || "no";

  const ruleMode =
    document
      .getElementById(
        "gr_rule_mode"
      )
      ?.value || "stack";

  const active =
    document
      .getElementById(
        "gr_active"
      )
      ?.value || "";

  if(!collectionId){

    alert(
      "กรุณาเลือก Collection"
    );

    return;

  }

  if(!tierName){

    alert(
      "กรุณาเลือก Tier"
    );

    return;

  }

  if(
    !Number.isFinite(
      minAmount
    ) ||
    minAmount < 0
  ){

    alert(
      "Min Amount ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"
    );

    return;

  }

  if(
    !Number.isInteger(
      maxSelect
    ) ||
    maxSelect < 1
  ){

    alert(
      "Max Select ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    );

    return;

  }

  const existingRule =
    getGiftRule(
      collectionId,
      tierName
    );

  const payload = {

    rule_id:
      existingRule
        ? existingRule.rule_id
        : "",

    collection_id:
      collectionId,

    tier_name:
      tierName,

    min_amount:
      minAmount,

    max_select:
      maxSelect,

    allow_duplicate:
      allowDuplicate,

    rule_mode:
      ruleMode,

    active:
      active

  };

  if(btn){

    btn.disabled = true;

    btn.textContent =
      "กำลังบันทึก...";

  }

  if(loading){

    loading.style.display =
      "block";

  }

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "saveGiftRule"
    );

    formData.append(
      "payload",
      JSON.stringify(
        payload
      )
    );

    const response =
      await fetch(
        API,
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();

    if(!result.success){

      throw new Error(
        result.error ||
        result.message ||
        "บันทึก Gift Rule ไม่สำเร็จ"
      );

    }

    await loadGiftCampaigns();

    const newCollectionSelect =
      document.getElementById(
        "gr_collection_id"
      );

    if(newCollectionSelect){

      newCollectionSelect.value =
        collectionId;

    }

    updateGiftRuleTierOptions();

    const newTierSelect =
      document.getElementById(
        "gr_tier_name"
      );

    if(newTierSelect){

      newTierSelect.value =
        tierName;

    }

    fillGiftRuleForm();

    alert(
      existingRule
        ? "แก้ไข Gift Rule เรียบร้อยแล้ว"
        : "เพิ่ม Gift Rule เรียบร้อยแล้ว"
    );

  }
  catch(error){

    console.error(
      "submitGiftRule error:",
      error
    );

    alert(
      "บันทึก Gift Rule ไม่สำเร็จ\n" +
      error.message
    );

  }
  finally{

    const currentBtn =
      document.getElementById(
        "saveGiftRuleBtn"
      );

    const currentLoading =
      document.getElementById(
        "saveGiftRuleLoading"
      );

    if(currentBtn){

      currentBtn.disabled = false;

      currentBtn.textContent =
        "💾 บันทึกเงื่อนไขของแถม";

    }

    if(currentLoading){

      currentLoading.style.display =
        "none";

    }

  }

}
  
  async function submitGiftCampaign(){

  const btn =
    document.getElementById(
      "saveGiftBtn"
    );

  const loading =
    document.getElementById(
      "saveGiftLoading"
    );

  const collectionId =
    document
      .getElementById(
        "g_collection_id"
      )
      ?.value || "";

  const tierName =
    document
      .getElementById(
        "g_tier_name"
      )
      ?.value
      .trim() || "";

  const giftName =
    document
      .getElementById(
        "g_gift_name"
      )
      ?.value
      .trim() || "";

  const active =
    document
      .getElementById(
        "g_active"
      )
      ?.value || "";

  const imageFile =
    document
      .getElementById(
        "g_gift_image_file"
      )
      ?.files[0];

  if(!collectionId){

    alert(
      "กรุณาเลือก Collection"
    );

    return;

  }

  if(!tierName){

    alert(
      "กรุณากรอกชื่อระดับของแถม"
    );

    return;

  }

  if(!giftName){

    alert(
      "กรุณากรอกชื่อของแถม"
    );

    return;

  }

  if(
    !editingGiftId &&
    !imageFile
  ){

    alert(
      "กรุณาเลือกรูปของแถม"
    );

    return;

  }

  const payload = {

    gift_id:
      editingGiftId || "",

    collection_id:
      collectionId,

    tier_name:
      tierName,

    gift_name:
      giftName,

    active:
      active

  };

  if(btn){

    btn.disabled = true;

    btn.textContent =
      editingGiftId
        ? "กำลังบันทึกการแก้ไข..."
        : "กำลังบันทึก...";

  }

  if(loading){

    loading.style.display =
      "block";

  }

  try{

    if(imageFile){

      payload.gift_image_base64 =
        await fileToBase64(
          imageFile
        );

    }

    const formData =
      new FormData();

    formData.append(
      "action",
      "saveGiftCampaign"
    );

    formData.append(
      "payload",
      JSON.stringify(payload)
    );

    const response =
      await fetch(
        API,
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();

    if(!result.success){

      throw new Error(
        result.error ||
        "บันทึกของแถมไม่สำเร็จ"
      );

    }

    const wasEditing =
      Boolean(editingGiftId);

    cancelGiftEdit();

    await loadGiftCampaigns();

    alert(
      wasEditing
        ? "แก้ไขของแถมเรียบร้อยแล้ว"
        : "เพิ่มของแถมเรียบร้อยแล้ว"
    );

  }
  catch(error){

    console.error(
      "submitGiftCampaign error:",
      error
    );

    alert(
      "บันทึกของแถมไม่สำเร็จ\n" +
      error.message
    );

  }
  finally{

    const currentBtn =
      document.getElementById(
        "saveGiftBtn"
      );

    const currentLoading =
      document.getElementById(
        "saveGiftLoading"
      );

    if(currentBtn){

      currentBtn.disabled = false;

      currentBtn.textContent =
        editingGiftId
          ? "💾 บันทึกการแก้ไข"
          : "💾 บันทึกของแถม";

    }

    if(currentLoading){

      currentLoading.style.display =
        "none";

    }

  }

}

  function editGiftCampaign(
  giftId
){

  const gift =
    adminGiftCampaigns.find(item=>

      String(
        item.gift_id
      ) ===
      String(giftId)

    );

  if(!gift){

    alert(
      "ไม่พบข้อมูลของแถม"
    );

    return;

  }

  editingGiftId =
    gift.gift_id;

  document
    .getElementById(
      "g_collection_id"
    )
    .value =
      gift.collection_id || "";

  document
    .getElementById(
      "g_tier_name"
    )
    .value =
      gift.tier_name || "";

  document
    .getElementById(
      "g_gift_name"
    )
    .value =
      gift.gift_name || "";

  document
    .getElementById(
      "g_active"
    )
    .value =
      String(
        gift.active || ""
      ).toLowerCase() === "yes"
        ? "yes"
        : "";

  document
    .getElementById(
      "saveGiftBtn"
    )
    .textContent =
      "💾 บันทึกการแก้ไข";

  document
    .getElementById(
      "cancelGiftEditBtn"
    )
    .classList.remove(
      "hidden"
    );

  document
    .getElementById(
      "g_collection_id"
    )
    .scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

}

  function cancelGiftEdit(){

  editingGiftId = "";

  const collection =
    document.getElementById(
      "g_collection_id"
    );

  if(!collection){
    return;
  }

  collection.value = "";

  document
    .getElementById(
      "g_tier_name"
    )
    .value = "";

  document
    .getElementById(
      "g_gift_name"
    )
    .value = "";

  document
    .getElementById(
      "g_gift_image_file"
    )
    .value = "";

  document
    .getElementById(
      "g_active"
    )
    .value = "yes";

  document
    .getElementById(
      "saveGiftBtn"
    )
    .textContent =
      "💾 บันทึกของแถม";

  document
    .getElementById(
      "cancelGiftEditBtn"
    )
    .classList.add(
      "hidden"
    );

}

 async function removeGiftCampaign(
  giftId
){

  const gift =
    adminGiftCampaigns.find(item=>

      String(
        item.gift_id
      ) ===
      String(giftId)

    );

  const giftName =
    gift
      ? gift.gift_name
      : giftId;

  const ok =
    confirm(
      "ต้องการลบของแถม \"" +
      giftName +
      "\" ใช่ไหม?"
    );

  if(!ok){
    return;
  }

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "deleteGiftCampaign"
    );

    formData.append(
      "payload",
      JSON.stringify({
        gift_id:giftId
      })
    );

    const response =
      await fetch(
        API,
        {
          method:"POST",
          body:formData
        }
      );

    const result =
      await response.json();

    if(!result.success){

      throw new Error(
        result.error ||
        "ลบของแถมไม่สำเร็จ"
      );

    }

    if(
      String(editingGiftId) ===
      String(giftId)
    ){

      cancelGiftEdit();

    }

    await loadGiftCampaigns();

    alert(
      "ลบของแถมเรียบร้อยแล้ว"
    );

  }catch(error){

    console.error(
      "removeGiftCampaign error:",
      error
    );

    alert(
      "ลบของแถมไม่สำเร็จ\n" +
      error.message
    );

  }

} 

 function fillGiftRuleForm(){

  const collectionSelect =
    document.getElementById(
      "gr_collection_id"
    );

  const tierNameInput =
    document.getElementById(
      "gr_tier_name"
    );

  const minAmountInput =
    document.getElementById(
      "gr_min_amount"
    );

  const maxSelectInput =
    document.getElementById(
      "gr_max_select"
    );

  const allowDuplicateSelect =
    document.getElementById(
      "gr_allow_duplicate"
    );

  const ruleModeSelect =
    document.getElementById(
      "gr_rule_mode"
    );

  const activeSelect =
    document.getElementById(
      "gr_active"
    );

  if(
    !collectionSelect ||
    !tierNameInput ||
    !minAmountInput ||
    !maxSelectInput ||
    !allowDuplicateSelect ||
    !ruleModeSelect ||
    !activeSelect
  ){

    return;

  }

  const collectionId =
    collectionSelect.value;

  const tierName =
    tierNameInput.value.trim();

  if(
    !collectionId ||
    !tierName
  ){

    minAmountInput.value =
      0;

    maxSelectInput.value =
      1;

    allowDuplicateSelect.value =
      "no";

    ruleModeSelect.value =
      "stack";

    activeSelect.value =
      "yes";

    return;

  }

  const rule =
    getGiftRule(
      collectionId,
      tierName
    );

  minAmountInput.value =
    rule
      ? Number(
          rule.min_amount || 0
        )
      : 0;

  maxSelectInput.value =
    rule
      ? Number(
          rule.max_select || 1
        )
      : 1;

  allowDuplicateSelect.value =
    rule &&
    String(
      rule.allow_duplicate || ""
    )
      .trim()
      .toLowerCase() ===
    "yes"
      ? "yes"
      : "no";

  ruleModeSelect.value =
    rule &&
    String(
      rule.rule_mode || ""
    )
      .trim()
      .toLowerCase() ===
    "replace"
      ? "replace"
      : "stack";

  activeSelect.value =
    rule &&
    String(
      rule.active || ""
    )
      .trim()
      .toLowerCase() ===
    "yes"
      ? "yes"
      : "";

}

  function openGiftRule(
  collectionId,
  tierName
){

  const collectionSelect =
    document.getElementById(
      "gr_collection_id"
    );

  const tierSelect =
    document.getElementById(
      "gr_tier_name"
    );

  if(
    !collectionSelect ||
    !tierSelect
  ){

    alert(
      "ไม่พบฟอร์ม Gift Rule"
    );

    return;

  }

  collectionSelect.value =
    String(
      collectionId || ""
    );

  updateGiftRuleTierOptions(
    tierName
  );

  const ruleForm =
    document.getElementById(
      "saveGiftRuleBtn"
    )
      ?.closest(
        ".card"
      );

  if(ruleForm){

    ruleForm.scrollIntoView({

      behavior:"smooth",

      block:"start"

    });

  }

}

  function getGiftTiersByCollection(
  collectionId
){

  const tierMap =
    new Map();

  adminGiftCampaigns
    .filter(
      gift =>
        String(
          gift.collection_id
        ) ===
        String(
          collectionId
        )
    )
    .forEach(
      gift => {

        const tierName =
          String(
            gift.tier_name || ""
          ).trim();

        if(tierName){

          tierMap.set(
            tierName.toLowerCase(),
            tierName
          );

        }

      }
    );

  return Array.from(
    tierMap.values()
  );

}

  function updateGiftRuleTierOptions(
  preferredTierName = ""
){

  const collectionSelect =
    document.getElementById(
      "gr_collection_id"
    );

  const tierSelect =
    document.getElementById(
      "gr_tier_name"
    );

  if(
    !collectionSelect ||
    !tierSelect
  ){

    return;

  }

  const collectionId =
    String(
      collectionSelect.value || ""
    );

  const previousTierName =
    String(
      preferredTierName ||
      tierSelect.value ||
      ""
    ).trim();

  if(!collectionId){

    tierSelect.innerHTML = `

      <option value="">
        เลือก Tier
      </option>

    `;

    fillGiftRuleForm();

    return;

  }

  const tierNames =
    getGiftTiersByCollection(
      collectionId
    );

  tierSelect.innerHTML = `

    <option value="">
      เลือก Tier
    </option>

    ${tierNames
      .map(
        tierName => `

          <option
          value="${escapeHtml(
            tierName
          )}"
          >

            ${escapeHtml(
              tierName
            )}

          </option>

        `
      )
      .join("")}

  `;

  const matchingTier =
    tierNames.find(
      tierName =>

        String(
          tierName
        )
          .trim()
          .toLowerCase() ===

        previousTierName
          .toLowerCase()

    );

  tierSelect.value =
    matchingTier || "";

  fillGiftRuleForm();

}

