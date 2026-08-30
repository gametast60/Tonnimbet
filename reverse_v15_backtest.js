/**
 * reverse_v15_backtest.js — V15.1 Persistent Hedge Window Backtest
 *
 * Usage: node reverse_v15_backtest.js
 *
 * Loads data.js via vm.createContext.
 * Requires reverse_v15_engine.js for V15.1 persistent logic.
 * Tracks full fight lifecycle across all ticks (no look-ahead, 100% sequential).
 */

'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ReverseV15Engine = require('./reverse_v15_engine.js');
const {
  REVERSE_V15_CONFIG,
  ratio,
  ticketAmounts,
  calculateHedge,
  stepReverseV15
} = ReverseV15Engine;

const DATA_PATH = path.join(__dirname, 'data.js');
const dataCode  = fs.readFileSync(DATA_PATH, 'utf8');
const ctx       = vm.createContext({ window: {} });
vm.runInContext(dataCode, ctx);
const fights = ctx.window.HISTORICAL_FIGHTS || [];

if (fights.length === 0) {
  console.error('ERROR: No fights loaded from data.js');
  process.exit(1);
}
console.log(`Loaded ${fights.length} fights from data.js`);

/**
 * simulateV15(fight, zone) — V15.1 Persistent LifeCycle Simulation
 */
function simulateV15(fight, zone) {
  const cfg = REVERSE_V15_CONFIG;

  const journey = (fight.journey || []).filter(p =>
    p.red  && p.red.isValid  !== false &&
    p.blue && p.blue.isValid !== false
  );

  if (journey.length < 2) return null;

  let entryTickIdx = -1;
  let entryCorner  = null;
  let entryOdds    = null;

  for (let i = 0; i < journey.length; i++) {
    const p = journey[i];
    const redR  = ratio(p.red);
    const blueR = ratio(p.blue);

    if (zone.entryMode === 'fav') {
      if (p.red.a > p.red.b && redR >= zone.min && redR <= zone.max) {
        entryTickIdx = i; entryCorner = 'red'; entryOdds = p.red; break;
      }
      if (p.blue.a > p.blue.b && blueR >= zone.min && blueR <= zone.max) {
        entryTickIdx = i; entryCorner = 'blue'; entryOdds = p.blue; break;
      }
    } else if (zone.entryMode === 'dog') {
      if (p.red.b > p.red.a && redR >= zone.min && redR <= zone.max) {
        entryTickIdx = i; entryCorner = 'red'; entryOdds = p.red; break;
      }
      if (p.blue.b > p.blue.a && blueR >= zone.min && blueR <= zone.max) {
        entryTickIdx = i; entryCorner = 'blue'; entryOdds = p.blue; break;
      }
    }
  }

  if (entryTickIdx < 0) return null;

  const hedgeCorner = entryCorner === 'red' ? 'blue' : 'red';
  const entrySide   = ReverseV15Engine.deriveSide(entryOdds.a, entryOdds.b);
  const entryRatioVal = ratio(entryOdds);

  let state = {
    entryCorner,
    entrySide,
    entryOdds: { a: entryOdds.a, b: entryOdds.b },
    entryRatio: entryRatioVal,
    entryStake: cfg.stake,
    previousRatio: entryRatioVal,
    adverseFlags:  [],
    adverseCount:  0,
    armed: false, armIndex: null, armAge: 0, armCycle: 1, cooldownRemaining: 0,
    reversed: false,
    phase: 'WAIT'
  };

  // KPIs for V15.1
  let kpi = {
    totalARM: 0,
    totalREADY: 0,
    totalEXPIRED: 0,
    totalREARM: 0,
    totalREVERSE: 0,
    missedReadyCount: 0,
    returnedReadyCount: 0
  };

  let tickDebug = [];
  let prevPhase = 'WAIT';
  let hadPreviousMissedReady = false;

  for (let i = entryTickIdx + 1; i < journey.length; i++) {
    const p           = journey[i];
    const curEntryOdds = p[entryCorner];
    const curHedgeOdds = p[hedgeCorner];

    state = stepReverseV15(
      state,
      { a: curEntryOdds.a, b: curEntryOdds.b },
      { a: curHedgeOdds.a, b: curHedgeOdds.b },
      cfg
    );

    if (state.debugInfo) tickDebug.push(state.debugInfo);

    // Track KPI events
    if (state.phase === 'ARMED' && prevPhase === 'WAIT') {
      kpi.totalARM++;
      if (state.armCycle > 1) kpi.totalREARM++;
    }
    if (state.phase === 'REVERSE_READY' && prevPhase !== 'REVERSE_READY') {
      kpi.totalREADY++;
      if (hadPreviousMissedReady) {
        kpi.returnedReadyCount++;
      }
    }
    if (state.phase === 'EXPIRED' && prevPhase !== 'EXPIRED') {
      kpi.totalEXPIRED++;
    }

    if (prevPhase === 'REVERSE_READY' && state.phase === 'ARMED') {
      kpi.missedReadyCount++;
      hadPreviousMissedReady = true;
    }

    // In backtest simulation: execute reverse on first REVERSE_READY
    if (state.phase === 'REVERSE_READY' && !state.reversed) {
      state.reversed = true;
      state.phase    = 'REVERSED';
      kpi.totalREVERSE++;
      break;
    }

    prevPhase = state.phase;
  }

  const winner = fight.winner;
  let pnl = null;

  if (state.phase === 'REVERSED' && state.hedgePreview) {
    const h = state.hedgePreview;
    const entryResult = winner === entryCorner ? h.finalIfEntryWins : h.finalIfEntryLoses;
    pnl = Math.round(entryResult);
  }

  return {
    fightId:   fight.fightId,
    fighters:  fight.fighters,
    winner,
    zone:      zone === cfg.zones.fav_10_9_to_3_2 ? 'fav_10_9_to_3_2' : 'dog_3_1_to_5_3',
    entryCorner,
    entrySide,
    entryOdds,
    entryRatio: parseFloat(entryRatioVal.toFixed(3)),
    phase:     state.phase,
    reversed:  state.phase === 'REVERSED',
    pnl,
    kpi,
    tickDebug
  };
}

