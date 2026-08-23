// ============================================================
// ✨ Module Extension: Fight Data Recorder + Backtest Hub
// Append to Muypakyok2.js (บรรทัด 1569 เป็นต้นไป)
// ============================================================

(function addRecorderAndBacktestHub() {
    if (window.__RECORDER_BT_INJECTED__) return;
    window.__RECORDER_BT_INJECTED__ = true;

    // =====================================================
    // 📝 1. Fight Data Recorder Module
    // =====================================================
    const STORAGE_KEY_LIBRARY = 'muypakyok_recorder_library_v1';

    const _rec = {
        active: null,        // { id, openedAt, firstSnap, lastSnap, journey: [] }
        library: [],         // Array ของ FightRecord ที่จบแล้ว
        lastStored: null,    // ใช้ dedupe snapshot
        debounceTimer: null  // สำหรับ oninput
    };

    function _recDeepClone(o) {
        try { return JSON.parse(JSON.stringify(o)); } catch (e) { return null; }
    }

    function _recLoadLibrary() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
            if (raw) _rec.library = JSON.parse(raw) || [];
        } catch (e) { _rec.library = []; }
    }

    function _recSaveLibrary() {
        try { localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(_rec.library)); }
        catch (e) { console.warn('[Recorder] ไม่สามารถ save localStorage ได้:', e); }
    }

    // =====================================================
    // 🔧 Shared: Parse HDP odds text from one side element e.g. "🔴 แดง: HDP 2 : 1"
    //    Returns: { a:<number or NaN>, b:<number or NaN>, isValid:<bool>, raw:<string> }
    // =====================================================
    function _parseOddsSide(text) {
        const raw = (text || '').trim();
        if (!raw || raw === '-' || raw.endsWith(': -') || raw.endsWith(' -') || raw.includes('ไม่มีราคา') || raw.includes('ปิดรับแทง')) {
            return { a: NaN, b: NaN, isValid: false, raw: raw };
        }
        const m = raw.match(/(\d+(?:\.\d+)?)\s*[:：]\s*(\d+(?:\.\d+)?)/);
        if (!m) return { a: NaN, b: NaN, isValid: false, raw: raw };
        const a = parseFloat(m[1]), b = parseFloat(m[2]);
        if (!isFinite(a) || !isFinite(b) || a <= 0 || b <= 0) return { a: NaN, b: NaN, isValid: false, raw };
        return { a: Math.round(a), b: Math.round(b), isValid: true, raw };
    }

    // LEGACY FIELD RESOLVER — USE return.v2 FOR NEW CODE; resolvedFav is compat only.
    function _resolveFavFromSides(red, blue) {
        const derive = (window.PriceJourneyEngine && window.PriceJourneyEngine.deriveCornerStatuses)
            ? window.PriceJourneyEngine.deriveCornerStatuses
            : (r, b) => ({
                redStatus: r.a > r.b ? 'fav' : (r.a < r.b ? 'dog' : 'even'),
                blueStatus: b.a > b.b ? 'fav' : (b.a < b.b ? 'dog' : 'even'),
                marketState: 'UNKNOWN'
            });
        const v2 = {
            red: red || { a: NaN, b: NaN, raw: null },
            blue: blue || { a: NaN, b: NaN, raw: null }
        };
        v2.derived = derive(v2.red, v2.blue);
        const redOk = red && red.isValid, blueOk = blue && blue.isValid;
        if (!redOk || !blueOk) {
            const f = document.getElementById('liveFavCorner');
            const a = parseFloat((document.getElementById('liveOddA') || {}).value);
            const b = parseFloat((document.getElementById('liveOddB') || {}).value);
            if (f && (a > 0) && (b > 0)) {
                return { resolvedFav: (f.value === 'blue' ? 'blue' : (f.value === 'red' ? 'red' : null)), resolvedA: Math.round(a), resolvedB: Math.round(b), v2 };
            }
            const d = document.getElementById('liveDogCorner');
            const da = parseFloat((document.getElementById('dogOddA') || {}).value);
            const db = parseFloat((document.getElementById('dogOddB') || {}).value);
            if (d && (da > 0) && (db > 0)) {
                const derivedFav = d.value === 'red' ? 'blue' : (d.value === 'blue' ? 'red' : null);
                return { resolvedFav: derivedFav, resolvedA: Math.round(da), resolvedB: Math.round(db), v2 };
            }
            return { resolvedFav: null, resolvedA: null, resolvedB: null, v2 };
        }
        const redRatio = red.a / red.b;
        const blueRatio = blue.a / blue.b;
        if (redRatio >= blueRatio) return { resolvedFav: 'red', resolvedA: red.a, resolvedB: red.b, v2 };
        return { resolvedFav: 'blue', resolvedA: blue.a, resolvedB: blue.b, v2 };
    }

    function _recGetLiveSourceHint() {
        if (window._simTimer) return 'simulation';
        if (window.isAutoSyncEnabled) return 'auto_sync';
        return 'manual_edit';
    }

    function _recCaptureSnap(sourceOverride) {
        const redName = (document.getElementById('redFighterNameHeader') || {}).innerText || 'ฝั่งแดง';
        const blueName = (document.getElementById('blueFighterNameHeader') || {}).innerText || 'ฝั่งน้ำเงิน';

        // 🔑 SOURCE OF TRUTH ใหม่: ดึงจากฝั่งแดง / น้ำเงิน โดยตรง (ต่อ/รอง แยกกัน)
        const redText  = (document.getElementById('redOddsText')  || {}).innerText || '';
        const blueText = (document.getElementById('blueOddsText') || {}).innerText || '';
        const red  = _parseOddsSide(redText);
        const blue = _parseOddsSide(blueText);

        // ❌ ถ้าใดฝั่งหนึ่งยังไม่มีราคา (invalid) ข้ามจุดนี้เลย — รอราคาครบ
        if (!red.isValid || !blue.isValid) return null;

        const { resolvedFav, resolvedA, resolvedB, v2 } = _resolveFavFromSides(red, blue);
        if (!resolvedFav || resolvedA == null || resolvedB == null) return null;

        const now = Date.now();
        const snap = {
            timestamp: now,
            source: sourceOverride || _recGetLiveSourceHint(),
            fighters: { red: redName, blue: blueName },
            // ใหม่: แยก side odds แท้จริง (ต่อ/รอง ของแต่ละฝั่งแยกกัน)
            red:  { a: red.a,  b: red.b,  raw: red.raw,  isValid: red.isValid  },
            blue: { a: blue.a, b: blue.b, raw: blue.raw, isValid: blue.isValid },
            v2: v2,
            // resolved เพื่อ compat กับ UI fav+a+b (ไม่ให้ calculateAll พัง)
            resolvedFav: resolvedFav,
            resolvedA: resolvedA,
            resolvedB: resolvedB,
            // (keep legacy field สำหรับ _fmtPrice เดิมที่ยังใช้งานอยู่)
            favCorner: resolvedFav,
            oddA: resolvedA,
            oddB: resolvedB
        };
        return snap;
    }

    function _recIsDuplicate(snap) {
        const prev = _rec.lastStored;
        if (!prev) return false;
        // เปรียบเทียบจาก raw side ทั้งสองฝั่ง (แทนที่จะเปรียบแค่ fav+a+b เดียว — จับการเปลี่ยนต่อ/รองได้แม่นยำ)
        return (prev.red.raw  === snap.red.raw)
            && (prev.blue.raw === snap.blue.raw);
    }

    function recorderOnPriceChange(sourceHint) {
        if (!_rec.active) return;

        clearTimeout(_rec.debounceTimer);
        _rec.debounceTimer = setTimeout(() => {
            const snap = _recCaptureSnap(sourceHint);
            if (!snap) return;
            if (_recIsDuplicate(snap)) return;

            if (!_rec.active.firstSnap) _rec.active.firstSnap = snap;
            _rec.active.lastSnap = snap;
            snap.stepIndex = _rec.active.journey.length;
            _rec.active.journey.push(snap);
            _rec.lastStored = snap;
            _recRenderActiveBox();
        }, 50);
    }

    // ----- Hooks ทุกจุดที่ราคาอาจเปลี่ยน -----
    // ใช้ Post-Hook ที่ลงทะเบียนไว้ใน calculateAll โดยตรง (ครอบคลุมทั้งภายในและภายนอกไฟล์ Muypakyok2.js)
    // ลงทะเบียน Hook: ทุกครั้งที่ calculateAll ทำงาน → เรียก recorderOnPriceChange
    window.__postCalculateAllHook = (function makeHook(prevHook) {
        return function postCalcHook() {
            try { if (prevHook && typeof prevHook === 'function') prevHook.apply(this, arguments); } catch (e) {}
            try { recorderOnPriceChange(); } catch (e) {}
        };
    })(window.__postCalculateAllHook);

    function recorderStartFight() {
        const now = Date.now();
        const d = new Date(now);
        const pad = (n) => String(n).padStart(2, '0');
        const id = `fight_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        const names = (() => {
            const r = (document.getElementById('redFighterNameHeader') || {}).innerText || 'ฝั่งแดง';
            const b = (document.getElementById('blueFighterNameHeader') || {}).innerText || 'ฝั่งน้ำเงิน';
            return { red: r, blue: b };
        })();
        _rec.active = {
            fightId: id,
            recordedAt: now,
            fighters: names,
            openedAt: now,
            firstSnap: null,
            lastSnap: null,
            journey: []
        };
        _rec.lastStored = null;
        recorderOnPriceChange('open');
        _recRenderStatus();
        console.log('%c[Recorder] 🎬 เริ่มบันทึกไฟท์ใหม่: ' + id, 'color: #22c55e; font-weight:bold;');
    }

    function recorderEndFight(winner) {
        if (!_rec.active) return;
        if (winner !== 'red' && winner !== 'blue') return;
        const snap = _recCaptureSnap();
        if (snap && !_recIsDuplicate(snap)) {
            if (!_rec.active.firstSnap) _rec.active.firstSnap = snap;
            _rec.active.lastSnap = snap;
            snap.stepIndex = _rec.active.journey.length;
            _rec.active.journey.push(snap);
        }
        if (!_rec.active.firstSnap) {
            alert('⚠️ ไม่สามารถบันทึกได้ — ยังไม่มีจุดราคาเลย');
            return;
        }
        const ended = Date.now();
        const fs = _rec.active.firstSnap;
        const record = {
            fightId: _rec.active.fightId,
            recordedAt: _rec.active.recordedAt,
            settledAt: ended,
            fighters: _rec.active.fighters,
            // (legacy compat)
            initialFav: fs.resolvedFav || fs.favCorner,
            initialOdds: { a: fs.resolvedA || fs.oddA, b: fs.resolvedB || fs.oddB },
            winner: winner,
            journey: _rec.active.journey.map((s, i) => ({
                step: i,
                offsetMs: s.timestamp - _rec.active.openedAt,
                src: s.source,
                // ✨ ใหม่: แยกต่อ/รอง ของแต่ละฝั่งแบบ independent (ใช้เป็น source of truth สำหรับ backtest)
                red:  { a: s.red.a,  b: s.red.b,  raw: s.red.raw,  isValid: s.red.isValid  },
                blue: { a: s.blue.a, b: s.blue.b, raw: s.blue.raw, isValid: s.blue.isValid },
                v2: s.v2,
                // resolved view สำหรับ compat (อาจมีหรือไม่มีก็ได้ใน future — AI agent ควร derive เองจาก red/blue)
                resolvedFav: s.resolvedFav,
                resolvedA: s.resolvedA,
                resolvedB: s.resolvedB,
                // legacy compat fields (ให้ AI agent backward compat ได้ถ้าจำเป็น)
                fav: s.resolvedFav,
                a: s.resolvedA,
                b: s.resolvedB
            }))
        };
        _rec.library.unshift(record);
        _recSaveLibrary();
        const winnerText = winner === 'red' ? '🔴 แดงชนะ' : '🔵 น้ำเงินชนะ';
        console.log('%c[Recorder] ✅ จบบันทึก ไฟท์: ' + record.fightId + ' | ' + winnerText + ' | จุด: ' + record.journey.length + ' จุด', 'color:#10b981;font-weight:bold;');
        const forMd = _recBuildFightRecordForMd(record);
        _recDownloadMd(forMd);
        _rec.active = null;
        _rec.lastStored = null;
        _recRenderStatus();
        _recRenderLibrary();
    }

    function _recGenerateJsCode(r) {
        const lines = [];
        lines.push('    {');
        lines.push(`        fightId: ${JSON.stringify(r.fightId)},`);
        lines.push(`        recordedAt: ${r.recordedAt},`);
        lines.push(`        settledAt:  ${r.settledAt},`);
        lines.push(`        fighters: { red: ${JSON.stringify(r.fighters.red)}, blue: ${JSON.stringify(r.fighters.blue)} },`);
        lines.push(`        initialFav: ${JSON.stringify(r.initialFav)},`);
        lines.push(`        initialOdds: { a: ${r.initialOdds.a}, b: ${r.initialOdds.b} },`);
        lines.push(`        winner: ${JSON.stringify(r.winner)},`);
        lines.push('        journey: [');
        r.journey.forEach((s, i) => {
            const isLast = (i === r.journey.length - 1);
            lines.push('            {');
            lines.push(`                step: ${s.step}, offsetMs: ${s.offsetMs}, src: ${JSON.stringify(s.src)},`);
            lines.push(`                red:  { a: ${s.red.a}, b: ${s.red.b}, raw: ${JSON.stringify(s.red.raw)}, isValid: ${s.red.isValid} },`);
            lines.push(`                blue: { a: ${s.blue.a}, b: ${s.blue.b}, raw: ${JSON.stringify(s.blue.raw)}, isValid: ${s.blue.isValid} },`);
            lines.push(`                v2: ${JSON.stringify(s.v2 || { red: s.red, blue: s.blue })},`);
            lines.push(`                resolvedFav: ${JSON.stringify(s.resolvedFav)}, resolvedA: ${s.resolvedA}, resolvedB: ${s.resolvedB},`);
            lines.push(`                fav: ${JSON.stringify(s.fav)}, a: ${s.a}, b: ${s.b}`);
            lines.push(`            }${isLast ? '' : ','}`);
        });
        lines.push('        ]');
        lines.push('    },');
        return lines.join('\n');
    }

    function _recBuildFightRecordForMd(r) {
        const dt = (ts) => {
            const d = new Date(ts); const pad = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };
        const hm = (ms) => {
            const s = Math.floor(ms/1000); const pad=n=>String(n).padStart(2,'0');
            return `${pad(Math.floor(s/60))}:${pad(s%60)}`;
        };
        const winnerText = r.winner === 'red' ? '🔴 แดงชนะ' : '🔵 น้ำเงินชนะ';
        const jsCode = _recGenerateJsCode(r);

        let md = '';
        md += `# 🥊 Fight Record: ${r.fightId}\n\n`;
        md += `> 📋 **วิธีนำไปใช้ใน data.js:**\n`;
        md += `> ก๊อปปี้โค้ด JavaScript ในกรอบด้านล่างนี้ (ตั้งแต่ \`{\` ถึง \`},\`) แล้วนำไปวางต่อท้าย array ในไฟล์ \`data.js\` ได้เลยทันที โดยไม่ต้องแปลงข้อมูล!\n\n`;
        md += `\`\`\`javascript\n`;
        md += `/* ==================== ✂️ เริ่มก๊อปปี้จากบรรทัดนี้ ==================== */\n`;
        md += `${jsCode}\n`;
        md += `/* ==================== ✂️ สิ้นสุดการก๊อปปี้ ==================== */\n`;
        md += `\`\`\`\n\n`;
        md += `---\n\n`;
        md += `## 📌 ข้อมูลสรุปไฟท์ (Metadata)\n\n`;
        md += `- **รหัสไฟท์ (Fight ID):** \`${r.fightId}\`\n`;
        md += `- **เวลาเริ่มบันทึก:** ${dt(r.recordedAt)}\n`;
        md += `- **เวลาจบการแข่งขัน:** ${dt(r.settledAt)} (ความยาวไฟท์: ${hm(r.settledAt - r.recordedAt)})\n`;
        md += `- **คู่ชก:** 🔴 แดง: **${r.fighters.red}** vs 🔵 น้ำเงิน: **${r.fighters.blue}**\n`;
        md += `- **เปิดราคาฝั่งต่อ:** ${r.initialFav === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน'} (อัตราต่อรอง ${r.initialOdds.a}:${r.initialOdds.b})\n`;
        md += `- **ผู้ชนะ:** **${winnerText}**\n`;
        md += `- **จำนวนจุดราคาที่บันทึก:** ${r.journey.length} จุด\n\n`;
        md += `---\n\n`;
        md += `## 📊 รายละเอียด Price Journey (Timeline)\n\n`;
        md += `| step | เวลา | Source | 🔴 red raw | 🔴 red | 🔵 blue raw | 🔵 blue | resolvedFav | A:B resolved |\n`;
        md += `|:---:|:---:|:---:|:---|:---:|:---|:---:|:---:|:---:|\n`;
        r.journey.forEach((s, idx) => {
            const absTs = r.recordedAt + s.offsetMs;
            const d = new Date(absTs); const pad = n => String(n).padStart(2,'0');
            const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            const redShort  = (s.red  && s.red.isValid)  ? `${s.red.a}:${s.red.b}`  : '❌ ไม่มีราคา';
            const blueShort = (s.blue && s.blue.isValid) ? `${s.blue.a}:${s.blue.b}` : '❌ ไม่มีราคา';
            const rv  = s.red  ? s.red.raw  : '';
            const bv  = s.blue ? s.blue.raw : '';
            const fav = s.resolvedFav ? (s.resolvedFav === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน') : '-';
            const res = (s.resolvedA && s.resolvedB) ? `${s.resolvedA}:${s.resolvedB}` : '-';
            md += `| ${idx} | ${timeStr} | ${s.src} | ${rv} | ${redShort} | ${bv} | ${blueShort} | ${fav} | ${res} |\n`;
        });
        md += `\n`;
        return { content: md, filename: `${r.fightId}_${r.winner === 'red' ? 'แดงชนะ' : 'น้ำเงินชนะ'}_${r.journey.length}จุด.md`, record: r };
    }

    function _saveText(filename, text) {
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    function _recDownloadMd(mdObj) { _saveText(mdObj.filename, mdObj.content); }

    function recorderExportSingle(idx) {
        const r = _rec.library[idx]; if (!r) return;
        const md = _recBuildFightRecordForMd(r); _recDownloadMd(md);
    }

    function recorderDeleteSingle(idx) {
        if (!confirm('ลบไฟท์รายการนี้ออกจากคลังหรือไม่?')) return;
        _rec.library.splice(idx, 1); _recSaveLibrary(); _recRenderLibrary();
    }

    function recorderClearLibrary() {
        if (_rec.library.length === 0) return;
        if (!confirm(`คุณต้องการเคลียร์ไฟท์ทั้งหมดในคลัง (${_rec.library.length} ไฟท์) หรือไม่?`)) return;
        _rec.library = [];
        _recSaveLibrary();
        _recRenderLibrary();
        console.log('%c[Recorder] 🗑️ เคลียร์คลังไฟท์ทั้งหมดเรียบร้อยแล้ว', 'color:#ef4444;font-weight:bold;');
    }

    function recorderCopyJsCode(idx) {
        const r = _rec.library[idx];
        if (!r) return;
        const code = _recGenerateJsCode(r);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById(`recCopyBtn_${idx}`);
                if (btn) {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '✅ ก๊อปแล้ว!';
                    btn.style.color = '#22c55e';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.color = '';
                    }, 1500);
                } else {
                    alert('✅ คัดลอกโค้ด JavaScript สำหรับ data.js เรียบร้อยแล้ว!');
                }
            }).catch(err => {
                console.error('Clipboard error:', err);
                prompt('คัดลอกโค้ดด้านล่างนี้ไปวางใน data.js:', code);
            });
        } else {
            prompt('คัดลอกโค้ดด้านล่างนี้ไปวางใน data.js:', code);
        }
    }

    // ---------------- Render UI Recorder ----------------
    function _fmtPriceShort(s) {
        if (!s) return '-';
        const side = (s.resolvedFav || s.favCorner) === 'red' ? '🔴' : '🔵';
        const a = (s.resolvedA != null) ? s.resolvedA : s.oddA;
        const b = (s.resolvedB != null) ? s.resolvedB : s.oddB;
        return `${side} ต่อ ${a}:${b}`;
    }
    // ใหม่: แยกต่อ/รอง 2 ฝั่ง (แสดงแบบละเอียดเหมือนหน้าจอจริง)
    function _fmtPriceSideBySide(s) {
        if (!s) return '-';
        const redOk  = s.red  && s.red.isValid;
        const blueOk = s.blue && s.blue.isValid;
        const r = redOk  ? `🔴 แดง ${s.red.a}:${s.red.b}`  : '🔴 แดง ❌ไม่มีราคา';
        const b = blueOk ? `🔵 น้ำเงิน ${s.blue.a}:${s.blue.b}` : '🔵 น้ำเงิน ❌ไม่มีราคา';
        return `${r} | ${b}`;
    }
    function _fmtClock(ts) {
        if (!ts) return '';
        const d = new Date(ts); const pad = n => String(n).padStart(2,'0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    function _fmtElapsed(ms) {
        const s = Math.floor(ms/1000); const m = Math.floor(s/60);
        if (s < 60) return `(${s} วิ)`;
        return `(${m}:${String(s%60).padStart(2,'0')})`;
    }

    function _recRenderActiveBox() {
        const box = document.getElementById('recorderActiveBox');
        if (!box) return;
        if (!_rec.active) { box.classList.add('hidden'); return; }
        box.classList.remove('hidden');
        const a = _rec.active;
        document.getElementById('recFirstPrice').textContent = _fmtPriceSideBySide(a.firstSnap);
        document.getElementById('recFirstTs').textContent = a.firstSnap ? ' @ ' + _fmtClock(a.firstSnap.timestamp) : '';
        document.getElementById('recLastPrice').textContent = _fmtPriceSideBySide(a.lastSnap);
        document.getElementById('recLastTs').textContent = a.lastSnap ? ' @ ' + _fmtClock(a.lastSnap.timestamp) : '';
        const count = a.journey.length;
        document.getElementById('recCountVal').textContent = `${count} จุด`;
        const elapsed = (a.lastSnap ? a.lastSnap.timestamp : Date.now()) - a.openedAt;
        document.getElementById('recElapsed').textContent = _fmtElapsed(elapsed);
        const list = document.getElementById('recorderRecentList');
        if (list) {
            const recent = a.journey.slice(-5).reverse();
            list.innerHTML = recent.map(s => {
                const side = (s.resolvedFav || s.favCorner) === 'red' ? 'red' : 'blue';
                const a2 = (s.resolvedA != null) ? s.resolvedA : s.oddA;
                const b2 = (s.resolvedB != null) ? s.resolvedB : s.oddB;
                const redShort  = (s.red  && s.red.isValid)  ? `🔴${s.red.a}:${s.red.b}`  : '🔴-';
                const blueShort = (s.blue && s.blue.isValid) ? `🔵${s.blue.a}:${s.blue.b}` : '🔵-';
                return `<div class="rec-snap-mini"><span class="snap-time">${_fmtClock(s.timestamp)}</span> <span title="${redShort} ${blueShort}"><b class="snap-${side}">${a2}:${b2}</b> <small>${redShort} ${blueShort}</small></span> <small>${s.source}</small></div>`;
            }).join('') || '<small class="recorder-empty">รอจุดแรก... (ยังไม่มีราคาครบ 2 ฝั่ง)</small>';
        }
    }

    function _recRenderLibrary() {
        const listEl = document.getElementById('recorderLibraryList');
        const cntEl = document.getElementById('recLibraryCount');
        const btnClear = document.getElementById('recClearLibraryBtn') || document.getElementById('recBatchExportBtn');
        if (cntEl) cntEl.textContent = `${_rec.library.length} ไฟท์`;
        if (btnClear) btnClear.disabled = _rec.library.length === 0;
        if (!listEl) return;
        if (_rec.library.length === 0) {
            listEl.innerHTML = `<div class="recorder-empty">ยังไม่มีไฟท์ที่บันทึก — กด "เริ่มบันทึก" แล้วป้อนราคาจริงหรือเปิดดึงราคาจากเว็บ</div>`;
            return;
        }
        listEl.innerHTML = _rec.library.map((r, idx) => {
            const w = r.winner === 'red' ? '🔴 แดงชนะ' : '🔵 น้ำเงินชนะ';
            const d = new Date(r.recordedAt); const pad = n => String(n).padStart(2,'0');
            const dateStr = `${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
            const durSec = Math.round((r.settledAt - r.recordedAt)/1000);
            return `<div class="rec-library-item">
  <div class="rec-lib-top">
    <b class="rec-lib-id">${r.fightId}</b>
    <small>${dateStr}</small>
  </div>
  <div class="rec-lib-meta">
    <span class="rec-lib-win ${r.winner}">${w}</span>
    <span>${r.journey.length} จุด</span>
    <span>${durSec} วิ</span>
    <span>${r.fighters.red} vs ${r.fighters.blue}</span>
  </div>
  <div class="rec-lib-btns">
    <button id="recCopyBtn_${idx}" onclick="recorderCopyJsCode(${idx})" title="คัดลอกโค้ด JS ไปวางใน data.js ทันที">📋 ก๊อปโค้ด JS</button>
    <button onclick="recorderExportSingle(${idx})" title="ดาวน์โหลดไฟล์ .md">⬇️ MD</button>
    <button onclick="recorderDeleteSingle(${idx})" class="danger" title="ลบรายการนี้">🗑️</button>
  </div>
</div>`;
        }).join('');
    }

    function _recRenderStatus() {
        const badge = document.getElementById('recorderStatusBadge');
        const btnStart = document.querySelector('button[onclick="recorderStartFight()"]');
        const btnEndRed = document.querySelector('button[onclick="recorderEndFight(\'red\')"]');
        const btnEndBlue = document.querySelector('button[onclick="recorderEndFight(\'blue\')"]');
        const btnCancel = document.getElementById('recCancelBtn');
        if (badge) badge.textContent = _rec.active ? '🔴 บันทึกอยู่...' : '⚪ Idle';
        if (badge) badge.style.color = _rec.active ? '#ef4444' : '#94a3b8';
        if (btnStart) btnStart.disabled = !!_rec.active;
        if (btnEndRed) btnEndRed.disabled = !_rec.active;
        if (btnEndBlue) btnEndBlue.disabled = !_rec.active;
        if (btnCancel) btnCancel.disabled = !_rec.active;
        _recRenderActiveBox();
        _recRenderLibrary();
    }

    // Expose global
    window.recorderStartFight = recorderStartFight;
    window.recorderEndFight = recorderEndFight;

    // ============== ✨ ใหม่: Cancel บันทึก (ไม่ save ไม่ download) ==============
    function recorderCancelFight() {
        if (!_rec.active) return;
        const confirmMsg = (() => {
            const cnt = _rec.active.journey.length;
            const names = _rec.active.fighters;
            return `ยกเลิกการบันทึกไฟท์นี้หรือไม่?\n` +
                   `นักมวย: ${names.red} vs ${names.blue}\n` +
                   `จุดที่เก็บไว้: ${cnt} จุด\n\n` +
                   `(ไม่ถูกบันทึกลงคลังและไม่ส่งออก .md)`;
        })();
        if (!confirm(confirmMsg)) return;
        const oldId = _rec.active.fightId;
        _rec.active = null;
        _rec.lastStored = null;
        clearTimeout(_rec.debounceTimer);
        _rec.debounceTimer = null;
        console.log('%c[Recorder] 🗑️ ยกเลิกการบันทึก ไฟท์: ' + oldId + ' (ล้างข้อมูลในหน่วยความจำ)', 'color:#6b7280;font-weight:bold;');
        _recRenderStatus();
    }
    window.recorderCancelFight = recorderCancelFight;

    window.recorderExportSingle = recorderExportSingle;
    window.recorderDeleteSingle = recorderDeleteSingle;
    window.recorderClearLibrary = recorderClearLibrary;
    window.recorderCopyJsCode = recorderCopyJsCode;
    window.__recInternal = { onPriceChange: recorderOnPriceChange, lib: _rec.library, generateJsCode: _recGenerateJsCode };


    // =====================================================
    // 🧪 2. Backtest Hub — TAB Random + TAB Historical
    // =====================================================

    let _btTab = 'random';

    function btSwitchTab(tab) {
        _btTab = tab;
        ['btTabRandom','btTabHistory'].forEach(id => {
            const el = document.getElementById(id); if (el) el.classList.remove('active');
        });
        if (document.getElementById('btTabRandom')) document.getElementById('btTabRandom').classList.toggle('active', tab === 'random');
        if (document.getElementById('btTabHistory')) document.getElementById('btTabHistory').classList.toggle('active', tab === 'historical');
        const rp = document.getElementById('btRandomPanel'); const hp = document.getElementById('btHistoryPanel');
        if (rp) rp.classList.toggle('hidden', tab !== 'random');
        if (hp) hp.classList.toggle('hidden', tab !== 'historical');
        if (tab === 'historical') btHistInit();
        btRenderHubBadge();
    }

    function btRenderHubBadge() {
        const badge = document.getElementById('btHubStatusBadge');
        if (!badge) return;
        if (_btTab === 'random') {
            if (window._simTimer) { badge.textContent = window._isSimPaused ? '⏸️ พัก' : '🎲 รันอยู่'; badge.style.color='#f59e0b'; }
            else { badge.textContent='⚪ Idle'; badge.style.color='#94a3b8'; }
        } else {
            badge.textContent = _player && _player.loaded ? '📚 เปิด Scenario' : '⚪ Idle';
            badge.style.color = _player && _player.loaded ? '#3b82f6' : '#94a3b8';
        }
    }
    window.btSwitchTab = btSwitchTab;

    // ---------- RANDOM MODE: Wrap startSimulation + sync UI ----------
    function btRandomStart() {
        const cnt = parseInt((document.getElementById('btRandomCount') || {}).value) || 0;
        const intv = parseInt((document.getElementById('btRandomInterval') || {}).value) || 20;
        startSimulation(cnt, intv);
        btRandomSync();
    }
    function btRandomPause() { pauseSimulation(); btRandomSync(); }
    function btRandomResume() { resumeSimulation(); btRandomSync(); }
    function btRandomStop() { stopSimulation(); btRandomSync(); document.getElementById('btRandomSubStatus') && (document.getElementById('btRandomSubStatus').textContent = 'หยุดแล้ว'); }

    function btRandomSync() {
        const s = document.getElementById('btRandomStartBtn');
        const p = document.getElementById('btRandomPauseBtn');
        const r = document.getElementById('btRandomResumeBtn');
        const x = document.getElementById('btRandomStopBtn');
        const running = !!window._simTimer;
        if (s) s.disabled = running;
        if (x) x.disabled = !running && !window._isSimPaused;
        if (p) p.disabled = !running || window._isSimPaused;
        if (r) r.disabled = !window._isSimPaused;
        const last = document.getElementById('btRandomLastRound');
        const st = document.getElementById('btRandomSubStatus');
        if (last) last.textContent = running ? `รอบ #${window._simCount}${window._simMaxCount!==Infinity?` / ${window._simMaxCount}`:''}` : '-';
        if (st) st.textContent = running ? (window._isSimPaused ? `พักที่รอบ #${window._simCount}` : `เปลี่ยนทุกๆ ${window._simIntervalSec} วิ`) : 'พร้อมใช้งาน';
        btRenderHubBadge();
    }

    // Wrap original startSimulation family ให้ sync UI
    const _origStart = window.startSimulation;
    window.startSimulation = function () { const r = _origStart && _origStart.apply(this, arguments); setTimeout(btRandomSync, 50); return r; };
    const _origPause = window.pauseSimulation;
    window.pauseSimulation = function () { const r = _origPause && _origPause.apply(this, arguments); setTimeout(btRandomSync, 50); return r; };
    const _origResume = window.resumeSimulation;
    window.resumeSimulation = function () { const r = _origResume && _origResume.apply(this, arguments); setTimeout(btRandomSync, 50); return r; };
    const _origStop = window.stopSimulation;
    window.stopSimulation = function () { const r = _origStop && _origStop.apply(this, arguments); setTimeout(btRandomSync, 50); return r; };

    window.btRandomStart = btRandomStart;
    window.btRandomPause = btRandomPause;
    window.btRandomResume = btRandomResume;
    window.btRandomStop = btRandomStop;
    window.__btRandomSync = btRandomSync;

    // =====================================================
    // 🔊 Shared: Play Sound เมื่อราคาเปลี่ยน (ใช้ทั้ง Random / Historical mode)
    //    (1) ถ้ามี SoundEngine จากหน้างาน → ใช้ฟังก์ชันเดิม 100% (เสียงเหมือนหน้างานเลย)
    //    (2) ถ้าไม่มี → fallback Web Audio API simple beep (ไม่ต้องมีไฟล์เสียง)
    // =====================================================
    let __audioCtx = null;
    function btPlayPriceChangeSound(fav, a, b) {
        const txt = `${fav === 'red' ? '🔴' : '🔵'} ${a}:${b}`;
        // (1) Priority: SoundEngine จากหน้างาน (เสียงเหมือนจริง 100%)
        try {
            if (typeof SoundEngine !== 'undefined' && SoundEngine && typeof SoundEngine.checkAndPlayPriceChangeAlert === 'function') {
                SoundEngine.checkAndPlayPriceChangeAlert(txt);
                return;
            }
        } catch (e) {}
        // (2) Fallback: Web Audio API simple beep (safe)
        try {
            if (!__audioCtx) {
                const Ac = window.AudioContext || window.webkitAudioContext;
                if (Ac) __audioCtx = new Ac();
            }
            if (__audioCtx) {
                if (__audioCtx.state === 'suspended') __audioCtx.resume().catch(()=>{});
                const now = __audioCtx.currentTime;
                // High-pitched bell 2 เสียง (คล้ายราคาเข้ามา)
                [ {f: 880, d: 0.06, start: 0.0, v: 0.15}, {f: 1320, d: 0.09, start: 0.05, v: 0.11} ].forEach(n => {
                    const o = __audioCtx.createOscillator();
                    const g = __audioCtx.createGain();
                    o.type = 'triangle';
                    o.frequency.value = n.f;
                    g.gain.setValueAtTime(0.0001, now + n.start);
                    g.gain.exponentialRampToValueAtTime(n.v, now + n.start + 0.01);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.d);
                    o.connect(g).connect(__audioCtx.destination);
                    o.start(now + n.start);
                    o.stop(now + n.start + n.d + 0.02);
                });
            }
        } catch (e) {}
    }

    // ---------- HISTORICAL MODE: Scenario Player Step Machine ----------
    const _player = {
        library: [],
        scenarioIdx: -1,
        scenario: null,
        loaded: false,
        stepIndex: 0,
        snapshots: [],
        autoTimer: null,
        autoMs: 10000
    };

    const _agg = {
        list: [],
        equity: [0]
    };
    const AGG_STORE_KEY = 'muypakyok_backtest_agg_v1';

    function _aggLoad() {
        try {
            const raw = localStorage.getItem(AGG_STORE_KEY);
            if (raw) {
                const d = JSON.parse(raw);
                if (d && Array.isArray(d.list)) { _agg.list = d.list; _agg.equity = d.equity || [0]; }
            }
        } catch (e) {}
    }
    function _aggSave() { try { localStorage.setItem(AGG_STORE_KEY, JSON.stringify(_agg)); } catch (e) {} }

    function btHistInit() {
        const lib = (window.HISTORICAL_FIGHTS && Array.isArray(window.HISTORICAL_FIGHTS)) ? window.HISTORICAL_FIGHTS : [];
        _player.library = lib.filter(x => x && x.journey && Array.isArray(x.journey) && x.journey.length >= 1 && x.winner);
        const cntEl = document.getElementById('btHistLibCount');
        if (cntEl) cntEl.textContent = `${_player.library.length} ไฟท์`;
        const sel = document.getElementById('btHistScenarioSelect');
        if (sel) {
            sel.innerHTML = _player.library.length === 0
                ? '<option value="">— ยังไม่มีข้อมูลใน data.js —</option>'
                : '<option value="">— เลือก Scenario —</option>' + _player.library.map((x, i) => `<option value="${i}">#${i+1} ${x.fightId}</option>`).join('');
        }
        // ✅ ถ้ายังไม่มี scenario โหลด → รีเซ็ตชื่อนักมวยบนหัวกลับเป็นค่าว่าง
        if (!_player.loaded) {
            const rn = document.getElementById('redFighterNameHeader');
            const bn = document.getElementById('blueFighterNameHeader');
            if (rn) rn.innerText = 'ฝั่งแดง';
            if (bn) bn.innerText = 'ฝั่งน้ำเงิน';
            const hdr = document.getElementById('liveOddsHeader');
            if (hdr) hdr.innerHTML = '🔴 ปิดรับแทง (ไม่มีราคา)';
            const rOdds = document.getElementById('redOddsText');
            const bOdds = document.getElementById('blueOddsText');
            if (rOdds) rOdds.innerText = '🔴 แดง: -';
            if (bOdds) bOdds.innerText = '🔵 น้ำเงิน: -';
            if (typeof updateFighterAvatarFavStatus === 'function') updateFighterAvatarFavStatus(null, true);
        }
        btHistRenderButtons();
    }

    function btHistLoadScenario(idxStr) {
        const idx = parseInt(idxStr); if (isNaN(idx) || idx < 0 || idx >= _player.library.length) return;
        _player.scenarioIdx = idx;
        _player.scenario = _player.library[idx];
        _player.loaded = true;
        _player.stepIndex = 0;
        _player.snapshots = new Array(_player.scenario.journey.length);
        if (_player.autoTimer) { clearInterval(_player.autoTimer); _player.autoTimer = null; btHistToggleAutoUI(false); }
        const sel = document.getElementById('btHistScenarioSelect');
        if (sel && sel.value !== String(idx)) sel.value = String(idx);
        btHistApplyStep(0, true);
        btHistRenderScenarioInfo();
        btHistRenderTimeline();
        btHistRenderButtons();
    }

    function btHistPrevScenario() { if (_player.library.length === 0) return; const next = (_player.scenarioIdx - 1 + _player.library.length) % _player.library.length; btHistLoadScenario(next); }
    function btHistNextScenario() { if (_player.library.length === 0) return; const next = (_player.scenarioIdx + 1) % _player.library.length; btHistLoadScenario(next); }
    function btHistRandomScenario() { if (_player.library.length === 0) return; const next = Math.floor(Math.random() * _player.library.length); btHistLoadScenario(next); }
    window.btHistPrevScenario = btHistPrevScenario; window.btHistNextScenario = btHistNextScenario; window.btHistRandomScenario = btHistRandomScenario; window.btHistLoadScenario = btHistLoadScenario;

    function _captureWholeState() {
        return {
            tickets: _recDeepClone(window.tickets || []),
            totalCapital: parseFloat((document.getElementById('totalCapital')||{}).value) || 0,
            currentStrategy: window.currentStrategy || 'skew_runner',
            skewTarget70: window.skewTarget70 || 'red',
            breakevenProfitTarget: window.breakevenProfitTarget || 'red'
        };
    }
    function _restoreWholeState(snap) {
        if (!snap) return;
        if (Array.isArray(snap.tickets)) {
            window.tickets = snap.tickets;
            renderTickets();
        }
        const tcin = document.getElementById('totalCapital');
        if (tcin && snap.totalCapital) { tcin.value = snap.totalCapital; }
        if (snap.currentStrategy) window.currentStrategy = snap.currentStrategy;
        if (snap.skewTarget70) window.skewTarget70 = snap.skewTarget70;
        if (snap.breakevenProfitTarget) window.breakevenProfitTarget = snap.breakevenProfitTarget;
        updateStrategyButtons && updateStrategyButtons();
        setSkewTarget && setSkewTarget(window.skewTarget70);
        setBreakevenProfitTarget && setBreakevenProfitTarget(window.breakevenProfitTarget);
    }

    function _getReplayPointSides(point) {
        if (point.v2 && point.v2.red && point.v2.blue) {
            return { mode: 'v2', red: point.v2.red, blue: point.v2.blue, derived: point.v2.derived };
        }
        if (point.red && point.blue) {
            const resolved = _resolveFavFromSides(point.red, point.blue);
            return { mode: 'sides', red: point.red, blue: point.blue, derived: resolved.v2.derived };
        }
        if (point.resolvedFav && point.resolvedA != null && point.resolvedB != null) {
            const fav = point.resolvedFav === 'blue' ? 'blue' : 'red';
            const favSide = { a: point.resolvedA, b: point.resolvedB, isValid: true, raw: `${point.resolvedA}:${point.resolvedB}` };
            const dogSide = { a: point.resolvedB, b: point.resolvedA, isValid: true, raw: `${point.resolvedB}:${point.resolvedA}` };
            return { mode: 'legacy', red: fav === 'red' ? favSide : dogSide, blue: fav === 'blue' ? favSide : dogSide };
        }
        return { mode: 'invalid', red: {}, blue: {} };
    }

    function btHistApplyStep(i, isReset) {
        if (!_player.loaded) return;
        const j = _player.scenario.journey;
        if (i < 0 || i >= j.length) return;
        const point = j[i];

        // ❌ ถ้า journey step นี้เป็นราคาหาย (invalid) ข้ามไปเลย (ไม่ render, ไม่ calculateAll)
        const sides = _getReplayPointSides(point);
        const redOk  = sides.red && sides.red.a > 0 && sides.red.b > 0;
        const blueOk = sides.blue && sides.blue.a > 0 && sides.blue.b > 0;
        if (!redOk || !blueOk) {
            _player.stepIndex = i;
            btHistRenderScenarioInfo();
            btHistRenderTimeline();
            btHistRenderButtons();
            return;
        }

        // อัปเดตราคาเข้าสู่ระบบและคำนวณกำไร/ขาดทุนโดยคงแผล (tickets) ของผู้ใช้ไว้ไม่ให้หาย
        _applyPriceToUIFromPoint(point, false);
        if (typeof countPriceUpdateIfGenuinelyChanged === 'function') {
            countPriceUpdateIfGenuinelyChanged();  // 🆕 นับ grace ตอน replay/jump ราคาจาก Backtest Hub ด้วย
        }
        if (typeof calculateAll === 'function') calculateAll();

        _player.stepIndex = i;
        btHistRenderScenarioInfo();
        btHistRenderTimeline();
        btHistRenderButtons();

        // 🔊 เล่นเสียงเมื่อราคาปรับใหม่ (ถ้า valid) — เสียงเหมือนหน้างาน 100%
        if (redOk && blueOk) {
            const fav = point.resolvedFav || point.fav || (sides.red.a / sides.red.b >= sides.blue.a / sides.blue.b ? 'red' : 'blue');
            const ra = (point.resolvedA != null && sides.mode === 'legacy') ? point.resolvedA : (fav === 'red' ? sides.red.a : sides.blue.a);
            const rb = (point.resolvedB != null && sides.mode === 'legacy') ? point.resolvedB : (fav === 'red' ? sides.red.b : sides.blue.b);
            btPlayPriceChangeSound(fav, ra, rb);
        }
    }

    // ใหม่: ใช้ red/blue raw เป็น source of truth → ใส่ลง UI ทั้ง 3 ช่อง: #redOddsText / #blueOddsText / (fav, oddA, oddB) + (dogCorner, dogOddA/B) + liveOddsHeader
    function _applyPriceToUIFromPoint(point, silent) {
        const fEl = document.getElementById('liveFavCorner');
        const aEl = document.getElementById('liveOddA');
        const bEl = document.getElementById('liveOddB');
        const dEl = document.getElementById('liveDogCorner');
        const daEl = document.getElementById('dogOddA');
        const dbEl = document.getElementById('dogOddB');
        const hdr = document.getElementById('liveOddsHeader');
        const rEl = document.getElementById('redOddsText');
        const blEl = document.getElementById('blueOddsText');
        const sides = _getReplayPointSides(point);
        const hasIndependentSides = sides.mode === 'v2' || sides.mode === 'sides';

        // 1) ใส่ Side Raw text (source of truth) ลง #redOddsText และ #blueOddsText โดยตรง
        if (rEl)  rEl.innerText  = sides.red.raw || `🔴 แดง: ${sides.red.a}:${sides.red.b}`;
        if (blEl) blEl.innerText = sides.blue.raw || `🔵 น้ำเงิน: ${sides.blue.a}:${sides.blue.b}`;

        // 2) Derive fav / oddA / oddB แบบ 3 ชั้น: (a) จาก resolved field (b) จาก red/blue ratio (c) fallback จาก legacy fav+a+b
        let resolvedFav = point.resolvedFav || point.fav;
        let resolvedA = point.resolvedA != null ? point.resolvedA : point.a;
        let resolvedB = point.resolvedB != null ? point.resolvedB : point.b;
        if (hasIndependentSides) {
            const derived = sides.derived || _resolveFavFromSides(sides.red, sides.blue).v2.derived;
            resolvedFav = derived.redStatus === 'fav' && derived.blueStatus !== 'fav' ? 'red' :
                (derived.blueStatus === 'fav' && derived.redStatus !== 'fav' ? 'blue' : (resolvedFav || 'red'));
            const resolvedSide = resolvedFav === 'red' ? sides.red : sides.blue;
            resolvedA = resolvedSide.a;
            resolvedB = resolvedSide.b;
        } else if (!resolvedFav || resolvedA == null || resolvedB == null) {
            const derived = _resolveFavFromSides(sides.red, sides.blue);
            resolvedFav = resolvedFav || derived.resolvedFav;
            if (resolvedA == null) resolvedA = derived.resolvedA;
            if (resolvedB == null) resolvedB = derived.resolvedB;
        }
        if (!resolvedFav || resolvedA == null || resolvedB == null) return; // ไม่มีผลลัพธ์
        const aRound = Math.round(resolvedA), bRound = Math.round(resolvedB);
        if (fEl) fEl.value = resolvedFav;
        if (aEl) aEl.value = aRound;
        if (bEl) bEl.value = bRound;
        // 2.1) ซิงค์ฝั่งรอง: corner = ตรงข้ามฝั่งต่อ, ODDS = ดึงมาจากฝั่งตรงข้ามจริงของ point (dog side's own odds), ไม่สลับ A:B ของฝั่งต่อ
        const dogCornerExpected = resolvedFav === 'red' ? 'blue' : 'red';
        if (dEl) dEl.value = dogCornerExpected;
        const dogSide = dogCornerExpected === 'red' ? sides.red : sides.blue;
        if (dogSide && dogSide.isValid && dogSide.a != null && dogSide.b != null) {
            if (daEl) daEl.value = Math.round(dogSide.a);
            if (dbEl) dbEl.value = Math.round(dogSide.b);
        } else {
            if (daEl) daEl.value = '';
            if (dbEl) dbEl.value = '';
        }

        // 3) Update header + currentPrice compat
        if (hdr) {
            const redShort  = sides.red.a > 0 && sides.red.b > 0 ? `🔴${sides.red.a}:${sides.red.b}` : '🔴-';
            const blueShort = sides.blue.a > 0 && sides.blue.b > 0 ? `🔵${sides.blue.a}:${sides.blue.b}` : '🔵-';
            
            const is10_10 = (aRound === bRound);
            const isBoth10_9 = (sides.red.a === 10 && sides.red.b === 9 && sides.blue.a === 10 && sides.blue.b === 9);

            if (is10_10) {
                hdr.innerHTML = `<span style="color:#38bdf8;font-weight:bold;">⚖️ Scenario ราคาเสมอ (10:10) (จุดที่ ${_player.stepIndex}) ${redShort} ${blueShort}</span>`;
            } else if (isBoth10_9) {
                hdr.innerHTML = `<span style="color:#fbbf24;font-weight:bold;">⚡ Scenario ราคาเบียดสูสี (10:9 ทั้งคู่) (จุดที่ ${_player.stepIndex}) ${redShort} ${blueShort}</span>`;
            } else {
                hdr.innerHTML = `<span style="color:#00ff88;font-weight:bold;">📚 Scenario ${resolvedFav==='red'?'🔴':'🔵'} ต่อ ${aRound}:${bRound} (จุดที่ ${_player.stepIndex}) ${redShort} ${blueShort}</span>`;
            }
        }
        window.currentPrice = {
            favCorner: resolvedFav, oddA: aRound, oddB: bRound,
            red: { a: sides.red.a, b: sides.red.b, raw: sides.red.raw || null },
            blue: { a: sides.blue.a, b: sides.blue.b, raw: sides.blue.raw || null }
        };
    }

    // (compat wrapper — ถ้ามีจุดไหนเรียก _applyPriceToUI แบบเดิม)
    // ⚠️ ถ้าจะเรียกฟังก์ชันนี้จากที่ไหนก็ตาม ต้องเรียก
    // window.countPriceUpdateIfGenuinelyChanged() ตามหลัง (ก่อน calculateAll())
    // ทุกครั้ง ไม่งั้น Forced-Exit Fallback grace counter จะไม่นับ (บั๊กเดิมที่เจอมาแล้ว 3 รอบ)
    function _applyPriceToUI(fav, a, b, silent) {
        _applyPriceToUIFromPoint({
            resolvedFav: fav, resolvedA: Math.round(a), resolvedB: Math.round(b),
            red:  { a: fav==='red' ? Math.round(a) : Math.round(b), b: fav==='red' ? Math.round(b) : Math.round(a), isValid: true, raw: `🔴 แดง: HDP ${fav==='red' ? a : b} : ${fav==='red' ? b : a}` },
            blue: { a: fav==='blue'? Math.round(a) : Math.round(b), b: fav==='blue'? Math.round(b) : Math.round(a), isValid: true, raw: `🔵 น้ำเงิน: HDP ${fav==='blue'? a : b} : ${fav==='blue'? b : a}` }
        }, silent);
    }

    function btHistStep(delta) {
        if (!_player.loaded) return;
        const nxt = _player.stepIndex + delta; const len = _player.scenario.journey.length;
        if (nxt < 0 || nxt >= len) return;
        btHistApplyStep(nxt, false);
        if (nxt === len - 1) setTimeout(() => btHistSettleIfEnded(true), 200);
    }

    function btHistJump(i) { btHistApplyStep(i, true); }

    function btHistJumpToEnd() {
        if (!_player.loaded) return;
        for (let k = _player.stepIndex + 1; k < _player.scenario.journey.length; k++) {
            btHistApplyStep(k, false);
        }
        setTimeout(() => btHistSettleIfEnded(true), 250);
    }
    window.btHistStep = btHistStep; window.btHistJump = btHistJump; window.btHistJumpToEnd = btHistJumpToEnd;

    function btHistSettleIfEnded(autoShow) {
        if (!_player.loaded) return;
        if (_player.stepIndex !== _player.scenario.journey.length - 1) return;
        const w = _player.scenario.winner;
        const redName = (_player.scenario.fighters || {}).red || 'แดง';
        const blueName = (_player.scenario.fighters || {}).blue || 'น้ำเงิน';
        const netRedRaw = ((document.getElementById('netRed')||{}).innerText || '').replace(/[^0-9.\-]/g, '');
        const netBlueRaw = ((document.getElementById('netBlue')||{}).innerText || '').replace(/[^0-9.\-]/g, '');
        const netRed = parseFloat(netRedRaw) || 0;
        const netBlue = parseFloat(netBlueRaw) || 0;
        const pnl = w === 'red' ? netRed : netBlue;
        const winnerText = w === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
        const entry = {
            idx: _agg.list.length + 1,
            at: Date.now(),
            fightId: _player.scenario.fightId,
            fighters: _player.scenario.fighters,
            winner: w,
            pnl: pnl,
            strategy: window.currentStrategy,
            ticketsCount: (window.tickets || []).length
        };
        _agg.list.push(entry);
        const lastEq = _agg.equity[_agg.equity.length - 1] || 0;
        _agg.equity.push(lastEq + pnl);
        _aggSave();
        btAggRender();
        if (autoShow) {
            btShowMatchResultModal({
                fightId: _player.scenario.fightId,
                fighters: _player.scenario.fighters || { red: redName, blue: blueName },
                winner: w,
                pnl: pnl,
                strategy: window.currentStrategy,
                ticketsCount: (window.tickets || []).length,
                journey: _player.scenario.journey || []
            });
        }
    }

    // ==========================================
    // 🏆 Match Result Modal Popup Functions
    // ==========================================
    function btShowMatchResultModal(data) {
        const modal = document.getElementById('btMatchResultModal');
        if (!modal) return;

        const isRedWinner = data.winner === 'red';
        const winnerName = isRedWinner 
            ? ((data.fighters && data.fighters.red) ? data.fighters.red : 'ฝั่งแดง')
            : ((data.fighters && data.fighters.blue) ? data.fighters.blue : 'ฝั่งน้ำเงิน');

        // 1. Winner Banner Card
        const banner = document.getElementById('btResultWinnerBanner');
        const nameEl = document.getElementById('btResultWinnerName');
        if (banner) {
            banner.className = `bt-result-winner-banner ${isRedWinner ? 'corner-red' : 'corner-blue'}`;
        }
        if (nameEl) {
            nameEl.textContent = winnerName;
        }

        // 2. PnL Value & Strategy Info
        const pnlEl = document.getElementById('btResultPnlValue');
        const stratEl = document.getElementById('btResultStrategyText');
        const tixEl = document.getElementById('btResultTicketsText');

        if (pnlEl) {
            const pnl = data.pnl || 0;
            pnlEl.textContent = `${pnl >= 0 ? '+' : ''}${Math.round(pnl).toLocaleString()} B`;
            pnlEl.className = pnl >= 0 ? 'text-green' : 'text-red';
        }
        if (stratEl) {
            stratEl.textContent = `กลยุทธ์: ${data.strategy || window.currentStrategy || '-'}`;
        }
        if (tixEl) {
            tixEl.textContent = `จำนวนแผล: ${data.ticketsCount || 0} แผล`;
        }

        // 3. Price Journey List
        const journeyList = document.getElementById('btResultJourneyList');
        if (journeyList && Array.isArray(data.journey)) {
            journeyList.innerHTML = data.journey.map((step, idx) => {
                const stepLabel = idx === 0 ? 'ราคาเปิด (Open)' : `จุด #${idx}`;
                const redTxt = step.red && step.red.raw ? step.red.raw : (step.red && step.red.isValid ? `🔴 HDP ${step.red.a}:${step.red.b}` : '🔴-');
                const blueTxt = step.blue && step.blue.raw ? step.blue.raw : (step.blue && step.blue.isValid ? `🔵 ${step.blue.a}:${step.blue.b} HDP` : '🔵-');
                return `
                    <div class="bt-result-journey-row">
                        <span class="bt-result-journey-label">${stepLabel}</span>
                        <span class="bt-result-journey-odds">${redTxt} | ${blueTxt}</span>
                    </div>
                `;
            }).join('');
        }

        modal.style.display = 'flex';

        // Play sound if available
        try {
            if (typeof SoundEngine !== 'undefined') {
                if (data.pnl >= 0 && SoundEngine.playGoldenBell) {
                    SoundEngine.playGoldenBell();
                } else if (SoundEngine.playHedgeSuccessSound) {
                    SoundEngine.playHedgeSuccessSound();
                }
            }
        } catch (e) {}
    }

    function btCloseMatchResultModal() {
        const modal = document.getElementById('btMatchResultModal');
        if (modal) modal.style.display = 'none';
    }

    function btRandomNextScenarioFromModal() {
        btCloseMatchResultModal();
        btHistRandomScenario();
    }

    function btNextScenarioFromModal() {
        btCloseMatchResultModal();
        btHistNextScenario();
    }

    window.btShowMatchResultModal = btShowMatchResultModal;
    window.btCloseMatchResultModal = btCloseMatchResultModal;
    window.btRandomNextScenarioFromModal = btRandomNextScenarioFromModal;
    window.btNextScenarioFromModal = btNextScenarioFromModal;

    function btHistSetAuto(on) {
        // 🔑 ใหม่: input เป็น **วินาที/จุด** (ทศนิยมได้) → แปลงเป็น ms โดย x 1000
        // (ก่อนหน้าเป็น select value ใน ms โดยตรง)
        const secVal = parseFloat((document.getElementById('btHistAutoSpeed')||{}).value);
        let speedSec = isFinite(secVal) && secVal > 0 ? secVal : 10;
        if (speedSec < 0.1) speedSec = 0.1;   // minimum 0.1 วิ/จุด (สุดเร็ว)
        _player.autoMs = Math.round(speedSec * 1000);
        if (_player.autoTimer) { clearInterval(_player.autoTimer); _player.autoTimer = null; }
        btHistToggleAutoUI(!!on);
        if (on) {
            _player.autoTimer = setInterval(() => {
                if (!_player.loaded) return;
                const len = _player.scenario.journey.length;
                if (_player.stepIndex >= len - 1) {
                    if (_player.autoTimer) { clearInterval(_player.autoTimer); _player.autoTimer = null; btHistToggleAutoUI(false); }
                    return;
                }
                btHistStep(+1);
            }, _player.autoMs);
        }
    }
    function btHistToggleAutoUI(on) {
        const off = document.getElementById('btHistAutoOffBtn');
        const onBtn = document.getElementById('btHistAutoOnBtn');
        [off, onBtn].forEach(el => { if (el) el.classList.remove('active'); });
        if (on) onBtn && onBtn.classList.add('active');
        else off && off.classList.add('active');
    }
    window.btHistSetAuto = btHistSetAuto;

    function btHistRenderScenarioInfo() {
        if (!_player.loaded) return;
        const f = document.getElementById('btHistFighters');
        const w = document.getElementById('btHistWinner');
        const st = document.getElementById('btHistStepInfo');
        const ti = document.getElementById('btHistTimeInfo');
        const n = _player.scenario.fighters || { red: 'แดง', blue: 'น้ำเงิน' };

        // อัปเดตชื่อนักมวยในแถบหัว Fighter Card
        const redNameHdr = document.getElementById('redFighterNameHeader');
        const blueNameHdr = document.getElementById('blueFighterNameHeader');
        if (redNameHdr && n.red) redNameHdr.innerText = n.red;
        if (blueNameHdr && n.blue) blueNameHdr.innerText = n.blue;

        if (f) f.textContent = `${n.red} vs ${n.blue}`;
        if (w) {
            const win = _player.scenario.winner;
            w.textContent = win === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
            w.style.color = win === 'red' ? '#ef4444' : '#3b82f6';
        }
        if (st) {
            const len = _player.scenario.journey.length;
            st.textContent = `จุดที่ ${_player.stepIndex + 1} / ${len} (idx ${_player.stepIndex})`;
        }
        if (ti) {
            const j = _player.scenario.journey[_player.stepIndex];
            if (j) {
                const s = Math.floor(j.offsetMs / 1000);
                ti.textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')} หลังเปิดราคา`;
            }
        }
    }

    function btHistRenderTimeline() {
        const tl = document.getElementById('btHistTimeline'); if (!tl) return;
        if (!_player.loaded || !_player.scenario) { tl.innerHTML = `<small class="bt-timeline-empty">ยังไม่ได้โหลด Scenario</small>`; return; }
        const j = _player.scenario.journey;
        tl.innerHTML = j.map((s, i) => {
            const active = i === _player.stepIndex;
            const passed = i < _player.stepIndex;
            const last = i === j.length - 1;
            const sides = _getReplayPointSides(s);
            const redOk  = sides.red && sides.red.a > 0 && sides.red.b > 0;
            const blueOk = sides.blue && sides.blue.a > 0 && sides.blue.b > 0;
            const hasInvalid = !redOk || !blueOk;
            let color, label;
            if (hasInvalid) {
                color = '#64748b';
                label = last ? `🏆 -` : `---`;
            } else {
                const state = sides.derived && sides.derived.marketState;
                const stateColors = {
                    BOTH_FAV: '#7c3aed', BOTH_EVEN: '#94a3b8', BOTH_DOG: '#9a3412',
                    RED_FAV_BLUE_DOG: '#059669', RED_DOG_BLUE_FAV: '#2563eb',
                    RED_FAV_BLUE_EVEN: '#22c55e', RED_EVEN_BLUE_FAV: '#38bdf8',
                    RED_EVEN_BLUE_DOG: '#f59e0b', RED_DOG_BLUE_EVEN: '#f97316'
                };
                color = stateColors[state] || ((s.resolvedFav || s.fav) === 'blue' ? '#3b82f6' : '#ef4444');
                const a = s.resolvedA != null ? s.resolvedA : sides.red.a;
                const b = s.resolvedB != null ? s.resolvedB : sides.red.b;
                label = last ? `🏆 ${a}:${b}` : `${a}:${b}`;
            }
            const cls = `bt-tl-dot ${active ? 'active' : ''} ${passed ? 'passed' : ''} ${last ? 'winner' : ''} ${hasInvalid ? 'bt-tl-dot-invalid' : ''}`;
            const title = hasInvalid
                ? `จุด ${i}: ❌ ไม่มีราคา (ข้าม ${s.src})`
                : `จุด ${i}: 🔴${sides.red.a}:${sides.red.b} | 🔵${sides.blue.a}:${sides.blue.b} (${s.src})`;
            return `<button class="${cls}" style="--c:${color};${hasInvalid?'opacity:0.35;filter:grayscale(1);':''}" onclick="btHistJump(${i})" title="${title}"><span>${label}</span></button>${i < j.length - 1 ? '<div class="bt-tl-rail"></div>' : ''}`;
        }).join('');
    }

    function btHistRenderButtons() {
        const prev = document.getElementById('btHistPrevBtn');
        const next = document.getElementById('btHistNextBtn');
        const first = document.getElementById('btHistFirstBtn');
        const last = document.getElementById('btHistLastBtn');
        const prevS = document.getElementById('btHistPrevScnBtn');
        const nextS = document.getElementById('btHistNextScnBtn');
        if (!_player.loaded) {
            [prev,next,first,last,prevS,nextS].forEach(el => { if (el) el.disabled = true; });
            return;
        }
        const i = _player.stepIndex, len = _player.scenario.journey.length;
        if (prev) prev.disabled = i <= 0;
        if (next) next.disabled = i >= len - 1;
        if (first) first.disabled = i === 0;
        if (last) last.disabled = i === len - 1;
        if (prevS) prevS.disabled = _player.library.length === 0;
        if (nextS) nextS.disabled = _player.library.length === 0;
    }

    // ---------- Aggregate Report ----------
    function btAggRender() {
        const cnt = document.getElementById('btAggCount'); if (cnt) cnt.textContent = _agg.list.length;
        const wr = document.getElementById('btAggWinRate');
        const tot = document.getElementById('btAggTotalPnL');
        const avg = document.getElementById('btAggAvg');
        const dd = document.getElementById('btAggDD');
        const pf = document.getElementById('btAggPF');
        const hedge = document.getElementById('btAggHedge');
        const fmt = n => `${n >= 0 ? '+' : ''}${n.toFixed(0)}`;
        if (_agg.list.length === 0) {
            if (wr) wr.textContent = '-';
            if (tot) { tot.textContent = '-'; tot.style.color = '#94a3b8'; }
            if (avg) avg.textContent = '-';
            if (dd) dd.textContent = '-';
            if (pf) pf.textContent = '-';
            if (hedge) hedge.textContent = '-';
            return;
        }
        const wins = _agg.list.filter(x => x.pnl > 0).length;
        const wrVal = (wins / _agg.list.length) * 100;
        if (wr) wr.textContent = `${wins}/${_agg.list.length} = ${wrVal.toFixed(1)}%`;
        const total = _agg.list.reduce((s,x) => s + x.pnl, 0);
        if (tot) { tot.textContent = fmt(total) + ' บาท'; tot.style.color = total >= 0 ? '#22c55e' : '#ef4444'; }
        if (avg) avg.textContent = fmt(total / _agg.list.length);
        let peak = _agg.equity[0] || 0, mdd = 0;
        _agg.equity.forEach(v => { if (v > peak) peak = v; const d = peak - v; if (d > mdd) mdd = d; });
        if (dd) dd.textContent = '-' + mdd.toFixed(0);
        const grossWin = _agg.list.filter(x=>x.pnl>0).reduce((s,x)=>s+x.pnl,0) || 0;
        const grossLoss = Math.abs(_agg.list.filter(x=>x.pnl<0).reduce((s,x)=>s+x.pnl,0) || 0);
        if (pf) pf.textContent = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : (grossWin > 0 ? '∞' : '0');
        const withHedge = _agg.list.filter(x => x.ticketsCount >= 2).length;
        if (hedge) hedge.textContent = `${withHedge}/${_agg.list.length} (${_agg.list.length ? ((withHedge/_agg.list.length)*100).toFixed(0) : 0}%)`;
    }
    function btAggExportMd() {
        if (_agg.list.length === 0) { alert('ยังไม่มีผลการเล่นที่จะ export'); return; }
        const wins = _agg.list.filter(x=>x.pnl>0).length;
        const total = _agg.list.reduce((s,x)=>s+x.pnl,0);
        let peak = _agg.equity[0] || 0, mdd = 0; _agg.equity.forEach(v=>{if(v>peak)peak=v;const d=peak-v;if(d>mdd)mdd=d;});
        const grossWin = _agg.list.filter(x=>x.pnl>0).reduce((s,x)=>s+x.pnl,0) || 0;
        const grossLoss = Math.abs(_agg.list.filter(x=>x.pnl<0).reduce((s,x)=>s+x.pnl,0) || 0);
        const pf = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : '∞';
        const dt = (new Date()).toISOString().slice(0,16).replace('T',' ');
        let md = '# 📊 Backtest Aggregate Report\n\n';
        md += `สร้างเมื่อ: ${dt}\n\n`;
        md += '## สรุปผลรวม\n\n';
        md += `| ตัวชี้วัด | ค่า |\n|---|---|\n`;
        md += `| จำนวน Scenario | ${_agg.list.length} |\n`;
        md += `| Win Rate | ${wins}/${_agg.list.length} = ${(wins/_agg.list.length*100).toFixed(1)}% |\n`;
        md += `| PnL รวม | ${total>=0?'+':''}${total.toFixed(0)} บาท |\n`;
        md += `| เฉลี่ยต่อไฟท์ | ${(total/_agg.list.length).toFixed(0)} บาท |\n`;
        md += `| Max Drawdown | -${mdd.toFixed(0)} บาท |\n`;
        md += `| Profit Factor | ${pf} |\n\n`;
        md += '## Equity Curve (cumulative)\n\n';
        md += '```\n';
        md += _agg.equity.map((v,i)=>`[${i}] ${v.toFixed(0)}`).join('\n');
        md += '\n```\n\n';
        md += '## รายการทีละไฟท์\n\n';
        md += '| # | fightId | นักมวย | strategy | แชมป์ | PnL | tickets |\n';
        md += '|---|---------|---------|----------|-------|-----|---------|\n';
        _agg.list.slice().reverse().forEach((r) => {
            md += `| ${r.idx} | ${r.fightId} | ${r.fighters.red||'?'} vs ${r.fighters.blue||'?'} | ${r.strategy||'-'} | ${r.winner==='red'?'🔴':'🔵'} | ${r.pnl>=0?'+':''}${r.pnl.toFixed(0)} | ${r.ticketsCount} |\n`;
        });
        _saveText(`backtest_report_${Date.now()}.md`, md);
    }
    function btAggExportCsv() {
        if (_agg.list.length === 0) { alert('ยังไม่มีผล'); return; }
        const esc = s => `"${String(s).replace(/"/g,'""')}"`;
        let csv = ['idx,fightId,red,blue,strategy,winner,pnl,tickets,at'].join(',') + '\n';
        _agg.list.forEach(r => {
            csv += [r.idx,esc(r.fightId),esc((r.fighters||{}).red||''),esc((r.fighters||{}).blue||''),esc(r.strategy||''),esc(r.winner),r.pnl.toFixed(2),r.ticketsCount,new Date(r.at).toISOString()].join(',') + '\n';
        });
        const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href=url; a.download=`backtest_report_${Date.now()}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url),2000);
    }
    function btAggReset() {
        if (!confirm('ล้างประวัติสรุปผลทั้งหมดหรือไม่?')) return;
        _agg.list = []; _agg.equity = [0]; _aggSave(); btAggRender();
    }
    window.btAggExportMd = btAggExportMd; window.btAggExportCsv = btAggExportCsv; window.btAggReset = btAggReset;

    function _findPanelByText(column, text) {
        if (!column) return null;
        return Array.from(column.querySelectorAll('.glossy-panel')).find(panel => panel.textContent.includes(text)) || null;
    }

    // จัดตำแหน่งแผงเสริมให้อยู่เหนือแผงหลักของแต่ละคอลัมน์
    function _relocateExtensionPanels() {
        const recorder = document.querySelector('.recorder-panel');
        const backtest = document.querySelector('.backtest-hub-panel');
        const leftColumn = document.querySelector('.col-left');
        const rightColumn = document.querySelector('.col-right');
        const historyPanel = _findPanelByText(leftColumn, 'History Bet');
        const strategyPanel = _findPanelByText(rightColumn, 'Matchs & Strategy');

        if (recorder && historyPanel && recorder !== historyPanel) {
            historyPanel.parentElement.insertBefore(recorder, historyPanel);
        }
        if (backtest && strategyPanel && backtest !== strategyPanel) {
            strategyPanel.parentElement.insertBefore(backtest, strategyPanel);
        }
    }

    // พับแผง Recorder / Backtest ไว้ก่อน เพื่อไม่ให้กินพื้นที่หน้าหลัก
    function _installPanelCollapse() {
        [
            { selector: '.recorder-panel', title: '📝 Fight Data Recorder' },
            { selector: '.backtest-hub-panel', title: '🧪 Backtest Hub' }
        ].forEach(({ selector, title }) => {
            const panel = document.querySelector(selector);
            if (!panel || panel.dataset.collapseReady === 'true') return;

            const header = panel.querySelector(':scope > .recorder-panel-header, :scope > .backtest-panel-header, :scope > .glossy-header') || panel.firstElementChild;
            if (!header) return;

            const content = document.createElement('div');
            content.className = 'collapsible-panel-content';
            while (header.nextElementSibling) content.appendChild(header.nextElementSibling);
            panel.appendChild(content);

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'collapsible-panel-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            const headerLabel = document.createElement('span');
            headerLabel.className = 'collapsible-panel-label';
            if (header.childNodes.length) {
                while (header.firstChild) headerLabel.appendChild(header.firstChild);
            } else {
                headerLabel.textContent = title;
            }
            const chevron = document.createElement('span');
            chevron.className = 'collapsible-panel-chevron';
            chevron.textContent = '⌄';
            toggle.append(headerLabel, chevron);
            header.classList.add('collapsible-panel-header');
            header.appendChild(toggle);

            toggle.addEventListener('click', () => {
                const open = panel.classList.toggle('is-expanded');
                content.hidden = !open;
                toggle.setAttribute('aria-expanded', String(open));
            });
            content.hidden = true;
            panel.dataset.collapseReady = 'true';
        });
    }

    // ---------- Init เมื่อ DOM พร้อม ----------
    function _initUI() {
        _relocateExtensionPanels();
        _installPanelCollapse();
        _recLoadLibrary();
        _recRenderStatus();
        _aggLoad();
        btAggRender();
        btSwitchTab('random');
        setTimeout(() => { btRandomSync(); btHistInit(); }, 100);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initUI);
    else setTimeout(_initUI, 50);

})();
