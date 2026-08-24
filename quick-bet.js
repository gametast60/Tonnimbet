// ==========================================
// Quick Bet Dashboard Script
// ==========================================

// ---- Win/Lose Preview Calculator ----
function qbUpdatePnLPreview() {
    const redEl  = document.getElementById('qbRedPnL');
    const blueEl = document.getElementById('qbBluePnL');
    if (!redEl || !blueEl) return;

    const input = document.getElementById('qbBetAmount');
    const stake = input ? (parseFloat(input.value) || 0) : 0;

    if (stake <= 0) {
        redEl.textContent  = 'Win 0 / Lose 0';
        blueEl.textContent = 'Win 0 / Lose 0';
        return;
    }

    // ดึงราคาแยกจากข้อความของแต่ละฝั่ง (เหมือนกับที่ qbTriggerAutoBet ใช้)
    const redOddsText  = document.getElementById('redOddsText');
    const blueOddsText = document.getElementById('blueOddsText');

    const redParsed  = redOddsText  ? qbParseOddsText(redOddsText.innerText)  : null;
    const blueParsed = blueOddsText ? qbParseOddsText(blueOddsText.innerText) : null;

    const currentRed = (typeof currentPrice !== 'undefined' && currentPrice && currentPrice.red && !isNaN(currentPrice.red.a) && !isNaN(currentPrice.red.b) && currentPrice.red.a > 0 && currentPrice.red.b > 0) ? currentPrice.red : null;
    const currentBlue = (typeof currentPrice !== 'undefined' && currentPrice && currentPrice.blue && !isNaN(currentPrice.blue.a) && !isNaN(currentPrice.blue.b) && currentPrice.blue.a > 0 && currentPrice.blue.b > 0) ? currentPrice.blue : null;

    const oddAFallback = parseFloat((document.getElementById('liveOddA') || {}).value) || 0;
    const oddBFallback = parseFloat((document.getElementById('liveOddB') || {}).value) || 0;
    const favCornerEl = document.getElementById('liveFavCorner');
    const favCorner   = favCornerEl ? favCornerEl.value : '';

    const dogCornerEl = document.getElementById('liveDogCorner');
    const dogCorner = dogCornerEl ? dogCornerEl.value : '';
    const dogAFallbackRaw = parseFloat((document.getElementById('dogOddA') || {}).value) || 0;
    const dogBFallbackRaw = parseFloat((document.getElementById('dogOddB') || {}).value) || 0;

    let liveRed = redParsed || currentRed;
    if (!liveRed) {
        if (favCorner === 'red' && oddAFallback > 0 && oddBFallback > 0) liveRed = { a: oddAFallback, b: oddBFallback };
        else if (dogCorner === 'red' && dogAFallbackRaw > 0 && dogBFallbackRaw > 0) liveRed = { a: dogAFallbackRaw, b: dogBFallbackRaw };
    }

    let liveBlue = blueParsed || currentBlue;
    if (!liveBlue) {
        if (favCorner === 'blue' && oddAFallback > 0 && oddBFallback > 0) liveBlue = { a: oddAFallback, b: oddBFallback };
        else if (dogCorner === 'blue' && dogAFallbackRaw > 0 && dogBFallbackRaw > 0) liveBlue = { a: dogAFallbackRaw, b: dogBFallbackRaw };
    }

    if (!liveRed || !liveBlue || liveRed.a <= 0 || liveRed.b <= 0 || liveBlue.a <= 0 || liveBlue.b <= 0) {
        redEl.textContent  = 'Win ? / Lose ?';
        blueEl.textContent = 'Win ? / Lose ?';
        return;
    }

    const redSide  = (typeof deriveSideFromOdds === 'function') ? deriveSideFromOdds(liveRed.a, liveRed.b) : (liveRed.a > liveRed.b ? 'fav' : (liveRed.a < liveRed.b ? 'dog' : 'even'));
    const blueSide = (typeof deriveSideFromOdds === 'function') ? deriveSideFromOdds(liveBlue.a, liveBlue.b) : (liveBlue.a > liveBlue.b ? 'fav' : (liveBlue.a < liveBlue.b ? 'dog' : 'even'));

    let redWin = 0, redLose = 0;
    if (redSide === 'fav') {
        const favRatio = (liveRed.b > 0 && liveRed.a > 0) ? (liveRed.a >= liveRed.b ? (liveRed.a / liveRed.b) : (liveRed.b / liveRed.a)) : 1;
        redWin  = stake;
        redLose = stake * favRatio;
    } else {
        const dogRatio = (liveRed.a > 0 && liveRed.b > 0) ? (liveRed.a >= liveRed.b ? (liveRed.a / liveRed.b) : (liveRed.b / liveRed.a)) : 1;
        redWin  = stake * dogRatio;
        redLose = stake;
    }

    let blueWin = 0, blueLose = 0;
    if (blueSide === 'fav') {
        const favRatio = (liveBlue.b > 0 && liveBlue.a > 0) ? (liveBlue.a >= liveBlue.b ? (liveBlue.a / liveBlue.b) : (liveBlue.b / liveBlue.a)) : 1;
        blueWin  = stake;
        blueLose = stake * favRatio;
    } else {
        const dogRatio = (liveBlue.a > 0 && liveBlue.b > 0) ? (liveBlue.a >= liveBlue.b ? (liveBlue.a / liveBlue.b) : (liveBlue.b / liveBlue.a)) : 1;
        blueWin  = stake * dogRatio;
        blueLose = stake;
    }

    const fmt = (n) => Math.round(n).toLocaleString();

    redEl.textContent  = `Win +${fmt(redWin)} / Lose -${fmt(redLose)}`;
    blueEl.textContent = `Win +${fmt(blueWin)} / Lose -${fmt(blueLose)}`;
}

