/**
 * Manual smoke test for the cost calculator. Not part of the app bundle.
 * Run with: npx tsx scripts/smoke-test.ts (or `node --import tsx ...`)
 *
 * Verifies that:
 *  - boundary inputs (0, empty, negative, NaN, huge) never produce NaN/Infinity
 *  - 5 scenarios derive scenario-specific input/output token assumptions
 *  - unit economics and savings comparison stay finite and deterministic
 */
import { computeCostReport, pickCheapest, sanitizeUsage } from "../lib/calculate";
import { MODELS } from "../lib/pricing";
import type { ModelCostBreakdown } from "../lib/pricing";
import { SCENARIOS } from "../lib/scenarios";
import { deriveScenarioTokens } from "../lib/scenarioTokens";
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
check("toSafeNumber('2.9', integer) -> 2", toSafeNumber("2.9", 0, { integer: true }) === 2);
check("toSafeNumber('99', max 10) -> 10", toSafeNumber("99", 0, { max: 10 }) === 10);
check("safeDivide(10, 0) -> 0", safeDivide(10, 0) === 0);
check("safeDivide(10, 2) -> 5", safeDivide(10, 2) === 5);
check("safeDivide(NaN, 1) -> 0", safeDivide(NaN, 1) === 0);

console.log("\n== sanitizeUsage ==");
const s1 = sanitizeUsage({
  requestsPerDay: "abc",
  daysPerMonth: -3,
  activeUsers: "abc",
  avgInputTokens: "",
  avgOutputTokens: "200",
});
check("garbage -> all 0 except valid", s1.requestsPerDay === 0 && s1.daysPerMonth === 0 && s1.activeUsers === 0 && s1.avgInputTokens === 0 && s1.avgOutputTokens === 200);

const s2 = sanitizeUsage({
  requestsPerDay: "500",
  daysPerMonth: "30",
  activeUsers: "100",
  avgInputTokens: "1e9",
  avgOutputTokens: "9e9",
});
check("huge numbers accepted", s2.requestsPerDay === 500 && s2.activeUsers === 100 && s2.avgInputTokens === 1e9 && s2.avgOutputTokens === 9e9);

console.log("\n== boundary computeCostReport ==");
const zeros = computeCostReport(s1, MODELS);
assertFinite("zeros totalCost", zeros.models[0].totalCost);
check("zeros cheapestModelId is null", zeros.cheapestModelId === null);
check("zeros mostExpensiveModelId is null", zeros.mostExpensiveModelId === null);
check("zeros monthlyRequests = 0", zeros.monthlyRequests === 0);
check("zeros costPer1KRequests = 0", zeros.models[0].costPer1KRequests === 0);
check("zeros costPerRequest = 0", zeros.models[0].costPerRequest === 0);
check("zeros savings amount = 0", zeros.savingsIfSwitchToCheapest.amount === 0);

const big = computeCostReport(s2, MODELS);
assertFinite("huge inputCost", big.models[0].inputCost);
assertFinite("huge outputCost", big.models[0].outputCost);
assertFinite("huge totalCost", big.models[0].totalCost);
assertFinite("huge costPerRequest", big.models[0].costPerRequest);
assertFinite("huge costPer1KRequests", big.models[0].costPer1KRequests);
assertFinite("huge costPerActiveUserPerMonth", big.models[0].costPerActiveUserPerMonth);
check("huge monthlyRequests correct", big.monthlyRequests === 500 * 30);

console.log("\n== 5 scenarios x 6 models ==");
for (const s of SCENARIOS) {
  const tokens = deriveScenarioTokens(s.params);
  const usage = {
    ...s.usage,
    avgInputTokens: tokens.avgInputTokens,
    avgOutputTokens: tokens.avgOutputTokens,
  };
  const r = computeCostReport(usage, MODELS);
  assertFinite(`[${s.id}] avgInputTokens`, tokens.avgInputTokens);
  assertFinite(`[${s.id}] avgOutputTokens`, tokens.avgOutputTokens);
  check(`[${s.id}] token derivation non-negative`, tokens.avgInputTokens >= 0 && tokens.avgOutputTokens >= 0);
  assertFinite(`[${s.id}] totalCost`, r.models[0].totalCost);
  check(`[${s.id}] produces 6 rows`, r.models.length === 6);
  check(`[${s.id}] cheapest selected`, r.cheapestModelId !== null);
  check(`[${s.id}] most expensive selected`, r.mostExpensiveModelId !== null);
  const allPos = r.models.every((b) => b.totalCost >= 0);
  check(`[${s.id}] all totals non-negative`, allPos);
  const sorted = [...r.models].sort((a, b) => a.totalCost - b.totalCost);
  const expectedCheapest = sorted[0].model.model;
  const expectedMostExpensive = sorted[sorted.length - 1].model.model;
  check(
    `[${s.id}] cheapest matches sort`,
    r.cheapestModelId === expectedCheapest,
    `got=${r.cheapestModelId} expected=${expectedCheapest}`,
  );
  check(
    `[${s.id}] most expensive matches sort`,
    r.mostExpensiveModelId === expectedMostExpensive,
    `got=${r.mostExpensiveModelId} expected=${expectedMostExpensive}`,
  );
  assertFinite(`[${s.id}] savings amount`, r.savingsIfSwitchToCheapest.amount);
  assertFinite(`[${s.id}] savings percent`, r.savingsIfSwitchToCheapest.percent);
  check(`[${s.id}] savings percent <= 1`, r.savingsIfSwitchToCheapest.percent <= 1);
}

