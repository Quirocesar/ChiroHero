export const SEASON_LENGTH_DAYS = 30;

export const STREAK_BONUSES = {
  3: { moneyBonus: 0.1, repBonus: 1 },
  7: { moneyBonus: 0.2, repBonus: 2 },
  14: { moneyBonus: 0.3, repBonus: 3 },
  30: { moneyBonus: 0.5, repBonus: 5 },
};

export function getSeasonNumber(currentDay) {
  return Math.ceil(currentDay / SEASON_LENGTH_DAYS);
}

export function getStreakBonus(streak) {
  let bonus = { moneyBonus: 0, repBonus: 0 };
  for (let days in STREAK_BONUSES) {
    if (streak >= parseInt(days, 10)) {
      bonus = STREAK_BONUSES[days];
    }
  }
  return bonus;
}
