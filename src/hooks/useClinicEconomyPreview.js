import { useMemo } from 'react';
import gameState from '../utils/gameState';

export default function useClinicEconomyPreview(state, isWalmerTutorial) {
  return useMemo(() => {
    const profile = state.economyProfile || 'normal';
    const demand = isWalmerTutorial
      ? {
          demand: 1,
          baseByDay: 1,
          repInfluence: 0,
          marketing: 0,
          overpricingPenalty: 0,
          profileDemandModifier: 0,
          temporaryDemandModifier: 0,
          debtDemandPenalty: 0,
        }
      : gameState.computeDailyDemand({ economyProfile: profile });

    const predicted = demand.demand;
    const costPreview = gameState.applyDailyCostsBreakdown(0, {
      preview: true,
      treatedPatientsOverride: predicted,
      economyProfile: profile,
    });

    const incomeEstimated = Math.round(predicted * (state.consultPrice || 100) * 0.95);
    const netEstimated = incomeEstimated - (costPreview.total || 0);
    const health = gameState.getEconomyHealthSnapshot(30);

    return {
      economyProfile: profile,
      demandPreview: demand,
      predictedPatients: predicted,
      dailyCostPreview: costPreview,
      estimatedIncome: incomeEstimated,
      estimatedNet: netEstimated,
      economyHealth: health,
      forecast30: health.forecast,
      priceGuidance: health.guidance,
    };
  }, [state, isWalmerTutorial]);
}
