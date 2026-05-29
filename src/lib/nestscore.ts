export interface NestScoreBreakdown {
  safety: number;
  cleanliness: number;
  connectivity: number;
  value: number;
  food: number;
}

export function calculateNestScore(scores: NestScoreBreakdown) {
  const weights = {
    safety: 0.3,
    cleanliness: 0.24,
    connectivity: 0.16,
    value: 0.18,
    food: 0.12,
  } as const;

  const overall =
    scores.safety * weights.safety +
    scores.cleanliness * weights.cleanliness +
    scores.connectivity * weights.connectivity +
    scores.value * weights.value +
    scores.food * weights.food;

  return Number(overall.toFixed(2));
}