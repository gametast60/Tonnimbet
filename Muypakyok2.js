let tickets = [];
let currentStrategy = 'skew_runner';
let skewTarget70 = 'red'; // 'red' | 'blue' — ฝั่งที่ได้รับ 70% กำไร (เฉพาะ skew_runner)
let breakevenProfitTarget = 'red'; // 'red' | 'blue' — ฝั่งที่ได้รับกำไร (เฉพาะ breakeven selector ใหม่)
let _isHedgeExecuting = false;
let _hedgeExecutionTimer = null;
let _priceUpdateCountSinceEntry = 0; // 🆕 grace period counter: นับครั้งที่ราคาถูกอัปเดตหลังวางตั๋วแรก
let _lastCountedOdds = { favCorner: null, favA: null, favB: null, dogCorner: null, dogA: null, dogB: null }; // 🆕 บันทึกราคาล่าสุดที่นับ
let _entryTargetRatio = null; // 🆕 targetRatio ตอนเข้าไม้แรก เพื่อเช็คราคาขยับ >= 0.15

const standardBoxingOdds = [
    { a: 10, b: 9, val: 10/9, label: "10:9" },
    { a: 5, b: 4, val: 5/4, label: "5:4" },
    { a: 11, b: 8, val: 11/8, label: "11:8" },
    { a: 3, b: 2, val: 3/2, label: "3:2" },
    { a: 5, b: 3, val: 5/3, label: "5:3" },
    { a: 7, b: 4, val: 7/4, label: "7:4" },
    { a: 2, b: 1, val: 2/1, label: "2:1" },
    { a: 5, b: 2, val: 5/2, label: "5:2" },
    { a: 3, b: 1, val: 3/1, label: "3:1" },
    { a: 7, b: 2, val: 7/2, label: "7:2" },
    { a: 4, b: 1, val: 4/1, label: "4:1" },
    { a: 5, b: 1, val: 5/1, label: "5:1" },
    { a: 6, b: 1, val: 6/1, label: "6:1" },
    { a: 8, b: 1, val: 8/1, label: "8:1" },
    { a: 10, b: 1, val: 10/1, label: "10:1" },
    { a: 20, b: 1, val: 20/1, label: "20:1" }
];


let previousPrice = {
    // LEGACY (keep for backward compat — derived only, NOT source of truth)
    favCorner: null, oddA: NaN, oddB: NaN,
    // NEW RED/BLUE INDEPENDENT (SOURCE OF TRUTH POST-STEP 4)
    red:  { a: NaN, b: NaN, raw: null },
    blue: { a: NaN, b: NaN, raw: null }
};

let currentPrice = { 
    // LEGACY (keep for backward compat — derived only, NOT source of truth)
    favCorner: null, oddA: NaN, oddB: NaN,
    // NEW RED/BLUE INDEPENDENT (SOURCE OF TRUTH POST-STEP 4)
    red:  { a: NaN, b: NaN, raw: null },
    blue: { a: NaN, b: NaN, raw: null }
};

// SHARED UTILITY FUNCTIONS (STEP 1 — Independent Odds Model Foundation)
function deriveSideFromOdds(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    if (numA > numB) return 'fav';    // ต่อ
    if (numA < numB) return 'dog';    // รอง
    return 'even';                    // เสมอ
}

function deriveCornerStatuses(redObj, blueObj) {
    // INDEPENDENT — no cross reference between red and blue
    const red = redObj || {};
    const blue = blueObj || {};
    const redStatus = deriveSideFromOdds(red.a, red.b);
    const blueStatus = deriveSideFromOdds(blue.a, blue.b);

    // MARKET STATE (meta, not stored — derived)
    const stateKey = `${redStatus}_${blueStatus}`;
    const marketState = {
        'fav_fav':   'BOTH_FAV',
        'fav_even':  'RED_FAV_BLUE_EVEN',
        'fav_dog':   'RED_FAV_BLUE_DOG',     // Classic case
        'even_fav':  'RED_EVEN_BLUE_FAV',
        'even_even': 'BOTH_EVEN',
        'even_dog':  'RED_EVEN_BLUE_DOG',
        'dog_fav':   'RED_DOG_BLUE_FAV',     // Classic case (inverted)
        'dog_even':  'RED_DOG_BLUE_EVEN',
        'dog_dog':   'BOTH_DOG'
    }[stateKey] || 'UNKNOWN';

    return { redStatus, blueStatus, marketState };
}

function isOddsValid(o) {
    if (!o) return false;
    const a = parseFloat(o.a);
    const b = parseFloat(o.b);
    return !isNaN(a) && !isNaN(b) && a > 0 && b > 0;
}

function cloneOdds(o) {
    if (!o) return { a: NaN, b: NaN, raw: null };
    return {
        a: typeof o.a === 'number' ? o.a : parseFloat(o.a),
        b: typeof o.b === 'number' ? o.b : parseFloat(o.b),
        raw: o.raw !== undefined ? o.raw : null
    };
}

const priceTracker = (typeof PriceJourneyEngine !== 'undefined') 
    ? new PriceJourneyEngine.PriceJourneyTracker() 
    : null;
window.priceTracker = priceTracker;

let _syncingFavDog = false;

// LEGACY UI COMPAT helper; V2 business logic derives each corner independently.
function _oppositeCorner(c) {
    return (c === 'red') ? 'blue' : ((c === 'blue') ? 'red' : '');
}

function _getFavInputs() {
    return {
        corner: document.getElementById('liveFavCorner'),
        a: document.getElementById('liveOddA'),
        b: document.getElementById('liveOddB')
    };
}

function _getDogInputs() {
    return {
        corner: document.getElementById('liveDogCorner'),
        a: document.getElementById('dogOddA'),
        b: document.getElementById('dogOddB')
    };
}

function parseOddsPreserveOrder(text) {
    if (!text) return null;
    const matches = String(text).match(/\d+(\.\d+)?/g);
    if (!matches || matches.length < 2) return null;
    const a = parseFloat(matches[0]);
    const b = parseFloat(matches[1]);
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return null;
    return { a, b };
}

function syncFavAndDogInputs(source) {
    if (_syncingFavDog) return;
    _syncingFavDog = true;
    try {
        const fav = _getFavInputs();
        const dog = _getDogInputs();

        const favCornerVal = (fav.corner && fav.corner.value) ? fav.corner.value : '';
        const dogCornerVal = (dog.corner && dog.corner.value) ? dog.corner.value : '';

        // ถ้า user เปลี่ยนจาก dropdown หน้าจอ และอีกฝั่งว่างอยู่
        if (source === 'fav' && (favCornerVal === 'red' || favCornerVal === 'blue')) {
            // ไม่บังคับว่า liveDogCorner = opposite เพื่อรองรับ BOTH_FAV หรืออิสระ
        } else if (source === 'dog' && (dogCornerVal === 'red' || dogCornerVal === 'blue')) {
            // ไม่บังคับว่า liveFavCorner = opposite
        }
    } finally {
        _syncingFavDog = false;
    }
}

function countPriceUpdateIfGenuinelyChanged() {
    if (tickets.length === 0) return;
    const curFavCorner = (document.getElementById('liveFavCorner') || {}).value || '';
    const curFavA = parseFloat((document.getElementById('liveOddA') || {}).value) || 0;
    const curFavB = parseFloat((document.getElementById('liveOddB') || {}).value) || 0;
    const curDogCorner = (document.getElementById('liveDogCorner') || {}).value || '';
    const curDogA = parseFloat((document.getElementById('dogOddA') || {}).value) || 0;
    const curDogB = parseFloat((document.getElementById('dogOddB') || {}).value) || 0;

    const isChanged = (curFavCorner !== _lastCountedOdds.favCorner) ||
                      (curFavA !== _lastCountedOdds.favA) ||
                      (curFavB !== _lastCountedOdds.favB) ||
                      (curDogCorner !== _lastCountedOdds.dogCorner) ||
                      (curDogA !== _lastCountedOdds.dogA) ||
                      (curDogB !== _lastCountedOdds.dogB);

    if (isChanged && ((curFavA > 0 && curFavB > 0) || (curDogA > 0 && curDogB > 0))) {
        _priceUpdateCountSinceEntry++;
        _lastCountedOdds = { favCorner: curFavCorner, favA: curFavA, favB: curFavB,
                              dogCorner: curDogCorner, dogA: curDogA, dogB: curDogB };
        console.log(`%c[PriceUpdate] count = ${_priceUpdateCountSinceEntry} (${curFavCorner} ${curFavA}:${curFavB} / ${curDogCorner} ${curDogA}:${curDogB})`, 'color:#38bdf8;font-weight:bold;');
    }
}
window.countPriceUpdateIfGenuinelyChanged = countPriceUpdateIfGenuinelyChanged;

function onFavOrDogChange(source) {
    syncFavAndDogInputs(source || 'fav');
    countPriceUpdateIfGenuinelyChanged();  // 🆕 ใช้ฟังก์ชันกลาง
    if (typeof calculateAll === 'function') calculateAll();
}
window.onFavOrDogChange = onFavOrDogChange;

window.onload = function() {
    syncFavAndDogInputs();

    const redEl = document.getElementById('redOddsText');
    const blueEl = document.getElementById('blueOddsText');
    const redParsed = redEl ? parseOddsPreserveOrder(redEl.innerText) : null;
    const blueParsed = blueEl ? parseOddsPreserveOrder(blueEl.innerText) : null;

    const liveFavCorner = (document.getElementById('liveFavCorner') || {}).value || '';
    const rawA = (document.getElementById('liveOddA') || {}).value;
    const rawB = (document.getElementById('liveOddB') || {}).value;
    const oddA = (rawA !== undefined && rawA !== '') ? (parseFloat(rawA) || 0) : 0;
    const oddB = (rawB !== undefined && rawB !== '') ? (parseFloat(rawB) || 0) : 0;

    const liveDogCorner = (document.getElementById('liveDogCorner') || {}).value || '';
    const rawDogA = (document.getElementById('dogOddA') || {}).value;
    const rawDogB = (document.getElementById('dogOddB') || {}).value;
    const dogOddA = (rawDogA !== undefined && rawDogA !== '') ? (parseFloat(rawDogA) || 0) : 0;
    const dogOddB = (rawDogB !== undefined && rawDogB !== '') ? (parseFloat(rawDogB) || 0) : 0;

    let redOdds = redParsed ? { a: redParsed.a, b: redParsed.b, raw: redEl.innerText } : null;
    let blueOdds = blueParsed ? { a: blueParsed.a, b: blueParsed.b, raw: blueEl.innerText } : null;

    if (!redOdds) {
        if (liveFavCorner === 'red' && oddA > 0 && oddB > 0) redOdds = { a: oddA, b: oddB, raw: `${oddA}:${oddB}` };
        else if (liveDogCorner === 'red' && dogOddA > 0 && dogOddB > 0) redOdds = { a: dogOddA, b: dogOddB, raw: `${dogOddA}:${dogOddB}` };
    }
    if (!blueOdds) {
        if (liveFavCorner === 'blue' && oddA > 0 && oddB > 0) blueOdds = { a: oddA, b: oddB, raw: `${oddA}:${oddB}` };
        else if (liveDogCorner === 'blue' && dogOddA > 0 && dogOddB > 0) blueOdds = { a: dogOddA, b: dogOddB, raw: `${dogOddA}:${dogOddB}` };
    }

    currentPrice.red = redOdds ? cloneOdds(redOdds) : { a: NaN, b: NaN, raw: null };
    currentPrice.blue = blueOdds ? cloneOdds(blueOdds) : { a: NaN, b: NaN, raw: null };

    // Legacy favCorner derivation
    const { redStatus, blueStatus } = deriveCornerStatuses(currentPrice.red, currentPrice.blue);
    if (redStatus === 'fav' && blueStatus !== 'fav') {
        currentPrice.favCorner = 'red';
        currentPrice.oddA = currentPrice.red.a;
        currentPrice.oddB = currentPrice.red.b;
    } else if (blueStatus === 'fav' && redStatus !== 'fav') {
        currentPrice.favCorner = 'blue';
        currentPrice.oddA = currentPrice.blue.a;
        currentPrice.oddB = currentPrice.blue.b;
    } else {
        currentPrice.favCorner = null;
        currentPrice.oddA = NaN;
        currentPrice.oddB = NaN;
    }

    previousPrice = null;

    if (priceTracker) {
        priceTracker.reset();
        if (isOddsValid(currentPrice.red) || isOddsValid(currentPrice.blue)) {
            const initialSnap = PriceJourneyEngine.createPriceSnapshotV2('', '', currentPrice.red, currentPrice.blue);
            priceTracker.appendSnapshot(initialSnap);
        }
    }
};

function getTicketPnL(t) {
    const a = parseFloat(t.a) || 1;
    const b = parseFloat(t.b) || 1;
    const stake = parseFloat(t.stake) || 0;
    const actualSide = t.side || deriveSideFromOdds(a, b);

    let winAmt = 0;
    let riskAmt = 0;

    if (actualSide === 'fav') { 
        const favRatio = (b > 0 && a > 0) ? (a >= b ? (a / b) : (b / a)) : 1;
        riskAmt = stake * favRatio;
        winAmt = stake;
    } else { 
        riskAmt = stake;
        const dogRatio = (a > 0 && b > 0) ? (a >= b ? (a / b) : (b / a)) : 1;
        winAmt = stake * dogRatio;
    }
    return { winAmt, riskAmt };
}

function addTicket(corner = 'red', side = null, a = 2, b = 1, stake = 100) {
    if (tickets.length === 0) {
        _priceUpdateCountSinceEntry = 0; // 🆕 reset ตอนวางตั๋วแรก
        _entryTargetRatio = null; // 🆕 reset entry target ratio
        const curFavCorner = (document.getElementById('liveFavCorner') || {}).value || '';
        const curFavA = parseFloat((document.getElementById('liveOddA') || {}).value) || 0;
        const curFavB = parseFloat((document.getElementById('liveOddB') || {}).value) || 0;
        const curDogCorner = (document.getElementById('liveDogCorner') || {}).value || '';
        const curDogA = parseFloat((document.getElementById('dogOddA') || {}).value) || 0;
        const curDogB = parseFloat((document.getElementById('dogOddB') || {}).value) || 0;
        _lastCountedOdds = {
            favCorner: curFavCorner,
            favA: curFavA,
            favB: curFavB,
            dogCorner: curDogCorner,
            dogA: curDogA,
            dogB: curDogB
        };
    }
    const aa = parseFloat(a) || 2;
    const bb = parseFloat(b) || 1;
    const actualSide = side || deriveSideFromOdds(aa, bb);
    const id = Date.now() + Math.random();
    const createdAt = Date.now();
    tickets.push({ id, corner, side: actualSide, a: aa, b: bb, stake, createdAt });
    window._lastCreatedTicketId = id;
    renderTickets();
    calculateAll();
    return id;
}

function removeTicket(id) {
    tickets = tickets.filter(t => t.id !== id);
    if (tickets.length === 0) {
        _priceUpdateCountSinceEntry = 0; // 🆕 reset เมื่อลบตั๋วทั้งหมด
        _entryTargetRatio = null;
        _lastCountedOdds = { favCorner: null, favA: null, favB: null, dogCorner: null, dogA: null, dogB: null };
    }
    renderTickets();
    calculateAll();
}

