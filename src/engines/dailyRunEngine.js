function getBaseTargetsByDay(day = 1) {
  if (day <= 7) return { profitability: 50, precision: 70, satisfaction: 35 };
  if (day <= 21) return { profitability: 80, precision: 75, satisfaction: 40 };
  if (day <= 30) return { profitability: 110, precision: 78, satisfaction: 45 };
  return { profitability: 140, precision: 80, satisfaction: 50 };
}

function getProfileTargetMultiplier(economyProfile = 'normal') {
  if (economyProfile === 'casual') return 0.9;
  if (economyProfile === 'hardcore') return 1.15;
  return 1;
}

export function buildDailyObjectives({
  netIncome = 0,
  dayMetrics = {},
  day = 1,
  economyProfile = 'normal',
} = {}) {
  const treatedCount = Math.max(1, dayMetrics.treated || 0);
  const precisionRatio = ((dayMetrics.good || 0) + (dayMetrics.regular || 0)) / treatedCount;
  const satisfactionRatio = (dayMetrics.good || 0) / treatedCount;
  const baseTargets = getBaseTargetsByDay(day);
  const profileMultiplier = getProfileTargetMultiplier(economyProfile);

  const profitabilityTarget = Math.round(baseTargets.profitability * profileMultiplier);
  const precisionTarget = Math.round(baseTargets.precision * profileMultiplier);
  const satisfactionTarget = Math.round(baseTargets.satisfaction * profileMultiplier);
  const precisionCurrent = Math.round(precisionRatio * 100);
  const satisfactionCurrent = Math.round(satisfactionRatio * 100);

  return [
    {
      id: 'profitability',
      label: 'Rentabilidad',
      current: Math.round(netIncome),
      target: profitabilityTarget,
      completed: netIncome >= profitabilityTarget,
    },
    {
      id: 'precision',
      label: 'Precision clinica',
      current: precisionCurrent,
      target: precisionTarget,
      completed: precisionCurrent >= precisionTarget,
    },
    {
      id: 'satisfaction',
      label: 'Satisfaccion',
      current: satisfactionCurrent,
      target: satisfactionTarget,
      completed: satisfactionCurrent >= satisfactionTarget,
    },
  ];
}

export function calculatePerformanceReward({
  netIncome = 0,
  objectives = [],
  mistakesToday = 0,
  rewardMultiplier = 1,
} = {}) {
  const completedObjectivesCount = objectives.filter((o) => o.completed).length;
  const rewardFromPerformance =
    Math.max(0, Math.round(Math.max(0, netIncome) * 0.08)) +
    completedObjectivesCount * 25 +
    (mistakesToday === 0 ? 60 : 0);

  return {
    completedObjectivesCount,
    rewardFromPerformance,
    rewardAdjusted: Math.round(rewardFromPerformance * (rewardMultiplier || 1)),
  };
}

export function buildDailyMemorableMoments({
  dailyEvent = null,
  objectives = [],
  topFactors = [],
  dayMetrics = {},
  consultPrice = 100,
  economyProfile = 'normal',
  debtTier = 'none',
} = {}) {
  const treated = Math.max(1, dayMetrics.treated || 0);
  const qualityAvg = Math.round((dayMetrics.qualityTotal || 0) / treated);

  const eventMoment = dailyEvent
    ? {
        id: 'economic_event',
        title: dailyEvent.title,
        description: dailyEvent.description,
        tone: dailyEvent.tone || 'neutral',
      }
    : {
        id: 'economic_event',
        title: 'Jornada estable',
        description: 'Sin evento economico especial.',
        tone: 'neutral',
      };

  const reviewMoment =
    qualityAvg >= 75
      ? {
          id: 'review',
          title: 'Reviews positivas',
          description: `Calidad media ${qualityAvg}. La clinica genero buenas sensaciones.`,
          tone: 'positive',
        }
      : qualityAvg < 45
        ? {
            id: 'review',
            title: 'Quejas de pacientes',
            description: `Calidad media ${qualityAvg}. Prioriza precision y flujo.`,
            tone: 'negative',
          }
        : {
            id: 'review',
            title: 'Feedback mixto',
            description: `Calidad media ${qualityAvg}. Hay margen claro de mejora.`,
            tone: 'neutral',
          };

  const completedObjectives = objectives.filter((o) => o.completed).length;
  const decisionMoment = {
    id: 'management_decision',
    title: 'Decision de gestion',
    description: `Precio $${consultPrice}, perfil ${economyProfile.toUpperCase()}, deuda ${debtTier.toUpperCase()}, objetivos ${completedObjectives}/3.`,
    tone: debtTier === 'critical' ? 'negative' : completedObjectives >= 2 ? 'positive' : 'neutral',
  };

  const factorMoment =
    topFactors && topFactors.length > 0
      ? {
          id: 'factor',
          title: 'Factor dominante',
          description: `${topFactors[0].label}: ${topFactors[0].amount >= 0 ? '+' : ''}$${Math.round(topFactors[0].amount)}`,
          tone: topFactors[0].amount >= 0 ? 'positive' : 'negative',
        }
      : null;

  return [eventMoment, reviewMoment, decisionMoment, factorMoment].filter(Boolean);
}
