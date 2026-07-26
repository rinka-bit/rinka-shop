/*
=========================================
GIFT MANAGER V2
ADMIN TREE VIEW — PHASE 1
=========================================
*/

let adminGiftCampaigns = [];
let adminGiftRules = [];
let adminGiftItems = [];
let adminGiftCharacters = [];

let adminGiftOpenNodes =
  new Set();

let adminGiftLoadingPromise =
  null;

let adminGiftModalMode = "";

let adminGiftModalAction = "";

let adminGiftModalRecordId = "";

let adminGiftModalParentId = "";

/*
=========================================
RENDER MANAGER SHELL
=========================================
*/

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

<div class="gift-toolbar">

<div>

<h2 style="margin:0;">
🎁 Gift Campaigns
</h2>

<p
style="
margin:6px 0 0;
color:#64748b;
"
>
จัดการ Campaign → Rule → Gift Item → Character
</p>

</div>

<div
style="
display:flex;
gap:8px;
flex-wrap:wrap;
"
>

<button
type="button"
class="gift-add-btn"
onclick="
openCreateGiftCampaign()
"
>
＋ เพิ่ม Campaign
</button>

<button
type="button"
style="background:#64748b;"
onclick="
reloadGiftManager()
"
>
↻ โหลดใหม่
</button>

</div>

</div>

<div
id="adminGiftTree"
class="gift-tree"
>

<div class="gift-loading">
⏳ กำลังโหลด Gift Manager...
</div>

</div>

</div>

`;

}


/*
=========================================
LOAD ALL GIFT DATA
=========================================
*/

async function loadGiftCampaigns(){

  if(adminGiftLoadingPromise){

    return adminGiftLoadingPromise;

  }

  adminGiftLoadingPromise =
    loadGiftManagerData();

  try{

    return await adminGiftLoadingPromise;

  }
  finally{

    adminGiftLoadingPromise =
      null;

  }

}


async function loadGiftManagerData(){

  const treeBox =
    document.getElementById(
      "adminGiftTree"
    );

  if(treeBox){

    treeBox.innerHTML = `

<div class="gift-loading">
⏳ กำลังโหลดข้อมูลของแถม...
</div>

`;

  }

  try{

    const [
      campaignResult,
      ruleResult,
      itemResult,
      characterResult
    ] =
      await Promise.all([

        fetchGiftAdminAction(
          "getGiftCampaigns"
        ),

        fetchGiftAdminAction(
          "getGiftRules"
        ),

        fetchGiftAdminAction(
          "getGiftItems"
        ),

        fetchGiftAdminAction(
          "getGiftCharacters"
        )

      ]);

    adminGiftCampaigns =
      Array.isArray(
        campaignResult.campaigns
      )
        ? campaignResult.campaigns
        : [];

    adminGiftRules =
      Array.isArray(
        ruleResult.rules
      )
        ? ruleResult.rules
        : [];

    adminGiftItems =
      Array.isArray(
        itemResult.items
      )
        ? itemResult.items
        : [];

    adminGiftCharacters =
      Array.isArray(
        characterResult.characters
      )
        ? characterResult.characters
        : [];

    renderGiftCampaignTree();

    return {

      success:true,

      campaigns:
        adminGiftCampaigns,

      rules:
        adminGiftRules,

      items:
        adminGiftItems,

      characters:
        adminGiftCharacters

    };

  }
  catch(error){

    console.error(
      "loadGiftManagerData error:",
      error
    );

    adminGiftCampaigns = [];
    adminGiftRules = [];
    adminGiftItems = [];
    adminGiftCharacters = [];

    if(treeBox){

      treeBox.innerHTML = `

<div class="gift-error">

โหลดข้อมูล Gift Manager ไม่สำเร็จ

<br>

${escapeHtml(
  error.message ||
  String(error)
)}

</div>