// ผูก Event listener กับช่อง input
function qbInitPnLListener() {
    const input = document.getElementById('qbBetAmount');
    if (input && !input._hasPnLListener) {
        input._hasPnLListener = true;
        input.addEventListener('input', qbUpdatePnLPreview);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', qbInitPnLListener);
} else {
    qbInitPnLListener();
}

function qbAddBet(val) {
    const input = document.getElementById('qbBetAmount');
    if (!input) return;
    input.value = (parseFloat(input.value) || 0) + val;
    qbUpdatePnLPreview();
}

function qbClearBetAmount() {
    const input = document.getElementById('qbBetAmount');
    if (input) {
        input.value = '';
        input.focus();
    }
    qbUpdatePnLPreview();
}

function qbFillMin() {
    const minEl = document.getElementById('qbMinVal');
    const input = document.getElementById('qbBetAmount');
    if (minEl && input) {
        const val = minEl.innerText.replace(/,/g, '').trim();
        if (val) input.value = val;
        qbUpdatePnLPreview();
    }
    const bc = new BroadcastChannel('muay_channel');
    bc.postMessage({ action: 'CLICK_MIN_BET' });
}

function qbFillMax() {
    const maxEl = document.getElementById('qbMaxVal');
    const input = document.getElementById('qbBetAmount');
    if (maxEl && input) {
        const val = maxEl.innerText.replace(/,/g, '').trim();
        if (val) input.value = val;
        qbUpdatePnLPreview();
    }
    const bc = new BroadcastChannel('muay_channel');
    bc.postMessage({ action: 'CLICK_MAX_BET' });
}

// แยกตัวเลขราคาจากข้อความหัวด้านบน เช่น "HDP 1 : 3" -> { a: 1, b: 3 }, "🔴 แดง: HDP 4 : 1" -> { a: 4, b: 1 } (Verbatim)
function qbParseOddsText(text) {
    if (!text) return null;
    const matches = text.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length < 2) return null;
    
    const a = parseFloat(matches[0]);
    const b = parseFloat(matches[1]);
    
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return null;
    
    return { a, b };
}

