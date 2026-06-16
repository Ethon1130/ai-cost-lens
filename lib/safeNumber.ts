/**
 * Sanitize arbitrary user / URL / form input into a non-negative finite number.
 *
 * Any value that is not a finite non-negative number is replaced with `fallback`.
 * This guarantees the calculator never sees NaN, Infinity, or negative numbers.
 */
export function toSafeNumber(
  value: unknown,
  fallback = 0,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  },
): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;

  const min = options?.min ?? 0;
  const max = options?.max ?? Number.MAX_SAFE_INTEGER;
  let safe = Math.min(Math.max(num, min), max);

  if (options?.integer) {
    safe = Math.floor(safe);
  }

  return safe;
}

/**
 * Integer-safe variant: clamps to integers >= 0, also rejects fractional noise
 * from URL strings like "5.5". Used for request counts.
 */
export function toSafeInteger(value: unknown, fallback = 0): number {
  return toSafeNumber(value, fallback, { integer: true });
}

/**
 * Clamp a value to the [0, 1] range, used for rates like retryRate.
 */
export function clamp01(value: unknown, fallback = 0): number {
  return toSafeNumber(value, fallback, { min: 0, max: 1 });
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
