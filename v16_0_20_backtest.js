
//V16.0.22
const fs = require('fs');
const vm = require('vm');

const DATA = './data.js';
const ENGINE = './price_journey_engine.js';

const START_CAPITAL = 10000;
const FIRST_STAKE = 1000;
const LEG_FACTOR = 0.75;
const PROFIT_FLOOR = 100;

const ctx = { window: {} };

vm.createContext(ctx);

vm.runInContext(
  fs.readFileSync(DATA, 'utf8'),
  ctx,
  { timeout: 10000 }
);

const Engine = require(ENGINE);
const fights =
  ctx.window.HISTORICAL_FIGHTS || [];


// ============================================================
// UTIL
// ============================================================

function valid(o) {
  return (
    o &&
    Number(o.a) > 0 &&
    Number(o.b) > 0
  );
}

function ratio(o) {
  return (
    Math.max(+o.a, +o.b) /
    Math.min(+o.a, +o.b)
  );
}

function side(o) {
  if (o.a > o.b) return 'fav';
  if (o.a < o.b) return 'dog';
  return 'even';
}

function ticket(o, stake) {
  const r = ratio(o);

  if (side(o) === 'fav') {
    return {
      win: stake,
      risk: stake * r
    };
  }

  return {
    win: stake * r,
    risk: stake
  };
}

function apply(net, corner, odds, stake) {
  const p = ticket(odds, stake);

  if (corner === 'red') {
    return {
      red: net.red + p.win,
      blue: net.blue - p.risk
    };
  }

  return {
    red: net.red - p.risk,
    blue: net.blue + p.win
  };
}

function winnerProfit(net, winner) {
  return winner === 'red'
    ? net.red
    : net.blue;
}


// ============================================================
// ENTRY
// STEP 0 ONLY
// ============================================================

function findEntry(fight) {

  const corners = [
    fight.initialFav,

    fight.initialFav === 'red'
      ? 'blue'
      : 'red'
  ];

  for (const corner of corners) {

    const odds =
      fight.journey[0]?.[corner];

    if (!valid(odds))
      continue;

    const r = ratio(odds);

    const ok =
      corner === fight.initialFav

        ? r >= 10 / 9 &&
          r <= 3 / 2

        : r >= 5 / 3 &&
          r <= 3;

    if (ok) {
      return {
        corner,
        odds
      };
    }
  }

  return null;
}


// ============================================================
// MAX RECOVERY
// ============================================================

function maxRecoverable(net, odds) {

  const r = ratio(odds);

  const leading =
    Math.max(
      net.red,
      net.blue
    );

  const lagging =
    Math.min(
      net.red,
      net.blue
    );

  return Math.max(
    0,

    Math.min(
      Math.abs(lagging),
      leading / r
    )
  );
}


// ============================================================
// EVERY STRATEGY
// ============================================================

function evaluateStrategy(
  net,
  targetCorner,
  odds,
  name
) {

  const leadingCorner =
    net.red >= net.blue
      ? 'red'
      : 'blue';

  const leadingProfit =
    Math.max(
      net.red,
      net.blue
    );

  const laggingProfit =
    Math.min(
      net.red,
      net.blue
    );

  const isHedgeByFav =
    side(odds) === 'fav';

  const targetRatio =
    ratio(odds);

  let strategy;
  const extra = {};

  if (name === 'Equal') {

    strategy = 'equal';

  } else if (name === '70/30') {

    strategy = 'skew_runner';

    extra.skewTarget =
      targetCorner;

  } else if (name === 'BE') {

    strategy = 'breakeven';

    extra.breakevenTarget =
      targetCorner;

  } else {

    strategy = 'smart_cut';

  }

  const result =
    Engine.calculateStrategyHedge({

      strategy,

      leadingCorner,

      leadingProfit,

      laggingProfit,

      isHedgeByFav,

      targetOdds: odds,

      targetRatio,

      ...extra

    });

  if (
    !result ||
    !result.isReady ||
    result.hedgeStake <= 0
  ) {
    return null;
  }

  return {
    name,

    ...result,

    minProfit:
      Math.min(
        result.finalRedProf,
        result.finalBlueProf
      )
  };
}


