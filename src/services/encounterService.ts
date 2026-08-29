import { EncounterDifficulty } from '../types/encounter';

export const CR_XP_MAP: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
};

// XP Thresholds per Character Level (Easy, Medium, Hard, Deadly, Daily Budget)
export const XP_THRESHOLDS_PER_LEVEL: Record<number, { easy: number; medium: number; hard: number; deadly: number; daily: number }> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100, daily: 300 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200, daily: 600 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400, daily: 1200 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500, daily: 1700 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100, daily: 3500 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400, daily: 4000 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700, daily: 5000 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100, daily: 6000 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400, daily: 7500 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800, daily: 9000 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600, daily: 10500 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500, daily: 11500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100, daily: 13500 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700, daily: 15000 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400, daily: 18000 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200, daily: 20000 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800, daily: 25000 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500, daily: 27000 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900, daily: 30000 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700, daily: 40000 },
};

export function getMonsterMultiplier(monsterCount: number, partySize: number): number {
  let multiplier = 1;
  if (monsterCount === 1) multiplier = 1;
  else if (monsterCount === 2) multiplier = 1.5;
  else if (monsterCount >= 3 && monsterCount <= 6) multiplier = 2;
  else if (monsterCount >= 7 && monsterCount <= 10) multiplier = 2.5;
  else if (monsterCount >= 11 && monsterCount <= 14) multiplier = 3;
  else if (monsterCount >= 15) multiplier = 4;

  // Party size adjustment
  if (partySize < 3) {
    if (monsterCount === 1) multiplier = 1.5;
    else if (monsterCount === 2) multiplier = 2;
    else if (monsterCount >= 3 && monsterCount <= 6) multiplier = 2.5;
    else if (monsterCount >= 7 && monsterCount <= 10) multiplier = 3;
    else if (monsterCount >= 11 && monsterCount <= 14) multiplier = 4;
    else if (monsterCount >= 15) multiplier = 5;
  } else if (partySize >= 6) {
    if (monsterCount === 1) multiplier = 0.5;
    else if (monsterCount === 2) multiplier = 1;
    else if (monsterCount >= 3 && monsterCount <= 6) multiplier = 1.5;
    else if (monsterCount >= 7 && monsterCount <= 10) multiplier = 2;
    else if (monsterCount >= 11 && monsterCount <= 14) multiplier = 2.5;
    else if (monsterCount >= 15) multiplier = 3;
  }

  return multiplier;
}

export function calculateEncounterBudget(
  playerLevels: number[],
  monsters: { xp: number; count: number }[]
): {
  totalRawXp: number;
  adjustedXp: number;
  difficulty: EncounterDifficulty;
  thresholds: { easy: number; medium: number; hard: number; deadly: number; daily: number };
  multiplier: number;
  totalMonsters: number;
} {
  const partySize = playerLevels.length || 1;
  
  // Calculate Party Thresholds
  const thresholds = playerLevels.reduce(
    (acc, lvl) => {
      const clampedLevel = Math.max(1, Math.min(20, lvl));
      const t = XP_THRESHOLDS_PER_LEVEL[clampedLevel] || XP_THRESHOLDS_PER_LEVEL[1];
      return {
        easy: acc.easy + t.easy,
        medium: acc.medium + t.medium,
        hard: acc.hard + t.hard,
        deadly: acc.deadly + t.deadly,
        daily: acc.daily + t.daily,
      };
    },
    { easy: 0, medium: 0, hard: 0, deadly: 0, daily: 0 }
  );

  let totalRawXp = 0;
  let totalMonsters = 0;

  for (const m of monsters) {
    totalRawXp += m.xp * m.count;
    totalMonsters += m.count;
  }

  const multiplier = getMonsterMultiplier(totalMonsters, partySize);
  const adjustedXp = Math.round(totalRawXp * multiplier);

  let difficulty: EncounterDifficulty = 'Trivial';
  if (adjustedXp >= thresholds.deadly) {
    difficulty = 'Deadly';
  } else if (adjustedXp >= thresholds.hard) {
    difficulty = 'Hard';
  } else if (adjustedXp >= thresholds.medium) {
    difficulty = 'Medium';
  } else if (adjustedXp >= thresholds.easy) {
    difficulty = 'Easy';
  }

  return {
    totalRawXp,
    adjustedXp,
    difficulty,
    thresholds,
    multiplier,
    totalMonsters,
  };
}