function updateTicket(id, key, val) {
    const t = tickets.find(t => t.id === id);
    if (t) {
        t[key] = (key === 'side' || key === 'corner') ? val : (parseFloat(val) || 0);
        
        if (key === 'corner') {
            const itemEl = document.getElementById('ticket-item-' + id);
            if (itemEl) itemEl.className = 'ticket-item corner-' + val;
            
            const btnRed = document.getElementById('btn-corner-red-' + id);
            const btnBlue = document.getElementById('btn-corner-blue-' + id);
            if (btnRed && btnBlue) {
                btnRed.classList.toggle('active', val === 'red');
                btnBlue.classList.toggle('active', val === 'blue');
            }
        }
        updateTicketSummaryText(t);
        calculateAll();
    }
}

function updateTicketSummaryText(t) {
    const pnl = getTicketPnL(t);
    const winEl = document.getElementById('win-val-' + t.id);
    const riskEl = document.getElementById('risk-val-' + t.id);
    if (winEl) winEl.innerText = '+' + Math.floor(pnl.winAmt) + ' B';
    if (riskEl) riskEl.innerText = '-' + Math.ceil(pnl.riskAmt) + ' B';
}

function renderTickets() {
    const container = document.getElementById('ticketContainer');
    if (!container) return;
    container.innerHTML = '';
    const ticketCountEl = document.getElementById('ticketCount');
    if (ticketCountEl) ticketCountEl.innerText = tickets.length + ' แผล';

    tickets.forEach((t, idx) => {
        const pnl = getTicketPnL(t);

        const item = document.createElement('div');
        item.id = 'ticket-item-' + t.id;
        item.className = 'ticket-item corner-' + (t.corner || 'red');
        item.innerHTML = 
            '<button class="btn-delete" onclick="removeTicket(' + t.id + ')">✕ ลบ</button>' +
            '<div class="ticket-header">' +
                '<div style="display:flex; align-items:center; gap: 8px;">' +
                    '<label style="font-weight:600; color:#fff;">แผล #' + (idx+1) + '</label>' +
                    '<div class="corner-toggle">' +
                        '<button id="btn-corner-red-' + t.id + '" class="btn-corner red ' + (t.corner === 'red' ? 'active' : '') + '" onclick="updateTicket(' + t.id + ', \'corner\', \'red\')">🔴 แดง</button>' +
                        '<button id="btn-corner-blue-' + t.id + '" class="btn-corner blue ' + (t.corner === 'blue' ? 'active' : '') + '" onclick="updateTicket(' + t.id + ', \'corner\', \'blue\')">🔵 เงิน</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="ticket-grid">' +
                '<div>' +
                    '<label>สถานะ</label>' +
                    '<select onchange="updateTicket(' + t.id + ', \'side\', this.value)">' +
                        '<option value="fav" ' + (t.side === 'fav' ? 'selected' : '') + '>ต่อ</option>' +
                        '<option value="dog" ' + (t.side === 'dog' ? 'selected' : '') + '>รอง</option>' +
                    '</select>' +
                '</div>' +
                '<div>' +
                    '<label>ราคาที่ได้</label>' +
                    '<div class="price-box">' +
                        '<input type="number" value="' + t.a + '" oninput="updateTicket(' + t.id + ', \'a\', this.value)">' +
                        '<span>:</span>' +
                        '<input type="number" value="' + t.b + '" oninput="updateTicket(' + t.id + ', \'b\', this.value)">' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<label>ยอดแทง (บาท)</label>' +
                    '<input type="number" value="' + t.stake + '" oninput="updateTicket(' + t.id + ', \'stake\', this.value)">' +
                '</div>' +
            '</div>' +
            '<div class="ticket-summary">' +
                '<span>🎯 กำไร: <strong class="text-green" id="win-val-' + t.id + '">+' + Math.floor(pnl.winAmt) + ' B</strong></span>' +
                '<span>❌ ถ้าเสีย: <strong class="text-red" id="risk-val-' + t.id + '">-' + Math.ceil(pnl.riskAmt) + ' B</strong></span>' +
            '</div>';
        container.appendChild(item);
    });

}

function setStrategy(strat) {
    currentStrategy = strat;
    const btnEqual = document.getElementById('btnEqual');
    const btnSkew = document.getElementById('btnSkewRunner');
    const btnBreakeven = document.getElementById('btnBreakeven');
    const btnSmartCut = document.getElementById('btnSmartCut');
    const btnFallback = document.getElementById('btnForcedFallback'); // 🆕

    if (btnEqual) btnEqual.classList.toggle('active', strat === 'equal');
    if (btnSkew) btnSkew.classList.toggle('active', strat === 'skew_runner');
    if (btnBreakeven) btnBreakeven.classList.toggle('active', strat === 'breakeven');
    if (btnSmartCut) btnSmartCut.classList.toggle('active', strat === 'smart_cut');
    if (btnFallback) btnFallback.classList.toggle('active', strat === 'forced_fallback'); // 🆕

    // แสดง/ซ่อน selector เฉพาะกลยุทธ์ (จำค่าเดิมไว้ ไม่รีเซ็ต)
    const skewTargetRow = document.getElementById('skewTargetRow');
    if (skewTargetRow) skewTargetRow.classList.toggle('hidden', strat !== 'skew_runner');
    const breakevenTargetRow = document.getElementById('breakevenTargetRow');
    if (breakevenTargetRow) breakevenTargetRow.classList.toggle('hidden', strat !== 'breakeven');

    calculateAll();
}

function setSkewTarget(val) {
    // val: 'red' | 'blue'
    if (val !== 'red' && val !== 'blue') val = 'red';
    skewTarget70 = val;

    const rRed = document.getElementById('skewRadioRed');
    const rBlue = document.getElementById('skewRadioBlue');
    const lRed = document.getElementById('labelSkewRed');
    const lBlue = document.getElementById('labelSkewBlue');

    if (rRed) rRed.checked = (val === 'red');
    if (rBlue) rBlue.checked = (val === 'blue');
    if (lRed) lRed.classList.toggle('checked', val === 'red');
    if (lBlue) lBlue.classList.toggle('checked', val === 'blue');

    calculateAll();
}

function setBreakevenProfitTarget(val) {
    // val: 'red' | 'blue'
    if (val !== 'red' && val !== 'blue') val = 'red';
    breakevenProfitTarget = val;

    const rRed = document.getElementById('breakevenRadioRed');
    const rBlue = document.getElementById('breakevenRadioBlue');
    const lRed = document.getElementById('labelBreakevenRed');
    const lBlue = document.getElementById('labelBreakevenBlue');

    if (rRed) rRed.checked = (val === 'red');
    if (rBlue) rBlue.checked = (val === 'blue');
    if (lRed) lRed.classList.toggle('checked', val === 'red');
    if (lBlue) lBlue.classList.toggle('checked', val === 'blue');

    calculateAll();
}

// Partial Cut Loss: ใช้ผลสุทธิพอร์ต + ราคาสด แต่ไม่เกี่ยวข้องกับ Auto-Hedge
function getPartialCutLossLivePrice() {
    const header = document.getElementById('liveOddsHeader');
    const headerText = header ? header.innerText.trim() : '';
    const liveFav = (document.getElementById('liveFavCorner') || {}).value || 'red';
    const pair = headerText.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
    const liveA = parseFloat((document.getElementById('liveOddA') || {}).value);
    const liveB = parseFloat((document.getElementById('liveOddB') || {}).value);
    const a = pair ? parseFloat(pair[1]) : liveA;
    const b = pair ? parseFloat(pair[2]) : liveB;
    const favCorner = headerText.includes('น้ำเงินต่อ') ? 'blue' : (headerText.includes('แดงต่อ') ? 'red' : liveFav);
    const sideText = favCorner === 'blue' ? '🔵 น้ำเงินต่อ' : '🔴 แดงต่อ';
    return { a, b, favCorner, displayText: (a > 0 && b > 0) ? sideText + ' ' + a + ':' + b : 'รอราคาสด' };
}

function syncPartialCutLossFromPortfolio(netRed, netBlue) {
    const risk1 = Math.abs(Math.min(netRed, netBlue, 0));
    const profit1 = Math.max(netRed, netBlue, 0);
    const riskInput = document.getElementById('partialRisk1');
    const profitInput = document.getElementById('partialProfit1');
    if (!riskInput || !profitInput) return;
    riskInput.value = Math.round(risk1);
    profitInput.value = Math.round(profit1);
    calculatePartialCutLoss();
}

function calculatePartialCutLoss() {
    const getValue = (id) => Math.max(0, parseFloat((document.getElementById(id) || {}).value) || 0);
    const risk1 = getValue('partialRisk1');
    const profit1 = getValue('partialProfit1');
    const livePrice = getPartialCutLossLivePrice();
    const oddA = livePrice.a > 0 ? livePrice.a : 0;
    const oddB = livePrice.b > 0 ? livePrice.b : 0;
    const slider = document.getElementById('partialHedgeTarget');
    if (!slider) return;

    slider.max = risk1;
    if (slider.dataset.partialInitialized !== 'true' && risk1 > 0) {
        slider.value = Math.min(risk1, Math.round((risk1 * 0.6) / 100) * 100);
        slider.dataset.partialInitialized = 'true';
    }
    let profit2 = Math.min(risk1, getValue('partialHedgeTarget'));
    if (parseFloat(slider.value) !== profit2) slider.value = profit2;

    const risk2 = oddB > 0 ? profit2 * (oddA / oddB) : 0;
    const netLoss = -risk1 + profit2;
    const netWin = profit1 - risk2;
    const formatMoney = (value) => '฿' + Math.round(Math.abs(value)).toLocaleString();
    const setOutcome = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = (value < 0 ? '−' : '+') + formatMoney(value);
        el.classList.toggle('is-positive', value >= 0);
    };

    const profit2El = document.getElementById('partialProfit2');
    const risk2El = document.getElementById('partialRisk2');
    const targetEl = document.getElementById('partialHedgeTargetValue');
    const liveOddsText = document.getElementById('partialLiveOddsText');
    if (profit2El) profit2El.textContent = formatMoney(profit2);
    if (risk2El) risk2El.textContent = formatMoney(risk2);
    if (targetEl) targetEl.textContent = formatMoney(profit2);
    if (liveOddsText) liveOddsText.textContent = livePrice.displayText;
    setOutcome('partialNetLoss', netLoss);
    setOutcome('partialNetWin', netWin);

    window.partialCutLossTest = { risk1, profit1, profit2, risk2, netLoss, netWin, oddA, oddB, hedgeCorner: livePrice.favCorner };
}

function placePartialCutLossBet() {
    calculatePartialCutLoss();
    const result = window.partialCutLossTest;
    if (!result || !result.risk1 || !result.profit1 || !result.oddA || !result.oddB || !result.profit2) {
        alert('ยังไม่มีข้อมูลพอร์ตหรือราคาสดสำหรับคำนวณตั๋วสวน');
        return;
    }
    const betInput = document.getElementById('qbBetAmount');
    if (betInput) {
        betInput.value = Math.round(result.profit2);
        if (typeof qbUpdatePnLPreview === 'function') qbUpdatePnLPreview();
    }
    if (typeof qbTriggerAutoBet === 'function') qbTriggerAutoBet(result.hedgeCorner, Math.round(result.profit2));
}

