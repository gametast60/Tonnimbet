/**
 * V16 Reverse Engine — Pure Logic Module
 * ที่มา: findTrigger() / maxRecoverable() / apply() ใน test_price_journey.js (V16.0.22)
 * แปลงจากแบบ "วนลูปดูทั้งไฟต์ในอดีต" (backtest) เป็นแบบ "ดูทีละ tick สด" (live step)
 *
 * หน้าที่: เฝ้าดูจังหวะ "เพิ่มไม้ hedge" หลังมีไม้แรกแล้วเท่านั้น (trigger1 -> leg2, trigger2 -> leg3)
 * ไม่รวมส่วนเข้าไม้แรก (ผู้ใช้เลือกจังหวะเข้าเอง) และไม่รวมส่วนออกตัว (ใช้ 4 กลยุทธ์เดิม: Equal/70-30/BE/Smart Cut)
 * ไม่มีการวางเดิมพันเอง — คืนค่าเป็น "คำแนะนำ" (suggestion) เท่านั้น ฝั่งแอปต้องให้ผู้ใช้กดยืนยันเองเสมอ
 * ผ่านปุ่ม ⚡ กด...ทันที มาตรฐาน (เส้นทางเดียวกับกลยุทธ์อื่นทุกตัว)
 *
 * UMD pattern identical to reverse_v15_engine.js
 */

(function (exports) {

  const V16ML_CONFIG = {
    legFactor: 0.75
  };

  // ============================================================
  // PRIMITIVES (เหมือน test_price_journey.js)
  // ============================================================

  function isValidOdds(o) {
    return !!(o && Number(o.a) > 0 && Number(o.b) > 0);
  }

  function ratio(o) {
    return Math.max(+o.a, +o.b) / Math.min(+o.a, +o.b);
  }

  function sideOf(o) {
    if (+o.a > +o.b) return 'fav';
    if (+o.a < +o.b) return 'dog';
    return 'even';
  }

  function ticketAmounts(odds, stake) {
    const r = ratio(odds);
    if (sideOf(odds) === 'fav') {
      return { win: stake, risk: stake * r };
    }
    return { win: stake * r, risk: stake };
  }

  function maxRecoverable(netRed, netBlue, odds) {
    const r = ratio(odds);
    const leading = Math.max(netRed, netBlue);
    const lagging = Math.min(netRed, netBlue);
    return Math.max(0, Math.min(Math.abs(lagging), leading / r));
  }

  function applyLeg(netRed, netBlue, corner, odds, stake) {
    const p = ticketAmounts(odds, stake);
    if (corner === 'red') {
      return { netRed: netRed + p.win, netBlue: netBlue - p.risk };
    }
    return { netRed: netRed - p.risk, netBlue: netBlue + p.win };
  }

  // ============================================================
  // MULTI-LEG STATE STEP — เรียกทุก tick หลังมีไม้แรกแล้ว (ผู้ใช้วางไม้แรกเอง)
  //
  // state shape ที่ต้องคงไว้ระหว่าง tick (ฝั่ง caller เก็บเอง เหมือน reverseV15State):
  // {
  //   entryCorner, entryOdds, entryStake,
  //   legsPlaced,              // จำนวนไม้ที่วางไปแล้วจริง (นับจาก tickets.length ฝั่ง caller)
  //   phase,                   // 'WATCHING_TRIGGER1' | 'LEG2_READY' | 'WATCHING_TRIGGER2' | 'LEG3_READY' | 'MONITOR_ONLY'
  //   trigger1, trigger2,      // เก็บข้อมูล trigger ที่เจอไว้ debug
  //   leg2Suggestion, leg3Suggestion
  // }
  //
  // ctx: { redOdds, blueOdds, netRed, netBlue, ticketsCount, config }
  // ============================================================

  function evaluateMultiLegState(state, ctx) {
    if (!state || !state.entryCorner) return state;

    const cfg = ctx.config || V16ML_CONFIG;
    const newState = Object.assign({}, state, { legsPlaced: ctx.ticketsCount });

    // อัปเดต phase เริ่มต้นจากจำนวนไม้ที่มีจริง (เผื่อผู้ใช้วางไม้เองแล้ว state ตามหลัง)
    if (ctx.ticketsCount >= 3) {
      newState.phase = 'MONITOR_ONLY';
      return newState;
    }

    if (ctx.ticketsCount === 1) {
      // ยังไม่ trigger1 -> เฝ้าดูฝั่งตรงข้ามของ entryCorner ว่ากลายเป็น fav หรือยัง
      if (newState.phase === 'LEG2_READY') return newState; // ค้างสถานะไว้จนกว่าจะวางไม้จริง (ticketsCount เปลี่ยน)

      const oppositeCorner = state.entryCorner === 'red' ? 'blue' : 'red';
      const oppositeOdds = oppositeCorner === 'red' ? ctx.redOdds : ctx.blueOdds;

      newState.phase = 'WATCHING_TRIGGER1';

      if (isValidOdds(oppositeOdds) && sideOf(oppositeOdds) === 'fav') {
        const stake = cfg.legFactor * maxRecoverable(ctx.netRed, ctx.netBlue, oppositeOdds);
        if (stake > 0) {
          newState.trigger1 = { corner: oppositeCorner, odds: { a: oppositeOdds.a, b: oppositeOdds.b } };
          newState.leg2Suggestion = {
            corner: oppositeCorner,
            odds: { a: oppositeOdds.a, b: oppositeOdds.b },
            suggestedStake: Math.round(stake)
          };
          newState.phase = 'LEG2_READY';
        }
      }
      return newState;
    }

    if (ctx.ticketsCount === 2) {
      if (newState.phase === 'LEG3_READY') return newState;

      // leg2Corner = ฝั่งตรงข้ามของ entryCorner (จากขั้นก่อนหน้า) -> trigger2 เฝ้าดูฝั่ง entryCorner เอง
      const leg3Corner = state.entryCorner;
      const leg3Odds = leg3Corner === 'red' ? ctx.redOdds : ctx.blueOdds;

      newState.phase = 'WATCHING_TRIGGER2';

      if (isValidOdds(leg3Odds) && sideOf(leg3Odds) === 'fav') {
        const stake = cfg.legFactor * maxRecoverable(ctx.netRed, ctx.netBlue, leg3Odds);
        if (stake > 0) {
          newState.trigger2 = { corner: leg3Corner, odds: { a: leg3Odds.a, b: leg3Odds.b } };
          newState.leg3Suggestion = {
            corner: leg3Corner,
            odds: { a: leg3Odds.a, b: leg3Odds.b },
            suggestedStake: Math.round(stake)
          };
          newState.phase = 'LEG3_READY';
        }
      }
      return newState;
    }

    return newState;
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  exports.V16ML_CONFIG = V16ML_CONFIG;
  exports.isValidOdds = isValidOdds;
  exports.ratio = ratio;
  exports.sideOf = sideOf;
  exports.ticketAmounts = ticketAmounts;
  exports.maxRecoverable = maxRecoverable;
  exports.applyLeg = applyLeg;
  exports.evaluateMultiLegState = evaluateMultiLegState;

})(typeof exports !== 'undefined' ? exports : (window.V16ReverseEngine = {}));
