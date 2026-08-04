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
let adminGiftCampaignExclusions = [];

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
      characterResult,
      exclusionResult
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
        ),

        fetchGiftAdminAction(
          "getGiftCampaignExclusions"
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

    adminGiftCampaignExclusions =
      Array.isArray(
        exclusionResult.exclusions
      )
        ? exclusionResult.exclusions
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
        adminGiftCharacters,

      exclusions:
        adminGiftCampaignExclusions

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
    adminGiftCampaignExclusions = [];

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


async function postGiftAdminAction(
  action,
  payload = {}
){

  const formData =
    new FormData();

  formData.append(
    "action",
    String(
      action || ""
    )
  );

  formData.append(
    "payload",
    JSON.stringify(
      payload || {}
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

  const eligibilityScope =
    String(
      campaign.eligibility_scope || ""
    ) === "fandom_all"
      ? "Fandom ทั้งหมด"
      : "Collection นี้";

  const requireCampaignItem =
    normalizeGiftAdminYes(
      campaign.require_campaign_item
    );

  const exclusions =
    getGiftCampaignExclusions(
      campaignId
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

Collection :

${escapeHtml(
collectionName ||
campaign.collection_id ||
"-"
)}

<br>

Eligibility :

<b>${eligibilityScope}</b>

${
requireCampaignItem
? `
&nbsp; • &nbsp;

ต้องมีสินค้าใน Campaign
`
: `
&nbsp; • &nbsp;

ไม่บังคับ
`
}

<br>

Exclusions :

${exclusions.length}

&nbsp; • &nbsp;

Rules :

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
openCampaignExclusions(
'${escapeJsString(
campaignId
)}'
)
"
>
🚫 Exclusions
</button>

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


function getGiftCampaignExclusions(
  campaignId
){

  const normalizedCampaignId =
    String(
      campaignId || ""
    );

  return adminGiftCampaignExclusions.filter(
    exclusion =>

      String(
        exclusion.campaign_id || ""
      ) ===
      normalizedCampaignId
  );

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

    loading.textContent =
      "⏳ กำลังบันทึก...";

  }

  saveButton.disabled =
    false;

  saveButton.style.display =
    "";

  saveButton.textContent =
    "💾 บันทึก";

  if(
    adminGiftModalMode ===
    "campaign"
  ){

    renderGiftCampaignForm();

  }
  else if(
    adminGiftModalMode ===
    "rule"
  ){

    renderGiftRuleForm();

  }
  else if(
    adminGiftModalMode ===
    "item"
  ){

    renderGiftItemForm();

  }
  else if(
    adminGiftModalMode ===
    "character"
  ){

    renderGiftCharacterForm();

  }
  else if(
    adminGiftModalMode ===
    "exclusions"
  ){

    saveButton.style.display =
      "none";

    renderGiftCampaignExclusionsForm();

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

  const saveButton =
    document.getElementById(
      "giftModalSaveBtn"
    );

  if(saveButton){

    saveButton.style.display =
      "";

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

  if(
    adminGiftModalMode ===
    "rule"
  ){

    submitGiftRule();

    return;

  }

  if(
    adminGiftModalMode ===
    "item"
  ){

    submitGiftItem();

    return;

  }

  if(
    adminGiftModalMode ===
    "character"
  ){

    submitGiftCharacter();

    return;

  }

  alert(
    "ยังไม่รองรับการบันทึกข้อมูลประเภทนี้"
  );

}

async function submitGiftRule(){

  const ruleIdInput =
    document.getElementById(
      "giftRuleId"
    );

  const campaignIdInput =
    document.getElementById(
      "giftRuleCampaignId"
    );

  const ruleNameInput =
    document.getElementById(
      "giftRuleName"
    );

  const minAmountInput =
    document.getElementById(
      "giftRuleMinAmount"
    );

  const maxSelectInput =
    document.getElementById(
      "giftRuleMaxSelect"
    );

  const allowDuplicateInput =
    document.getElementById(
      "giftRuleAllowDuplicate"
    );

  const activeInput =
    document.getElementById(
      "giftRuleActive"
    );

  const sortOrderInput =
    document.getElementById(
      "giftRuleSortOrder"
    );

  const rewardModeInput =
    document.getElementById(
      "giftRuleRewardMode"
    );

  const rewardDescriptionInput =
    document.getElementById(
      "giftRuleRewardDescription"
    );

  const saveButton =
    document.getElementById(
      "giftModalSaveBtn"
    );

  const loading =
    document.getElementById(
      "giftModalLoading"
    );

  const rewardMode =
    normalizeAdminGiftRewardMode(
      rewardModeInput
        ? rewardModeInput.value
        : "normal"
    );

  const rewards = [];

  if(rewardMode === "custom"){

    document
      .querySelectorAll(
        "[data-gift-reward-rule]"
      )
      .forEach(
        (
          row,
          index
        ) => {

          const checkbox =
            row.querySelector(
              "[data-gift-reward-enabled]"
            );

          const quantityInput =
            row.querySelector(
              "[data-gift-reward-quantity]"
            );

          if(
            !checkbox ||
            !checkbox.checked
          ){

            return;

          }

          const sourceRuleId =
            String(
              row.dataset.giftRewardRule ||
              ""
            ).trim();

          const quantity =
            Number(
              quantityInput
                ? quantityInput.value
                : 0
            );

          rewards.push({

            source_rule_id:
              sourceRuleId,

            quantity:
              quantity,

            active:
              "yes",

            sort_order:
              index

          });

        }
      );

  }

  const payload = {

    rule_id:
      ruleIdInput
        ? ruleIdInput.value.trim()
        : "",

    campaign_id:
      campaignIdInput
        ? campaignIdInput.value.trim()
        : "",

    rule_name:
      ruleNameInput
        ? ruleNameInput.value.trim()
        : "",

    min_amount:
      minAmountInput
        ? Number(
            minAmountInput.value
          )
        : 0,

    max_select:
      maxSelectInput
        ? Number(
            maxSelectInput.value
          )
        : 1,

    allow_duplicate:
      allowDuplicateInput
        ? allowDuplicateInput.value
        : "",

    reward_mode:
      rewardMode,

    reward_description:
      rewardDescriptionInput
        ? rewardDescriptionInput.value.trim()
        : "",

    rewards:
      rewards,

    active:
      activeInput
        ? activeInput.value
        : "",

    sort_order:
      sortOrderInput
        ? Number(
            sortOrderInput.value
          )
        : 0

  };

  if(!payload.campaign_id){

    alert(
      "ไม่พบ Campaign สำหรับ Rule นี้"
    );

    return;

  }

  if(!payload.rule_name){

    alert(
      "กรุณากรอกชื่อ Rule"
    );

    ruleNameInput?.focus();

    return;

  }

  if(
    !Number.isFinite(
      payload.min_amount
    ) ||
    payload.min_amount < 0
  ){

    alert(
      "ยอดขั้นต่ำต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"
    );

    minAmountInput?.focus();

    return;

  }

  if(
    !Number.isInteger(
      payload.max_select
    ) ||
    payload.max_select < 1
  ){

    alert(
      "จำนวนของแถมเทียร์นี้ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    );

    maxSelectInput?.focus();

    return;

  }

  if(
    payload.reward_mode === "custom" &&
    payload.rewards.length === 0
  ){

    alert(
      "กรุณาเลือกเทียร์ก่อนหน้าอย่างน้อย 1 เทียร์"
    );

    return;

  }

  const invalidReward =
    payload.rewards.find(
      reward =>

        !reward.source_rule_id ||
        !Number.isInteger(
          reward.quantity
        ) ||
        reward.quantity < 1
    );

  if(invalidReward){

    alert(
      "จำนวนของแถมจากแต่ละเทียร์ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    );

    return;

  }

  if(
    !Number.isFinite(
      payload.sort_order
    ) ||
    payload.sort_order < 0
  ){

    payload.sort_order = 0;

  }else{

    payload.sort_order =
      Math.floor(
        payload.sort_order
      );

  }

  if(saveButton){

    saveButton.disabled = true;
    saveButton.textContent =
      "กำลังบันทึก...";

  }

  if(loading){

    loading.style.display =
      "block";

    loading.textContent =
      "⏳ กำลังบันทึก Rule...";

  }

  try{

    const formData =
      new FormData();

    /*
    จุดสำคัญ:
    ถ้ามี rule_id ต้องใช้ updateGiftRule
    */

    formData.append(
      "action",
      payload.rule_id
        ? "updateGiftRule"
        : "saveGiftRule"
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
        result.message ||
        "บันทึก Rule ไม่สำเร็จ"
      );

    }

    adminGiftOpenNodes.add(
      createGiftNodeKey(
        "campaign",
        payload.campaign_id
      )
    );

    alert(
      payload.rule_id
        ? "แก้ไข Rule เรียบร้อยแล้ว"
        : "เพิ่ม Rule เรียบร้อยแล้ว"
    );

    closeGiftModal();

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "submitGiftRule error:",
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
GIFT ITEM FORM
=========================================
*/

function renderGiftItemForm(){

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

  let item = null;

  if(isEdit){

    item =
      adminGiftItems.find(
        row =>

          String(
            row.gift_item_id || ""
          ) ===
          String(
            adminGiftModalRecordId || ""
          )
      );

    if(!item){

      modalTitle.textContent =
        "✏️ แก้ไข Gift Item";

      modalBody.innerHTML = `

<div class="gift-error full">
ไม่พบข้อมูล Gift Item ที่ต้องการแก้ไข
</div>

`;

      return;

    }

  }

  const ruleId =
    isEdit
      ? String(
          item.rule_id || ""
        )
      : String(
          adminGiftModalParentId || ""
        );

  const rule =
    adminGiftRules.find(
      row =>

        String(
          row.rule_id || ""
        ) ===
        ruleId
    );

  if(!rule){

    modalTitle.textContent =
      isEdit
        ? "✏️ แก้ไข Gift Item"
        : "＋ เพิ่ม Gift Item";

    modalBody.innerHTML = `

<div class="gift-error full">
ไม่พบ Rule สำหรับ Gift Item นี้
</div>

`;

    return;

  }

  const giftName =
    item
      ? item.gift_name || ""
      : "";

  const giftImage =
    item
      ? item.gift_image || ""
      : "";

  const hasCharacter =
    item
      ? normalizeGiftAdminYes(
          item.has_character
        )
      : false;

  const maxSameCharacter =
    item &&
    hasCharacter
      ? Math.max(
          1,
          Number(
            item.max_same_character
          ) || 1
        )
      : 1;

  const sortOrder =
    item
      ? Math.max(
          0,
          Number(
            item.sort_order
          ) || 0
        )
      : 0;

  const isActive =
    item
      ? normalizeGiftAdminYes(
          item.active
        )
      : true;

  modalTitle.textContent =
    isEdit
      ? "✏️ แก้ไข Gift Item"
      : "＋ เพิ่ม Gift Item";

  modalBody.innerHTML = `

<input
  type="hidden"
  id="giftItemId"
  value="${escapeHtml(
    item
      ? item.gift_item_id || ""
      : ""
  )}"
>

<input
  type="hidden"
  id="giftItemRuleId"
  value="${escapeHtml(
    ruleId
  )}"
>

<div class="full">

<label>
Rule
</label>

<br><br>

<input
  type="text"
  value="${escapeHtml(
    rule.rule_name ||
    ruleId
  )}"
  disabled
>

</div>

<div class="full">

<label for="giftItemName">
ชื่อ Gift Item
<span style="color:#ef4444;">*</span>
</label>

<br><br>

<input
  type="text"
  id="giftItemName"
  value="${escapeHtml(
    giftName
  )}"
  placeholder="เช่น โปสการ์ดสุ่ม 1 ใบ"
>

</div>

<div class="full">

<label for="giftItemImage">
ลิงก์รูปของแถม
</label>

<br><br>

<input
  type="url"
  id="giftItemImage"
  value="${escapeHtml(
    giftImage
  )}"
  placeholder="https://..."
  oninput="previewGiftItemImage()"
>

</div>

<div
  id="giftItemImagePreviewBox"
  class="full"
  style="${
    giftImage
      ? ""
      : "display:none;"
  }"
>

<label>
ตัวอย่างรูป
</label>

<br><br>

<img
  id="giftItemImagePreview"
  src="${escapeHtml(
    giftImage
  )}"
  alt="Gift Item Preview"
  style="
    width:100%;
    max-height:280px;
    object-fit:contain;
    background:#f1f5f9;
    border:1px solid #e2e8f0;
    border-radius:14px;
  "
  onerror="this.closest('#giftItemImagePreviewBox').style.display='none'"
>

</div>

<div
  class="full"
  style="
    border:1px solid #dbeafe;
    background:#f8fbff;
    border-radius:14px;
    padding:16px;
  "
>

<label
  style="
    display:flex;
    align-items:flex-start;
    gap:10px;
    cursor:pointer;
  "
>

<input
  type="checkbox"
  id="giftItemHasCharacter"
  ${hasCharacter ? "checked" : ""}
  style="width:auto;margin-top:3px;"
  onchange="toggleGiftItemCharacterFields()"
>

<span>

<strong>
มีตัวเลือกตัวละคร
</strong>

<br>

<span
  style="font-size:13px;color:#64748b;"
>
เปิดใช้เมื่อของแถมชิ้นนี้ให้ลูกค้าเลือกตัวละคร
</span>

</span>

</label>

</div>

<div
  id="giftItemMaxSameCharacterBox"
  class="full"
  style="${
    hasCharacter
      ? ""
      : "display:none;"
  }"
>

<label for="giftItemMaxSameCharacter">
เลือกตัวละครเดิมได้สูงสุด
<span style="color:#ef4444;">*</span>
</label>

<br><br>

<input
  type="number"
  id="giftItemMaxSameCharacter"
  value="${maxSameCharacter}"
  min="1"
  step="1"
>

</div>

<div>

<label for="giftItemSortOrder">
ลำดับการแสดงผล
</label>

<br><br>

<input
  type="number"
  id="giftItemSortOrder"
  value="${sortOrder}"
  min="0"
  step="1"
>

</div>

<div>

<label for="giftItemActive">
สถานะ
</label>

<br><br>

<select id="giftItemActive">

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

<div class="full">

<label>
Gift Item ID
</label>

<br><br>

<input
  type="text"
  value="${escapeHtml(
    item
      ? item.gift_item_id || ""
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
          "giftItemName"
        );

      if(nameInput){

        nameInput.focus();

      }

    },
    50
  );

}


function toggleGiftItemCharacterFields(){

  const checkbox =
    document.getElementById(
      "giftItemHasCharacter"
    );

  const box =
    document.getElementById(
      "giftItemMaxSameCharacterBox"
    );

  if(!box){

    return;

  }

  box.style.display =
    checkbox && checkbox.checked
      ? ""
      : "none";

}


function previewGiftItemImage(){

  const input =
    document.getElementById(
      "giftItemImage"
    );

  const box =
    document.getElementById(
      "giftItemImagePreviewBox"
    );

  const image =
    document.getElementById(
      "giftItemImagePreview"
    );

  if(
    !input ||
    !box ||
    !image
  ){

    return;

  }

  const url =
    input.value.trim();

  if(!url){

    image.removeAttribute(
      "src"
    );

    box.style.display =
      "none";

    return;

  }

  image.src = url;

  box.style.display =
    "";

}


async function submitGiftItem(){

  const giftItemIdInput =
    document.getElementById(
      "giftItemId"
    );

  const ruleIdInput =
    document.getElementById(
      "giftItemRuleId"
    );

  const nameInput =
    document.getElementById(
      "giftItemName"
    );

  const imageInput =
    document.getElementById(
      "giftItemImage"
    );

  const hasCharacterInput =
    document.getElementById(
      "giftItemHasCharacter"
    );

  const maxSameCharacterInput =
    document.getElementById(
      "giftItemMaxSameCharacter"
    );

  const sortOrderInput =
    document.getElementById(
      "giftItemSortOrder"
    );

  const activeInput =
    document.getElementById(
      "giftItemActive"
    );

  const saveButton =
    document.getElementById(
      "giftModalSaveBtn"
    );

  const loading =
    document.getElementById(
      "giftModalLoading"
    );

  const hasCharacter =
    Boolean(
      hasCharacterInput &&
      hasCharacterInput.checked
    );

  const payload = {

    gift_item_id:
      giftItemIdInput
        ? giftItemIdInput.value.trim()
        : "",

    rule_id:
      ruleIdInput
        ? ruleIdInput.value.trim()
        : "",

    gift_name:
      nameInput
        ? nameInput.value.trim()
        : "",

    gift_image:
      imageInput
        ? imageInput.value.trim()
        : "",

    has_character:
      hasCharacter
        ? "yes"
        : "",

    max_same_character:
      hasCharacter &&
      maxSameCharacterInput
        ? Number(
            maxSameCharacterInput.value
          )
        : 0,

    active:
      activeInput
        ? activeInput.value
        : "",

    sort_order:
      sortOrderInput
        ? Number(
            sortOrderInput.value
          )
        : 0

  };

  if(!payload.rule_id){

    alert(
      "ไม่พบ Rule สำหรับ Gift Item นี้"
    );

    return;

  }

  if(!payload.gift_name){

    alert(
      "กรุณากรอกชื่อ Gift Item"
    );

    if(nameInput){

      nameInput.focus();

    }

    return;

  }

  if(
    payload.gift_image &&
    !/^https?:\/\//i.test(
      payload.gift_image
    )
  ){

    alert(
      "ลิงก์รูปต้องขึ้นต้นด้วย http:// หรือ https://"
    );

    if(imageInput){

      imageInput.focus();

    }

    return;

  }

  if(
    hasCharacter &&
    (
      !Number.isInteger(
        payload.max_same_character
      ) ||
      payload.max_same_character < 1
    )
  ){

    alert(
      "จำนวนตัวละครเดิมสูงสุดต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    );

    if(maxSameCharacterInput){

      maxSameCharacterInput.focus();

    }

    return;

  }

  if(
    !Number.isFinite(
      payload.sort_order
    ) ||
    payload.sort_order < 0
  ){

    payload.sort_order = 0;

  }else{

    payload.sort_order =
      Math.floor(
        payload.sort_order
      );

  }

  if(saveButton){

    saveButton.disabled = true;

    saveButton.textContent =
      "กำลังบันทึก...";

  }

  if(loading){

    loading.style.display =
      "block";

    loading.textContent =
      "⏳ กำลังบันทึก Gift Item...";

  }

  try{

    const action =
      payload.gift_item_id
        ? "updateGiftItem"
        : "saveGiftItem";

    const result =
      await postGiftAdminAction(
        action,
        payload
      );

    const savedItemId =
      String(
        result.gift_item_id ||
        (
          result.gift_item &&
          result.gift_item.gift_item_id
        ) ||
        payload.gift_item_id ||
        ""
      );

    adminGiftOpenNodes.add(
      createGiftNodeKey(
        "rule",
        payload.rule_id
      )
    );

    if(savedItemId){

      adminGiftOpenNodes.add(
        createGiftNodeKey(
          "item",
          savedItemId
        )
      );

    }

    alert(
      payload.gift_item_id
        ? "แก้ไข Gift Item เรียบร้อยแล้ว"
        : "เพิ่ม Gift Item เรียบร้อยแล้ว"
    );

    closeGiftModal();

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "submitGiftItem error:",
      error
    );

    alert(
      error.message ||
      "บันทึก Gift Item ไม่สำเร็จ"
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

    }

  }

}


/*
=========================================
GIFT CHARACTER FORM
=========================================
*/

function renderGiftCharacterForm(){

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

  let character = null;

  if(isEdit){

    character =
      adminGiftCharacters.find(
        row =>

          String(
            row.character_id || ""
          ) ===
          String(
            adminGiftModalRecordId || ""
          )
      );

    if(!character){

      modalTitle.textContent =
        "✏️ แก้ไข Character";

      modalBody.innerHTML = `

<div class="gift-error full">
ไม่พบข้อมูล Character ที่ต้องการแก้ไข
</div>

`;

      return;

    }

  }

  const giftItemId =
    isEdit
      ? String(
          character.gift_item_id || ""
        )
      : String(
          adminGiftModalParentId || ""
        );

  const item =
    adminGiftItems.find(
      row =>

        String(
          row.gift_item_id || ""
        ) ===
        giftItemId
    );

  if(!item){

    modalTitle.textContent =
      isEdit
        ? "✏️ แก้ไข Character"
        : "＋ เพิ่ม Character";

    modalBody.innerHTML = `

<div class="gift-error full">
ไม่พบ Gift Item สำหรับ Character นี้
</div>

`;

    return;

  }

  if(
    !normalizeGiftAdminYes(
      item.has_character
    )
  ){

    modalTitle.textContent =
      isEdit
        ? "✏️ แก้ไข Character"
        : "＋ เพิ่ม Character";

    modalBody.innerHTML = `

<div class="gift-error full">
Gift Item นี้ไม่ได้เปิดใช้งานตัวเลือกตัวละคร
</div>

`;

    return;

  }

  const characterName =
    character
      ? character.character_name || ""
      : "";

  const characterImage =
    character
      ? character.character_image || ""
      : "";

  const sortOrder =
    character
      ? Math.max(
          0,
          Number(
            character.sort_order
          ) || 0
        )
      : 0;

  const isActive =
    character
      ? normalizeGiftAdminYes(
          character.active
        )
      : true;

  modalTitle.textContent =
    isEdit
      ? "✏️ แก้ไข Character"
      : "＋ เพิ่ม Character";

  modalBody.innerHTML = `

<input
  type="hidden"
  id="giftCharacterId"
  value="${escapeHtml(
    character
      ? character.character_id || ""
      : ""
  )}"
>

<input
  type="hidden"
  id="giftCharacterItemId"
  value="${escapeHtml(
    giftItemId
  )}"
>

<div class="full">

<label>
Gift Item
</label>

<br><br>

<input
  type="text"
  value="${escapeHtml(
    item.gift_name ||
    giftItemId
  )}"
  disabled
>

</div>

<div class="full">

<label for="giftCharacterName">
ชื่อตัวละคร
<span style="color:#ef4444;">*</span>
</label>

<br><br>

<input
  type="text"
  id="giftCharacterName"
  value="${escapeHtml(
    characterName
  )}"
  placeholder="เช่น Rover, Jinhsi, Phainon"