`;

    }

    return {

      success:false,

      error:
        error.message ||
        String(error)

    };

  }

}


/*
=========================================
FETCH GET ACTION
=========================================
*/

async function fetchGiftAdminAction(
  action,
  parameters = {}
){

  const query =
    new URLSearchParams();

  query.set(
    "action",
    action
  );

  Object.entries(
    parameters || {}
  ).forEach(
    ([key,value]) => {

      if(
        value === undefined ||
        value === null ||
        value === ""
      ){

        return;

      }

      query.set(
        key,
        String(value)
      );

    }
  );

  const response =
    await fetch(
      API +
      "?" +
      query.toString()
    );

  if(!response.ok){

    throw new Error(
      "HTTP " +
      response.status
    );

  }

  const result =
    await response.json();

  if(!result.success){

    throw new Error(
      result.error ||
      result.message ||
      "เรียก API ไม่สำเร็จ"
    );

  }

  return result;

}


/*
=========================================
RELOAD
=========================================
*/

async function reloadGiftManager(){

  const button =
    event &&
    event.currentTarget
      ? event.currentTarget
      : null;

  if(button){

    button.disabled = true;

    button.textContent =
      "กำลังโหลด...";

  }

  try{

    await loadGiftCampaigns();

  }
  finally{

    if(button){

      button.disabled = false;

      button.textContent =
        "↻ โหลดใหม่";

    }

  }

}


/*
=========================================
TREE RENDER
=========================================
*/

function renderGiftCampaignTree(){

  const box =
    document.getElementById(
      "adminGiftTree"
    );

  if(!box){

    return;

  }

  if(
    !adminGiftCampaigns.length
  ){

    box.innerHTML = `

<div class="gift-empty">

ยังไม่มี Gift Campaign

<br><br>

<button
type="button"
class="gift-add-btn"
onclick="
openCreateGiftCampaign()
"
>
＋ เพิ่ม Campaign แรก
</button>

</div>

`;

    return;

  }

  const campaigns =
    sortGiftAdminRows(
      adminGiftCampaigns,
      "campaign_name"
    );

  box.innerHTML =
    campaigns
      .map(
        campaign =>
          renderGiftCampaignNode(
            campaign
          )
      )
      .join("");

}


function renderGiftCampaignNode(
  campaign
){

  const campaignId =
    String(
      campaign.campaign_id || ""
    );

  const rules =
    sortGiftAdminRows(

      adminGiftRules.filter(
        rule =>

          String(
            rule.campaign_id || ""
          ) ===
          campaignId

      ),

      "rule_name"

    );

  const nodeKey =
    createGiftNodeKey(
      "campaign",
      campaignId
    );

  const isOpen =
    adminGiftOpenNodes.has(
      nodeKey
    );

  const collectionName =
    getGiftAdminCollectionName(
      campaign.collection_id
    );

  return `

<div
class="gift-tree-node"
data-gift-node="${escapeHtml(
  nodeKey
)}"
>

<div class="gift-tree-header">

<div class="gift-tree-title">

<button
type="button"
class="gift-toggle-btn"
onclick="
toggleGiftAdminNode(
  '${escapeJsString(
    nodeKey
  )}'
)
"
>

${isOpen ? "▼" : "▶"}

</button>

<div>

<div class="gift-tree-title-text">

📦

${escapeHtml(
  campaign.campaign_name ||
  "ไม่มีชื่อ Campaign"
)}

</div>

<div class="gift-node-meta">

Collection:

${escapeHtml(
  collectionName ||
  campaign.collection_id ||
  "-"
)}

&nbsp; • &nbsp;

Rules:

${rules.length}

&nbsp; • &nbsp;

${renderGiftStatusBadge(
  campaign.active
)}

</div>

</div>

</div>

<div class="gift-tree-actions">

<button
type="button"
class="gift-action-btn gift-add-btn"
onclick="
openCreateGiftRule(
  '${escapeJsString(
    campaignId
  )}'
)
"
>
＋ Rule
</button>

<button
type="button"
class="gift-action-btn gift-edit-btn"
onclick="
openEditGiftCampaign(
  '${escapeJsString(
    campaignId
  )}'
)
"
>
✏️ แก้ไข
</button>

<button
type="button"
class="gift-action-btn gift-delete-btn"
onclick="
requestDeleteGiftCampaign(
  '${escapeJsString(
    campaignId
  )}'
)
"
>
🗑️ ลบ
</button>

</div>

</div>

<div
id="${escapeHtml(
  createGiftChildrenId(
    nodeKey
  )
)}"
class="gift-tree-children ${
  isOpen
    ? ""
    : "hidden"
}"
>

${
  rules.length
    ? rules
        .map(
          rule =>
            renderGiftRuleNode(
              rule
            )
        )
        .join("")
    : renderGiftEmptyChild(
        "ยังไม่มี Rule ใน Campaign นี้"
      )
}