// ============================================================
// SCAN EVERY STEP
// SCAN EVERY STRATEGY
// ============================================================

function scanEveryStrategy(
  net,
  targetCorner,
  startStep,
  fight
) {

  for (
    let step = startStep;
    step < fight.journey.length;
    step++
  ) {

    const odds =
      fight.journey[step]?.[
        targetCorner
      ];

    if (!valid(odds))
      continue;

    const all = [
      'Equal',
      '70/30',
      'BE',
      'Smart Cut'
    ]
      .map(
        name =>
          evaluateStrategy(
            net,
            targetCorner,
            odds,
            name
          )
      )
      .filter(Boolean);

    const profitable =
      all.filter(
        x =>
          x.finalRedProf >=
            PROFIT_FLOOR &&

          x.finalBlueProf >=
            PROFIT_FLOOR
      );

    if (!profitable.length)
      continue;

    profitable.sort(
      (a, b) =>
        b.minProfit -
        a.minProfit ||

        b.maxProfit -
        a.maxProfit ||

        a.hedgeStake -
        b.hedgeStake
    );

    return {

      step,

      selected:
        profitable[0],

      allStrategies:
        profitable.map(
          x => ({
            name:
              x.name,

            stake:
              x.hedgeStake,

            red:
              x.finalRedProf,

            blue:
              x.finalBlueProf,

            min:
              x.minProfit
          })
        )

    };
  }

  return null;
}


// ============================================================
// TRIGGER
// ============================================================

function findTrigger(
  fight,
  watchedCorner,
  startStep
) {

  const opposite =
    watchedCorner === 'red'
      ? 'blue'
      : 'red';

  for (
    let i = startStep;
    i < fight.journey.length;
    i++
  ) {

    const odds =
      fight.journey[i]?.[
        opposite
      ];

    if (
      valid(odds) &&
      side(odds) === 'fav'
    ) {
      return i;
    }
  }

  return null;
}


// ============================================================
// FIGHT
// ============================================================

