/**
 * Модель мембранного потенциала пейсмейкерной клетки синусового узла.
 *
 * Физиология, которую воспроизводит модель:
 *  — у клетки нет стабильного потенциала покоя: после реполяризации
 *    потенциал сразу начинает медленно смещаться к порогу (фаза 4,
 *    спонтанная диастолическая деполяризация);
 *  — раннюю часть фазы 4 поддерживает Iᶠ (HCN-каналы, смешанный ток
 *    Na⁺/K⁺ с результирующим входящим влиянием), позднюю — вход Ca²⁺
 *    через каналы T-типа;
 *  — фаза 0 в этих клетках обусловлена входом Ca²⁺ через каналы L-типа,
 *    поэтому подъём пологий, а не «спицеобразный», как в рабочем миокарде;
 *  — фаза 3 — выход K⁺.
 *
 * Симпатическое влияние (β₁ → цАМФ) увеличивает наклон фазы 4;
 * парасимпатическое (M₂ → снижение цАМФ, рост калиевой проводимости)
 * уменьшает наклон и делает максимальный диастолический потенциал
 * более отрицательным.
 */

export type APMode = 'baseline' | 'sympathetic' | 'parasympathetic';

export type APConfig = {
  /** Максимальный диастолический потенциал, мВ. */
  mdp: number;
  /** Порог возбуждения, мВ. */
  threshold: number;
  /** Пик потенциала действия, мВ. */
  peak: number;
  /** Длительность фазы 4, мс. */
  phase4: number;
  /** Длительность фазы 0, мс. */
  phase0: number;
  /** Длительность фазы 3, мс. */
  phase3: number;
};

export const AP_MODES: Record<APMode, APConfig> = {
  baseline: {mdp: -60, threshold: -40, peak: 10, phase4: 640, phase0: 60, phase3: 160},
  sympathetic: {mdp: -58, threshold: -40, peak: 12, phase4: 360, phase0: 55, phase3: 145},
  parasympathetic: {mdp: -68, threshold: -40, peak: 8, phase4: 1020, phase0: 65, phase3: 170},
};

export const cycleMs = (cfg: APConfig): number => cfg.phase4 + cfg.phase0 + cfg.phase3;

export const bpm = (cfg: APConfig): number => Math.round(60000 / cycleMs(cfg));

export type Phase = 4 | 0 | 3;

export type APSample = {
  /** Время от начала первого цикла, мс. */
  t: number;
  /** Мембранный потенциал, мВ. */
  v: number;
  phase: Phase;
};

const smootherstep = (u: number) => u * u * (3 - 2 * u);

/** Потенциал в момент времени внутри одного цикла. */
export const potentialAt = (cfg: APConfig, tInCycle: number): {v: number; phase: Phase} => {
  const {mdp, threshold, peak, phase4, phase0, phase3} = cfg;

  if (tInCycle < phase4) {
    // Фаза 4: почти линейный дрейф с лёгким ускорением в конце,
    // когда подключается кальциевый ток T-типа.
    const u = tInCycle / phase4;
    const shaped = 0.58 * u + 0.42 * Math.pow(u, 2.3);
    return {v: mdp + (threshold - mdp) * shaped, phase: 4};
  }

  if (tInCycle < phase4 + phase0) {
    // Фаза 0: подъём за счёт Ca²⁺ через каналы L-типа — пологий, округлый.
    const u = (tInCycle - phase4) / phase0;
    return {v: threshold + (peak - threshold) * smootherstep(u), phase: 0};
  }

  // Фаза 3: реполяризация выходом K⁺.
  const u = Math.min(1, (tInCycle - phase4 - phase0) / phase3);
  return {v: peak - (peak - mdp) * smootherstep(u), phase: 3};
};

/** Дискретизация нескольких циклов подряд. */
export const sampleAP = (cfg: APConfig, cycles: number, stepMs = 3): APSample[] => {
  const total = cycleMs(cfg) * cycles;
  const out: APSample[] = [];
  for (let t = 0; t <= total; t += stepMs) {
    const tInCycle = t % cycleMs(cfg);
    const {v, phase} = potentialAt(cfg, tInCycle);
    out.push({t, v, phase});
  }
  return out;
};

/** Момент достижения порога в цикле n (мс от начала записи). */
export const thresholdCrossings = (cfg: APConfig, cycles: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < cycles; i++) out.push(i * cycleMs(cfg) + cfg.phase4);
  return out;
};