>

</div>

<div class="full">

<label for="giftCharacterImage">
ลิงก์รูปตัวละคร
</label>

<br><br>

<input
  type="url"
  id="giftCharacterImage"
  value="${escapeHtml(
    characterImage
  )}"
  placeholder="https://..."
  oninput="previewGiftCharacterImage()"
>

</div>

<div
  id="giftCharacterImagePreviewBox"
  class="full"
  style="${
    characterImage
      ? ""
      : "display:none;"
  }"
>

<label>
ตัวอย่างรูป
</label>

<br><br>

<img
  id="giftCharacterImagePreview"
  src="${escapeHtml(
    characterImage
  )}"
  alt="Character Preview"
  style="
    width:100%;
    max-height:280px;
    object-fit:contain;
    background:#f1f5f9;
    border:1px solid #e2e8f0;
    border-radius:14px;
  "
  onerror="this.closest('#giftCharacterImagePreviewBox').style.display='none'"
>

</div>

<div>

<label for="giftCharacterSortOrder">
ลำดับการแสดงผล
</label>

<br><br>

<input
  type="number"
  id="giftCharacterSortOrder"
  value="${sortOrder}"
  min="0"
  step="1"
>

</div>

<div>

<label for="giftCharacterActive">
สถานะ
</label>

<br><br>

