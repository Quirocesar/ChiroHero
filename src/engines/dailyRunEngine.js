export function buildDailyObjectives({ netIncome = 0, dayMetrics = {} } = {}) {
  const treatedCount = Math.max(1, dayMetrics.treated || 0);
  const precisionRatio = ((dayMetrics.good || 0) + (dayMetrics.regular || 0)) / treatedCount;
  const satisfactionRatio = (dayMetrics.good || 0) / treatedCount;

  return [
    {
      id: 'profitability',
      label: 'Rentabilidad',
      current: Math.round(netIncome),
      target: 80,
      completed: netIncome >= 80,
    },
    {
      id: 'precision',
      label: 'Precision clinica',
      current: Math.round(precisionRatio * 100),
      target: 75,
      completed: precisionRatio >= 0.75,
    },
    {
      id: 'satisfaction',
      label: 'Satisfaccion',
      current: Math.round(satisfactionRatio * 100),
      target: 40,
      completed: satisfactionRatio >= 0.4,
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
