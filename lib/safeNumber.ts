/**
 * Sanitize arbitrary user / URL / form input into a non-negative finite number.
 *
 * Any value that is not a finite non-negative number is replaced with `fallback`.
 * This guarantees the calculator never sees NaN, Infinity, or negative numbers.
 */
export function toSafeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return num;
}

/**
 * Integer-safe variant: clamps to integers >= 0, also rejects fractional noise
 * from URL strings like "5.5". Used for request counts.
 */
export function toSafeInteger(value: unknown, fallback = 0): number {
  const num = toSafeNumber(value, fallback);
  return Math.floor(num);
}

/**
 * Divide a by b, returning `fallback` when the result would be NaN / Infinity.
 * Prevents divide-by-zero explosions in the cost formulas.
 */
export function safeDivide(a: number, b: number, fallback = 0): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return fallback;
  const result = a / b;
  return Number.isFinite(result) ? result : fallback;
}