<select id="giftCharacterActive">

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

<div class="full">

<label>
Character ID
</label>

<br><br>

<input
  type="text"
  value="${escapeHtml(
    character
      ? character.character_id || ""
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
          "giftCharacterName"
        );

      if(nameInput){

        nameInput.focus();

      }

    },
    50
  );

}


function previewGiftCharacterImage(){

  const input =
    document.getElementById(
      "giftCharacterImage"
    );

  const box =
    document.getElementById(
      "giftCharacterImagePreviewBox"
    );

  const image =
    document.getElementById(
      "giftCharacterImagePreview"
    );

  if(
    !input ||
    !box ||
    !image
  ){

    return;

  }

  const url =
    input.value.trim();

  if(!url){

    image.removeAttribute(
      "src"
    );

    box.style.display =
      "none";

    return;

  }

  image.src = url;

  box.style.display =
    "";

}


async function submitGiftCharacter(){

  const characterIdInput =
    document.getElementById(
      "giftCharacterId"
    );

  const giftItemIdInput =
    document.getElementById(
      "giftCharacterItemId"
    );

  const nameInput =
    document.getElementById(
      "giftCharacterName"
    );

  const imageInput =
    document.getElementById(
      "giftCharacterImage"
    );

  const sortOrderInput =
    document.getElementById(
      "giftCharacterSortOrder"
    );

  const activeInput =
    document.getElementById(
      "giftCharacterActive"
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

    character_id:
      characterIdInput
        ? characterIdInput.value.trim()
        : "",

    gift_item_id:
      giftItemIdInput
        ? giftItemIdInput.value.trim()
        : "",

    character_name:
      nameInput
        ? nameInput.value.trim()
        : "",

    character_image:
      imageInput
        ? imageInput.value.trim()
        : "",

    active:
      activeInput
        ? activeInput.value
        : "",

    sort_order:
      sortOrderInput
        ? Number(
            sortOrderInput.value
          )
        : 0

  };

  if(!payload.gift_item_id){

    alert(
      "ไม่พบ Gift Item สำหรับ Character นี้"
    );

    return;

  }

  const item =
    adminGiftItems.find(
      row =>

        String(
          row.gift_item_id || ""
        ) ===
        payload.gift_item_id
    );

  if(!item){

    alert(
      "ไม่พบข้อมูล Gift Item"
    );

    return;

  }

  if(
    !normalizeGiftAdminYes(
      item.has_character
    )
  ){

    alert(
      "Gift Item นี้ไม่ได้เปิดใช้งานตัวเลือกตัวละคร"
    );

    return;

  }

  if(!payload.character_name){

    alert(
      "กรุณากรอกชื่อตัวละคร"
    );

    if(nameInput){

      nameInput.focus();

    }

    return;

  }

  if(
    payload.character_image &&
    !/^https?:\/\//i.test(
      payload.character_image
    )
  ){

    alert(
      "ลิงก์รูปต้องขึ้นต้นด้วย http:// หรือ https://"
    );

    if(imageInput){

      imageInput.focus();

    }

    return;

  }

  if(
    !Number.isFinite(
      payload.sort_order
    ) ||
    payload.sort_order < 0
  ){

    payload.sort_order = 0;

  }else{

    payload.sort_order =
      Math.floor(
        payload.sort_order
      );

  }

  if(saveButton){

    saveButton.disabled = true;

    saveButton.textContent =
      "กำลังบันทึก...";

  }

  if(loading){

    loading.style.display =
      "block";

    loading.textContent =
      "⏳ กำลังบันทึก Character...";

  }

  try{

    const action =
      payload.character_id
        ? "updateGiftCharacter"
        : "saveGiftCharacter";

    await postGiftAdminAction(
      action,
      payload
    );

    adminGiftOpenNodes.add(
      createGiftNodeKey(
        "item",
        payload.gift_item_id
      )
    );

    const parentRule =
      adminGiftRules.find(
        rule =>

          String(
            rule.rule_id || ""
          ) ===
          String(
            item.rule_id || ""
          )
      );

    if(item.rule_id){

      adminGiftOpenNodes.add(
        createGiftNodeKey(
          "rule",
          item.rule_id
        )
      );

    }

    if(
      parentRule &&
      parentRule.campaign_id
    ){

      adminGiftOpenNodes.add(
        createGiftNodeKey(
          "campaign",
          parentRule.campaign_id
        )
      );

    }

    alert(
      payload.character_id
        ? "แก้ไข Character เรียบร้อยแล้ว"
        : "เพิ่ม Character เรียบร้อยแล้ว"
    );

    closeGiftModal();

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "submitGiftCharacter error:",
      error
    );

    alert(
      error.message ||
      "บันทึก Character ไม่สำเร็จ"
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

    }

  }

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
      ? Math.max(
          0,
          Number(
            campaign.sort_order
          ) || 0
        )
      : 0;

  const isActive =
    campaign
      ? normalizeGiftAdminYes(
          campaign.active
        )
      : true;

  const eligibilityScope =
    campaign &&
    String(
      campaign.eligibility_scope || ""
    ).trim() ===
    "fandom_all"
      ? "fandom_all"
      : "collection_only";

  const requireCampaignItem =
    campaign
      ? normalizeGiftAdminYes(
          campaign.require_campaign_item
        )
      : false;

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


