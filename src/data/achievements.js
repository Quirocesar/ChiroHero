// Achievement definitions for ChiroHero

export const ACHIEVEMENT_CATEGORIES = {
  PATIENTS: 'patients',
  SKILL: 'skill',
  MONEY: 'money',
  STREAK: 'streak',
  SPECIAL: 'special',
  MILESTONE: 'milestone',
};

export const ACHIEVEMENTS = [
  // Patient-related achievements
  {
    id: 'first_patient',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '👋',
    titleKey: 'ach_first_patient_title',
    descKey: 'ach_first_patient_desc',
    requirement: { type: 'patients', count: 1 },
    reward: { type: 'money', value: 50 },
  },
  {
    id: 'ten_patients',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '🏥',
    titleKey: 'ach_ten_patients_title',
    descKey: 'ach_ten_patients_desc',
    requirement: { type: 'patients', count: 10 },
    reward: { type: 'money', value: 200 },
  },
  {
    id: 'fifty_patients',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '🩺',
    titleKey: 'ach_fifty_patients_title',
    descKey: 'ach_fifty_patients_desc',
    requirement: { type: 'patients', count: 50 },
    reward: { type: 'money', value: 500 },
  },
  {
    id: 'hundred_patients',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '🎖️',
    titleKey: 'ach_hundred_patients_title',
    descKey: 'ach_hundred_patients_desc',
    requirement: { type: 'patients', count: 100 },
    reward: { type: 'money', value: 1000 },
  },
  {
    id: 'five_hundred_patients',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '👨‍⚕️',
    titleKey: 'ach_five_hundred_patients_title',
    descKey: 'ach_five_hundred_patients_desc',
    requirement: { type: 'patients', count: 500 },
    reward: { type: 'money', value: 5000 },
  },
  
  // Referral achievements
  {
    id: 'first_referral',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '📋',
    titleKey: 'ach_first_referral_title',
    descKey: 'ach_first_referral_desc',
    requirement: { type: 'referrals', count: 1 },
    reward: { type: 'reputation', value: 10 },
  },
  {
    id: 'ten_referrals',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '🏥',
    titleKey: 'ach_ten_referrals_title',
    descKey: 'ach_ten_referrals_desc',
    requirement: { type: 'referrals', count: 10 },
    reward: { type: 'reputation', value: 50 },
  },
  
  // Skill/Level achievements
  {
    id: 'skill_level_5',
    category: ACHIEVEMENT_CATEGORIES.SKILL,
    icon: '⭐',
    titleKey: 'ach_skill_5_title',
    descKey: 'ach_skill_5_desc',
    requirement: { type: 'skillLevel', count: 5 },
    reward: { type: 'money', value: 300 },
  },
  {
    id: 'skill_level_10',
    category: ACHIEVEMENT_CATEGORIES.SKILL,
    icon: '🌟',
    titleKey: 'ach_skill_10_title',
    descKey: 'ach_skill_10_desc',
    requirement: { type: 'skillLevel', count: 10 },
    reward: { type: 'money', value: 1000 },
  },
  {
    id: 'skill_level_20',
    category: ACHIEVEMENT_CATEGORIES.SKILL,
    icon: '💫',
    titleKey: 'ach_skill_20_title',
    descKey: 'ach_skill_20_desc',
    requirement: { type: 'skillLevel', count: 20 },
    reward: { type: 'money', value: 2500 },
  },
  
  // Money achievements
  {
    id: 'first_1000',
    category: ACHIEVEMENT_CATEGORIES.MONEY,
    icon: '💰',
    titleKey: 'ach_first_1000_title',
    descKey: 'ach_first_1000_desc',
    requirement: { type: 'totalMoney', count: 1000 },
    reward: { type: 'money', value: 100 },
  },
  {
    id: 'first_10000',
    category: ACHIEVEMENT_CATEGORIES.MONEY,
    icon: '💵',
    titleKey: 'ach_first_10000_title',
    descKey: 'ach_first_10000_desc',
    requirement: { type: 'totalMoney', count: 10000 },
    reward: { type: 'money', value: 500 },
  },
  {
    id: 'rich_doctor',
    category: ACHIEVEMENT_CATEGORIES.MONEY,
    icon: '🤑',
    titleKey: 'ach_rich_doctor_title',
    descKey: 'ach_rich_doctor_desc',
    requirement: { type: 'totalMoney', count: 50000 },
    reward: { type: 'money', value: 2000 },
  },
  
  // Streak achievements
  {
    id: 'perfect_day',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '✨',
    titleKey: 'ach_perfect_day_title',
    descKey: 'ach_perfect_day_desc',
    requirement: { type: 'perfectDays', count: 1 },
    reward: { type: 'reputation', value: 25 },
  },
  {
    id: 'week_perfect',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '🔥',
    titleKey: 'ach_week_perfect_title',
    descKey: 'ach_week_perfect_desc',
    requirement: { type: 'perfectDays', count: 7 },
    reward: { type: 'reputation', value: 100 },
  },
  {
    id: 'streak_10',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '💪',
    titleKey: 'ach_streak_10_title',
    descKey: 'ach_streak_10_desc',
    requirement: { type: 'streak', count: 10 },
    reward: { type: 'money', value: 300 },
  },
  {
    id: 'streak_50',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '🏆',
    titleKey: 'ach_streak_50_title',
    descKey: 'ach_streak_50_desc',
    requirement: { type: 'streak', count: 50 },
    reward: { type: 'money', value: 1000 },
  },
  
  // Special achievements
  {
    id: 'first_vip',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '🌟',
    titleKey: 'ach_first_vip_title',
    descKey: 'ach_first_vip_desc',
    requirement: { type: 'vipPatients', count: 1 },
    reward: { type: 'reputation', value: 20 },
  },
  {
    id: 'ten_vips',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '👑',
    titleKey: 'ach_ten_vips_title',
    descKey: 'ach_ten_vips_desc',
    requirement: { type: 'vipPatients', count: 10 },
    reward: { type: 'money', value: 500 },
  },
  {
    id: 'returning_patient',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '🔄',
    titleKey: 'ach_returning_patient_title',
    descKey: 'ach_returning_patient_desc',
    requirement: { type: 'returningPatients', count: 1 },
    reward: { type: 'reputation', value: 15 },
  },
  
  // Milestone achievements
  {
    id: 'day_7',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    icon: '📅',
    titleKey: 'ach_day_7_title',
    descKey: 'ach_day_7_desc',
    requirement: { type: 'days', count: 7 },
    reward: { type: 'money', value: 100 },
  },
  {
    id: 'day_30',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    icon: '🗓️',
    titleKey: 'ach_day_30_title',
    descKey: 'ach_day_30_desc',
    requirement: { type: 'days', count: 30 },
    reward: { type: 'money', value: 500 },
  },
  {
    id: 'day_100',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    icon: '📆',
    titleKey: 'ach_day_100_title',
    descKey: 'ach_day_100_desc',
    requirement: { type: 'days', count: 100 },
    reward: { type: 'money', value: 2000 },
  },
  {
    id: 'day_365',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    icon: '🎉',
    titleKey: 'ach_day_365_title',
    descKey: 'ach_day_365_desc',
    requirement: { type: 'days', count: 365 },
    reward: { type: 'money', value: 10000 },
  },
  
  // Perfect treatment achievements
  {
    id: 'perfect_treatment',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '💯',
    titleKey: 'ach_perfect_treatment_title',
    descKey: 'ach_perfect_treatment_desc',
    requirement: { type: 'perfectTreatments', count: 1 },
    reward: { type: 'reputation', value: 10 },
  },
  {
    id: 'perfect_master',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '🎯',
    titleKey: 'ach_perfect_master_title',
    descKey: 'ach_perfect_master_desc',
    requirement: { type: 'perfectTreatments', count: 50 },
    reward: { type: 'money', value: 750 },
  },
  
  // === NEW ACHIEVEMENTS ===
  // Revenue milestones
  {
    id: 'money_100k',
    category: ACHIEVEMENT_CATEGORIES.MONEY,
    icon: '💎',
    titleKey: 'ach_money_100k_title',
    descKey: 'ach_money_100k_desc',
    requirement: { type: 'totalMoney', count: 100000 },
    reward: { type: 'money', value: 5000 },
  },
  {
    id: 'money_500k',
    category: ACHIEVEMENT_CATEGORIES.MONEY,
    icon: '🏦',
    titleKey: 'ach_money_500k_title',
    descKey: 'ach_money_500k_desc',
    requirement: { type: 'totalMoney', count: 500000 },
    reward: { type: 'money', value: 10000 },
  },
  {
    id: 'millionaire',
    category: ACHIEVEMENT_CATEGORIES.MONEY,
    icon: '🤑',
    titleKey: 'ach_millionaire_title',
    descKey: 'ach_millionaire_desc',
    requirement: { type: 'totalMoney', count: 1000000 },
    reward: { type: 'money', value: 50000 },
  },
  
  // Patient care achievements
  {
    id: 'healer_100',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '🌡️',
    titleKey: 'ach_healer_100_title',
    descKey: 'ach_healer_100_desc',
    requirement: { type: 'patients', count: 100 },
    reward: { type: 'reputation', value: 100 },
  },
  {
    id: 'healer_1000',
    category: ACHIEVEMENT_CATEGORIES.PATIENTS,
    icon: '🩺',
    titleKey: 'ach_healer_1000_title',
    descKey: 'ach_healer_1000_desc',
    requirement: { type: 'patients', count: 1000 },
    reward: { type: 'money', value: 10000 },
  },
  
  // Treatment achievements
  {
    id: 'speed_adjust',
    category: ACHIEVEMENT_CATEGORIES.SKILL,
    icon: '⚡',
    titleKey: 'ach_speed_adjust_title',
    descKey: 'ach_speed_adjust_desc',
    requirement: { type: 'fastTreatments', count: 10 },
    reward: { type: 'reputation', value: 25 },
  },
  {
    id: 'combo_master',
    category: ACHIEVEMENT_CATEGORIES.SKILL,
    icon: '🔥',
    titleKey: 'ach_combo_master_title',
    descKey: 'ach_combo_master_desc',
    requirement: { type: 'maxCombo', count: 10 },
    reward: { type: 'money', value: 500 },
  },
  
  // Reputation achievements
  {
    id: 'reputation_100',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    icon: '📈',
    titleKey: 'ach_reputation_100_title',
    descKey: 'ach_reputation_100_desc',
    requirement: { type: 'reputation', count: 100 },
    reward: { type: 'money', value: 200 },
  },
  {
    id: 'reputation_500',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    icon: '⭐',
    titleKey: 'ach_reputation_500_title',
    descKey: 'ach_reputation_500_desc',
    requirement: { type: 'reputation', count: 500 },
    reward: { type: 'money', value: 500 },
  },
  {
    id: 'reputation_1000',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    icon: '🌟',
    titleKey: 'ach_reputation_1000_title',
    descKey: 'ach_reputation_1000_desc',
    requirement: { type: 'reputation', count: 1000 },
    reward: { type: 'money', value: 1000 },
  },
  
  // Special achievements
  {
    id: 'multi_treatments',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '💆',
    titleKey: 'ach_multi_treatments_title',
    descKey: 'ach_multi_treatments_desc',
    requirement: { type: 'treatmentsInDay', count: 10 },
    reward: { type: 'reputation', value: 30 },
  },
  {
    id: 'no_mistakes',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '✅',
    titleKey: 'ach_no_mistakes_title',
    descKey: 'ach_no_mistakes_desc',
    requirement: { type: 'perfectDays', count: 3 },
    reward: { type: 'money', value: 300 },
  },
  {
    id: 'clinic_expansion',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '🏥',
    titleKey: 'ach_clinic_expansion_title',
    descKey: 'ach_clinic_expansion_desc',
    requirement: { type: 'clinicLevel', count: 5 },
    reward: { type: 'money', value: 2000 },
  },
  {
    id: 'clinic_master',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: '🏩',
    titleKey: 'ach_clinic_master_title',
    descKey: 'ach_clinic_master_desc',
    requirement: { type: 'clinicLevel', count: 10 },
    reward: { type: 'money', value: 10000 },
  },
];

