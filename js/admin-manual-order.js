/* Rinka Admin Manual Order MVP */

const ManualOrder = {

  products:[],

  collections:[],

  campaigns:[],

  rules:[],

  items:[],

  characters:[],

  exclusions:[],

  cart:[],

  gifts:[],

  customers:[],

  selectedCustomer:null,

  loading:false

};

function renderManualOrderManager(){
  const root=document.getElementById('manualOrderManager');
  if(!root)return;
  root.innerHTML=`
  <style>
  .mo-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin-bottom:16px}
  .mo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .mo-full{grid-column:1/-1}.mo-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
  .mo-product{border:1px solid #e5e7eb;border-radius:12px;padding:10px;cursor:pointer}.mo-product:hover{border-color:#7dcfff}
  .mo-row{display:flex;justify-content:space-between;gap:10px;align-items:center}.mo-item{border:1px solid #e5e7eb;border-radius:12px;padding:10px;margin-top:8px}
  .mo-total{font-size:26px;font-weight:800;color:#2563eb}.mo-gift{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:10px;margin-top:8px}
  @media(max-width:800px){.mo-grid{grid-template-columns:1fr}.mo-full{grid-column:auto}}
  </style>
  <div class="mo-card">

<h3>
👤 ข้อมูลลูกค้า
</h3>

<div class="mo-grid">

<label class="mo-full">

ค้นหาลูกค้าเดิม

<div
style="
display:flex;
gap:8px;
align-items:center;
"
>

<input
id="mo_customer_search"
placeholder="อีเมล / แอค X / เบอร์โทร"
>

<button
type="button"
style="
width:auto;
white-space:nowrap;
"
onclick="searchManualCustomer()"
>
🔍 ค้นหา
</button>

</div>

</label>

<div
id="mo_customer_result"
class="mo-full"
></div>

<label>
แอค X

<input
id="mo_social"
placeholder="@username"
>
</label>

<label>
อีเมล *

<input
id="mo_email"
type="email"
>
</label>

<label>
เบอร์โทร *

<input
id="mo_phone"
>
</label>

<label>
ชื่อผู้รับ *

<input
id="mo_name"
>
</label>

</div>

</div>

  <div class="mo-card"><h3>🛍️ สินค้า</h3><div class="mo-grid">
  <label>ประเภท<select id="mo_type" onchange="filterManualProducts()"><option value="preorder">พรีออเดอร์</option><option value="instock">พร้อมส่ง</option></select></label>
  <label>Collection<select id="mo_collection" onchange="filterManualProducts()"><option value="">ทั้งหมด</option></select></label>
  <label class="mo-full">ค้นหา<input id="mo_search" oninput="filterManualProducts()"></label>
  </div><div id="mo_products" class="mo-products" style="margin-top:12px">กำลังโหลด...</div></div>
  <div class="mo-card"><h3>📦 รายการในออเดอร์</h3><div id="mo_cart"></div><div class="mo-row" style="margin-top:14px"><b>ยอดรวม</b><div id="mo_total" class="mo-total">฿0</div></div></div>
  <div class="mo-card"><h3>🎁 ของแถม</h3><div id="mo_gifts">ระบบจะคำนวณหลังเพิ่มสินค้า</div></div>
  <div class="mo-card"><h3>📍 ที่อยู่</h3><div class="mo-grid">
  <label class="mo-full">ที่อยู่<textarea id="mo_address" rows="3"></textarea></label>
  <label>ตำบล/แขวง<input id="mo_subdistrict"></label><label>อำเภอ/เขต<input id="mo_district"></label>
  <label>จังหวัด<input id="mo_province"></label><label>รหัสไปรษณีย์<input id="mo_postcode"></label>
  </div></div>
  <div class="mo-card"><h3>💳 การชำระเงิน</h3><div class="mo-grid">
  <label>ช่องทาง<select id="mo_method"><option value="credit_card_qr">QR บัตรเครดิต</option><option value="bank_transfer">บัญชีธนาคาร</option></select></label>
  <label>สถานะ<select id="mo_paystatus"><option value="paid">ชำระแล้ว</option><option value="pending_verification">รอตรวจสอบ</option><option value="unpaid">ยังไม่ชำระ</option></select></label>
  <label class="mo-full">แนบสลิป<input id="mo_slip" type="file" accept="image/*"></label>
  <label class="mo-full">หมายเหตุ<textarea id="mo_note" rows="2"></textarea></label>
  </div></div>
  <button id="mo_submit" onclick="submitManualOrder()">✅ ยืนยันคำสั่งซื้อ</button>`;
  loadManualOrderData();
}

