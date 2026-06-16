/**
 * Manual smoke test for the cost calculator. Not part of the app bundle.
 * Run with: npx tsx scripts/smoke-test.ts (or `node --import tsx ...`)
 *
 * Verifies that:
 *  - boundary inputs (0, empty, negative, NaN, huge) never produce NaN/Infinity
 *  - 5 scenarios + 6 models produce sane per-model breakdowns
 *  - cheapest-model selection is deterministic
 */
import { computeCostReport, sanitizeUsage } from "../lib/calculate";
import { MODELS } from "../lib/pricing";
import { SCENARIOS } from "../lib/scenarios";
import { toSafeNumber, safeDivide } from "../lib/safeNumber";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  const status = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${status}] ${name}${detail ? `  -- ${detail}` : ""}`);
}

function assertFinite(name: string, value: number) {
  check(`${name} is finite`, Number.isFinite(value), String(value));
}

console.log("\n== safeNumber tests ==");
check("toSafeNumber('abc') -> 0", toSafeNumber("abc") === 0);
check("toSafeNumber('-5') -> 0", toSafeNumber("-5") === 0);
check("toSafeNumber('') -> 0", toSafeNumber("") === 0);
check("toSafeNumber(null) -> 0", toSafeNumber(null) === 0);
check("toSafeNumber(undefined) -> 0", toSafeNumber(undefined) === 0);
check("toSafeNumber(NaN) -> 0", toSafeNumber(NaN) === 0);
check("toSafeNumber(Infinity) -> 0", toSafeNumber(Infinity) === 0);
check("toSafeNumber('42.5') -> 42.5", toSafeNumber("42.5") === 42.5);
check("toSafeNumber('1e9') -> 1e9", toSafeNumber("1e9") === 1_000_000_000);
check("toSafeNumber(0) -> 0", toSafeNumber(0) === 0);
check("safeDivide(10, 0) -> 0", safeDivide(10, 0) === 0);
check("safeDivide(10, 2) -> 5", safeDivide(10, 2) === 5);
check("safeDivide(NaN, 1) -> 0", safeDivide(NaN, 1) === 0);

console.log("\n== sanitizeUsage ==");
const s1 = sanitizeUsage({
  dailyUsers: "abc",
  requestsPerUserPerDay: -3,
  avgInputTokens: "",
  avgOutputTokens: "200",
});
check("garbage -> all 0 except valid", s1.dailyUsers === 0 && s1.requestsPerUserPerDay === 0 && s1.avgInputTokens === 0 && s1.avgOutputTokens === 200);

const s2 = sanitizeUsage({
  dailyUsers: "100",
  requestsPerUserPerDay: "5",
  avgInputTokens: "1e9",
  avgOutputTokens: "9e9",
});
check("huge numbers accepted", s2.dailyUsers === 100 && s2.avgInputTokens === 1e9 && s2.avgOutputTokens === 9e9);

console.log("\n== boundary computeCostReport ==");
const zeros = computeCostReport(s1, MODELS);
assertFinite("zeros totalCost", zeros.models[0].totalCost);
check("zeros cheapestModelId is null", zeros.cheapestModelId === null);
check("zeros monthlyRequests = 0", zeros.monthlyRequests === 0);
check("zeros costPer1KRequests = 0", zeros.models[0].costPer1KRequests === 0);

const big = computeCostReport(s2, MODELS);
assertFinite("huge inputCost", big.models[0].inputCost);
assertFinite("huge outputCost", big.models[0].outputCost);
assertFinite("huge totalCost", big.models[0].totalCost);
assertFinite("huge costPer1KRequests", big.models[0].costPer1KRequests);
check("huge monthlyRequests correct", big.monthlyRequests === 100 * 5 * 30);

console.log("\n== 5 scenarios x 6 models ==");
for (const s of SCENARIOS) {
  const r = computeCostReport(s.usage, MODELS);
  assertFinite(`[${s.id}] totalCost`, r.models[0].totalCost);
  check(`[${s.id}] produces 6 rows`, r.models.length === 6);
  check(`[${s.id}] cheapest selected`, r.cheapestModelId !== null);
  const allPos = r.models.every((b) => b.totalCost >= 0);
  check(`[${s.id}] all totals non-negative`, allPos);
  const sorted = [...r.models].sort((a, b) => a.totalCost - b.totalCost);
  const expectedCheapest = sorted[0].model.model;
  check(
    `[${s.id}] cheapest matches sort`,
    r.cheapestModelId === expectedCheapest,
    `got=${r.cheapestModelId} expected=${expectedCheapest}`,
  );
}

console.log("\n== formula sanity (default scenario) ==");
const def = SCENARIOS[0].usage;
const defR = computeCostReport(def, MODELS);
const expectedMonthlyReq = def.dailyUsers * def.requestsPerUserPerDay * 30;
check("monthlyRequests formula", defR.monthlyRequests === expectedMonthlyReq);
const flash = defR.models.find((b) => b.model.model === "gemini-1.5-flash")!;
const expectedInputCost = (expectedMonthlyReq * def.avgInputTokens / 1e6) * flash.model.inputPer1M;
const expectedOutputCost = (expectedMonthlyReq * def.avgOutputTokens / 1e6) * flash.model.outputPer1M;
check("flash inputCost ~ expected", Math.abs(flash.inputCost - expectedInputCost) < 1e-9);
check("flash outputCost ~ expected", Math.abs(flash.outputCost - expectedOutputCost) < 1e-9);
check("flash total = input + output", Math.abs(flash.totalCost - (flash.inputCost + flash.outputCost)) < 1e-9);
check("flash per1k = total/monthlyReq*1000", Math.abs(flash.costPer1KRequests - (flash.totalCost / expectedMonthlyReq) * 1000) < 1e-9);

console.log("\n== summary ==");
console.log(`failures: ${failures}`);
if (failures > 0) process.exit(1);