<div
class="full"
style="
border:1px solid #dbeafe;
background:#f8fbff;
border-radius:14px;
padding:16px;
"
>

<label style="font-weight:700;">

ขอบเขตสินค้าที่นำมาคำนวณของแถม
<span style="color:#ef4444;">
*
</span>

</label>

<div
style="
display:flex;
flex-direction:column;
gap:12px;
margin-top:14px;
"
>

<label
style="
display:flex;
align-items:flex-start;
gap:10px;
cursor:pointer;
"
>

<input
type="radio"
name="giftCampaignEligibilityScope"
value="collection_only"
${eligibilityScope === "collection_only"
  ? "checked"
  : ""
}
style="
width:auto;
margin-top:3px;
"
>

<span>

<strong>
เฉพาะ Collection นี้
</strong>

<br>

<span
style="
font-size:13px;
color:#64748b;
"
>

นับเฉพาะยอดสินค้าที่อยู่ใน Collection ที่เลือก

</span>

</span>

</label>


<label
style="
display:flex;
align-items:flex-start;
gap:10px;
cursor:pointer;
"
>

<input
type="radio"
name="giftCampaignEligibilityScope"
value="fandom_all"
${eligibilityScope === "fandom_all"
  ? "checked"
  : ""
}
style="
width:auto;
margin-top:3px;
"
>

<span>

<strong>
สินค้าทั้งหมดใน Fandom
</strong>

<br>

<span
style="
font-size:13px;
color:#64748b;
"
>

นับยอดสินค้าทุก Collection ที่อยู่ใน Fandom เดียวกัน

</span>

</span>

</label>

</div>

</div>


<div
class="full"
style="
border:1px solid #dbeafe;
background:#f8fbff;
border-radius:14px;
padding:16px;
"
>

<label
style="
display:flex;
align-items:flex-start;
gap:10px;
cursor:pointer;
"
>

<input
type="checkbox"
id="giftCampaignRequireItem"
${requireCampaignItem
  ? "checked"
  : ""
}
style="
width:auto;
margin-top:3px;
"
>

<span>

<strong>
ต้องมีสินค้าใน Collection ของ Campaign นี้
</strong>

<br>

<span
style="
font-size:13px;
color:#64748b;
"
>

ลูกค้าต้องซื้อสินค้าใน Collection นี้อย่างน้อย 1 ชิ้น
จึงจะมีสิทธิ์รับของแถม แม้ยอดรวมจากทั้ง Fandom จะถึงเกณฑ์แล้ว

</span>

</span>

</label>

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

function normalizeAdminGiftRewardMode(
  value
){

  return String(
    value || ""
  )
    .trim()
    .toLowerCase() === "custom"
      ? "custom"
      : "normal";

}


function getAdminGiftRuleRewardMap(
  rule
){

  const map = {};

  const rewards =
    rule &&
    Array.isArray(
      rule.rewards
    )
      ? rule.rewards
      : [];

  rewards.forEach(
    reward => {

      const sourceRuleId =
        String(
          reward.source_rule_id || ""
        ).trim();

      if(!sourceRuleId){
        return;
      }

      map[
        sourceRuleId
      ] = {

        quantity:
          Math.max(
            1,
            Number(
              reward.quantity || 1
            )
          ),

        active:
          normalizeGiftAdminYes(
            reward.active === undefined
              ? true
              : reward.active
          ),

        sort_order:
          Math.max(
            0,
            Number(
              reward.sort_order || 0
            )
          )

      };

    }
  );

  return map;

}


function renderGiftRewardRuleChoices(){

  const container =
    document.getElementById(
      "giftRuleRewardChoices"
    );

  const modeInput =
    document.getElementById(
      "giftRuleRewardMode"
    );

  const campaignInput =
    document.getElementById(
      "giftRuleCampaignId"
    );

  const currentRuleInput =
    document.getElementById(
      "giftRuleId"
    );

  const minAmountInput =
    document.getElementById(
      "giftRuleMinAmount"
    );

  if(
    !container ||
    !modeInput ||
    !campaignInput
  ){

    return;

  }

  const rewardMode =
    normalizeAdminGiftRewardMode(
      modeInput.value
    );

  container.style.display =
    rewardMode === "custom"
      ? "block"
      : "none";

  if(rewardMode !== "custom"){
    return;
  }

  const campaignId =
    String(
      campaignInput.value || ""
    ).trim();

  const currentRuleId =
    String(
      currentRuleInput
        ? currentRuleInput.value
        : ""
    ).trim();

  const currentMinAmount =
    Number(
      minAmountInput
        ? minAmountInput.value
        : 0
    );

  /*
  เก็บค่าที่ผู้ใช้กำลังกรอกไว้
  เวลาพิมพ์ยอดขั้นต่ำแล้วรายการถูก Render ใหม่
  */

  const currentSelections = {};

  container
    .querySelectorAll(
      "[data-gift-reward-rule]"
    )
    .forEach(
      row => {

        const sourceRuleId =
          String(
            row.dataset.giftRewardRule || ""
          ).trim();

        const checkbox =
          row.querySelector(
            "[data-gift-reward-enabled]"
          );

        const quantityInput =
          row.querySelector(
            "[data-gift-reward-quantity]"
          );

        if(!sourceRuleId){
          return;
        }

        currentSelections[
          sourceRuleId
        ] = {

          checked:
            Boolean(
              checkbox &&
              checkbox.checked
            ),

          quantity:
            Math.max(
              1,
              Number(
                quantityInput
                  ? quantityInput.value
                  : 1
              ) || 1
            )

        };

      }
    );

  const editingRule =
    currentRuleId
      ? adminGiftRules.find(
          rule =>

            String(
              rule.rule_id || ""
            ).trim() ===
            currentRuleId
        )
      : null;

  const savedRewardMap =
    getAdminGiftRuleRewardMap(
      editingRule
    );

  const availableRules =
    adminGiftRules
      .filter(
        rule => {

          const ruleId =
            String(
              rule.rule_id || ""
            ).trim();

          const ruleCampaignId =
            String(
              rule.campaign_id || ""
            ).trim();

          const minAmount =
            Number(
              rule.min_amount || 0
            );

          if(
            !ruleId ||
            ruleId === currentRuleId ||
            ruleCampaignId !== campaignId
          ){

            return false;

          }

          /*
          แสดงเฉพาะเทียร์ที่ยอดต่ำกว่า Rule ปัจจุบัน
          */

          return (
            Number.isFinite(
              currentMinAmount
            ) &&
            minAmount <
            currentMinAmount
          );

        }
      )
      .sort(
        (
          firstRule,
          secondRule
        ) =>

          Number(
            firstRule.min_amount || 0
          ) -

          Number(
            secondRule.min_amount || 0
          )
      );

  if(!availableRules.length){

    container.innerHTML = `

<div
style="
padding:14px;
border:1px dashed #cbdde8;
border-radius:14px;
background:#f8fbff;
color:#64748b;
line-height:1.7;
">

ยังไม่มีเทียร์ก่อนหน้าที่มียอดต่ำกว่า Rule นี้

<br>

กรุณาสร้าง Rule ยอดต่ำกว่าก่อน
หรือกรอกยอดขั้นต่ำของ Rule นี้ให้สูงกว่าเทียร์เดิม

</div>

`;

    return;

  }

  container.innerHTML = `

<div
style="
margin-bottom:10px;
color:#64748b;
font-size:13px;
line-height:1.7;
">

เลือกเทียร์ก่อนหน้าที่ลูกค้าจะได้รับเพิ่ม
นอกเหนือจากของแถมของ Rule ปัจจุบัน

</div>

<div
style="
display:grid;
gap:10px;
">

${availableRules.map(
  (
    sourceRule,
    index
  ) => {

    const sourceRuleId =
      String(
        sourceRule.rule_id || ""
      ).trim();

    const currentSelection =
      currentSelections[
        sourceRuleId
      ];

    const savedReward =
      savedRewardMap[
        sourceRuleId
      ];

    const checked =
      currentSelection
        ? currentSelection.checked
        : Boolean(savedReward);

    const quantity =
      currentSelection
        ? currentSelection.quantity
        : savedReward
          ? Math.max(
              1,
              Number(
                savedReward.quantity || 1
              )
            )
          : 1;

    return `

<div
data-gift-reward-rule="${escapeHtml(
  sourceRuleId
)}"
style="
display:grid;
grid-template-columns:minmax(0,1fr) 130px;
gap:12px;
align-items:center;
padding:13px;
border:1px solid #dbe7f1;
border-radius:14px;
background:#ffffff;
">