</div>

</div>

`;

}


function renderGiftRuleNode(
  rule
){

  const ruleId =
    String(
      rule.rule_id || ""
    );

  const items =
    sortGiftAdminRows(

      adminGiftItems.filter(
        item =>

          String(
            item.rule_id || ""
          ) ===
          ruleId

      ),

      "gift_name"

    );

  const nodeKey =
    createGiftNodeKey(
      "rule",
      ruleId
    );

  const isOpen =
    adminGiftOpenNodes.has(
      nodeKey
    );

  return `

<div
class="gift-tree-node gift-rule-node"
data-gift-node="${escapeHtml(
  nodeKey
)}"
>

<div class="gift-tree-header">

<div class="gift-tree-title">

<button
type="button"
class="gift-toggle-btn"
onclick="
toggleGiftAdminNode(
  '${escapeJsString(
    nodeKey
  )}'
)
"
>

${isOpen ? "▼" : "▶"}

</button>

<div>

<div class="gift-tree-title-text">

⚙️

${escapeHtml(
  rule.rule_name ||
  "ไม่มีชื่อ Rule"
)}

</div>

<div class="gift-node-meta">

ยอดขั้นต่ำ:

${formatGiftAdminMoney(
  rule.min_amount
)}

บาท

&nbsp; • &nbsp;

เลือกได้:

${Number(
  rule.max_select || 1
)}

ชิ้น

&nbsp; • &nbsp;

เลือกซ้ำ:

${
  normalizeGiftAdminYes(
    rule.allow_duplicate
  )
    ? "ได้"
    : "ไม่ได้"
}

&nbsp; • &nbsp;

${renderGiftStatusBadge(
  rule.active
)}

</div>

</div>

</div>

<div class="gift-tree-actions">

<button
type="button"
class="gift-action-btn gift-add-btn"
onclick="
openCreateGiftItem(
  '${escapeJsString(
    ruleId
  )}'
)
"
>
＋ Gift Item
</button>

<button
type="button"
class="gift-action-btn gift-edit-btn"
onclick="
openEditGiftRule(
  '${escapeJsString(
    ruleId
  )}'
)
"
>
✏️ แก้ไข
</button>

<button
type="button"
class="gift-action-btn gift-delete-btn"
onclick="
requestDeleteGiftRule(
  '${escapeJsString(
    ruleId
  )}'
)
"
>
🗑️ ลบ
</button>

</div>

</div>

<div
id="${escapeHtml(
  createGiftChildrenId(
    nodeKey
  )
)}"
class="gift-tree-children ${
  isOpen
    ? ""
    : "hidden"
}"
>

${
  items.length
    ? items
        .map(
          item =>
            renderGiftItemNode(
              item
            )
        )
        .join("")
    : renderGiftEmptyChild(
        "ยังไม่มี Gift Item ใน Rule นี้"
      )
}

</div>

</div>

`;

}


function renderGiftItemNode(
  item
){

  const giftItemId =
    String(
      item.gift_item_id || ""
    );

  const characters =
    sortGiftAdminRows(

      adminGiftCharacters.filter(
        character =>

          String(
            character.gift_item_id ||
            ""
          ) ===
          giftItemId

      ),

      "character_name"

    );

  const nodeKey =
    createGiftNodeKey(
      "item",
      giftItemId
    );

  const isOpen =
    adminGiftOpenNodes.has(
      nodeKey
    );

  const hasCharacter =
    normalizeGiftAdminYes(
      item.has_character
    );

  return `

<div
class="gift-tree-node gift-item-node"
data-gift-node="${escapeHtml(
  nodeKey
)}"
>

<div class="gift-tree-header">

<div class="gift-tree-title">

<button
type="button"
class="gift-toggle-btn"
onclick="
toggleGiftAdminNode(
  '${escapeJsString(
    nodeKey
  )}'
)
"
>

${isOpen ? "▼" : "▶"}

</button>

<div>

<div class="gift-tree-title-text">

🎁

${escapeHtml(
  item.gift_name ||
  "ไม่มีชื่อ Gift Item"
)}

</div>

<div class="gift-node-meta">

ตัวละคร:

${
  hasCharacter
    ? "มีตัวเลือก"
    : "ไม่มีตัวเลือก"
}

