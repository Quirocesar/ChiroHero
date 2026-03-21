export function resolveMonthlyCloseIfNeeded({ gameState, report }) {
  let finalReport = { ...(report || {}) };
  let monthlyChargeInfo = null;

  const currentDay = gameState.get('currentDay') || 1;
  if (currentDay % 30 !== 0 || gameState.get('lastMonthlyChargeDay') === currentDay) {
    return {
      finalReport,
      monthlyChargeInfo,
    };
  }

  const economyCfg = gameState.getEconomyProfileConfig();
  const rent = Math.round(
    (400 + (gameState.get('clinicLevel') || 1) * 80) * (economyCfg.monthlyRentMultiplier || 1)
  );
  const taxRate = gameState.getEffectiveMonthlyTaxRate();
  const monthProfit = Math.max(0, gameState.get('monthProfitAccum') || 0);
  const taxes = Math.round(monthProfit * taxRate);
  const total = rent + taxes;

  gameState.applyForcedCost(total);
  gameState.set({
    lastMonthlyChargeDay: currentDay,
    monthProfitAccum: 0,
  });

  monthlyChargeInfo = { rent, taxes, total, monthProfit };

  // Keep end-of-day report coherent with monthly close charges.
  let balanceAfterMonthly = Math.round((finalReport.newBalance || 0) - total);
  let postMonthlyRescue = null;
  const rescueThreshold = gameState.getEffectiveRescueThreshold(
    gameState.getEconomyProfileConfig(),
    gameState.getDebtTierForPrincipal(gameState.get('loanPrincipal') || 0)
  );

  if (balanceAfterMonthly < rescueThreshold) {
    postMonthlyRescue = gameState.applyDebtRescue();
    if (postMonthlyRescue?.applied) {
      balanceAfterMonthly = Math.round(gameState.get('money') || balanceAfterMonthly);
    }
  }

  const monthlyFactors = [
    ...(Array.isArray(finalReport.topFactors) ? finalReport.topFactors : []),
    { label: 'Alquiler mensual', amount: -Math.round(rent) },
    { label: 'Impuestos mensuales', amount: -Math.round(taxes) },
  ];
  if (postMonthlyRescue?.applied) {
    monthlyFactors.push({
      label: 'Rescate mensual',
      amount: Math.round(postMonthlyRescue.bailoutNeeded || 0),
    });
  }

  finalReport = {
    ...finalReport,
    newBalance: balanceAfterMonthly,
    isInDebt: balanceAfterMonthly < 0,
    topFactors: monthlyFactors.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 3),
    monthlyCharge: { rent, taxes, total, monthProfit },
    postMonthlyRescue,
  };

  return {
    finalReport,
    monthlyChargeInfo,
  };
}