<label
style="
display:flex;
align-items:flex-start;
gap:10px;
cursor:pointer;
margin:0;
">

<input
type="checkbox"
data-gift-reward-enabled
${checked ? "checked" : ""}
style="
width:18px;
height:18px;
margin-top:3px;
">

<span>

<strong>
${escapeHtml(
  sourceRule.rule_name ||
  sourceRuleId
)}
</strong>

<br>

<small
style="
color:#64748b;
line-height:1.6;
">

ยอดขั้นต่ำ
฿${Number(
  sourceRule.min_amount || 0
).toLocaleString("th-TH")}

</small>

</span>

</label>

<div>

<label
style="
display:block;
margin-bottom:6px;
font-size:12px;
color:#64748b;
">

จำนวนที่ได้รับ

</label>

<input
type="number"
data-gift-reward-quantity
value="${quantity}"
min="1"
step="1"
${checked ? "" : "disabled"}
style="width:100%;">

</div>

</div>

`;

  }
).join("")}

</div>

`;

  container
    .querySelectorAll(
      "[data-gift-reward-rule]"
    )
    .forEach(
      row => {

        const checkbox =
          row.querySelector(
            "[data-gift-reward-enabled]"
          );

        const quantityInput =
          row.querySelector(
            "[data-gift-reward-quantity]"
          );

        if(
          !checkbox ||
          !quantityInput
        ){

          return;

        }

        checkbox.addEventListener(
          "change",
          () => {

            quantityInput.disabled =
              !checkbox.checked;

            if(checkbox.checked){

              quantityInput.focus();

            }

          }
        );

      }
    );

}


function toggleGiftRuleRewardMode(){

  renderGiftRewardRuleChoices();

}