${
  hasCharacter
    ? `
      &nbsp; • &nbsp;
      เลือกตัวเดิมสูงสุด:
      ${Number(
        item.max_same_character || 1
      )}
    `
    : ""
}

&nbsp; • &nbsp;

Characters:

${characters.length}

&nbsp; • &nbsp;

${renderGiftStatusBadge(
  item.active
)}

</div>

</div>

</div>

<div class="gift-tree-actions">

${
  hasCharacter
    ? `

<button
type="button"
class="gift-action-btn gift-add-btn"
onclick="
openCreateGiftCharacter(
  '${escapeJsString(
    giftItemId
  )}'
)
"
>
＋ Character
</button>

`
    : ""
}

<button
type="button"
class="gift-action-btn gift-edit-btn"
onclick="
openEditGiftItem(
  '${escapeJsString(
    giftItemId
  )}'
)
"
>
✏️ แก้ไข
</button>

<button
type="button"
class="gift-action-btn gift-delete-btn"
onclick="
requestDeleteGiftItem(
  '${escapeJsString(
    giftItemId
  )}'
)
"
>
🗑️ ลบ
</button>

</div>

</div>

<div
id="${escapeHtml(
  createGiftChildrenId(
    nodeKey
  )
)}"
class="gift-tree-children ${
  isOpen
    ? ""
    : "hidden"
}"
>

${
  !hasCharacter
    ? renderGiftEmptyChild(
        "Gift Item นี้ไม่มีตัวเลือกตัวละคร"
      )
    : characters.length
      ? characters
          .map(
            character =>
              renderGiftCharacterNode(
                character
              )
          )
          .join("")
      : renderGiftEmptyChild(
          "ยังไม่มี Character ใน Gift Item นี้"
        )
}

</div>

</div>

`;

}


function renderGiftCharacterNode(
  character
){

  const characterId =
    String(
      character.character_id || ""
    );

  return `

<div
class="
gift-tree-node
gift-character-node
"
>

<div class="gift-tree-header">

<div class="gift-tree-title">

<div>

<div class="gift-tree-title-text">

👤

${escapeHtml(
  character.character_name ||
  "ไม่มีชื่อตัวละคร"
)}

</div>

<div class="gift-node-meta">

${renderGiftStatusBadge(
  character.active
)}

</div>

</div>

</div>

<div class="gift-tree-actions">

<button
type="button"
class="gift-action-btn gift-edit-btn"
onclick="
openEditGiftCharacter(
  '${escapeJsString(
    characterId
  )}'
)
"
>
✏️ แก้ไข
</button>

<button
type="button"
class="gift-action-btn gift-delete-btn"
onclick="
requestDeleteGiftCharacter(
  '${escapeJsString(
    characterId
  )}'
)
"
>
🗑️ ลบ
</button>

</div>

</div>

</div>

`;

}


/*
=========================================
TREE TOGGLE
=========================================
*/

function toggleGiftAdminNode(
  nodeKey
){

  const normalizedKey =
    String(
      nodeKey || ""
    );

  if(
    adminGiftOpenNodes.has(
      normalizedKey
    )
  ){

    adminGiftOpenNodes.delete(
      normalizedKey
    );

  }
  else{

    adminGiftOpenNodes.add(
      normalizedKey
    );

  }

  renderGiftCampaignTree();

}


function createGiftNodeKey(
  type,
  id
){

  return (
    String(type || "") +
    ":" +
    String(id || "")
  );

}


function createGiftChildrenId(
  nodeKey
){

  return (
    "gift_children_" +
    String(
      nodeKey || ""
    )
      .replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      )
  );

}


/*
=========================================
TREE HELPERS
=========================================
*/

function sortGiftAdminRows(
  rows,
  nameField
){

  return [
    ...(Array.isArray(rows)
      ? rows
      : [])
  ].sort(
    (
      a,
      b
    ) => {

      const sortA =
        Number(
          a.sort_order
        ) || 0;

      const sortB =
        Number(
          b.sort_order
        ) || 0;

      if(sortA !== sortB){

        return sortA - sortB;

      }

      return String(
        a[nameField] || ""
      ).localeCompare(

        String(
          b[nameField] || ""
        ),

        "th"

      );

    }
  );

}


function getGiftAdminCollectionName(
  collectionId
){

  const collection =
    Array.isArray(
      adminCollections
    )
      ? adminCollections.find(
          item =>

            String(
              item.collection_id ||
              ""
            ) ===
            String(
              collectionId ||
              ""
            )

        )
      : null;

  return collection
    ? collection.name || ""
    : "";

}


function normalizeGiftAdminYes(
  value
){

  const normalized =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  return (
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "1"
  );

}


function renderGiftStatusBadge(
  active
){

  const isActive =
    normalizeGiftAdminYes(
      active
    );

  return `