console.log("\n== formula sanity (default scenario) ==");
const defTokens = deriveScenarioTokens(SCENARIOS[0].params);
const def = {
  ...SCENARIOS[0].usage,
  avgInputTokens: defTokens.avgInputTokens,
  avgOutputTokens: defTokens.avgOutputTokens,
};
const defR = computeCostReport(def, MODELS);
const expectedMonthlyReq = def.requestsPerDay * def.daysPerMonth;
check("monthlyRequests formula", defR.monthlyRequests === expectedMonthlyReq);
const flash = defR.models.find((b) => b.model.model === "gemini-1.5-flash")!;
const expectedInputCost = (expectedMonthlyReq * def.avgInputTokens / 1e6) * (flash.model.inputPer1M ?? 0);
const expectedOutputCost = (expectedMonthlyReq * def.avgOutputTokens / 1e6) * (flash.model.outputPer1M ?? 0);
check("flash inputCost ~ expected", Math.abs(flash.inputCost - expectedInputCost) < 1e-9);
check("flash outputCost ~ expected", Math.abs(flash.outputCost - expectedOutputCost) < 1e-9);
check("flash total = input + output", Math.abs(flash.totalCost - (flash.inputCost + flash.outputCost)) < 1e-9);
check("flash per1k = total/monthlyReq*1000", Math.abs(flash.costPer1KRequests - (flash.totalCost / expectedMonthlyReq) * 1000) < 1e-9);
check("flash per request = total/monthlyReq", Math.abs(flash.costPerRequest - (flash.totalCost / expectedMonthlyReq)) < 1e-9);
check("flash per user = total/activeUsers", Math.abs(flash.costPerActiveUserPerMonth - (flash.totalCost / def.activeUsers)) < 1e-9);

console.log("\n== scenario formula sanity ==");
const rag = SCENARIOS.find((s) => s.id === "rag-knowledge-base")!;
if (rag.params.kind === "rag") {
  const ragTokens = deriveScenarioTokens(rag.params);
  const expectedInput =
    rag.params.values.systemPromptTokens +
    rag.params.values.userQuestionTokens +
    rag.params.values.topK * rag.params.values.avgChunkTokens;
  check("RAG avg input formula", ragTokens.avgInputTokens === expectedInput);
  check("RAG avg output formula", ragTokens.avgOutputTokens === rag.params.values.answerTokens);
}
const agent = SCENARIOS.find((s) => s.id === "ai-agent-workflow")!;
if (agent.params.kind === "agent") {
  const agentTokens = deriveScenarioTokens(agent.params);
  const calls = agent.params.values.baseCalls + agent.params.values.retries;
  check(
    "Agent avg input formula",
    agentTokens.avgInputTokens ===
      calls * (agent.params.values.systemPromptTokens + agent.params.values.toolResultTokens),
  );
  check(
    "Agent avg output formula",
    agentTokens.avgOutputTokens === calls * agent.params.values.finalAnswerTokens,
  );
}

console.log("\n== pickCheapest with duplicate / missing ids ==");
// Same id across rows, plus a row with id = "". String equality on
// `model.model` would light up every row; pickCheapest returns one object.
const fakeRows: ModelCostBreakdown[] = [
  {
    model: { model: "shared", provider: "OpenAI", displayName: "A", inputPer1M: 0, outputPer1M: 0, sourceUrl: "", checkedDate: "2025-01-01" },
    monthlyRequests: 100, monthlyInputTokens: 0, monthlyOutputTokens: 0,
    inputCost: 0, outputCost: 0, totalCost: 0.5,
    costPerRequest: 0, costPer1KRequests: 0, costPerActiveUserPerMonth: 0,
  },
  {
    model: { model: "shared", provider: "OpenAI", displayName: "B", inputPer1M: 0, outputPer1M: 0, sourceUrl: "", checkedDate: "2025-01-01" },
    monthlyRequests: 100, monthlyInputTokens: 0, monthlyOutputTokens: 0,
    inputCost: 0, outputCost: 0, totalCost: 0.1, // <-- the real cheapest
    costPerRequest: 0, costPer1KRequests: 0, costPerActiveUserPerMonth: 0,
  },
  {
    model: { model: "", provider: "OpenAI", displayName: "C", inputPer1M: 0, outputPer1M: 0, sourceUrl: "", checkedDate: "2025-01-01" },
    monthlyRequests: 100, monthlyInputTokens: 0, monthlyOutputTokens: 0,
    inputCost: 0, outputCost: 0, totalCost: 0.3,
    costPerRequest: 0, costPer1KRequests: 0, costPerActiveUserPerMonth: 0,
  },
];
const picked = pickCheapest(fakeRows);
check("pickCheapest returns exactly one row", picked !== null);
check("pickCheapest picks the lowest totalCost", picked !== null && picked.totalCost === 0.1);
check("pickCheapest picks displayName 'B'", picked !== null && picked.model.displayName === "B");
const sameIdCount = fakeRows.filter((m) => m === picked).length;
check("only one row equals the picked object", sameIdCount === 1);

console.log("\n== summary ==");
console.log(`failures: ${failures}`);
if (failures > 0) process.exit(1);
