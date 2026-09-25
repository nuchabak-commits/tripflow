# TripFlow v0.4 — Map

เว็บวางแผนท่องเที่ยว React + TypeScript + Vite ต่อยอดจาก v0.3 เพิ่มแผนที่จริงด้วย Leaflet + OpenStreetMap

## เริ่มใช้งาน

ใช้ Node.js 22 LTS และ npm จากนั้นเปิด Terminal ในโฟลเดอร์ที่มี `package.json`:

```bash
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดง (โดยปกติ `http://localhost:5173`)

```bash
npm test        # ทดสอบ date/status/migration/data preservation/พิกัด/ระยะทาง
npm run build  # TypeScript + production build
npm run preview
```

`dist/` เป็น production build ที่จัดมาให้ ต้องเสิร์ฟผ่านเว็บเซิร์ฟเวอร์ ไม่เปิดด้วย file://
หากใช้ origin หรือ port อื่น LocalStorage จะเป็นคนละชุด

## สิ่งที่เพิ่มใน v0.4 — Map

- แท็บ **Map** ในแต่ละทริป: หมุดมีหมายเลขตามลำดับในแผน สีแยกตามวัน เส้นประเชื่อมกิจกรรมของแต่ละวัน และระยะทางรวมแบบเส้นตรง
- ตัวกรอง **Whole trip / Day 1… / Unscheduled**; คลิกรายการด้านข้างเพื่อซูมไปที่หมุด หรือคลิกหมุดเพื่อไฮไลต์รายการ
- Popup ของหมุด: Edit activity และลิงก์ Directions (เปิด Google Maps นำทาง)
- พิกัดสถานที่ใน Add/Edit activity (ไม่บังคับ): ค้นหาชื่อสถานที่ (OpenStreetMap Nominatim), แตะแผนที่/ลากหมุด หรือวาง `lat, lng` / ลิงก์ Google Maps / OpenStreetMap
- Itinerary: ป้าย **Pinned**, แผนที่ย่อของวัน และปุ่ม **Open full map** ที่เปิด Map ตามวันที่เลือก
- กิจกรรมที่ยังไม่มีพิกัดแสดงในรายการพร้อมปุ่ม **Add location**
- หากโหลดแผ่นแผนที่ไม่ได้ (ออฟไลน์) จะแจ้งเตือน และยังแสดงหมุด/เส้นทางได้
- เมนู Places แสดงจำนวนกิจกรรมที่ปักหมุดแล้ว และเปิดแท็บ Map

### แผนที่และบริการภายนอก

- แผ่นแผนที่โหลดจาก `tile.openstreetmap.org` และค้นหาสถานที่ผ่าน `nominatim.openstreetmap.org` เฉพาะตอนเปิด Map หรือกดปุ่ม Search (ไม่ค้นหาอัตโนมัติขณะพิมพ์) ต้องต่ออินเทอร์เน็ต
- บริการของ OSM เหมาะกับการใช้งานเบา ๆ/เดโม หาก deploy ให้ผู้ใช้จำนวนมาก ให้ตั้งผู้ให้บริการ tile เองใน `.env`:

```bash
VITE_MAP_TILE_URL=https://tiles.example.com/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=&copy; Example, &copy; OpenStreetMap contributors
```

- เส้นประคือลำดับการเดินทางแบบเส้นตรง ไม่ใช่เส้นทางถนนจริง; ระยะทางเป็นระยะเส้นตรง (great-circle)

## สิ่งที่เพิ่มใน v0.3

- Dashboard: ป้ายสถานะขนาดเหมาะสม; Upcoming / Ongoing / Past จากวันปัจจุบันในเครื่อง; ทริปที่กำลังเดินทางหรือใกล้ถึงที่สุดเป็นทริปหลัก
- Edit Trip: จุดหมาย ประเทศ วันเริ่ม–สิ้นสุด งบ รูปปกจาก HTTPS URL ไอคอน และสีปก
- Trip Overview: จำนวนกิจกรรม งบใช้ไป/เหลือ/เกินงบ ความคืบหน้า Packing และรายการแผนแบบย่อ
- Itinerary: หมวดสถานที่ เวลา ระยะเวลา โน้ต ย้ายข้ามวัน ลากเรียง และปุ่มลูกศรสำหรับมือถือ/คีย์บอร์ด
- เปลี่ยนวันทริปได้โดยเลือกคงลำดับ Day หรือคงวันที่จริง; กิจกรรมที่อยู่นอกช่วงจะย้ายเข้า Unscheduled หลังยืนยัน ไม่มีการลบกิจกรรม
- Validation: ข้อมูลจำเป็น วันเดินทาง 1–366 วัน งบ/ค่าใช้จ่ายไม่ติดลบและไม่เกินสองทศนิยมในฟอร์ม
- Dialog ยืนยันการลบ ทริป/กิจกรรม/ค่าใช้จ่าย/ของจัดกระเป๋า; toast หลังแก้ไข; focus trap และ Escape ใน dialog
- Notes บันทึกอัตโนมัติเมื่อพิมพ์
- เมนูมือถือด้านล่างเลื่อนได้ และปุ่มแก้ไข/ลบเข้าถึงได้บนมือถือ
- Settings: Export JSON สำรองข้อมูลปัจจุบันและข้อมูลต้นฉบับที่บันทึกอยู่
- Empty states และแจ้งเตือนเมื่อ browser storage เต็ม/ใช้ไม่ได้

## อัปเกรดจาก v0.3 โดยรักษาข้อมูล