function executeOneClickHedge() {
    if (_isHedgeExecuting) {
        return;
    }
    if (!window._lastCalculatedHedge || !window._lastCalculatedHedge.isReady) {
        alert('⚠️ ยังไม่ถึงจุดออกตัว หรือยังไม่มีแผลกดในพอร์ตครับ');
        return;
    }
    const hedgeSnapshot = Object.assign({}, window._lastCalculatedHedge);
    const { targetCorner, recommendedStake } = hedgeSnapshot;
    if (recommendedStake <= 0) {
        alert('⚠️ ยอดออกตัวต้องมากกว่า 0 บาทครับ');
        return;
    }

    _isHedgeExecuting = true;
    clearTimeout(_hedgeExecutionTimer);
    _hedgeExecutionTimer = setTimeout(() => {
        _isHedgeExecuting = false;
    }, 1500);

    const betInput = document.getElementById('qbBetAmount');
    if (betInput) {
        betInput.value = recommendedStake;
        betInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (typeof qbTriggerAutoBet === 'function') {
        qbTriggerAutoBet(targetCorner, recommendedStake);
    }
}



function handlePriceSnapshotUpdate() {
    syncFavAndDogInputs();

    const redEl = document.getElementById('redOddsText');
    const blueEl = document.getElementById('blueOddsText');
    const redParsed = redEl ? parseOddsPreserveOrder(redEl.innerText) : null;
    const blueParsed = blueEl ? parseOddsPreserveOrder(blueEl.innerText) : null;

    const liveFavCorner = (document.getElementById('liveFavCorner') || {}).value || '';
    const rawA = (document.getElementById('liveOddA') || {}).value;
    const rawB = (document.getElementById('liveOddB') || {}).value;
    const oddA = (rawA !== undefined && rawA !== '') ? (parseFloat(rawA) || 0) : 0;
    const oddB = (rawB !== undefined && rawB !== '') ? (parseFloat(rawB) || 0) : 0;

    const liveDogCorner = (document.getElementById('liveDogCorner') || {}).value || '';
    const rawDogA = (document.getElementById('dogOddA') || {}).value;
    const rawDogB = (document.getElementById('dogOddB') || {}).value;
    const dogOddA = (rawDogA !== undefined && rawDogA !== '') ? (parseFloat(rawDogA) || 0) : 0;
    const dogOddB = (rawDogB !== undefined && rawDogB !== '') ? (parseFloat(rawDogB) || 0) : 0;

    let newRed = (redParsed && isOddsValid(redParsed)) ? { a: redParsed.a, b: redParsed.b, raw: redEl.innerText } : (isOddsValid(currentPrice.red) ? cloneOdds(currentPrice.red) : null);
    let newBlue = (blueParsed && isOddsValid(blueParsed)) ? { a: blueParsed.a, b: blueParsed.b, raw: blueEl.innerText } : (isOddsValid(currentPrice.blue) ? cloneOdds(currentPrice.blue) : null);

    if (!newRed) {
        if (liveFavCorner === 'red' && oddA > 0 && oddB > 0) newRed = { a: oddA, b: oddB, raw: `${oddA}:${oddB}` };
        else if (liveDogCorner === 'red' && dogOddA > 0 && dogOddB > 0) newRed = { a: dogOddA, b: dogOddB, raw: `${dogOddA}:${dogOddB}` };
    }
    if (!newBlue) {
        if (liveFavCorner === 'blue' && oddA > 0 && oddB > 0) newBlue = { a: oddA, b: oddB, raw: `${oddA}:${oddB}` };
        else if (liveDogCorner === 'blue' && dogOddA > 0 && dogOddB > 0) newBlue = { a: dogOddA, b: dogOddB, raw: `${dogOddA}:${dogOddB}` };
    }

    const nextRed = newRed ? cloneOdds(newRed) : { a: NaN, b: NaN, raw: null };
    const nextBlue = newBlue ? cloneOdds(newBlue) : { a: NaN, b: NaN, raw: null };

    const { redStatus, blueStatus } = deriveCornerStatuses(nextRed, nextBlue);
    let legacyFav = null;
    let legacyA = NaN;
    let legacyB = NaN;

    if (redStatus === 'fav' && blueStatus !== 'fav') {
        legacyFav = 'red';
        legacyA = nextRed.a;
        legacyB = nextRed.b;
    } else if (blueStatus === 'fav' && redStatus !== 'fav') {
        legacyFav = 'blue';
        legacyA = nextBlue.a;
        legacyB = nextBlue.b;
    }

    const isPriceChanged = (
        currentPrice.red?.a !== nextRed.a ||
        currentPrice.red?.b !== nextRed.b ||
        currentPrice.blue?.a !== nextBlue.a ||
        currentPrice.blue?.b !== nextBlue.b ||
        currentPrice.favCorner !== legacyFav
    );

    if (isPriceChanged) {
        previousPrice = { 
            favCorner: currentPrice.favCorner,
            oddA: currentPrice.oddA,
            oddB: currentPrice.oddB,
            red: cloneOdds(currentPrice.red),
            blue: cloneOdds(currentPrice.blue)
        };
        currentPrice = {
            favCorner: legacyFav,
            oddA: legacyA,
            oddB: legacyB,
            red: nextRed,
            blue: nextBlue
        };

        if (priceTracker && (isOddsValid(nextRed) || isOddsValid(nextBlue))) {
            const snap = PriceJourneyEngine.createPriceSnapshotV2('', '', nextRed, nextBlue);
            priceTracker.appendSnapshot(snap);
        }
    } else if (priceTracker && priceTracker.priceHistory.length === 0 && (isOddsValid(nextRed) || isOddsValid(nextBlue))) {
        const snap = PriceJourneyEngine.createPriceSnapshotV2('', '', nextRed, nextBlue);
        priceTracker.appendSnapshot(snap);
    }
}

function evaluateMuayExpertDecision(netRed, netBlue, isReady) {
    const gpsStatusBadge = document.getElementById('gpsStatusBadge');
    const gpsEventText = document.getElementById('gpsEventText');
    const gpsRedPnL = document.getElementById('gpsRedPnL');
    const gpsBluePnL = document.getElementById('gpsBluePnL');
    const gpsActionAdvice = document.getElementById('gpsActionAdvice');
    const gpsWatchOut = document.getElementById('gpsWatchOut');
    const journeyPatternText = document.getElementById('journeyPatternText');

    if (gpsRedPnL) {
        gpsRedPnL.innerHTML = netRed >= 0 
            ? '<span class="text-green">+' + Math.floor(netRed).toLocaleString() + ' บาท</span>'
            : '<span class="text-red">' + Math.floor(netRed).toLocaleString() + ' บาท</span>';
    }
    if (gpsBluePnL) {
        gpsBluePnL.innerHTML = netBlue >= 0 
            ? '<span class="text-green">+' + Math.floor(netBlue).toLocaleString() + ' บาท</span>'
            : '<span class="text-red">' + Math.floor(netBlue).toLocaleString() + ' บาท</span>';
    }

    if (typeof PriceJourneyEngine === 'undefined' || !priceTracker) {
        return;
    }

    const journeyState = priceTracker.getJourneyState();
    let userPosState = tickets.length === 0 ? 'NO_POSITION' : 'IN_POSITION';
    let mainSide = netRed > netBlue ? 'red' : (netBlue > netRed ? 'blue' : 'balanced');

    const evalCtx = PriceJourneyEngine.evaluateContext(
        journeyState,
        userPosState,
        mainSide,
        netRed,
        netBlue,
        isReady
    );

    const decisionResult = PriceJourneyEngine.runDecisionEngine(journeyState, evalCtx);
    const presentation = PriceJourneyEngine.presentKipUserDecision(decisionResult, journeyState, evalCtx);

    if (gpsStatusBadge) {
        gpsStatusBadge.innerText = presentation.statusBadgeText;
        gpsStatusBadge.style.background = presentation.statusBadgeColor;
        gpsStatusBadge.style.color = presentation.statusBadgeColor.includes('185, 129') ? 'var(--green)' :
            (presentation.statusBadgeColor.includes('245, 158') ? 'var(--yellow)' : 
            (presentation.statusBadgeColor.includes('189, 248') ? 'var(--primary)' : '#fff'));
    }

    if (gpsEventText) gpsEventText.innerText = presentation.reasonText;
    if (gpsActionAdvice) {
        gpsActionAdvice.innerText = presentation.actionAdviceText;
        gpsActionAdvice.style.color = presentation.statusBadgeColor.includes('185, 129') ? 'var(--green)' :
            (presentation.statusBadgeColor.includes('245, 158') ? 'var(--yellow)' : 'var(--primary)');
    }

    if (gpsWatchOut) {
        gpsWatchOut.innerText = presentation.watchOutText;
    }

    if (journeyPatternText && journeyState) {
        journeyPatternText.innerText = journeyState.journeyPattern || '-';
    }
}

function calculateAll() {
    handlePriceSnapshotUpdate();

    const totalCapital = parseFloat((document.getElementById('totalCapital') || {}).value) || 0;
    
    let netRed = 0; 
    let netBlue = 0; 
    let usedCapital = 0;

    tickets.forEach(t => {
        const pnl = getTicketPnL(t);
        usedCapital += pnl.riskAmt;

        if (t.corner === 'red') {
            netRed += pnl.winAmt;
            netBlue -= pnl.riskAmt;
        } else {
            netBlue += pnl.winAmt;
            netRed -= pnl.riskAmt;
        }
    });

    const remCap = totalCapital - usedCapital;
    const remCapEl = document.getElementById('remCapital');
    if (remCapEl) {
        remCapEl.innerText = Math.floor(remCap).toLocaleString() + ' B';
        remCapEl.className = 'stat-val ' + (remCap < 0 ? 'text-red' : 'text-green');
    }

    const netRedEl = document.getElementById('netRed');
    const netBlueEl = document.getElementById('netBlue');

    if (netRedEl) {
        netRedEl.innerHTML = netRed >= 0 
            ? '<span class="text-green">กำไรสุทธิ +' + Math.floor(netRed).toLocaleString() + ' B</span>' 
            : '<span class="text-red">เสีย (ขาดทุน) ' + Math.floor(netRed).toLocaleString() + ' B</span>';
    }

    if (netBlueEl) {
        netBlueEl.innerHTML = netBlue >= 0 
            ? '<span class="text-green">กำไรสุทธิ +' + Math.floor(netBlue).toLocaleString() + ' B</span>' 
            : '<span class="text-red">เสีย (ขาดทุน) ' + Math.floor(netBlue).toLocaleString() + ' B</span>';
    }

    const mainSideEl = document.getElementById('mainSide');
    if (mainSideEl) {
        if (netBlue > netRed) {
            mainSideEl.innerHTML = '<span style="color:var(--blue-side);">ถือฝั่งน้ำเงิน (ได้ประโยชน์ถ้ามวยน้ำเงินชนะ)</span>';
        } else if (netRed > netBlue) {
            mainSideEl.innerHTML = '<span style="color:var(--red-side);">ถือฝั่งแดง (ได้ประโยชน์ถ้ามวยแดงชนะ)</span>';
        } else {
            mainSideEl.innerText = "พอร์ตสมดุล (ไม่มีความเสี่ยง)";
        }
    }

    syncPartialCutLossFromPortfolio(netRed, netBlue);
    calculateActionAndAdvisor(netRed, netBlue);
    update3BulletUI();
    updateEmergencyRescueUI();

    // 🥊 อัปเดตไฟกระพริบที่ Avatar นวมของฝั่งที่เป็นต่อ (Favorite Flashing Indicator)
    const liveFav = (document.getElementById('liveFavCorner') || {}).value;
    const liveA = parseFloat((document.getElementById('liveOddA') || {}).value);
    const isClosed = !liveA || isNaN(liveA) || liveA <= 0;
    updateFighterAvatarFavStatus(liveFav, isClosed);

    // Hook สำหรับ extension ภายนอก (เช่น bt_hub_extension.js Recorder)
    // จะถูกเรียกทุกครั้งที่ calculateAll ทำงาน (ทั้งจากภายในไฟล์นี้และภายนอก)
    try { if (window.__postCalculateAllHook && typeof window.__postCalculateAllHook === 'function') window.__postCalculateAllHook(); } catch (e) {}
}

// 🥊 อัปเดตสถานะกระพริบขาว-สีเดิมของ Avatar นวม (แฟลชบอกฝั่งที่เป็นต่อ)
// 🔁 เก็บสถานะล่าสุดไว้ ไม่ให้ animation restart บ่อยเกินไปเมื่อรับราคา Live ซ้ำๆ
let __lastAvatarStateKey = null;
function updateFighterAvatarFavStatus(favCorner, isClosed) {
    const redAvatar = document.getElementById('redFighterAvatar');
    const blueAvatar = document.getElementById('blueFighterAvatar');
    if (!redAvatar || !blueAvatar) return;

    const liveA = parseFloat((document.getElementById('liveOddA') || {}).value) || 0;
    const liveB = parseFloat((document.getElementById('liveOddB') || {}).value) || 0;
    const redOddsText  = (document.getElementById('redOddsText')  || {}).innerText || '';
    const blueOddsText = (document.getElementById('blueOddsText') || {}).innerText || '';
    const isBoth10_9 = (redOddsText.includes('10') && redOddsText.includes('9') && blueOddsText.includes('10') && blueOddsText.includes('9'));
    const isParity10_10 = (liveA > 0 && liveB > 0 && liveA === liveB);

    let redClass = '';
    let blueClass = '';

    if (!isClosed && favCorner && favCorner !== 'draw' && favCorner !== 'parity') {
        if (isParity10_10) {
            redClass = 'is-parity-price';
            blueClass = 'is-parity-price';
        } else if (isBoth10_9) {
            redClass = 'is-both-fav';
            blueClass = 'is-both-fav';
        } else if (favCorner === 'red') {
            redClass = 'is-fav';
        } else if (favCorner === 'blue') {
            blueClass = 'is-fav';
        }
    }

    const stateKey = String(isClosed ? 'CLOSED' : '') + '|' + (favCorner || '') + '|' + redClass + '|' + blueClass;
    if (stateKey === __lastAvatarStateKey) return;
    __lastAvatarStateKey = stateKey;

    const ALL = ['is-fav', 'is-both-fav', 'is-parity-price'];
    ALL.forEach(c => redAvatar.classList.remove(c));
    ALL.forEach(c => blueAvatar.classList.remove(c));
    if (redClass) redAvatar.classList.add(redClass);
    if (blueClass) blueAvatar.classList.add(blueClass);
}
window.updateFighterAvatarFavStatus = updateFighterAvatarFavStatus;

// 💰 Update 3-Bullet Money Management UI (จัดสรรเงิน 3 กระสุน)
function update3BulletUI() {
    const totalCap = parseFloat((document.getElementById('totalCapital') || {}).value) || 0;
    if (typeof PriceJourneyEngine !== 'undefined' && PriceJourneyEngine.calculate3BulletAllocation) {
        const alloc = PriceJourneyEngine.calculate3BulletAllocation(totalCap);
        const b1El = document.getElementById('b1Val');
        const b2El = document.getElementById('b2Val');
        const b3El = document.getElementById('b3Val');
        if (b1El) b1El.textContent = `฿${alloc.bullet1.amount.toLocaleString()}`;
        if (b2El) b2El.textContent = `฿${alloc.bullet2.amount.toLocaleString()}`;
        if (b3El) b3El.textContent = `฿${alloc.bullet3.amount.toLocaleString()}`;
        window._bulletAlloc = alloc;
    }
}

// 💰 Apply 3-Bullet Stake to Quick-Bet Input Box
function apply3BulletStake(bulletKey) {
    const alloc = window._bulletAlloc || (typeof PriceJourneyEngine !== 'undefined' ? PriceJourneyEngine.calculate3BulletAllocation(parseFloat((document.getElementById('totalCapital')||{}).value)||0) : null);
    if (!alloc || !alloc[bulletKey]) return;
    const input = document.getElementById('qbBetAmount');
    if (input) {
        input.value = alloc[bulletKey].amount;
        if (typeof qbUpdatePnLPreview === 'function') qbUpdatePnLPreview();
    }
}

// 🚨 Update Live Emergency Rescue HUD Card
function updateEmergencyRescueUI() {
    const cardEl = document.getElementById('emergencyRescueCard');
    if (!cardEl) return;

    if (typeof PriceJourneyEngine === 'undefined' || !PriceJourneyEngine.calculateEmergencyRescue) return;

    const redOddsEl  = document.getElementById('redOddsText');
    const blueOddsEl = document.getElementById('blueOddsText');
    const redParsed  = redOddsEl  ? qbParseOddsText(redOddsEl.innerText)  : null;
    const blueParsed = blueOddsEl ? qbParseOddsText(blueOddsEl.innerText) : null;

    const liveFav = (document.getElementById('liveFavCorner') || {}).value || 'red';
    const liveA = parseFloat((document.getElementById('liveOddA') || {}).value) || 1;
    const liveB = parseFloat((document.getElementById('liveOddB') || {}).value) || 1;
    const totalCap = parseFloat((document.getElementById('totalCapital') || {}).value) || 0;

    const redA  = redParsed  ? redParsed.a  : liveA;
    const redB  = redParsed  ? redParsed.b  : liveB;
    const blueA = blueParsed ? blueParsed.a : liveA;
    const blueB = blueParsed ? blueParsed.b : liveB;

    const rescue = PriceJourneyEngine.calculateEmergencyRescue({
        tickets: tickets,
        currentPrice: {
            favCorner: liveFav,
            oddA: liveA,
            oddB: liveB,
            redSide: { a: redA, b: redB, raw: redOddsEl ? redOddsEl.innerText : '' },
            blueSide: { a: blueA, b: blueB, raw: blueOddsEl ? blueOddsEl.innerText : '' }
        },
        totalCapital: totalCap
    });

    window._currentRescuePlan = rescue;

    // ✅ แสดงกล่องเสมอ (ไม่ซ่อน) — แต่ body จะโชว์เฉพาะเมื่อมีความเสี่ยงจริง
    cardEl.classList.remove('hidden');

    const badgeEl = document.getElementById('emgStatusBadge');
    const bodyEl  = document.getElementById('emergencyRescueBody');
    const iconEl  = document.getElementById('emgCollapseIcon');

    if (!rescue || !rescue.isNeeded) {
        // ไม่มีแผล / ไม่มีความเสี่ยง: badge = รอสถานการณ์, ซ่อน body
        if (badgeEl) {
            badgeEl.textContent = 'ยังไม่มีแผล';
            badgeEl.style.background = 'rgba(100,116,139,0.25)';
            badgeEl.style.color = '#94a3b8';
            badgeEl.style.borderColor = 'rgba(100,116,139,0.4)';
        }
        if (bodyEl) bodyEl.style.display = 'none';
        if (iconEl) iconEl.style.display = 'none';
        _emgBodyExpanded = false;
        return;
    }

    // มีความเสี่ยง: badge = พร้อมกู้ชีพ — ไม่บังคับขยาย ให้ผู้ใช้กดเองถ้าต้องการดูรายละเอียด
    if (badgeEl) {
        badgeEl.textContent = 'พร้อมกู้ชีพ';
        badgeEl.style.background = '';
        badgeEl.style.color = '';
        badgeEl.style.borderColor = '';
    }
    if (iconEl) iconEl.style.display = '';

    const holdEl    = document.getElementById('emgCurrentHold');
    const planEl    = document.getElementById('emgPlanDetail');
    const leadNameEl = document.getElementById('emgLeadingCornerName');
    const leadResEl  = document.getElementById('emgLeadingResultText');
    const dangNameEl = document.getElementById('emgDangerCornerName');
    const dangResEl  = document.getElementById('emgDangerResultText');
    const btnRescue  = document.getElementById('btnExecuteRescue');

    const holdSideText   = rescue.holdingCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
    const dangerSideText = rescue.dangerCorner  === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';

    if (holdEl) holdEl.innerHTML = `<span style="color:${rescue.holdingCorner==='red'?'#ef4444':'#3b82f6'}; font-weight:bold;">${holdSideText}</span> (เสี่ยงเสีย <span class="text-red">-${rescue.currentRiskLoss.toLocaleString()} B</span>)`;
    if (planEl) planEl.textContent = rescue.actionSummary;
    if (leadNameEl) leadNameEl.textContent = holdSideText;
    if (leadResEl) {
        leadResEl.textContent = `${rescue.finalLeadingProfit >= 0 ? '+' : ''}${rescue.finalLeadingProfit.toLocaleString()} B (เสมอตัว คืนทุน)`;
        leadResEl.className = rescue.finalLeadingProfit >= 0 ? 'text-green' : 'text-red';
    }
    if (dangNameEl) dangNameEl.textContent = dangerSideText;
    if (dangResEl) {
        dangResEl.textContent = `${rescue.finalDangerProfit >= 0 ? '+' : ''}${rescue.finalDangerProfit.toLocaleString()} B (ล็อคขาดทุนไม่เกิน ${Math.abs(rescue.finalDangerProfit).toLocaleString()} B)`;
        dangResEl.className = rescue.finalDangerProfit >= 0 ? 'text-green' : 'text-red';
    }
    if (btnRescue) {
        btnRescue.innerHTML = `<span>🚨 กดยืนยันกู้ชีพทันที (แทงสวน ${dangerSideText} ${rescue.rescueStake.toLocaleString()} B)</span>`;
    }
}

// 🚨 Execute 1-Click Emergency Rescue
function executeEmergencyRescue() {
    if (_isHedgeExecuting) {
        return;
    }
    // 🔄 Re-calculate จากราคาสดล่าสุดก่อนเสมอ ป้องกันปัญหา plan stale
    if (typeof updateEmergencyRescueUI === 'function') {
        updateEmergencyRescueUI();
    }
    const plan = window._currentRescuePlan;
    if (!plan || !plan.isNeeded) {
        alert('⚠️ ไม่จำเป็นต้องกู้ชีพในสถานะปัจจุบัน');
        return;
    }
    const rescueSnapshot = Object.assign({}, plan);
    const { targetCorner, rescueStake } = rescueSnapshot;
    if (rescueStake <= 0) {
        alert('⚠️ ยอดกู้ชีพต้องมากกว่า 0 บาทครับ');
        return;
    }

    _isHedgeExecuting = true;
    clearTimeout(_hedgeExecutionTimer);
    _hedgeExecutionTimer = setTimeout(() => {
        _isHedgeExecuting = false;
    }, 1500);

    const betInput = document.getElementById('qbBetAmount');
    if (betInput) {
        betInput.value = rescueStake;
        betInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (typeof qbTriggerAutoBet === 'function') {
        qbTriggerAutoBet(targetCorner, rescueStake);
    }

    console.log(`%c[Emergency Rescue] 🚨 ส่งคำสั่งกู้ชีพสำเร็จ: ${targetCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน'} ยอด ${rescueStake.toLocaleString()} B`, 'color:#ea580c;font-weight:bold;');

    try {
        if (typeof SoundEngine !== 'undefined' && SoundEngine.playHedgeSuccessSound) {
            SoundEngine.playHedgeSuccessSound();
        }
    } catch(e) {}
}

window.apply3BulletStake = apply3BulletStake;
window.executeEmergencyRescue = executeEmergencyRescue;

// 🚨 Toggle collapse/expand Emergency Rescue Body
let _emgBodyExpanded = false;
function toggleEmergencyRescueBody() {
    const body = document.getElementById('emergencyRescueBody');
    const icon = document.getElementById('emgCollapseIcon');
    if (!body) return;
    _emgBodyExpanded = !_emgBodyExpanded;
    if (_emgBodyExpanded) {
        body.style.display = '';
        if (icon) icon.textContent = '▲ ย่อ';
    } else {
        body.style.display = 'none';
        if (icon) icon.textContent = '▼ ขยาย';
    }
}
window.toggleEmergencyRescueBody = toggleEmergencyRescueBody;

function qbParseOddsText(text) {
    if (!text) return null;
    const matches = text.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length < 2) return null;
    
    const a = parseFloat(matches[0]);
    const b = parseFloat(matches[1]);
    
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return null;
    
    return { a, b };
}

function selectTargetPrice(a, b) {
    const liveOddA = document.getElementById('liveOddA');
    const liveOddB = document.getElementById('liveOddB');
    if (liveOddA && liveOddB) {
        liveOddA.value = a;
        liveOddB.value = b;
    }
    syncFavAndDogInputs('fav');
    if (typeof calculateAll === 'function') calculateAll();
}

// แถบลำดับราคามวยมาตรฐาน 10:9 ➔ 4:1 (โชว์ไว้ตลอดเวลา + แทรกราคาจริงอัตโนมัติ)
function renderTargetPriceList(leadingCorner, leadingProfit, laggingProfit, isHedgeByFav, currentOddA, currentOddB) {
    let targetCornerText = 'รอเปิดแผล';
    if (leadingCorner === 'red') targetCornerText = '🔵 น้ำเงิน';
    else if (leadingCorner === 'blue') targetCornerText = '🔴 แดง';

    const oddsScale = [
        { label: "10:9", val: 10/9 },
        { label: "5:4", val: 5/4 },
        { label: "11:8", val: 11/8 },
        { label: "3:2", val: 3/2 },
        { label: "5:3", val: 5/3 },
        { label: "7:4", val: 7/4 },
        { label: "2:1", val: 2/1 },
        { label: "5:2", val: 5/2 },
        { label: "3:1", val: 3/1 },
        { label: "7:2", val: 7/2 },
        { label: "4:1", val: 4/1 },
        { label: "5:1", val: 5/1 },
        { label: "6:1", val: 6/1 },
        { label: "8:1", val: 8/1 },
        { label: "10:1", val: 10/1 },
        { label: "20:1", val: 20/1 }
    ];

    const currentRatio = (currentOddA && currentOddB && currentOddB > 0) ? (currentOddA / currentOddB) : 0;
    const currentKey = (currentOddA && currentOddB) ? (currentOddA + ':' + currentOddB) : '';

    let closestIndex = -1;
    let minDiff = Infinity;
    if (currentRatio > 0) {
        oddsScale.forEach((o, i) => {
            const diff = Math.abs(o.val - currentRatio);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });
    }

    let isExactMatch = oddsScale.some(o => o.label === currentKey || Math.abs(o.val - currentRatio) < 0.02);

    const stepsHtml = oddsScale.map((o, idx) => {
        let isFirst = (idx === 0);
        let isLast = (idx === oddsScale.length - 1);
        let isCurrent = (o.label === currentKey) || (idx === closestIndex && currentRatio > 0);

        let zoneCls = '';
        let zoneTitle = '';
        if (idx <= 3) {
            zoneCls = 'zone-green';
            zoneTitle = '🟢 [10:9 ➔ 3:2] โซนต่อได้ (ราคาบาง/เสี่ยงต่ำ)';
        } else if (idx <= 8) {
            zoneCls = 'zone-yellow';
            zoneTitle = '🟡 [5:3 ➔ 3:1] โซนดักรอง (Sniper Dog ได้เปรียบ)';
        } else if (idx <= 12) {
            zoneCls = 'zone-orange';
            zoneTitle = '🟠 [7:2 ➔ 6:1] โซนจุดออกตัว (อย่าเข้ามวยต่อไม้แรก)';
        } else {
            zoneCls = 'zone-red';
            zoneTitle = '🔴 [8:1 ➔ 20:1] โซนราคาขาดลอย (ห้ามเข้าไม้แรก)';
        }

        let cls = 'odds-step-pill ' + zoneCls;
        if (isFirst) cls += ' step-min';
        if (isLast) cls += ' step-max';
        if (isCurrent) cls += ' step-active';

        return '<span class="' + cls + '" title="' + o.label + ' — ' + zoneTitle + '">' + o.label + '</span>';
    }).join('<span class="step-sep">➔</span>');

    let customNote = '';
    if (currentRatio > 0 && !isExactMatch && closestIndex !== -1) {
        customNote = '<span class="custom-odds-tag">⚡ ราคาจริง ' + currentOddA + ':' + currentOddB + ' (เทียบเท่า ' + oddsScale[closestIndex].label + ')</span>';
    }

    return '<div class="odds-hierarchy-panel">' +
        '<div class="odds-hierarchy-header">' +
            '<span>📌 <strong>ลำดับขั้นราคามวย & จุดเข้าไม้แรก:</strong></span>' +
            '<div style="display:flex; align-items:center; gap:6px;">' +
                customNote +
                '<span class="odds-target-badge">ฝั่งออกตัว: ' + targetCornerText + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="odds-hierarchy-bar">' +
            stepsHtml +
        '</div>' +
        '<div class="odds-tactical-legend">' +
            '<span class="tactical-tag tag-green" title="เข้ามวยต่อได้ดีมาก ราคาบาง ขยับนิดเดียวพร้อมออกตัว">🟢 10:9 ➔ 3:2 (ต่อได้ ราคาบาง)</span>' +
            '<span class="tactical-tag tag-yellow" title="เข้ามวยรองได้เปรียบ ลงทุนน้อย กินคำโต ล็อคกำไรง่าย">🟡 5:3 ➔ 3:1 (ดักรองได้เปรียบ)</span>' +
            '<span class="tactical-tag tag-orange" title="จุดออกตัวล็อคกำไร ไม่ควรเข้ามวยต่อไม้แรก">🟠 7:2 ➔ 6:1 (จุดออกตัว อย่าต่อ)</span>' +
            '<span class="tactical-tag tag-red" title="ราคาขาดลอยแล้ว ห้ามเข้าไม้แรกเด็ดขาด">🔴 8:1+ (ขาดลอย ห้ามเข้า)</span>' +
        '</div>' +
    '</div>';

}



// ==========================================
// ระบบ Auto Confirm ออร์เดอร์อัตโนมัติ (ดัก Confirm Dialog → delay 1 วิ → auto-click)
// ==========================================
let autoConfirm = {
    enabled: false,
    _processedConfirmKeys: new Set()   // ป้องกัน double-click กรณี observer fire ซ้ำ
};

function setAutoConfirm(val) {
    autoConfirm.enabled = !!val;
    const toggleBox = document.getElementById('autoConfirmToggle');
    if (toggleBox) {
        const btnOff = toggleBox.querySelector('.btn-confirm.off');
        const btnOn  = toggleBox.querySelector('.btn-confirm.on');
        if (btnOff) btnOff.classList.toggle('active', !val);
        if (btnOn)  btnOn.classList.toggle('active', val);
    }
    if (val && typeof SoundEngine !== 'undefined') SoundEngine.playGoldenBell();
}

function togglePartialCutLossBody() {
    const body = document.getElementById('partialCutLossBody');
    const icon = document.getElementById('partialCollapseIcon');
    if (!body) return;
    const isHidden = body.classList.contains('hidden') || body.style.display === 'none';
    if (isHidden) {
        body.classList.remove('hidden');
        body.style.display = '';
        if (icon) icon.textContent = '▲ ย่อ';
    } else {
        body.classList.add('hidden');
        body.style.display = 'none';
        if (icon) icon.textContent = '▼ ขยาย';
    }
}

function setPartialCalcVisible(val) {
    const body = document.getElementById('partialCutLossBody');
    const icon = document.getElementById('partialCollapseIcon');
    if (body) {
        body.classList.toggle('hidden', !val);
        body.style.display = val ? '' : 'none';
    }
    if (icon) icon.textContent = val ? '▲ ย่อ' : '▼ ขยาย';
}

function toggleRecorderPanelBody() {
    const body = document.getElementById('recorderPanelBody');
    const icon = document.getElementById('recorderCollapseIcon');
    if (!body) return;
    const isHidden = body.style.display === 'none' || body.classList.contains('hidden');
    if (isHidden) {
        body.classList.remove('hidden');
        body.style.display = '';
        if (icon) icon.textContent = '▲ ย่อ';
    } else {
        body.classList.add('hidden');
        body.style.display = 'none';
        if (icon) icon.textContent = '▼ ขยาย';
    }
}

function toggleBacktestHubBody() {
    const body = document.getElementById('backtestHubBody');
    const icon = document.getElementById('btHubCollapseIcon');
    if (!body) return;
    const isHidden = body.style.display === 'none' || body.classList.contains('hidden');
    if (isHidden) {
        body.classList.remove('hidden');
        body.style.display = '';
        if (icon) icon.textContent = '▲ ย่อ';
    } else {
        body.classList.add('hidden');
        body.style.display = 'none';
        if (icon) icon.textContent = '▼ ขยาย';
    }
}

window.togglePartialCutLossBody = togglePartialCutLossBody;
window.setPartialCalcVisible = setPartialCalcVisible;
window.toggleRecorderPanelBody = toggleRecorderPanelBody;
window.toggleBacktestHubBody = toggleBacktestHubBody;

function _tryLocateConfirmButtons(rootEl) {
    const root = rootEl || document;
    const textMatches = Array.from(root.querySelectorAll('button')).filter(b => {
        const t = (b.textContent || b.innerText || '').trim().toLowerCase();
        return t === 'confirm' || t.includes('confirm') || t === 'ยืนยัน' || t.includes('ยืนยัน');
    });
    if (textMatches.length > 0) return textMatches;
    const greenLarge = Array.from(root.querySelectorAll('button')).filter(b => {
        const cs = window.getComputedStyle(b);
        const bg = cs.backgroundColor || '';
        const isGreenish = bg.includes('34,197,94') || bg.includes('16,185,129') || bg.includes('22,163,74') || bg.includes('green');
        return isGreenish && (b.offsetHeight >= 36);
    });
    return greenLarge;
}

let _confirmDialogObserver = null;
function _installConfirmDialogObserver() {
    if (_confirmDialogObserver) return;
    _confirmDialogObserver = new MutationObserver((mutations) => {
        if (!autoConfirm.enabled) return;
        for (const m of mutations) {
            if (m.addedNodes && m.addedNodes.length > 0) {
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    const el = node;
                    const whole = (el.innerText || el.textContent || '').toLowerCase();
                    const hasConfirmKeyword = whole.includes('confirm bet') || whole.includes('confirm');
                    if (!hasConfirmKeyword) continue;
                    const btns = _tryLocateConfirmButtons(el);
                    if (btns.length === 0) continue;
                    const targetBtn = btns[btns.length - 1];
                    const key = (targetBtn.textContent || '').trim() + '::' + Date.now().toFixed().slice(0, -3);
                    if (autoConfirm._processedConfirmKeys.has(key)) continue;
                    autoConfirm._processedConfirmKeys.add(key);
                    if (autoConfirm._processedConfirmKeys.size > 200) {
                        autoConfirm._processedConfirmKeys = new Set(Array.from(autoConfirm._processedConfirmKeys).slice(-100));
                    }
                    console.log('%c🔔 [AUTO-CONFIRM] พบ Confirm Dialog → หน่วง 1 วินาทีก่อนกดยืนยัน', 'color: #0ea5e9; font-weight: bold;');
                    setTimeout(() => {
                        const freshBtns = _tryLocateConfirmButtons();
                        const btnToClick = freshBtns[freshBtns.length - 1] || targetBtn;
                        if (btnToClick && document.body.contains(btnToClick)) {
                            console.log('%c✅ [AUTO-CONFIRM] Auto-click ปุ่ม Confirm แล้ว', 'color: #10b981; font-weight: bold;');
                            try { btnToClick.click(); } catch (e) {
                                btnToClick.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                            }
                            if (typeof SoundEngine !== 'undefined') SoundEngine.playOrderExecuted();
                        }
                    }, 1000);
                    return;
                }
            }
        }
    });
    _confirmDialogObserver.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });
}