export function checkAchievements(gameState) {
  const unlocked = [];
  const achievements = gameState.get('achievements') || [];
  const stats = gameState.get('stats') || {};
  const state = {
    patients: gameState.get('totalPatientsHealed') || 0,
    referrals: gameState.get('totalPatientsReferred') || 0,
    skillLevel: gameState.get('skillLevel') || 1,
    totalMoney: gameState.get('totalMoneyEarned') || 0,
    currentMoney: gameState.get('money') || 0,
    reputation: gameState.get('reputation') || 0,
    streak: stats.currentStreak || 0,
    perfectDays: stats.perfectDays || 0,
    vipPatients: gameState.get('premiumPatientsServed') || 0,
    returningPatients: (gameState.get('satisfiedPatients') || []).length,
    days: gameState.get('currentDay') || 1,
    perfectTreatments: stats.perfectAdjustments || 0,
  };

  for (const achievement of ACHIEVEMENTS) {
    if (achievements.includes(achievement.id)) continue;
    
    const currentValue = state[achievement.requirement.type] || 0;
    if (currentValue >= achievement.requirement.count) {
      unlocked.push(achievement);
    }
  }
  
  return unlocked;
}

export function unlockAchievement(gameState, achievement) {
  const achievements = gameState.get('achievements') || [];
  if (achievements.includes(achievement.id)) return false;
  
  achievements.push(achievement.id);
  gameState.set({ achievements });
  
  if (achievement.reward) {
    switch (achievement.reward.type) {
      case 'money':
        gameState.earnMoney(achievement.reward.value);
        break;
      case 'reputation':
        gameState.set({ reputation: gameState.get('reputation') + achievement.reward.value });
        break;
      case 'xp':
        gameState.addExperience(achievement.reward.value);
        break;
    }
  }
  
  return true;
}