1. รัน v0.4 ด้วย **browser/profile, protocol, hostname และ port เดิม** (เช่น `http://localhost:5173`)
2. ครั้งแรกที่ยังไม่มี `tripflow-v04` ระบบอ่าน `tripflow-v03` (หรือ `tripflow-v02` หากไม่มี v0.3) และสำรองเป็น `tripflow-v03-backup`
3. การแก้ไขใหม่บันทึกลง `tripflow-v04` เท่านั้น ไม่เขียนทับ key เดิม จึงย้อนกลับไปใช้ v0.3 ได้ (แต่จะไม่เห็นการแก้ไขที่ทำใน v0.4)
4. ทริปเดิมยังไม่มีพิกัด ให้เปิด Map แล้วกด **Add location** ทีละกิจกรรม; ทริปตัวอย่าง Chengdu ที่มีพิกัดจะแสดงเฉพาะ workspace ใหม่

## อัปเกรดจาก v0.2 โดยรักษาข้อมูล (v0.3)

1. เก็บโฟลเดอร์ซอร์สเดิมไว้ แล้วแตก ZIP นี้เป็นโฟลเดอร์ใหม่
2. หยุด dev server v0.2 แล้วรัน v0.3 ด้วย **browser/profile, protocol, hostname และ port เดิม** เช่น `http://localhost:5173` ไม่สลับเป็น `127.0.0.1`
3. ครั้งแรกที่ยังไม่มี `tripflow-v03` ระบบอ่าน `tripflow-v02` และสำรองต้นฉบับเป็น `tripflow-v02-backup`
4. การแก้ไขใหม่บันทึกลง `tripflow-v03` เท่านั้น ไม่เขียนทับข้อมูล v0.2
5. ใช้ Settings → Export current trips เพื่อสำรองเป็น JSON ก่อนเปลี่ยนเครื่อง/ล้าง browser

หากไม่มีข้อมูลเดิม จะเริ่มด้วยทริปตัวอย่าง Chengdu, Luang Prabang, Nakhon Nayok และ Tokyo
หากข้อมูลเดิมอ่านไม่ได้ ระบบจะแจ้งเตือนและไม่เขียนทับต้นฉบับ ไม่แทนข้อมูลเสียด้วยข้อมูลตัวอย่างโดยเงียบ ๆ
หากพื้นที่จัดเก็บไม่พอ การเปลี่ยนแปลงอาจอยู่เฉพาะในหน่วยความจำ ให้ export ก่อนปิดหน้า

## เปลี่ยนวันเดินทาง

- **Keep Day 1, Day 2… positions**: แผนเลื่อนตามวันเริ่มทริปใหม่
- **Keep original calendar dates**: กิจกรรมยังอยู่วันที่เดิมหากอยู่ในช่วงใหม่
- กิจกรรมที่หลุดช่วงแผนต้องยืนยันก่อนย้ายเข้า **Unscheduled** แล้วเข้า Edit activity เพื่อเลือกวันใหม่
- การเปลี่ยนวันไม่ลบค่าใช้จ่าย Packing หรือ Notes
- การเรียงกิจกรรมเป็นลำดับที่ผู้ใช้เลือก ไม่บังคับเรียงใหม่ตามเวลา

## โครงสร้าง

```text
src/
  App.tsx                  Application state and persistence
  components/
    Sidebar.tsx            Desktop/mobile navigation
    TripCard.tsx           Trip card and actions
    TripMap.tsx            Leaflet map wrapper (pins, routes, picker)
    TripMapView.tsx        Map tab: day filter, pinned list
    LocationField.tsx      Search / tap-to-pin / coordinates in activity form
    TripForm.tsx           Create/edit and date remapping
    UI.tsx                 Dialog, focus handling, confirmations, toasts
  pages/
    Dashboard.tsx          Dashboard, combined views, settings
    TripPage.tsx           Overview, itinerary, budget, packing, notes
  lib/
    trips.ts               Calendar-day arithmetic and formatting
    geo.ts                 Coordinate parsing, validation, distances
    storage.ts             Validation and v0.3/v0.2 migration
  data/demo.ts             Demo trips
  types/index.ts           Backward-compatible domain types
  styles.css               Existing theme + v0.3/v0.4 styles
```

## ขอบเขตปัจจุบัน

- ไม่มี Backend, Login หรือ cloud sync; ข้อมูลผูกกับ browser origin
- Calendar เป็น agenda เรียงวัน ยังไม่ใช่ปฏิทินแบบเดือน
- Places เป็นภาพรวมกิจกรรมของทริป ยังไม่มีฐานสถานที่แยก (พิกัดผูกกับกิจกรรมแต่ละรายการ)
- รูปปกใช้ URL ภายนอกที่อนุญาตให้โหลดภาพ และต้องออนไลน์; fallback เป็นสีพื้นถ้าภาพโหลดไม่ได้
- แผนที่ยังไม่มี marker clustering: หมุดที่อยู่ใกล้กันมาก (เช่น ห่างกัน 300 ม.) อาจซ้อนกันเมื่อซูมออก ให้คลิกรายการด้านข้างเพื่อซูมเข้า
- ยังไม่มีเส้นทางถนนจริง/เวลาเดินทาง/แผนที่ออฟไลน์ (tile cache); ยังไม่มี API ท่องเที่ยว/พยากรณ์อากาศ/อัตราแลกเปลี่ยน
- JSON export ใช้สำรองได้; ยังไม่มี UI import/restore
- LocalStorage ไม่ใช่ที่จัดเก็บเอกสารสำคัญหรือข้อมูลลับ
- ยังไม่ได้ deploy หรือ push เข้า GitHub จากงานนี้

ดู `CHANGELOG.md`, `docs/TEST_REPORT.md` และ `PROJECT_BASE.md` สำหรับรายละเอียดรุ่น
