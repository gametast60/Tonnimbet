/**
 * test_v15_bugfixes.js
 * Comprehensive unit test for V15 Bug Fixes (BUG 1, BUG 2, Dynamic Stake)
 */

const ReverseV15Engine = require('./reverse_v15_engine.js');
const { calculateHedge, stepReverseV15, REVERSE_V15_CONFIG, ticketAmounts } = ReverseV15Engine;

console.log('====================================================');
console.log('🧪 VERIFYING V15 BUG FIXES: TEST 1, TEST 2, TEST 3');
console.log('====================================================\n');

let allPassed = true;

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1 — Entry Odds must not change (BUG 1 Fix)
// Entry = Dog 3:1 (a:1, b:3), Current = Dog 5:3 (a:3, b:5), Hedge = Fav 5:2 (a:5, b:2)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST 1: Entry Odds must not change ---');
const entryOdds1 = { a: 1, b: 3 }; // Dog 3:1
const currentEntryOdds1 = { a: 3, b: 5 }; // Dog 5:3 (current odds of entry corner)
const currentHedgeOdds1 = { a: 5, b: 2 }; // Fav 5:2 (current odds of opposite corner)
const stake1 = 1000;

// Correct calculation using state.entryOdds (Dog 3:1):
const hedgeResCorrect = calculateHedge(entryOdds1, stake1, currentHedgeOdds1, REVERSE_V15_CONFIG);
// Incorrect calculation using currentEntryOdds (Dog 5:3):
const hedgeResWrong = calculateHedge(currentEntryOdds1, stake1, currentHedgeOdds1, REVERSE_V15_CONFIG);

console.log('Entry Ticket (Dog 3:1 @ 1000 B):  win = +', ticketAmounts(entryOdds1, stake1).win, 'B | risk = -', ticketAmounts(entryOdds1, stake1).risk, 'B');
console.log('Current Ticket (Dog 5:3 @ 1000 B): win = +', ticketAmounts(currentEntryOdds1, stake1).win, 'B | risk = -', ticketAmounts(currentEntryOdds1, stake1).risk, 'B');
console.log('Hedge Result using entryOdds (Dog 3:1):', { hedge: hedgeResCorrect.hedge, minFinal: hedgeResCorrect.minFinal, accepted: hedgeResCorrect.accepted });
console.log('Hedge Result using currentOdds (Dog 5:3):', { hedge: hedgeResWrong.hedge, minFinal: hedgeResWrong.minFinal, accepted: hedgeResWrong.accepted });