async function loadManualOrderData(){
  const [p,c,gc,gr,gi,ch,ex]=await Promise.all([
    moGet('adminProducts'),moGet('adminCollections'),moGet('getGiftCampaigns'),moGet('getGiftRules'),moGet('getGiftItems'),moGet('getGiftCharacters'),moGet('getGiftCampaignExclusions')
  ]);
  ManualOrder.products=moArray(p,'products');ManualOrder.collections=moArray(c,'collections');
  ManualOrder.campaigns=moArray(gc,'campaigns');ManualOrder.rules=moArray(gr,'rules');ManualOrder.items=moArray(gi,'items','gifts');
  ManualOrder.characters=moArray(ch,'characters');ManualOrder.exclusions=moArray(ex,'exclusions');
  document.getElementById('mo_collection').innerHTML='<option value="">ทั้งหมด</option>'+ManualOrder.collections.map(x=>`<option value="${moEsc(x.collection_id)}">${moEsc(x.name)}</option>`).join('');
  filterManualProducts();renderManualCart();renderManualGifts();
}
async function moGet(action){const r=await fetch(API+'?action='+encodeURIComponent(action));const j=await r.json();if(j&&j.success===false)throw new Error(j.error||action);return j}
function moArray(v,...keys){if(Array.isArray(v))return v;for(const k of keys)if(v&&Array.isArray(v[k]))return v[k];return []}
function moBool(v){return v===true||v===1||['yes','true','1','active'].includes(String(v||'').trim().toLowerCase())}
function moEsc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
function moPrice(p){const n=Number(p.final_price??p.sale_price??p.price??0);return Number.isFinite(n)?n:0}

async function searchManualCustomer(){

  const keyword =
    document
      .getElementById(
        "mo_customer_search"
      )
      ?.value
      .trim() || "";


  const box =
    document.getElementById(
      "mo_customer_result"
    );


  if(!keyword){

    alert(
      "กรุณากรอกอีเมล แอค X หรือเบอร์โทร"
    );

    return;

  }


  if(box){

    box.innerHTML = `

<div
style="
padding:14px;
background:#f8fafc;
border-radius:12px;
"
>
⏳ กำลังค้นหา...
</div>

`;

  }


  try{

    const response =
      await fetch(

        API +

        "?action=adminCustomerSearch" +

        "&keyword=" +

        encodeURIComponent(
          keyword
        )

      );


    if(!response.ok){

      throw new Error(
        "HTTP " +
        response.status
      );

    }


    const result =
      await response.json();


    if(
      result.success === false
    ){

      throw new Error(
        result.error ||
        "ค้นหาลูกค้าไม่สำเร็จ"
      );

    }


    ManualOrder.customers =
      Array.isArray(
        result.customers
      )
        ? result.customers
        : [];


    if(
      ManualOrder.customers.length === 0
    ){

      box.innerHTML = `

<div
style="
padding:14px;
background:#f8fafc;
border-radius:12px;
color:#64748b;
"
>
ไม่พบลูกค้าเดิม สามารถกรอกข้อมูลใหม่ได้
</div>

`;

      return;

    }


    box.innerHTML =
      ManualOrder.customers
        .map(
          (
            customer,
            index
          )=>{

            return `

<div
style="
padding:14px;
margin-bottom:10px;
border:1px solid #dbeafe;
background:#eff6ff;
border-radius:12px;
"
>

<div
style="
font-weight:800;
"
>
${moEsc(
  customer.customer_name ||
  customer.receiver ||
  customer.email ||
  "-"
)}
</div>

<div
style="
margin-top:5px;
font-size:13px;
color:#475569;
"
>

${moEsc(
  customer.email || ""
)}

${
  customer.social
    ? " • " +
      moEsc(
        customer.social
      )
    : ""
}

</div>

<div
style="
margin-top:6px;
font-size:13px;
color:#475569;
"
>

เคยสั่ง
${Number(
  customer.order_count || 0
)}
ออเดอร์

•

ยอดรวม
฿${Number(
  customer.total_spent || 0
).toLocaleString(
  "th-TH",
  {
    maximumFractionDigits:2
  }
)}

</div>

<button
type="button"
style="
width:auto;
margin-top:10px;
"
onclick="
useManualCustomer(
${index}
)
"
>
ใช้ข้อมูลนี้
</button>

</div>

`;

          }
        )
        .join("");


  }catch(error){

    console.error(
      "searchManualCustomer error:",
      error
    );


    if(box){

      box.innerHTML = `

<div
style="
padding:14px;
background:#fef2f2;
border:1px solid #fecaca;
border-radius:12px;
color:#991b1b;
"
>

ค้นหาไม่สำเร็จ

<br>

${moEsc(
  error.message ||
  String(error)
)}

</div>

`;

    }

  }

}

