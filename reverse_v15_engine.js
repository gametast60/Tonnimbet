/**
 * Reverse Engine V15.1 — Pure Logic Module
 * Strategy: ผิดทาง → ARM (4 conditions) → Persistent Hedge Window → Reverse
 *
 * V15.1 Update: Persistent Monitoring & Re-ARM Lifecycle
 * - EXPIRED = current ARM cycle expired -> transition to WAIT with cooldown -> continue monitoring.
 * - REVERSE_READY = real-time opportunity at current odds. If missed or price moves away, transitions to ARMED / WAIT (HEDGE_WINDOW_CLOSED) and can return to REVERSE_READY or Re-ARM.
 * - Cooldown (rearmCooldownTicks = 2): Ticks required after EXPIRED before next ARM cycle.
 * - REVERSED: Terminal state for position.
 *
 * UMD pattern identical to price_journey_engine.js
 * Works in both browser (<script>) and Node (require())
 */

(function(exports) {

  // ============================================================
  // CONFIG — single source of truth
  // ============================================================
  let REVERSE_V15_CONFIG = {
    stake: 1000,
    adverseCountToArm: 4,
    pressureWindow: 3,
    minAdverseShare: 0.50,
    minStreak: 1,
    armExpiryTicks: 3,
    rearmCooldownTicks: 2,        // 🆕 V15.1 Cooldown ticks after EXPIRED before next ARM
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

  function ratio(o) {
    const a = parseFloat(o.a) || 0;
    const b = parseFloat(o.b) || 0;
    if (a <= 0 || b <= 0) return 1;
    return Math.max(a, b) / Math.min(a, b);
  }

  function deriveSide(a, b) {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    if (na > nb) return 'fav';
    if (na < nb) return 'dog';
    return 'even';
  }

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

  function isAdverse(entrySide, previousRatio, currentRatio) {
    if (entrySide === 'fav') return currentRatio > previousRatio;
    if (entrySide === 'dog') return currentRatio < previousRatio;
    return false;
  }

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

    if (hedgeRounding === 'ceil')  hedgeStake = Math.ceil(hedgeStake);
    else if (hedgeRounding === 'floor') hedgeStake = Math.floor(hedgeStake);
    else hedgeStake = Math.round(hedgeStake);

    hedgeStake = Math.min(hedgeStake, upper);
    hedgeStake = Math.max(0, hedgeStake);

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
  // CORE STEP FUNCTION — V15.1 Persistent Engine
  // ============================================================

  function stepReverseV15(state, currentOdds, hedgeOdds, config) {
    if (!state) return state;
    if (state.phase === 'REVERSED') {
      return Object.assign({}, state);
    }

    const cfg = config || REVERSE_V15_CONFIG;
    const rearmCooldown = (typeof cfg.rearmCooldownTicks === 'number') ? cfg.rearmCooldownTicks : 2;
    const curRatio = ratio(currentOdds);
    const prevRatio = state.previousRatio;

    const adverse = isAdverse(state.entrySide, prevRatio, curRatio);
    const newFlags = state.adverseFlags.concat([adverse]);
    const newAdverseCount = state.adverseCount + (adverse ? 1 : 0);

    const recent = getRecentAdverseFlags(newFlags, cfg.pressureWindow);
    const adverseShare = recent.length > 0 ? countTrue(recent) / recent.length : 0;
    const streak = currentStreak(newFlags);

    let currentCooldown = state.cooldownRemaining || 0;
    if (currentCooldown > 0) {
      currentCooldown -= 1;
    }

    let newState = {
      entryCorner:       state.entryCorner,
      entrySide:         state.entrySide,
      entryOdds:         state.entryOdds,
      entryRatio:        state.entryRatio,
      entryStake:        state.entryStake,
      previousRatio:    curRatio,
      adverseFlags:      newFlags,
      adverseCount:      newAdverseCount,
      armed:             state.armed,
      armIndex:          state.armIndex,
      armAge:            state.armAge,
      armCycle:          state.armCycle || 1,
      cooldownRemaining: currentCooldown,
      reversed:          state.reversed,
      phase:             state.phase,
      hedgePreview:      null,
      _lastStepOddsKey:  state._lastStepOddsKey
    };

    let decision = 'MONITOR';
    let justArmedThisTick = false;

    // If previous phase was EXPIRED, reset to WAIT for current tick evaluation
    if (newState.phase === 'EXPIRED') {
      newState.phase = 'WAIT';
      newState.armed = false;
      newState.armAge = 0;
    }

    // 1. ARM Check (if not currently armed and cooldown is 0)
    if (!newState.armed) {
      if (newState.cooldownRemaining === 0) {
        const armResult = shouldArm({
          adverseCount: newAdverseCount,
          flags:        newFlags,
          entrySide:    state.entrySide,
          entryRatio:   state.entryRatio,
          currentRatio: curRatio
        }, cfg);

        if (armResult) {
          newState.armed            = true;
          newState.armIndex         = newFlags.length - 1;
          newState.armAge           = 0;
          newState.phase            = 'ARMED';
          justArmedThisTick         = true;
          decision                  = 'ARMED_WAITING_1_TICK';
        } else {
          newState.phase = 'WAIT';
          decision = 'MONITOR';
        }
      } else {
        newState.phase = 'WAIT';
        decision = `COOLDOWN (${newState.cooldownRemaining} TICKS LEFT)`;
      }
    } else {
      // Already armed in a previous tick -> advance armAge
      newState.armAge = (state.armAge || 0) + 1;
      if (newState.armAge > cfg.armExpiryTicks) {
        // Current ARM Cycle Expired -> transition to EXPIRED, set cooldown, increment armCycle for next time
        newState.phase             = 'EXPIRED';
        newState.armed             = false;
        newState.cooldownRemaining = rearmCooldown;
        decision                   = 'ARM_EXPIRED_GOING_TO_WAIT';

        const prevCycle = newState.armCycle;
        newState.armCycle = prevCycle + 1;

        newState.debugInfo = {
          state: 'EXPIRED',
          armCycle: prevCycle,
          armTick: newState.armIndex,
          currentTick: newFlags.length - 1,
          ticksSinceArm: newState.armAge,
          cooldownRemaining: newState.cooldownRemaining,
          entryOdds: `${state.entryOdds.a}:${state.entryOdds.b}`,
          currentOdds: `${currentOdds.a}:${currentOdds.b}`,
          entryStake: state.entryStake,
          currentHedgeOdds: hedgeOdds ? `${hedgeOdds.a}:${hedgeOdds.b}` : '-',
          hedgeStake: null,
          worstCase: null,
          decision: 'ARM_EXPIRED_GOING_TO_WAIT'
        };
        return newState;
      }
    }

    // 2. Hedge Window Check (only when ARMED and not just armed on this tick)
    let hedgePreview = null;
    if (newState.armed && !justArmedThisTick && hedgeOdds) {
      hedgePreview = calculateHedge(newState.entryOdds, newState.entryStake, hedgeOdds, cfg);
      newState.hedgePreview = hedgePreview;

      if (hedgePreview.accepted) {
        newState.phase = 'REVERSE_READY';
        decision = 'REVERSE';
      } else {
        if (state.phase === 'REVERSE_READY') {
          newState.phase = 'ARMED';
          decision = 'HEDGE_WINDOW_CLOSED';
        } else {
          newState.phase = 'ARMED';
          decision = 'ARMED_WAITING';
        }
      }
    } else if (newState.armed && !justArmedThisTick) {
      newState.phase = 'ARMED';
      decision = 'ARMED_NO_HEDGE_ODDS';
    }

    // 3. Debug Info
    newState.debugInfo = {
      state: newState.phase,
      armCycle: newState.armCycle,
      armTick: newState.armed ? newState.armIndex : null,
      currentTick: newFlags.length - 1,
      ticksSinceArm: newState.armed ? newState.armAge : 0,
      cooldownRemaining: newState.cooldownRemaining,
      entryOdds: `${state.entryOdds.a}:${state.entryOdds.b}`,
      currentOdds: `${currentOdds.a}:${currentOdds.b}`,
      entryStake: state.entryStake,
      currentHedgeOdds: hedgeOdds ? `${hedgeOdds.a}:${hedgeOdds.b}` : '-',
      hedgeStake: hedgePreview ? hedgePreview.hedge : null,
      worstCase: hedgePreview ? hedgePreview.minFinal : null,
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
