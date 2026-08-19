import type { KlineData } from '@/types';

/** 简单移动平均线 */
export function ma(closes: number[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < n - 1) {
      result.push(NaN);
      continue;
    }
    let sum = 0;
    for (let j = i - n + 1; j <= i; j++) sum += closes[j];
    result.push(sum / n);
  }
  return result;
}

/** 指数移动平均线 */
export function ema(values: number[], n: number): number[] {
  const result: number[] = [];
  const k = 2 / (n + 1);
  let prev = values[0];
  result.push(prev);
  for (let i = 1; i < values.length; i++) {
    const curr = values[i] * k + prev * (1 - k);
    result.push(curr);
    prev = curr;
  }
  return result;
}

export interface MacdResult {
  dif: number[];
  dea: number[];
  hist: number[];
}

/** MACD：DIF = EMA12 - EMA26，DEA = DIF 的 9 日 EMA，柱 = 2*(DIF-DEA) */
export function macd(closes: number[]): MacdResult {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const dif = closes.map((_, i) => ema12[i] - ema26[i]);
  const dea = ema(dif, 9);
  const hist = closes.map((_, i) => 2 * (dif[i] - dea[i]));
  return { dif, dea, hist };
}

export interface KdjResult {
  k: number[];
  d: number[];
  j: number[];
}

/** KDJ（9,3,3）：RSV 的 3 日平滑 */
export function kdj(kline: KlineData[], n = 9): KdjResult {
  const k: number[] = [];
  const d: number[] = [];
  const j: number[] = [];
  let prevK = 50;
  let prevD = 50;

  for (let i = 0; i < kline.length; i++) {
    const start = Math.max(0, i - n + 1);
    let highest = -Infinity;
    let lowest = Infinity;
    for (let t = start; t <= i; t++) {
      highest = Math.max(highest, kline[t].high);
      lowest = Math.min(lowest, kline[t].low);
    }
    const rsv = highest === lowest ? 50 : ((kline[i].close - lowest) / (highest - lowest)) * 100;
    const currK = (2 / 3) * prevK + (1 / 3) * rsv;
    const currD = (2 / 3) * prevD + (1 / 3) * currK;
    const currJ = 3 * currK - 2 * currD;
    k.push(currK);
    d.push(currD);
    j.push(currJ);
    prevK = currK;
    prevD = currD;
  }
  return { k, d, j };
}

/** RSI（Wilder 平滑） */
export function rsi(closes: number[], n = 14): number[] {
  const result: number[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = Math.max(diff, 0);
    const loss = Math.max(-diff, 0);

    if (i <= n) {
      avgGain += gain / n;
      avgLoss += loss / n;
      if (i === n) {
        result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
      } else {
        result.push(NaN);
      }
    } else {
      avgGain = (avgGain * (n - 1) + gain) / n;
      avgLoss = (avgLoss * (n - 1) + loss) / n;
      result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
    }
  }
  return result;
}

/** 判断最新一根 K 线是否发生 MACD 金叉（DIF 上穿 DEA） */
export function isMacdGoldenCross(dif: number[], dea: number[]): boolean {
  if (dif.length < 2 || dea.length < 2) return false;
  const i = dif.length - 1;
  return dif[i - 1] <= dea[i - 1] && dif[i] > dea[i];
}

/** 判断最新一根 K 线是否发生 KDJ 金叉（K 上穿 D） */
export function isKdjGoldenCross(k: number[], d: number[]): boolean {
  if (k.length < 2 || d.length < 2) return false;
  const i = k.length - 1;
  return k[i - 1] <= d[i - 1] && k[i] > d[i];
}

/** 均线多头排列：MA5 > MA10 > MA20 */
export function isBullsAlignment(closes: number[]): boolean {
  const ma5 = ma(closes, 5);
  const ma10 = ma(closes, 10);
  const ma20 = ma(closes, 20);
  const i = closes.length - 1;
  if (i < 20) return false;
  return ma5[i] > ma10[i] && ma10[i] > ma20[i];
}

/** 最新 RSI 值 */
export function latestRsi(closes: number[]): number | null {
  const values = rsi(closes, 14);
  for (let i = values.length - 1; i >= 0; i--) {
    if (!Number.isNaN(values[i])) return values[i];
  }
  return null;
}

/** BOLL 布林带（20,2） */
export function boll(closes: number[], n = 20, k = 2): { mid: number[]; upper: number[]; lower: number[] } {
  const mid: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < n - 1) {
      mid.push(NaN);
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    let sum = 0;
    for (let j = i - n + 1; j <= i; j++) sum += closes[j];
    const mean = sum / n;
    let variance = 0;
    for (let j = i - n + 1; j <= i; j++) variance += (closes[j] - mean) ** 2;
    const std = Math.sqrt(variance / n);
    mid.push(mean);
    upper.push(mean + k * std);
    lower.push(mean - k * std);
  }
  return { mid, upper, lower };
}

/** BOLL 突破上轨（看涨） */
export function isBollBreakout(closes: number[]): boolean {
  const { upper } = boll(closes);
  const i = closes.length - 1;
  if (i < 20) return false;
  return closes[i] > upper[i];
}

/** 最新 WR（威廉指标）值 */
export function latestWr(kline: KlineData[], n = 14): number | null {
  if (kline.length < n) return null;
  let highest = -Infinity;
  let lowest = Infinity;
  for (let i = kline.length - n; i < kline.length; i++) {
    highest = Math.max(highest, kline[i].high);
    lowest = Math.min(lowest, kline[i].low);
  }
  if (highest === lowest) return 50;
  const close = kline[kline.length - 1].close;
  return ((highest - close) / (highest - lowest)) * 100;
}

/** WR 超卖（WR > 80，看涨） */
export function isWrOversold(kline: KlineData[], n = 14): boolean {
  const wr = latestWr(kline, n);
  return wr != null && wr > 80;
}