<span
class="
gift-status
${
  isActive
    ? "gift-status-active"
    : "gift-status-inactive"
}
"
>

${
  isActive
    ? "เปิดใช้งาน"
    : "ปิดใช้งาน"
}

</span>

`;

}


function formatGiftAdminMoney(
  value
){

  const number =
    Number(value);

  if(
    !Number.isFinite(
      number
    )
  ){

    return "0";

  }

  return number.toLocaleString(
    "th-TH",
    {
      minimumFractionDigits:0,
      maximumFractionDigits:2
    }
  );

}


function renderGiftEmptyChild(
  message
){

  return `

<div class="gift-empty">

${escapeHtml(
  message || "ยังไม่มีข้อมูล"
)}

</div>

`;

}

/*
=========================================
GIFT MODAL
=========================================
*/

function openGiftModal(
  mode,
  action,
  recordId = "",
  parentId = ""
){

  const modal =
    document.getElementById(
      "giftModal"
    );

  const modalBody =
    document.getElementById(
      "giftModalBody"
    );

  const modalTitle =
    document.getElementById(
      "giftModalTitle"
    );

  const saveButton =
    document.getElementById(
      "giftModalSaveBtn"
    );

  const loading =
    document.getElementById(
      "giftModalLoading"
    );

  if(
    !modal ||
    !modalBody ||
    !modalTitle ||
    !saveButton
  ){

    alert(
      "ไม่พบ Gift Modal ใน admin.html"
    );

    return;

  }

  adminGiftModalMode =
    String(
      mode || ""
    );

  adminGiftModalAction =
    String(
      action || "create"
    );

  adminGiftModalRecordId =
    String(
      recordId || ""
    );

  adminGiftModalParentId =
    String(
      parentId || ""
    );

  if(loading){

    loading.style.display =
      "none";

  }

  saveButton.disabled =
    false;

  saveButton.textContent =
    "💾 บันทึก";

  if(
    adminGiftModalMode ===
    "campaign"
  ){

    renderGiftCampaignForm();

  }
  else{

    modalTitle.textContent =
      "🎁 Gift Manager";

    modalBody.innerHTML = `

<div class="gift-error full">

ยังไม่รองรับ Modal ประเภทนี้

</div>

`;

  }

  modal.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";

}


function closeGiftModal(){

  const modal =
    document.getElementById(
      "giftModal"
    );

  const modalBody =
    document.getElementById(
      "giftModalBody"
    );

  const loading =
    document.getElementById(
      "giftModalLoading"
    );

  if(modal){

    modal.classList.add(
      "hidden"
    );

  }

  if(modalBody){

    modalBody.innerHTML =
      "";

  }

  if(loading){

    loading.style.display =
      "none";

  }

  adminGiftModalMode = "";

  adminGiftModalAction = "";

  adminGiftModalRecordId = "";

  adminGiftModalParentId = "";

  document.body.style.overflow =
    "";

}


function handleGiftModalBackdrop(
  event
){

  if(
    event.target &&
    event.target.id ===
    "giftModal"
  ){

    closeGiftModal();

  }

}


function submitGiftModal(){

  if(
    adminGiftModalMode ===
    "campaign"
  ){

    submitGiftCampaign();

    return;

  }

  alert(
    "ยังไม่รองรับการบันทึกข้อมูลประเภทนี้"
  );

}


/*
=========================================
CAMPAIGN FORM
=========================================
*/

function renderGiftCampaignForm(){

  const modalTitle =
    document.getElementById(
      "giftModalTitle"
    );

  const modalBody =
    document.getElementById(
      "giftModalBody"
    );

  if(
    !modalTitle ||
    !modalBody
  ){

    return;

  }

  const isEdit =
    adminGiftModalAction ===
    "edit";

  let campaign = null;

  if(isEdit){

    campaign =
      adminGiftCampaigns.find(
        item =>

          String(
            item.campaign_id || ""
          ) ===
          String(
            adminGiftModalRecordId || ""
          )
      );

    if(!campaign){

      modalTitle.textContent =
        "✏️ แก้ไข Campaign";

      modalBody.innerHTML = `

