/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadEconomyEngine() {
  const enginePath = path.join(process.cwd(), 'src', 'engines', 'economyEngine.js');
  const raw = fs.readFileSync(enginePath, 'utf8');

  const transformed = raw
    .replace(/export function /g, 'function ')
    .replace(/export \{[^}]+\};?/g, '');

  const wrapped = `
${transformed}
this.__engine__ = {
  clamp,
  computeDailyDemand,
  computeDailyCosts,
  computeDebtRescue,
  computeDebtInterest,
  computeQualityTier,
  getDebtTierForPrincipal,
};
`;

  const context = {};
  vm.createContext(context);
  vm.runInContext(wrapped, context);
  return context.__engine__;
}

const PROFILES = {
  casual: {
    fixedCostMultiplier: 0.8,
    variableCostMultiplier: 0.82,
    maintenanceMultiplier: 0.85,
    staffMultiplier: 0.9,
    taxRateMultiplier: 0.75,
    monthlyRentMultiplier: 0.8,
    demandModifier: 1,
    debtInterestMultiplier: 0.7,
    rescueThreshold: -320,
    rescueTargetCash: 220,
    rescueInterestMultiplier: 1.04,
  },
  normal: {
    fixedCostMultiplier: 1,
    variableCostMultiplier: 1,
    maintenanceMultiplier: 1,
    staffMultiplier: 1,
    taxRateMultiplier: 1,
    monthlyRentMultiplier: 1,
    demandModifier: 0,
    debtInterestMultiplier: 1,
    rescueThreshold: -200,
    rescueTargetCash: 100,
    rescueInterestMultiplier: 1.18,
  },
  hardcore: {
    fixedCostMultiplier: 1.28,
    variableCostMultiplier: 1.22,
    maintenanceMultiplier: 1.25,
    staffMultiplier: 1.2,
    taxRateMultiplier: 1.25,
    monthlyRentMultiplier: 1.2,
    demandModifier: -1,
    debtInterestMultiplier: 1.45,
    rescueThreshold: -120,
    rescueTargetCash: 70,
    rescueInterestMultiplier: 1.38,
  },
};

function simulateProfile(profileId, days, engine) {
  const profile = PROFILES[profileId];
  let money = 500;
  let reputation = 0;
  let monthProfitAccum = 0;
  let loanPrincipal = 0;
  let loanInstallment = 0;
  let loanDaysRemaining = 0;
  let debtTier = 'none';
  let rescueCount = 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalDemand = 0;
  let monthlyCharges = 0;
  const consultPrice = 100;
  const skill = 1;

  for (let day = 1; day <= days; day += 1) {
    const demandInfo = engine.computeDailyDemand({
      day,
      reputation,
      consultPrice,
      marketing: 0,
      profileDemandModifier: profile.demandModifier,
      debtTier,
      cap: 10,
    });
    const demand = demandInfo.demand;
    totalDemand += demand;

    const qualityScore = engine.clamp(
      52 + skill * 4 + reputation / 40 - Math.floor(day / 10),
      0,
      100
    );
    const qualityTier = engine.computeQualityTier(qualityScore);
    const qualityMultiplier =
      qualityTier === 'Good' ? 1.15 : qualityTier === 'Regular' ? 0.95 : 0.65;

    const socialPaymentMultiplier = engine.clamp(0.92 + reputation / 4000, 0.85, 1.35);
    const noPayRisk = engine.clamp(0.08 - reputation / 10000, 0.02, 0.08);
    const dayIncome = Math.round(
      demand * consultPrice * socialPaymentMultiplier * qualityMultiplier * (1 - noPayRisk)
    );
    totalIncome += dayIncome;
    money += dayIncome;

    const expenses = engine.computeDailyCosts({
      clinicLevel: 1,
      currentDay: day,
      treatedPatients: demand,
      dailyFixedCosts: 120,
      dailyVariableCosts: 18,
      staff: {},
      profile,
      eventCostDelta: 0,
      commitLoanPayment: true,
      loanPrincipal,
      loanDaysRemaining,
      loanInstallment,
    });
    totalExpenses += expenses.total;
    money -= expenses.total;
    loanPrincipal = expenses.nextLoanPrincipal;
    loanDaysRemaining = expenses.nextLoanDaysRemaining;
    loanInstallment = expenses.nextLoanInstallment;
    debtTier = engine.getDebtTierForPrincipal(loanPrincipal);

    if (money < 0) {
      const interest = engine.computeDebtInterest(money, profile.debtInterestMultiplier);
      money -= interest;
      totalExpenses += interest;
    }

    const rescuePlan = engine.computeDebtRescue({
      money,
      loanPrincipal,
      loanDaysRemaining,
      profile,
      debtTier,
    });
    if (rescuePlan.applied) {
      rescueCount += 1;
      money = rescuePlan.targetCash;
      loanPrincipal = rescuePlan.newLoanPrincipal;
      loanInstallment = rescuePlan.newInstallment;
      loanDaysRemaining = rescuePlan.days;
      debtTier = rescuePlan.debtTier;
    }

    const dayNet = dayIncome - expenses.total;
    monthProfitAccum += dayNet;

    if (day % 30 === 0) {
      const rent = Math.round((400 + 1 * 80) * (profile.monthlyRentMultiplier || 1));
      const taxes = Math.round(Math.max(0, monthProfitAccum) * (0.15 * profile.taxRateMultiplier));
      const monthly = rent + taxes;
      money -= monthly;
      monthlyCharges += monthly;
      monthProfitAccum = 0;
    }

    reputation = Math.max(
      0,
      reputation + demand * (qualityTier === 'Good' ? 1.8 : qualityTier === 'Regular' ? 0.8 : -0.4)
    );
  }

  return {
    profile: profileId,
    days,
    endingCash: Math.round(money),
    endingReputation: Math.round(reputation),
    rescueCount,
    loanPrincipal: Math.round(loanPrincipal),
    avgDemand: Math.round((totalDemand / Math.max(1, days)) * 10) / 10,
    avgDailyIncome: Math.round(totalIncome / Math.max(1, days)),
    avgDailyExpenses: Math.round(totalExpenses / Math.max(1, days)),
    monthlyCharges: Math.round(monthlyCharges),
  };
}

function printTable(rows) {
  const headers = [
    'profile',
    'days',
    'endingCash',
    'endingReputation',
    'rescueCount',
    'loanPrincipal',
    'avgDemand',
    'avgDailyIncome',
    'avgDailyExpenses',
    'monthlyCharges',
  ];

  console.log(headers.join('\t'));
  for (const row of rows) {
    console.log(headers.map((h) => row[h]).join('\t'));
  }
}

function main() {
  const engine = loadEconomyEngine();
  const horizons = [30, 60, 90];
  const rows = [];

  for (const h of horizons) {
    rows.push(simulateProfile('casual', h, engine));
    rows.push(simulateProfile('normal', h, engine));
    rows.push(simulateProfile('hardcore', h, engine));
  }

  printTable(rows);
}

main();
