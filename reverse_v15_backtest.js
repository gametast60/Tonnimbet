/**
 * reverse_v15_backtest.js
 * Node.js backtest for Strategy 5: Reverse Engine V15
 *
 * Usage: node reverse_v15_backtest.js
 *
 * Loads data.js via vm.createContext (same pattern as other backtests in this repo).
 * Requires reverse_v15_engine.js for all logic — no duplicate function definitions.
 */

'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

// ─── Load engine ─────────────────────────────────────────────────────────────
const ReverseV15Engine = require('./reverse_v15_engine.js');
const {
  REVERSE_V15_CONFIG,
  ratio,
  ticketAmounts,
  calculateHedge,
  stepReverseV15
} = ReverseV15Engine;

// ─── Load data.js ─────────────────────────────────────────────────────────────
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

// ─── simulateV15(fight, zone) ─────────────────────────────────────────────────
/**
 * Simulate V15 on a single fight for a given zone config.
 * Returns result object or null if fight does not qualify for this zone.
 *
 * Zone determines the entry mode (fav/dog) and the ratio range.
 * In backtest, entry = first valid tick whose entrySide matches zone.entryMode
 * AND whose ratio falls in [zone.min, zone.max].
 *
 * NO look-ahead: state is built tick-by-tick using stepReverseV15.
 */
function simulateV15(fight, zone) {
  const cfg = REVERSE_V15_CONFIG;

  // Filter to valid ticks only (isValid check per spec)
  const journey = (fight.journey || []).filter(p =>
    p.red  && p.red.isValid  !== false &&
    p.blue && p.blue.isValid !== false
  );

  if (journey.length < 2) return null;

  // Find entry tick: first tick whose entryMode corner ratio is in zone
  let entryTickIdx = -1;
  let entryCorner  = null;
  let entryOdds    = null;

  for (let i = 0; i < journey.length; i++) {
    const p = journey[i];
    // Check red corner as potential entry
    const redR  = ratio(p.red);
    const blueR = ratio(p.blue);

    if (zone.entryMode === 'fav') {
      // Look for fav entry: a > b (ratio = a/b), within zone range
      if (p.red.a > p.red.b && redR >= zone.min && redR <= zone.max) {
        entryTickIdx = i;
        entryCorner  = 'red';
        entryOdds    = p.red;
        break;
      }
      if (p.blue.a > p.blue.b && blueR >= zone.min && blueR <= zone.max) {
        entryTickIdx = i;
        entryCorner  = 'blue';
        entryOdds    = p.blue;
        break;
      }
    } else if (zone.entryMode === 'dog') {
      // Look for dog entry: b > a (ratio = b/a), within zone range
      if (p.red.b > p.red.a && redR >= zone.min && redR <= zone.max) {
        entryTickIdx = i;
        entryCorner  = 'red';
        entryOdds    = p.red;
        break;
      }
      if (p.blue.b > p.blue.a && blueR >= zone.min && blueR <= zone.max) {
        entryTickIdx = i;
        entryCorner  = 'blue';
        entryOdds    = p.blue;
        break;
      }
    }
  }

  if (entryTickIdx < 0) return null; // Fight doesn't qualify for this zone

  const hedgeCorner = entryCorner === 'red' ? 'blue' : 'red';
  const entrySide   = ReverseV15Engine.deriveSide(entryOdds.a, entryOdds.b);
  const entryRatioVal = ratio(entryOdds);

  // Initialise state at entry tick
  let state = {
    entryCorner,
    entrySide,
    entryOdds: { a: entryOdds.a, b: entryOdds.b },
    entryRatio: entryRatioVal,
    entryStake: cfg.stake,
    previousRatio: entryRatioVal,
    adverseFlags:  [],
    adverseCount:  0,
    armed: false, armIndex: null, armAge: 0,
    reversed: false,
    phase: 'WAIT'
  };

  // Process ticks AFTER entry (no look-ahead: only ticks entryTickIdx+1 onward)
  let tickDebug = [];
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

    if (state.phase === 'REVERSE_READY') {
      // Execute reverse at this tick
      state.reversed = true;
      state.phase    = 'REVERSED';
      break;
    }
    if (state.phase === 'EXPIRED') break;
  }

  // Outcome
  const winner = fight.winner; // 'red' | 'blue'
  let pnl = null;

  if (state.phase === 'REVERSED' && state.hedgePreview) {
    const h = state.hedgePreview;
    // Entry bet on entryCorner with cfg.stake
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
    entryOdds: entryOdds,
    entryRatio: parseFloat(entryRatioVal.toFixed(3)),
    phase:     state.phase,
    reversed:  state.phase === 'REVERSED',
    pnl,
    tickDebug
  };
}