<div class="gift-error full">

ไม่พบข้อมูล Campaign ที่ต้องการแก้ไข

</div>

`;

      return;

    }

  }

  modalTitle.textContent =
    isEdit
      ? "✏️ แก้ไข Campaign"
      : "＋ เพิ่ม Campaign";

  const campaignName =
    campaign
      ? campaign.campaign_name || ""
      : "";

  const collectionId =
    campaign
      ? campaign.collection_id || ""
      : "";

  const description =
    campaign
      ? campaign.description || ""
      : "";

  const bannerImage =
    campaign
      ? campaign.banner_image || ""
      : "";

  const sortOrder =
    campaign
      ? Number(
          campaign.sort_order
        ) || 0
      : 0;

  const isActive =
    campaign
      ? normalizeGiftAdminYes(
          campaign.active
        )
      : true;

  modalBody.innerHTML = `

<input
type="hidden"
id="giftCampaignId"
value="${escapeHtml(
  campaign
    ? campaign.campaign_id || ""
    : ""
)}"
>


<div class="full">

<label for="giftCampaignName">

ชื่อ Campaign
<span style="color:#ef4444;">
*
</span>

</label>

<br><br>

<input
type="text"
id="giftCampaignName"
value="${escapeHtml(
  campaignName
)}"
placeholder="เช่น ของแถมรอบพรีออเดอร์ WuWa 3.3"
>

</div>


<div>

<label for="giftCampaignCollection">

Collection
<span style="color:#ef4444;">
*
</span>

</label>

<br><br>

<select id="giftCampaignCollection">

${renderGiftCampaignCollectionOptions(
  collectionId
)}

</select>

</div>


<div>

<label for="giftCampaignSortOrder">

ลำดับการแสดงผล

</label>

<br><br>

<input
type="number"
id="giftCampaignSortOrder"
value="${sortOrder}"
min="0"
step="1"
>

</div>


<div class="full">

<label for="giftCampaignDescription">

รายละเอียด Campaign

</label>

<br><br>

<textarea
id="giftCampaignDescription"
rows="4"
placeholder="รายละเอียดหรือเงื่อนไขเพิ่มเติม"
>${escapeHtml(
  description
)}</textarea>

</div>


<div class="full">

<label for="giftCampaignBannerFile">

รูป Banner

</label>

<br><br>

<input
type="file"
id="giftCampaignBannerFile"
accept="image/*"
onchange="previewGiftCampaignBanner(event)"
>

<p
style="
margin:7px 0 0;
font-size:13px;
color:#64748b;
"
>

รองรับไฟล์รูปภาพ หากไม่เลือกไฟล์ใหม่ ระบบจะใช้รูปเดิม

</p>

</div>


<div
id="giftCampaignBannerPreviewBox"
class="full"
style="
${
  bannerImage
    ? ""
    : "display:none;"
}
"
>

<label>
ตัวอย่าง Banner
</label>

<br><br>

<img
id="giftCampaignBannerPreview"
src="${escapeHtml(
  bannerImage
)}"
alt="Campaign Banner Preview"
style="
width:100%;
max-height:280px;
object-fit:contain;
background:#f1f5f9;
border:1px solid #e2e8f0;
border-radius:14px;
"
>

</div>


<div>

<label for="giftCampaignActive">

สถานะ

</label>

<br><br>

<select id="giftCampaignActive">

<option
value="yes"
${isActive ? "selected" : ""}
>
เปิดใช้งาน
</option>

<option
value=""
${!isActive ? "selected" : ""}
>
ปิดใช้งาน
</option>

</select>

</div>


<div>

<label>
Campaign ID
</label>

<br><br>

<input
type="text"
value="${escapeHtml(
  campaign
    ? campaign.campaign_id || ""
    : "สร้างอัตโนมัติเมื่อบันทึก"
)}"
disabled
>

</div>

