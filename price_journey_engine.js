/**
 * Price Journey & Decision Engine — Foundation Engine
 * Muay Thai Money Trading System
 */

(function(exports) {
  // Standard Muay Thai Boxing Odds Reference Table (Extended Steps up to 20/1)
  const STANDARD_BOXING_ODDS = [
    { a: 10, b: 9, val: 10/9, label: "10/9", key: "10/9" },
    { a: 5, b: 4, val: 5/4, label: "5/4", key: "5/4" },
    { a: 11, b: 8, val: 11/8, label: "11/8", key: "11/8" },
    { a: 3, b: 2, val: 3/2, label: "3/2", key: "3/2" },
    { a: 7, b: 4, val: 7/4, label: "7/4", key: "7/4" },
    { a: 2, b: 1, val: 2/1, label: "2/1", key: "2/1" },
    { a: 5, b: 2, val: 5/2, label: "5/2", key: "5/2" },
    { a: 3, b: 1, val: 3/1, label: "3/1", key: "3/1" },
    { a: 7, b: 2, val: 7/2, label: "7/2", key: "7/2" },
    { a: 4, b: 1, val: 4/1, label: "4/1", key: "4/1" },
    { a: 5, b: 1, val: 5/1, label: "5/1", key: "5/1" },
    { a: 6, b: 1, val: 6/1, label: "6/1", key: "6/1" },
    { a: 8, b: 1, val: 8/1, label: "8/1", key: "8/1" },
    { a: 10, b: 1, val: 10/1, label: "10/1", key: "10/1" },
    { a: 20, b: 1, val: 20/1, label: "20/1", key: "20/1" }
  ];


  // Helper to create Fractional Boxing Price
  function createBoxingPrice(numerator, denominator) {
    return {
      numerator: Number(numerator),
      denominator: Number(denominator)
    };
  }

  // Helper to create Canonical Price Representation
  function createCanonicalPrice(favoriteCorner, underdogCorner, favoritePrice, underdogPrice) {
    const priceKey = `${favoritePrice.numerator}/${favoritePrice.denominator}`;
    return {
      favoriteCorner, // 'red' | 'blue'
      underdogCorner, // 'blue' | 'red'
      favoritePrice,  // BoxingPrice
      underdogPrice,  // BoxingPrice
      priceKey
    };
  }

  // Explicit Website Price Decoder / Parser
  function parseRawWebsitePrice(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { error: 'MISSING_PRICE' };
    }

    const cleanText = rawText.trim();
    if (cleanText === '') {
      return { error: 'MISSING_PRICE' };
    }

    // Pattern 1: HTML Snippet like <p class="rate-red">HDP 1 : 230</p>
    // Pattern 2: HTML Snippet like <p class="rate-blue">300 : 1 HDP</p>
    // Pattern 3: Plain string like "HDP 1 : 230", "300 : 1 HDP", "3:2", "11/8"

    let favCorner = 'red';
    if (cleanText.includes('rate-red') || cleanText.includes('boxer_red') || cleanText.includes('Head-boxer-red')) {
      favCorner = 'red';
    } else if (cleanText.includes('rate-blue') || cleanText.includes('boxer_blue') || cleanText.includes('Head-boxer-blue')) {
      favCorner = 'blue';
    }

    // Extract numbers from Raw String
    let numA = null;
    let numB = null;

    const colonMatch = cleanText.match(/(\d+)\s*[:\/]\s*(\d+)/);
    if (colonMatch) {
      numA = parseInt(colonMatch[1], 10);
      numB = parseInt(colonMatch[2], 10);
    }

    if (numA === null || numB === null || isNaN(numA) || isNaN(numB)) {
      return { error: 'UNKNOWN_PRICE_FORMAT' };
    }

    // Explicit Website Encoding Rules:
    // "230" -> 2/1 (HDP 1 : 230 or 230 : 1)
    // "300" -> 3/1 (300 : 1 HDP)
    // Standard fractional numbers like 3:2 -> numA=3, numB=2

    let num = numA;
    let den = numB;

    if (numA === 1 && numB === 230) {
      num = 2; den = 1;
    } else if (numA === 230 && numB === 1) {
      num = 2; den = 1;
    } else if (numA === 300 && numB === 1) {
      num = 3; den = 1;
    } else if (numA === 1 && numB === 300) {
      num = 3; den = 1;
    }

    if (num <= 0 || den <= 0) {
      return { error: 'INVALID_FRACTION' };
    }

    return {
      favCorner,
      num,
      den
    };
  }

  // Find step index in standard Boxing Price Table
  function findBoxingPriceStepIndex(numerator, denominator) {
    const targetVal = numerator / denominator;
    const matchIndex = STANDARD_BOXING_ODDS.findIndex(o => {
      if (o.a === numerator && o.b === denominator) return true;
      return Math.abs(o.val - targetVal) < 0.001;
    });

    return matchIndex !== -1 ? matchIndex : null;
  }

  // Create Price Snapshot
  function createPriceSnapshot(rawRed, rawBlue, favCorner, num, den, timestamp = Date.now()) {
    if (num <= 0 || den <= 0) {
      throw new Error('Invalid fraction in createPriceSnapshot');
    }

    const favoritePrice = createBoxingPrice(num, den);
    const underdogPrice = createBoxingPrice(den, num);
    const underdogCorner = favCorner === 'red' ? 'blue' : 'red';
    const canonical = createCanonicalPrice(favCorner, underdogCorner, favoritePrice, underdogPrice);
    const stepIndex = findBoxingPriceStepIndex(num, den);

    return {
      id: `snap_${timestamp}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      raw: {
        red: rawRed || '',
        blue: rawBlue || ''
      },
      canonical,
      derived: {
        priceStepIndex: stepIndex,
        formattedPrice: `${favCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน'} ต่อ ${canonical.priceKey}`
      }
    };
  }

  // Price Journey Tracker (Market Fact Only)
  class PriceJourneyTracker {
    constructor() {
      this.priceHistory = [];
    }

    reset() {
      this.priceHistory = [];
    }

    appendSnapshot(snapshot) {
      this.priceHistory.push(snapshot);
      return this.getJourneyState();
    }

    get previousSnapshot() {
      if (this.priceHistory.length < 2) return null;
      return this.priceHistory[this.priceHistory.length - 2];
    }

    get currentSnapshot() {
      if (this.priceHistory.length === 0) return null;
      return this.priceHistory[this.priceHistory.length - 1];
    }

    getJourneyState() {
      const curr = this.currentSnapshot;
      const prev = this.previousSnapshot;

      if (!curr) {
        return null;
      }

      if (!prev) {
        return {
          priceHistory: [...this.priceHistory],
          previousSnapshot: null,
          currentSnapshot: curr,
          movementDirection: 'UNCHANGED',
          stepDistance: 0,
          timeElapsedMs: 0,
          pace: 'stagnant',
          journeyPattern: curr.canonical.priceKey
        };
      }

      // Calculate Step Distance & Movement Direction
      const currIdx = curr.derived.priceStepIndex;
      const prevIdx = prev.derived.priceStepIndex;

      let movementDirection = 'UNCHANGED';
      let stepDistance = 0;

      if (currIdx !== null && prevIdx !== null) {
        let adjustedPrevIdx = prevIdx;
        if (curr.canonical.favoriteCorner !== prev.canonical.favoriteCorner) {
          adjustedPrevIdx = -prevIdx; // Corner flip inversion
        }

        if (currIdx > adjustedPrevIdx) {
          movementDirection = 'UP';
          stepDistance = Math.abs(currIdx - adjustedPrevIdx);
        } else if (currIdx < adjustedPrevIdx) {
          movementDirection = 'DOWN';
          stepDistance = Math.abs(currIdx - adjustedPrevIdx);
        } else {
          movementDirection = 'UNCHANGED';
          stepDistance = 0;
        }
      } else {
        const currRatio = curr.canonical.favoritePrice.numerator / curr.canonical.favoritePrice.denominator;
        const prevRatio = prev.canonical.favoritePrice.numerator / prev.canonical.favoritePrice.denominator;
        if (currRatio > prevRatio) {
          movementDirection = 'UP';
        } else if (currRatio < prevRatio) {
          movementDirection = 'DOWN';
        } else {
          movementDirection = 'UNCHANGED';
        }
        stepDistance = 0;
      }

      const timeElapsedMs = Math.max(0, curr.timestamp - prev.timestamp);

      let pace = 'steady';
      if (stepDistance >= 3 && timeElapsedMs < 5000) {
        pace = 'rapid';
      } else if (stepDistance === 0 && timeElapsedMs > 30000) {
        pace = 'stagnant';
      }

      const journeyPattern = this.priceHistory.map(s => s.canonical.priceKey).join(' -> ');

      return {
        priceHistory: [...this.priceHistory],
        previousSnapshot: prev,
        currentSnapshot: curr,
        movementDirection,
        stepDistance,
        timeElapsedMs,
        pace,
        journeyPattern
      };
    }
  }

  // Context Evaluator
  function evaluateContext(journeyState, userPositionState, userMainSide, netRedPnL, netBluePnL, isHedgeReady = false) {
    let positionState = userPositionState || 'NO_POSITION';
    let marketContext = 'NEUTRAL_CONTEXT';

    if (positionState === 'NO_POSITION') {
      marketContext = 'NEUTRAL_CONTEXT';
    } else {
      if (isHedgeReady) {
        positionState = 'EXIT_READY';
      }

      if (!journeyState || journeyState.movementDirection === 'UNCHANGED') {
        marketContext = 'NEUTRAL_CONTEXT';
      } else {
        const isUserHoldingRed = (userMainSide === 'red');
        const isUserHoldingBlue = (userMainSide === 'blue');
        const favCorner = journeyState.currentSnapshot.canonical.favoriteCorner;
        const movement = journeyState.movementDirection;

        let isFavMovingUp = (movement === 'UP');

        if ((isUserHoldingRed && favCorner === 'red' && isFavMovingUp) ||
            (isUserHoldingBlue && favCorner === 'blue' && isFavMovingUp) ||
            (isUserHoldingRed && favCorner === 'blue' && !isFavMovingUp) ||
            (isUserHoldingBlue && favCorner === 'red' && !isFavMovingUp)) {
          marketContext = 'FAVORABLE_CONTEXT';
        } else {
          marketContext = 'UNFAVORABLE_CONTEXT';
        }
      }
    }

    const portfolioContext = {
      hasProfit: (netRedPnL > 0 && netBluePnL > 0) || (Math.max(netRedPnL, netBluePnL) > 0),
      isRiskFree: Math.abs(netRedPnL - netBluePnL) < 0.5 && (netRedPnL >= 0),
      netRedPnL,
      netBluePnL
    };

    return {
      marketContext,
      positionState,
      portfolioContext
    };
  }

  // Decision Engine
  function runDecisionEngine(journeyState, evaluatedContext) {
    const reasonCodes = [];
    let decision = 'WATCH';

    const { marketContext, positionState, portfolioContext } = evaluatedContext;

    // Layer 1: PRICE Reason Codes
    if (!journeyState || journeyState.movementDirection === 'UNCHANGED') {
      reasonCodes.push('PRICE_UNCHANGED');
    } else if (journeyState.movementDirection === 'UP') {
      reasonCodes.push('PRICE_MOVING_UP');
    } else if (journeyState.movementDirection === 'DOWN') {
      reasonCodes.push('PRICE_MOVING_DOWN');
    }

    if (journeyState && journeyState.stepDistance > 0) {
      reasonCodes.push('PRICE_STEP_CHANGED');
    }
    if (journeyState && journeyState.pace === 'rapid') {
      reasonCodes.push('PRICE_RAPID_MOVEMENT');
    }

    // Layer 2: POSITION Reason Codes
    if (positionState === 'NO_POSITION') {
      reasonCodes.push('POSITION_NO_TICKET');
    } else if (positionState === 'IN_POSITION') {
      reasonCodes.push('POSITION_ACTIVE');
    } else if (positionState === 'EXIT_READY') {
      reasonCodes.push('POSITION_EXIT_READY');
    } else if (positionState === 'EXITED') {
      reasonCodes.push('POSITION_CLOSED');
    }

    // Layer 3: PORTFOLIO Reason Codes
    if (portfolioContext.isRiskFree) {
      reasonCodes.push('PORTFOLIO_BREAKEVEN');
    } else if (portfolioContext.hasProfit) {
      reasonCodes.push('PORTFOLIO_PROFIT');
    } else {
      reasonCodes.push('PORTFOLIO_LOSS');
    }

    if (positionState === 'EXIT_READY') {
      reasonCodes.push('PORTFOLIO_HEDGE_TARGET_REACHED');
    }

    // Layer 4: DECISION logic
    if (positionState === 'NO_POSITION') {
      decision = 'WATCH';
      reasonCodes.push('DECISION_WAIT');
    } else if (positionState === 'EXITED' || portfolioContext.isRiskFree) {
      decision = 'EXIT';
      reasonCodes.push('DECISION_EXIT');
    } else if (positionState === 'EXIT_READY') {
      decision = 'TAKE_PROFIT';
      reasonCodes.push('DECISION_TAKE_PROFIT');
    } else if (marketContext === 'UNFAVORABLE_CONTEXT') {
      decision = 'REDUCE_RISK';
      reasonCodes.push('DECISION_REDUCE_RISK');
    } else if (marketContext === 'FAVORABLE_CONTEXT') {
      decision = 'HOLD';
      reasonCodes.push('DECISION_HOLD');
    } else {
      decision = 'WAIT';
      reasonCodes.push('DECISION_WAIT');
    }

    return {
      decision,
      marketContext,
      positionState,
      reasonCodes
    };
  }

  // Human Language Presenter (KIP 100% ภาษาคน)
  function presentKipUserDecision(decisionResult, journeyState, evaluatedContext) {
    const { decision, marketContext, positionState } = decisionResult;
    const { portfolioContext } = evaluatedContext;

    let statusBadgeText = '⚪ เริ่มจับตาราคา';
    let statusBadgeColor = 'rgba(255, 255, 255, 0.12)';
    let reasonText = 'ยังไม่มีการเปลี่ยนแปลงราคา';
    let actionAdviceText = '👉 ติดตามสถานการณ์';
    let watchOutText = 'ระบบกำลังเฝ้าดูการเคลื่อนไหวของราคา';

    if (positionState === 'NO_POSITION') {
      statusBadgeText = '⚪ รอประวัติการกด';
      statusBadgeColor = 'rgba(255, 255, 255, 0.1)';
      reasonText = 'ยังไม่มีไม้เปิดอยู่ในพอร์ต';
      actionAdviceText = '👉 ใส่แผลที่กดเพื่อวิเคราะห์';
      watchOutText = 'เมื่อบันทึกแผลกดแล้ว ระบบจะเริ่มคำนวณเป้าหมายให้ทันที';
    } else if (portfolioContext.isRiskFree || positionState === 'EXITED') {
      statusBadgeText = '⚪ พอร์ตสมดุล';
      statusBadgeColor = 'rgba(56, 189, 248, 0.2)';
      reasonText = 'พอร์ตของคุณถูกล็อคความเสี่ยงเรียบร้อยแล้ว';
      actionAdviceText = '👉 ถือไว้ ไม่ต้องกดเพิ่ม';
      watchOutText = 'พอร์ตอยู่ในจุดปลอดภัย ไร้ความเสี่ยง';
    } else if (decision === 'TAKE_PROFIT' || positionState === 'EXIT_READY') {
      statusBadgeText = '💚 จุดออกตัวได้';
      statusBadgeColor = 'rgba(16, 185, 129, 0.25)';
      reasonText = 'ราคาเดินทางมาถึงโซนเป้าหมายในการล็อคกำไร';
      actionAdviceText = '👉 ออกตัวได้ (กดสวนตามแผนเพื่อล็อคผลตอบแทน)';
      watchOutText = 'หากราคาย้อนกลับ อาจทำให้ความได้เปรียบลดลง';
    } else if (marketContext === 'UNFAVORABLE_CONTEXT' || decision === 'REDUCE_RISK') {
      statusBadgeText = '🟠 เริ่มสวนทาง';
      statusBadgeColor = 'rgba(245, 158, 11, 0.25)';
      reasonText = `ราคาต่อขยับในทิศทางสวนทางกับไม้ที่คุณถืออยู่ (${journeyState ? journeyState.journeyPattern : ''})`;
      actionAdviceText = '👉 รอติดตามราคา / ห้ามเพิ่มเงิน';
      watchOutText = 'หากราคาไหลสวนทางต่อ ควรพิจารณาลดความเสี่ยง';
    } else if (marketContext === 'FAVORABLE_CONTEXT' || decision === 'HOLD') {
      statusBadgeText = '🟢 ราคาเข้าทาง';
      statusBadgeColor = 'rgba(16, 185, 129, 0.25)';
      reasonText = `ราคากำลังเดินทางเข้าทางเป็นประโยชน์กับไม้ที่ถือ (${journeyState ? journeyState.journeyPattern : ''})`;
      actionAdviceText = '👉 ถือและติดตามสถานการณ์ต่อ';
      watchOutText = 'หากราคาเดินทางถึงจุดออกตัว ระบบจะแจ้งเตือนทันที';
    } else {
      statusBadgeText = '🟡 ราคาทรงตัว';
      statusBadgeColor = 'rgba(245, 158, 11, 0.2)';
      reasonText = 'ราคายังทรงตัว ไม่มีการเปลี่ยนแปลงขั้นราคา';
      actionAdviceText = '👉 รอต่อ / ยังอยู่ในแผน';
      watchOutText = 'รอติดตามการขยับขั้นราคาถัดไป';
    }

    return {
      statusBadgeText,
      statusBadgeColor,
      reasonText,
      actionAdviceText,
      watchOutText
    };
  }

  // Calculation Engine for All Strategies (Equal, Skew 70/30, Breakeven, Smart Cut)

  function calculateStrategyHedge(params) {
    const {
      strategy = 'equal',
      leadingCorner = 'red',
      leadingProfit = 0,
      laggingProfit = 0,
      isHedgeByFav = false,
      targetRatio = 1,
      skewTarget = 'auto',       // 'auto' | 'red' | 'blue' — ฝั่งไหนได้ 70% (skew_runner)
      breakevenTarget = 'auto'   // 'auto' | 'red' | 'blue' — ฝั่งไหนได้กำไร (breakeven)
    } = params;

    let targetCorner = leadingCorner === 'red' ? 'blue' : 'red';
    let hedgeStake = 0;
    let finalRedProf = 0;
    let finalBlueProf = 0;
    let _overrideFinals = null;   // { finalRedProf, finalBlueProf, targetCorner } สำหรับ custom breakeven ที่สลับมุม hedge
    let _effectiveIsHedgeByFav = isHedgeByFav;  // isHedgeByFav ที่ถูกต้องสำหรับ targetCorner ปัจจุบัน

    const absLag = Math.abs(laggingProfit);
    const actualNetRed  = leadingCorner === 'red' ? leadingProfit : laggingProfit;
    const actualNetBlue = leadingCorner === 'blue' ? leadingProfit : laggingProfit;
    const originalTargetCorner = leadingCorner === 'red' ? 'blue' : 'red';
    const favCorner = isHedgeByFav ? originalTargetCorner : leadingCorner;

    if (strategy === 'equal') {
      // กลยุทธ์เฉลี่ยกำไรเท่ากันทั้ง 2 ฝั่ง
      hedgeStake = (leadingProfit - laggingProfit) / (1 + targetRatio);
    } else if (strategy === 'breakeven') {
      if (breakevenTarget === 'red' || breakevenTarget === 'blue') {
        // ==== NEW: กลยุทธ์ขอเท่าทุนพร้อมเลือกฝั่งได้กำไร (breakevenTarget = ฝั่งได้กำไร, ฝั่งตรงข้าม = 0 บาท) ====
        const profitSide = breakevenTarget;
        const zeroSide   = profitSide === 'red' ? 'blue' : 'red';
        const zeroNet    = zeroSide === 'red' ? actualNetRed : actualNetBlue;
        let x = 0;
        let hCorner = originalTargetCorner;

        if (Math.abs(zeroNet) < 0.5) {
          // zeroSide เกือบ 0 อยู่แล้ว ไม่ต้อง hedge
          x = 0;
          hCorner = originalTargetCorner;
        } else if (zeroNet > 0) {
          // zeroSide ยังมีกำไรอยู่ → hedge บน profitSide เพื่อลดกำไร zeroSide ลง (zeroSide คือฝั่งตรงข้ามของ hedge)
          hCorner = profitSide;
          const hIsFav = (favCorner === hCorner);
          // final(zeroSide) = 0
          if (zeroSide === 'red') {
            // hedge on blue
            x = hIsFav ? (zeroNet / targetRatio) : zeroNet;
          } else {
            // zeroSide === 'blue', hedge on red
            x = hIsFav ? (zeroNet / targetRatio) : zeroNet;
          }
        } else {
          // zeroNet < 0: zeroSide ขาดทุน → hedge บน zeroSide เองเพื่อกู้คืนขาดทุน → 0
          hCorner = zeroSide;
          const hIsFav = (favCorner === hCorner);
          const absZero = Math.abs(zeroNet);
          if (zeroSide === 'red') {
            // hedge on red to recover
            x = hIsFav ? absZero : (absZero / targetRatio);
          } else {
            // zeroSide === 'blue', hedge on blue to recover
            x = hIsFav ? absZero : (absZero / targetRatio);
          }
        }

        if (!isFinite(x) || x < 0) x = 0;
        hedgeStake = Math.round(x);
        targetCorner = hCorner;
        _effectiveIsHedgeByFav = (favCorner === hCorner);

        // คำนวณผลลัพธ์สุดท้ายแบบ generalized ตาม hCorner
        const h = hCorner;
        const hFav = _effectiveIsHedgeByFav;
        const r = targetRatio;
        let fR = actualNetRed, fB = actualNetBlue;
        if (h === 'blue') {
          if (hFav) {
            fR = actualNetRed - (hedgeStake * r);
            fB = actualNetBlue + hedgeStake;
          } else {
            fR = actualNetRed - hedgeStake;
            fB = actualNetBlue + (hedgeStake * r);
          }
        } else {
          if (hFav) {
            fR = actualNetRed + hedgeStake;
            fB = actualNetBlue - (hedgeStake * r);
          } else {
            fR = actualNetRed + (hedgeStake * r);
            fB = actualNetBlue - hedgeStake;
          }
        }
        _overrideFinals = { finalRedProf: fR, finalBlueProf: fB, targetCorner: hCorner };
      } else {
        // ==== Legacy: breakeven แบบเดิม (กันทุนฝั่งแพ้โดยอัตโนมัติ) ====
        if (isHedgeByFav) {
          hedgeStake = absLag;
        } else {
          hedgeStake = absLag / targetRatio;
        }
      }
    } else if (strategy === 'skew_runner') {
      // กลยุทธ์ 70/30 Runner: บังคับให้ฝั่งที่ผู้ใช้เลือก (skewTarget) ได้กำไร ~70%
      const actualSkewTarget = (skewTarget === 'red' || skewTarget === 'blue') ? skewTarget : leadingCorner;
      const r = targetRatio;
      let x = 0;

      // คำนวณสัดส่วนปัจจุบันของฝั่ง skewTarget (ก่อน hedge)
      const currentTargetProfit = actualSkewTarget === leadingCorner ? leadingProfit : laggingProfit;
      const currentOtherProfit  = actualSkewTarget === leadingCorner ? laggingProfit : leadingProfit;
      const currentTotal = Math.max(1e-9, Math.max(0, currentTargetProfit) + Math.max(0, currentOtherProfit));
      const currentTargetRatio = Math.max(0, Math.min(1, currentTargetProfit / currentTotal));

      const skewIsLeading = (actualSkewTarget === leadingCorner);

      if (isHedgeByFav) {
        x = skewIsLeading
          ? (3 * leadingProfit - 7 * laggingProfit) / (3 * r + 7)
          : (7 * leadingProfit - 3 * laggingProfit) / (7 * r + 3);
      } else {
        x = skewIsLeading
          ? (3 * leadingProfit - 7 * laggingProfit) / (3 + 7 * r)
          : (7 * leadingProfit - 3 * laggingProfit) / (7 + 3 * r);
      }

      // ฟังก์ชันช่วยคิดผลลัพธ์หลัง hedge (predict final)
      const predictFinal = (hedgeAmt) => {
        let fT, fO;
        const L = leadingProfit, G = laggingProfit;
        if (isHedgeByFav) {
          const fL = L - hedgeAmt * r;
          const fG = G + hedgeAmt;
          fT = skewIsLeading ? fL : fG;
          fO = skewIsLeading ? fG : fL;
        } else {
          const fL = L - hedgeAmt;
          const fG = G + hedgeAmt * r;
          fT = skewIsLeading ? fL : fG;
          fO = skewIsLeading ? fG : fL;
        }
        const pTotal = Math.max(1e-9, Math.max(0, fT) + Math.max(0, fO));
        const pRatio = Math.max(0, Math.min(1, Math.max(0, fT) / pTotal));
        return { fT, fO, pRatio };
      };

      // กรณี 1: ฝั่ง skewTarget ได้สัดส่วน ≥ 68% แล้ว (ใกล้เป้าหมายพอสมควร) → ไม่ต้อง hedge อีก (ลดการกดซ้ำ)
      if (currentTargetRatio >= 0.68 && x <= 0) {
        x = 0;
      }
      // กรณี 2: x ติดลบ (ราคายังไม่เอื้อทำ 70/30 แบบสมบูรณ์) → ตัดสินใจอย่างระมัดระวัง
      else if (!isFinite(x) || x < 0) {
        let useFallback = false;
        let fx = 0;

        if (currentTargetRatio < 0.68) {
          // ยังไม่เข้าเป้า ใช้ buffer เฉพาะเมื่อ ทำให้สัดส่วน skewTarget ดีขึ้นจริงๆ
          const equalPotential = (leadingProfit - laggingProfit) / (1 + r);
          const guaranteedBuffer = Math.max(50, Math.round(equalPotential * 0.25));
          const isTargetingLagging = (skewTarget !== 'auto' && skewTarget !== leadingCorner);

          if (isTargetingLagging) {
            fx = isHedgeByFav
              ? Math.max(0, (leadingProfit - guaranteedBuffer) / r)
              : Math.max(0, leadingProfit - guaranteedBuffer);
          } else {
            fx = isHedgeByFav
              ? absLag + guaranteedBuffer
              : (absLag + guaranteedBuffer) / r;
          }

          const pred = predictFinal(fx);
          if (pred.pRatio >= currentTargetRatio - 0.02 && pred.fT >= 0 && pred.fO >= 0) {
            useFallback = true;
          }
        }

        x = useFallback ? fx : 0;
      }

      // Post-Validate: ถ้าหลัง hedge แล้วสัดส่วน skewTarget แย่ลงมากกว่า 3% หรือกลับหัว (<50%) → x=0
      if (x > 0) {
        const pred = predictFinal(x);
        if (pred.pRatio < Math.min(currentTargetRatio - 0.03, 0.50)) {
          x = 0;
        }
      }

      hedgeStake = Math.max(0, Math.round(x));
    } else if (strategy === 'smart_cut') {
      // กลยุทธ์ Smart Cut-Loss: ยอมเสียน้อย (จำกัดขาดทุนไม่เกิน 20% ของไม้แรก เมื่อราคาพลิกทาง)
      const maxAllowedLoss = Math.round(absLag * 0.20);
      const recoverableAmount = Math.max(0, absLag - maxAllowedLoss);

      if (isHedgeByFav) {
        hedgeStake = recoverableAmount;
      } else {
        hedgeStake = recoverableAmount / targetRatio;
      }
    }

    // คำนวณผลลัพธ์สุทธิหลังกดออกตัว
    if (_overrideFinals) {
      finalRedProf  = _overrideFinals.finalRedProf;
      finalBlueProf = _overrideFinals.finalBlueProf;
      if (_overrideFinals.targetCorner) targetCorner = _overrideFinals.targetCorner;
    } else if (_effectiveIsHedgeByFav) {
      if (leadingCorner === 'red') {
        finalRedProf  = leadingProfit - (hedgeStake * targetRatio);
        finalBlueProf = laggingProfit + hedgeStake;
      } else {
        finalBlueProf = leadingProfit - (hedgeStake * targetRatio);
        finalRedProf  = laggingProfit + hedgeStake;
      }
    } else {
      if (leadingCorner === 'red') {
        finalRedProf  = leadingProfit - hedgeStake;
        finalBlueProf = laggingProfit + (hedgeStake * targetRatio);
      } else {
        finalBlueProf = leadingProfit - hedgeStake;
        finalRedProf  = laggingProfit + (hedgeStake * targetRatio);
      }
    }

    const isReady = (strategy === 'smart_cut') 
      ? (Math.min(finalRedProf, finalBlueProf) >= -Math.abs(laggingProfit) * 0.25)
      : (strategy === 'breakeven' && (breakevenTarget === 'red' || breakevenTarget === 'blue'))
        ? (finalRedProf >= -0.5 && finalBlueProf >= -0.5 && Math.min(finalRedProf, finalBlueProf) >= -0.5)
        : (finalRedProf >= 0 && finalBlueProf >= 0);

    const minProfit = Math.min(finalRedProf, finalBlueProf);
    const maxProfit = Math.max(finalRedProf, finalBlueProf);

    return {
      strategy,
      targetCorner,
      skewTarget,
      hedgeStake: Math.max(0, Math.round(hedgeStake)),
      finalRedProf: Math.round(finalRedProf),
      finalBlueProf: Math.round(finalBlueProf),
      minProfit: Math.round(minProfit),
      maxProfit: Math.round(maxProfit),
      isReady
    };
  }

  // Multi-Target Ladder Calculator (ระดับ 1: ปลอดภัย / ระดับ 2: Sweet Spot / ระดับ 3: กำไรสูงสุด)
  function calculateMultiTargets(leadingCorner, leadingProfit, laggingProfit, strategy = 'skew_runner', skewTarget = 'auto', breakevenTarget = 'auto') {
    if (leadingProfit === laggingProfit || leadingProfit <= 0) return [];

    const absLag = Math.abs(laggingProfit);
    const targetCorner = leadingCorner === 'red' ? 'blue' : 'red';

    return STANDARD_BOXING_ODDS.map((odd, idx) => {
      const ratio = odd.val;
      const res = calculateStrategyHedge({
        strategy,
        leadingCorner,
        leadingProfit,
        laggingProfit,
        isHedgeByFav: false, // มาตรฐานตารางแสดงแบบฝั่งเป้าหมายได้รอง
        targetRatio: ratio,
        skewTarget,
        breakevenTarget
      });

      let tier = 'normal';
      let tierLabel = '';

      if (res.isReady) {
        if (idx <= 3) {
          tier = 'safe';
          tierLabel = '🟢 Level 1: ปลอดภัย ออกเร็ว';
        } else if (idx <= 7) {
          tier = 'sweet_spot';
          tierLabel = '⭐ Level 2: จุดคุ้มค่าสูงสุด';
        } else {
          tier = 'moonshot';
          tierLabel = '🚀 Level 3: รันกินเต็ม';
        }
      }

      return {
        label: odd.label,
        oddsValue: ratio,
        stake: res.hedgeStake,
        finalRed: res.finalRedProf,
        finalBlue: res.finalBlueProf,
        isReady: res.isReady,
        tier,
        tierLabel
      };
    });
  }

  // Entry Signal Scanner for Beginners (คำแนะนำการเข้าไม้แรกสำหรับมือใหม่)
  function evaluateEntrySignal(favCorner, oddA, oddB, balance = 20000) {
    const ratio = (oddA && oddB) ? (oddA / oddB) : 1.5;
    const recommendedFirstBet = Math.min(Math.max(50, Math.round(balance * 0.05)), 1000); // 5% ของพอร์ต ไม่เกิน 1000

    let signalType = 'WAIT';
    let title = 'รอจังหวะราคา';
    let desc = 'ราคากำลังทรงตัว รอจังหวะได้เปรียบทางสถิติ';
    let suggestedSide = favCorner;
    let suggestedOdds = `${oddA}:${oddB}`;

    if (ratio >= 2.5) {
      // ราคาต่อสูง 5/2, 3/1, 4/1, 5/1 -> จังหวะรองได้เปรียบสูง (High EV Underdog Entry)
      const dogCorner = favCorner === 'red' ? 'blue' : 'red';
      signalType = 'SNIPER_DOG';
      title = `🎯 จังหวะสวนรองได้เปรียบ [${dogCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน'}]`;
      desc = `ราคาต่อเปิดมาค่อนข้างแพง (${oddA}:${oddB}) การเปิดไม้รองจะได้อัตราจ่ายสูง เสี่ยงเงินน้อย`;
      suggestedSide = dogCorner;
    } else if (ratio <= 1.35) {
      // ราคาเบียด 10/9, 5/4, 11/8 -> จังหวะเกาะมวยต่อ
      signalType = 'MOMENTUM_FAV';
      title = `⚡ จังหวะเกาะตัวเต็ง [${favCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน'}]`;
      desc = `ราคาเบียดสูสี (${oddA}:${oddB}) เหมาะกับการเปิดไม้ต่อ เพื่อรอดักออกตัวเมื่อราคาไหลขึ้น`;
      suggestedSide = favCorner;
    } else {
      signalType = 'STANDARD';
      title = `📊 จังหวะเทรดปกติ [${favCorner === 'red' ? '🔴 แดง' : '🔵 น้ำเงิน'}] ต่อ ${oddA}:${oddB}`;
      desc = `แนะนำเปิดไม้แรกเริ่มต้นไม่เกิน ${recommendedFirstBet.toLocaleString()} B เพื่อให้เหลืองบไว้ออกตัวล็อคกำไร`;
    }

    return {
      signalType,
      title,
      desc,
      suggestedSide,
      suggestedOdds,
      recommendedFirstBet
    };
  }

  // Exports for Node / Browser
  exports.STANDARD_BOXING_ODDS = STANDARD_BOXING_ODDS;
  exports.createBoxingPrice = createBoxingPrice;
  exports.createCanonicalPrice = createCanonicalPrice;
  exports.parseRawWebsitePrice = parseRawWebsitePrice;
  exports.findBoxingPriceStepIndex = findBoxingPriceStepIndex;
  exports.createPriceSnapshot = createPriceSnapshot;
  exports.PriceJourneyTracker = PriceJourneyTracker;
  exports.evaluateContext = evaluateContext;
  exports.runDecisionEngine = runDecisionEngine;
  exports.presentKipUserDecision = presentKipUserDecision;
  exports.calculateStrategyHedge = calculateStrategyHedge;
  exports.calculateMultiTargets = calculateMultiTargets;
  exports.evaluateEntrySignal = evaluateEntrySignal;

})(typeof exports !== 'undefined' ? exports : (window.PriceJourneyEngine = {}));

