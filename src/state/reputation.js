export const REPUTATION_TITLES = {
  1: { title: 'Aprendiz', minRep: 0, maxPatientsBonus: 0, tipBonus: 0 },
  2: { title: 'Principiante', minRep: 50, maxPatientsBonus: 0, tipBonus: 0.05 },
  3: { title: 'Competente', minRep: 150, maxPatientsBonus: 0, tipBonus: 0.1 },
  4: { title: 'Experto', minRep: 300, maxPatientsBonus: 1, tipBonus: 0.15 },
  5: { title: 'Avanzado', minRep: 500, maxPatientsBonus: 1, tipBonus: 0.2 },
  6: { title: 'Maestro', minRep: 750, maxPatientsBonus: 2, tipBonus: 0.25 },
  7: { title: 'Experto Senior', minRep: 1000, maxPatientsBonus: 2, tipBonus: 0.3 },
  8: { title: 'Licenciado', minRep: 1500, maxPatientsBonus: 3, tipBonus: 0.35 },
  9: { title: 'Doctor', minRep: 2000, maxPatientsBonus: 3, tipBonus: 0.4 },
  10: { title: 'Doctor Senior', minRep: 3000, maxPatientsBonus: 4, tipBonus: 0.45 },
  15: { title: 'Especialista', minRep: 5000, maxPatientsBonus: 5, tipBonus: 0.5 },
  20: { title: 'Cirujano', minRep: 7500, maxPatientsBonus: 6, tipBonus: 0.55 },
  25: { title: 'Jefe de Clinica', minRep: 10000, maxPatientsBonus: 7, tipBonus: 0.6 },
  30: { title: 'Director', minRep: 15000, maxPatientsBonus: 8, tipBonus: 0.65 },
  35: { title: 'Consul', minRep: 20000, maxPatientsBonus: 9, tipBonus: 0.7 },
  40: { title: 'Ministro', minRep: 30000, maxPatientsBonus: 10, tipBonus: 0.75 },
  45: { title: 'Legado', minRep: 50000, maxPatientsBonus: 12, tipBonus: 0.8 },
  50: { title: 'Leyenda', minRep: 100000, maxPatientsBonus: 15, tipBonus: 1.0 },
};

export const RANK_TIERS = {
  Bronze: { minRep: 0, maxRep: 500, color: '#cd7f32' },
  Silver: { minRep: 501, maxRep: 1500, color: '#c0c0c0' },
  Gold: { minRep: 1501, maxRep: 4000, color: '#ffd700' },
  Platinum: { minRep: 4001, maxRep: 10000, color: '#e5e4e2' },
  Diamond: { minRep: 10001, maxRep: Infinity, color: '#b9f2ff' },
};

export function getReputationLevel(rep) {
  let level = 1;
  for (let lvl in REPUTATION_TITLES) {
    if (rep >= REPUTATION_TITLES[lvl].minRep) {
      level = parseInt(lvl, 10);
    }
  }
  return level;
}

export function getReputationTitle(rep) {
  const level = getReputationLevel(rep);
  return REPUTATION_TITLES[level]?.title || 'Aprendiz';
}

export function getCurrentRank(rep) {
  for (let rank in RANK_TIERS) {
    if (rep >= RANK_TIERS[rank].minRep && rep <= RANK_TIERS[rank].maxRep) {
      return { rank, ...RANK_TIERS[rank] };
    }
  }
  return { rank: 'Bronze', ...RANK_TIERS.Bronze };
}