function runFight(fight) {

  const entry =
    findEntry(fight);

  if (!entry) {

    return {
      entered: false,
      pnl: 0,
      status: 'NO_ENTRY'
    };
  }


  // ----------------------------------------------------------
  // LEG 1
  // ----------------------------------------------------------

  const first =
    ticket(
      entry.odds,
      FIRST_STAKE
    );

  let net =
    entry.corner === 'red'

      ? {
          red: first.win,
          blue: -first.risk
        }

      : {
          red: -first.risk,
          blue: first.win
        };

  const base =
    winnerProfit(
      net,
      fight.winner
    );


  // ==========================================================
  // V22
  // EVERY STEP
  // EVERY STRATEGY
  // BEFORE TRIGGER
  // ==========================================================

  const early =
    scanEveryStrategy(
      net,

      entry.corner === 'red'
        ? 'blue'
        : 'red',

      1,

      fight
    );

  if (early) {

    return {

      entered: true,

      pnl:
        winnerProfit(
          {
            red:
              early.selected.finalRedProf,

            blue:
              early.selected.finalBlueProf
          },

          fight.winner
        ),

      base,

      status:
        'EARLY_PROFIT_EXIT',

      exitPhase:
        'PRE_TRIGGER',

      exitStep:
        early.step,

      strategy:
        early.selected.name,

      exitStake:
        early.selected.hedgeStake,

      red:
        early.selected.finalRedProf,

      blue:
        early.selected.finalBlueProf,

      allStrategies:
        early.allStrategies,

      afterTrigger:
        false
    };
  }


  // ==========================================================
  // TRIGGER #1
  // ==========================================================

  const trigger1 =
    findTrigger(
      fight,
      entry.corner,
      1
    );

  if (trigger1 === null) {

    return {

      entered: true,

      pnl: base,

      base,

      status:
        'SETTLE_NO_TRIGGER',

      afterTrigger:
        false
    };
  }


  // ==========================================================
  // LEG 2
  // ==========================================================

  const leg2Corner =
    entry.corner === 'red'
      ? 'blue'
      : 'red';

  const leg2Odds =
    fight.journey[
      trigger1
    ]?.[leg2Corner];

  const leg2 =
    LEG_FACTOR *
    maxRecoverable(
      net,
      leg2Odds
    );

  net =
    apply(
      net,
      leg2Corner,
      leg2Odds,
      leg2
    );


  // ==========================================================
  // AFTER TRIGGER #1
  // EVERY STEP / EVERY STRATEGY
  // ==========================================================

  const exit1 =
    scanEveryStrategy(
      net,
      leg2Corner,
      trigger1 + 1,
      fight
    );

  if (exit1) {

    const finalNet = {

      red:
        exit1.selected.finalRedProf,

      blue:
        exit1.selected.finalBlueProf

    };

    return {

      entered: true,

      pnl:
        winnerProfit(
          finalNet,
          fight.winner
        ),

      base,

      trigger1,

      leg2,

      status:
        'PROFIT_EXIT',

      exitPhase:
        'POST_TRIGGER1',

      exitStep:
        exit1.step,

      strategy:
        exit1.selected.name,

      exitStake:
        exit1.selected.hedgeStake,

      red:
        finalNet.red,

      blue:
        finalNet.blue,

      allStrategies:
        exit1.allStrategies,

      afterTrigger:
        true
    };
  }


  // ==========================================================
  // TRIGGER #2
  // ==========================================================

  const trigger2 =
    findTrigger(
      fight,
      leg2Corner,
      trigger1 + 1
    );

  if (trigger2 === null) {

    return {

      entered: true,

      pnl:
        winnerProfit(
          net,
          fight.winner
        ),

      base,

      trigger1,

      leg2,

      status:
        'SETTLE_AFTER_LEG2',

      red:
        net.red,

      blue:
        net.blue,

      afterTrigger:
        true
    };
  }


  // ==========================================================
  // LEG 3
  // ==========================================================

  const leg3Corner =
    entry.corner;

  const leg3Odds =
    fight.journey[
      trigger2
    ]?.[leg3Corner];

  const leg3 =
    LEG_FACTOR *
    maxRecoverable(
      net,
      leg3Odds
    );

  net =
    apply(
      net,
      leg3Corner,
      leg3Odds,
      leg3
    );


  // ==========================================================
  // AFTER TRIGGER #2
  // EVERY STEP / EVERY STRATEGY
  // ==========================================================

  const exit2 =
    scanEveryStrategy(
      net,
      leg3Corner,
      trigger2 + 1,
      fight
    );

  if (exit2) {

    const finalNet = {

      red:
        exit2.selected.finalRedProf,

      blue:
        exit2.selected.finalBlueProf

    };

    return {

      entered: true,

      pnl:
        winnerProfit(
          finalNet,
          fight.winner
        ),

      base,

      trigger1,

      leg2,

      trigger2,

      leg3,

      status:
        'PROFIT_EXIT',

      exitPhase:
        'POST_TRIGGER2',

      exitStep:
        exit2.step,

      strategy:
        exit2.selected.name,

      exitStake:
        exit2.selected.hedgeStake,

      red:
        finalNet.red,

      blue:
        finalNet.blue,

      allStrategies:
        exit2.allStrategies,

      afterTrigger:
        true
    };
  }


  // ==========================================================
  // SETTLEMENT
  // ==========================================================

  return {

    entered: true,

    pnl:
      winnerProfit(
        net,
        fight.winner
      ),

    base,

    trigger1,

    leg2,

    trigger2,

    leg3,

    status:
      'SETTLE_AFTER_LEG3',

    red:
      net.red,

    blue:
      net.blue,

    afterTrigger:
      true
  };
}