function stats(results, label) {
  const total    = results.length;
  const entered  = results.filter(r => r !== null);
  const reversed = entered.filter(r => r.reversed);
  const withPnL  = entered.filter(r => r.pnl !== null);
  const wins     = withPnL.filter(r => r.pnl >= 0).length;
  const losses   = withPnL.filter(r => r.pnl < 0).length;
  const totalPnL = withPnL.reduce((s, r) => s + r.pnl, 0);
  const avgPnL   = withPnL.length > 0 ? totalPnL / withPnL.length : 0;
  const winRate  = withPnL.length > 0 ? (wins / withPnL.length * 100).toFixed(1) : 'N/A';

  // Aggregate V15.1 KPIs
  const aggKpi = entered.reduce((acc, r) => {
    acc.totalARM      += r.kpi.totalARM;
    acc.totalREADY    += r.kpi.totalREADY;
    acc.totalEXPIRED  += r.kpi.totalEXPIRED;
    acc.totalREARM    += r.kpi.totalREARM;
    acc.totalREVERSE  += r.kpi.totalREVERSE;
    acc.missedReady   += r.kpi.missedReadyCount;
    acc.returnedReady += r.kpi.returnedReadyCount;
    return acc;
  }, { totalARM: 0, totalREADY: 0, totalEXPIRED: 0, totalREARM: 0, totalREVERSE: 0, missedReady: 0, returnedReady: 0 });

  console.log(`\n── ${label} ──────────────────────────`);
  console.log(`  Fights: ${total} | Entered: ${entered.length} | Reversed: ${reversed.length}`);
  console.log(`  Win/Loss: ${wins}W / ${losses}L | WinRate: ${winRate}%`);
  console.log(`  Total PnL: ${totalPnL >= 0 ? '+' : ''}${totalPnL} B | Avg PnL: ${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(0)} B`);
  console.log(`  📊 V15.1 KPIs: ARM=${aggKpi.totalARM} | READY=${aggKpi.totalREADY} | EXPIRED=${aggKpi.totalEXPIRED} | RE-ARM=${aggKpi.totalREARM} | REVERSE=${aggKpi.totalREVERSE} | Missed=${aggKpi.missedReady} | ReturnedREADY=${aggKpi.returnedReady}`);
}

const zones = [
  { name: 'fav_10_9_to_3_2', cfg: REVERSE_V15_CONFIG.zones.fav_10_9_to_3_2 },
  { name: 'dog_3_1_to_5_3',  cfg: REVERSE_V15_CONFIG.zones.dog_3_1_to_5_3  }
];

const TRAIN = fights.slice(0, 20);
const TEST  = fights.slice(20);

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║    Reverse Engine V15.1 — Backtest Results           ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log(`Config: stake=${REVERSE_V15_CONFIG.stake}, adverseToArm=${REVERSE_V15_CONFIG.adverseCountToArm}, pressureWindow=${REVERSE_V15_CONFIG.pressureWindow}, minAdverseShare=${REVERSE_V15_CONFIG.minAdverseShare}, armExpiryTicks=${REVERSE_V15_CONFIG.armExpiryTicks}, rearmCooldownTicks=${REVERSE_V15_CONFIG.rearmCooldownTicks}`);

for (const zone of zones) {
  console.log(`\n${'='.repeat(58)}`);
  console.log(`ZONE: ${zone.name}`);
  console.log(`${'='.repeat(58)}`);

  const trainResults = TRAIN.map(f => simulateV15(f, zone.cfg));
  const testResults  = TEST.map(f  => simulateV15(f, zone.cfg));

  stats(trainResults, `TRAIN (#1-${TRAIN.length})`);
  stats(testResults,  `TEST  (#${TRAIN.length+1}-${fights.length})`);
}

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║    Done.                                             ║');
console.log('╚══════════════════════════════════════════════════════╝\n');