function renderGiftRuleForm(){

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

  let rule = null;

  if(isEdit){

    rule =
      adminGiftRules.find(
        item =>

          String(
            item.rule_id || ""
          ) ===
          String(
            adminGiftModalRecordId || ""
          )
      );

    if(!rule){

      modalTitle.textContent =
        "✏️ แก้ไข Rule";

      modalBody.innerHTML = `

<div class="gift-error full">
ไม่พบข้อมูล Rule ที่ต้องการแก้ไข
</div>

`;

      return;

    }

  }

  const campaignId =
    isEdit
      ? String(
          rule.campaign_id || ""
        )
      : String(
          adminGiftModalParentId || ""
        );

  const campaign =
    adminGiftCampaigns.find(
      item =>

        String(
          item.campaign_id || ""
        ) === campaignId
    );

  if(!campaign){

    modalTitle.textContent =
      isEdit
        ? "✏️ แก้ไข Rule"
        : "＋ เพิ่ม Rule";

    modalBody.innerHTML = `

<div class="gift-error full">
ไม่พบ Campaign สำหรับ Rule นี้
</div>

`;

    return;

  }

  modalTitle.textContent =
    isEdit
      ? "✏️ แก้ไข Rule"
      : "＋ เพิ่ม Rule";

  const ruleName =
    rule
      ? rule.rule_name || ""
      : "";

  const minAmount =
    rule
      ? Number(
          rule.min_amount
        ) || 0
      : 0;

  const maxSelect =
    rule
      ? Math.max(
          1,
          Number(
            rule.max_select
          ) || 1
        )
      : 1;

  const sortOrder =
    rule
      ? Math.max(
          0,
          Number(
            rule.sort_order
          ) || 0
        )
      : 0;

  const allowDuplicate =
    rule
      ? normalizeGiftAdminYes(
          rule.allow_duplicate
        )
      : false;

  const isActive =
    rule
      ? normalizeGiftAdminYes(
          rule.active
        )
      : true;

  const rewardMode =
    normalizeAdminGiftRewardMode(
      rule
        ? rule.reward_mode
        : "normal"
    );

  const rewardDescription =
    rule
      ? String(
          rule.reward_description || ""
        )
      : "";

  modalBody.innerHTML = `

<input
type="hidden"
id="giftRuleId"
value="${escapeHtml(
  rule
    ? rule.rule_id || ""
    : ""
)}">

<input
type="hidden"
id="giftRuleCampaignId"
value="${escapeHtml(
  campaignId
)}">


<div class="full">

<label>
Campaign
</label>

<br><br>

<input
type="text"
value="${escapeHtml(
  campaign.campaign_name ||
  campaignId
)}"
disabled>

</div>


<div class="full">

<label for="giftRuleName">

ชื่อ Rule
<span style="color:#ef4444;">*</span>

</label>

<br><br>

<input
type="text"
id="giftRuleName"
value="${escapeHtml(
  ruleName
)}"
placeholder="เช่น ซื้อครบ 1,200 บาท">

</div>


<div>

<label for="giftRuleMinAmount">

ยอดขั้นต่ำ
<span style="color:#ef4444;">*</span>

</label>

<br><br>

<input
type="number"
id="giftRuleMinAmount"
value="${minAmount}"
min="0"
step="0.01">

</div>


<div>

<label for="giftRuleMaxSelect">

ของแถมเทียร์นี้
<span style="color:#ef4444;">*</span>

</label>

<br><br>

<input
type="number"
id="giftRuleMaxSelect"
value="${maxSelect}"
min="1"
step="1">

<small
style="
display:block;
margin-top:7px;
color:#64748b;
line-height:1.6;
">

จำนวนของแถมจาก Rule ปัจจุบันที่ลูกค้าเลือกได้

</small>

</div>


<div class="full">

<label for="giftRuleRewardMode">

รูปแบบสิทธิ์ของแถม

</label>

<br><br>

<select
id="giftRuleRewardMode"
onchange="toggleGiftRuleRewardMode()">

<option
value="normal"
${rewardMode === "normal" ? "selected" : ""}>

ธรรมดาตามขั้น

</option>

<option
value="custom"
${rewardMode === "custom" ? "selected" : ""}>

รวมสิทธิ์จากเทียร์ก่อนหน้า

</option>

</select>

<small
style="
display:block;
margin-top:7px;
color:#64748b;
line-height:1.7;
">

แบบธรรมดา:
ลูกค้าได้รับเฉพาะของแถมจาก Rule นี้

<br>

แบบรวมสิทธิ์:
ลูกค้าได้รับของแถม Rule นี้
และเลือกของจากเทียร์ก่อนหน้าตามจำนวนที่กำหนด

</small>

</div>


<div
id="giftRuleRewardChoices"
class="full"
style="display:none;">
</div>


<div class="full">

<label for="giftRuleRewardDescription">

คำอธิบายสิทธิ์

</label>

<br><br>

<textarea
id="giftRuleRewardDescription"
rows="3"
placeholder="เช่น รับของแถมยอด 600 บาท 3 ชิ้น และของแถมยอด 1,200 บาท 1 ชิ้น"
style="
width:100%;
resize:vertical;
">${escapeHtml(
  rewardDescription
)}</textarea>

</div>


<div>

<label for="giftRuleAllowDuplicate">
อนุญาตให้เลือกซ้ำ
</label>

<br><br>

<select id="giftRuleAllowDuplicate">

<option
value=""
${!allowDuplicate ? "selected" : ""}>
ไม่อนุญาต
</option>

<option
value="yes"
${allowDuplicate ? "selected" : ""}>
อนุญาต
</option>

</select>

</div>


<div>

<label for="giftRuleSortOrder">
ลำดับการแสดงผล
</label>

<br><br>

<input
type="number"
id="giftRuleSortOrder"
value="${sortOrder}"
min="0"
step="1">

</div>


<div>

<label for="giftRuleActive">
สถานะ
</label>

<br><br>

<select id="giftRuleActive">

<option
value="yes"
${isActive ? "selected" : ""}>
เปิดใช้งาน
</option>

<option
value=""
${!isActive ? "selected" : ""}>
ปิดใช้งาน
</option>

</select>

</div>


<div>

<label>
Rule ID
</label>

<br><br>

<input
type="text"
value="${escapeHtml(
  rule
    ? rule.rule_id || ""
    : "สร้างอัตโนมัติเมื่อบันทึก"
)}"
disabled>

</div>

`;

  const minInput =
    document.getElementById(
      "giftRuleMinAmount"
    );

  if(minInput){

    minInput.addEventListener(
      "input",
      () => {

        renderGiftRewardRuleChoices();

      }
    );

  }

  renderGiftRewardRuleChoices();

  window.setTimeout(
    () => {

      const nameInput =
        document.getElementById(
          "giftRuleName"
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

  const requireCampaignItemInput =
    document.getElementById(
      "giftCampaignRequireItem"
    );

  const eligibilityScopeInput =
    document.querySelector(
      'input[name="giftCampaignEligibilityScope"]:checked'
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

  const sortOrderValue =
    sortOrderInput
      ? Number(
          sortOrderInput.value || 0
        )
      : 0;

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

    eligibility_scope:
      eligibilityScopeInput
        ? eligibilityScopeInput.value
        : "collection_only",

    require_campaign_item:
      requireCampaignItemInput &&
      requireCampaignItemInput.checked
        ? "yes"
        : "",

    description:
      descriptionInput
        ? descriptionInput.value
        : "",

    sort_order:
      Number.isFinite(
        sortOrderValue
      )
        ? Math.max(
            0,
            Math.floor(
              sortOrderValue
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

  if(
    payload.eligibility_scope !==
      "collection_only" &&
    payload.eligibility_scope !==
      "fandom_all"
  ){

    alert(
      "กรุณาเลือกขอบเขตสินค้าที่นำมาคำนวณของแถม"
    );

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
        : "⏳ กำลังบันทึก Campaign...";

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
      payload.campaign_id
        ? "updateGiftCampaign"
        : "saveGiftCampaign"
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
        result.message ||
        "บันทึก Campaign ไม่สำเร็จ"
      );

    }

    const savedCampaignId =
      String(
        result.campaign_id ||
        payload.campaign_id ||
        ""
      );

    if(savedCampaignId){

      adminGiftOpenNodes.add(
        createGiftNodeKey(
          "campaign",
          savedCampaignId
        )
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

async function requestDeleteGiftCampaign(
  campaignId
){

  const normalizedCampaignId =
    String(
      campaignId || ""
    ).trim();

  if(!normalizedCampaignId){

    alert(
      "ไม่พบ Campaign ID"
    );

    return;

  }

  const campaign =
    adminGiftCampaigns.find(
      item =>

        String(
          item.campaign_id || ""
        ) ===
        normalizedCampaignId
    );

  if(!campaign){

    alert(
      "ไม่พบข้อมูล Campaign"
    );

    return;

  }

  const campaignName =
    String(
      campaign.campaign_name ||
      normalizedCampaignId
    );

  const childRules =
    adminGiftRules.filter(
      rule =>

        String(
          rule.campaign_id || ""
        ) ===
        normalizedCampaignId
    );

  if(
    childRules.length > 0
  ){

    alert(
      "ไม่สามารถลบ Campaign \"" +
      campaignName +
      "\" ได้\n\n" +
      "Campaign นี้ยังมี Rule อยู่ " +
      childRules.length +
      " รายการ\n" +
      "กรุณาลบ Rule ภายใน Campaign ก่อน"
    );

    return;

  }

  const confirmed =
    confirm(
      "ต้องการลบ Campaign นี้ใช่ไหม?\n\n" +
      campaignName +
      "\n\n" +
      "เมื่อลบแล้วจะไม่สามารถกู้คืนได้"
    );

  if(!confirmed){

    return;

  }

  const campaignNode =
    document.querySelector(
      '[data-gift-node="' +
      CSS.escape(
        createGiftNodeKey(
          "campaign",
          normalizedCampaignId
        )
      ) +
      '"]'
    );

  const deleteButton =
    campaignNode
      ? campaignNode.querySelector(
          ".gift-delete-btn"
        )
      : null;

  if(deleteButton){

    deleteButton.disabled =
      true;

    deleteButton.textContent =
      "กำลังลบ...";

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

        campaign_id:
          normalizedCampaignId

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
        "ลบ Campaign ไม่สำเร็จ"
      );

    }

    adminGiftOpenNodes.delete(
      createGiftNodeKey(
        "campaign",
        normalizedCampaignId
      )
    );

    alert(
      "ลบ Campaign เรียบร้อยแล้ว"
    );

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "requestDeleteGiftCampaign error:",
      error
    );

    alert(
      error.message ||
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }finally{

    if(
      deleteButton &&
      document.body.contains(
        deleteButton
      )
    ){

      deleteButton.disabled =
        false;

      deleteButton.textContent =
        "🗑️ ลบ";

    }

  }

}

/*
=========================================
RULE PLACEHOLDER ACTIONS
=========================================
*/

function openCreateGiftRule(
  campaignId
){

  const normalizedCampaignId =
    String(
      campaignId || ""
    ).trim();

  if(!normalizedCampaignId){

    alert(
      "ไม่พบ Campaign ID"
    );

    return;

  }

  const campaignExists =
    adminGiftCampaigns.some(
      campaign =>

        String(
          campaign.campaign_id || ""
        ) ===
        normalizedCampaignId
    );

  if(!campaignExists){

    alert(
      "ไม่พบข้อมูล Campaign"
    );

    return;

  }

  openGiftModal(
    "rule",
    "create",
    "",
    normalizedCampaignId
  );

}

function openEditGiftRule(
  ruleId
){

  const normalizedRuleId =
    String(
      ruleId || ""
    ).trim();

  if(!normalizedRuleId){

    alert(
      "ไม่พบ Rule ID"
    );

    return;

  }

  const rule =
    adminGiftRules.find(
      item =>

        String(
          item.rule_id || ""
        ) ===
        normalizedRuleId
    );

  if(!rule){

    alert(
      "ไม่พบข้อมูล Rule"
    );

    return;

  }

  openGiftModal(
    "rule",
    "edit",
    normalizedRuleId,
    String(
      rule.campaign_id || ""
    )
  );

}

async function requestDeleteGiftRule(
  ruleId
){

  const normalizedRuleId =
    String(
      ruleId || ""
    ).trim();

  if(!normalizedRuleId){

    alert(
      "ไม่พบ Rule ID"
    );

    return;

  }

  const rule =
    adminGiftRules.find(
      item =>

        String(
          item.rule_id || ""
        ) ===
        normalizedRuleId
    );

  if(!rule){

    alert(
      "ไม่พบข้อมูล Rule"
    );

    return;

  }

  const ruleName =
    String(
      rule.rule_name ||
      normalizedRuleId
    );

  const campaignId =
    String(
      rule.campaign_id || ""
    );

  const childItems =
    adminGiftItems.filter(
      item =>

        String(
          item.rule_id || ""
        ) ===
        normalizedRuleId
    );

  if(
    childItems.length > 0
  ){

    alert(
      "ไม่สามารถลบ Rule \"" +
      ruleName +
      "\" ได้\n\n" +
      "Rule นี้ยังมี Gift Item อยู่ " +
      childItems.length +
      " รายการ\n" +
      "กรุณาลบ Gift Item ภายใน Rule ก่อน"
    );

    return;

  }

  const confirmed =
    confirm(
      "ต้องการลบ Rule นี้ใช่ไหม?\n\n" +
      ruleName +
      "\n\n" +
      "เมื่อลบแล้วจะไม่สามารถกู้คืนได้"
    );

  if(!confirmed){

    return;

  }

  const ruleNode =
    document.querySelector(
      '[data-gift-node="' +
      CSS.escape(
        createGiftNodeKey(
          "rule",
          normalizedRuleId
        )
      ) +
      '"]'
    );

  const deleteButton =
    ruleNode
      ? ruleNode.querySelector(
          ".gift-delete-btn"
        )
      : null;

  if(deleteButton){

    deleteButton.disabled =
      true;

    deleteButton.textContent =
      "กำลังลบ...";

  }

  try{

    const formData =
      new FormData();

    formData.append(
      "action",
      "deleteGiftRule"
    );

    formData.append(
      "payload",
      JSON.stringify({

        rule_id:
          normalizedRuleId

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
        "ลบ Rule ไม่สำเร็จ"
      );

    }

    adminGiftOpenNodes.delete(
      createGiftNodeKey(
        "rule",
        normalizedRuleId
      )
    );

    if(campaignId){

      adminGiftOpenNodes.add(
        createGiftNodeKey(
          "campaign",
          campaignId
        )
      );

    }

    alert(
      "ลบ Rule เรียบร้อยแล้ว"
    );

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "requestDeleteGiftRule error:",
      error
    );

    alert(
      error.message ||
      "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );

  }finally{

    if(
      deleteButton &&
      document.body.contains(
        deleteButton
      )
    ){

      deleteButton.disabled =
        false;

      deleteButton.textContent =
        "🗑️ ลบ";

    }

  }

}

/*
=========================================
GIFT ITEM ACTIONS
=========================================
*/

function openCreateGiftItem(
  ruleId
){

  const normalizedRuleId =
    String(
      ruleId || ""
    ).trim();

  if(!normalizedRuleId){

    alert(
      "ไม่พบ Rule ID"
    );

    return;

  }

  const ruleExists =
    adminGiftRules.some(
      rule =>

        String(
          rule.rule_id || ""
        ) ===
        normalizedRuleId
    );

  if(!ruleExists){

    alert(
      "ไม่พบข้อมูล Rule"
    );

    return;

  }

  openGiftModal(
    "item",
    "create",
    "",
    normalizedRuleId
  );

}


function openEditGiftItem(
  giftItemId
){

  const normalizedGiftItemId =
    String(
      giftItemId || ""
    ).trim();

  if(!normalizedGiftItemId){

    alert(
      "ไม่พบ Gift Item ID"
    );

    return;

  }

  const item =
    adminGiftItems.find(
      row =>

        String(
          row.gift_item_id || ""
        ) ===
        normalizedGiftItemId
    );

  if(!item){

    alert(
      "ไม่พบข้อมูล Gift Item"
    );

    return;

  }

  openGiftModal(
    "item",
    "edit",
    normalizedGiftItemId,
    String(
      item.rule_id || ""
    )
  );

}


async function requestDeleteGiftItem(
  giftItemId
){

  const normalizedGiftItemId =
    String(
      giftItemId || ""
    ).trim();

  if(!normalizedGiftItemId){

    alert(
      "ไม่พบ Gift Item ID"
    );

    return;

  }

  const item =
    adminGiftItems.find(
      row =>

        String(
          row.gift_item_id || ""
        ) ===
        normalizedGiftItemId
    );

  if(!item){

    alert(
      "ไม่พบข้อมูล Gift Item"
    );

    return;

  }

  const childCharacters =
    adminGiftCharacters.filter(
      character =>

        String(
          character.gift_item_id || ""
        ) ===
        normalizedGiftItemId
    );

  if(childCharacters.length){

    alert(
      "ไม่สามารถลบ Gift Item \"" +
      String(
        item.gift_name ||
        normalizedGiftItemId
      ) +
      "\" ได้\n\n" +
      "Gift Item นี้ยังมี Character อยู่ " +
      childCharacters.length +
      " รายการ\n" +
      "กรุณาลบ Character ภายในก่อน"
    );

    return;

  }

  const confirmed =
    confirm(
      "ต้องการลบ Gift Item นี้ใช่ไหม?\n\n" +
      String(
        item.gift_name ||
        normalizedGiftItemId
      ) +
      "\n\nเมื่อลบแล้วจะไม่สามารถกู้คืนได้"
    );

  if(!confirmed){

    return;

  }

  const itemNode =
    document.querySelector(
      '[data-gift-node="' +
      CSS.escape(
        createGiftNodeKey(
          "item",
          normalizedGiftItemId
        )
      ) +
      '"]'
    );

  const deleteButton =
    itemNode
      ? itemNode.querySelector(
          ".gift-delete-btn"
        )
      : null;

  if(deleteButton){

    deleteButton.disabled = true;

    deleteButton.textContent =
      "กำลังลบ...";

  }

  try{

    await postGiftAdminAction(
      "deleteGiftItem",
      {
        gift_item_id:
          normalizedGiftItemId
      }
    );

    adminGiftOpenNodes.delete(
      createGiftNodeKey(
        "item",
        normalizedGiftItemId
      )
    );

    const ruleId =
      String(
        item.rule_id || ""
      );

    if(ruleId){

      adminGiftOpenNodes.add(
        createGiftNodeKey(
          "rule",
          ruleId
        )
      );

    }

    alert(
      "ลบ Gift Item เรียบร้อยแล้ว"
    );

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "requestDeleteGiftItem error:",
      error
    );

    alert(
      error.message ||
      "ลบ Gift Item ไม่สำเร็จ"
    );

  }finally{

    if(
      deleteButton &&
      document.body.contains(
        deleteButton
      )
    ){

      deleteButton.disabled = false;

      deleteButton.textContent =
        "🗑️ ลบ";

    }

  }

}


function openCampaignExclusions(
  campaignId
){

  const normalizedCampaignId =
    String(
      campaignId || ""
    ).trim();

  if(!normalizedCampaignId){

    alert(
      "ไม่พบ Campaign ID"
    );

    return;

  }

  const campaignExists =
    adminGiftCampaigns.some(
      campaign =>

        String(
          campaign.campaign_id || ""
        ) ===
        normalizedCampaignId
    );

  if(!campaignExists){

    alert(
      "ไม่พบข้อมูล Campaign"
    );

    return;

  }

  openGiftModal(
    "exclusions",
    "manage",
    normalizedCampaignId
  );

}


function renderGiftCampaignExclusionsForm(){

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

  const campaignId =
    String(
      adminGiftModalRecordId || ""
    );

  const campaign =
    adminGiftCampaigns.find(
      item =>

        String(
          item.campaign_id || ""
        ) ===
        campaignId
    );

  if(!campaign){

    modalTitle.textContent =
      "🚫 Excluded Products";

    modalBody.innerHTML = `

<div class="gift-error full">
ไม่พบข้อมูล Campaign
</div>

`;

    return;

  }

  const exclusions =
    getGiftCampaignExclusions(
      campaignId
    );

  modalTitle.textContent =
    "🚫 Excluded Products";

  modalBody.innerHTML = `

<div class="full">

<label>
Campaign
</label>

<br><br>

<input
type="text"
value="${escapeHtml(
  campaign.campaign_name ||
  campaignId
)}"
disabled
>

</div>


<div
class="full"
style="
border:1px solid #dbeafe;
background:#f8fbff;
border-radius:14px;
padding:16px;
"
>

<label for="giftExclusionProduct">
เพิ่มสินค้าที่ไม่นำยอดมาคำนวณ
</label>

<br><br>

<div
style="
display:flex;
gap:10px;
align-items:center;
flex-wrap:wrap;
"
>

<select
id="giftExclusionProduct"
style="
flex:1;
min-width:240px;
"
>

${renderGiftExclusionProductOptions(
  campaignId
)}

</select>

<button
type="button"
class="gift-add-btn"
style="
width:auto;
white-space:nowrap;
"
onclick="
addGiftCampaignExclusion()
"
>
＋ เพิ่มสินค้า
</button>

</div>

<p
style="
margin:10px 0 0;
font-size:13px;
color:#64748b;
"
>
สินค้าที่เพิ่มไว้ในรายการนี้จะไม่ถูกนำยอดมารวมเพื่อคำนวณสิทธิ์ของแถมใน Campaign นี้
</p>

</div>


<div class="full">

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
gap:10px;
margin-bottom:12px;
"
>

<strong>
รายการสินค้าที่ถูกยกเว้น
</strong>

<span
style="
font-size:13px;
color:#64748b;
"
>
${exclusions.length} รายการ
</span>

</div>

<div id="giftCampaignExclusionList">

${
  exclusions.length
    ? exclusions
        .map(
          exclusion =>
            renderGiftCampaignExclusionRow(
              exclusion
            )
        )
        .join("")
    : `

<div class="gift-empty">
ยังไม่มีสินค้าที่ถูกยกเว้น
</div>

`
}

</div>

</div>

`;

}


function renderGiftExclusionProductOptions(
  campaignId
){

  const excludedProductIds =
    new Set(
      getGiftCampaignExclusions(
        campaignId
      ).map(
        exclusion =>
          String(
            exclusion.product_id || ""
          )
      )
    );

  const products =
    Array.isArray(
      adminProducts
    )
      ? [...adminProducts]
      : [];

  products.sort(
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
-- เลือกสินค้า --
</option>

`;

  products.forEach(
    product => {

      const productId =
        String(
          product.product_id || ""
        );

      if(
        !productId ||
        excludedProductIds.has(
          productId
        )
      ){

        return;

      }

      const productName =
        product.name ||
        productId;

      const fandom =
        product.fandom
          ? " • " + product.fandom
          : "";

      const collectionName =
        getGiftAdminCollectionName(
          product.collection_id
        );

      const collectionLabel =
        collectionName
          ? " • " + collectionName
          : "";

      html += `

<option
value="${escapeHtml(
  productId
)}"
>

${escapeHtml(
  productName +
  fandom +
  collectionLabel
)}

</option>

`;

    }
  );

  return html;

}


function renderGiftCampaignExclusionRow(
  exclusion
){

  const exclusionId =
    String(
      exclusion.exclusion_id || ""
    );

  const productId =
    String(
      exclusion.product_id || ""
    );

  const product =
    Array.isArray(
      adminProducts
    )
      ? adminProducts.find(
          item =>

            String(
              item.product_id || ""
            ) ===
            productId
        )
      : null;

  const productName =
    product
      ? product.name || productId
      : exclusion.product_name ||
        productId ||
        "ไม่พบชื่อสินค้า";

  const fandom =
    product &&
    product.fandom
      ? product.fandom
      : "";

  return `

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
gap:12px;
padding:12px;
border:1px solid #e2e8f0;
border-radius:12px;
margin-bottom:10px;
"
>

<div style="min-width:0;">

<div
style="
font-weight:700;
word-break:break-word;
"
>
${escapeHtml(
  productName
)}
</div>

<div
style="
font-size:13px;
color:#64748b;
margin-top:4px;
word-break:break-word;
"
>
Product ID:
${escapeHtml(
  productId || "-"
)}

${
  fandom
    ? `
      &nbsp; • &nbsp;
      ${escapeHtml(fandom)}
    `
    : ""
}
</div>

</div>

<button
type="button"
class="gift-action-btn gift-delete-btn"
style="
width:auto;
white-space:nowrap;
"
onclick="
deleteGiftCampaignExclusion(
  '${escapeJsString(
    exclusionId
  )}',
  '${escapeJsString(
    productId
  )}'
)
"
>
🗑️ ลบ
</button>

</div>

`;

}


async function addGiftCampaignExclusion(){

  const campaignId =
    String(
      adminGiftModalRecordId || ""
    ).trim();

  const productInput =
    document.getElementById(
      "giftExclusionProduct"
    );

  const productId =
    productInput
      ? productInput.value.trim()
      : "";

  if(!campaignId){

    alert(
      "ไม่พบ Campaign ID"
    );

    return;

  }

  if(!productId){

    alert(
      "กรุณาเลือกสินค้าที่ต้องการยกเว้น"
    );

    if(productInput){

      productInput.focus();

    }

    return;

  }

  const exists =
    getGiftCampaignExclusions(
      campaignId
    ).some(
      exclusion =>

        String(
          exclusion.product_id || ""
        ) ===
        productId
    );

  if(exists){

    alert(
      "สินค้านี้อยู่ในรายการยกเว้นแล้ว"
    );

    return;

  }

  const button =
    event &&
    event.currentTarget
      ? event.currentTarget
      : null;

  if(button){

    button.disabled = true;

    button.textContent =
      "กำลังเพิ่ม...";

  }

  try{

    await postGiftAdminAction(
      "saveGiftCampaignExclusion",
      {
        campaign_id:
          campaignId,

        product_id:
          productId
      }
    );

    await loadGiftCampaigns();

    adminGiftModalRecordId =
      campaignId;

    renderGiftCampaignExclusionsForm();

  }catch(error){

    console.error(
      "addGiftCampaignExclusion error:",
      error
    );

    alert(
      error.message ||
      "เพิ่มสินค้าที่ถูกยกเว้นไม่สำเร็จ"
    );

  }finally{

    if(
      button &&
      document.body.contains(
        button
      )
    ){

      button.disabled = false;

      button.textContent =
        "＋ เพิ่มสินค้า";

    }

  }

}


async function deleteGiftCampaignExclusion(
  exclusionId,
  productId = ""
){

  const normalizedExclusionId =
    String(
      exclusionId || ""
    ).trim();

  const campaignId =
    String(
      adminGiftModalRecordId || ""
    ).trim();

  if(
    !normalizedExclusionId &&
    !productId
  ){

    alert(
      "ไม่พบข้อมูลรายการยกเว้น"
    );

    return;

  }

  const confirmed =
    confirm(
      "ต้องการนำสินค้านี้ออกจากรายการยกเว้นใช่ไหม?"
    );

  if(!confirmed){

    return;

  }

  const button =
    event &&
    event.currentTarget
      ? event.currentTarget
      : null;

  if(button){

    button.disabled = true;

    button.textContent =
      "กำลังลบ...";

  }

  try{

    await postGiftAdminAction(
      "deleteGiftCampaignExclusion",
      {
        exclusion_id:
          normalizedExclusionId,

        campaign_id:
          campaignId,

        product_id:
          String(
            productId || ""
          )
      }
    );

    await loadGiftCampaigns();

    adminGiftModalRecordId =
      campaignId;

    renderGiftCampaignExclusionsForm();

  }catch(error){

    console.error(
      "deleteGiftCampaignExclusion error:",
      error
    );

    alert(
      error.message ||
      "ลบสินค้าที่ถูกยกเว้นไม่สำเร็จ"
    );

  }finally{

    if(
      button &&
      document.body.contains(
        button
      )
    ){

      button.disabled = false;

      button.textContent =
        "🗑️ ลบ";

    }

  }

}

/*
=========================================
CHARACTER ACTIONS
=========================================
*/

function openCreateGiftCharacter(
  giftItemId
){

  const normalizedGiftItemId =
    String(
      giftItemId || ""
    ).trim();

  if(!normalizedGiftItemId){

    alert(
      "ไม่พบ Gift Item ID"
    );

    return;

  }

  const item =
    adminGiftItems.find(
      row =>

        String(
          row.gift_item_id || ""
        ) ===
        normalizedGiftItemId
    );

  if(!item){

    alert(
      "ไม่พบข้อมูล Gift Item"
    );

    return;

  }

  if(
    !normalizeGiftAdminYes(
      item.has_character
    )
  ){

    alert(
      "Gift Item นี้ไม่ได้เปิดใช้งานตัวเลือกตัวละคร"
    );

    return;

  }

  openGiftModal(
    "character",
    "create",
    "",
    normalizedGiftItemId
  );

}


function openEditGiftCharacter(
  characterId
){

  const normalizedCharacterId =
    String(
      characterId || ""
    ).trim();

  if(!normalizedCharacterId){

    alert(
      "ไม่พบ Character ID"
    );

    return;

  }

  const character =
    adminGiftCharacters.find(
      row =>

        String(
          row.character_id || ""
        ) ===
        normalizedCharacterId
    );

  if(!character){

    alert(
      "ไม่พบข้อมูล Character"
    );

    return;

  }

  openGiftModal(
    "character",
    "edit",
    normalizedCharacterId,
    String(
      character.gift_item_id || ""
    )
  );

}


async function requestDeleteGiftCharacter(
  characterId
){

  const normalizedCharacterId =
    String(
      characterId || ""
    ).trim();

  if(!normalizedCharacterId){

    alert(
      "ไม่พบ Character ID"
    );

    return;

  }

  const character =
    adminGiftCharacters.find(
      row =>

        String(
          row.character_id || ""
        ) ===
        normalizedCharacterId
    );

  if(!character){

    alert(
      "ไม่พบข้อมูล Character"
    );

    return;

  }

  const characterName =
    String(
      character.character_name ||
      normalizedCharacterId
    );

  const giftItemId =
    String(
      character.gift_item_id || ""
    );

  const confirmed =
    confirm(
      "ต้องการลบ Character นี้ใช่ไหม?\n\n" +
      characterName +
      "\n\nเมื่อลบแล้วจะไม่สามารถกู้คืนได้"
    );

  if(!confirmed){

    return;

  }

  try{

    await postGiftAdminAction(
      "deleteGiftCharacter",
      {
        character_id:
          normalizedCharacterId
      }
    );

    if(giftItemId){

      adminGiftOpenNodes.add(
        createGiftNodeKey(
          "item",
          giftItemId
        )
      );

    }

    alert(
      "ลบ Character เรียบร้อยแล้ว"
    );

    await loadGiftCampaigns();

  }catch(error){

    console.error(
      "requestDeleteGiftCharacter error:",
      error
    );

    alert(
      error.message ||
      "ลบ Character ไม่สำเร็จ"
    );

  }

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
