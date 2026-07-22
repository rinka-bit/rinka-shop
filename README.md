# Rinka Shop — เว็บพรีออเดอร์ (เวอร์ชันใหม่ พร้อมใช้)

เว็บฝั่งลูกค้าแบบ static (HTML/CSS/JS ล้วน ไม่ต้อง build) เชื่อมกับ
Google Apps Script backend (Code.gs) ที่มีอยู่แล้ว โฮสต์ฟรีได้ผ่าน
GitHub Pages เหมือนเดิม

## ตั้งค่า 2 ขั้นตอน

### 1. Deploy Apps Script ให้ได้ลิงก์ `/exec`
ในโปรเจกต์ Apps Script เดิม (ที่ผูกกับ Google Sheet):
`Deploy` → `New deployment` → เลือกประเภท `Web app`
→ Execute as: **Me** → Who has access: **Anyone**
→ `Deploy` → คัดลอกลิงก์ที่ลงท้ายด้วย `/exec`

### 2. วางลิงก์ในไฟล์ config
เปิดไฟล์ `js/config.js` แล้วแก้บรรทัดนี้เป็นลิงก์ที่คัดลอกมา:
```js
API_URL: "https://script.google.com/macros/s/XXXXXXXXXX/exec",
```
เสร็จแล้ว — เปิด `index.html` ทดสอบได้ทันที (หรือ push ขึ้น GitHub
แล้วเปิด GitHub Pages)

## โครงสร้างไฟล์

```
index.html         หน้าแรก (คอลเลกชันแนะนำ, สินค้าแนะนำ, เข้าใหม่)
collections.html    คอลเลกชันทั้งหมด
collection.html      คอลเลกชันเดียว + สินค้าในคอลเลกชัน
category.html        สินค้าตามหมวดหมู่
search.html           ค้นหาสินค้า
product.html          รายละเอียดสินค้า + เลือกตัวเลือก + แพ็คลัง + ใส่ตะกร้า
cart.html              ตะกร้าสินค้า
checkout.html          กรอกข้อมูลผู้สั่งซื้อ + สร้างออเดอร์
payment.html            แนบสลิปโอนเงิน (ยอดตอนสั่งซื้อ)
track.html               ค้นหาออเดอร์ด้วยเลขที่ออเดอร์ + จ่ายค่านำเข้า/ค่าส่งตอนของถึงไทย
login.html / register.html   เข้าสู่ระบบ / สมัครสมาชิก
account.html            ประวัติคำสั่งซื้อของสมาชิก (ต้อง login)
js/config.js             ตั้งค่า API_URL / ชื่อร้าน
js/api.js                 ครอบทุก action ที่มีจริงใน Code.gs
js/cart.js                 ตะกร้า (เก็บใน localStorage ฝั่งลูกค้า)
js/common.js               Header/Footer/Auth ที่ใช้ร่วมทุกหน้า
css/style.css               ธีม "ใบขนพัสดุ" (postal/customs manifest)
```

## จุดที่ควรรู้ (ข้อจำกัดจาก backend เดิม)

- **ค้นหาออเดอร์แบบไม่ login (`track.html`)**: ใช้ action `shippingInfo`
  ซึ่งเป็น action เดียวใน Code.gs ที่เปิดให้ค้นหาด้วยเลขออเดอร์ได้โดยไม่
  ต้อง login — จะเห็นสถานะค่านำเข้า/ค่าส่งเท่านั้น ยังไม่เห็นสถานะ
  "กำลังแพ็ค / จัดส่งแล้ว" แบบละเอียด เพราะ action `order` (แบบเต็ม)
  ต้องมี `session_token` เท่านั้น — ถ้าต้องการให้ลูกค้าที่ไม่ได้สมัคร
  สมาชิกดูสถานะแบบเต็มได้ด้วย ต้องเพิ่ม action ใหม่ฝั่ง Apps Script
  (เช่น ค้นด้วยเลขออเดอร์ + อีเมล) — แจ้งได้เลยถ้าต้องการให้เพิ่มให้
- **ที่อยู่ตอนเช็คเอาท์**: backend เดิมไม่ได้บันทึกที่อยู่ตอนสร้างออเดอร์
  (`doPost` ค่า default ไม่มีคอลัมน์ที่อยู่ใน `appendRow`) ที่อยู่จริงจะถูก
  ยืนยันอีกครั้งตอนของถึงไทยผ่านหน้า `track.html` (เหมือนหน้า
  shipping-payment.html เดิม) — ฟอร์มในหน้า checkout จึงเก็บไว้เผื่ออนาคต/
  อ้างอิงเท่านั้น
- **ของแถม (Gift Campaigns)**: backend รองรับอยู่แล้ว (`gifts`,
  `giftRules`) แต่ยังไม่ได้ต่อ UI ในเวอร์ชันนี้ เพราะกติกาซับซ้อน (เลือก
  ตัวละคร, stack/replace tier) — แจ้งได้ถ้าอยากให้ทำต่อ
- **Admin panel**: เวอร์ชันนี้ทำเฉพาะฝั่งลูกค้า ยังไม่มีหน้าแอดมิน
  (จัดการสินค้า/คอลเลกชัน/ออเดอร์) — backend รองรับ action พวกนี้ครบแล้ว
  ถ้าต้องการหน้าแอดมินใหม่บอกได้เลย
