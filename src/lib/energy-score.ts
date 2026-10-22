/**
 * Calia Lab exploratory energy index, 0–100 (higher is more energy).
 * Equal weights: 50% perceived energy and 50% reversed fatigue interference.
 * NOT clinically validated and not for diagnosis, triage, or treatment.
 */
export function calculateEnergyScore(
  energy: number | null,
  fatigueSum: number | null
): number | null {
  if (
    energy === null || fatigueSum === null ||
    !Number.isInteger(energy) || energy < 1 || energy > 10 ||
    !Number.isInteger(fatigueSum) || fatigueSum < 9 || fatigueSum > 63
  ) return null;
  const reportedEnergy = (energy - 1) / 9;
  const reversedInterference = (63 - fatigueSum) / 54;
  return Math.round(50 * reportedEnergy + 50 * reversedInterference);
}
