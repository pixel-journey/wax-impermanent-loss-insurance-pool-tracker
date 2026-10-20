/**
 * Full-range constant-product impermanent loss, plus a simple insurance overlay.
 *
 * This is textbook AMM math (value of the pool position versus holding).
 * It is not Alcor v2 tick math, not a hedge quote, and not financial advice.
 * No network calls.
 */

export class IlInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IlInputError";
  }
}

export type InsurancePolicy = {
  id: string;
  name: string;
  /** Paid up front, as a fraction of entry value. 0.01 means 1%. */
  premiumFraction: number;
  /** Shortfall versus holding, as a fraction of entry value, ignored before any payout. */
  deductibleFraction: number;
  /** Share of the shortfall above the deductible that is reimbursed. 0 to 1. */
  coverage: number;
  /** Maximum payout as a fraction of entry value. */
  payoutCapFraction: number;
};

export type Snapshot = {
  priceRatio: number;
  holdValueQuote: number;
  lpValueQuote: number;
  /** lpValueQuote - holdValueQuote. Zero or negative for this model. */
  ilQuote: number;
  /** lp / hold - 1. The usual “IL percent”, relative to holding, not to entry. */
  ilFraction: number;
  shortfallQuote: number;
  premiumQuote: number;
  payoutQuote: number;
  /** (lp - hold) - premium + payout. Negative means you still trail holding. */
  netVsHoldQuote: number;
};

function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new IlInputError(`${name} must be a finite number greater than 0`);
  }
}

function assertUnit(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new IlInputError(`${name} must be between 0 and 1`);
  }
}

export function assertPolicy(policy: InsurancePolicy): void {
  if (!policy.id || !policy.name) {
    throw new IlInputError("policy id and name are required");
  }
  assertUnit("premiumFraction", policy.premiumFraction);
  assertUnit("deductibleFraction", policy.deductibleFraction);
  assertUnit("coverage", policy.coverage);
  assertUnit("payoutCapFraction", policy.payoutCapFraction);
}

/**
 * Classic full-range IL: 2*sqrt(k)/(1+k) - 1, where k = priceNow / priceEntry.
 * At k = 4 or k = 0.25 this is -0.2. At k = 1 it is 0.
 */
export function impermanentLossFraction(priceRatio: number): number {
  assertPositive("priceRatio", priceRatio);
  const k = priceRatio;
  return (2 * Math.sqrt(k)) / (1 + k) - 1;
}

/**
 * Entry deposits equal quote-value on both sides.
 * lpValue = entryValue * sqrt(k)
 * holdValue = entryValue * (k + 1) / 2
 */
export function snapshot(args: {
  entryValueQuote: number;
  entryPrice: number;
  priceNow: number;
  policy: InsurancePolicy;
}): Snapshot {
  assertPositive("entryValueQuote", args.entryValueQuote);
  assertPositive("entryPrice", args.entryPrice);
  assertPositive("priceNow", args.priceNow);
  assertPolicy(args.policy);

  const priceRatio = args.priceNow / args.entryPrice;
  const holdValueQuote = (args.entryValueQuote * (priceRatio + 1)) / 2;
  const lpValueQuote = args.entryValueQuote * Math.sqrt(priceRatio);
  const ilQuote = lpValueQuote - holdValueQuote;
  const ilFraction = holdValueQuote === 0 ? 0 : lpValueQuote / holdValueQuote - 1;
  const shortfallQuote = Math.max(0, holdValueQuote - lpValueQuote);
  const deductibleQuote = args.policy.deductibleFraction * args.entryValueQuote;
  const insurable = Math.max(0, shortfallQuote - deductibleQuote);
  const uncapped = insurable * args.policy.coverage;
  const cap = args.policy.payoutCapFraction * args.entryValueQuote;
  const payoutQuote = Math.min(uncapped, cap);
  const premiumQuote = args.policy.premiumFraction * args.entryValueQuote;

  return {
    priceRatio,
    holdValueQuote,
    lpValueQuote,
    ilQuote,
    ilFraction,
    shortfallQuote,
    premiumQuote,
    payoutQuote,
    netVsHoldQuote: ilQuote - premiumQuote + payoutQuote,
  };
}

export type PriceTick = { label: string; price: number };

export function trackSeries(args: {
  entryValueQuote: number;
  entryPrice: number;
  ticks: PriceTick[];
  policy: InsurancePolicy;
}): Snapshot[] {
  if (args.ticks.length === 0) {
    throw new IlInputError("ticks must not be empty");
  }
  return args.ticks.map((tick) =>
    snapshot({
      entryValueQuote: args.entryValueQuote,
      entryPrice: args.entryPrice,
      priceNow: tick.price,
      policy: args.policy,
    })
  );
}

export function terminalNets(
  seriesByPolicy: Record<string, Snapshot[]>
): { id: string; netVsHoldQuote: number }[] {
  return Object.entries(seriesByPolicy).map(([id, rows]) => {
    const last = rows[rows.length - 1];
    if (!last) throw new IlInputError(`series ${id} is empty`);
    return { id, netVsHoldQuote: last.netVsHoldQuote };
  });
}

export const POLICIES: Record<string, InsurancePolicy> = {
  uninsured: {
    id: "uninsured",
    name: "No insurance",
    premiumFraction: 0,
    deductibleFraction: 0,
    coverage: 0,
    payoutCapFraction: 0,
  },
  deductible: {
    id: "deductible",
    name: "Cheap cover after a deductible",
    premiumFraction: 0.005,
    deductibleFraction: 0.02,
    coverage: 0.8,
    payoutCapFraction: 0.15,
  },
  full: {
    id: "full",
    name: "Expensive cover, no deductible",
    premiumFraction: 0.04,
    deductibleFraction: 0,
    coverage: 1,
    payoutCapFraction: 0.4,
  },
};

export const PATHS: Record<string, PriceTick[]> = {
  flat: [
    { label: "start", price: 1 },
    { label: "later", price: 1 },
  ],
  pump: [
    { label: "start", price: 1 },
    { label: "up", price: 2 },
    { label: "4x", price: 4 },
  ],
  crash: [
    { label: "start", price: 1 },
    { label: "down", price: 0.5 },
    { label: "quarter", price: 0.25 },
  ],
  roundTrip: [
    { label: "start", price: 1 },
    { label: "up", price: 2 },
    { label: "back", price: 1 },
  ],
};
