/**
 * Reverse Engine V15 — Pure Logic Module
 * Strategy: ผิดทาง → ARM (4 conditions) → Hedge Window → Reverse
 *
 * UMD pattern identical to price_journey_engine.js
 * Works in both browser (<script>) and Node (require())
 */

(function(exports) {

  // ============================================================
  // CONFIG — single source of truth (mutable for future V15.x experiments)
  // ============================================================
  let REVERSE_V15_CONFIG = {
    stake: 1000,
    adverseCountToArm: 4,
    pressureWindow: 3,
    minAdverseShare: 0.50,
    minStreak: 1,
    armExpiryTicks: 3,
    hedgeMode: 'min',            // 'min' | 'equal'
    hedgeTarget: 0,
    hedgeRounding: 'ceil',
    maxHedgeMultiple: 1.0,       // null = no cap
    requireBackToEntryOrWorse: true,
    roundTolerance: 0.5,

    zones: {
      fav_10_9_to_3_2: { entryMode: 'fav', min: 10/9, max: 3/2 },
      dog_3_1_to_5_3:  { entryMode: 'dog', min: 5/3,  max: 3/1 }
    }
  };

  // ============================================================
  // PRIMITIVE HELPERS
  // ============================================================

  /**
   * ratio(o) — max(a,b)/min(a,b)
   */
  function ratio(o) {
    const a = parseFloat(o.a) || 0;
    const b = parseFloat(o.b) || 0;
    if (a <= 0 || b <= 0) return 1;
    return Math.max(a, b) / Math.min(a, b);
  }

  /**
   * deriveSide — mirrors Muypakyok2.js deriveSideFromOdds()
   */
  function deriveSide(a, b) {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    if (na > nb) return 'fav';
    if (na < nb) return 'dog';
    return 'even';
  }

  /**
   * ticketAmounts(odds, stake) — MUST match getTicketPnL() in Muypakyok2.js
   *   fav: risk = stake * ratio, win = stake
   *   dog: risk = stake,         win = stake * ratio
   */
  function ticketAmounts(odds, stake) {
    const a = parseFloat(odds.a) || 1;
    const b = parseFloat(odds.b) || 1;
    const s = parseFloat(stake) || 0;
    const side = deriveSide(a, b);
    const r = (a > 0 && b > 0) ? Math.max(a, b) / Math.min(a, b) : 1;
    if (side === 'fav') {
      return { win: s, risk: s * r };
    } else {
      return { win: s * r, risk: s };
    }
  }

  /**
   * isAdverse(entrySide, previousRatio, currentRatio)
   * fav entry: adverse when ratio INCREASES (odds widen against fav bettor)
   * dog entry: adverse when ratio DECREASES (odds compress against dog bettor)
   */
  function isAdverse(entrySide, previousRatio, currentRatio) {
    if (entrySide === 'fav') return currentRatio > previousRatio;
    if (entrySide === 'dog') return currentRatio < previousRatio;
    return false;
  }

  /**
   * backToEntryOrWorse(entrySide, entryRatio, currentRatio)
   * fav: back when currentRatio >= entryRatio
   * dog: back when currentRatio <= entryRatio
   */
  function backToEntryOrWorse(entrySide, entryRatio, currentRatio) {
    if (entrySide === 'fav') return currentRatio >= entryRatio;
    if (entrySide === 'dog') return currentRatio <= entryRatio;
    return false;
  }

  function getRecentAdverseFlags(flags, windowSize) {
    return flags.slice(-windowSize);
  }

  function countTrue(arr) {
    return arr.filter(Boolean).length;
  }

  function currentStreak(flags) {
    let streak = 0;
    for (let i = flags.length - 1; i >= 0; i--) {
      if (flags[i]) streak++;
      else break;
    }
    return streak;
  }

  /**
   * shouldArm — ALL 4 conditions must pass:
   *   1. adverseCount >= adverseCountToArm
   *   2. backToEntryOrWorse (if required)
   *   3. pressure window adverse share >= minAdverseShare
   *   4. streak >= minStreak
   */
  function shouldArm(params, config) {
    const { adverseCount, flags, entrySide, entryRatio, currentRatio } = params;
    if (adverseCount < config.adverseCountToArm) return false;
    if (config.requireBackToEntryOrWorse) {
      if (!backToEntryOrWorse(entrySide, entryRatio, currentRatio)) return false;
    }
    const recent = getRecentAdverseFlags(flags, config.pressureWindow);
    const share = recent.length > 0 ? countTrue(recent) / recent.length : 0;
    if (share < config.minAdverseShare) return false;
    if (currentStreak(flags) < config.minStreak) return false;
    return true;
  }

  /**
   * calculateHedge(entryOdds, entryStake, hedgeOdds, config)
   * BUG 1 FIX: Uses original entry odds (entryOdds) and original entry stake (entryStake).
   * Hedge ticket uses current opposite odds (hedgeOdds) at current tick.
   *
   * MIN mode: find smallest hedge H such that minFinal >= hedgeTarget - roundTolerance
   * EQUAL mode: equalise both outcomes
   */
  function calculateHedge(entryOdds, entryStake, hedgeOdds, config) {
    const stake = parseFloat(entryStake) || (config && config.stake) || 1000;
    const { hedgeMode, hedgeTarget, hedgeRounding, maxHedgeMultiple, roundTolerance } = config;

    const origAmts = ticketAmounts(entryOdds, stake);
    const entryWinProfit  =  origAmts.win;   // entry side wins
    const entryLossProfit = -origAmts.risk;  // entry side loses

    const hedgeSide = deriveSide(hedgeOdds.a, hedgeOdds.b);
    const hedgeRatioVal = ratio(hedgeOdds);
    const upper = (maxHedgeMultiple !== null) ? stake * maxHedgeMultiple : Infinity;

    let hedgeStake;

    if (hedgeMode === 'min') {
      if (hedgeSide === 'fav') {
        const floor = (hedgeTarget - roundTolerance) - entryLossProfit;
        hedgeStake = Math.max(0, floor);
      } else {
        const floor = ((hedgeTarget - roundTolerance) - entryLossProfit) / hedgeRatioVal;
        hedgeStake = Math.max(0, floor);
      }
    } else {
      if (hedgeSide === 'fav') {
        hedgeStake = (entryWinProfit - entryLossProfit) / (hedgeRatioVal + 1);
      } else {
        hedgeStake = (entryWinProfit - entryLossProfit) / (1 + hedgeRatioVal);
      }
      hedgeStake = Math.max(0, hedgeStake);
    }

    // Rounding
    if (hedgeRounding === 'ceil')  hedgeStake = Math.ceil(hedgeStake);
    else if (hedgeRounding === 'floor') hedgeStake = Math.floor(hedgeStake);
    else hedgeStake = Math.round(hedgeStake);

    hedgeStake = Math.min(hedgeStake, upper);
    hedgeStake = Math.max(0, hedgeStake);

    // Outcomes
    let hedgeWinAmt, hedgeRiskAmt;
    if (hedgeSide === 'fav') {
      hedgeWinAmt  = hedgeStake;
      hedgeRiskAmt = hedgeStake * hedgeRatioVal;
    } else {
      hedgeWinAmt  = hedgeStake * hedgeRatioVal;
      hedgeRiskAmt = hedgeStake;
    }

    const finalIfEntryWins  = entryWinProfit  - hedgeRiskAmt;
    const finalIfEntryLoses = entryLossProfit + hedgeWinAmt;
    const minFinal = Math.min(finalIfEntryWins, finalIfEntryLoses);
    const maxFinal = Math.max(finalIfEntryWins, finalIfEntryLoses);

    const accepted = hedgeStake <= upper && minFinal >= (hedgeTarget - roundTolerance);

    return {
      hedge: hedgeStake,
      accepted,
      finalIfEntryWins:  Math.round(finalIfEntryWins),
      finalIfEntryLoses: Math.round(finalIfEntryLoses),
      minFinal,
      maxFinal
    };
  }

  // ============================================================
  // CORE STEP FUNCTION — stateless, NO look-ahead bias
  // ============================================================

  /**
   * stepReverseV15(state, currentOdds, hedgeOdds, config)
   *
   * Receives ONLY current-tick data. Never accesses future ticks.
   * Backtest wraps this in a loop; live calls once per price update.
   */
  function stepReverseV15(state, currentOdds, hedgeOdds, config) {
    if (!state) return state;
    if (state.phase === 'REVERSED' || state.phase === 'EXPIRED') {
      return Object.assign({}, state);
    }

    const cfg = config || REVERSE_V15_CONFIG;
    const curRatio = ratio(currentOdds);
    const prevRatio = state.previousRatio;

    const adverse = isAdverse(state.entrySide, prevRatio, curRatio);
    const newFlags = state.adverseFlags.concat([adverse]);
    const newAdverseCount = state.adverseCount + (adverse ? 1 : 0);

    const recent = getRecentAdverseFlags(newFlags, cfg.pressureWindow);
    const adverseShare = recent.length > 0 ? countTrue(recent) / recent.length : 0;
    const streak = currentStreak(newFlags);

    let newState = {
      entryCorner:   state.entryCorner,
      entrySide:     state.entrySide,
      entryOdds:     state.entryOdds,
      entryRatio:    state.entryRatio,
      entryStake:    state.entryStake,
      previousRatio: curRatio,
      adverseFlags:  newFlags,
      adverseCount:  newAdverseCount,
      armed:         state.armed,
      armIndex:      state.armIndex,
      armAge:        state.armAge,
      reversed:      state.reversed,
      phase:         state.phase,
      hedgePreview:  state.hedgePreview || null,
    };

    let decision = 'WAIT';
    let justArmedThisTick = false;

    // ARM check (only if not already armed)
    if (!newState.armed) {
      const armResult = shouldArm({
        adverseCount: newAdverseCount,
        flags:        newFlags,
        entrySide:    state.entrySide,
        entryRatio:   state.entryRatio,
        currentRatio: curRatio
      }, cfg);
      if (armResult) {
        newState.armed           = true;
        newState.armIndex        = newFlags.length - 1;
        newState.armAge          = 0;
        newState.phase           = 'ARMED';
        justArmedThisTick        = true;
        decision                 = 'WAIT'; // BUG 2 FIX: ARM tick = ARMED, decision = WAIT (do not evaluate hedge window on ARM tick)
      }
    } else {
      // Already armed in a previous tick -> advance armAge
      newState.armAge = (state.armAge || 0) + 1;
      if (newState.armAge > cfg.armExpiryTicks) {
        newState.phase = 'EXPIRED';
        newState.armed = false;
        newState.debugInfo = {
          entryOdds: `${state.entryOdds.a}:${state.entryOdds.b}`,
          currentOdds: `${currentOdds.a}:${currentOdds.b}`,
          entryStake: state.entryStake,
          currentHedgeOdds: hedgeOdds ? `${hedgeOdds.a}:${hedgeOdds.b}` : '-',
          armTick: newState.armIndex,
          currentTick: newFlags.length - 1,
          ticksSinceArm: newState.armAge,
          ratio: curRatio, previousRatio: prevRatio, adverse,
          adverseCount: newAdverseCount, adverseShare: parseFloat(adverseShare.toFixed(3)),
          streak, state: 'EXPIRED', hedgeStake: null, worstCase: null, decision: 'EXPIRED_ARM'
        };
        return newState;
      }
    }

    // Hedge Window check — BUG 2 FIX: Must wait at least 1 tick after ARM before evaluating Hedge Window
    let hedgePreview = null;

    if (newState.armed && !justArmedThisTick && hedgeOdds) {
      // BUG 1 FIX: Pass state.entryOdds and state.entryStake
      hedgePreview = calculateHedge(newState.entryOdds, newState.entryStake, hedgeOdds, cfg);
      newState.hedgePreview = hedgePreview;
      if (hedgePreview.accepted) {
        newState.phase = 'REVERSE_READY';
        decision = 'REVERSE';
      } else {
        decision = 'ARMED_WAITING';
      }
    } else if (newState.armed && !justArmedThisTick) {
      decision = 'ARMED_NO_HEDGE_ODDS';
    } else if (!newState.armed) {
      decision = 'ACCUMULATING';
    }

    // Debug Info (meets all prompt requirements)
    newState.debugInfo = {
      entryOdds: `${state.entryOdds.a}:${state.entryOdds.b}`,
      currentOdds: `${currentOdds.a}:${currentOdds.b}`,
      entryStake: state.entryStake,
      currentHedgeOdds: hedgeOdds ? `${hedgeOdds.a}:${hedgeOdds.b}` : '-',
      armTick: newState.armIndex !== null ? newState.armIndex : null,
      currentTick: newFlags.length - 1,
      ticksSinceArm: newState.armed ? newState.armAge : 0,
      ratio: curRatio,
      previousRatio: prevRatio,
      adverse,
      adverseCount: newAdverseCount,
      pressureWindow: cfg.pressureWindow,
      adverseShare: parseFloat(adverseShare.toFixed(3)),
      streak,
      state: newState.phase,
      hedgeStake:  hedgePreview ? hedgePreview.hedge    : null,
      worstCase:   hedgePreview ? hedgePreview.minFinal : null,
      decision
    };

    return newState;
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  exports.REVERSE_V15_CONFIG      = REVERSE_V15_CONFIG;
  exports.ratio                   = ratio;
  exports.deriveSide              = deriveSide;
  exports.ticketAmounts           = ticketAmounts;
  exports.isAdverse               = isAdverse;
  exports.backToEntryOrWorse      = backToEntryOrWorse;
  exports.getRecentAdverseFlags   = getRecentAdverseFlags;
  exports.countTrue               = countTrue;
  exports.currentStreak           = currentStreak;
  exports.shouldArm               = shouldArm;
  exports.calculateHedge          = calculateHedge;
  exports.stepReverseV15          = stepReverseV15;

})(typeof exports !== 'undefined' ? exports : (window.ReverseV15Engine = {}));
