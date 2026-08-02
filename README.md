# Rinka Shop — ระบบนำเข้าออเดอร์ลูกค้าเก่า

## ไฟล์ที่สร้างใหม่

### Frontend
- `js/admin-legacy-orders.js`

### Apps Script
- `adminLegacyOrders.gs`

## ไฟล์ที่ต้องแทน
- `admin.html`
- `order.html`

## ไฟล์ที่ต้องแก้ด้วยตัวเอง
- ไฟล์ที่มี `doGet(e)` / `doPost(e)`
  - ใช้โค้ดจาก `apps-script/ROUTE_INTEGRATION.txt`

## ต้องเพิ่ม Header เองหรือไม่
ไม่ต้อง ระบบจะเพิ่ม Header ที่ขาดให้อัตโนมัติ:

### Orders
- `preorder_round`
- `import_fee_status`
- `legacy_order`

### OrderItems
- `image`

### GiftSelections
- `gift_image`

## การทำงาน
- ออเดอร์เก่าไม่ต้องเลือก Product หรือ Collection
- เลขออเดอร์รันอัตโนมัติ รูปแบบ `OLDyyyyMMddHHmmssXXX`
- ไม่ต้องแนบสลิป
- ไม่ต้องใส่ที่อยู่
- บันทึกสินค้าหลายรายการได้
- บันทึกของแถมและรูปของแถมได้
- ถ้าเลือกค่านำเข้า “รอคำนวณ” จะเก็บ `import_fee_status=pending`
- รูปถูกอัปโหลดเข้าโฟลเดอร์ Drive ชื่อ `Rinka Shop Legacy Orders`

## การผูกบัญชีทีหลัง
1. เปิดเมนู “นำเข้าออเดอร์เก่า”
2. ดูส่วน “ออเดอร์ที่ยังไม่ผูกบัญชี”
3. กด “ผูกบัญชี”
4. ค้นหาบัญชีลูกค้า
5. เลือกบัญชีและกดผูก

ระบบจะเติม `customer_id` และ `email` ใน Orders
หลังจากนั้นออเดอร์จะขึ้นใน `orders.html` ของลูกค้า

## Deploy
หลังเพิ่ม Apps Script และ Route:
- Deploy > Manage deployments
- Edit
- New version
- Deploy

Frontend:
- Commit `admin.html`
- Commit `js/admin-legacy-orders.js`
- Commit `order.html`