`;

  window.setTimeout(
    () => {

      const nameInput =
        document.getElementById(
          "giftCampaignName"
        );

      if(nameInput){

        nameInput.focus();

      }

    },
    50
  );

}

function previewGiftCampaignBanner(
  event
){

  const file =
    event &&
    event.target &&
    event.target.files
      ? event.target.files[0]
      : null;

  const previewBox =
    document.getElementById(
      "giftCampaignBannerPreviewBox"
    );

  const previewImage =
    document.getElementById(
      "giftCampaignBannerPreview"
    );

  if(
    !previewBox ||
    !previewImage
  ){

    return;

  }

  if(!file){

    previewImage.removeAttribute(
      "src"
    );

    previewBox.style.display =
      "none";

    return;

  }

  if(
    !String(
      file.type || ""
    ).startsWith(
      "image/"
    )
  ){

    alert(
      "กรุณาเลือกไฟล์รูปภาพเท่านั้น"
    );

    event.target.value = "";

    previewImage.removeAttribute(
      "src"
    );

    previewBox.style.display =
      "none";

    return;

  }

  const reader =
    new FileReader();

  reader.onload =
    loadEvent => {

      previewImage.src =
        loadEvent.target.result;

      previewBox.style.display =
        "block";

    };

  reader.onerror =
    () => {

      alert(
        "ไม่สามารถอ่านไฟล์รูปภาพได้"
      );

      event.target.value = "";

    };

  reader.readAsDataURL(
    file
  );

}

function renderGiftCampaignCollectionOptions(
  selectedCollectionId = ""
){

  const selectedId =
    String(
      selectedCollectionId || ""
    );

  const collections =
    Array.isArray(
      adminCollections
    )
      ? [...adminCollections]
      : [];

  collections.sort(
    (
      a,
      b
    ) =>

      String(
        a.name || ""
      ).localeCompare(
        String(
          b.name || ""
        ),
        "th"
      )
  );

  let html = `

<option value="">
-- เลือก Collection --
</option>

`;

  collections.forEach(
    collection => {

      const collectionId =
        String(
          collection.collection_id ||
          ""
        );

      const collectionName =
        collection.name ||
        collectionId ||
        "ไม่มีชื่อ Collection";

      html += `

<option
value="${escapeHtml(
  collectionId
)}"
${
  collectionId === selectedId
    ? " selected"
    : ""
}
>

${escapeHtml(
  collectionName
)}

</option>