function useManualCustomer(
  index
){

  const customer =
    ManualOrder.customers[
      index
    ];


  if(!customer){

    return;

  }


  ManualOrder.selectedCustomer =
    customer;


  setManualField(
    "mo_social",
    customer.social || ""
  );


  setManualField(
    "mo_email",
    customer.email || ""
  );


  setManualField(
    "mo_phone",
    customer.phone || ""
  );


  setManualField(
    "mo_name",
    customer.customer_name ||
    customer.receiver ||
    ""
  );


  setManualField(
    "mo_address",
    customer.address || ""
  );


  setManualField(
    "mo_subdistrict",
    customer.subdistrict || ""
  );


  setManualField(
    "mo_district",
    customer.district || ""
  );


  setManualField(
    "mo_province",
    customer.province || ""
  );


  setManualField(
    "mo_postcode",
    customer.postcode || ""
  );

}


function setManualField(
  id,
  value
){

  const element =
    document.getElementById(
      id
    );


  if(element){

    element.value =
      value || "";

  }

}

function filterManualProducts(){
  const type=document.getElementById('mo_type').value, col=document.getElementById('mo_collection').value, q=document.getElementById('mo_search').value.trim().toLowerCase();
  const rows=ManualOrder.products.filter(p=>String(p.product_type||'preorder').toLowerCase()===type&&(!col||String(p.collection_id||'')===col)&&(!q||[p.name,p.fandom,p.sub_category].join(' ').toLowerCase().includes(q)));
  document.getElementById('mo_products').innerHTML=rows.length?rows.map(p=>`<div class="mo-product" onclick="addManualProduct('${moEsc(p.product_id)}')"><b>${moEsc(p.name)}</b><div>฿${moPrice(p).toLocaleString()}</div><small>${moEsc(p.fandom||'')}</small></div>`).join(''):'ไม่พบสินค้า';
}
function addManualProduct(id){
  const p=ManualOrder.products.find(x=>String(x.product_id)===String(id));if(!p)return;
  const qty=Math.max(1,Number(prompt('จำนวน',1)||1));
  const option=prompt('ตัวเลือก/ตัวละคร (เว้นว่างได้)','')||'';
  const key=id+'::'+option;const ex=ManualOrder.cart.find(x=>x._key===key);
  if(ex)ex.qty+=qty;else ManualOrder.cart.push({_key:key,product_id:p.product_id,product_name:p.name,name:p.name,price:moPrice(p),qty,selected_options:option?{ตัวเลือก:option}:{},crate_selected:'No',crate_fee:0,collection_id:p.collection_id||'',fandom:p.fandom||''});
  renderManualCart();renderManualGifts();
}
function renderManualCart(){
  const box=document.getElementById('mo_cart');
  box.innerHTML=ManualOrder.cart.length?ManualOrder.cart.map((x,i)=>`<div class="mo-item"><div class="mo-row"><div><b>${moEsc(x.name)}</b><div>${moEsc(Object.values(x.selected_options||{}).join(', '))}</div></div><b>฿${(x.price*x.qty+x.crate_fee).toLocaleString()}</b></div><div style="margin-top:8px"><button onclick="moQty(${i},-1)">−</button> ${x.qty} <button onclick="moQty(${i},1)">+</button> <button onclick="moRemove(${i})" style="background:#ef4444">ลบ</button></div></div>`).join(''):'ยังไม่มีสินค้า';
  document.getElementById('mo_total').textContent='฿'+moSubtotal().toLocaleString();
}
function moQty(i,d){ManualOrder.cart[i].qty=Math.max(1,ManualOrder.cart[i].qty+d);renderManualCart();renderManualGifts()}
function moRemove(i){ManualOrder.cart.splice(i,1);ManualOrder.gifts=[];renderManualCart();renderManualGifts()}
function moSubtotal(){return ManualOrder.cart.reduce((s,x)=>s+x.price*x.qty+Number(x.crate_fee||0),0)}