// ─── stats(results) ───────────────────────────────────────────────────────────
function stats(results, label) {
  const total    = results.length;
  const entered  = results.filter(r => r !== null).length;
  const reversed = results.filter(r => r && r.reversed).length;
  const withPnL  = results.filter(r => r && r.pnl !== null);
  const wins     = withPnL.filter(r => r.pnl >= 0).length;
  const losses   = withPnL.filter(r => r.pnl < 0).length;
  const totalPnL = withPnL.reduce((s, r) => s + r.pnl, 0);
  const avgPnL   = withPnL.length > 0 ? totalPnL / withPnL.length : 0;
  const winRate  = withPnL.length > 0 ? (wins / withPnL.length * 100).toFixed(1) : 'N/A';

  console.log(`\n── ${label} ──────────────────────────`);
  console.log(`  Fights:   ${total}  |  Entered zone: ${entered}  |  Reversed: ${reversed}`);
  console.log(`  Win/Loss: ${wins}W / ${losses}L  |  WinRate: ${winRate}%`);
  console.log(`  Total PnL: ${totalPnL >= 0 ? '+' : ''}${totalPnL} B  |  Avg PnL/fight: ${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(0)} B`);
}

// ─── Run backtest ─────────────────────────────────────────────────────────────
const zones = [
  { name: 'fav_10_9_to_3_2', cfg: REVERSE_V15_CONFIG.zones.fav_10_9_to_3_2 },
  { name: 'dog_3_1_to_5_3',  cfg: REVERSE_V15_CONFIG.zones.dog_3_1_to_5_3  }
];

const TRAIN = fights.slice(0, 20);
const TEST  = fights.slice(20);

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║    Reverse Engine V15 — Backtest Results             ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log(`Config: stake=${REVERSE_V15_CONFIG.stake}, adverseToArm=${REVERSE_V15_CONFIG.adverseCountToArm}, pressureWindow=${REVERSE_V15_CONFIG.pressureWindow}, minAdverseShare=${REVERSE_V15_CONFIG.minAdverseShare}, minStreak=${REVERSE_V15_CONFIG.minStreak}, armExpiryTicks=${REVERSE_V15_CONFIG.armExpiryTicks}, hedgeMode=${REVERSE_V15_CONFIG.hedgeMode}, hedgeTarget=${REVERSE_V15_CONFIG.hedgeTarget}`);

for (const zone of zones) {
  console.log(`\n${'='.repeat(58)}`);
  console.log(`ZONE: ${zone.name}`);
  console.log(`${'='.repeat(58)}`);

  const trainResults = TRAIN.map(f => simulateV15(f, zone.cfg));
  const testResults  = TEST.map(f  => simulateV15(f, zone.cfg));

  stats(trainResults, `TRAIN (#1-${TRAIN.length})`);
  stats(testResults,  `TEST  (#${TRAIN.length+1}-${fights.length})`);

  // TEST details per fight
  if (testResults.length > 0) {
    console.log('\n  TEST DETAILS:');
    testResults.forEach((r, i) => {
      const idx    = TRAIN.length + i + 1;
      const fid    = r ? r.fightId : `fight_${idx}`;
      if (!r) {
        console.log(`  #${idx} [SKIP — no qualifying entry]  ${fid}`);
        return;
      }
      const pnlStr = r.pnl !== null ? (r.pnl >= 0 ? `+${r.pnl}` : `${r.pnl}`) + ' B' : 'N/A';
      const phaseStr = r.phase.padEnd(14);
      const cornerStr = `${r.entryCorner}(${r.entrySide}) @${r.entryOdds.a}:${r.entryOdds.b}`;
      const winnerStr = `winner=${r.winner}`;
      console.log(`  #${idx} ${phaseStr} ${pnlStr.padStart(8)}  entry=${cornerStr}  ${winnerStr}  ${fid}`);
    });
  }
}

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║    Done.                                             ║');
console.log('╚══════════════════════════════════════════════════════╝\n');