// ============================================================
// BACKTEST
// ============================================================

const rows =
  fights.map(runFight);

const pnl =
  rows.reduce(
    (sum, r) =>
      sum + r.pnl,
    0
  );

const entered =
  rows.filter(
    r => r.entered
  );

const baseline =
  entered.reduce(
    (sum, r) =>
      sum + r.base,
    0
  );

const triggered =
  rows.filter(
    r => r.afterTrigger
  );

const successfulPostTriggerExit =
  triggered.filter(
    r =>
      r.status ===
        'PROFIT_EXIT' ||

      r.status ===
        'RISK_EXIT'
  );

const successfulAllExit =
  rows.filter(
    r =>
      r.status ===
        'EARLY_PROFIT_EXIT' ||

      r.status ===
        'PROFIT_EXIT' ||

      r.status ===
        'RISK_EXIT'
  );


const report = {

  version:
    'V16.0.22',

  fights:
    fights.length,

  startCapital:
    START_CAPITAL,

  endCapital:
    +(
      START_CAPITAL +
      pnl
    ).toFixed(2),

  pnl:
    +pnl.toFixed(2),

  entry:
    entered.length,

  earlyProfitExit:
    rows.filter(
      r =>
        r.status ===
        'EARLY_PROFIT_EXIT'
    ).length,

  trigger1:
    rows.filter(
      r =>
        r.trigger1 != null
    ).length,

  trigger2:
    rows.filter(
      r =>
        r.trigger2 != null
    ).length,

  postTriggerProfitExit:
    rows.filter(
      r =>
        r.status ===
        'PROFIT_EXIT'
    ).length,

  riskExit:
    rows.filter(
      r =>
        r.status ===
        'RISK_EXIT'
    ).length,

  settlement:
    rows.filter(
      r =>
        r.status.startsWith(
          'SETTLE'
        )
    ).length,

  postTriggerExitSuccess:
    successfulPostTriggerExit.length,

  postTriggerExitSuccessRate:
    +(
      successfulPostTriggerExit.length /
      Math.max(
        1,
        triggered.length
      ) *
      100
    ).toFixed(1),

  allEntryExitSuccess:
    successfulAllExit.length,

  allEntryExitSuccessRate:
    +(
      successfulAllExit.length /
      Math.max(
        1,
        entered.length
      ) *
      100
    ).toFixed(1),

  baseline:
    +baseline.toFixed(2),

  improvement:
    +(
      pnl -
      baseline
    ).toFixed(2),

  strategies:
    Object.fromEntries(

      [
        'Equal',
        '70/30',
        'BE',
        'Smart Cut'

      ].map(
        name => [

          name,

          rows.filter(
            r =>
              r.strategy ===
              name
          ).length

        ]
      )

    ),

  benchmark:
    (() => {

      const i =
        fights.findIndex(
          f =>
            f.fightId ===
            'fight_20260830_211826'
        );

      return i < 0
        ? null
        : {

            fightId:
              fights[i].fightId,

            result:
              rows[i]

          };

    })()

};


console.log(
  JSON.stringify(
    report,
    null,
    2
  )
);


console.log(
  '\nDETAILS'
);


console.table(

  rows.map(
    (r, i) => ({

      fight:
        i + 1,

      id:
        fights[i].fightId,

      status:
        r.status,

      phase:
        r.exitPhase || '',

      trigger1:
        r.trigger1 ?? '',

      trigger2:
        r.trigger2 ?? '',

      strategy:
        r.strategy || '',

      exitStep:
        r.exitStep ?? '',

      pnl:
        +r.pnl.toFixed(2)

    })
  )

);