function qbTriggerAutoBet(corner, amountOverride) {
    const input = document.getElementById('qbBetAmount');
    let amount = amountOverride !== undefined && amountOverride > 0
        ? parseFloat(amountOverride)
        : (input ? parseFloat(input.value) : 0);

    if (!amount || amount <= 0) {
        alert('กรุณากรอกจำนวนเงินก่อนกดแทงครับ');
        return;
    }

    if (input) {
        input.value = amount;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 0. รีเซ็ตสถานะการรอยืนยัน เพื่อให้ Modal สามารถแสดงผลได้ทันที
    _isSubmittingConfirm = false;
    _lastModalDataKey = '';

    // 1. ส่งคำสั่งยิงแทงไปยัง Tampermonkey ผ่าน BroadcastChannel
    const bc = new BroadcastChannel('muay_channel');
    bc.postMessage({
        action: 'PLACE_BET_HUMAN',
        corner: corner, // 'red' หรือ 'blue'
        amount: amount
    });

    // 2. ดึงราคาเฉพาะของฝั่งที่กด (แดงเอาหัวซ้าย, น้ำเงินเอาหัวขวา)
    let targetText = '';
    if (corner === 'red') {
        const redOddsEl = document.getElementById('redOddsText');
        targetText = redOddsEl ? redOddsEl.innerText : '';
    } else {
        const blueOddsEl = document.getElementById('blueOddsText');
        targetText = blueOddsEl ? blueOddsEl.innerText : '';
    }

    let targetOdds = qbParseOddsText(targetText);

    if (!targetOdds && typeof currentPrice !== 'undefined' && currentPrice) {
        const cOdds = corner === 'red' ? currentPrice.red : currentPrice.blue;
        if (cOdds && !isNaN(cOdds.a) && !isNaN(cOdds.b) && cOdds.a > 0 && cOdds.b > 0) {
            targetOdds = { a: cOdds.a, b: cOdds.b };
        }
    }

    if (!targetOdds) {
        // Fallback จากช่อง liveFavCorner / liveDogCorner
        const favCornerEl = document.getElementById('liveFavCorner');
        const favCornerVal = favCornerEl ? favCornerEl.value : '';
        const favAEl = document.getElementById('liveOddA');
        const favBEl = document.getElementById('liveOddB');
        const dogCornerEl = document.getElementById('liveDogCorner');
        const dogCornerVal = dogCornerEl ? dogCornerEl.value : '';
        const dogAEl = document.getElementById('dogOddA');
        const dogBEl = document.getElementById('dogOddB');

        const faRaw = (favAEl && favAEl.value !== '') ? (parseFloat(favAEl.value) || 0) : 0;
        const fbRaw = (favBEl && favBEl.value !== '') ? (parseFloat(favBEl.value) || 0) : 0;
        const daRaw = (dogAEl && dogAEl.value !== '') ? (parseFloat(dogAEl.value) || 0) : 0;
        const dbRaw = (dogBEl && dogBEl.value !== '') ? (parseFloat(dogBEl.value) || 0) : 0;

        if (corner === favCornerVal && faRaw > 0 && fbRaw > 0) {
            targetOdds = { a: faRaw, b: fbRaw };
        } else if (corner === dogCornerVal && daRaw > 0 && dbRaw > 0) {
            targetOdds = { a: daRaw, b: dbRaw };
        } else if (faRaw > 0 && fbRaw > 0) {
            targetOdds = { a: faRaw, b: fbRaw };
        } else if (daRaw > 0 && dbRaw > 0) {
            targetOdds = { a: daRaw, b: dbRaw };
        } else {
            targetOdds = { a: 2, b: 1 };
        }
    }

    const oddA = targetOdds.a;
    const oddB = targetOdds.b;
    const side = (typeof deriveSideFromOdds === 'function') 
        ? deriveSideFromOdds(oddA, oddB) 
        : (oddA > oddB ? 'fav' : (oddA < oddB ? 'dog' : 'even'));

    // 4. เคลียร์ช่อง input หลังกดแทงเรียบร้อย
    if (input) {
        input.value = '';
    }

    // 5. สร้างประวัติการกด (Bet History) อัตโนมัติ
    if (typeof addTicket === 'function') {
        addTicket(corner, side, oddA, oddB, amount);
    }

    // มั่นใจ 100% ว่าช่อง input ยังคงว่าง
    if (input) {
        input.value = '';
    }

    // 6. แสดงผลการกดในแถบสถานะ (qbStatus)
    const statusEl = document.getElementById('qbStatus');
    if (statusEl) {
        const cornerText = corner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
        const sideText = side === 'fav' ? 'ต่อ' : (side === 'dog' ? 'รอง' : 'เสมอ');
        statusEl.innerHTML = `<span style="color: #00ff88; font-size: 0.8rem; font-weight: 500;">⚡ ส่งคำสั่งแทง [${cornerText} ${sideText} ${oddA}:${oddB}] ${amount.toLocaleString()} B แล้ว</span>`;
        
        clearTimeout(window._qbStatusTimeout);
        window._qbStatusTimeout = setTimeout(() => {
            if (statusEl) statusEl.innerHTML = '';
        }, 4000);
    }
}

// ============================================================
// Confirm Bet Modal Controller (ซิงค์สถานะและคำสั่งกดกับเว็บหลัก ป้องกันการกระพริบ 100%)
// ============================================================

let _isConfirmModalOpen = false;
let _isSubmittingConfirm = false;
let _confirmLockTimer = null;
let _lastModalDataKey = '';

function qbShowConfirmModal(data) {
    const overlay = document.getElementById('confirmBetModalOverlay');
    if (!overlay) return;

    // ถ้ากำลังอยู่ในช่วงกดยืนยัน/ยกเลิก (Lock) ห้ามเปิดซ้ำซาก
    if (_isSubmittingConfirm) return;

    // ต้องมีข้อมูลราคาและยอดเงินจริงเท่านั้น ถ้าเป็นค่าว่าง (เช่น ช่วงแอนิเมชันปิด) ไม่ต้องแสดง
    if (!data.rateText || !data.amountText || data.rateText.trim() === '' || data.amountText.trim() === '') {
        return;
    }

    const titleEl = document.getElementById('confirmModalTitle');
    const rateEl = document.getElementById('confirmModalRate');
    const amountEl = document.getElementById('confirmModalAmount');
    const sideWrapper = document.getElementById('confirmModalSideWrapper');
    const winEl = document.getElementById('confirmModalWin');
    const fighterEl = document.getElementById('confirmModalFighterName');
    const loseEl = document.getElementById('confirmModalLose');

    // 1. หัวข้อ
    if (titleEl) titleEl.innerText = data.title || 'Confirm Bet';

    // 2. อัตราต่อรอง & จำนวนเงิน
    if (rateEl) rateEl.innerText = data.rateText;
    if (amountEl) amountEl.innerText = data.amountText;

    // 3. ฝั่ง Side (Blue / Red)
    const isBlue = data.isBlueSide || (data.sideText && data.sideText.toLowerCase().includes('blue')) || (data.corner === 'blue');
    const cornerClass = isBlue ? 'BLUE' : 'RED';
    const sideName = isBlue ? 'Blue' : 'Red';

    if (sideWrapper) {
        sideWrapper.innerHTML = `Side <span class="${cornerClass}" id="confirmModalSideText">${sideName}</span>`;
    }

    // 4. ยอดชนะ Win
    if (winEl) winEl.innerText = data.winText || 'Win 0.00';

    // 5. ชื่อนักมวย
    if (fighterEl) {
        fighterEl.innerText = data.fighterName || (isBlue ? 'MaLek Chechut Efo Phum Phan Muang' : 'Phayayut Po Hatyai');
        fighterEl.className = cornerClass;
    }

    // 6. ยอดเสีย Lose
    if (loseEl) loseEl.innerText = data.loseText || 'Lose 0.00';

    // แสดง Modal Popup
    overlay.style.display = 'flex';
    _isConfirmModalOpen = true;

    // ==========================================
    // Auto Confirm Logic (ถ้าเปิด Auto Confirm ไว้)
    // delay 0.5 วินาที แล้ว auto-click ปุ่ม Confirm
    // ==========================================
    if (typeof autoConfirm !== 'undefined' && autoConfirm.enabled) {
        // Build key เพื่อป้องกัน double-click กรณี qbShowConfirmModal ถูกเรียกซ้ำ
        const confirmKey = (data.rateText || '') + '::' + (data.amountText || '') + '::' + Date.now().toFixed().slice(0, -3);
        if (!autoConfirm._processedConfirmKeys.has(confirmKey)) {
            autoConfirm._processedConfirmKeys.add(confirmKey);
            if (autoConfirm._processedConfirmKeys.size > 200) {
                autoConfirm._processedConfirmKeys = new Set(Array.from(autoConfirm._processedConfirmKeys).slice(-100));
            }
            console.log('%c🔔 [AUTO-CONFIRM] พบ Internal Confirm Dialog → หน่วง 0.5 วินาทีก่อนกดยืนยัน', 'color: #0ea5e9; font-weight: bold;');
            setTimeout(() => {
                const btnSubmit = document.getElementById('btnConfirmBetSubmit');
                if (btnSubmit && document.body.contains(btnSubmit) && _isConfirmModalOpen) {
                    console.log('%c✅ [AUTO-CONFIRM] Auto-click ปุ่ม Confirm (Internal) แล้ว', 'color: #10b981; font-weight: bold;');
                    if (typeof SoundEngine !== 'undefined') SoundEngine.playOrderExecuted();
                    try {
                        btnSubmit.click();
                    } catch (e) {
                        if (typeof qbSubmitConfirmBet === 'function') qbSubmitConfirmBet();
                    }
                }
            }, 500);
        }
    }
}

function qbHideConfirmModal() {
    const overlay = document.getElementById('confirmBetModalOverlay');
    if (overlay && overlay.style.display !== 'none') {
        overlay.style.display = 'none';
    }
    _isConfirmModalOpen = false;
    _lastModalDataKey = '';
}

// เมื่อผู้ใช้กดปุ่ม Confirm บนหน้าเว็บเรา
function qbSubmitConfirmBet() {
    // 1. ล็อคป้องกันสัญญาณสะท้อน (Echo loop) ทันที 100%
    _isSubmittingConfirm = true;
    clearTimeout(_confirmLockTimer);
    _confirmLockTimer = setTimeout(() => {
        _isSubmittingConfirm = false;
    }, 4000);

    // 2. ปิด Modal หน้าจอทันทีแบบ Optimistic UI
    qbHideConfirmModal();

    // เคลียร์ช่อง input ให้ว่าง 100% และรีเซ็ตสถานะ
    const input = document.getElementById('qbBetAmount');
    if (input) {
        input.value = '';
    }

    // 3. เคลียร์ ID แผลล่าสุด (ยืนยันแล้ว เก็บไว้ใน History Bet ต่อไป)
    window._lastCreatedTicketId = null;

    // 4. ส่งสัญญาณไปให้ Tampermonkey กดปุ่มยืนยันที่เว็บจริง
    const bc = new BroadcastChannel('muay_channel');
    bc.postMessage({
        action: 'CONFIRM_BET_CLICK',
        timestamp: Date.now()
    });

    const statusEl = document.getElementById('qbStatus');
    if (statusEl) {
        statusEl.innerHTML = `<span style="color: #00ff88; font-size: 0.8rem; font-weight: 600;">✅ ยืนยันการแทง (Confirm) เรียบร้อยแล้ว</span>`;
        clearTimeout(window._qbStatusTimeout);
        window._qbStatusTimeout = setTimeout(() => {
            if (statusEl) statusEl.innerHTML = '';
        }, 4000);
    }
}

// เมื่อผู้ใช้กดปุ่มปิด (X) หรือ ยกเลิกการเดิมพัน
function qbCancelConfirmBet() {
    _isSubmittingConfirm = true;
    clearTimeout(_confirmLockTimer);
    _confirmLockTimer = setTimeout(() => {
        _isSubmittingConfirm = false;
    }, 4000);

    qbHideConfirmModal();

    // 1. ลบแผลประวัติ (History Bet) ตัวล่าสุดที่พึ่งสร้างออกโดยอัตโนมัติ
    if (window._lastCreatedTicketId && typeof removeTicket === 'function') {
        removeTicket(window._lastCreatedTicketId);
        window._lastCreatedTicketId = null;
    }

    // 2. ส่งคำสั่งยกเลิกไปยัง Tampermonkey เพื่อกดปุ่มปิดที่เว็บจริง
    const bc = new BroadcastChannel('muay_channel');
    bc.postMessage({
        action: 'CONFIRM_BET_CANCEL',
        timestamp: Date.now()
    });

    const statusEl = document.getElementById('qbStatus');
    if (statusEl) {
        statusEl.innerHTML = `<span style="color: #f87171; font-size: 0.8rem; font-weight: 500;">✕ ยกเลิกการเดิมพัน และลบแผลล่าสุดออกแล้ว</span>`;
        clearTimeout(window._qbStatusTimeout);
        window._qbStatusTimeout = setTimeout(() => {
            if (statusEl) statusEl.innerHTML = '';
        }, 3500);
    }
}



// รับค่า Min/Max และสถานะ Confirm Modal จากเว็บหลัก
const qbChannel = new BroadcastChannel('muay_channel');
qbChannel.onmessage = function(e) {
    const data = e.data || {};

    // 1. รับค่า Min/Max
    if (data.minBet !== undefined) {
        const minEl = document.getElementById('qbMinVal');
        if (minEl && minEl.innerText !== String(data.minBet)) minEl.innerText = data.minBet;
    }
    if (data.maxBet !== undefined) {
        const maxEl = document.getElementById('qbMaxVal');
        if (maxEl && maxEl.innerText !== String(data.maxBet)) maxEl.innerText = data.maxBet;
    }

    // เมื่อราคาสดอัปเดต ให้คำนวณ Win/Lose Preview ใหม่ด้วย
    if (data.favCorner !== undefined || data.oddA !== undefined) {
        qbUpdatePnLPreview();
    }

    // 2. รับสถานะ Confirm Modal จากเว็บหลัก
    if (data.type === 'CONFIRM_BET_STATE' || data.action === 'CONFIRM_BET_STATE') {
        if (!data.isOpen) {
            // เมื่อเว็บจริงปิด Modal แล้ว ปลดล็อคสถานะได้
            _isSubmittingConfirm = false;
            qbHideConfirmModal();
        } else {
            // ถ้ากำลังล็อคอยู่ (พึ่งกดยืนยัน/ยกเลิกไป) ห้ามเปิดซ้ำเด็ดขาด
            if (_isSubmittingConfirm) {
                return;
            }
            qbShowConfirmModal(data);
        }
    }
};