if (typeof window !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        _installConfirmDialogObserver();
    } else {
        document.addEventListener('DOMContentLoaded', _installConfirmDialogObserver);
    }
}

// ==========================================
// ระบบตั้งเป้าหมายออกตัวอัตโนมัติ (Auto-Hedge Order — 4 กลยุทธ์)
// ==========================================
let autoLimitOrder = {
    enabled: false,
    targetStrategy: 'skew_runner', // 'skew_runner' | 'equal' | 'breakeven' | 'smart_cut'
    targetLabel: 'รันกำไร 70/30'
};

const strategyLabelMap = {
    skew_runner: '🔥 รันกำไร 70/30',
    equal:       '🟢 กำไรเท่ากัน',
    breakeven:   '🟡 ขอเท่าทุน',
    smart_cut:   '🛡️ ยอมเสียน้อย'
};

function setAutoLimitOrder(val) {
    autoLimitOrder.enabled = !!val;
    const hedgeToggleBox = document.getElementById('hedgeToggle');
    const box = document.getElementById('autoOrderStatusBox');
    const txt = document.getElementById('autoOrderStatusText');

    if (hedgeToggleBox) {
        const btnOff = hedgeToggleBox.querySelector('.btn-hedge.off');
        const btnOn  = hedgeToggleBox.querySelector('.btn-hedge.on');
        if (btnOff) btnOff.classList.toggle('active', !autoLimitOrder.enabled);
        if (btnOn)  btnOn.classList.toggle('active', autoLimitOrder.enabled);
    }

    if (autoLimitOrder.enabled) {
        if (box) box.className = 'auto-status-box active';
        if (txt) txt.innerHTML = `🟢 กำลังดักยิงอัตโนมัติเมื่อ [${autoLimitOrder.targetLabel}] เข้าเงื่อนไข`;
        if (typeof SoundEngine !== 'undefined') SoundEngine.playGoldenBell();
        calculateAll();
    } else {
        if (box) box.className = 'auto-status-box idle';
        if (txt) txt.innerHTML = 'ปิดระบบอยู่ (เลือกกลยุทธ์แล้วกดเปิด AUTO)';
    }
}