function renderManualGifts(){
  const box=document.getElementById('mo_gifts');if(!ManualOrder.cart.length){box.innerHTML='ระบบจะคำนวณหลังเพิ่มสินค้า';return}
  const eligible=[];
  (ManualOrder.campaigns||[]).filter(x=>moBool(x.active)).forEach(c=>{
    const col=String(c.collection_id||''), scope=String(c.eligibility_scope||'collection_only');
    const ci=ManualOrder.collections.find(x=>String(x.collection_id)===col);const fandom=String(c.fandom||ci?.fandom||'').toLowerCase();
    const items=ManualOrder.cart.filter(x=>scope==='fandom_all'?String(x.fandom||'').toLowerCase()===fandom:String(x.collection_id||'')===col);
    const total=items.reduce((s,x)=>s+x.price*x.qty+Number(x.crate_fee||0),0);
    const rules=(ManualOrder.rules||[]).filter(r=>moBool(r.active)&&String(r.campaign_id)===String(c.campaign_id)&&total>=Number(r.min_amount||0)).map(r=>({...r,items:(ManualOrder.items||[]).filter(i=>moBool(i.active)&&String(i.rule_id)===String(r.rule_id))})).filter(r=>r.items.length);
    if(rules.length)eligible.push({...c,total,rules});
  });
  if(!eligible.length){box.innerHTML='ยังไม่มีของแถมที่ผ่านเงื่อนไข';ManualOrder.gifts=[];return}
  box.innerHTML=eligible.map(c=>`<div class="mo-gift"><b>${moEsc(c.campaign_name)}</b><div>ยอดคำนวณ ฿${c.total.toLocaleString()}</div>${c.rules.map(r=>`<div style="margin-top:8px"><b>${moEsc(r.rule_name)} (เลือกได้ ${r.max_select})</b>${r.items.map(i=>`<label style="display:block;margin-top:6px"><input type="checkbox" data-campaign="${moEsc(c.campaign_id)}" data-rule="${moEsc(r.rule_id)}" data-item="${moEsc(i.gift_item_id)}" onchange="collectManualGiftInputs()"> ${moEsc(i.gift_name)}</label>`).join('')}</div>`).join('')}</div>`).join('');
}
function collectManualGiftInputs(){
  ManualOrder.gifts=[...document.querySelectorAll('#mo_gifts input:checked')].map(x=>({campaign_id:x.dataset.campaign,rule_id:x.dataset.rule,gift_item_id:x.dataset.item,gift_id:x.dataset.item,character_id:''}));
}

async function submitManualOrder(){
  if(ManualOrder.loading)return;
  const slip=document.getElementById('mo_slip').files[0];const status=document.getElementById('mo_paystatus').value;
  if(!document.getElementById('mo_name').value.trim()||!document.getElementById('mo_email').value.trim()||!document.getElementById('mo_phone').value.trim())return alert('กรอกข้อมูลลูกค้าให้ครบ');
  if(!ManualOrder.cart.length)return alert('เพิ่มสินค้าอย่างน้อย 1 รายการ');
  if(status==='paid'&&!slip)return alert('สถานะชำระแล้วต้องแนบสลิป');
  const payload={

  customer_id:
    ManualOrder.selectedCustomer
      ? ManualOrder.selectedCustomer.customer_id || ""
      : "",

  customer_name:
    moVal(
      "mo_name"
    ),

  email:
    moVal(
      "mo_email"
    ),
  phone:moVal('mo_phone'),social:moVal('mo_social'),items:ManualOrder.cart,gifts:ManualOrder.gifts,address:{receiver:moVal('mo_name'),email:moVal('mo_email'),phone:moVal('mo_phone'),address:moVal('mo_address'),subdistrict:moVal('mo_subdistrict'),district:moVal('mo_district'),province:moVal('mo_province'),postcode:moVal('mo_postcode')},payment:{method:document.getElementById('mo_method').value,status,amount:moSubtotal(),slip_base64:slip?await moFile(slip):''},order_source:'admin',admin_note:moVal('mo_note')};
  ManualOrder.loading=true;document.getElementById('mo_submit').disabled=true;
  try{const fd=new FormData();fd.append('payload',JSON.stringify(payload));const r=await fetch(API+'?action=adminManualOrder',{method:'POST',body:fd});const j=await r.json();if(!j.success)throw new Error(j.error||'สร้างออเดอร์ไม่สำเร็จ');alert('สร้างออเดอร์สำเร็จ '+j.order_id);renderManualOrderManager();if(typeof loadOrders==='function')loadOrders()}catch(e){alert(e.message)}finally{ManualOrder.loading=false;const b=document.getElementById('mo_submit');if(b)b.disabled=false}
}
function moVal(id){return document.getElementById(id)?.value.trim()||''}
function moFile(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('อ่านสลิปไม่สำเร็จ'));r.readAsDataURL(f)})}