// Dog 3:1 entry (win=+3000, risk=-1000) with Hedge 1000 B @ Fav 5:2:
// finalIfEntryWins = 3000 - 1000 * 2.5 = 500 B
// finalIfEntryLoses = -1000 + 1000 = 0 B
// minFinal = 0 B (>= -0.5 B -> accepted = true)
if (hedgeResCorrect.minFinal === 0 && hedgeResCorrect.accepted === true && hedgeResWrong.minFinal !== hedgeResCorrect.minFinal) {
  console.log('✅ TEST 1 PASSED: Original entry odds (Dog 3:1) preserved in hedge calculation (minFinal = 0 B >= -0.5 B, accepted = true)!\n');
} else {
  console.error('❌ TEST 1 FAILED: Entry odds calculation mismatch!\n');
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2 — ARM tick cannot be READY on the same tick (BUG 2 Fix)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST 2: ARM tick cannot be REVERSE_READY on same tick ---');

let state2 = {
  entryCorner: 'red',
  entrySide: 'fav',
  entryOdds: { a: 2, b: 1 },
  entryRatio: 2.0,
  entryStake: 1000,
  previousRatio: 2.0,
  adverseFlags: [],
  adverseCount: 0,
  armed: false, armIndex: null, armAge: 0,
  reversed: false,
  phase: 'WAIT'
};

// 4 consecutive adverse ticks
const tick1 = stepReverseV15(state2, { a: 5, b: 2 }, { a: 2, b: 5 }, REVERSE_V15_CONFIG);
const tick2 = stepReverseV15(tick1,  { a: 3, b: 1 }, { a: 1, b: 3 }, REVERSE_V15_CONFIG);
const tick3 = stepReverseV15(tick2,  { a: 4, b: 1 }, { a: 1, b: 4 }, REVERSE_V15_CONFIG);
// Tick 4 triggers 4th adverse -> should ARM on this tick!
const tick4_arm = stepReverseV15(tick3, { a: 5, b: 1 }, { a: 1, b: 2 }, REVERSE_V15_CONFIG); // hedge odds 1:2

console.log('Tick 4 (ARM Tick):', {
  phase: tick4_arm.phase,
  armed: tick4_arm.armed,
  ticksSinceArm: tick4_arm.armAge,
  decision: tick4_arm.debugInfo.decision,
  hedgePreview: tick4_arm.hedgePreview
});

let test2Sub1Passed = (tick4_arm.phase === 'ARMED' && tick4_arm.debugInfo.decision === 'WAIT' && tick4_arm.armAge === 0 && tick4_arm.hedgePreview === null);

// Tick 5 (1 tick after ARM) -> Hedge Window evaluated!
const tick5_window = stepReverseV15(tick4_arm, { a: 2, b: 1 }, { a: 1, b: 2 }, REVERSE_V15_CONFIG);

console.log('Tick 5 (1 Tick After ARM):', {
  phase: tick5_window.phase,
  armed: tick5_window.armed,
  ticksSinceArm: tick5_window.armAge,
  decision: tick5_window.debugInfo.decision,
  hedgeStake: tick5_window.hedgePreview ? tick5_window.hedgePreview.hedge : null
});

let test2Sub2Passed = (tick5_window.phase === 'REVERSE_READY' && tick5_window.armAge === 1);

if (test2Sub1Passed && test2Sub2Passed) {
  console.log('✅ TEST 2 PASSED: ARM tick stayed ARMED (WAIT 1 tick), and REVERSE_READY occurred on Tick X+1!\n');
} else {
  console.error('❌ TEST 2 FAILED: ARM tick allowed immediate REVERSE_READY on same tick!\n');
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3 — Dynamic Stake (Entry Stake 500 vs 1500)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST 3: Dynamic Stake (500 B vs 1500 B) ---');

const entryOdds3 = { a: 1, b: 3 }; // Dog 3:1
const hedgeOdds3 = { a: 5, b: 2 }; // Fav 5/2

const hedgeStake500  = calculateHedge(entryOdds3, 500,  hedgeOdds3, REVERSE_V15_CONFIG);
const hedgeStake1500 = calculateHedge(entryOdds3, 1500, hedgeOdds3, REVERSE_V15_CONFIG);

console.log('Entry Stake = 500 B:  Hedge Stake =', hedgeStake500.hedge,  'B | Max Cap = 500 B | MinFinal =', hedgeStake500.minFinal, 'B');
console.log('Entry Stake = 1500 B: Hedge Stake =', hedgeStake1500.hedge, 'B | Max Cap = 1500 B | MinFinal =', hedgeStake1500.minFinal, 'B');

if (hedgeStake500.hedge === 500 && hedgeStake1500.hedge === 1500 && hedgeStake500.accepted && hedgeStake1500.accepted) {
  console.log('✅ TEST 3 PASSED: Hedge calculation and max hedge cap change dynamically with Entry Stake!\n');
} else {
  console.error('❌ TEST 3 FAILED: Entry stake was hardcoded or ignored!\n');
  allPassed = false;
}

console.log('====================================================');
if (allPassed) {
  console.log('🎉 ALL 3 BUG FIX TESTS PASSED SUCCESSFULLY!');
} else {
  console.log('❌ SOME TESTS FAILED.');
  process.exit(1);
}
console.log('====================================================');
