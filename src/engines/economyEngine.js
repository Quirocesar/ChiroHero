const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function getDemandBaseByDay(day = 1) {
  if (day <= 1) return 1;
  if (day <= 3) return 2;
  if (day <= 7) return 3;
  if (day <= 14) return 4;
  if (day <= 21) return 5;
  if (day <= 30) return 6;
  if (day <= 45) return 7;
  if (day <= 60) return 8;
  return 8 + Math.min(4, Math.floor((day - 60) / 20));
}

export function getDebtTierForPrincipal(principal = 0) {
  const value = Math.max(0, Math.round(principal || 0));
  if (value <= 0) return 'none';
  if (value < 700) return 'micro';
  if (value < 1800) return 'standard';
  return 'critical';
}

export function getDebtTierConfig(tier = 'none') {
  const map = {
    none: {
      thresholdOffset: 0,
      targetCashBonus: 0,
      minDays: 12,
      interestTierMultiplier: 1,
    },
    micro: {
      thresholdOffset: 20,
      targetCashBonus: 15,
      minDays: 14,
      interestTierMultiplier: 1.05,
    },
    standard: {
      thresholdOffset: 40,
      targetCashBonus: 30,
      minDays: 18,
      interestTierMultiplier: 1.12,
    },
    critical: {
      thresholdOffset: 60,
      targetCashBonus: 45,
      minDays: 24,
      interestTierMultiplier: 1.2,
    },
  };

  return map[tier] || map.none;
}

export function getEffectiveRescueThreshold(profile = {}, debtTier = 'none') {
  const baseThreshold = profile.rescueThreshold ?? -200;
  const tierCfg = getDebtTierConfig(debtTier);
  return baseThreshold + (tierCfg.thresholdOffset || 0);
}

export function computeDailyDemand({
  day = 1,
  reputation = 0,
  consultPrice = 100,
  marketing = 0,
  profileDemandModifier = 0,
  temporaryDemandModifier = 0,
  debtTier = 'none',
  cap = 8,
} = {}) {
  const baseByDay = getDemandBaseByDay(day);
  const repInfluence = Math.floor(reputation / 180);
  const overpricingPenalty = Math.max(0, Math.round((consultPrice - 100) / 20));
  const debtDemandPenalty = debtTier === 'critical' ? 1 : debtTier === 'standard' ? 0.5 : 0;

  const rawDemand =
    baseByDay +
    repInfluence +
    marketing -
    overpricingPenalty +
    profileDemandModifier +
    temporaryDemandModifier -
    debtDemandPenalty;

  const demand = Math.max(1, Math.min(cap, Math.round(rawDemand)));

  return {
    demand,
    baseByDay,
    repInfluence,
    marketing,
    overpricingPenalty,
    profileDemandModifier,
    temporaryDemandModifier,
    debtDemandPenalty,
    cap,
  };
}

export function computeDailyCosts({
  clinicLevel = 1,
  currentDay = 1,
  treatedPatients = 0,
  dailyFixedCosts = 120,
  dailyVariableCosts = 18,
  staff = {},
  profile = {},
  eventCostDelta = 0,
  commitLoanPayment = false,
  loanPrincipal = 0,
  loanDaysRemaining = 0,
  loanInstallment = 0,
} = {}) {
  const fixedCost = Math.round(
    ((dailyFixedCosts || 120) + (clinicLevel - 1) * 12) * (profile.fixedCostMultiplier || 1)
  );
  const variableCost = Math.round(
    ((dailyVariableCosts || 18) + treatedPatients * 5) * (profile.variableCostMultiplier || 1)
  );
  const maintenanceCost = Math.round(
    ((clinicLevel - 1) * 6 + (currentDay % 7 === 0 ? 15 : 0)) * (profile.maintenanceMultiplier || 1)
  );

  let staffCost = 0;
  if (staff.chiroAssistant) staffCost += 35;
  if (staff.appointmentAssistant) staffCost += 30;
  if (staff.whatsappManager) staffCost += 20;
  if (staff.multipleCA) staffCost += 45;
  if (staff.hireChiro1) staffCost += 60;
  if (staff.hireChiro2) staffCost += 80;
  if (staff.hireChiro3) staffCost += 100;
  staffCost = Math.round(staffCost * (profile.staffMultiplier || 1));

  const loanPayment =
    commitLoanPayment && loanDaysRemaining > 0 ? Math.min(loanInstallment, loanPrincipal) : 0;

  const nextLoanPrincipal = Math.max(0, loanPrincipal - loanPayment);
  const nextLoanDaysRemaining =
    loanDaysRemaining > 0 && loanPayment > 0
      ? Math.max(0, loanDaysRemaining - 1)
      : loanDaysRemaining;
  const nextLoanInstallment = nextLoanPrincipal > 0 ? loanInstallment : 0;

  const total = Math.max(
    0,
    Math.round(
      fixedCost + variableCost + maintenanceCost + staffCost + loanPayment + eventCostDelta
    )
  );

  return {
    rent: Math.round(fixedCost),
    supplies: Math.round(variableCost),
    staffCost: Math.round(staffCost),
    equipmentMaintenance: Math.round(maintenanceCost),
    fixedCost: Math.round(fixedCost),
    variableCost: Math.round(variableCost),
    maintenanceCost: Math.round(maintenanceCost),
    eventCostDelta: Math.round(eventCostDelta),
    loanPayment: Math.round(loanPayment),
    total,
    nextLoanPrincipal,
    nextLoanDaysRemaining,
    nextLoanInstallment,
  };
}

export function computeDebtRescue({
  money = 0,
  loanPrincipal = 0,
  loanDaysRemaining = 0,
  profile = {},
  debtTier = 'none',
} = {}) {
  const tierCfg = getDebtTierConfig(debtTier);
  const rescueThreshold = getEffectiveRescueThreshold(profile, debtTier);

  if (money >= rescueThreshold) {
    return { applied: false, rescueThreshold };
  }

  const targetCash = (profile.rescueTargetCash ?? 100) + (tierCfg.targetCashBonus || 0);
  const bailoutNeeded = Math.max(0, targetCash - money);
  const totalLoan = Math.ceil(
    bailoutNeeded *
      (profile.rescueInterestMultiplier || 1.18) *
      (tierCfg.interestTierMultiplier || 1)
  );

  const mergedPrincipal = (loanPrincipal || 0) + totalLoan;
  const days = Math.max(loanDaysRemaining || 0, tierCfg.minDays || 12);
  const installment = Math.ceil(mergedPrincipal / Math.max(1, days));
  const nextDebtTier = getDebtTierForPrincipal(mergedPrincipal);

  return {
    applied: true,
    rescueThreshold,
    targetCash,
    bailoutNeeded,
    newLoanPrincipal: mergedPrincipal,
    newInstallment: installment,
    days,
    debtTier: nextDebtTier,
  };
}

export function computeDebtInterest(balance = 0, debtInterestMultiplier = 1) {
  if (balance >= 0) return 0;
  return Math.max(5, Math.ceil(Math.abs(balance) * (0.08 * (debtInterestMultiplier || 1))));
}

export function computeQualityTier(score = 0) {
  if (score >= 72) return 'Good';
  if (score >= 40) return 'Regular';
  return 'Bad';
}

export { clamp };