`;

    }
  );

  return html;

}


/*
=========================================
CAMPAIGN TEMPORARY SUBMIT
API WILL BE CONNECTED NEXT
=========================================
*/

async function submitGiftCampaign(){

  const campaignIdInput =
    document.getElementById(
      "giftCampaignId"
    );

  const campaignNameInput =
    document.getElementById(
      "giftCampaignName"
    );

  const collectionInput =
    document.getElementById(
      "giftCampaignCollection"
    );

  const descriptionInput =
    document.getElementById(
      "giftCampaignDescription"
    );

  const sortOrderInput =
    document.getElementById(
      "giftCampaignSortOrder"
    );

  const activeInput =
    document.getElementById(
      "giftCampaignActive"
    );

  const bannerFileInput =
    document.getElementById(
      "giftCampaignBannerFile"
    );

  const saveButton =
    document.getElementById(
      "giftModalSaveBtn"
    );

  const loading =
    document.getElementById(
      "giftModalLoading"
    );

  const payload = {

    campaign_id:
      campaignIdInput
        ? campaignIdInput.value.trim()
        : "",

    campaign_name:
      campaignNameInput
        ? campaignNameInput.value.trim()
        : "",

    collection_id:
      collectionInput
        ? collectionInput.value.trim()
        : "",

    description:
      descriptionInput
        ? descriptionInput.value
        : "",

    sort_order:
      sortOrderInput
        ? Math.max(
            0,
            Number(
              sortOrderInput.value || 0
            )
          )
        : 0,

    active:
      activeInput
        ? activeInput.value
        : ""

  };

  if(
    !payload.campaign_name
  ){

    alert(
      "กรุณากรอกชื่อ Campaign"
    );

    if(campaignNameInput){

      campaignNameInput.focus();

    }

    return;

  }

  if(
    !payload.collection_id
  ){

    alert(
      "กรุณาเลือก Collection"
    );

    if(collectionInput){

      collectionInput.focus();

    }

    return;

  }

  const bannerFile =
    bannerFileInput &&
    bannerFileInput.files
      ? bannerFileInput.files[0]
      : null;

  if(
    bannerFile &&
    !String(
      bannerFile.type || ""
    ).startsWith(
      "image/"
    )
  ){

    alert(
      "กรุณาเลือกไฟล์รูปภาพเท่านั้น"
    );

    return;

  }

  if(saveButton){

    saveButton.disabled =
      true;

    saveButton.textContent =
      "กำลังบันทึก...";

  }

  if(loading){

    loading.style.display =
      "block";

    loading.textContent =
      bannerFile
        ? "⏳ กำลังอัปโหลดรูปและบันทึก..."
        : "⏳ กำลังบันทึก...";

  }

  try{

    if(bannerFile){

      payload.banner_image_base64 =
        await fileToBase64(
          bannerFile
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

    if(!response.ok){

      throw new Error(
        "HTTP " +
        response.status
      );

    }

    const result =
      await response.json();

    if(!result.success){

      throw new Error(
        result.error ||
        "บันทึก Campaign ไม่สำเร็จ"
      );

    }

    alert(
      payload.campaign_id
        ? "แก้ไข Campaign เรียบร้อยแล้ว"
        : "เพิ่ม Campaign เรียบร้อยแล้ว"
    );

    closeGiftModal();

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "submitGiftCampaign error:",
      error
    );

    alert(
      error.message ||
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }finally{

    const currentSaveButton =
      document.getElementById(
        "giftModalSaveBtn"
      );

    const currentLoading =
      document.getElementById(
        "giftModalLoading"
      );

    if(currentSaveButton){

      currentSaveButton.disabled =
        false;

      currentSaveButton.textContent =
        "💾 บันทึก";

    }

    if(currentLoading){

      currentLoading.style.display =
        "none";

      currentLoading.textContent =
        "⏳ กำลังบันทึก...";

    }

  }

}


/*
=========================================
CAMPAIGN ACTIONS
=========================================
*/

function openCreateGiftCampaign(){

  openGiftModal(
    "campaign",
    "create"
  );

}


function openEditGiftCampaign(
  campaignId
){

  openGiftModal(
    "campaign",
    "edit",
    campaignId
  );

}


function requestDeleteGiftCampaign(
  campaignId
){

  alert(
    "ลบ Campaign: " +
    campaignId
  );

}


/*
=========================================
RULE PLACEHOLDER ACTIONS
=========================================
*/

function openCreateGiftRule(
  campaignId
){

  alert(
    "เพิ่ม Rule ใน Campaign: " +
    campaignId
  );

}


function openEditGiftRule(
  ruleId
){

  alert(
    "แก้ไข Rule: " +
    ruleId
  );

}


function requestDeleteGiftRule(
  ruleId
){

  alert(
    "ลบ Rule: " +
    ruleId
  );

}


/*
=========================================
GIFT ITEM PLACEHOLDER ACTIONS
=========================================
*/

function openCreateGiftItem(
  ruleId
){

  alert(
    "เพิ่ม Gift Item ใน Rule: " +
    ruleId
  );

}


function openEditGiftItem(
  giftItemId
){

  alert(
    "แก้ไข Gift Item: " +
    giftItemId
  );

}


function requestDeleteGiftItem(
  giftItemId
){

  alert(
    "ลบ Gift Item: " +
    giftItemId
  );

}


/*
=========================================
CHARACTER PLACEHOLDER ACTIONS
=========================================
*/

function openCreateGiftCharacter(
  giftItemId
){

  alert(
    "เพิ่ม Character ใน Gift Item: " +
    giftItemId
  );

}


function openEditGiftCharacter(
  characterId
){

  alert(
    "แก้ไข Character: " +
    characterId
  );

}


function requestDeleteGiftCharacter(
  characterId
){

  alert(
    "ลบ Character: " +
    characterId
  );

}


/*
=========================================
ESC CLOSE MODAL
=========================================
*/

document.addEventListener(
  "keydown",
  event => {

    if(
      event.key !==
      "Escape"
    ){

      return;

    }

    const modal =
      document.getElementById(
        "giftModal"
      );

    if(
      modal &&
      !modal.classList.contains(
        "hidden"
      )
    ){

      closeGiftModal();

    }

  }
);
