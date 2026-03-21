export const CLINIC_LEVEL_BENEFITS = {
  1: { maxPatients: 2, incomeBonus: 0, patientBonus: 0, referralChance: 0.05 },
  2: { maxPatients: 3, incomeBonus: 0.05, patientBonus: 0, referralChance: 0.08 },
  3: { maxPatients: 4, incomeBonus: 0.1, patientBonus: 1, referralChance: 0.1 },
  4: { maxPatients: 4, incomeBonus: 0.15, patientBonus: 1, referralChance: 0.12 },
  5: { maxPatients: 5, incomeBonus: 0.2, patientBonus: 2, referralChance: 0.15 },
  6: { maxPatients: 5, incomeBonus: 0.25, patientBonus: 2, referralChance: 0.18 },
  7: { maxPatients: 6, incomeBonus: 0.3, patientBonus: 3, referralChance: 0.2 },
  8: { maxPatients: 6, incomeBonus: 0.35, patientBonus: 3, referralChance: 0.22 },
  9: { maxPatients: 7, incomeBonus: 0.4, patientBonus: 4, referralChance: 0.25 },
  10: { maxPatients: 8, incomeBonus: 0.5, patientBonus: 5, referralChance: 0.3 },
};

export function getClinicBenefits(level) {
  return CLINIC_LEVEL_BENEFITS[level] || CLINIC_LEVEL_BENEFITS[1];
}