function toggleAutoLimitOrder() {
    setAutoLimitOrder(!autoLimitOrder.enabled);
}

function onAutoTargetSelectChange() {
    const select = document.getElementById('autoOrderTargetSelect');
    if (!select) return;
    const val = select.value;
    autoLimitOrder.targetStrategy = val;
    autoLimitOrder.targetLabel = strategyLabelMap[val] || val;
    if (autoLimitOrder.enabled) {
        const txt = document.getElementById('autoOrderStatusText');
        if (txt) txt.innerHTML = `🟢 กำลังดักยิงอัตโนมัติเมื่อ [${autoLimitOrder.targetLabel}] เข้าเงื่อนไข`;
    }
}

function setPreSetTargetFromTable(ratio, label) {
    const select = document.getElementById('autoOrderTargetSelect');
    if (select) {
        let matched = false;
        for (let i = 0; i < select.options.length; i++) {
            if (Math.abs(parseFloat(select.options[i].value) - ratio) < 0.05) {
                select.selectedIndex = i;
                matched = true;
                break;
            }
        }
        if (!matched) {
            const opt = document.createElement('option');
            opt.value = ratio;
            opt.text = `${label} (จากตาราง)`;
            select.appendChild(opt);
            select.value = ratio;
        }
    }
    autoLimitOrder.targetType = 'odds_ratio';
    autoLimitOrder.targetRatio = ratio;
    autoLimitOrder.targetLabel = label;

    if (!autoLimitOrder.enabled) {
        toggleAutoLimitOrder();
    } else {
        const txt = document.getElementById('autoOrderStatusText');
        if (txt) txt.innerHTML = `🟢 กำลังดักยิงอัตโนมัติเมื่อ [${label}]`;
        if (typeof SoundEngine !== 'undefined') SoundEngine.playGoldenBell();
    }
}

function updateStrategyButtonsReadiness(leadingCorner, leadingProfit, laggingProfit, isHedgeByFav, targetRatio) {
    const btnSkew = document.getElementById('btnSkewRunner');
    const btnEqual = document.getElementById('btnEqual');
    const btnBreakeven = document.getElementById('btnBreakeven');
    const btnSmartCut = document.getElementById('btnSmartCut');

    if (!btnSkew || !btnEqual || !btnBreakeven || !btnSmartCut) return;

    const updateReadyCountBadge = (count) => {
        const badge = document.getElementById('strategyReadyBadge');
        if (!badge) return;
        if (count > 0) {
            badge.className = 'strat-ready-count-badge active';
            badge.innerHTML = `⚡ เข้าเป้า <strong>${count}</strong> กลยุทธ์`;
        } else {
            badge.className = 'strat-ready-count-badge idle';
            badge.innerHTML = `⏳ 0 กลยุทธ์`;
        }
    };

    const clearReadyClasses = () => {
        btnSkew.classList.remove('ready-skew');
        btnEqual.classList.remove('ready-equal');
        btnBreakeven.classList.remove('ready-breakeven');
        btnSmartCut.classList.remove('ready-smart-cut');
        updateReadyCountBadge(0);
        // 🆕 ซ่อน dot fallback ด้วยเมื่อ clear
        const dotElClear = document.getElementById('fallbackReadyDot');
        if (dotElClear) dotElClear.classList.add('hidden');
    };

    if (!leadingCorner || leadingProfit === laggingProfit || !targetRatio || targetRatio <= 0) {
        clearReadyClasses();
        if (typeof SoundEngine !== 'undefined') SoundEngine.checkAndPlayStrategyReadyAlert('');
        return;
    }

    if (typeof PriceJourneyEngine !== 'undefined' && PriceJourneyEngine.calculateStrategyHedge) {
        const resSkew = PriceJourneyEngine.calculateStrategyHedge({
            strategy: 'skew_runner',
            leadingCorner,
            leadingProfit,
            laggingProfit,
            isHedgeByFav,
            targetRatio,
            skewTarget: skewTarget70  // ส่งการเลือกฝั่ง 70% ของผู้ใช้
        });
        const resEqual = PriceJourneyEngine.calculateStrategyHedge({
            strategy: 'equal',
            leadingCorner,
            leadingProfit,
            laggingProfit,
            isHedgeByFav,
            targetRatio
        });
        const resBreakeven = PriceJourneyEngine.calculateStrategyHedge({
            strategy: 'breakeven',
            leadingCorner,
            leadingProfit,
            laggingProfit,
            isHedgeByFav,
            targetRatio,
            breakevenTarget: breakevenProfitTarget
        });
        const resSmartCut = PriceJourneyEngine.calculateStrategyHedge({
            strategy: 'smart_cut',
            leadingCorner,
            leadingProfit,
            laggingProfit,
            isHedgeByFav,
            targetRatio
        });

        const isSkewReady = !!(resSkew && resSkew.isReady);
        const isEqualReady = !!(resEqual && resEqual.isReady);
        const isBreakevenReady = !!(resBreakeven && resBreakeven.isReady);
        const isSmartCutReady = !!(resSmartCut && resSmartCut.isReady);

        btnSkew.classList.toggle('ready-skew', isSkewReady);
        btnEqual.classList.toggle('ready-equal', isEqualReady);
        btnBreakeven.classList.toggle('ready-breakeven', isBreakevenReady);
        btnSmartCut.classList.toggle('ready-smart-cut', isSmartCutReady);

        const readyCount = (isSkewReady ? 1 : 0) + (isEqualReady ? 1 : 0) + (isBreakevenReady ? 1 : 0) + (isSmartCutReady ? 1 : 0);
        updateReadyCountBadge(readyCount);

        // เก็บสถานะความพร้อมของทุกกลยุทธ์ไว้ให้ Auto-Hedge ดึงใช้ได้โดยตรง
        // (ไม่ขึ้นอยู่กับว่าผู้ใช้กำลังดูหน้าไหน)
        window._strategyReadiness = {
            skew_runner: isSkewReady,
            equal:       isEqualReady,
            breakeven:   isBreakevenReady,
            smart_cut:   isSmartCutReady,
            // เก็บ hedge result ของ target strategy ไว้ด้วย เพื่อให้ Auto-Hedge ยิงได้ถูกกลยุทธ์
            _results: {
                skew_runner: resSkew,
                equal:       resEqual,
                breakeven:   resBreakeven,
                smart_cut:   resSmartCut
            }
        };

        // ส่งเสียงระฆังทองทันทีเมื่อมีกลยุทธ์ใดกลยุทธ์หนึ่งเข้าเงื่อนไข (ส้ม/เขียว/เหลือง/ฟ้า)
        const readyHash = `${isSkewReady ? '1' : '0'}${isEqualReady ? '1' : '0'}${isBreakevenReady ? '1' : '0'}${isSmartCutReady ? '1' : '0'}`;
        if (typeof SoundEngine !== 'undefined') {
            SoundEngine.checkAndPlayStrategyReadyAlert(readyHash);
        }

        // 🆕 เก็บผล fallback ไว้ใช้แสดงผลตอนกดปุ่ม Forced-Exit Fallback
        const recoveryPct = laggingProfit !== 0
            ? ((resEqual.minProfit - laggingProfit) / Math.abs(laggingProfit)) * 100
            : 0;

        if (_entryTargetRatio === null && targetRatio > 0) {
            _entryTargetRatio = targetRatio;
        }

        // คำนวณเงื่อนไข 4 ข้อสำหรับแนะนำ (ใช้ร่วมกันทั้ง dot และปุ่ม CTA)
        const _fbMainNotReady = !(
            (currentStrategy === 'skew_runner' && isSkewReady) ||
            (currentStrategy === 'equal' && isEqualReady) ||
            (currentStrategy === 'breakeven' && isBreakevenReady) ||
            (currentStrategy === 'smart_cut' && isSmartCutReady)
        );
        const _fbGraceOk = _priceUpdateCountSinceEntry >= 4;
        const _fbRecoveryOk = recoveryPct >= 80;
        const _diffPrice = (_entryTargetRatio !== null) ? Math.abs(targetRatio - _entryTargetRatio) : 0;
        const _fbPriceMoved = _diffPrice >= 0.15;
        const _fbIsRecommended = _fbMainNotReady && _fbGraceOk && _fbRecoveryOk && _fbPriceMoved;

        console.log(
            '%c[ForcedFallback] grace=' + _priceUpdateCountSinceEntry + '/4 recovery=' + recoveryPct.toFixed(1) + '% priceDiff=' + _diffPrice.toFixed(2) + ' (>=0.15: ' + _fbPriceMoved + ') mainNotReady=' + _fbMainNotReady + ' → recommended=' + _fbIsRecommended,
            'color: ' + (_fbIsRecommended ? '#4ade80' : '#fb923c') + '; font-size: 0.85rem;'
        );

        window._lastFallbackPlan = {
            hedgeStake: resEqual.hedgeStake,
            finalRedProf: resEqual.finalRedProf,
            finalBlueProf: resEqual.finalBlueProf,
            minProfit: resEqual.minProfit,
            recoveryPct,
            isRecommended: _fbIsRecommended  // 🆕 ครบ 4 เงื่อนไขถึงจะ true
        };

        // 🆕 เช็คเงื่อนไขแนะนำ (highlight dot) — ครบ 4 ข้อ: หลักยังไม่ ready + grace >=4 + recovery >=80% + priceMoved >=0.15
        const dotEl = document.getElementById('fallbackReadyDot');
        if (dotEl) {
            dotEl.classList.toggle('hidden', !_fbIsRecommended);
        }

        // ——— ตรวจสอบ Auto-Hedge ที่นี่ ไม่ขึ้นกับว่าผู้ใช้อยู่แท็บไหน ———
        checkAndFireAutoHedge(leadingCorner, isHedgeByFav, targetRatio);
    }
}

// latch ป้องกัน double-fire
let _autoHedgeFiring = false;

