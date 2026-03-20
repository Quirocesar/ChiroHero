import { clamp, computeQualityTier } from './economyEngine';

export function getDayQualityPenalty(day = 1) {
  if (day <= 7) return 0;
  if (day <= 14) return 1;
  if (day <= 21) return 2;
  if (day <= 30) return 3;
  if (day <= 60) return 4;
  return 5;
}

export function getSocialMixWeights(reputation = 0, consultPrice = 100, day = 1) {
  const rep = Math.max(0, reputation);
  const progression = Math.max(0, day - 1);
  const prestigeGrowth = Math.min(18, Math.floor(progression / 5));
  const priceOverBase = Math.max(0, Math.round((consultPrice - 100) / 12));
  const priceUnderBase = Math.max(0, Math.round((100 - consultPrice) / 14));

  const poor = Math.max(
    6,
    35 - Math.floor(rep / 50) - Math.floor(progression / 6) + priceUnderBase * 3
  );
  const middle = 45;
  const rich = Math.min(40, 8 + Math.floor(rep / 40) + priceOverBase * 2 + prestigeGrowth);
  const conflictive = Math.max(
    4,
    12 - Math.floor(rep / 100) - Math.floor(progression / 12) + priceUnderBase * 2
  );

  return { poor, middle, rich, conflictive };
}

export function getWeightedSocialStats(reputation = 0, consultPrice = 100, day = 1) {
  const weights = getSocialMixWeights(reputation, consultPrice, day);
  const total = weights.poor + weights.middle + weights.rich + weights.conflictive;
  const weightOf = (key) => (weights[key] || 0) / Math.max(1, total);

  const paymentMultiplier =
    weightOf('poor') * 0.65 +
    weightOf('middle') * 1 +
    weightOf('rich') * 1.85 +
    weightOf('conflictive') * 1.05;

  const repMultiplier =
    weightOf('poor') * 1.15 +
    weightOf('middle') * 1 +
    weightOf('rich') * 1.2 +
    weightOf('conflictive') * 0.9;

  const noPayRisk =
    weightOf('poor') * 0.03 +
    weightOf('middle') * 0.01 +
    weightOf('rich') * 0 +
    weightOf('conflictive') * 0.3;

  return {
    shares: {
      poor: weightOf('poor'),
      middle: weightOf('middle'),
      rich: weightOf('rich'),
      conflictive: weightOf('conflictive'),
    },
    paymentMultiplier,
    repMultiplier,
    noPayRisk,
  };
}

export function resolveAutoTreatment({
  patient,
  skill = 1,
  reputation = 0,
  toolBonus = 0,
  clinicBonus = 0,
  queuePosition = 0,
  queueLength = 1,
  timeRemaining = 240,
  dayDuration = 240,
  day = 1,
  consultPrice = 100,
} = {}) {
  if (!patient) {
    return {
      qualityScore: 0,
      qualityTier: 'Bad',
      qualityMultiplier: 0.65,
      income: 0,
      repDelta: -1,
      result: 'wrong_treat',
    };
  }

  const dayProgress = clamp(1 - timeRemaining / Math.max(1, dayDuration), 0, 1);
  const queuePenalty = queuePosition * 2 + Math.max(0, queueLength - 3);
  const fatiguePenalty = dayProgress * 10;
  const dayDifficultyPenalty = getDayQualityPenalty(day);
  const conditionDifficulty = patient?.condition?.difficulty || 1;
  const conditionPenalty = Math.max(0, conditionDifficulty - 1) * 1.6;
  const socialClass = patient?.socialClass || 'middle';
  const socialAdjustmentMap = {
    poor: 1.2,
    middle: 0,
    rich: -1.8,
    conflictive: -2.6,
    vip: -3.3,
  };
  const socialAdjustment = socialAdjustmentMap[socialClass] || 0;
  const randomSwing = Math.floor(Math.random() * 17) - 8;

  const qualityScore = clamp(
    Math.round(
      50 +
        skill * 4 +
        toolBonus +
        clinicBonus +
        reputation / 40 -
        queuePenalty -
        fatiguePenalty +
        socialAdjustment -
        dayDifficultyPenalty -
        conditionPenalty +
        randomSwing
    ),
    0,
    100
  );

  const qualityTier = computeQualityTier(qualityScore);
  const qualityMultiplierMap = {
    Good: 1.15,
    Regular: 0.95,
    Bad: 0.65,
  };
  const qualityMultiplier = qualityMultiplierMap[qualityTier] || 0.95;

  const socialMultiplier = patient.socialPaymentMultiplier || 1;
  const normalizedPatientBase =
    patient?.payment && !patient?.isPremium
      ? patient.payment / Math.max(0.1, socialMultiplier)
      : patient?.payment || consultPrice;
  const basePayment = Math.max(20, normalizedPatientBase);
  let income = Math.round(basePayment * socialMultiplier * qualityMultiplier);

  const baseRepDelta = patient.isPremium ? 10 : 2;
  let repDelta = Math.round(baseRepDelta * (patient.socialRepMultiplier || 1));
  if (qualityTier === 'Bad') {
    repDelta -= Math.max(2, Math.round(baseRepDelta * 1.5));
  }
  if (socialClass === 'conflictive' && qualityTier === 'Bad') {
    repDelta -= 2;
  }

  let result = 'treated';
  if (patient.isReferralCase) {
    const detected = qualityScore >= 68;
    if (detected) {
      result = 'referred';
      income = Math.round(basePayment * 0.3);
      repDelta = Math.max(3, Math.round(5 * (patient.socialRepMultiplier || 1)));
    } else {
      result = 'wrong_treat';
      income = 0;
      repDelta = -10;
    }
  }

  return {
    qualityScore,
    qualityTier,
    qualityMultiplier,
    income,
    repDelta,
    result,
  };
}
