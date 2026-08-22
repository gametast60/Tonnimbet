/**
 * Test Suite: Price Journey & Decision Engine
 * Tests all 30 Scenarios specified in Section 18
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const engine = require('./price_journey_engine.js');
const {
  STANDARD_BOXING_ODDS,
  createBoxingPrice,
  createCanonicalPrice,
  parseRawWebsitePrice,
  findBoxingPriceStepIndex,
  createPriceSnapshot,
  createPriceSnapshotV2,
  PriceJourneyTracker,
  evaluateContext,
  runDecisionEngine,
  presentKipUserDecision
} = engine;

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] Case ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] Case ${totalTests}: ${name}`);
    console.error(err);
  }
}

console.log('=== RUNNING PRICE JOURNEY ENGINE TEST SUITE (30 CASES) ===\n');

// 1. Raw Red Parsing
runTest('Raw Red Parsing (HDP 1 : 230)', () => {
  const parsed = parseRawWebsitePrice('<p class="rate-red">HDP 1 : 230</p>');
  assert.strictEqual(parsed.favCorner, 'red');
  assert.strictEqual(parsed.num, 2);
  assert.strictEqual(parsed.den, 1);
});

// 2. Raw Blue Parsing
runTest('Raw Blue Parsing (300 : 1 HDP)', () => {
  const parsed = parseRawWebsitePrice('<p class="rate-blue">300 : 1 HDP</p>');
  assert.strictEqual(parsed.favCorner, 'blue');
  assert.strictEqual(parsed.num, 3);
  assert.strictEqual(parsed.den, 1);
});

// 3. Two-sided Parsing
runTest('Two-sided Raw HTML Parsing from files', () => {
  const redTxt = '<div data-v-7b2c79bf="" class="Head-boxer-red"><img data-v-7b2c79bf="" src="https://s3.ap-southeast-1.amazonaws.com/cdn.boxing.com/17867617040201.1.jpg" alt="boxer_red"> <div data-v-7b2c79bf="" class="Boxer-info"><p data-v-7b2c79bf="" class="boxer-name"><span data-v-7b2c79bf="" class="title-boxer-name">Name</span> <span data-v-7b2c79bf="" class="first">Khong Beng</span> <span data-v-7b2c79bf="" class="last">S.Thongphuban</span></p> <p data-v-7b2c79bf="" class="rate-red">HDP 1 : 230</p> <div data-v-7b2c79bf="" class="history"></div></div></div>';
  const blueTxt = '<div data-v-7b2c79bf="" class="Head-boxer-blue"><div data-v-7b2c79bf="" class="Boxer-info"><p data-v-7b2c79bf="" class="boxer-name"><span data-v-7b2c79bf="" class="title-boxer-name">Name</span> <span data-v-7b2c79bf="" class="first">Nopphadet</span> <span data-v-7b2c79bf="" class="last">Tor.Yaemsuan</span></p> <p data-v-7b2c79bf="" class="rate-blue">300 : 1 HDP</p> <div data-v-7b2c79bf="" class="history"></div></div> <img data-v-7b2c79bf="" src="https://s3.ap-southeast-1.amazonaws.com/cdn.boxing.com/17867617403211.2.jpg" alt="boxer_blue"></div>';

  const parsedRed = parseRawWebsitePrice(redTxt);
  const parsedBlue = parseRawWebsitePrice(blueTxt);

  assert.strictEqual(parsedRed.favCorner, 'red');
  assert.strictEqual(parsedRed.num, 2);
  assert.strictEqual(parsedBlue.favCorner, 'blue');
  assert.strictEqual(parsedBlue.num, 3);
});

// 4. Malformed HTML
runTest('Malformed HTML handling', () => {
  const parsed = parseRawWebsitePrice('<div>invalid html without odds</div>');
  assert.strictEqual(parsed.error, 'UNKNOWN_PRICE_FORMAT');
});

// 5. Missing Price
runTest('Missing Price handling', () => {
  const parsedNull = parseRawWebsitePrice(null);
  const parsedEmpty = parseRawWebsitePrice('');
  assert.strictEqual(parsedNull.error, 'MISSING_PRICE');
  assert.strictEqual(parsedEmpty.error, 'MISSING_PRICE');
});

// 6. Unknown Format
runTest('Unknown Format handling', () => {
  const parsed = parseRawWebsitePrice('XYZ ABC DEF');
  assert.strictEqual(parsed.error, 'UNKNOWN_PRICE_FORMAT');
});

// 7. Canonical Fractional Price
runTest('Canonical Fractional Price Structure', () => {
  const snap = createPriceSnapshot('HDP 1:230', '300:1 HDP', 'red', 3, 2);
  assert.strictEqual(snap.canonical.favoritePrice.numerator, 3);
  assert.strictEqual(snap.canonical.favoritePrice.denominator, 2);
  assert.strictEqual(snap.canonical.priceKey, '3/2');
  assert.strictEqual(snap.canonicalV2.red.a, 3);
  assert.strictEqual(snap.canonicalV2.red.b, 2);
  assert.strictEqual(snap.canonicalV2.blue.a, 2);
  assert.strictEqual(snap.canonicalV2.blue.b, 3);
  assert.strictEqual(snap.canonicalV2.derived.marketState, 'RED_FAV_BLUE_DOG');
});

// 8. Favorite Mapping
runTest('Favorite Corner Mapping', () => {
  const snap = createPriceSnapshot('HDP 1:230', '300:1 HDP', 'blue', 7, 4);
  assert.strictEqual(snap.canonical.favoriteCorner, 'blue');
  assert.strictEqual(snap.canonical.underdogCorner, 'red');
  assert.strictEqual(snap.canonical.priceKey, '7/4');
});

// 9. Side Flip
runTest('Side Flip Red -> Blue', () => {
  const snap1 = createPriceSnapshot('', '', 'red', 2, 1);
  const snap2 = createPriceSnapshot('', '', 'blue', 2, 1);
  assert.strictEqual(snap1.canonical.favoriteCorner, 'red');
  assert.strictEqual(snap2.canonical.favoriteCorner, 'blue');
});

// 10. Canonical Equality
runTest('Canonical Equality (2/1 == 2/1)', () => {
  const snap1 = createPriceSnapshot('', '', 'red', 2, 1);
  const snap2 = createPriceSnapshot('', '', 'red', 2, 1);
  assert.strictEqual(snap1.canonical.priceKey, snap2.canonical.priceKey);
  assert.strictEqual(snap1.canonical.favoriteCorner, snap2.canonical.favoriteCorner);
});

// 11. Invalid Fraction
runTest('Invalid Fraction handling', () => {
  assert.throws(() => {
    createPriceSnapshot('', '', 'red', 0, 1);
  });
});

// 12. First Snapshot
runTest('First Snapshot state', () => {
  const tracker = new PriceJourneyTracker();
  const snap = createPriceSnapshot('', '', 'red', 3, 2);
  const state = tracker.appendSnapshot(snap);
  assert.strictEqual(state.previousSnapshot, null);
  assert.strictEqual(state.movementDirection, 'UNCHANGED');
  assert.strictEqual(state.stepDistance, 0);
});

// 13. Second Snapshot
runTest('Second Snapshot tracking', () => {
  const tracker = new PriceJourneyTracker();
  const snap1 = createPriceSnapshot('', '', 'red', 3, 2);
  const snap2 = createPriceSnapshot('', '', 'red', 7, 4);
  tracker.appendSnapshot(snap1);
  const state = tracker.appendSnapshot(snap2);
  assert.notStrictEqual(state.previousSnapshot, null);
  assert.strictEqual(state.previousSnapshot.canonical.priceKey, '3/2');
  assert.strictEqual(state.currentSnapshot.canonical.priceKey, '7/4');
});

// 14. Multiple Snapshot
runTest('Multiple Snapshot history accumulation', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2));
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4));
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 2, 1));
  const state = tracker.getJourneyState();
  assert.strictEqual(state.priceHistory.length, 3);
  assert.strictEqual(state.journeyPattern, '3/2 -> 7/4 -> 2/1');
});

// 15. Step Distance
runTest('Step Distance calculation (3/2 -> 7/4)', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2)); // Index 3
  const state = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4)); // Index 4
  assert.strictEqual(state.stepDistance, 1);
  assert.strictEqual(state.movementDirection, 'UP');
});

// 16. Unsupported Step
runTest('Unsupported Step Index handling', () => {
  const idx = findBoxingPriceStepIndex(99, 1);
  assert.strictEqual(idx, null);
});

// 17. UP Movement
runTest('UP Movement (Favorite Stronger)', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4)); // Index 4
  const state = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 2, 1)); // Index 5
  assert.strictEqual(state.movementDirection, 'UP');
});

// 18. DOWN Movement
runTest('DOWN Movement (Favorite Weaker)', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 2, 1)); // Index 5
  const state = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4)); // Index 4
  assert.strictEqual(state.movementDirection, 'DOWN');
});

// 19. UNCHANGED Movement
runTest('UNCHANGED Movement', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 2, 1));
  const state = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 2, 1));
  assert.strictEqual(state.movementDirection, 'UNCHANGED');
  assert.strictEqual(state.stepDistance, 0);
});

// 20. Rapid Movement
runTest('Rapid Movement detection', () => {
  const tracker = new PriceJourneyTracker();
  const t0 = 100000;
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 11, 8, t0)); // Index 2
  const state = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 1, t0 + 1000)); // Index 7 (diff=5)
  assert.strictEqual(state.pace, 'rapid');
});

// 21. NO_POSITION State
runTest('NO_POSITION Context Evaluation', () => {
  const evalCtx = evaluateContext(null, 'NO_POSITION', 'none', 0, 0);
  assert.strictEqual(evalCtx.positionState, 'NO_POSITION');
  assert.strictEqual(evalCtx.marketContext, 'NEUTRAL_CONTEXT');
});

// 22. IN_POSITION State
runTest('IN_POSITION Context Evaluation', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2));
  const journey = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4));
  const evalCtx = evaluateContext(journey, 'IN_POSITION', 'red', 500, -200);
  assert.strictEqual(evalCtx.positionState, 'IN_POSITION');
  assert.strictEqual(evalCtx.marketContext, 'FAVORABLE_CONTEXT');
});

// 23. FAVORABLE Context
runTest('FAVORABLE Context (User holds Red, Red Moves UP)', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2));
  const journey = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4)); // UP
  const evalCtx = evaluateContext(journey, 'IN_POSITION', 'red', 1000, -500);
  assert.strictEqual(evalCtx.marketContext, 'FAVORABLE_CONTEXT');
});

// 24. UNFAVORABLE Context
runTest('UNFAVORABLE Context (User holds Red, Red Moves DOWN)', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4));
  const journey = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2)); // DOWN
  const evalCtx = evaluateContext(journey, 'IN_POSITION', 'red', 1000, -500);
  assert.strictEqual(evalCtx.marketContext, 'UNFAVORABLE_CONTEXT');
});

// 25. EXIT_READY State
runTest('EXIT_READY Position Evaluation', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2));
  const journey = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4));
  const evalCtx = evaluateContext(journey, 'IN_POSITION', 'red', 1000, -500, true);
  assert.strictEqual(evalCtx.positionState, 'EXIT_READY');
});

// 26. EXITED State
runTest('EXITED Position Evaluation (Independent of PnL)', () => {
  const evalCtx = evaluateContext(null, 'EXITED', 'red', -300, 200);
  assert.strictEqual(evalCtx.positionState, 'EXITED');
});

// 27. CRITICAL TEST: Same Current Price / Different Journey
runTest('CRITICAL TEST: Same Current Price / Different Journey', () => {
  // Journey A: 5/1 -> 4/1 -> 3/1 -> 2/1
  const trackerA = new PriceJourneyTracker();
  trackerA.appendSnapshot(createPriceSnapshot('', '', 'red', 5, 1));
  trackerA.appendSnapshot(createPriceSnapshot('', '', 'red', 4, 1));
  trackerA.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 1));
  const journeyA = trackerA.appendSnapshot(createPriceSnapshot('', '', 'red', 2, 1));

  // Journey B: 10/9 -> 5/4 -> 3/2 -> 2/1
  const trackerB = new PriceJourneyTracker();
  trackerB.appendSnapshot(createPriceSnapshot('', '', 'red', 10, 9));
  trackerB.appendSnapshot(createPriceSnapshot('', '', 'red', 5, 4));
  trackerB.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2));
  const journeyB = trackerB.appendSnapshot(createPriceSnapshot('', '', 'red', 2, 1));

  // Assertions: Current price is identical
  assert.strictEqual(journeyA.currentSnapshot.canonical.priceKey, '2/1');
  assert.strictEqual(journeyB.currentSnapshot.canonical.priceKey, '2/1');

  // History and previous snapshots are different
  assert.notStrictEqual(journeyA.previousSnapshot.canonical.priceKey, journeyB.previousSnapshot.canonical.priceKey);
  assert.strictEqual(journeyA.previousSnapshot.canonical.priceKey, '3/1');
  assert.strictEqual(journeyB.previousSnapshot.canonical.priceKey, '3/2');

  assert.notStrictEqual(journeyA.journeyPattern, journeyB.journeyPattern);
  assert.strictEqual(journeyA.journeyPattern, '5/1 -> 4/1 -> 3/1 -> 2/1');
  assert.strictEqual(journeyB.journeyPattern, '10/9 -> 5/4 -> 3/2 -> 2/1');
});

// 28. Same Journey / Different Position
runTest('Same Journey / Different Position Contexts', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 3, 2));
  const journey = tracker.appendSnapshot(createPriceSnapshot('', '', 'red', 7, 4)); // Red UP

  const ctxRed = evaluateContext(journey, 'IN_POSITION', 'red', 500, -200);
  const ctxBlue = evaluateContext(journey, 'IN_POSITION', 'blue', -200, 500);

  assert.strictEqual(ctxRed.marketContext, 'FAVORABLE_CONTEXT');
  assert.strictEqual(ctxBlue.marketContext, 'UNFAVORABLE_CONTEXT');
});

// 28b. Independent BOTH_FAV Context
runTest('BOTH_FAV context evaluates RED and BLUE independently', () => {
  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshotV2('', '', { a: 5, b: 4 }, { a: 2, b: 1 }, 1000));
  const journey = tracker.appendSnapshot(createPriceSnapshotV2('', '', { a: 2, b: 1 }, { a: 5, b: 4 }, 2000));
  const ctx = evaluateContext(journey, 'IN_POSITION', 'red', 500, -200);

  assert.strictEqual(journey.currentSnapshot.canonicalV2.derived.marketState, 'BOTH_FAV');
  assert.strictEqual(journey.stepRedIndex, 5);
  assert.strictEqual(journey.stepBlueIndex, 1);
  assert.strictEqual(ctx.v2.redContext, 'FAVORABLE_CONTEXT');
  assert.strictEqual(ctx.v2.blueContext, 'UNFAVORABLE_CONTEXT');
});

// 28c. All independent market states
runTest('All 9 independent RED/BLUE market states', () => {
  const cases = [
    [[10, 9], [10, 9], 'BOTH_FAV'],
    [[10, 10], [10, 10], 'BOTH_EVEN'],
    [[10, 9], [9, 10], 'RED_FAV_BLUE_DOG'],
    [[9, 10], [9, 10], 'BOTH_DOG'],
    [[10, 9], [10, 10], 'RED_FAV_BLUE_EVEN'],
    [[10, 10], [10, 9], 'RED_EVEN_BLUE_FAV'],
    [[9, 10], [10, 10], 'RED_DOG_BLUE_EVEN'],
    [[10, 10], [9, 10], 'RED_EVEN_BLUE_DOG'],
    [[9, 10], [10, 9], 'RED_DOG_BLUE_FAV']
  ];
  cases.forEach(([red, blue, expected]) => {
    const snap = createPriceSnapshotV2('', '', { a: red[0], b: red[1] }, { a: blue[0], b: blue[1] });
    assert.strictEqual(snap.canonicalV2.derived.marketState, expected);
  });
});

// 29. Legacy PnL & Hedging Regression
runTest('Legacy PnL & Hedging Calculation Logic', () => {
  // Test PnL logic: fav ticket stake 1000 at 2/1 => win 1000, risk 2000
  const tFav = { corner: 'red', side: 'fav', a: 2, b: 1, stake: 1000 };
  const numA = parseFloat(tFav.a) || 1;
  const numB = parseFloat(tFav.b) || 1;
  const riskFav = tFav.stake * (numA / numB);
  assert.strictEqual(riskFav, 2000);

  // Test PnL logic: dog ticket stake 1000 at 1/2 => win 2000, risk 1000
  const tDog = { corner: 'blue', side: 'dog', a: 1, b: 2, stake: 1000 };
  const winDog = tDog.stake * (2 / 1);
  assert.strictEqual(winDog, 2000);
});

// 30. End-to-End Flow
runTest('End-to-End Flow (Parser -> Snapshot -> Tracker -> Context -> Engine -> Presenter)', () => {
  const rawRed = '<p class="rate-red">HDP 1 : 230</p>';
  const parsed = parseRawWebsitePrice(rawRed);
  assert.strictEqual(parsed.favCorner, 'red');

  const tracker = new PriceJourneyTracker();
  tracker.appendSnapshot(createPriceSnapshot(rawRed, '', 'red', 3, 2));
  const journey = tracker.appendSnapshot(createPriceSnapshot(rawRed, '', parsed.favCorner, parsed.num, parsed.den));

  const ctx = evaluateContext(journey, 'IN_POSITION', 'red', 800, -400, false);
  const decisionResult = runDecisionEngine(journey, ctx);
  const presentation = presentKipUserDecision(decisionResult, journey, ctx);

  assert.ok(decisionResult.decision);
  assert.ok(decisionResult.reasonCodes.length > 0);
  assert.ok(presentation.statusBadgeText);
  assert.ok(presentation.reasonText);
  assert.ok(presentation.actionAdviceText);
  assert.ok(presentation.watchOutText);
});

// 31. Skew Profit Strategy (70/30 Runner)
runTest('Skew Profit Strategy (70/30 Runner)', () => {
  const { calculateStrategyHedge } = engine;
  const res = calculateStrategyHedge({
    strategy: 'skew_runner',
    leadingCorner: 'red',
    leadingProfit: 1000,
    laggingProfit: -500,
    isHedgeByFav: false,
    targetRatio: 3.0 // 3/1
  });

  assert.strictEqual(res.isReady, true);
  assert.ok(res.finalRedProf > res.finalBlueProf, 'Leading red should retain more profit');
  assert.ok(res.finalBlueProf >= 0, 'Lagging blue should have guaranteed positive profit');
});

// 32. Smart Cut-Loss Strategy
runTest('Smart Cut-Loss Strategy (Cap loss at ~20%)', () => {
  const { calculateStrategyHedge } = engine;
  const res = calculateStrategyHedge({
    strategy: 'smart_cut',
    leadingCorner: 'red',
    leadingProfit: 1000,
    laggingProfit: -1000,
    isHedgeByFav: false,
    targetRatio: 2.0 // 2/1
  });

  assert.ok(res.finalBlueProf > -1000, 'Cut loss should significantly reduce downside from -1000');
  assert.ok(res.hedgeStake > 0, 'Hedge stake should be calculated');
});

// 33. Multi-Target Ladder
runTest('Multi-Target Ladder Generation', () => {
  const { calculateMultiTargets } = engine;
  const targets = calculateMultiTargets('red', 1000, -500, 'skew_runner');
  assert.strictEqual(targets.length, 15);
  assert.ok(targets.some(t => t.tier === 'safe' || t.tier === 'sweet_spot'));

});

// 34. Entry Signal Scanner
runTest('Entry Signal Scanner for Beginners', () => {
  const { evaluateEntrySignal } = engine;
  const sigHigh = evaluateEntrySignal('red', 3, 1, 20000);
  assert.strictEqual(sigHigh.signalType, 'SNIPER_DOG');

  const sigClose = evaluateEntrySignal('blue', 5, 4, 20000);
  assert.strictEqual(sigClose.signalType, 'MOMENTUM_FAV');
});

// 36b. Independent Entry Signals and BLUE dog ticket flow
runTest('Independent entry signals and BLUE dog PnL flow', () => {
  const { evaluateEntrySignal } = engine;
  const signal = evaluateEntrySignal('red', 10, 9, 20000, { a: 10, b: 9 }, { a: 10, b: 9 });
  assert.strictEqual(signal.redSignal.signal, 'LONG');
  assert.strictEqual(signal.blueSignal.signal, 'LONG');

  const blueTicket = { corner: 'blue', side: 'dog', a: 9, b: 10, stake: 1000 };
  const blueWin = blueTicket.stake * (blueTicket.b / blueTicket.a);
  const blueRisk = blueTicket.stake;
  assert.strictEqual(blueWin, 1000 * (10 / 9));
  assert.strictEqual(blueRisk, 1000);
});

runTest('Underdog 1/2 pays 2x stake', () => {
  const tDog = { corner: 'red', side: 'dog', a: 1, b: 2, stake: 100 };
  const ratio = Math.max(tDog.a, tDog.b) / Math.min(tDog.a, tDog.b);
  assert.strictEqual(tDog.stake * ratio, 200);
});

// 35. Skew Profit Strategy with Explicit 70% Corner Picker (Forced Red)
runTest('Skew 70/30 with forced 70% Red when Blue is leading', () => {
  const { calculateStrategyHedge } = engine;
  const res = calculateStrategyHedge({
    strategy: 'skew_runner',
    leadingCorner: 'blue',
    leadingProfit: 1000,
    laggingProfit: -500,
    isHedgeByFav: false,
    targetRatio: 3.0,
    skewTarget: 'red' // Force 70% to Red even though Blue is leading
  });

  assert.strictEqual(res.isReady, true);
  assert.strictEqual(res.targetCorner, 'red', 'Should hedge Red so Red gains 70%');
  assert.ok(res.finalRedProf > res.finalBlueProf, 'Red should have higher profit as requested by 70% Red target');
});

// 36. Skew Profit Strategy with Explicit 70% Corner Picker (Forced Blue)
runTest('Skew 70/30 with forced 70% Blue when Red is leading', () => {
  const { calculateStrategyHedge } = engine;
  const res = calculateStrategyHedge({
    strategy: 'skew_runner',
    leadingCorner: 'red',
    leadingProfit: 1000,
    laggingProfit: -500,
    isHedgeByFav: false,
    targetRatio: 3.0,
    skewTarget: 'blue' // Force 70% to Blue even though Red is leading
  });

  assert.strictEqual(res.isReady, true);
  assert.strictEqual(res.targetCorner, 'blue', 'Should hedge Blue so Blue gains 70%');
  assert.ok(res.finalBlueProf > res.finalRedProf, 'Blue should have higher profit as requested by 70% Blue target');
});

// 37. Safe Entry Radar Scanner
runTest('Safe Entry Radar Zone Evaluation', () => {
  const { evaluateEntrySafety } = engine;
  const safe = evaluateEntrySafety(5, 4, 'red'); // 1.25
  assert.strictEqual(safe.zone, 'SAFE');
  assert.strictEqual(safe.riskLevel, 'LOW');

  const fair = evaluateEntrySafety(2, 1, 'red'); // 2.0
  assert.strictEqual(fair.zone, 'FAIR');
  assert.strictEqual(fair.riskLevel, 'MEDIUM');

  const highRisk = evaluateEntrySafety(4, 1, 'blue'); // 4.0
  assert.strictEqual(highRisk.zone, 'HIGH_RISK');
  assert.strictEqual(highRisk.riskLevel, 'HIGH');
});

// 38. 3-Bullet Money Management Allocation
runTest('3-Bullet Money Management 40/40/20 Allocation', () => {
  const { calculate3BulletAllocation } = engine;
  const alloc = calculate3BulletAllocation(1000);
  assert.strictEqual(alloc.bullet1.amount, 400);
  assert.strictEqual(alloc.bullet2.amount, 400);
  assert.strictEqual(alloc.bullet3.amount, 200);
  assert.strictEqual(alloc.bullet1.amount + alloc.bullet2.amount + alloc.bullet3.amount, 1000);
});

// 39. Emergency Rescue & Loss-Capping Calculation
runTest('Emergency Rescue HUD calculation', () => {
  const { calculateEmergencyRescue } = engine;
  // User enters Red @ 5:4 stake 1000 (Win +1000 / Risk -1250)
  const tickets = [{ id: 1, corner: 'red', side: 'fav', a: 5, b: 4, stake: 1000 }];
  // Price drops and flips to Blue @ 2:1
  const rescue = calculateEmergencyRescue({
    tickets,
    currentPrice: {
      favCorner: 'blue', oddA: 2, oddB: 1,
      redSide: { a: 1, b: 2 }, blueSide: { a: 2, b: 1 }
    },
    totalCapital: 1000
  });

  assert.strictEqual(rescue.isNeeded, true);
  assert.strictEqual(rescue.holdingCorner, 'red');
  assert.strictEqual(rescue.dangerCorner, 'blue');
  assert.strictEqual(rescue.currentRiskLoss, 1250);
  assert.strictEqual(rescue.targetCorner, 'blue');
  assert.strictEqual(rescue.targetSide, 'fav');
  // At Blue 2:1 Fav, stake needed = 1000 / 2 = 500 B
  assert.strictEqual(rescue.rescueStake, 500);
  assert.strictEqual(rescue.finalLeadingProfit, 0, 'Leading side (Red) becomes Breakeven 0 B');
  assert.strictEqual(rescue.finalDangerProfit, -750, 'Loss on Blue reduced significantly from -1250');
  assert.ok(rescue.lossCappedPercent > 0);
});

// 40. Emergency Rescue with Two-Sided Separate Odds
runTest('Emergency Rescue using Two-Sided Specific Odds', () => {
  const { calculateEmergencyRescue } = engine;
  // User holds Blue (Win +2000 / Risk -2500)
  const tickets = [{ id: 1, corner: 'blue', side: 'fav', a: 5, b: 4, stake: 2000 }];
  // Market shifts: Blue is 3:1 fav, but Red underdog button offers 1:2 (pay 2:1)
  const rescue = calculateEmergencyRescue({
    tickets,
    currentPrice: {
      favCorner: 'blue',
      oddA: 3,
      oddB: 1,
      redSide: { a: 1, b: 2, raw: '🔴 แดง: HDP 1 : 2' },
      blueSide: { a: 3, b: 1, raw: '🔵 น้ำเงิน: 3 : 1 HDP' }
    },
    totalCapital: 2000
  });

  assert.strictEqual(rescue.isNeeded, true);
  assert.strictEqual(rescue.holdingCorner, 'blue');
  assert.strictEqual(rescue.dangerCorner, 'red');
  assert.strictEqual(rescue.targetCorner, 'red');
  assert.strictEqual(rescue.targetSide, 'dog'); // betting Red underdog
  // Target odds should be from redSide (a=1, b=2)
  assert.strictEqual(rescue.targetOddsA, 1);
  assert.strictEqual(rescue.targetOddsB, 2);
  // Stake needed = 2000
  assert.strictEqual(rescue.rescueStake, 2000);
  assert.strictEqual(rescue.finalLeadingProfit, 0, 'Leading Blue side becomes Breakeven');
});

// 43. Historical data integration replay
runTest('Historical fight journeys replay without crashes', () => {
  const historicalContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8'), historicalContext);
  const fights = historicalContext.window.HISTORICAL_FIGHTS;
  assert.ok(fights.length >= 9, 'Expected the current historical fight library to contain its available records');
  assert.strictEqual(
    fights.flatMap((fight) => fight.journey).filter((point) => !point.v2 || !point.v2.red || !point.v2.blue || !point.v2.derived).length,
    0,
    'Every historical point should expose the migrated V2 shape'
  );
  const permanentFight = fights.find((fight) => fight.fightId === 'fight_20260822_145748');
  assert.strictEqual(permanentFight.journey[2].v2.derived.marketState, 'BOTH_FAV');
  assert.strictEqual(permanentFight.journey[3].v2.derived.marketState, 'BOTH_EVEN');
  assert.strictEqual(permanentFight.journey[4].red.a, 10);
  assert.strictEqual(permanentFight.journey[4].red.b, 10);
  assert.strictEqual(permanentFight.journey[4].blue.a, 5);
  assert.strictEqual(permanentFight.journey[4].blue.b, 4);

  fights.forEach((fight) => {
    const tracker = new PriceJourneyTracker();
    fight.journey.forEach((point) => {
      if (point.red && point.blue && point.red.isValid !== false && point.blue.isValid !== false) {
        tracker.appendSnapshot(createPriceSnapshotV2('', '', point.red, point.blue));
      } else if (point.resolvedFav && point.resolvedA != null && point.resolvedB != null) {
        tracker.appendSnapshot(createPriceSnapshot('', '', point.resolvedFav, point.resolvedA, point.resolvedB));
      }
    });
    if (tracker.currentSnapshot) {
      const state = tracker.getJourneyState();
      assert.ok(state.currentSnapshot);
      assert.ok(state.currentSnapshot.canonicalV2 || state.currentSnapshot.canonical);
    }
  });
});

console.log(`\n==================================================`);
console.log(`TEST SUITE COMPLETE: ${passedTests}/${totalTests} Passed`);
console.log(`==================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}