function checkAndFireAutoHedge(leadingCorner, isHedgeByFav, targetRatio) {
    if (!autoLimitOrder.enabled) return;
    if (_autoHedgeFiring) return;  // กัน re-entrant call

    const readiness = window._strategyReadiness;
    if (!readiness) return;

    const targetStrat = autoLimitOrder.targetStrategy;
    if (!readiness[targetStrat]) return;  // กลยุทธ์เป้าหมายยังไม่พร้อม

    const targetResult = readiness._results[targetStrat];
    if (!targetResult || !targetResult.hedgeStake || targetResult.hedgeStake <= 0) return;

    const recommendedStake = Math.max(0, Math.round(targetResult.hedgeStake));
    if (recommendedStake <= 0) return;

    // ล็อค latch ก่อนทุกอย่าง ป้องกัน double-fire 100%
    _autoHedgeFiring = true;
    _isHedgeExecuting = true;
    clearTimeout(_hedgeExecutionTimer);
    _hedgeExecutionTimer = setTimeout(() => {
        _isHedgeExecuting = false;
    }, 1500);

    // คำนวณ corner ที่ต้องยิง (ตามผลลัพธ์ของกลยุทธ์)
    const targetCorner = targetResult.targetCorner || (leadingCorner === 'red' ? 'blue' : 'red');
    const targetCornerText = targetCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';

    console.log('%c⚡ [AUTO-HEDGE FIRED] ยิงคำสั่ง [' + autoLimitOrder.targetLabel + '] ' + targetCornerText + ' ยอด ' + recommendedStake + ' B', 'color: #22c55e; font-weight: bold; font-size: 1.1rem;');

    // ปิดระบบก่อนยิง ป้องกัน re-trigger จาก calculateAll ที่เกิดจากขั้นตอนยิง
    autoLimitOrder.enabled = false;

    if (typeof SoundEngine !== 'undefined') SoundEngine.playOrderExecuted();

    // ยิงตรงผ่าน qbTriggerAutoBet ด้วยข้อมูล target strategy โดยตรง
    // (ไม่ผ่าน executeOneClickHedge เพราะอันนั้นอ่านจาก _lastCalculatedHedge ซึ่งเป็นแท็บที่ดูอยู่ อาจผิด corner/stake)
    const betInput = document.getElementById('qbBetAmount');
    if (betInput) {
        betInput.value = recommendedStake;
        betInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (typeof qbTriggerAutoBet === 'function') {
        qbTriggerAutoBet(targetCorner, recommendedStake);
    } else {
        // Fallback: ส่งตรงผ่าน BroadcastChannel
        const bc = new BroadcastChannel('muay_channel');
        bc.postMessage({ action: 'PLACE_BET_HUMAN', corner: targetCorner, amount: recommendedStake });
        bc.close();
    }

    // อัปเดต UI (ยิงสำเร็จ → ระบบ Auto-Hedge ถูกปิดอัตโนมัติ)
    const hedgeToggleBox = document.getElementById('hedgeToggle');
    const box = document.getElementById('autoOrderStatusBox');
    const txt = document.getElementById('autoOrderStatusText');

    if (hedgeToggleBox) {
        const btnOff = hedgeToggleBox.querySelector('.btn-hedge.off');
        const btnOn  = hedgeToggleBox.querySelector('.btn-hedge.on');
        if (btnOff) btnOff.classList.toggle('active', true);
        if (btnOn)  btnOn.classList.toggle('active', false);
    }
    if (box) box.className = 'auto-status-box success';
    if (txt) txt.innerHTML = '✅ ยิงออกตัวสำเร็จ [' + autoLimitOrder.targetLabel + '] ' + targetCornerText + ' ' + recommendedStake.toLocaleString() + ' B';

    // ปลดล็อค latch หลัง 500ms
    setTimeout(() => { _autoHedgeFiring = false; }, 500);
}



function calculateActionAndAdvisor(netRed, netBlue) {
    const rawA = (document.getElementById('liveOddA') || {}).value;
    const rawB = (document.getElementById('liveOddB') || {}).value;
    const oddA = parseFloat(rawA) || 0;
    const oddB = parseFloat(rawB) || 0;

    const targetBox = document.getElementById('targetBox');
    const actionCard = document.getElementById('actionCard');
    const actionSideEl = document.getElementById('actionSide');
    const actionStakeEl = document.getElementById('actionStake');
    const resultRedVal = document.getElementById('resultRedVal');
    const resultBlueVal = document.getElementById('resultBlueVal');
    const statusBadge = document.getElementById('statusBadge');
    const btnOneClickHedge = document.getElementById('btnOneClickHedge');

    let leadingCorner = (tickets.length > 0) ? (netRed > netBlue ? 'red' : (netBlue > netRed ? 'blue' : null)) : null;
    let leadingProfit = Math.max(netRed, netBlue);
    let laggingProfit = Math.min(netRed, netBlue);

    // 1. ลำดับขั้นราคามวย 10:9 ➔ 20:1 โชว์ไว้ตลอดเวลา 100%
    if (targetBox) {
        targetBox.innerHTML = renderTargetPriceList(leadingCorner, leadingProfit, laggingProfit, false, oddA, oddB);
    }

    if (tickets.length === 0) {
        updateStrategyButtonsReadiness(null, 0, 0, false, 0);
        if (actionCard) actionCard.className = "action-card neutral";
        if (actionSideEl) actionSideEl.innerText = 'รอเปิดไม้แรก';
        if (actionStakeEl) {
            actionStakeEl.innerText = '0 B';
            actionStakeEl.className = 'stake-badge';
            actionStakeEl.onclick = null;
        }
        if (resultRedVal) resultRedVal.innerText = '-';
        if (resultBlueVal) resultBlueVal.innerText = '-';
        if (statusBadge) statusBadge.innerText = '-';
        if (btnOneClickHedge) {
            btnOneClickHedge.disabled = true;
            btnOneClickHedge.className = 'btn-one-click-hedge disabled';
            btnOneClickHedge.innerHTML = '<span>⚡ รอมีแผลในพอร์ต</span>';
        }
        window._lastCalculatedHedge = null;
        evaluateMuayExpertDecision(netRed, netBlue, false);
        renderAdvancePlanTable(netRed, netBlue);
        return;
    }

    if (!rawA || !rawB || isNaN(oddA) || isNaN(oddB) || oddA <= 0 || oddB <= 0) {
        updateStrategyButtonsReadiness(null, 0, 0, false, 0);
        if (actionCard) actionCard.className = "action-card neutral";
        if (actionSideEl) actionSideEl.innerText = 'รอกรอกราคาก่อน';
        if (actionStakeEl) {
            actionStakeEl.innerText = '- B';
            actionStakeEl.className = 'stake-badge';
            actionStakeEl.onclick = null;
        }
        if (resultRedVal) resultRedVal.innerText = '-';
        if (resultBlueVal) resultBlueVal.innerText = '-';
        if (statusBadge) statusBadge.innerText = '-';
        if (btnOneClickHedge) {
            btnOneClickHedge.disabled = true;
            btnOneClickHedge.className = 'btn-one-click-hedge disabled';
        }
        window._lastCalculatedHedge = null;
        evaluateMuayExpertDecision(netRed, netBlue, false);
        return;
    }

    if (leadingProfit === laggingProfit) {
        updateStrategyButtonsReadiness(null, 0, 0, false, 0);
        if (actionCard) actionCard.className = "action-card neutral";
        if (actionSideEl) actionSideEl.innerText = "พอร์ตสมดุลแล้ว (ไร้ความเสี่ยง / ชนะทั้ง 2 ทาง)";
        if (actionStakeEl) {
            actionStakeEl.innerText = "0 B";
            actionStakeEl.className = "stake-badge";
            actionStakeEl.onclick = null;
        }
        if (resultRedVal) resultRedVal.innerHTML = '<span class="text-green">กำไร +' + Math.floor(netRed).toLocaleString() + ' B</span>';
        if (resultBlueVal) resultBlueVal.innerHTML = '<span class="text-green">กำไร +' + Math.floor(netBlue).toLocaleString() + ' B</span>';
        if (statusBadge) statusBadge.innerText = "สมดุล";
        if (btnOneClickHedge) {
            btnOneClickHedge.disabled = true;
            btnOneClickHedge.className = 'btn-one-click-hedge disabled';
            btnOneClickHedge.innerHTML = '<span>🔒 ล็อคกำไรเรียบร้อยแล้ว</span>';
        }
        window._lastCalculatedHedge = null;
        evaluateMuayExpertDecision(netRed, netBlue, false);
        renderAdvancePlanTable(netRed, netBlue);
        return;
    }

    let targetCorner = leadingCorner === 'red' ? 'blue' : 'red';
    let targetCornerText = targetCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';

    const liveRed = currentPrice.red;
    const liveBlue = currentPrice.blue;
    const targetOdds = targetCorner === 'red' ? liveRed : liveBlue;
    const targetOddA = parseFloat(targetOdds.a) || 0;
    const targetOddB = parseFloat(targetOdds.b) || 0;
    const targetSide = deriveSideFromOdds(targetOddA, targetOddB);
    const targetRatio = (targetOddA > 0 && targetOddB > 0)
        ? Math.max(targetOddA, targetOddB) / Math.min(targetOddA, targetOddB)
        : 0;
    const isHedgeByFav = (targetSide === 'fav');

    // อัปเดตสีไฮไลท์ปุ่มกลยุทธ์ทั้ง 4 ปุ่มตามเงื่อนไขความพร้อม (ส้ม/เขียว/เหลือง/ฟ้า)
    updateStrategyButtonsReadiness(leadingCorner, leadingProfit, laggingProfit, isHedgeByFav, targetRatio);


    let hedgeResult;
    if (currentStrategy === 'forced_fallback') {
        // 🆕 ใช้ค่าที่เก็บไว้จาก updateStrategyButtonsReadiness() ตรงๆ ไม่เรียก engine ซ้ำ
        const plan = window._lastFallbackPlan || { hedgeStake: 0, finalRedProf: 0, finalBlueProf: 0, isReady: false, isRecommended: false };
        hedgeResult = {
            hedgeStake: plan.hedgeStake,
            finalRedProf: plan.finalRedProf,
            finalBlueProf: plan.finalBlueProf,
            isReady: true,            // ทำให้ action card แสดงข้อมูลได้เสมอ
            isFallback: true,         // 🆕 flag บอกว่านี่คือ fallback mode
            isRecommended: !!plan.isRecommended  // 🆕 ครบ 3 เงื่อนไข → ปุ่มเขียว
        };
    } else if (typeof PriceJourneyEngine !== 'undefined' && PriceJourneyEngine.calculateStrategyHedge) {
        hedgeResult = PriceJourneyEngine.calculateStrategyHedge({
            strategy: currentStrategy,
            leadingCorner,
            leadingProfit,
            laggingProfit,
            isHedgeByFav,
            targetRatio,
            skewTarget: currentStrategy === 'skew_runner' ? skewTarget70 : 'auto',
            breakevenTarget: currentStrategy === 'breakeven' ? breakevenProfitTarget : 'auto'
        });
    } else {
        let hedgeStake = (currentStrategy === 'equal')
            ? (leadingProfit - laggingProfit) / (1 + targetRatio)
            : (isHedgeByFav ? Math.abs(laggingProfit) : Math.abs(laggingProfit) / targetRatio);
        let finalRedProf = 0;
        let finalBlueProf = 0;
        if (isHedgeByFav) {
            finalRedProf = leadingCorner === 'red' ? leadingProfit - (hedgeStake * targetRatio) : laggingProfit + hedgeStake;
            finalBlueProf = leadingCorner === 'blue' ? leadingProfit - (hedgeStake * targetRatio) : laggingProfit + hedgeStake;
        } else {
            finalRedProf = leadingCorner === 'red' ? leadingProfit - hedgeStake : laggingProfit + (hedgeStake * targetRatio);
            finalBlueProf = leadingCorner === 'blue' ? leadingProfit - hedgeStake : laggingProfit + (hedgeStake * targetRatio);
        }
        hedgeResult = {
            hedgeStake: Math.round(hedgeStake),
            finalRedProf: Math.round(finalRedProf),
            finalBlueProf: Math.round(finalBlueProf),
            isReady: (finalRedProf >= 0 && finalBlueProf >= 0)
        };
    }

    const { hedgeStake, finalRedProf, finalBlueProf, isReady } = hedgeResult;
    if (hedgeResult.targetCorner) {
        targetCorner = hedgeResult.targetCorner;
        targetCornerText = targetCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
    }
    const recommendedStake = Math.max(0, hedgeStake);

    window._lastCalculatedHedge = {
        targetCorner,
        recommendedStake,
        isReady,
        strategy: currentStrategy,
        finalRedProf,
        finalBlueProf
    };

    // 🆕 อัปเดตหัว action card ตามกลยุทธ์ที่เลือก
    const actionTitleEl = document.getElementById('actionTitleText');
    if (actionTitleEl) {
        actionTitleEl.textContent = currentStrategy === 'forced_fallback'
            ? '🆘 Forced-Exit Fallback (อ้างอิง ไม่ใช่เป้าหมาย):'
            : '👉 สถานะการออกตัว:';
    }

    if (isReady) {
        // --- สำหรับ forced_fallback: ลด color ของ actionCard ลงเป็น "ref" ไม่ใช่ "ready" เต็ม ---
        if (currentStrategy === 'forced_fallback') {
            if (actionCard) actionCard.className = 'action-card fallback-ref';
        } else {
            if (actionCard) actionCard.className = 'action-card ready';
        }

        if (statusBadge) {
            let stratStatusText = '';
            if (currentStrategy === 'skew_runner') {
                const skewSideLabel = skewTarget70 === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
                stratStatusText = '🔥 รันกำไร 70/30 (' + skewSideLabel + ')';
            } else if (currentStrategy === 'equal') {
                stratStatusText = '🟢 กำไรเท่ากัน';
            } else if (currentStrategy === 'breakeven') {
                const beSideLabel = breakevenProfitTarget === 'red' ? '🔴 แดงได้กำไร' : '🔵 น้ำเงินได้กำไร';
                stratStatusText = '🟡 ขอเท่าทุน (' + beSideLabel + ')';
            } else if (currentStrategy === 'smart_cut') {
                stratStatusText = '🛡️ ยอมเสียน้อย (คัทลอส)';
            } else if (currentStrategy === 'forced_fallback') {
                const fbPlan = window._lastFallbackPlan;
                const pct = fbPlan ? fbPlan.recoveryPct.toFixed(1) : '0.0';
                stratStatusText = '🆘 ทางออกสำรอง (Recovery ' + pct + '%)';
            } else {
                stratStatusText = '✅ เข้าเงื่อนไขออกตัว';
            }
            statusBadge.innerText = stratStatusText;
            statusBadge.style.color = 'var(--green)';
        }
        const sideName = isHedgeByFav ? 'ต่อ' : 'รอง';
        if (actionSideEl) actionSideEl.innerText = '🔥 กดสวน [' + targetCornerText + '] (' + sideName + ' ' + targetOddA + ':' + targetOddB + ')';
        if (actionStakeEl) {
            actionStakeEl.innerText = 'แทง ' + recommendedStake.toLocaleString() + ' B';
            actionStakeEl.className = 'stake-badge ready';
            actionStakeEl.style.cursor = 'pointer';
            actionStakeEl.title = 'คลิกเพื่อนำยอดนี้ไปใส่ในช่องเดิมพัน';
            actionStakeEl.onclick = () => {
                const betInput = document.getElementById('qbBetAmount');
                if (betInput) {
                    betInput.value = recommendedStake;
                    if (typeof qbUpdatePnLPreview === 'function') qbUpdatePnLPreview();
                }
            };
        }

        if (btnOneClickHedge) {
            // 🆕 forced_fallback: ปุ่มเขียวต่อเมื่อ isRecommended (ครบ 3 เงื่อนไข) เท่านั้น
            const isFallbackRecommended = hedgeResult.isFallback && hedgeResult.isRecommended;
            const isNormalReady = !hedgeResult.isFallback;

            if (isNormalReady || isFallbackRecommended) {
                // ✅ เขียว: กลยุทธ์ปกติ ready หรือ fallback ครบทุกเงื่อนไข
                btnOneClickHedge.disabled = false;
                btnOneClickHedge.className = 'btn-one-click-hedge ready pulse-ready';
                let stratLabel;
                if (currentStrategy === 'skew_runner') {
                    const skewSideLabel = skewTarget70 === 'red' ? '🔴 แดง' : (skewTarget70 === 'blue' ? '🔵 น้ำเงิน' : '');
                    stratLabel = 'รันกำไร 70/30' + (skewSideLabel ? ' (' + skewSideLabel + ')' : '');
                } else if (currentStrategy === 'breakeven') {
                    const beSideLabel = breakevenProfitTarget === 'red' ? '🔴 แดงได้กำไร' : '🔵 น้ำเงินได้กำไร';
                    stratLabel = 'ขอเท่าทุน (' + beSideLabel + ')';
                } else if (currentStrategy === 'smart_cut') {
                    stratLabel = 'คุมขาดทุน';
                } else if (currentStrategy === 'forced_fallback') {
                    stratLabel = 'ออกทางสำรอง (Forced-Exit)';
                } else {
                    stratLabel = 'ล็อคกำไร';
                }
                btnOneClickHedge.innerHTML = '<span>⚡ กด' + stratLabel + 'ทันที [' + targetCornerText + ' ' + recommendedStake.toLocaleString() + ' B]</span>';
            } else {
                // ⚠️ ส้มอ่อน: fallback ยังไม่ครบเงื่อนไข — กดได้แต่ไม่แนะนำ
                btnOneClickHedge.disabled = false;
                btnOneClickHedge.className = 'btn-one-click-hedge fallback-not-ready';
                const fbPlan = window._lastFallbackPlan;
                const pct = fbPlan ? fbPlan.recoveryPct.toFixed(1) : '0.0';
                const grace = _priceUpdateCountSinceEntry;
                btnOneClickHedge.innerHTML = '<span>⚠️ ยังไม่แนะนำ — Recovery ' + pct + '% (grace ' + grace + '/4 ครั้ง) [' + targetCornerText + ' ' + recommendedStake.toLocaleString() + ' B]</span>';
            }
        }

    } else {

        if (actionCard) actionCard.className = 'action-card wait';
        if (statusBadge) {
            statusBadge.innerText = '⏳ ยังไม่อยู่ในจุดออกตัว';
            statusBadge.style.color = 'var(--red-side)';
        }
        if (actionSideEl) actionSideEl.innerText = '⚠️ ควรรอราคา! (ถ้ารีบออกตอนนี้จะเสียเปรียบ)';
        if (actionStakeEl) {
            actionStakeEl.innerText = 'อย่าเพิ่งกด';
            actionStakeEl.className = 'stake-badge wait';
            actionStakeEl.onclick = null;
        }

        if (btnOneClickHedge) {
            btnOneClickHedge.disabled = true;
            btnOneClickHedge.className = 'btn-one-click-hedge disabled';
            btnOneClickHedge.innerHTML = '<span>⏳ ควรรอราคาเข้าเป้า</span>';
        }
    }

    if (resultRedVal) {
        resultRedVal.innerHTML = finalRedProf >= 0 
            ? '<span class="text-green">กำไร +' + Math.floor(finalRedProf).toLocaleString() + ' B</span>' 
            : '<span class="text-red">ขาดทุน ' + Math.floor(finalRedProf).toLocaleString() + ' B</span>';
    }

    if (resultBlueVal) {
        resultBlueVal.innerHTML = finalBlueProf >= 0 
            ? '<span class="text-green">กำไร +' + Math.floor(finalBlueProf).toLocaleString() + ' B</span>' 
            : '<span class="text-red">ขาดทุน ' + Math.floor(finalBlueProf).toLocaleString() + ' B</span>';
    }

    evaluateMuayExpertDecision(netRed, netBlue, isReady);
    renderAdvancePlanTable(netRed, netBlue);

    if (typeof qbUpdatePnLPreview === 'function') {
        qbUpdatePnLPreview();
    }
}

// ตารางวางแผนออกตัวล่วงหน้า (รองรับการแทรกราคาจริงสดๆ อัตโนมัติ หากราคาไม่อยู่ในตารางมาตรฐาน)
function renderAdvancePlanTable(netRed, netBlue) {
    const tbody = document.getElementById('planTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (tickets.length === 0 || netRed === netBlue) {
        tbody.innerHTML = '<tr><td colspan="6" style="color: var(--text-muted); text-align:center;">ใส่ประวัติแผลที่กดเพื่อดูตารางระดับราคา</td></tr>';
        return;
    }

    let leadingCorner = netRed > netBlue ? 'red' : 'blue';
    let leadingProfit = Math.max(netRed, netBlue);
    let laggingProfit = Math.min(netRed, netBlue);
    let targetCornerText = leadingCorner === 'red' ? '🔵 น้ำเงิน' : '🔴 แดง';

    const redOdds = currentPrice.red || { a: NaN, b: NaN };
    const blueOdds = currentPrice.blue || { a: NaN, b: NaN };
    const targetOdds = leadingCorner === 'red' ? blueOdds : redOdds;
    const liveOddA = parseFloat(targetOdds.a) || 0;
    const liveOddB = parseFloat(targetOdds.b) || 0;
    const liveRatio = (liveOddA > 0 && liveOddB > 0)
        ? Math.max(liveOddA, liveOddB) / Math.min(liveOddA, liveOddB)
        : 0;

    let targets = [];
    if (typeof PriceJourneyEngine !== 'undefined' && PriceJourneyEngine.calculateMultiTargets) {
        targets = PriceJourneyEngine.calculateMultiTargets(leadingCorner, leadingProfit, laggingProfit, currentStrategy, currentStrategy === 'skew_runner' ? skewTarget70 : 'auto', currentStrategy === 'breakeven' ? breakevenProfitTarget : 'auto');
    } else {
        targets = standardBoxingOdds.map(odd => {
            let ratio = odd.val;
            let stake = (currentStrategy === 'equal') ? (leadingProfit - laggingProfit) / (1 + ratio) : Math.abs(laggingProfit) / ratio;
            let rR = leadingCorner === 'red' ? leadingProfit - stake : laggingProfit + (stake * ratio);
            let rB = leadingCorner === 'blue' ? leadingProfit - stake : laggingProfit + (stake * ratio);
            return {
                label: odd.label,
                oddsValue: ratio,
                stake: Math.round(stake),
                finalRed: Math.round(rR),
                finalBlue: Math.round(rB),
                isReady: (rR >= 0 && rB >= 0),
                tier: 'normal'
            };
        });
    }

    // กรณีราคาจริงหน้าจอ ไม่อยู่ใน 11 ขั้นมาตรฐาน -> แทรกแถวราคาจริงสดๆ เข้าตารางให้อัตโนมัติ!
    let hasExactLive = targets.some(t => Math.abs(t.oddsValue - liveRatio) < 0.02);
    if (liveRatio > 0 && !hasExactLive) {
        let liveHedge;
        if (typeof PriceJourneyEngine !== 'undefined' && PriceJourneyEngine.calculateStrategyHedge) {
            liveHedge = PriceJourneyEngine.calculateStrategyHedge({
                strategy: currentStrategy,
                leadingCorner,
                leadingProfit,
                laggingProfit,
                isHedgeByFav: deriveSideFromOdds(liveOddA, liveOddB) === 'fav',
                targetRatio: liveRatio,
                skewTarget: currentStrategy === 'skew_runner' ? skewTarget70 : 'auto',
                breakevenTarget: currentStrategy === 'breakeven' ? breakevenProfitTarget : 'auto'
            });
        } else {
            let stake = (currentStrategy === 'equal') ? (leadingProfit - laggingProfit) / (1 + liveRatio) : Math.abs(laggingProfit) / liveRatio;
            let rR = leadingCorner === 'red' ? leadingProfit - stake : laggingProfit + (stake * liveRatio);
            let rB = leadingCorner === 'blue' ? leadingProfit - stake : laggingProfit + (stake * liveRatio);
            liveHedge = { hedgeStake: Math.round(stake), finalRedProf: Math.round(rR), finalBlueProf: Math.round(rB), isReady: (rR >= 0 && rB >= 0) };
        }

        targets.push({
            label: '⚡ ' + liveOddA + ':' + liveOddB + ' (ราคาจริง)',
            oddsValue: liveRatio,
            stake: liveHedge.hedgeStake,
            finalRed: liveHedge.finalRedProf,
            finalBlue: liveHedge.finalBlueProf,
            isReady: liveHedge.isReady,
            tier: 'live_custom',
            tierLabel: '⚡ ราคาหน้าจอสด'
        });

        targets.sort((a, b) => a.oddsValue - b.oddsValue);
    }

    targets.forEach(t => {
        const tr = document.createElement('tr');
        let rowClasses = [];
        if (t.isReady) rowClasses.push('row-ready', t.tier);
        if (t.tier === 'live_custom') rowClasses.push('row-live-custom');
        tr.className = rowClasses.join(' ');
        
        tr.style.cursor = 'pointer';
        tr.title = 'คลิกเพื่อใส่ยอดแทง ' + t.stake.toLocaleString() + ' B (ดับเบิ้ลคลิกเพื่อตั้งเป้า Auto Order)';
        tr.onclick = () => {
            const betInput = document.getElementById('qbBetAmount');
            if (betInput) {
                betInput.value = t.stake;
                if (typeof qbUpdatePnLPreview === 'function') qbUpdatePnLPreview();
            }
        };
        tr.ondblclick = () => {
            setPreSetTargetFromTable(t.oddsValue, t.label);
        };

        const renderCornerBadge = (corner, odds) => {
            const side = deriveSideFromOdds(odds.a, odds.b);
            const icon = side === 'fav' ? '🟢' : (side === 'dog' ? '🟠' : '⚪');
            const bg = side === 'fav' ? '#059669' : (side === 'dog' ? '#c2410c' : '#64748b');
            const a = odds.a === undefined || Number.isNaN(Number(odds.a)) ? '-' : odds.a;
            const b = odds.b === undefined || Number.isNaN(Number(odds.b)) ? '-' : odds.b;
            return '<span class="corner-status-badge" style="background:' + bg + '; color:#fff; padding:3px 6px; border-radius:6px; font-weight:700; font-size:0.75rem; white-space:nowrap;">' +
                '[' + corner.toUpperCase() + ' ' + icon + ' ' + side.toUpperCase() + ' ' + a + ':' + b + ']</span>';
        };
        const tierBadge = t.tierLabel ? '<div class="tier-pill tier-' + t.tier + '">' + t.tierLabel + '</div>' : '';
        const leadingOdds = leadingCorner === 'red' ? redOdds : blueOdds;
        const targetOdds = leadingCorner === 'red' ? blueOdds : redOdds;
        const leadingLabel = leadingCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
        const targetLabel = leadingCorner === 'red' ? '🔵 น้ำเงิน' : '🔴 แดง';

        tr.innerHTML = '<td style="font-weight:bold;">' +
                t.label +
                tierBadge +
            '</td>' +
            '<td style="color:' + (leadingCorner === 'red' ? 'var(--red-side)' : 'var(--blue-side)') + '">' + leadingLabel + '<br>' + renderCornerBadge(leadingCorner, leadingOdds) + '</td>' +
            '<td>' + targetLabel + '<br>' + renderCornerBadge(targetCorner, targetOdds) + '</td>' +
            '<td style="font-weight:bold; color: var(--primary);">' + Math.round(t.stake).toLocaleString() + '</td>' +
            '<td class="' + (t.finalRed >= 0 ? 'text-green' : 'text-red') + '">' + (t.finalRed >= 0 ? '+' : '') + Math.round(t.finalRed).toLocaleString() + '</td>' +
            '<td class="' + (t.finalBlue >= 0 ? 'text-green' : 'text-red') + '">' + (t.finalBlue >= 0 ? '+' : '') + Math.round(t.finalBlue).toLocaleString() + '</td>';
        tbody.appendChild(tr);
    });
}


// ==========================================
// ระบบดักฟังราคาและยอดเงินเรียลไทม์จาก Tampermonkey
// ==========================================
let isAutoSyncEnabled = false;

function toggleAutoSync() {
    isAutoSyncEnabled = !isAutoSyncEnabled;
    const btn = document.getElementById('btnToggleAutoSync');
    if (btn) {
        if (isAutoSyncEnabled) {
            btn.innerHTML = '🟢 ดึงราคา (ON)';
            btn.className = 'btn-sync-toggle on';
            btn.title = 'คลิกเพื่อหยุดดึงราคาชั่วคราว / ล็อคราคาหน้าจอ';
        } else {
            btn.innerHTML = '🔴 หยุดดึง (OFF)';
            btn.className = 'btn-sync-toggle off';
            btn.title = 'คลิกเพื่อเปิดดึงราคาอัตโนมัติจากเว็บจริง';
        }
    }
}

const muayChannel = new BroadcastChannel('muay_channel');
window.muayChannel = muayChannel;

muayChannel.onmessage = function(event) {
    // 🚫 ห้ามบล็อกราคาสด — อนุญาตให้ราคาใหม่ผ่านได้เสมอ
    // (เฉพาะ bet action จริงๆ ถูก guard ไว้ที่ executeEmergencyRescue แล้ว)
    if (!isAutoSyncEnabled) return;

    const data = event.data;
    if (!data) return;

    if (data.type === 'CONFIRM_BET_STATE' || data.action) return;

    if (data.isClosed === undefined && data.rawRedText === undefined && data.balance === undefined && data.displayText === undefined) {
        return;
    }

    const headerEl = document.getElementById('liveOddsHeader');
    const redOddsEl = document.getElementById('redOddsText');
    const blueOddsEl = document.getElementById('blueOddsText');
    const liveFavCorner = document.getElementById('liveFavCorner');
    const liveOddA = document.getElementById('liveOddA');
    const liveOddB = document.getElementById('liveOddB');
    const liveDogCorner = document.getElementById('liveDogCorner');
    const dogOddA = document.getElementById('dogOddA');
    const dogOddB = document.getElementById('dogOddB');
    const totalCapitalInput = document.getElementById('totalCapital');

    if (data.balance !== undefined && data.balance !== null && totalCapitalInput) {
        if (parseFloat(totalCapitalInput.value) !== data.balance) {
            totalCapitalInput.value = data.balance;
            totalCapitalInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    const redNameEl = document.getElementById('redFighterNameHeader');
    const blueNameEl = document.getElementById('blueFighterNameHeader');
    if (data.redName && redNameEl && data.redName !== redNameEl.innerText) redNameEl.innerText = data.redName;
    if (data.blueName && blueNameEl && data.blueName !== blueNameEl.innerText) blueNameEl.innerText = data.blueName;

    if (data.isClosed) {
        if (headerEl) headerEl.innerHTML = '<span style="color: #888;">🔴 ปิดรับแทง (ไม่มีราคา)</span>';
        if (redOddsEl) redOddsEl.innerText = '🔴 แดง: -';
        if (blueOddsEl) blueOddsEl.innerText = '🔵 น้ำเงิน: -';
        if (liveOddA) liveOddA.value = '';
        if (liveOddB) liveOddB.value = '';
        if (dogOddA) dogOddA.value = '';
        if (dogOddB) dogOddB.value = '';
        if (liveFavCorner) liveFavCorner.value = '';
        if (liveDogCorner) liveDogCorner.value = '';

        currentPrice.red = { a: NaN, b: NaN, raw: null };
        currentPrice.blue = { a: NaN, b: NaN, raw: null };
        currentPrice.favCorner = null;
        currentPrice.oddA = NaN;
        currentPrice.oddB = NaN;

        if (typeof calculateAll === 'function') calculateAll();
        return;
    }

    if (redOddsEl && data.rawRedText !== undefined) redOddsEl.innerText = '🔴 แดง: ' + (data.rawRedText || '-');
    if (blueOddsEl && data.rawBlueText !== undefined) blueOddsEl.innerText = '🔵 น้ำเงิน: ' + (data.rawBlueText || '-');

    if (headerEl && data.displayText !== undefined) {
        let displayHtml = '';
        const dText = String(data.displayText || '');
        const rRaw = String(data.rawRedText || '');
        const bRaw = String(data.rawBlueText || '');
        const isBoth10_9 = (rRaw.includes('10') && rRaw.includes('9') && bRaw.includes('10') && bRaw.includes('9')) || dText.includes('10:9 ทั้งคู่');
        const isParity10_10 = dText.includes('10:10') || dText.includes('เสมอ') || (data.oddA && data.oddB && data.oddA === data.oddB);

        if (isParity10_10) {
            displayHtml = '<span style="color: #38bdf8; font-weight: bold;">⚖️ ราคาเสมอ (10:10)</span>';
        } else if (isBoth10_9) {
            displayHtml = '<span style="color: #fbbf24; font-weight: bold;">⚡ ราคาเบียดสูสี (10:9 ทั้งคู่)</span>';
        } else {
            displayHtml = '<span style="color: #00ff88; font-weight: bold;">⚡ ราคาเปิด: ' + data.displayText + '</span>';
        }
        headerEl.innerHTML = displayHtml;
        
        // 🔔 เล่นเสียงระฆังแจ้งเตือนเมื่อราคาบนหัวเปลี่ยน
        if (typeof SoundEngine !== 'undefined') {
            SoundEngine.checkAndPlayPriceChangeAlert(data.displayText);
        }
    }

    let redOdds = null;
    if (data.red && !isNaN(data.red.a) && !isNaN(data.red.b)) {
        redOdds = { a: parseFloat(data.red.a), b: parseFloat(data.red.b), raw: data.rawRedText || data.red.raw || `${data.red.a}:${data.red.b}` };
    } else if (data.rawRedText) {
        const parsed = parseOddsPreserveOrder(data.rawRedText);
        if (parsed) redOdds = { a: parsed.a, b: parsed.b, raw: data.rawRedText };
    }

    let blueOdds = null;
    if (data.blue && !isNaN(data.blue.a) && !isNaN(data.blue.b)) {
        blueOdds = { a: parseFloat(data.blue.a), b: parseFloat(data.blue.b), raw: data.rawBlueText || data.blue.raw || `${data.blue.a}:${data.blue.b}` };
    } else if (data.rawBlueText) {
        const parsed = parseOddsPreserveOrder(data.rawBlueText);
        if (parsed) blueOdds = { a: parsed.a, b: parsed.b, raw: data.rawBlueText };
    }

    // Fallback for legacy payload that only sends favCorner, oddA, oddB
    if (!redOdds && !blueOdds && data.favCorner && data.oddA && data.oddB) {
        const a = parseFloat(data.oddA);
        const b = parseFloat(data.oddB);
        if (data.favCorner === 'red') {
            redOdds = { a, b, raw: `${a}:${b}` };
            blueOdds = { a: b, b: a, raw: `${b}:${a}` };
        } else if (data.favCorner === 'blue') {
            blueOdds = { a, b, raw: `${a}:${b}` };
            redOdds = { a: b, b: a, raw: `${b}:${a}` };
        }
    }

    currentPrice.red = redOdds ? cloneOdds(redOdds) : { a: NaN, b: NaN, raw: null };
    currentPrice.blue = blueOdds ? cloneOdds(blueOdds) : { a: NaN, b: NaN, raw: null };

    const { redStatus, blueStatus } = deriveCornerStatuses(currentPrice.red, currentPrice.blue);

    if (redStatus === 'fav' && blueStatus === 'dog') {
        if (liveFavCorner) liveFavCorner.value = 'red';
        if (liveOddA) liveOddA.value = currentPrice.red.a;
        if (liveOddB) liveOddB.value = currentPrice.red.b;
        if (liveDogCorner) liveDogCorner.value = 'blue';
        if (dogOddA) dogOddA.value = currentPrice.blue.a;
        if (dogOddB) dogOddB.value = currentPrice.blue.b;
    } else if (redStatus === 'dog' && blueStatus === 'fav') {
        if (liveFavCorner) liveFavCorner.value = 'blue';
        if (liveOddA) liveOddA.value = currentPrice.blue.a;
        if (liveOddB) liveOddB.value = currentPrice.blue.b;
        if (liveDogCorner) liveDogCorner.value = 'red';
        if (dogOddA) dogOddA.value = currentPrice.red.a;
        if (dogOddB) dogOddB.value = currentPrice.red.b;
    } else if (redStatus === 'fav' && blueStatus === 'fav') {
        if (liveFavCorner) liveFavCorner.value = 'red';
        if (liveOddA) liveOddA.value = currentPrice.red.a;
        if (liveOddB) liveOddB.value = currentPrice.red.b;
        if (liveDogCorner) liveDogCorner.value = '';
        if (dogOddA) dogOddA.value = '';
        if (dogOddB) dogOddB.value = '';
    } else if (redStatus === 'even' && blueStatus === 'even') {
        if (liveFavCorner) liveFavCorner.value = '';
        if (liveOddA) liveOddA.value = '';
        if (liveOddB) liveOddB.value = '';
        if (liveDogCorner) liveDogCorner.value = '';
        if (dogOddA) dogOddA.value = '';
        if (dogOddB) dogOddB.value = '';
    } else if (redStatus === 'dog' && blueStatus === 'dog') {
        if (liveFavCorner) liveFavCorner.value = '';
        if (liveOddA) liveOddA.value = '';
        if (liveOddB) liveOddB.value = '';
        if (liveDogCorner) liveDogCorner.value = '';
        if (dogOddA) dogOddA.value = '';
        if (dogOddB) dogOddB.value = '';
    } else if (redStatus === 'fav') {
        if (liveFavCorner) liveFavCorner.value = 'red';
        if (liveOddA) liveOddA.value = currentPrice.red.a;
        if (liveOddB) liveOddB.value = currentPrice.red.b;
        if (liveDogCorner) liveDogCorner.value = '';
        if (dogOddA) dogOddA.value = '';
        if (dogOddB) dogOddB.value = '';
    } else if (blueStatus === 'fav') {
        if (liveFavCorner) liveFavCorner.value = 'blue';
        if (liveOddA) liveOddA.value = currentPrice.blue.a;
        if (liveOddB) liveOddB.value = currentPrice.blue.b;
        if (liveDogCorner) liveDogCorner.value = '';
        if (dogOddA) dogOddA.value = '';
        if (dogOddB) dogOddB.value = '';
    } else if (redStatus === 'dog') {
        if (liveDogCorner) liveDogCorner.value = 'red';
        if (dogOddA) dogOddA.value = currentPrice.red.a;
        if (dogOddB) dogOddB.value = currentPrice.red.b;
        if (liveFavCorner) liveFavCorner.value = '';
        if (liveOddA) liveOddA.value = '';
        if (liveOddB) liveOddB.value = '';
    } else if (blueStatus === 'dog') {
        if (liveDogCorner) liveDogCorner.value = 'blue';
        if (dogOddA) dogOddA.value = currentPrice.blue.a;
        if (dogOddB) dogOddB.value = currentPrice.blue.b;
        if (liveFavCorner) liveFavCorner.value = '';
        if (liveOddA) liveOddA.value = '';
        if (liveOddB) liveOddB.value = '';
    } else {
        if (liveFavCorner) liveFavCorner.value = '';
        if (liveOddA) liveOddA.value = '';
        if (liveOddB) liveOddB.value = '';
        if (liveDogCorner) liveDogCorner.value = '';
        if (dogOddA) dogOddA.value = '';
        if (dogOddB) dogOddB.value = '';
    }

    countPriceUpdateIfGenuinelyChanged();  // 🆕 บันทึกและนับ price update เมื่อราคาเปลี่ยนจาก BroadcastChannel
    if (typeof calculateAll === 'function') {
        calculateAll();
    }
};


// ==========================================
// เครื่องมือจำลองสถานการณ์ราคา (Simulation Test via Console)
// ==========================================
let _simTimer = null;
let _simCount = 0;
let _simMaxCount = Infinity;
let _simIntervalSec = 20;
let _isSimPaused = false;

function startSimulation(count = 0, intervalSec = 20) {
    stopSimulation();

    if (isAutoSyncEnabled) {
        toggleAutoSync();
        console.log('%c[ระบบ] ปิดการดึงราคาจากเว็บต้นทางอัตโนมัติแล้ว', 'color: #f59e0b; font-weight: bold;');
    }

    _simCount = 0;
    _simIntervalSec = (intervalSec && intervalSec > 0) ? intervalSec : 20;
    _simMaxCount = (count && count > 0) ? count : Infinity;
    _isSimPaused = false;

    const countText = _simMaxCount === Infinity ? 'วิ่งไปเรื่อยๆ (ไม่มีจำกัดรอบ)' : _simMaxCount + ' สถานการณ์';
    console.log('%c🚀 เริ่มรันการจำลอง: ' + countText + ' (เปลี่ยนราคาทุกๆ ' + _simIntervalSec + ' วินาที)...', 'color: #38bdf8; font-weight: bold; font-size: 1.05rem;');
    console.log('%c🎮 คำสั่งควบคุม:', 'color: #a855f7; font-weight: bold;');
    console.log('%c  ⏸️ pauseSimulation()  - หยุดชั่วคราว', 'color: #e2e8f0;');
    console.log('%c  ▶️ resumeSimulation() - รันต่อจากเดิม', 'color: #e2e8f0;');
    console.log('%c  🛑 stopSimulation()   - หยุดและรีเซ็ต', 'color: #e2e8f0;');

    const runStep = () => {
        if (_isSimPaused) return;

        _simCount++;
        if (_simCount > _simMaxCount) {
            console.log('%c🏁 สิ้นสุดการจำลองสถานการณ์ครบตามจำนวนแล้วครับ', 'color: #22c55e; font-weight: bold;');
            stopSimulation();
            return;
        }

        const corners = ['red', 'blue'];
        const favCorner = corners[Math.floor(Math.random() * corners.length)];
        const favIdx = Math.floor(Math.random() * standardBoxingOdds.length);
        const favOdd = standardBoxingOdds[favIdx];
        
        const dogIdx = Math.max(0, favIdx - (Math.random() < 0.7 ? 1 : 2));
        const dogOdd = standardBoxingOdds[dogIdx];

        const oddA = favOdd.a;
        const oddB = favOdd.b;

        const cornerText = favCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน';
        const rawRed = favCorner === 'red' ? ('HDP ' + favOdd.a + ' : ' + favOdd.b) : ('HDP ' + dogOdd.b + ' : ' + dogOdd.a);
        const rawBlue = favCorner === 'blue' ? ('HDP ' + favOdd.a + ' : ' + favOdd.b) : ('HDP ' + dogOdd.b + ' : ' + dogOdd.a);

        const headerEl = document.getElementById('liveOddsHeader');
        const redOddsEl = document.getElementById('redOddsText');
        const blueOddsEl = document.getElementById('blueOddsText');
        const liveFavCornerEl = document.getElementById('liveFavCorner');
        const liveOddAEl = document.getElementById('liveOddA');
        const liveOddBEl = document.getElementById('liveOddB');
        const liveDogCornerEl = document.getElementById('liveDogCorner');
        const dogOddAEl = document.getElementById('dogOddA');
        const dogOddBEl = document.getElementById('dogOddB');

        if (headerEl) {
            headerEl.innerHTML = '<span style="color: #00ff88; font-weight: bold;">⚡ [จำลอง #' + _simCount + '] ' + cornerText + ' ต่อ ' + favOdd.label + '</span>';
        }
        if (redOddsEl) redOddsEl.innerText = '🔴 แดง: ' + rawRed;
        if (blueOddsEl) blueOddsEl.innerText = '🔵 น้ำเงิน: ' + rawBlue;

        if (liveFavCornerEl) liveFavCornerEl.value = favCorner;
        if (liveOddAEl) liveOddAEl.value = oddA;
        if (liveOddBEl) liveOddBEl.value = oddB;
        if (liveDogCornerEl) liveDogCornerEl.value = (favCorner === 'red' ? 'blue' : 'red');
        // ราคาฝั่งรอง = ดึงค่าจากฝั่งตรงข้ามจริงของหน้าจอ (ฝั่งตรงข้ามแสดงผลเป็น dogOdd.b : dogOdd.a ตาม rawBlue/rawRed)
        if (dogOddAEl) dogOddAEl.value = dogOdd.b;
        if (dogOddBEl) dogOddBEl.value = dogOdd.a;

        if (typeof SoundEngine !== 'undefined') {
            SoundEngine.playGoldenBell();
        }

        countPriceUpdateIfGenuinelyChanged(); // 🆕 นับ price update ใน simulation ด้วย
        calculateAll();


        const roundLabel = _simMaxCount === Infinity ? ('[รอบ #' + _simCount + ']') : ('[สถานการณ์ ' + _simCount + '/' + _simMaxCount + ']');
        console.log(
            '%c' + roundLabel + '%c ฝั่งต่อ: ' + cornerText + ' (' + favOdd.label + ') | แดง: ' + rawRed + ' | น้ำเงิน: ' + rawBlue + ' %c[รออีก ' + _simIntervalSec + ' วิ...]',
            'color: #f59e0b; font-weight: bold;',
            'color: #ffffff; font-weight: bold;',
            'color: #64748b;'
        );
    };

    runStep();
    _simTimer = setInterval(runStep, _simIntervalSec * 1000);
}

function pauseSimulation() {
    if (!_simTimer && !_isSimPaused) {
        console.log('%c⚠️ ยังไม่มีการจำลองที่กำลังรันอยู่ครับ', 'color: #94a3b8;');
        return;
    }
    _isSimPaused = true;
    console.log('%c⏸️ พักการจำลองชั่วคราวที่รอบ #' + _simCount + ' (พิมพ์ resumeSimulation() เพื่อทำต่อ)', 'color: #f59e0b; font-weight: bold;');
}

function resumeSimulation() {
    if (!_isSimPaused) {
        console.log('%c⚠️ การจำลองไม่ได้อยู่ในสถานะหยุดชั่วคราวครับ', 'color: #94a3b8;');
        return;
    }
    _isSimPaused = false;
    console.log('%c▶️ ทำการรันการจำลองต่อจากรอบ #' + _simCount + '...', 'color: #22c55e; font-weight: bold;');
}

function stopSimulation() {
    if (_simTimer) {
        clearInterval(_simTimer);
        _simTimer = null;
    }
    _isSimPaused = false;
    _simCount = 0;
    console.log('%c🛑 หยุดการจำลองสถานการณ์และรีเซ็ตเรียบร้อยแล้ว', 'color: #ef4444; font-weight: bold;');
}

// ============================================================
// ✨ GLOBAL EXPOSURE for bt_hub_extension.js (bridge let/const vars → window)
// เพื่อให้ไฟล์ bt_hub_extension.js ที่ load ต่อๆ เข้าถึงตัวแปร let/const ในไฟล์นี้ได้
// ============================================================
(function _exposeGlobalsForBacktestExt() {
    const _get = function (name) { return eval(name); };
    const _set = function (name, val) { return eval(name + ' = val;'); };
    const varsToExpose = [
        'tickets', 'currentStrategy', 'skewTarget70', 'breakevenProfitTarget',
        '_simTimer', '_simCount', '_simMaxCount', '_simIntervalSec', '_isSimPaused',
        'isAutoSyncEnabled', 'currentPrice', 'previousPrice', 'standardBoxingOdds',
        '_isHedgeExecuting', '_hedgeExecutionTimer',
        '_priceUpdateCountSinceEntry', '_lastCountedOdds', '_entryTargetRatio'
    ];
    varsToExpose.forEach(function (name) {
        try {
            Object.defineProperty(window, name, {
                get: function () { try { return _get(name); } catch (e) { return undefined; } },
                set: function (v) { try { _set(name, v); } catch (e) {} },
                configurable: true,
                enumerable: true
            });
        } catch (e) {}
    });
    const fnAliases = {
        'updateStrategyButtons': 'updateStrategyButtonsReadiness'
    };
    Object.keys(fnAliases).forEach(function (alias) {
        const realName = fnAliases[alias];
        try {
            Object.defineProperty(window, alias, {
                get: function () { try { return eval(realName); } catch (e) { return undefined; } },
                configurable: true, enumerable: true
            });
        } catch (e) {}
    });
})();
