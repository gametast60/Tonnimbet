/**
 * test_v15_1_suite.js
 * Comprehensive automated test suite for V15.1 Persistent Hedge Window Lifecycle
 * Tests: Test A, Test B, Test C, Test D, Test E
 */

const ReverseV15Engine = require('./reverse_v15_engine.js');
const { stepReverseV15, REVERSE_V15_CONFIG } = ReverseV15Engine;

console.log('====================================================');
console.log('🧪 VERIFYING V15.1 PERSISTENT HEDGE WINDOW LIFECYCLE');
console.log('====================================================\n');

let allPassed = true;

function createInitState() {
  return {
    entryCorner: 'red',
    entrySide: 'fav',
    entryOdds: { a: 2, b: 1 },
    entryRatio: 2.0,
    entryStake: 1000,
    previousRatio: 2.0,
    adverseFlags: [],
    adverseCount: 0,
    armed: false, armIndex: null, armAge: 0, armCycle: 1, cooldownRemaining: 0,
    reversed: false,
    phase: 'WAIT'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST A — Expired then back to WAIT
// ARM -> 3 ticks no hedge -> EXPIRED -> WAIT (engine continues monitoring)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST A: Expired then back to WAIT ---');
let sA = createInitState();
sA = stepReverseV15(sA, { a: 5, b: 2 }, { a: 2, b: 5 }, REVERSE_V15_CONFIG);
sA = stepReverseV15(sA, { a: 3, b: 1 }, { a: 1, b: 3 }, REVERSE_V15_CONFIG);
sA = stepReverseV15(sA, { a: 4, b: 1 }, { a: 1, b: 4 }, REVERSE_V15_CONFIG);
// Tick 4 -> ARM #1 (no feasible hedge odds)
sA = stepReverseV15(sA, { a: 5, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG); // ARM tick (age=0)
// Ticks 5-7 (age = 1, 2, 3)
sA = stepReverseV15(sA, { a: 5, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG); // age 1
sA = stepReverseV15(sA, { a: 5, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG); // age 2
sA = stepReverseV15(sA, { a: 5, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG); // age 3
// Tick 8 -> age 4 > 3 -> EXPIRED!
sA = stepReverseV15(sA, { a: 5, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG);

console.log('Tick 8 (Expiry): phase =', sA.phase, '| cooldown =', sA.cooldownRemaining, '| next cycle =', sA.armCycle);

// Tick 9 -> EXPIRED transitions to WAIT (cooldown decrements 2 -> 1)
sA = stepReverseV15(sA, { a: 6, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG);
console.log('Tick 9 (After Expiry): phase =', sA.phase, '| cooldown =', sA.cooldownRemaining, '| decision =', sA.debugInfo.decision);

if (sA.phase === 'WAIT' && sA.cooldownRemaining === 1 && !sA.reversed) {
  console.log('✅ TEST A PASSED: EXPIRED cycle transitioned to WAIT with cooldown, engine kept monitoring!\n');
} else {
  console.error('❌ TEST A FAILED: Engine stopped or failed to transition to WAIT!\n');
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST B — Re-ARM (Cycle #1 EXPIRED -> Cooldown -> Cycle #2 ARMED)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST B: Re-ARM ---');
let sB = sA; // Continue from Test A state (cooldown = 1)
// Tick 10 -> cooldown decrements 1 -> 0 (adverse move 7:1)
sB = stepReverseV15(sB, { a: 7, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG);
console.log('Tick 10: phase =', sB.phase, '| cooldown =', sB.cooldownRemaining);

// Tick 11 -> Cooldown is 0, adverse move 8:1 -> Re-ARM (Cycle #2)!
sB = stepReverseV15(sB, { a: 8, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG);
console.log('Tick 11 (Re-ARM): phase =', sB.phase, '| armCycle =', sB.armCycle, '| armed =', sB.armed);

if (sB.phase === 'ARMED' && sB.armCycle === 2 && sB.armed) {
  console.log('✅ TEST B PASSED: Cycle #1 EXPIRED -> Cooldown -> Re-ARM Cycle #2 successful!\n');
} else {
  console.error('❌ TEST B FAILED: Re-ARM failed!\n');
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST C — Missed READY (User didn't click)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST C: Missed READY ---');
let sC = createInitState();
sC = stepReverseV15(sC, { a: 5, b: 2 }, { a: 2, b: 5 }, REVERSE_V15_CONFIG);
sC = stepReverseV15(sC, { a: 3, b: 1 }, { a: 1, b: 3 }, REVERSE_V15_CONFIG);
sC = stepReverseV15(sC, { a: 4, b: 1 }, { a: 1, b: 4 }, REVERSE_V15_CONFIG);
sC = stepReverseV15(sC, { a: 5, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG); // ARM #1 (Tick 4)
// Tick 5 -> Price returned to 2:1 -> REVERSE_READY!
sC = stepReverseV15(sC, { a: 2, b: 1 }, { a: 1, b: 2 }, REVERSE_V15_CONFIG);
console.log('Tick 5 (READY): phase =', sC.phase, '| decision =', sC.debugInfo.decision);

// User doesn't click, price shifts on Tick 6 to 1:1 -> Hedge no longer feasible!
sC = stepReverseV15(sC, { a: 5, b: 1 }, { a: 1, b: 1 }, REVERSE_V15_CONFIG);
console.log('Tick 6 (Price Moved Away): phase =', sC.phase, '| decision =', sC.debugInfo.decision);

if (sC.phase === 'ARMED' && sC.debugInfo.decision === 'HEDGE_WINDOW_CLOSED' && !sC.reversed) {
  console.log('✅ TEST C PASSED: Missed ready transitioned to ARMED (HEDGE_WINDOW_CLOSED) and kept monitoring!\n');
} else {
  console.error('❌ TEST C FAILED: State miscalculated on missed ready!\n');
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST D — READY returns again
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST D: READY returns again ---');
let sD = sC; // Continue from Test C state (ARMED, age=2)
// Tick 7 -> Price returns to 2:1 -> Hedge feasible again (age=3 <= 3)!
sD = stepReverseV15(sD, { a: 2, b: 1 }, { a: 1, b: 2 }, REVERSE_V15_CONFIG);
console.log('Tick 7 (Price Returned): phase =', sD.phase, '| decision =', sD.debugInfo.decision, '| hedgeStake =', sD.hedgePreview ? sD.hedgePreview.hedge : null);

if (sD.phase === 'REVERSE_READY' && sD.hedgePreview && sD.hedgePreview.accepted) {
  console.log('✅ TEST D PASSED: READY returned again when price entered Hedge Window!\n');
} else {
  console.error('❌ TEST D FAILED: READY failed to return!\n');
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST E — Reverse then STOP
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TEST E: Reverse then STOP ---');
let sE = Object.assign({}, sD, { phase: 'REVERSED', reversed: true });
console.log('User clicked Reverse: phase =', sE.phase, '| reversed =', sE.reversed);

// Ticks 8-10 after Reverse
const sE_next1 = stepReverseV15(sE, { a: 5, b: 1 }, { a: 1, b: 2 }, REVERSE_V15_CONFIG);
const sE_next2 = stepReverseV15(sE_next1, { a: 10, b: 1 }, { a: 1, b: 2 }, REVERSE_V15_CONFIG);

console.log('Subsequent Tick after REVERSED: phase =', sE_next2.phase, '| reversed =', sE_next2.reversed);

if (sE_next2.phase === 'REVERSED' && sE_next2.reversed === true) {
  console.log('✅ TEST E PASSED: Terminal state REVERSED locked, no further Re-ARM or Reverse!\n');
} else {
  console.error('❌ TEST E FAILED: State changed after REVERSED!\n');
  allPassed = false;
}

console.log('====================================================');
if (allPassed) {
  console.log('🎉 ALL 5 V15.1 LIFECYCLE TESTS (A, B, C, D, E) PASSED!');
} else {
  console.log('❌ SOME TESTS FAILED.');
  process.exit(1);
}
console.log('====================================================');
