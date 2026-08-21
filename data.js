// ============================================================
// 📦 Historical Fights Data — SCHEMA v2 (Side-Separated Odds)
// ============================================================
// ⚠️ ไฟล์นี้ = SOURCE OF TRUTH สำหรับ Backtest Hub → 📚 Historical Mode
//    ไม่อ่านจาก .md โดยตรง — แต่ให้ AI agent แปลงจากไฟล์ .md (ที่ Recorder ส่งออกมา)
//    แล้ว append item ใหม่เข้าไปใน array ล่างนี้
//
// 📌 Schema per item (1 item = 1 ไฟท์):
// {
//   fightId:     string  — unique (match timestamp), e.g. "fight_20260819_213045"
//   recordedAt:  number  — timestamp ms (เวลาเปิดราคา)
//   settledAt:   number  — timestamp ms (เวลาจบไฟท์ / กดแชมป์)
//   fighters:    { red: string, blue: string }   — ชื่อนักมวย 2 ฝั่ง
//   initialFav:  "red" | "blue"                  — (compat) เปิดฝั่งไหนเป็น fav
//   initialOdds: { a: number, b: number }        — (compat) resolved เปิด odds ต่อ A:B
//   winner:      "red" | "blue"                  — ⚠️ บังคับ ต้องมี
//   journey: [                                        — 5-10 จุดราคา (เรียงตามเวลาจริง)
//     {
//       step:       number              — 0,1,2,... (index)
//       offsetMs:   number              — มิลลิวินาทีเทียบกับ recordedAt
//       src:        "open"|"auto_sync"|"simulation"|"manual_edit"
//
//       ✨ ใหม่ v2 (SOURCE OF TRUTH — ฝั่งละคู่ แยกต่อ/รองจริงๆ):
//       red:   { a: number, b: number, raw: string, isValid: boolean }   — 🔴 redOddsText แบบ raw
//       blue:  { a: number, b: number, raw: string, isValid: boolean }   — 🔵 blueOddsText แบบ raw
//
//       resolvedFav:  "red"|"blue"   — (compat) ฝั่งไหนถูก resolve เป็น "ต่อ" (a/b มากกว่า)
//       resolvedA:    number         — (compat) resolved ฝั่งต่อ A
//       resolvedB:    number         — (compat) resolved ฝั่งรอง B
//
//       (legacy compat — ถ้า AI agent ยังไม่อัปเดต v2 ก็ยังอ่านได้):
//       fav: "red"|"blue",  a: number,  b: number
//     }
//   ]
// }
//
// ❌ Rule: ถ้า journey step ใด red.isValid=false หรือ blue.isValid=false
//         → แปลว่าช่วงนั้นราคาหาย (ปิดรับแทง / ไม่มีราคา) → Backtest จะข้ามจุดนั้นไปเลย
//
// ============================================================

window.HISTORICAL_FIGHTS = [

    // ⬇️ เพิ่มไฟท์จากงานจริงของคุณ ด้านล่างนี้ (แต่ละ item คั่นด้วย , ปิดท้ายด้วย ];)
    //
    // ตัวอย่าง: AI agent จะ append รูปแบบนี้ให้โดยอัตโนมัติจากไฟล์ .md:
    // ,{
    //   fightId: "fight_20260819_213045",
    //   recordedAt: 1755631845000,
    //   settledAt:  1755631960000,
    //   fighters: { red: "บัวขาว", blue: "โรดริเกส" },
    //   initialFav: "red", initialOdds: { a: 2, b: 1 },
    //   winner: "red",
    //   journey: [ ...(จากตารางใน md)... ]
    // }

    {
        fightId: "fight_20260820_205725",
        recordedAt: 1787234245000,
        settledAt:  1787234751000,
        fighters: { red: "Ploymongkol Jor.Muengsri", blue: "Phet Khun Suek Phetmukda" },
        initialFav: "red",
        initialOdds: { a: 3, b: 1 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 0, src: "open",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 1, offsetMs: 20000, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 2, offsetMs: 44000, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 3, offsetMs: 63000, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 4, offsetMs: 146000, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 5, offsetMs: 163000, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 6, offsetMs: 181000, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 7, offsetMs: 221000, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 8, offsetMs: 247000, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 9, offsetMs: 296000, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 10, offsetMs: 321000, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 11, offsetMs: 343000, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 12, offsetMs: 374000, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            }
        ]
    },

    {
        fightId: "fight_20260820_211709",
        recordedAt: 1787235429000,
        settledAt:  1787236595000,
        fighters: { red: "Phetphochai Golita muay thai", blue: "Banlangphet Or.Atchariya" },
        initialFav: "red",
        initialOdds: { a: 5, b: 4 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 0, src: "open",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 1, offsetMs: 13000, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 2, offsetMs: 26000, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 3, offsetMs: 64000, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 4, offsetMs: 88000, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 5, offsetMs: 105000, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 6, offsetMs: 134000, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 7, offsetMs: 175000, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 8, offsetMs: 206000, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 9, offsetMs: 259000, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 10, offsetMs: 321000, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 11, offsetMs: 343000, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 374000, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 13, offsetMs: 389000, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 14, offsetMs: 492000, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 15, offsetMs: 543000, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 16, offsetMs: 565000, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 17, offsetMs: 596000, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 18, offsetMs: 633000, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 19, offsetMs: 653000, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 20, offsetMs: 675000, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 21, offsetMs: 690000, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 22, offsetMs: 731000, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 23, offsetMs: 745000, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 24, offsetMs: 835000, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 15, b: 1, raw: "🔵 น้ำเงิน: 15 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 15, resolvedB: 1,
                fav: "blue", a: 15, b: 1
            },
            {
                step: 25, offsetMs: 862000, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 26, offsetMs: 888000, src: "auto_sync",
                red:  { a: 1, b: 25, raw: "🔴 แดง: HDP 1 : 25", isValid: true },
                blue: { a: 35, b: 1, raw: "🔵 น้ำเงิน: 35 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 35, resolvedB: 1,
                fav: "blue", a: 35, b: 1
            },
            {
                step: 27, offsetMs: 917000, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 28, offsetMs: 939000, src: "auto_sync",
                red:  { a: 1, b: 80, raw: "🔴 แดง: HDP 1 : 80", isValid: true },
                blue: { a: 130, b: 1, raw: "🔵 น้ำเงิน: 130 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 130, resolvedB: 1,
                fav: "blue", a: 130, b: 1
            },
            {
                step: 29, offsetMs: 968000, src: "auto_sync",
                red:  { a: 1, b: 230, raw: "🔴 แดง: HDP 1 : 230", isValid: true },
                blue: { a: 300, b: 1, raw: "🔵 น้ำเงิน: 300 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 300, resolvedB: 1,
                fav: "blue", a: 300, b: 1
            }
        ]
    }

];