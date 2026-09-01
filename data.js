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
    },

        {
        fightId: "fight_20260821_230548",
        recordedAt: 1787321148250,
        settledAt:  1787322432179,
        fighters: { red: "ฝั่งแดง", blue: "ฝั่งน้ำเงิน" },
        initialFav: "red",
        initialOdds: { a: 3, b: 1 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 2190, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 1, offsetMs: 21139, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 2, offsetMs: 65136, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 3, offsetMs: 143136, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 4, offsetMs: 323189, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 5, offsetMs: 503190, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 6, offsetMs: 563191, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 7, offsetMs: 724141, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 8, offsetMs: 777695, src: "auto_sync",
                red:  { a: 1, b: 20, raw: "🔴 แดง: HDP 1 : 20", isValid: true },
                blue: { a: 30, b: 1, raw: "🔵 น้ำเงิน: 30 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 30, resolvedB: 1,
                fav: "blue", a: 30, b: 1
            },
            {
                step: 9, offsetMs: 810147, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 10, offsetMs: 890907, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 11, offsetMs: 964297, src: "auto_sync",
                red:  { a: 1, b: 20, raw: "🔴 แดง: HDP 1 : 20", isValid: true },
                blue: { a: 30, b: 1, raw: "🔵 น้ำเงิน: 30 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 30, resolvedB: 1,
                fav: "blue", a: 30, b: 1
            },
            {
                step: 12, offsetMs: 1011548, src: "auto_sync",
                red:  { a: 1, b: 25, raw: "🔴 แดง: HDP 1 : 25", isValid: true },
                blue: { a: 40, b: 1, raw: "🔵 น้ำเงิน: 40 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 40, resolvedB: 1,
                fav: "blue", a: 40, b: 1
            },
            {
                step: 13, offsetMs: 1037183, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 14, offsetMs: 1061194, src: "auto_sync",
                red:  { a: 1, b: 50, raw: "🔴 แดง: HDP 1 : 50", isValid: true },
                blue: { a: 80, b: 1, raw: "🔵 น้ำเงิน: 80 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 80, resolvedB: 1,
                fav: "blue", a: 80, b: 1
            },
            {
                step: 15, offsetMs: 1116406, src: "auto_sync",
                red:  { a: 1, b: 100, raw: "🔴 แดง: HDP 1 : 100", isValid: true },
                blue: { a: 180, b: 1, raw: "🔵 น้ำเงิน: 180 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 180, resolvedB: 1,
                fav: "blue", a: 180, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260821_222930",
        recordedAt: 1787318970761,
        settledAt:  1787320071198,
        fighters: { red: "ฝั่งแดง", blue: "ฝั่งน้ำเงิน" },
        initialFav: "blue",
        initialOdds: { a: 11, b: 8 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 1903, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 1, offsetMs: 716644, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 2, offsetMs: 754395, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 3, offsetMs: 775900, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 4, offsetMs: 798411, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 5, offsetMs: 826899, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 6, offsetMs: 852894, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 7, offsetMs: 920146, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 8, offsetMs: 952133, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            }
        ]
    },

        {
        fightId: "fight_20260821_233003",
        recordedAt: 1787322603239,
        settledAt:  1787323461343,
        fighters: { red: "ฝั่งแดง", blue: "ฝั่งน้ำเงิน" },
        initialFav: "red",
        initialOdds: { a: 3, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 1667, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 1, offsetMs: 112410, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 2, offsetMs: 245911, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 3, offsetMs: 701800, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 4, offsetMs: 735470, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            }
        ]
    },
   
        {
        fightId: "fight_20260821_234703",
        recordedAt: 1787323623636,
        settledAt:  1787324421025,
        fighters: { red: "Phetgarfield Jitmuangnont", blue: "Net Phayak Chang Aeo Buri Ram" },
        initialFav: "red",
        initialOdds: { a: 2, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 58, src: "open",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 41267, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 2, offsetMs: 217774, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 3, offsetMs: 236016, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 4, offsetMs: 539553, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 5, offsetMs: 569276, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 6, offsetMs: 623770, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 7, offsetMs: 683010, src: "auto_sync",
                red:  { a: 9, b: 1, raw: "🔴 แดง: HDP 9 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 9, resolvedB: 1,
                fav: "red", a: 9, b: 1
            },
            {
                step: 8, offsetMs: 749264, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260822_143212",
        recordedAt: 1787376732968,
        settledAt:  1787378086994,
        fighters: { red: "Boek Ban Luk Mueang Phet", blue: "Phet Krung Krai Krungthekno" },
        initialFav: "blue",
        initialOdds: { a: 2, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 2262, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 15521, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 2, offsetMs: 183091, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 3, offsetMs: 293611, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 4, offsetMs: 375519, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 5, offsetMs: 405016, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 6, offsetMs: 440526, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 7, offsetMs: 451781, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 8, offsetMs: 495614, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 9, offsetMs: 515529, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 10, offsetMs: 548564, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 11, offsetMs: 565779, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 12, offsetMs: 585570, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 13, offsetMs: 601014, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 14, offsetMs: 673281, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 15, offsetMs: 718345, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 16, offsetMs: 748031, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 17, offsetMs: 785099, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 18, offsetMs: 848614, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 19, offsetMs: 878785, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 20, offsetMs: 961285, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 21, offsetMs: 1025884, src: "auto_sync",
                red:  { a: 30, b: 1, raw: "🔴 แดง: HDP 30 : 1", isValid: true },
                blue: { a: 1, b: 20, raw: "🔵 น้ำเงิน: 1 : 20 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 30, resolvedB: 1,
                fav: "red", a: 30, b: 1
            },
            {
                step: 22, offsetMs: 1136853, src: "auto_sync",
                red:  { a: 70, b: 1, raw: "🔴 แดง: HDP 70 : 1", isValid: true },
                blue: { a: 1, b: 40, raw: "🔵 น้ำเงิน: 1 : 40 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 70, resolvedB: 1,
                fav: "red", a: 70, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260822_145748",
        recordedAt: 1787378268869,
        settledAt:  1787379658757,
        fighters: { red: "Chat Phayak LannaWatersidemuaythai", blue: "Lo Ngoen S.Sommai" },
        initialFav: "red",
        initialOdds: { a: 3, b: 2 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 119, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 1, offsetMs: 30216, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 2, offsetMs: 70353, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 3, offsetMs: 126866, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 10, resolvedB: 10,
                fav: "red", a: 10, b: 10
            },
            {
                step: 4, offsetMs: 158173, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 5, offsetMs: 235339, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 6, offsetMs: 298289, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 7, offsetMs: 350113, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 8, offsetMs: 365391, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 9, offsetMs: 383874, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 399676, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 11, offsetMs: 418123, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 12, offsetMs: 466873, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 13, offsetMs: 503964, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 14, offsetMs: 564960, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 15, offsetMs: 583889, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 16, offsetMs: 597377, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 17, offsetMs: 636452, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 18, offsetMs: 659613, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 19, offsetMs: 784384, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 20, offsetMs: 812630, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 21, offsetMs: 840370, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 22, offsetMs: 898875, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 23, offsetMs: 924378, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 24, offsetMs: 935365, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 25, offsetMs: 955374, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 26, offsetMs: 991442, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 27, offsetMs: 1041158, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 28, offsetMs: 1066632, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 29, offsetMs: 1080133, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 30, offsetMs: 1109614, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 31, offsetMs: 1139882, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 32, offsetMs: 1172668, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 33, offsetMs: 1205650, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 34, offsetMs: 1236912, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 35, offsetMs: 1257385, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260822_152223",
        recordedAt: 1787379743068,
        settledAt:  1787380512169,
        fighters: { red: "Narunat Phuyaiphonchaithasala", blue: "Diamond Khiansa Phetchumthong" },
        initialFav: "red",
        initialOdds: { a: 7, b: 4 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 83, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 1, offsetMs: 111521, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 2, offsetMs: 126921, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 3, offsetMs: 180756, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 4, offsetMs: 243005, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 5, offsetMs: 253670, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 6, offsetMs: 265920, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 7, offsetMs: 299222, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 8, offsetMs: 348022, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 9, offsetMs: 361922, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 10, offsetMs: 403424, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 11, offsetMs: 410671, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 12, offsetMs: 428484, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 13, offsetMs: 443690, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 14, offsetMs: 472252, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 15, offsetMs: 544258, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 7, raw: "🔵 น้ำเงิน: 1 : 7 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 16, offsetMs: 635425, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 17, offsetMs: 662176, src: "auto_sync",
                red:  { a: 20, b: 1, raw: "🔴 แดง: HDP 20 : 1", isValid: true },
                blue: { a: 1, b: 13, raw: "🔵 น้ำเงิน: 1 : 13 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 20, resolvedB: 1,
                fav: "red", a: 20, b: 1
            },
            {
                step: 18, offsetMs: 701505, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260823_160913",
        recordedAt: 1787468953268,
        settledAt:  1787471971599,
        fighters: { red: "Monphrakan Sit Petchchalukhan", blue: "Phet Fuji Nayok Soi Wiang Yong Lamphun" },
        initialFav: "red",
        initialOdds: { a: 11, b: 8 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 65, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 1, offsetMs: 1693735, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 1712232, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 3, offsetMs: 1751099, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 4, offsetMs: 1779236, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 5, offsetMs: 1889821, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 9,
                fav: "blue", a: 10, b: 9
            },
            {
                step: 6, offsetMs: 1947231, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 7, offsetMs: 2025490, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 8, offsetMs: 2052484, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 9, offsetMs: 2062271, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 2081490, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 11, offsetMs: 2151257, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 12, offsetMs: 2181740, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 13, offsetMs: 2227246, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 14, offsetMs: 2236475, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 15, offsetMs: 2261500, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 16, offsetMs: 2296541, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 17, offsetMs: 2329776, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 18, offsetMs: 2360493, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 19, offsetMs: 2381756, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 20, offsetMs: 2425307, src: "auto_sync",
                red:  { a: 15, b: 1, raw: "🔴 แดง: HDP 15 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":15,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 15 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 15, resolvedB: 1,
                fav: "red", a: 15, b: 1
            },
            {
                step: 21, offsetMs: 2508235, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 22, offsetMs: 2578250, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                v2: {"red":{"a":50,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 50 : 1"},"blue":{"a":1,"b":30,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 30 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            },
            {
                step: 23, offsetMs: 2592744, src: "auto_sync",
                red:  { a: 130, b: 1, raw: "🔴 แดง: HDP 130 : 1", isValid: true },
                blue: { a: 1, b: 80, raw: "🔵 น้ำเงิน: 1 : 80 HDP", isValid: true },
                v2: {"red":{"a":130,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 130 : 1"},"blue":{"a":1,"b":80,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 80 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 130, resolvedB: 1,
                fav: "red", a: 130, b: 1
            },
            {
                step: 24, offsetMs: 2623494, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 100, raw: "🔵 น้ำเงิน: 1 : 100 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":100,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 100 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            },
            {
                step: 25, offsetMs: 2692579, src: "auto_sync",
                red:  { a: 260, b: 1, raw: "🔴 แดง: HDP 260 : 1", isValid: true },
                blue: { a: 1, b: 180, raw: "🔵 น้ำเงิน: 1 : 180 HDP", isValid: true },
                v2: {"red":{"a":260,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 260 : 1"},"blue":{"a":1,"b":180,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 180 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 260, resolvedB: 1,
                fav: "red", a: 260, b: 1
            },
            {
                step: 26, offsetMs: 2738311, src: "auto_sync",
                red:  { a: 300, b: 1, raw: "🔴 แดง: HDP 300 : 1", isValid: true },
                blue: { a: 1, b: 230, raw: "🔵 น้ำเงิน: 1 : 230 HDP", isValid: true },
                v2: {"red":{"a":300,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 300 : 1"},"blue":{"a":1,"b":230,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 230 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 300, resolvedB: 1,
                fav: "red", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260823_170201",
        recordedAt: 1787472121189,
        settledAt:  1787473691139,
        fighters: { red: "Facebook Nawaponfarmsukkrabauthai", blue: "Kylian Tho Hiao Bang Saen" },
        initialFav: "blue",
        initialOdds: { a: 3, b: 2 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 59, src: "open",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 1, offsetMs: 49499, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 2, offsetMs: 68314, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 3, offsetMs: 127328, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 4, offsetMs: 184815, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 5, offsetMs: 249332, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 6, offsetMs: 277808, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 7, offsetMs: 313331, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 8, offsetMs: 418901, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 9, offsetMs: 452308, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 10, offsetMs: 470064, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 11, offsetMs: 494315, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 12, offsetMs: 527843, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 13, offsetMs: 550398, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 14, offsetMs: 566315, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 15, offsetMs: 596067, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 16, offsetMs: 640386, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 17, offsetMs: 712335, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 18, offsetMs: 776316, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 19, offsetMs: 798568, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 20, offsetMs: 819587, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 21, offsetMs: 831567, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 22, offsetMs: 895402, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 23, offsetMs: 925569, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":8,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 8 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 24, offsetMs: 948318, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 25, offsetMs: 977843, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 26, offsetMs: 1034403, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 27, offsetMs: 1078892, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 28, offsetMs: 1126332, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 29, offsetMs: 1196339, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 30, offsetMs: 1347556, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 31, offsetMs: 1384942, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 32, offsetMs: 1405573, src: "auto_sync",
                red:  { a: 30, b: 1, raw: "🔴 แดง: HDP 30 : 1", isValid: true },
                blue: { a: 1, b: 20, raw: "🔵 น้ำเงิน: 1 : 20 HDP", isValid: true },
                v2: {"red":{"a":30,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 30 : 1"},"blue":{"a":1,"b":20,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 20 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 30, resolvedB: 1,
                fav: "red", a: 30, b: 1
            },
            {
                step: 33, offsetMs: 1440608, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260823_172909",
        recordedAt: 1787473749323,
        settledAt:  1787475432474,
        fighters: { red: "Chalamkhao Tingnotpaetrio P.K.", blue: "Mangkonthong Petchkiatpetch" },
        initialFav: "red",
        initialOdds: { a: 5, b: 4 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 152145, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 1, offsetMs: 176259, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 2, offsetMs: 208747, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 3, offsetMs: 260862, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 4, offsetMs: 309195, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 5, offsetMs: 453199, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 6, offsetMs: 468261, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 7, offsetMs: 534263, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 8, offsetMs: 553180, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 9, offsetMs: 595196, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 621430, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 11, offsetMs: 646429, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 12, offsetMs: 656930, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 13, offsetMs: 696099, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 14, offsetMs: 735518, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 15, offsetMs: 779431, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 16, offsetMs: 804716, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 17, offsetMs: 849704, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 18, offsetMs: 873933, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 19, offsetMs: 893919, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 20, offsetMs: 923935, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 21, offsetMs: 953683, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 22, offsetMs: 982433, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 23, offsetMs: 1034202, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 24, offsetMs: 1063919, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 25, offsetMs: 1081685, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 26, offsetMs: 1133179, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 27, offsetMs: 1163423, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 28, offsetMs: 1193220, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 29, offsetMs: 1247771, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 30, offsetMs: 1263919, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 31, offsetMs: 1416770, src: "auto_sync",
                red:  { a: 1, b: 20, raw: "🔴 แดง: HDP 1 : 20", isValid: true },
                blue: { a: 30, b: 1, raw: "🔵 น้ำเงิน: 30 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":20,"isValid":true,"raw":"🔴 แดง: HDP 1 : 20"},"blue":{"a":30,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 30 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 30, resolvedB: 1,
                fav: "blue", a: 30, b: 1
            },
            {
                step: 32, offsetMs: 1481240, src: "auto_sync",
                red:  { a: 1, b: 60, raw: "🔴 แดง: HDP 1 : 60", isValid: true },
                blue: { a: 100, b: 1, raw: "🔵 น้ำเงิน: 100 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":60,"isValid":true,"raw":"🔴 แดง: HDP 1 : 60"},"blue":{"a":100,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 100 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 100, resolvedB: 1,
                fav: "blue", a: 100, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260823_175905",
        recordedAt: 1787475545231,
        settledAt:  1787476896283,
        fighters: { red: "Petchnung Phetsamanmuaythai", blue: "Kongthorani Santi Ubon" },
        initialFav: "red",
        initialOdds: { a: 3, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 57868, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 1, offsetMs: 134519, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 2, offsetMs: 153822, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 3, offsetMs: 264352, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 4, offsetMs: 325857, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 5, offsetMs: 402039, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 6, offsetMs: 431520, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 7, offsetMs: 467353, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 8, offsetMs: 514770, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 9, offsetMs: 550270, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 10, offsetMs: 630290, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 11, offsetMs: 633355, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 651530, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 13, offsetMs: 670041, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 14, offsetMs: 738356, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 15, offsetMs: 765356, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 16, offsetMs: 815291, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 17, offsetMs: 903296, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 18, offsetMs: 926270, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 19, offsetMs: 966537, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 20, offsetMs: 1053287, src: "auto_sync",
                red:  { a: 40, b: 1, raw: "🔴 แดง: HDP 40 : 1", isValid: true },
                blue: { a: 1, b: 25, raw: "🔵 น้ำเงิน: 1 : 25 HDP", isValid: true },
                v2: {"red":{"a":40,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 40 : 1"},"blue":{"a":1,"b":25,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 25 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 40, resolvedB: 1,
                fav: "red", a: 40, b: 1
            },
            {
                step: 21, offsetMs: 1136327, src: "auto_sync",
                red:  { a: 80, b: 1, raw: "🔴 แดง: HDP 80 : 1", isValid: true },
                blue: { a: 1, b: 50, raw: "🔵 น้ำเงิน: 1 : 50 HDP", isValid: true },
                v2: {"red":{"a":80,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 80 : 1"},"blue":{"a":1,"b":50,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 50 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 80, resolvedB: 1,
                fav: "red", a: 80, b: 1
            },
            {
                step: 22, offsetMs: 1206863, src: "auto_sync",
                red:  { a: 90, b: 1, raw: "🔴 แดง: HDP 90 : 1", isValid: true },
                blue: { a: 1, b: 60, raw: "🔵 น้ำเงิน: 1 : 60 HDP", isValid: true },
                v2: {"red":{"a":90,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 90 : 1"},"blue":{"a":1,"b":60,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 60 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 90, resolvedB: 1,
                fav: "red", a: 90, b: 1
            },
            {
                step: 23, offsetMs: 1260139, src: "auto_sync",
                red:  { a: 100, b: 1, raw: "🔴 แดง: HDP 100 : 1", isValid: true },
                blue: { a: 1, b: 60, raw: "🔵 น้ำเงิน: 1 : 60 HDP", isValid: true },
                v2: {"red":{"a":100,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 100 : 1"},"blue":{"a":1,"b":60,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 60 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 100, resolvedB: 1,
                fav: "red", a: 100, b: 1
            },
            {
                step: 24, offsetMs: 1286029, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 100, raw: "🔵 น้ำเงิน: 1 : 100 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":100,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 100 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260823_192034",
        recordedAt: 1787480434008,
        settledAt:  1787484880424,
        fighters: { red: "phetmai sor.sudarat", blue: "Denthungsang Sor.Atthachai" },
        initialFav: "blue",
        initialOdds: { a: 11, b: 8 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 53, src: "open",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 1, offsetMs: 2872480, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 2929455, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 3, offsetMs: 2991249, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 4, offsetMs: 3004749, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 5, offsetMs: 3060248, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 6, offsetMs: 3083963, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 7, offsetMs: 3093459, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 8, offsetMs: 3121750, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 9, offsetMs: 3143961, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 3210247, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 11, offsetMs: 3245217, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 3282252, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 13, offsetMs: 3395212, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 14, offsetMs: 3416216, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 15, offsetMs: 3445965, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 9,
                fav: "blue", a: 10, b: 9
            },
            {
                step: 16, offsetMs: 3491210, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 17, offsetMs: 3514739, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 18, offsetMs: 3528461, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 19, offsetMs: 3554721, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 20, offsetMs: 3574739, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 21, offsetMs: 3598234, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 22, offsetMs: 3624460, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 23, offsetMs: 3651263, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 24, offsetMs: 3683976, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 25, offsetMs: 3724466, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 7, b: 2, raw: "🔵 น้ำเงิน: 7 : 2 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":7,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 2,
                fav: "blue", a: 7, b: 2
            },
            {
                step: 26, offsetMs: 3778756, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 27, offsetMs: 3836225, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 28, offsetMs: 3860502, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 29, offsetMs: 3887715, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 30, offsetMs: 3936992, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 31, offsetMs: 3963730, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 32, offsetMs: 4063758, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 33, offsetMs: 4102479, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 34, offsetMs: 4143481, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 35, offsetMs: 4158257, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 36, offsetMs: 4179466, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 37, offsetMs: 4212486, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 38, offsetMs: 4242504, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 39, offsetMs: 4257479, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":8,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 8 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 40, offsetMs: 4273243, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 41, offsetMs: 4314021, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260823_203746",
        recordedAt: 1787485066412,
        settledAt:  1787486663548,
        fighters: { red: "Densiam Liamthanawat", blue: "Captain Wankhongohm WKO" },
        initialFav: "red",
        initialOdds: { a: 2, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 10050, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 84826, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 2, offsetMs: 141810, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 3, offsetMs: 153816, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 4, offsetMs: 203061, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 5, offsetMs: 244558, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 6, offsetMs: 304345, src: "auto_sync",
                red:  { a: 6, b: 1, raw: "🔴 แดง: HDP 6 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":6,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 6 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 6, resolvedB: 1,
                fav: "red", a: 6, b: 1
            },
            {
                step: 7, offsetMs: 373811, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 8, offsetMs: 412555, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 9, offsetMs: 437300, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 10, offsetMs: 464311, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 11, offsetMs: 488060, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 12, offsetMs: 545310, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 13, offsetMs: 565066, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 14, offsetMs: 577799, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 15, offsetMs: 614846, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 16, offsetMs: 659564, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 17, offsetMs: 697054, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 18, offsetMs: 723068, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 19, offsetMs: 740052, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 20, offsetMs: 758313, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 21, offsetMs: 776551, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 22, offsetMs: 811062, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 23, offsetMs: 836313, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 24, offsetMs: 898067, src: "auto_sync",
                red:  { a: 6, b: 1, raw: "🔴 แดง: HDP 6 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":6,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 6 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 6, resolvedB: 1,
                fav: "red", a: 6, b: 1
            },
            {
                step: 25, offsetMs: 952566, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 2, b: 7, raw: "🔵 น้ำเงิน: 2 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":2,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 26, offsetMs: 977311, src: "auto_sync",
                red:  { a: 6, b: 1, raw: "🔴 แดง: HDP 6 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":6,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 6 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 6, resolvedB: 1,
                fav: "red", a: 6, b: 1
            },
            {
                step: 27, offsetMs: 1012070, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":8,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 8 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 28, offsetMs: 1027817, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":13,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 13 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 29, offsetMs: 1054800, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 30, offsetMs: 1076553, src: "auto_sync",
                red:  { a: 30, b: 1, raw: "🔴 แดง: HDP 30 : 1", isValid: true },
                blue: { a: 1, b: 20, raw: "🔵 น้ำเงิน: 1 : 20 HDP", isValid: true },
                v2: {"red":{"a":30,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 30 : 1"},"blue":{"a":1,"b":20,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 20 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 30, resolvedB: 1,
                fav: "red", a: 30, b: 1
            },
            {
                step: 31, offsetMs: 1123354, src: "auto_sync",
                red:  { a: 100, b: 1, raw: "🔴 แดง: HDP 100 : 1", isValid: true },
                blue: { a: 1, b: 60, raw: "🔵 น้ำเงิน: 1 : 60 HDP", isValid: true },
                v2: {"red":{"a":100,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 100 : 1"},"blue":{"a":1,"b":60,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 60 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 100, resolvedB: 1,
                fav: "red", a: 100, b: 1
            },
            {
                step: 32, offsetMs: 1224554, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 140, raw: "🔵 น้ำเงิน: 1 : 140 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":140,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 140 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            },
            {
                step: 33, offsetMs: 1251066, src: "auto_sync",
                red:  { a: 260, b: 1, raw: "🔴 แดง: HDP 260 : 1", isValid: true },
                blue: { a: 1, b: 180, raw: "🔵 น้ำเงิน: 1 : 180 HDP", isValid: true },
                v2: {"red":{"a":260,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 260 : 1"},"blue":{"a":1,"b":180,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 180 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 260, resolvedB: 1,
                fav: "red", a: 260, b: 1
            },
            {
                step: 34, offsetMs: 1283321, src: "auto_sync",
                red:  { a: 300, b: 1, raw: "🔴 แดง: HDP 300 : 1", isValid: true },
                blue: { a: 1, b: 230, raw: "🔵 น้ำเงิน: 1 : 230 HDP", isValid: true },
                v2: {"red":{"a":300,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 300 : 1"},"blue":{"a":1,"b":230,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 230 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 300, resolvedB: 1,
                fav: "red", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260823_210744",
        recordedAt: 1787486864959,
        settledAt:  1787488511497,
        fighters: { red: "Phetmongkol Soonkilahuaytom", blue: "Thidet Changnakonsri" },
        initialFav: "red",
        initialOdds: { a: 5, b: 3 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 759, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 1, offsetMs: 28762, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 67511, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 3, offsetMs: 104263, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 4, offsetMs: 118756, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 5, offsetMs: 167798, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 6, offsetMs: 218281, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 7, offsetMs: 251011, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 8, offsetMs: 269012, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 9, offsetMs: 292764, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 10, offsetMs: 354012, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 11, offsetMs: 383029, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 12, offsetMs: 456265, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 13, offsetMs: 474517, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 14, offsetMs: 490013, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 15, offsetMs: 520515, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 16, offsetMs: 576756, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 17, offsetMs: 602266, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 18, offsetMs: 634292, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 19, offsetMs: 666519, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 20, offsetMs: 723038, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 21, offsetMs: 738782, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 22, offsetMs: 748004, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 23, offsetMs: 797505, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 24, offsetMs: 828766, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 25, offsetMs: 914505, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 26, offsetMs: 933769, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 27, offsetMs: 972257, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 28, offsetMs: 1013792, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 29, offsetMs: 1060285, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 30, offsetMs: 1104007, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 31, offsetMs: 1130517, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 32, offsetMs: 1171772, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 33, offsetMs: 1243773, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 34, offsetMs: 1273298, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 35, offsetMs: 1314006, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 36, offsetMs: 1346255, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 37, offsetMs: 1374282, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 38, offsetMs: 1420112, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 39, offsetMs: 1445018, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 40, offsetMs: 1477374, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 41, offsetMs: 1495518, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 42, offsetMs: 1512261, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260825_203710",
        recordedAt: 1787657830939,
        settledAt:  1787659202592,
        fighters: { red: "Phetsurat Sakwichian", blue: "Phetdomthong Or.Thewa" },
        initialFav: "red",
        initialOdds: { a: 10, b: 9 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 1805, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 1, offsetMs: 19785, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 2, offsetMs: 46807, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 3, offsetMs: 65288, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 4, offsetMs: 100091, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 5, offsetMs: 190793, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 6, offsetMs: 207787, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 7, offsetMs: 242282, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 8, offsetMs: 267038, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 9, offsetMs: 292307, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 305284, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 11, offsetMs: 339541, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 12, offsetMs: 367093, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 13, offsetMs: 378794, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 14, offsetMs: 410782, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 15, offsetMs: 448543, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 16, offsetMs: 470037, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 17, offsetMs: 539595, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 18, offsetMs: 556293, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 19, offsetMs: 572795, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 20, offsetMs: 597295, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 21, offsetMs: 628093, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 22, offsetMs: 653588, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 23, offsetMs: 674793, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":13,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 13 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 24, offsetMs: 734044, src: "auto_sync",
                red:  { a: 12, b: 1, raw: "🔴 แดง: HDP 12 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":12,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 12 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 12, resolvedB: 1,
                fav: "red", a: 12, b: 1
            },
            {
                step: 25, offsetMs: 770790, src: "auto_sync",
                red:  { a: 14, b: 1, raw: "🔴 แดง: HDP 14 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":14,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 14 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 14, resolvedB: 1,
                fav: "red", a: 14, b: 1
            },
            {
                step: 26, offsetMs: 839663, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":13,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 13 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 27, offsetMs: 853790, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 28, offsetMs: 879295, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":13,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 13 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 29, offsetMs: 901547, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 30, offsetMs: 937295, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 31, offsetMs: 956586, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 32, offsetMs: 979548, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 33, offsetMs: 1053797, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 34, offsetMs: 1155796, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 35, offsetMs: 1221049, src: "auto_sync",
                red:  { a: 1, b: 60, raw: "🔴 แดง: HDP 1 : 60", isValid: true },
                blue: { a: 100, b: 1, raw: "🔵 น้ำเงิน: 100 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":60,"isValid":true,"raw":"🔴 แดง: HDP 1 : 60"},"blue":{"a":100,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 100 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 100, resolvedB: 1,
                fav: "blue", a: 100, b: 1
            },
            {
                step: 36, offsetMs: 1238801, src: "auto_sync",
                red:  { a: 1, b: 130, raw: "🔴 แดง: HDP 1 : 130", isValid: true },
                blue: { a: 200, b: 1, raw: "🔵 น้ำเงิน: 200 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":130,"isValid":true,"raw":"🔴 แดง: HDP 1 : 130"},"blue":{"a":200,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 200 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 200, resolvedB: 1,
                fav: "blue", a: 200, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260825_210201",
        recordedAt: 1787659321146,
        settledAt:  1787660919785,
        fighters: { red: "Decho Nui Simummuang", blue: "Morgan Fightermuaythai" },
        initialFav: "red",
        initialOdds: { a: 7, b: 4 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 94, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 1, offsetMs: 34577, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 2, offsetMs: 234329, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 3, offsetMs: 256337, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 4, offsetMs: 335350, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 5, offsetMs: 392599, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 6, offsetMs: 429385, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 7, offsetMs: 474582, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 8, offsetMs: 525836, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 9, offsetMs: 543377, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 648078, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 11, offsetMs: 672599, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 12, offsetMs: 705587, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 13, offsetMs: 747827, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 14, offsetMs: 798088, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 15, offsetMs: 844085, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 16, offsetMs: 886090, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 17, offsetMs: 901590, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 18, offsetMs: 946087, src: "auto_sync",
                red:  { a: 6, b: 1, raw: "🔴 แดง: HDP 6 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":6,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 6 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 6, resolvedB: 1,
                fav: "red", a: 6, b: 1
            },
            {
                step: 19, offsetMs: 966376, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":8,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 8 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 20, offsetMs: 1021337, src: "auto_sync",
                red:  { a: 9, b: 1, raw: "🔴 แดง: HDP 9 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":9,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 9 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 9, resolvedB: 1,
                fav: "red", a: 9, b: 1
            },
            {
                step: 21, offsetMs: 1060591, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":13,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 13 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 22, offsetMs: 1070340, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 23, offsetMs: 1105091, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 24, offsetMs: 1126871, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                v2: {"red":{"a":50,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 50 : 1"},"blue":{"a":1,"b":30,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 30 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            },
            {
                step: 25, offsetMs: 1155841, src: "auto_sync",
                red:  { a: 100, b: 1, raw: "🔴 แดง: HDP 100 : 1", isValid: true },
                blue: { a: 1, b: 60, raw: "🔵 น้ำเงิน: 1 : 60 HDP", isValid: true },
                v2: {"red":{"a":100,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 100 : 1"},"blue":{"a":1,"b":60,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 60 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 100, resolvedB: 1,
                fav: "red", a: 100, b: 1
            },
            {
                step: 26, offsetMs: 1176838, src: "auto_sync",
                red:  { a: 70, b: 1, raw: "🔴 แดง: HDP 70 : 1", isValid: true },
                blue: { a: 1, b: 40, raw: "🔵 น้ำเงิน: 1 : 40 HDP", isValid: true },
                v2: {"red":{"a":70,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 70 : 1"},"blue":{"a":1,"b":40,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 40 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 70, resolvedB: 1,
                fav: "red", a: 70, b: 1
            },
            {
                step: 27, offsetMs: 1210091, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 100, raw: "🔵 น้ำเงิน: 1 : 100 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":100,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 100 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            },
            {
                step: 28, offsetMs: 1252083, src: "auto_sync",
                red:  { a: 200, b: 1, raw: "🔴 แดง: HDP 200 : 1", isValid: true },
                blue: { a: 1, b: 150, raw: "🔵 น้ำเงิน: 1 : 150 HDP", isValid: true },
                v2: {"red":{"a":200,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 200 : 1"},"blue":{"a":1,"b":150,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 150 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 200, resolvedB: 1,
                fav: "red", a: 200, b: 1
            },
            {
                step: 29, offsetMs: 1277588, src: "auto_sync",
                red:  { a: 260, b: 1, raw: "🔴 แดง: HDP 260 : 1", isValid: true },
                blue: { a: 1, b: 180, raw: "🔵 น้ำเงิน: 1 : 180 HDP", isValid: true },
                v2: {"red":{"a":260,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 260 : 1"},"blue":{"a":1,"b":180,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 180 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 260, resolvedB: 1,
                fav: "red", a: 260, b: 1
            },
            {
                step: 30, offsetMs: 1302842, src: "auto_sync",
                red:  { a: 300, b: 1, raw: "🔴 แดง: HDP 300 : 1", isValid: true },
                blue: { a: 1, b: 230, raw: "🔵 น้ำเงิน: 1 : 230 HDP", isValid: true },
                v2: {"red":{"a":300,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 300 : 1"},"blue":{"a":1,"b":230,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 230 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 300, resolvedB: 1,
                fav: "red", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260825_213853",
        recordedAt: 1787661533509,
        settledAt:  1787662575963,
        fighters: { red: "Khaotawe Town in Town Gym", blue: "Phetdam O.Phetkhunsuek" },
        initialFav: "blue",
        initialOdds: { a: 11, b: 8 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 88, src: "open",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 1, offsetMs: 26725, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 51721, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 3, offsetMs: 69469, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 4, offsetMs: 110722, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 5, offsetMs: 151219, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 6, offsetMs: 179473, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 7, offsetMs: 215974, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 8, offsetMs: 245974, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 9, offsetMs: 287720, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 10, offsetMs: 311225, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 11, offsetMs: 344474, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 12, offsetMs: 362967, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 13, offsetMs: 418965, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 7, raw: "🔵 น้ำเงิน: 1 : 7 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 14, offsetMs: 460473, src: "auto_sync",
                red:  { a: 12, b: 1, raw: "🔴 แดง: HDP 12 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":12,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 12 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 12, resolvedB: 1,
                fav: "red", a: 12, b: 1
            },
            {
                step: 15, offsetMs: 539225, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 16, offsetMs: 569226, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 17, offsetMs: 586222, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 18, offsetMs: 604971, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 19, offsetMs: 621267, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 20, offsetMs: 634967, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                v2: {"red":{"a":50,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 50 : 1"},"blue":{"a":1,"b":30,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 30 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            },
            {
                step: 21, offsetMs: 699277, src: "auto_sync",
                red:  { a: 200, b: 1, raw: "🔴 แดง: HDP 200 : 1", isValid: true },
                blue: { a: 1, b: 150, raw: "🔵 น้ำเงิน: 1 : 150 HDP", isValid: true },
                v2: {"red":{"a":200,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 200 : 1"},"blue":{"a":1,"b":150,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 150 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 200, resolvedB: 1,
                fav: "red", a: 200, b: 1
            },
            {
                step: 22, offsetMs: 743476, src: "auto_sync",
                red:  { a: 260, b: 1, raw: "🔴 แดง: HDP 260 : 1", isValid: true },
                blue: { a: 1, b: 180, raw: "🔵 น้ำเงิน: 1 : 180 HDP", isValid: true },
                v2: {"red":{"a":260,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 260 : 1"},"blue":{"a":1,"b":180,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 180 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 260, resolvedB: 1,
                fav: "red", a: 260, b: 1
            },
            {
                step: 23, offsetMs: 770076, src: "auto_sync",
                red:  { a: 300, b: 1, raw: "🔴 แดง: HDP 300 : 1", isValid: true },
                blue: { a: 1, b: 230, raw: "🔵 น้ำเงิน: 1 : 230 HDP", isValid: true },
                v2: {"red":{"a":300,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 300 : 1"},"blue":{"a":1,"b":230,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 230 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 300, resolvedB: 1,
                fav: "red", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260826_205045",
        recordedAt: 1787745045715,
        settledAt:  1787746416582,
        fighters: { red: "Sing Dome Thong Nok Yeenladkrabang", blue: "Sila Ngoen Lanna Waterside" },
        initialFav: "red",
        initialOdds: { a: 10, b: 9 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 132, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 1, offsetMs: 30850, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"even","blueStatus":"even","marketState":"BOTH_EVEN"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 10,
                fav: "red", a: 10, b: 10
            },
            {
                step: 2, offsetMs: 49100, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 3, offsetMs: 253105, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 4, offsetMs: 300849, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 5, offsetMs: 325848, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 6, offsetMs: 340350, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 7, offsetMs: 385357, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 8, offsetMs: 421859, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 9, offsetMs: 450134, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 459608, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 11, offsetMs: 486609, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 504847, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 13, offsetMs: 540141, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 14, offsetMs: 554609, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 15, offsetMs: 580848, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 16, offsetMs: 617108, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 17, offsetMs: 651609, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 18, offsetMs: 669602, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 19, offsetMs: 720606, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 20, offsetMs: 751861, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 21, offsetMs: 772361, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 22, offsetMs: 834639, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 23, offsetMs: 849611, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 24, offsetMs: 876356, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 25, offsetMs: 896345, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 2, b: 7, raw: "🔵 น้ำเงิน: 2 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":2,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 26, offsetMs: 963861, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 27, offsetMs: 1005616, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 28, offsetMs: 1029604, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 29, offsetMs: 1070105, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 30, offsetMs: 1093364, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 31, offsetMs: 1165102, src: "auto_sync",
                red:  { a: 15, b: 1, raw: "🔴 แดง: HDP 15 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":15,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 15 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 15, resolvedB: 1,
                fav: "red", a: 15, b: 1
            },
            {
                step: 32, offsetMs: 1199855, src: "auto_sync",
                red:  { a: 14, b: 1, raw: "🔴 แดง: HDP 14 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":14,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 14 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 14, resolvedB: 1,
                fav: "red", a: 14, b: 1
            },
            {
                step: 33, offsetMs: 1220865, src: "auto_sync",
                red:  { a: 18, b: 1, raw: "🔴 แดง: HDP 18 : 1", isValid: true },
                blue: { a: 1, b: 13, raw: "🔵 น้ำเงิน: 1 : 13 HDP", isValid: true },
                v2: {"red":{"a":18,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 18 : 1"},"blue":{"a":1,"b":13,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 13 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 18, resolvedB: 1,
                fav: "red", a: 18, b: 1
            },
            {
                step: 34, offsetMs: 1238865, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 35, offsetMs: 1315091, src: "auto_sync",
                red:  { a: 70, b: 1, raw: "🔴 แดง: HDP 70 : 1", isValid: true },
                blue: { a: 1, b: 40, raw: "🔵 น้ำเงิน: 1 : 40 HDP", isValid: true },
                v2: {"red":{"a":70,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 70 : 1"},"blue":{"a":1,"b":40,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 40 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 70, resolvedB: 1,
                fav: "red", a: 70, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260826_203654",
        recordedAt: 1787744214605,
        settledAt:  1787744663627,
        fighters: { red: "Thun Miao Win T.N.Muaythai", blue: "Saifa Naksu Gym" },
        initialFav: "blue",
        initialOdds: { a: 7, b: 4 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 55, src: "open",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 1, offsetMs: 43472, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 157749, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 3, offsetMs: 198258, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 4, offsetMs: 236958, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 5, offsetMs: 274458, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 6, offsetMs: 345458, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            }
        ]
    },

        {
        fightId: "fight_20260826_211833",
        recordedAt: 1787746713077,
        settledAt:  1787747470428,
        fighters: { red: "Phet Dam B.S.Muaythai", blue: "Sositu Phayo P.Song Phaendin" },
        initialFav: "red",
        initialOdds: { a: 2, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 51, src: "open",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 22490, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 2, offsetMs: 168490, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 3, offsetMs: 197982, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 4, offsetMs: 232741, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 5, offsetMs: 244741, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 6, offsetMs: 334242, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 7, offsetMs: 411989, src: "auto_sync",
                red:  { a: 9, b: 1, raw: "🔴 แดง: HDP 9 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":9,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 9 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 9, resolvedB: 1,
                fav: "red", a: 9, b: 1
            },
            {
                step: 8, offsetMs: 436989, src: "auto_sync",
                red:  { a: 11, b: 1, raw: "🔴 แดง: HDP 11 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":11,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 11 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 1,
                fav: "red", a: 11, b: 1
            },
            {
                step: 9, offsetMs: 516229, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":13,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 13 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 10, offsetMs: 565479, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":8,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 8 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 11, offsetMs: 586497, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 12, offsetMs: 601988, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260826_213543",
        recordedAt: 1787747743053,
        settledAt:  1787748425569,
        fighters: { red: "Carlos Seven Muaythai", blue: "Thepsuthin Sak Inter" },
        initialFav: "red",
        initialOdds: { a: 5, b: 2 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 50, src: "open",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 1, offsetMs: 76271, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 2, offsetMs: 108290, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 3, offsetMs: 200506, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 4, offsetMs: 241517, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 5, offsetMs: 276008, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 6, offsetMs: 293773, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 7, offsetMs: 351289, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 8, offsetMs: 384302, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 9, offsetMs: 417307, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 10, offsetMs: 459308, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 11, offsetMs: 467025, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 12, offsetMs: 567289, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 13, offsetMs: 596507, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260827_200807",
        recordedAt: 1787828887419,
        settledAt:  1787830911530,
        fighters: { red: "Phet Atom Kiat Chamrun", blue: "Huai Senang S.S.Pakorn Surin" },
        initialFav: "red",
        initialOdds: { a: 2, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 60, src: "open",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 340949, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 2, offsetMs: 363944, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 3, offsetMs: 385214, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 4, offsetMs: 525205, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 5, offsetMs: 546959, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 6, offsetMs: 574940, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 7, offsetMs: 605445, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 8, offsetMs: 617443, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 9, offsetMs: 739703, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 10, offsetMs: 789859, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 11, offsetMs: 808468, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 12, offsetMs: 833204, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 13, offsetMs: 850198, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 14, offsetMs: 874459, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 15, offsetMs: 894951, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 16, offsetMs: 929757, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 17, offsetMs: 998456, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 18, offsetMs: 1020707, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 19, offsetMs: 1049455, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 20, offsetMs: 1090709, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 21, offsetMs: 1124201, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 22, offsetMs: 1140957, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 23, offsetMs: 1163205, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 24, offsetMs: 1180950, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 25, offsetMs: 1221198, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 26, offsetMs: 1232459, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 27, offsetMs: 1245459, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 28, offsetMs: 1309469, src: "auto_sync",
                red:  { a: 1, b: 5, raw: "🔴 แดง: HDP 1 : 5", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 1 : 5"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 29, offsetMs: 1370206, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 9, b: 1, raw: "🔵 น้ำเงิน: 9 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":9,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 9, resolvedB: 1,
                fav: "blue", a: 9, b: 1
            },
            {
                step: 30, offsetMs: 1421964, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 31, offsetMs: 1439698, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 32, offsetMs: 1468960, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 33, offsetMs: 1496198, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 34, offsetMs: 1514953, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 35, offsetMs: 1546959, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 36, offsetMs: 1630947, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 37, offsetMs: 1662963, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 38, offsetMs: 1735459, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 39, offsetMs: 1765948, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 40, offsetMs: 1794961, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 41, offsetMs: 1821211, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                v2: {"red":{"a":50,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 50 : 1"},"blue":{"a":1,"b":30,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 30 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            },
            {
                step: 42, offsetMs: 1844463, src: "auto_sync",
                red:  { a: 200, b: 1, raw: "🔴 แดง: HDP 200 : 1", isValid: true },
                blue: { a: 1, b: 130, raw: "🔵 น้ำเงิน: 1 : 130 HDP", isValid: true },
                v2: {"red":{"a":200,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 200 : 1"},"blue":{"a":1,"b":130,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 130 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 200, resolvedB: 1,
                fav: "red", a: 200, b: 1
            },
            {
                step: 43, offsetMs: 1865962, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 100, raw: "🔵 น้ำเงิน: 1 : 100 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":100,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 100 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260827_204421",
        recordedAt: 1787831061662,
        settledAt:  1787832688441,
        fighters: { red: "Phet Saharat Saimoon Snooker Club", blue: "Niwpakorn M.Ruamjai Pheuan" },
        initialFav: "red",
        initialOdds: { a: 3, b: 2 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 56, src: "open",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 1, offsetMs: 20738, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 2, offsetMs: 34220, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 3, offsetMs: 94228, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 4, offsetMs: 138956, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 5, offsetMs: 379965, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 6, offsetMs: 411205, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 7, offsetMs: 437959, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 8, offsetMs: 456959, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 9, offsetMs: 492211, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 510212, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 11, offsetMs: 539731, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 12, offsetMs: 558962, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 13, offsetMs: 580958, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 14, offsetMs: 612714, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 15, offsetMs: 712961, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 16, offsetMs: 763475, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 17, offsetMs: 804213, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 18, offsetMs: 833210, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 19, offsetMs: 870213, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 20, offsetMs: 998482, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 21, offsetMs: 1050961, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 22, offsetMs: 1083213, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 23, offsetMs: 1099712, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 24, offsetMs: 1164453, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 25, offsetMs: 1179706, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 26, offsetMs: 1195952, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 27, offsetMs: 1220465, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 28, offsetMs: 1280967, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 29, offsetMs: 1305217, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 30, offsetMs: 1344970, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 31, offsetMs: 1360722, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 32, offsetMs: 1383217, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 33, offsetMs: 1406467, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 34, offsetMs: 1449717, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":30,"isValid":true,"raw":"🔴 แดง: HDP 1 : 30"},"blue":{"a":50,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 50 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 35, offsetMs: 1475734, src: "auto_sync",
                red:  { a: 1, b: 100, raw: "🔴 แดง: HDP 1 : 100", isValid: true },
                blue: { a: 180, b: 1, raw: "🔵 น้ำเงิน: 180 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":100,"isValid":true,"raw":"🔴 แดง: HDP 1 : 100"},"blue":{"a":180,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 180 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 180, resolvedB: 1,
                fav: "blue", a: 180, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260827_211702",
        recordedAt: 1787833022024,
        settledAt:  1787834605042,
        fighters: { red: "Thung O Noi Bunlanna Muaythai", blue: "Yotharit Thep Phakin" },
        initialFav: "red",
        initialOdds: { a: 2, b: 1 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 97, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 45093, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 2, offsetMs: 82846, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 3, offsetMs: 116380, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 4, offsetMs: 147881, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 5, offsetMs: 237598, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 6, offsetMs: 251845, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 7, offsetMs: 355597, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 8, offsetMs: 373349, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 9, offsetMs: 391598, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 10, offsetMs: 422382, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 11, offsetMs: 451108, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 491602, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 13, offsetMs: 545595, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 14, offsetMs: 565599, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 15, offsetMs: 625355, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 16, offsetMs: 673354, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 17, offsetMs: 686605, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 18, offsetMs: 698853, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 19, offsetMs: 730124, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 20, offsetMs: 746855, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 21, offsetMs: 769350, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 22, offsetMs: 797357, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 23, offsetMs: 825351, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 24, offsetMs: 888868, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 25, offsetMs: 908853, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 26, offsetMs: 936090, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 27, offsetMs: 970090, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 28, offsetMs: 996354, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 29, offsetMs: 1035353, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 30, offsetMs: 1069607, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 31, offsetMs: 1091105, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 32, offsetMs: 1102103, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 33, offsetMs: 1118605, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 34, offsetMs: 1171105, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 35, offsetMs: 1198351, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 36, offsetMs: 1246105, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 37, offsetMs: 1264360, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 38, offsetMs: 1305858, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 39, offsetMs: 1391860, src: "auto_sync",
                red:  { a: 1, b: 40, raw: "🔴 แดง: HDP 1 : 40", isValid: true },
                blue: { a: 70, b: 1, raw: "🔵 น้ำเงิน: 70 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":40,"isValid":true,"raw":"🔴 แดง: HDP 1 : 40"},"blue":{"a":70,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 70 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 70, resolvedB: 1,
                fav: "blue", a: 70, b: 1
            },
            {
                step: 40, offsetMs: 1431107, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":30,"isValid":true,"raw":"🔴 แดง: HDP 1 : 30"},"blue":{"a":50,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 50 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 41, offsetMs: 1456356, src: "auto_sync",
                red:  { a: 1, b: 60, raw: "🔴 แดง: HDP 1 : 60", isValid: true },
                blue: { a: 100, b: 1, raw: "🔵 น้ำเงิน: 100 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":60,"isValid":true,"raw":"🔴 แดง: HDP 1 : 60"},"blue":{"a":100,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 100 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 100, resolvedB: 1,
                fav: "blue", a: 100, b: 1
            },
            {
                step: 42, offsetMs: 1483107, src: "auto_sync",
                red:  { a: 1, b: 80, raw: "🔴 แดง: HDP 1 : 80", isValid: true },
                blue: { a: 130, b: 1, raw: "🔵 น้ำเงิน: 130 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":80,"isValid":true,"raw":"🔴 แดง: HDP 1 : 80"},"blue":{"a":130,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 130 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 130, resolvedB: 1,
                fav: "blue", a: 130, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260829_142551",
        recordedAt: 1787981151065,
        settledAt:  1787982558004,
        fighters: { red: "Takhap Phet Sakwari", blue: "Dome Sri Phanom Gyms" },
        initialFav: "red",
        initialOdds: { a: 7, b: 4 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 52, src: "open",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 1, offsetMs: 14881, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 2, offsetMs: 26664, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 3, offsetMs: 73633, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 4, offsetMs: 91895, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 5, offsetMs: 107146, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 6, offsetMs: 128886, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 7, offsetMs: 164678, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 8, offsetMs: 185395, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 9, offsetMs: 214645, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 10, offsetMs: 231148, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 11, offsetMs: 296137, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 12, offsetMs: 335130, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 13, offsetMs: 350150, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 14, offsetMs: 370645, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 15, offsetMs: 403645, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 16, offsetMs: 427879, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 17, offsetMs: 540127, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 18, offsetMs: 561132, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 7, b: 2, raw: "🔵 น้ำเงิน: 7 : 2 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":7,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 2,
                fav: "blue", a: 7, b: 2
            },
            {
                step: 19, offsetMs: 598490, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 20, offsetMs: 632645, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 21, offsetMs: 650132, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 22, offsetMs: 665394, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 23, offsetMs: 707639, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 24, offsetMs: 727141, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 25, offsetMs: 751641, src: "auto_sync",
                red:  { a: 1, b: 8, raw: "🔴 แดง: HDP 1 : 8", isValid: true },
                blue: { a: 13, b: 1, raw: "🔵 น้ำเงิน: 13 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 1 : 8"},"blue":{"a":13,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 13 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 13, resolvedB: 1,
                fav: "blue", a: 13, b: 1
            },
            {
                step: 26, offsetMs: 792503, src: "auto_sync",
                red:  { a: 1, b: 8, raw: "🔴 แดง: HDP 1 : 8", isValid: true },
                blue: { a: 12, b: 1, raw: "🔵 น้ำเงิน: 12 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 1 : 8"},"blue":{"a":12,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 12 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 12, resolvedB: 1,
                fav: "blue", a: 12, b: 1
            },
            {
                step: 27, offsetMs: 822900, src: "auto_sync",
                red:  { a: 1, b: 12, raw: "🔴 แดง: HDP 1 : 12", isValid: true },
                blue: { a: 17, b: 1, raw: "🔵 น้ำเงิน: 17 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":12,"isValid":true,"raw":"🔴 แดง: HDP 1 : 12"},"blue":{"a":17,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 17 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 17, resolvedB: 1,
                fav: "blue", a: 17, b: 1
            },
            {
                step: 28, offsetMs: 875228, src: "auto_sync",
                red:  { a: 1, b: 20, raw: "🔴 แดง: HDP 1 : 20", isValid: true },
                blue: { a: 30, b: 1, raw: "🔵 น้ำเงิน: 30 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":20,"isValid":true,"raw":"🔴 แดง: HDP 1 : 20"},"blue":{"a":30,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 30 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 30, resolvedB: 1,
                fav: "blue", a: 30, b: 1
            },
            {
                step: 29, offsetMs: 896898, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":15,"isValid":true,"raw":"🔴 แดง: HDP 1 : 15"},"blue":{"a":25,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 25 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 30, offsetMs: 920149, src: "auto_sync",
                red:  { a: 1, b: 13, raw: "🔴 แดง: HDP 1 : 13", isValid: true },
                blue: { a: 20, b: 1, raw: "🔵 น้ำเงิน: 20 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":13,"isValid":true,"raw":"🔴 แดง: HDP 1 : 13"},"blue":{"a":20,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 20 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 20, resolvedB: 1,
                fav: "blue", a: 20, b: 1
            },
            {
                step: 31, offsetMs: 940397, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 32, offsetMs: 967897, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":15,"isValid":true,"raw":"🔴 แดง: HDP 1 : 15"},"blue":{"a":25,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 25 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 33, offsetMs: 987384, src: "auto_sync",
                red:  { a: 1, b: 50, raw: "🔴 แดง: HDP 1 : 50", isValid: true },
                blue: { a: 80, b: 1, raw: "🔵 น้ำเงิน: 80 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":50,"isValid":true,"raw":"🔴 แดง: HDP 1 : 50"},"blue":{"a":80,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 80 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 80, resolvedB: 1,
                fav: "blue", a: 80, b: 1
            },
            {
                step: 34, offsetMs: 1024637, src: "auto_sync",
                red:  { a: 1, b: 100, raw: "🔴 แดง: HDP 1 : 100", isValid: true },
                blue: { a: 180, b: 1, raw: "🔵 น้ำเงิน: 180 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":100,"isValid":true,"raw":"🔴 แดง: HDP 1 : 100"},"blue":{"a":180,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 180 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 180, resolvedB: 1,
                fav: "blue", a: 180, b: 1
            },
            {
                step: 35, offsetMs: 1059397, src: "auto_sync",
                red:  { a: 1, b: 150, raw: "🔴 แดง: HDP 1 : 150", isValid: true },
                blue: { a: 200, b: 1, raw: "🔵 น้ำเงิน: 200 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":150,"isValid":true,"raw":"🔴 แดง: HDP 1 : 150"},"blue":{"a":200,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 200 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 200, resolvedB: 1,
                fav: "blue", a: 200, b: 1
            },
            {
                step: 36, offsetMs: 1115133, src: "auto_sync",
                red:  { a: 1, b: 180, raw: "🔴 แดง: HDP 1 : 180", isValid: true },
                blue: { a: 260, b: 1, raw: "🔵 น้ำเงิน: 260 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":180,"isValid":true,"raw":"🔴 แดง: HDP 1 : 180"},"blue":{"a":260,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 260 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 260, resolvedB: 1,
                fav: "blue", a: 260, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260829_144952",
        recordedAt: 1787982592257,
        settledAt:  1787984184674,
        fighters: { red: "Phloy Mongkhon T.K.D.Muaythai", blue: "Phet Amin Kiat Phetdecha" },
        initialFav: "red",
        initialOdds: { a: 2, b: 1 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 53, src: "open",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 84951, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 2, offsetMs: 149947, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 3, offsetMs: 175460, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 4, offsetMs: 210706, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 5, offsetMs: 233955, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 6, offsetMs: 316934, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 2, b: 7, raw: "🔵 น้ำเงิน: 2 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":2,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 7, offsetMs: 404691, src: "auto_sync",
                red:  { a: 6, b: 1, raw: "🔴 แดง: HDP 6 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":6,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 6 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 6, resolvedB: 1,
                fav: "red", a: 6, b: 1
            },
            {
                step: 8, offsetMs: 448190, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 9, offsetMs: 487933, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 10, offsetMs: 504696, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 11, offsetMs: 534935, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 12, offsetMs: 566192, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 13, offsetMs: 604699, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 14, offsetMs: 647442, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 15, offsetMs: 661193, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 16, offsetMs: 755855, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 17, offsetMs: 768439, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 18, offsetMs: 790458, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 19, offsetMs: 806709, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 20, offsetMs: 830457, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 21, offsetMs: 853192, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 22, offsetMs: 866707, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 23, offsetMs: 887958, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 24, offsetMs: 903261, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 25, offsetMs: 950194, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 26, offsetMs: 982759, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 27, offsetMs: 996194, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 28, offsetMs: 1038444, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 29, offsetMs: 1064693, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 30, offsetMs: 1087460, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 31, offsetMs: 1106959, src: "auto_sync",
                red:  { a: 30, b: 1, raw: "🔴 แดง: HDP 30 : 1", isValid: true },
                blue: { a: 1, b: 20, raw: "🔵 น้ำเงิน: 1 : 20 HDP", isValid: true },
                v2: {"red":{"a":30,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 30 : 1"},"blue":{"a":1,"b":20,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 20 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 30, resolvedB: 1,
                fav: "red", a: 30, b: 1
            },
            {
                step: 32, offsetMs: 1133442, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 33, offsetMs: 1162693, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 34, offsetMs: 1289194, src: "auto_sync",
                red:  { a: 20, b: 1, raw: "🔴 แดง: HDP 20 : 1", isValid: true },
                blue: { a: 1, b: 14, raw: "🔵 น้ำเงิน: 1 : 14 HDP", isValid: true },
                v2: {"red":{"a":20,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 20 : 1"},"blue":{"a":1,"b":14,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 14 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 20, resolvedB: 1,
                fav: "red", a: 20, b: 1
            },
            {
                step: 35, offsetMs: 1313958, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 36, offsetMs: 1355194, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 37, offsetMs: 1383185, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 38, offsetMs: 1413444, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 39, offsetMs: 1437444, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 40, offsetMs: 1466443, src: "auto_sync",
                red:  { a: 1, b: 8, raw: "🔴 แดง: HDP 1 : 8", isValid: true },
                blue: { a: 13, b: 1, raw: "🔵 น้ำเงิน: 13 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 1 : 8"},"blue":{"a":13,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 13 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 13, resolvedB: 1,
                fav: "blue", a: 13, b: 1
            }
        ]
    },

    {
        fightId: "fight_20260829_151808",
        recordedAt: 1787984288785,
        settledAt:  1787985788174,
        fighters: { red: "Thong Thai P.K.Saenchai Muaythai", blue: "Phadetsuek T.Yaem Suan" },
        initialFav: "blue",
        initialOdds: { a: 5, b: 3 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 57662, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 1, offsetMs: 147665, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 230420, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 3, offsetMs: 246234, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 4, offsetMs: 310168, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 5, offsetMs: 333163, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 6, offsetMs: 383933, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 7, offsetMs: 406679, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 8, offsetMs: 437419, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 9, offsetMs: 482659, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 10, offsetMs: 496912, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 11, offsetMs: 516911, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 12, offsetMs: 587924, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 13, offsetMs: 661164, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 14, offsetMs: 679910, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 15, offsetMs: 702169, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 16, offsetMs: 726666, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 17, offsetMs: 754912, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 18, offsetMs: 792167, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 19, offsetMs: 802166, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 20, offsetMs: 820157, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 21, offsetMs: 862419, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 6, b: 1, raw: "🔵 น้ำเงิน: 6 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":6,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 6 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 6, resolvedB: 1,
                fav: "blue", a: 6, b: 1
            },
            {
                step: 22, offsetMs: 899435, src: "auto_sync",
                red:  { a: 2, b: 7, raw: "🔴 แดง: HDP 2 : 7", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 2 : 7"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 23, offsetMs: 920670, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 24, offsetMs: 966668, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 6, b: 1, raw: "🔵 น้ำเงิน: 6 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":6,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 6 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 6, resolvedB: 1,
                fav: "blue", a: 6, b: 1
            },
            {
                step: 25, offsetMs: 984920, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 26, offsetMs: 1014919, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 27, offsetMs: 1034921, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 28, offsetMs: 1046928, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 29, offsetMs: 1075421, src: "auto_sync",
                red:  { a: 1, b: 8, raw: "🔴 แดง: HDP 1 : 8", isValid: true },
                blue: { a: 13, b: 1, raw: "🔵 น้ำเงิน: 13 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 1 : 8"},"blue":{"a":13,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 13 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 13, resolvedB: 1,
                fav: "blue", a: 13, b: 1
            },
            {
                step: 30, offsetMs: 1101159, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 31, offsetMs: 1213171, src: "auto_sync",
                red:  { a: 1, b: 8, raw: "🔴 แดง: HDP 1 : 8", isValid: true },
                blue: { a: 13, b: 1, raw: "🔵 น้ำเงิน: 13 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 1 : 8"},"blue":{"a":13,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 13 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 13, resolvedB: 1,
                fav: "blue", a: 13, b: 1
            },
            {
                step: 32, offsetMs: 1264668, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 33, offsetMs: 1301663, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 34, offsetMs: 1328918, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 35, offsetMs: 1349934, src: "auto_sync",
                red:  { a: 1, b: 5, raw: "🔴 แดง: HDP 1 : 5", isValid: true },
                blue: { a: 8, b: 1, raw: "🔵 น้ำเงิน: 8 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 1 : 5"},"blue":{"a":8,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 8, resolvedB: 1,
                fav: "blue", a: 8, b: 1
            },
            {
                step: 36, offsetMs: 1384417, src: "auto_sync",
                red:  { a: 1, b: 8, raw: "🔴 แดง: HDP 1 : 8", isValid: true },
                blue: { a: 13, b: 1, raw: "🔵 น้ำเงิน: 13 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 1 : 8"},"blue":{"a":13,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 13 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 13, resolvedB: 1,
                fav: "blue", a: 13, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260829_172755",
        recordedAt: 1787992075649,
        settledAt:  1787993570913,
        fighters: { red: "Saen Keng Muping Aroi Chungboi Hua Hin", blue: "Pin kliao S.Dechaphan" },
        initialFav: "red",
        initialOdds: { a: 2, b: 1 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 65, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 1, offsetMs: 73501, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 2, offsetMs: 148504, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 3, offsetMs: 183004, src: "auto_sync",
                red:  { a: 7, b: 2, raw: "🔴 แดง: HDP 7 : 2", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 7 : 2"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 2,
                fav: "red", a: 7, b: 2
            },
            {
                step: 4, offsetMs: 214569, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 5, offsetMs: 264758, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 2, b: 7, raw: "🔵 น้ำเงิน: 2 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":2,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 6, offsetMs: 287767, src: "auto_sync",
                red:  { a: 6, b: 1, raw: "🔴 แดง: HDP 6 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":6,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 6 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 6, resolvedB: 1,
                fav: "red", a: 6, b: 1
            },
            {
                step: 7, offsetMs: 371518, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 8, offsetMs: 428265, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 9, offsetMs: 474068, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 10, offsetMs: 494780, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 11, offsetMs: 565004, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 12, offsetMs: 591510, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 2, b: 7, raw: "🔵 น้ำเงิน: 2 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":2,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 13, offsetMs: 606072, src: "auto_sync",
                red:  { a: 6, b: 1, raw: "🔴 แดง: HDP 6 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":6,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 6 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 6, resolvedB: 1,
                fav: "red", a: 6, b: 1
            },
            {
                step: 14, offsetMs: 666016, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 15, offsetMs: 679015, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 16, offsetMs: 742270, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 17, offsetMs: 769270, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 18, offsetMs: 783759, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 19, offsetMs: 815771, src: "auto_sync",
                red:  { a: 20, b: 1, raw: "🔴 แดง: HDP 20 : 1", isValid: true },
                blue: { a: 1, b: 13, raw: "🔵 น้ำเงิน: 1 : 13 HDP", isValid: true },
                v2: {"red":{"a":20,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 20 : 1"},"blue":{"a":1,"b":13,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 13 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 20, resolvedB: 1,
                fav: "red", a: 20, b: 1
            },
            {
                step: 20, offsetMs: 889271, src: "auto_sync",
                red:  { a: 12, b: 1, raw: "🔴 แดง: HDP 12 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":12,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 12 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 12, resolvedB: 1,
                fav: "red", a: 12, b: 1
            },
            {
                step: 21, offsetMs: 913010, src: "auto_sync",
                red:  { a: 17, b: 1, raw: "🔴 แดง: HDP 17 : 1", isValid: true },
                blue: { a: 1, b: 12, raw: "🔵 น้ำเงิน: 1 : 12 HDP", isValid: true },
                v2: {"red":{"a":17,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 17 : 1"},"blue":{"a":1,"b":12,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 12 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 17, resolvedB: 1,
                fav: "red", a: 17, b: 1
            },
            {
                step: 22, offsetMs: 963754, src: "auto_sync",
                red:  { a: 15, b: 1, raw: "🔴 แดง: HDP 15 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":15,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 15 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 15, resolvedB: 1,
                fav: "red", a: 15, b: 1
            },
            {
                step: 23, offsetMs: 992022, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 24, offsetMs: 1015007, src: "auto_sync",
                red:  { a: 30, b: 1, raw: "🔴 แดง: HDP 30 : 1", isValid: true },
                blue: { a: 1, b: 20, raw: "🔵 น้ำเงิน: 1 : 20 HDP", isValid: true },
                v2: {"red":{"a":30,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 30 : 1"},"blue":{"a":1,"b":20,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 20 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 30, resolvedB: 1,
                fav: "red", a: 30, b: 1
            },
            {
                step: 25, offsetMs: 1028255, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                v2: {"red":{"a":50,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 50 : 1"},"blue":{"a":1,"b":30,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 30 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            },
            {
                step: 26, offsetMs: 1050755, src: "auto_sync",
                red:  { a: 70, b: 1, raw: "🔴 แดง: HDP 70 : 1", isValid: true },
                blue: { a: 1, b: 40, raw: "🔵 น้ำเงิน: 1 : 40 HDP", isValid: true },
                v2: {"red":{"a":70,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 70 : 1"},"blue":{"a":1,"b":40,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 40 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 70, resolvedB: 1,
                fav: "red", a: 70, b: 1
            },
            {
                step: 27, offsetMs: 1077756, src: "auto_sync",
                red:  { a: 130, b: 1, raw: "🔴 แดง: HDP 130 : 1", isValid: true },
                blue: { a: 1, b: 80, raw: "🔵 น้ำเงิน: 1 : 80 HDP", isValid: true },
                v2: {"red":{"a":130,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 130 : 1"},"blue":{"a":1,"b":80,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 80 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 130, resolvedB: 1,
                fav: "red", a: 130, b: 1
            },
            {
                step: 28, offsetMs: 1116513, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 100, raw: "🔵 น้ำเงิน: 1 : 100 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":100,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 100 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            },
            {
                step: 29, offsetMs: 1181256, src: "auto_sync",
                red:  { a: 200, b: 1, raw: "🔴 แดง: HDP 200 : 1", isValid: true },
                blue: { a: 1, b: 150, raw: "🔵 น้ำเงิน: 1 : 150 HDP", isValid: true },
                v2: {"red":{"a":200,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 200 : 1"},"blue":{"a":1,"b":150,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 150 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 200, resolvedB: 1,
                fav: "red", a: 200, b: 1
            },
            {
                step: 30, offsetMs: 1215755, src: "auto_sync",
                red:  { a: 260, b: 1, raw: "🔴 แดง: HDP 260 : 1", isValid: true },
                blue: { a: 1, b: 180, raw: "🔵 น้ำเงิน: 1 : 180 HDP", isValid: true },
                v2: {"red":{"a":260,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 260 : 1"},"blue":{"a":1,"b":180,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 180 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 260, resolvedB: 1,
                fav: "red", a: 260, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260830_195946",
        recordedAt: 1788087586075,
        settledAt:  1788089573160,
        fighters: { red: "Ngao Phet Golita Muaythai", blue: "Phet Sky P.K.Lek Peis House" },
        initialFav: "blue",
        initialOdds: { a: 3, b: 2 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 300524, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 1, offsetMs: 494547, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 2, offsetMs: 512544, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 3, offsetMs: 565048, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 4, offsetMs: 596255, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 5, offsetMs: 622056, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 6, offsetMs: 670528, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 7, offsetMs: 697046, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 8, offsetMs: 751254, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 9, offsetMs: 774259, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 10, offsetMs: 812007, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 11, offsetMs: 847260, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 885757, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 13, offsetMs: 898507, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 14, offsetMs: 918257, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 15, offsetMs: 935007, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 16, offsetMs: 957757, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 17, offsetMs: 1014756, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 18, offsetMs: 1031764, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 19, offsetMs: 1074258, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 20, offsetMs: 1089259, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 21, offsetMs: 1119749, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 22, offsetMs: 1163757, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 23, offsetMs: 1184255, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 24, offsetMs: 1217267, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 25, offsetMs: 1269012, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 26, offsetMs: 1320513, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 27, offsetMs: 1384505, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 28, offsetMs: 1400546, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 29, offsetMs: 1481258, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 30, offsetMs: 1504505, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":8,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 8 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 31, offsetMs: 1542511, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 32, offsetMs: 1557512, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 33, offsetMs: 1579262, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 34, offsetMs: 1714763, src: "auto_sync",
                red:  { a: 30, b: 1, raw: "🔴 แดง: HDP 30 : 1", isValid: true },
                blue: { a: 1, b: 20, raw: "🔵 น้ำเงิน: 1 : 20 HDP", isValid: true },
                v2: {"red":{"a":30,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 30 : 1"},"blue":{"a":1,"b":20,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 20 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 30, resolvedB: 1,
                fav: "red", a: 30, b: 1
            },
            {
                step: 35, offsetMs: 1763009, src: "auto_sync",
                red:  { a: 50, b: 1, raw: "🔴 แดง: HDP 50 : 1", isValid: true },
                blue: { a: 1, b: 30, raw: "🔵 น้ำเงิน: 1 : 30 HDP", isValid: true },
                v2: {"red":{"a":50,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 50 : 1"},"blue":{"a":1,"b":30,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 30 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 50, resolvedB: 1,
                fav: "red", a: 50, b: 1
            },
            {
                step: 36, offsetMs: 1790559, src: "auto_sync",
                red:  { a: 130, b: 1, raw: "🔴 แดง: HDP 130 : 1", isValid: true },
                blue: { a: 1, b: 80, raw: "🔵 น้ำเงิน: 1 : 80 HDP", isValid: true },
                v2: {"red":{"a":130,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 130 : 1"},"blue":{"a":1,"b":80,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 80 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 130, resolvedB: 1,
                fav: "red", a: 130, b: 1
            },
            {
                step: 37, offsetMs: 1809011, src: "auto_sync",
                red:  { a: 300, b: 1, raw: "🔴 แดง: HDP 300 : 1", isValid: true },
                blue: { a: 1, b: 230, raw: "🔵 น้ำเงิน: 1 : 230 HDP", isValid: true },
                v2: {"red":{"a":300,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 300 : 1"},"blue":{"a":1,"b":230,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 230 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 300, resolvedB: 1,
                fav: "red", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260830_203440",
        recordedAt: 1788089680841,
        settledAt:  1788091377759,
        fighters: { red: "Prapsuek Thuengsiapyuan", blue: "Xsa Wan Khongohm." },
        initialFav: "blue",
        initialOdds: { a: 11, b: 8 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 63, src: "open",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 1, offsetMs: 45749, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 77246, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 3, offsetMs: 131493, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 4, offsetMs: 201247, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 5, offsetMs: 217264, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 6, offsetMs: 251760, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 7, offsetMs: 311765, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 8, offsetMs: 336759, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 9, offsetMs: 402518, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 10, offsetMs: 427006, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 11, offsetMs: 460748, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 12, offsetMs: 508741, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 13, offsetMs: 523985, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 14, offsetMs: 550741, src: "auto_sync",
                red:  { a: 4, b: 7, raw: "🔴 แดง: HDP 4 : 7", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":7,"isValid":true,"raw":"🔴 แดง: HDP 4 : 7"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 15, offsetMs: 572246, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 16, offsetMs: 596994, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 17, offsetMs: 628244, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 18, offsetMs: 783261, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 5, b: 2, raw: "🔵 น้ำเงิน: 5 : 2 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":5,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 2,
                fav: "blue", a: 5, b: 2
            },
            {
                step: 19, offsetMs: 830243, src: "auto_sync",
                red:  { a: 2, b: 5, raw: "🔴 แดง: HDP 2 : 5", isValid: true },
                blue: { a: 4, b: 1, raw: "🔵 น้ำเงิน: 4 : 1 HDP", isValid: true },
                v2: {"red":{"a":2,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 2 : 5"},"blue":{"a":4,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 4, resolvedB: 1,
                fav: "blue", a: 4, b: 1
            },
            {
                step: 20, offsetMs: 852245, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 21, offsetMs: 877249, src: "auto_sync",
                red:  { a: 1, b: 6, raw: "🔴 แดง: HDP 1 : 6", isValid: true },
                blue: { a: 10, b: 1, raw: "🔵 น้ำเงิน: 10 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":6,"isValid":true,"raw":"🔴 แดง: HDP 1 : 6"},"blue":{"a":10,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 1,
                fav: "blue", a: 10, b: 1
            },
            {
                step: 22, offsetMs: 898759, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 23, offsetMs: 968503, src: "auto_sync",
                red:  { a: 1, b: 13, raw: "🔴 แดง: HDP 1 : 13", isValid: true },
                blue: { a: 20, b: 1, raw: "🔵 น้ำเงิน: 20 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":13,"isValid":true,"raw":"🔴 แดง: HDP 1 : 13"},"blue":{"a":20,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 20 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 20, resolvedB: 1,
                fav: "blue", a: 20, b: 1
            },
            {
                step: 24, offsetMs: 1027019, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":15,"isValid":true,"raw":"🔴 แดง: HDP 1 : 15"},"blue":{"a":25,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 25 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 25, offsetMs: 1088314, src: "auto_sync",
                red:  { a: 1, b: 12, raw: "🔴 แดง: HDP 1 : 12", isValid: true },
                blue: { a: 17, b: 1, raw: "🔵 น้ำเงิน: 17 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":12,"isValid":true,"raw":"🔴 แดง: HDP 1 : 12"},"blue":{"a":17,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 17 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 17, resolvedB: 1,
                fav: "blue", a: 17, b: 1
            },
            {
                step: 26, offsetMs: 1138582, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":15,"isValid":true,"raw":"🔴 แดง: HDP 1 : 15"},"blue":{"a":25,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 25 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 27, offsetMs: 1176833, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":30,"isValid":true,"raw":"🔴 แดง: HDP 1 : 30"},"blue":{"a":50,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 50 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 28, offsetMs: 1228035, src: "auto_sync",
                red:  { a: 1, b: 100, raw: "🔴 แดง: HDP 1 : 100", isValid: true },
                blue: { a: 180, b: 1, raw: "🔵 น้ำเงิน: 180 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":100,"isValid":true,"raw":"🔴 แดง: HDP 1 : 100"},"blue":{"a":180,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 180 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 180, resolvedB: 1,
                fav: "blue", a: 180, b: 1
            },
            {
                step: 29, offsetMs: 1329933, src: "auto_sync",
                red:  { a: 1, b: 180, raw: "🔴 แดง: HDP 1 : 180", isValid: true },
                blue: { a: 260, b: 1, raw: "🔵 น้ำเงิน: 260 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":180,"isValid":true,"raw":"🔴 แดง: HDP 1 : 180"},"blue":{"a":260,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 260 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 260, resolvedB: 1,
                fav: "blue", a: 260, b: 1
            },
            {
                step: 30, offsetMs: 1393933, src: "auto_sync",
                red:  { a: 1, b: 230, raw: "🔴 แดง: HDP 1 : 230", isValid: true },
                blue: { a: 300, b: 1, raw: "🔵 น้ำเงิน: 300 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":230,"isValid":true,"raw":"🔴 แดง: HDP 1 : 230"},"blue":{"a":300,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 300 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 300, resolvedB: 1,
                fav: "blue", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260830_210401",
        recordedAt: 1788091441831,
        settledAt:  1788092093395,
        fighters: { red: "Phetkla InFightStyle", blue: "Panthep Ekmueangnon" },
        initialFav: "blue",
        initialOdds: { a: 5, b: 3 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 118495, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 1, offsetMs: 163762, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 183000, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 3, offsetMs: 267756, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 4, offsetMs: 288752, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 5, offsetMs: 308010, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 6, offsetMs: 325055, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 7, offsetMs: 372498, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 8, offsetMs: 418344, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 9, offsetMs: 449554, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 10, offsetMs: 498509, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 11, offsetMs: 511064, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 9,
                fav: "blue", a: 10, b: 9
            },
            {
                step: 12, offsetMs: 553056, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 13, offsetMs: 579758, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            }
        ]
    },

        {
        fightId: "fight_20260830_211826",
        recordedAt: 1788092306560,
        settledAt:  1788094469311,
        fighters: { red: "Phetnorasing P.Ksanchai", blue: "Ekkalak S.Saman Garment" },
        initialFav: "blue",
        initialOdds: { a: 3, b: 2 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 84, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 1, offsetMs: 38271, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 2, offsetMs: 88768, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 3, offsetMs: 199284, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 9,
                fav: "blue", a: 10, b: 9
            },
            {
                step: 4, offsetMs: 268283, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 5, offsetMs: 289018, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 6, offsetMs: 409518, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 10, resolvedB: 9,
                fav: "blue", a: 10, b: 9
            },
            {
                step: 7, offsetMs: 605278, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 8, offsetMs: 689019, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 9, offsetMs: 735768, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 10, offsetMs: 822769, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 11, offsetMs: 874035, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 891517, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 13, offsetMs: 922769, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 14, offsetMs: 952278, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 15, offsetMs: 1019517, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 16, offsetMs: 1137022, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 17, offsetMs: 1202786, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 18, offsetMs: 1247022, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 19, offsetMs: 1288586, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 20, offsetMs: 1299521, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 21, offsetMs: 1323270, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 22, offsetMs: 1350078, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 23, offsetMs: 1364023, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 24, offsetMs: 1383533, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 25, offsetMs: 1414286, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 26, offsetMs: 1521770, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 2, b: 7, raw: "🔵 น้ำเงิน: 2 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":2,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 27, offsetMs: 1574270, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 28, offsetMs: 1589790, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 29, offsetMs: 1624580, src: "auto_sync",
                red:  { a: 10, b: 1, raw: "🔴 แดง: HDP 10 : 1", isValid: true },
                blue: { a: 1, b: 6, raw: "🔵 น้ำเงิน: 1 : 6 HDP", isValid: true },
                v2: {"red":{"a":10,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 10 : 1"},"blue":{"a":1,"b":6,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 6 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 1,
                fav: "red", a: 10, b: 1
            },
            {
                step: 30, offsetMs: 1650080, src: "auto_sync",
                red:  { a: 13, b: 1, raw: "🔴 แดง: HDP 13 : 1", isValid: true },
                blue: { a: 1, b: 8, raw: "🔵 น้ำเงิน: 1 : 8 HDP", isValid: true },
                v2: {"red":{"a":13,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 13 : 1"},"blue":{"a":1,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 8 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 13, resolvedB: 1,
                fav: "red", a: 13, b: 1
            },
            {
                step: 31, offsetMs: 1672574, src: "auto_sync",
                red:  { a: 8, b: 1, raw: "🔴 แดง: HDP 8 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":8,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 8 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 8, resolvedB: 1,
                fav: "red", a: 8, b: 1
            },
            {
                step: 32, offsetMs: 1715277, src: "auto_sync",
                red:  { a: 25, b: 1, raw: "🔴 แดง: HDP 25 : 1", isValid: true },
                blue: { a: 1, b: 15, raw: "🔵 น้ำเงิน: 1 : 15 HDP", isValid: true },
                v2: {"red":{"a":25,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 25 : 1"},"blue":{"a":1,"b":15,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 15 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 25, resolvedB: 1,
                fav: "red", a: 25, b: 1
            },
            {
                step: 33, offsetMs: 1769778, src: "auto_sync",
                red:  { a: 70, b: 1, raw: "🔴 แดง: HDP 70 : 1", isValid: true },
                blue: { a: 1, b: 40, raw: "🔵 น้ำเงิน: 1 : 40 HDP", isValid: true },
                v2: {"red":{"a":70,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 70 : 1"},"blue":{"a":1,"b":40,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 40 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 70, resolvedB: 1,
                fav: "red", a: 70, b: 1
            },
            {
                step: 34, offsetMs: 1824273, src: "auto_sync",
                red:  { a: 80, b: 1, raw: "🔴 แดง: HDP 80 : 1", isValid: true },
                blue: { a: 1, b: 50, raw: "🔵 น้ำเงิน: 1 : 50 HDP", isValid: true },
                v2: {"red":{"a":80,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 80 : 1"},"blue":{"a":1,"b":50,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 50 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 80, resolvedB: 1,
                fav: "red", a: 80, b: 1
            },
            {
                step: 35, offsetMs: 1921770, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 100, raw: "🔵 น้ำเงิน: 1 : 100 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":100,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 100 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            },
            {
                step: 36, offsetMs: 1950534, src: "auto_sync",
                red:  { a: 300, b: 1, raw: "🔴 แดง: HDP 300 : 1", isValid: true },
                blue: { a: 1, b: 230, raw: "🔵 น้ำเงิน: 1 : 230 HDP", isValid: true },
                v2: {"red":{"a":300,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 300 : 1"},"blue":{"a":1,"b":230,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 230 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 300, resolvedB: 1,
                fav: "red", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260901_203416",
        recordedAt: 1788262456093,
        settledAt:  1788264109604,
        fighters: { red: "Lotus Sit Sutyot", blue: "Sing Samoi S.Phanom Sing" },
        initialFav: "red",
        initialOdds: { a: 5, b: 3 },
        winner: "red",
        journey: [
            {
                step: 0, offsetMs: 153356, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 1, offsetMs: 208018, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 279268, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 3, offsetMs: 313025, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 4, offsetMs: 347756, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 5, offsetMs: 379578, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 6, offsetMs: 417757, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 7, offsetMs: 451544, src: "auto_sync",
                red:  { a: 5, b: 3, raw: "🔴 แดง: HDP 5 : 3", isValid: true },
                blue: { a: 8, b: 11, raw: "🔵 น้ำเงิน: 8 : 11 HDP", isValid: true },
                v2: {"red":{"a":5,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 5 : 3"},"blue":{"a":8,"b":11,"isValid":true,"raw":"🔵 น้ำเงิน: 8 : 11 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 3,
                fav: "red", a: 5, b: 3
            },
            {
                step: 8, offsetMs: 496280, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 9, offsetMs: 537778, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 3, b: 5, raw: "🔵 น้ำเงิน: 3 : 5 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":3,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 10, offsetMs: 558784, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 11, offsetMs: 605506, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 12, offsetMs: 647260, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 13, offsetMs: 698771, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 14, offsetMs: 766749, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 15, offsetMs: 819044, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 16, offsetMs: 874546, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 17, offsetMs: 909252, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 18, offsetMs: 931009, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 19, offsetMs: 940539, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 20, offsetMs: 1005504, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 21, offsetMs: 1044763, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 5, raw: "🔵 น้ำเงิน: 1 : 5 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 22, offsetMs: 1119764, src: "auto_sync",
                red:  { a: 7, b: 1, raw: "🔴 แดง: HDP 7 : 1", isValid: true },
                blue: { a: 1, b: 4, raw: "🔵 น้ำเงิน: 1 : 4 HDP", isValid: true },
                v2: {"red":{"a":7,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 7 : 1"},"blue":{"a":1,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 4 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 1,
                fav: "red", a: 7, b: 1
            },
            {
                step: 23, offsetMs: 1155513, src: "auto_sync",
                red:  { a: 16, b: 1, raw: "🔴 แดง: HDP 16 : 1", isValid: true },
                blue: { a: 1, b: 10, raw: "🔵 น้ำเงิน: 1 : 10 HDP", isValid: true },
                v2: {"red":{"a":16,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 16 : 1"},"blue":{"a":1,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 16, resolvedB: 1,
                fav: "red", a: 16, b: 1
            },
            {
                step: 24, offsetMs: 1181263, src: "auto_sync",
                red:  { a: 30, b: 1, raw: "🔴 แดง: HDP 30 : 1", isValid: true },
                blue: { a: 1, b: 20, raw: "🔵 น้ำเงิน: 1 : 20 HDP", isValid: true },
                v2: {"red":{"a":30,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 30 : 1"},"blue":{"a":1,"b":20,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 20 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 30, resolvedB: 1,
                fav: "red", a: 30, b: 1
            },
            {
                step: 25, offsetMs: 1202009, src: "auto_sync",
                red:  { a: 80, b: 1, raw: "🔴 แดง: HDP 80 : 1", isValid: true },
                blue: { a: 1, b: 50, raw: "🔵 น้ำเงิน: 1 : 50 HDP", isValid: true },
                v2: {"red":{"a":80,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 80 : 1"},"blue":{"a":1,"b":50,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 50 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 80, resolvedB: 1,
                fav: "red", a: 80, b: 1
            },
            {
                step: 26, offsetMs: 1229521, src: "auto_sync",
                red:  { a: 130, b: 1, raw: "🔴 แดง: HDP 130 : 1", isValid: true },
                blue: { a: 1, b: 80, raw: "🔵 น้ำเงิน: 1 : 80 HDP", isValid: true },
                v2: {"red":{"a":130,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 130 : 1"},"blue":{"a":1,"b":80,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 80 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 130, resolvedB: 1,
                fav: "red", a: 130, b: 1
            },
            {
                step: 27, offsetMs: 1254762, src: "auto_sync",
                red:  { a: 180, b: 1, raw: "🔴 แดง: HDP 180 : 1", isValid: true },
                blue: { a: 1, b: 100, raw: "🔵 น้ำเงิน: 1 : 100 HDP", isValid: true },
                v2: {"red":{"a":180,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 180 : 1"},"blue":{"a":1,"b":100,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 100 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 180, resolvedB: 1,
                fav: "red", a: 180, b: 1
            },
            {
                step: 28, offsetMs: 1301760, src: "auto_sync",
                red:  { a: 260, b: 1, raw: "🔴 แดง: HDP 260 : 1", isValid: true },
                blue: { a: 1, b: 180, raw: "🔵 น้ำเงิน: 1 : 180 HDP", isValid: true },
                v2: {"red":{"a":260,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 260 : 1"},"blue":{"a":1,"b":180,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 180 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 260, resolvedB: 1,
                fav: "red", a: 260, b: 1
            },
            {
                step: 29, offsetMs: 1345543, src: "auto_sync",
                red:  { a: 300, b: 1, raw: "🔴 แดง: HDP 300 : 1", isValid: true },
                blue: { a: 1, b: 230, raw: "🔵 น้ำเงิน: 1 : 230 HDP", isValid: true },
                v2: {"red":{"a":300,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 300 : 1"},"blue":{"a":1,"b":230,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 230 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 300, resolvedB: 1,
                fav: "red", a: 300, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260901_210245",
        recordedAt: 1788264165660,
        settledAt:  1788265771066,
        fighters: { red: "Seksit Kotchi Muaychop", blue: "Rungphet Sing Decha" },
        initialFav: "red",
        initialOdds: { a: 10, b: 9 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 198194, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 1, offsetMs: 221436, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 2, offsetMs: 261187, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 3, offsetMs: 289688, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 4, offsetMs: 311693, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 5, offsetMs: 383229, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 6, offsetMs: 397196, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 7, offsetMs: 418440, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 8, offsetMs: 443244, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 9, offsetMs: 497442, src: "auto_sync",
                red:  { a: 8, b: 11, raw: "🔴 แดง: HDP 8 : 11", isValid: true },
                blue: { a: 5, b: 3, raw: "🔵 น้ำเงิน: 5 : 3 HDP", isValid: true },
                v2: {"red":{"a":8,"b":11,"isValid":true,"raw":"🔴 แดง: HDP 8 : 11"},"blue":{"a":5,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 3 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 3,
                fav: "blue", a: 5, b: 3
            },
            {
                step: 10, offsetMs: 554442, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 11, offsetMs: 592934, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 12, offsetMs: 612724, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 13, offsetMs: 682687, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 14, offsetMs: 697444, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 15, offsetMs: 741434, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 16, offsetMs: 783931, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 17, offsetMs: 805444, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 18, offsetMs: 830943, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 19, offsetMs: 874946, src: "auto_sync",
                red:  { a: 3, b: 5, raw: "🔴 แดง: HDP 3 : 5", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":3,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 3 : 5"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 20, offsetMs: 900433, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 21, offsetMs: 945730, src: "auto_sync",
                red:  { a: 1, b: 2, raw: "🔴 แดง: HDP 1 : 2", isValid: true },
                blue: { a: 3, b: 1, raw: "🔵 น้ำเงิน: 3 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 1 : 2"},"blue":{"a":3,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 1,
                fav: "blue", a: 3, b: 1
            },
            {
                step: 22, offsetMs: 1079226, src: "auto_sync",
                red:  { a: 1, b: 3, raw: "🔴 แดง: HDP 1 : 3", isValid: true },
                blue: { a: 5, b: 1, raw: "🔵 น้ำเงิน: 5 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 1 : 3"},"blue":{"a":5,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 1,
                fav: "blue", a: 5, b: 1
            },
            {
                step: 23, offsetMs: 1122727, src: "auto_sync",
                red:  { a: 1, b: 4, raw: "🔴 แดง: HDP 1 : 4", isValid: true },
                blue: { a: 7, b: 1, raw: "🔵 น้ำเงิน: 7 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 1 : 4"},"blue":{"a":7,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 1,
                fav: "blue", a: 7, b: 1
            },
            {
                step: 24, offsetMs: 1159444, src: "auto_sync",
                red:  { a: 1, b: 10, raw: "🔴 แดง: HDP 1 : 10", isValid: true },
                blue: { a: 16, b: 1, raw: "🔵 น้ำเงิน: 16 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 1 : 10"},"blue":{"a":16,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 16 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 16, resolvedB: 1,
                fav: "blue", a: 16, b: 1
            },
            {
                step: 25, offsetMs: 1188447, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":15,"isValid":true,"raw":"🔴 แดง: HDP 1 : 15"},"blue":{"a":25,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 25 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 26, offsetMs: 1230438, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":30,"isValid":true,"raw":"🔴 แดง: HDP 1 : 30"},"blue":{"a":50,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 50 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 27, offsetMs: 1250230, src: "auto_sync",
                red:  { a: 1, b: 60, raw: "🔴 แดง: HDP 1 : 60", isValid: true },
                blue: { a: 100, b: 1, raw: "🔵 น้ำเงิน: 100 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":60,"isValid":true,"raw":"🔴 แดง: HDP 1 : 60"},"blue":{"a":100,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 100 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 100, resolvedB: 1,
                fav: "blue", a: 100, b: 1
            },
            {
                step: 28, offsetMs: 1289219, src: "auto_sync",
                red:  { a: 1, b: 60, raw: "🔴 แดง: HDP 1 : 60", isValid: true },
                blue: { a: 90, b: 1, raw: "🔵 น้ำเงิน: 90 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":60,"isValid":true,"raw":"🔴 แดง: HDP 1 : 60"},"blue":{"a":90,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 90 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 90, resolvedB: 1,
                fav: "blue", a: 90, b: 1
            },
            {
                step: 29, offsetMs: 1318681, src: "auto_sync",
                red:  { a: 1, b: 50, raw: "🔴 แดง: HDP 1 : 50", isValid: true },
                blue: { a: 80, b: 1, raw: "🔵 น้ำเงิน: 80 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":50,"isValid":true,"raw":"🔴 แดง: HDP 1 : 50"},"blue":{"a":80,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 80 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 80, resolvedB: 1,
                fav: "blue", a: 80, b: 1
            },
            {
                step: 30, offsetMs: 1349224, src: "auto_sync",
                red:  { a: 1, b: 40, raw: "🔴 แดง: HDP 1 : 40", isValid: true },
                blue: { a: 60, b: 1, raw: "🔵 น้ำเงิน: 60 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":40,"isValid":true,"raw":"🔴 แดง: HDP 1 : 40"},"blue":{"a":60,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 60 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 60, resolvedB: 1,
                fav: "blue", a: 60, b: 1
            },
            {
                step: 31, offsetMs: 1390445, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":30,"isValid":true,"raw":"🔴 แดง: HDP 1 : 30"},"blue":{"a":50,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 50 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 32, offsetMs: 1436436, src: "auto_sync",
                red:  { a: 1, b: 60, raw: "🔴 แดง: HDP 1 : 60", isValid: true },
                blue: { a: 100, b: 1, raw: "🔵 น้ำเงิน: 100 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":60,"isValid":true,"raw":"🔴 แดง: HDP 1 : 60"},"blue":{"a":100,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 100 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 100, resolvedB: 1,
                fav: "blue", a: 100, b: 1
            }
        ]
    },

        {
        fightId: "fight_20260901_213016",
        recordedAt: 1788265816450,
        settledAt:  1788267443963,
        fighters: { red: "Denchai Lek J.Noppharat", blue: "Phet Na Dee Thongpoon Sport" },
        initialFav: "red",
        initialOdds: { a: 7, b: 4 },
        winner: "blue",
        journey: [
            {
                step: 0, offsetMs: 150909, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 1, offsetMs: 208925, src: "auto_sync",
                red:  { a: 11, b: 8, raw: "🔴 แดง: HDP 11 : 8", isValid: true },
                blue: { a: 9, b: 10, raw: "🔵 น้ำเงิน: 9 : 10 HDP", isValid: true },
                v2: {"red":{"a":11,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 11 : 8"},"blue":{"a":9,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 9 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 11, resolvedB: 8,
                fav: "red", a: 11, b: 8
            },
            {
                step: 2, offsetMs: 239158, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 3, offsetMs: 264151, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 4, offsetMs: 290908, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 5, offsetMs: 318659, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 6, offsetMs: 344409, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 7, offsetMs: 370409, src: "auto_sync",
                red:  { a: 5, b: 4, raw: "🔴 แดง: HDP 5 : 4", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":5,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 5 : 4"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 4,
                fav: "red", a: 5, b: 4
            },
            {
                step: 8, offsetMs: 415942, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 9, raw: "🔵 น้ำเงิน: 10 : 9 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":9,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 9 HDP"},"derived":{"redStatus":"fav","blueStatus":"fav","marketState":"BOTH_FAV"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 9, offsetMs: 451138, src: "auto_sync",
                red:  { a: 10, b: 9, raw: "🔴 แดง: HDP 10 : 9", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":10,"b":9,"isValid":true,"raw":"🔴 แดง: HDP 10 : 9"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 10, resolvedB: 9,
                fav: "red", a: 10, b: 9
            },
            {
                step: 10, offsetMs: 510146, src: "auto_sync",
                red:  { a: 2, b: 3, raw: "🔴 แดง: HDP 2 : 3", isValid: true },
                blue: { a: 7, b: 4, raw: "🔵 น้ำเงิน: 7 : 4 HDP", isValid: true },
                v2: {"red":{"a":2,"b":3,"isValid":true,"raw":"🔴 แดง: HDP 2 : 3"},"blue":{"a":7,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 7 : 4 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 7, resolvedB: 4,
                fav: "blue", a: 7, b: 4
            },
            {
                step: 11, offsetMs: 529407, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 4, b: 5, raw: "🔵 น้ำเงิน: 4 : 5 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":4,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 12, offsetMs: 554159, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 13, offsetMs: 583406, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 14, offsetMs: 612660, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 15, offsetMs: 674394, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 16, offsetMs: 725908, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 17, offsetMs: 752409, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 5, b: 4, raw: "🔵 น้ำเงิน: 5 : 4 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":5,"b":4,"isValid":true,"raw":"🔵 น้ำเงิน: 5 : 4 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 5, resolvedB: 4,
                fav: "blue", a: 5, b: 4
            },
            {
                step: 18, offsetMs: 770649, src: "auto_sync",
                red:  { a: 9, b: 10, raw: "🔴 แดง: HDP 9 : 10", isValid: true },
                blue: { a: 11, b: 8, raw: "🔵 น้ำเงิน: 11 : 8 HDP", isValid: true },
                v2: {"red":{"a":9,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 9 : 10"},"blue":{"a":11,"b":8,"isValid":true,"raw":"🔵 น้ำเงิน: 11 : 8 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 11, resolvedB: 8,
                fav: "blue", a: 11, b: 8
            },
            {
                step: 19, offsetMs: 795427, src: "auto_sync",
                red:  { a: 4, b: 5, raw: "🔴 แดง: HDP 4 : 5", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":4,"b":5,"isValid":true,"raw":"🔴 แดง: HDP 4 : 5"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 20, offsetMs: 817410, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 3, b: 2, raw: "🔵 น้ำเงิน: 3 : 2 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":3,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 3 : 2 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 3, resolvedB: 2,
                fav: "blue", a: 3, b: 2
            },
            {
                step: 21, offsetMs: 845641, src: "auto_sync",
                red:  { a: 7, b: 4, raw: "🔴 แดง: HDP 7 : 4", isValid: true },
                blue: { a: 2, b: 3, raw: "🔵 น้ำเงิน: 2 : 3 HDP", isValid: true },
                v2: {"red":{"a":7,"b":4,"isValid":true,"raw":"🔴 แดง: HDP 7 : 4"},"blue":{"a":2,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 7, resolvedB: 4,
                fav: "red", a: 7, b: 4
            },
            {
                step: 22, offsetMs: 860652, src: "auto_sync",
                red:  { a: 3, b: 2, raw: "🔴 แดง: HDP 3 : 2", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":3,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 3 : 2"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 2,
                fav: "red", a: 3, b: 2
            },
            {
                step: 23, offsetMs: 934140, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 24, offsetMs: 993147, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 25, offsetMs: 1019660, src: "auto_sync",
                red:  { a: 5, b: 2, raw: "🔴 แดง: HDP 5 : 2", isValid: true },
                blue: { a: 4, b: 7, raw: "🔵 น้ำเงิน: 4 : 7 HDP", isValid: true },
                v2: {"red":{"a":5,"b":2,"isValid":true,"raw":"🔴 แดง: HDP 5 : 2"},"blue":{"a":4,"b":7,"isValid":true,"raw":"🔵 น้ำเงิน: 4 : 7 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 2,
                fav: "red", a: 5, b: 2
            },
            {
                step: 26, offsetMs: 1082909, src: "auto_sync",
                red:  { a: 3, b: 1, raw: "🔴 แดง: HDP 3 : 1", isValid: true },
                blue: { a: 1, b: 2, raw: "🔵 น้ำเงิน: 1 : 2 HDP", isValid: true },
                v2: {"red":{"a":3,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 3 : 1"},"blue":{"a":1,"b":2,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 2 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 3, resolvedB: 1,
                fav: "red", a: 3, b: 1
            },
            {
                step: 27, offsetMs: 1115643, src: "auto_sync",
                red:  { a: 4, b: 1, raw: "🔴 แดง: HDP 4 : 1", isValid: true },
                blue: { a: 2, b: 5, raw: "🔵 น้ำเงิน: 2 : 5 HDP", isValid: true },
                v2: {"red":{"a":4,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 4 : 1"},"blue":{"a":2,"b":5,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 5 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 4, resolvedB: 1,
                fav: "red", a: 4, b: 1
            },
            {
                step: 28, offsetMs: 1140144, src: "auto_sync",
                red:  { a: 5, b: 1, raw: "🔴 แดง: HDP 5 : 1", isValid: true },
                blue: { a: 1, b: 3, raw: "🔵 น้ำเงิน: 1 : 3 HDP", isValid: true },
                v2: {"red":{"a":5,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 5 : 1"},"blue":{"a":1,"b":3,"isValid":true,"raw":"🔵 น้ำเงิน: 1 : 3 HDP"},"derived":{"redStatus":"fav","blueStatus":"dog","marketState":"RED_FAV_BLUE_DOG"}},
                resolvedFav: "red", resolvedA: 5, resolvedB: 1,
                fav: "red", a: 5, b: 1
            },
            {
                step: 29, offsetMs: 1169159, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 30, offsetMs: 1185911, src: "auto_sync",
                red:  { a: 2, b: 1, raw: "🔴 แดง: HDP 2 : 1", isValid: true },
                blue: { a: 10, b: 10, raw: "🔵 น้ำเงิน: 10 : 10 HDP", isValid: true },
                v2: {"red":{"a":2,"b":1,"isValid":true,"raw":"🔴 แดง: HDP 2 : 1"},"blue":{"a":10,"b":10,"isValid":true,"raw":"🔵 น้ำเงิน: 10 : 10 HDP"},"derived":{"redStatus":"fav","blueStatus":"even","marketState":"RED_FAV_BLUE_EVEN"}},
                resolvedFav: "red", resolvedA: 2, resolvedB: 1,
                fav: "red", a: 2, b: 1
            },
            {
                step: 31, offsetMs: 1212660, src: "auto_sync",
                red:  { a: 10, b: 10, raw: "🔴 แดง: HDP 10 : 10", isValid: true },
                blue: { a: 2, b: 1, raw: "🔵 น้ำเงิน: 2 : 1 HDP", isValid: true },
                v2: {"red":{"a":10,"b":10,"isValid":true,"raw":"🔴 แดง: HDP 10 : 10"},"blue":{"a":2,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 2 : 1 HDP"},"derived":{"redStatus":"even","blueStatus":"fav","marketState":"RED_EVEN_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 2, resolvedB: 1,
                fav: "blue", a: 2, b: 1
            },
            {
                step: 32, offsetMs: 1326903, src: "auto_sync",
                red:  { a: 1, b: 20, raw: "🔴 แดง: HDP 1 : 20", isValid: true },
                blue: { a: 30, b: 1, raw: "🔵 น้ำเงิน: 30 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":20,"isValid":true,"raw":"🔴 แดง: HDP 1 : 20"},"blue":{"a":30,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 30 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 30, resolvedB: 1,
                fav: "blue", a: 30, b: 1
            },
            {
                step: 33, offsetMs: 1352901, src: "auto_sync",
                red:  { a: 1, b: 15, raw: "🔴 แดง: HDP 1 : 15", isValid: true },
                blue: { a: 25, b: 1, raw: "🔵 น้ำเงิน: 25 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":15,"isValid":true,"raw":"🔴 แดง: HDP 1 : 15"},"blue":{"a":25,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 25 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 25, resolvedB: 1,
                fav: "blue", a: 25, b: 1
            },
            {
                step: 34, offsetMs: 1458653, src: "auto_sync",
                red:  { a: 1, b: 30, raw: "🔴 แดง: HDP 1 : 30", isValid: true },
                blue: { a: 50, b: 1, raw: "🔵 น้ำเงิน: 50 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":30,"isValid":true,"raw":"🔴 แดง: HDP 1 : 30"},"blue":{"a":50,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 50 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 50, resolvedB: 1,
                fav: "blue", a: 50, b: 1
            },
            {
                step: 35, offsetMs: 1496393, src: "auto_sync",
                red:  { a: 1, b: 8, raw: "🔴 แดง: HDP 1 : 8", isValid: true },
                blue: { a: 13, b: 1, raw: "🔵 น้ำเงิน: 13 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":8,"isValid":true,"raw":"🔴 แดง: HDP 1 : 8"},"blue":{"a":13,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 13 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 13, resolvedB: 1,
                fav: "blue", a: 13, b: 1
            },
            {
                step: 36, offsetMs: 1541162, src: "auto_sync",
                red:  { a: 1, b: 100, raw: "🔴 แดง: HDP 1 : 100", isValid: true },
                blue: { a: 180, b: 1, raw: "🔵 น้ำเงิน: 180 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":100,"isValid":true,"raw":"🔴 แดง: HDP 1 : 100"},"blue":{"a":180,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 180 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 180, resolvedB: 1,
                fav: "blue", a: 180, b: 1
            },
            {
                step: 37, offsetMs: 1558395, src: "auto_sync",
                red:  { a: 1, b: 40, raw: "🔴 แดง: HDP 1 : 40", isValid: true },
                blue: { a: 70, b: 1, raw: "🔵 น้ำเงิน: 70 : 1 HDP", isValid: true },
                v2: {"red":{"a":1,"b":40,"isValid":true,"raw":"🔴 แดง: HDP 1 : 40"},"blue":{"a":70,"b":1,"isValid":true,"raw":"🔵 น้ำเงิน: 70 : 1 HDP"},"derived":{"redStatus":"dog","blueStatus":"fav","marketState":"RED_DOG_BLUE_FAV"}},
                resolvedFav: "blue", resolvedA: 70, resolvedB: 1,
                fav: "blue", a: 70, b: 1
            }
        ]
    },


];

//วางข้อมูลการชกก่อนหน้านี้เพื่อให้ระบบสามารถประมวลผลได้

// Non-destructive migration: keep every historical record and legacy field,
// while exposing the independent V2 shape to the replay engine.
(function migrateHistoricalFightsToV2(fights) {
    const deriveSide = (side) => {
        if (!side || !(side.a > 0) || !(side.b > 0)) return 'even';
        return side.a > side.b ? 'fav' : (side.a < side.b ? 'dog' : 'even');
    };
    const deriveMarketState = (red, blue) => {
        const key = `${deriveSide(red)}_${deriveSide(blue)}`;
        return {
            fav_fav: 'BOTH_FAV', fav_even: 'RED_FAV_BLUE_EVEN', fav_dog: 'RED_FAV_BLUE_DOG',
            even_fav: 'RED_EVEN_BLUE_FAV', even_even: 'BOTH_EVEN', even_dog: 'RED_EVEN_BLUE_DOG',
            dog_fav: 'RED_DOG_BLUE_FAV', dog_even: 'RED_DOG_BLUE_EVEN', dog_dog: 'BOTH_DOG'
        }[key] || 'UNKNOWN';
    };
    const legacySide = (point, corner) => {
        const fav = point.resolvedFav || point.fav || 'red';
        const a = point.resolvedA != null ? point.resolvedA : point.a;
        const b = point.resolvedB != null ? point.resolvedB : point.b;
        if (!(a > 0) || !(b > 0)) return null;
        const favSide = { a, b, raw: `${a}:${b}`, isValid: true };
        const dogSide = { a: b, b: a, raw: `${b}:${a}`, isValid: true };
        return corner === fav ? favSide : dogSide;
    };

    (fights || []).forEach((fight) => {
        (fight.journey || []).forEach((point) => {
            if (!point.red) point.red = legacySide(point, 'red');
            if (!point.blue) point.blue = legacySide(point, 'blue');
            if (!point.v2 && point.red && point.blue) {
                point.v2 = {
                    red: point.red,
                    blue: point.blue,
                    derived: {
                        redStatus: deriveSide(point.red),
                        blueStatus: deriveSide(point.blue),
                        marketState: deriveMarketState(point.red, point.blue)
                    }
                };
            }
        });
    });
})(window.HISTORICAL_FIGHTS);