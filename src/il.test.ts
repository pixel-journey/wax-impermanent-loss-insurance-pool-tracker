import { describe, expect, it } from "vitest";
import {
  IlInputError,
  POLICIES,
  PATHS,
  impermanentLossFraction,
  snapshot,
  terminalNets,
  trackSeries,
} from "./il";

const entry = { entryValueQuote: 1000, entryPrice: 1 };

describe("impermanentLossFraction", () => {
  it("is zero when price does not move", () => {
    expect(impermanentLossFraction(1)).toBeCloseTo(0, 12);
  });

  it("is -20% at 4x and at 1/4, the textbook pair", () => {
    expect(impermanentLossFraction(4)).toBeCloseTo(-0.2, 12);
    expect(impermanentLossFraction(0.25)).toBeCloseTo(-0.2, 12);
  });

  it("rejects non-positive ratios", () => {
    expect(() => impermanentLossFraction(0)).toThrow(IlInputError);
    expect(() => impermanentLossFraction(-2)).toThrow(IlInputError);
  });
});

describe("snapshot", () => {
  it("matches hold and lp identities at 4x", () => {
    const row = snapshot({ ...entry, priceNow: 4, policy: POLICIES.uninsured });
    expect(row.lpValueQuote).toBeCloseTo(2000, 8);
    expect(row.holdValueQuote).toBeCloseTo(2500, 8);
    expect(row.ilQuote).toBeCloseTo(-500, 8);
    expect(row.ilFraction).toBeCloseTo(-0.2, 8);
    expect(row.payoutQuote).toBe(0);
    expect(row.netVsHoldQuote).toBeCloseTo(-500, 8);
  });

  it("caps the deductible policy payout", () => {
    const row = snapshot({ ...entry, priceNow: 4, policy: POLICIES.deductible });
    // shortfall 500, deductible 20, 80% of 480 = 384, cap is 150
    expect(row.shortfallQuote).toBeCloseTo(500, 8);
    expect(row.payoutQuote).toBeCloseTo(150, 8);
    expect(row.premiumQuote).toBeCloseTo(5, 8);
    expect(row.netVsHoldQuote).toBeCloseTo(-355, 8);
  });

  it("charges premium even when price is unchanged", () => {
    const row = snapshot({ ...entry, priceNow: 1, policy: POLICIES.full });
    expect(row.ilQuote).toBeCloseTo(0, 8);
    expect(row.payoutQuote).toBe(0);
    expect(row.netVsHoldQuote).toBeCloseTo(-40, 8);
  });

  it("rejects a coverage above 1", () => {
    expect(() =>
      snapshot({
        ...entry,
        priceNow: 1,
        policy: { ...POLICIES.uninsured, coverage: 1.2 },
      })
    ).toThrow(IlInputError);
  });
});

describe("trackSeries", () => {
  it("round-trip IL is zero, but the premium remains", () => {
    const rows = trackSeries({
      ...entry,
      ticks: PATHS.roundTrip,
      policy: POLICIES.full,
    });
    expect(rows[1].ilFraction).toBeLessThan(0);
    expect(rows[2].ilQuote).toBeCloseTo(0, 8);
    expect(rows[2].payoutQuote).toBe(0);
    expect(rows[2].netVsHoldQuote).toBeCloseTo(-40, 8);
  });

  it("ranks terminal nets without calling them profits", () => {
    const series = {
      uninsured: trackSeries({ ...entry, ticks: PATHS.pump, policy: POLICIES.uninsured }),
      full: trackSeries({ ...entry, ticks: PATHS.pump, policy: POLICIES.full }),
    };
    const nets = terminalNets(series);
    const full = nets.find((row) => row.id === "full");
    const bare = nets.find((row) => row.id === "uninsured");
    expect(full).toBeDefined();
    expect(bare).toBeDefined();
    expect(full!.netVsHoldQuote).toBeGreaterThan(bare!.netVsHoldQuote);
    expect(full!.netVsHoldQuote).toBeLessThan(0);
  });
});
