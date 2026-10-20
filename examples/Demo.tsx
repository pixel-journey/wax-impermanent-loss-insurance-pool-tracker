"use client";

import { useMemo, useState } from "react";
import { PATHS, POLICIES, trackSeries, type InsurancePolicy } from "./il";

const PATH_LABELS: Record<string, string> = {
  flat: "Price stays put",
  pump: "Price rises to 4×",
  crash: "Price falls to ¼",
  roundTrip: "Price doubles, then returns",
};

function money(n: number): string {
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(2);
}

export function Demo() {
  const [pathId, setPathId] = useState("pump");
  const [policyId, setPolicyId] = useState("deductible");
  const policy: InsurancePolicy = POLICIES[policyId];
  const ticks = PATHS[pathId];

  const rows = useMemo(
    () =>
      trackSeries({
        entryValueQuote: 1000,
        entryPrice: 1,
        ticks,
        policy,
      }).map((row, index) => ({ ...row, label: ticks[index].label, price: ticks[index].price })),
    [policy, ticks]
  );

  const last = rows[rows.length - 1];

  return (
    <main className="wrap">
      <header>
        <p className="kicker">educational-reference · not financial advice · not Alcor history</p>
        <h1>IL vs a paper insurance policy</h1>
        <p className="lede">
          A 1,000 quote-unit full-range position. The price path and the policy are fixtures in
          this repo. Nothing is fetched from Alcor, and a payout here is not a promise from any
          pool.
        </p>
      </header>

      <div className="row">
        <label>
          Price path
          <select value={pathId} onChange={(event) => setPathId(event.target.value)}>
            {Object.entries(PATH_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Policy
          <select value={policyId} onChange={(event) => setPolicyId(event.target.value)}>
            {Object.values(POLICIES).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="summary">
        Premium {(policy.premiumFraction * 100).toFixed(1)}% of entry · deductible{" "}
        {(policy.deductibleFraction * 100).toFixed(1)}% · coverage {(policy.coverage * 100).toFixed(0)}% ·
        payout cap {(policy.payoutCapFraction * 100).toFixed(0)}% of entry. Terminal result versus
        holding: {money(last.netVsHoldQuote)} quote units.
      </p>

      <table>
        <caption>Same entry, marked at each fixture price. Fees are not modeled.</caption>
        <thead>
          <tr>
            <th>Tick</th>
            <th>Price</th>
            <th>Hold</th>
            <th>LP</th>
            <th>IL</th>
            <th>Payout</th>
            <th>Net vs hold</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.price}</td>
              <td>{row.holdValueQuote.toFixed(2)}</td>
              <td>{row.lpValueQuote.toFixed(2)}</td>
              <td>{row.ilQuote.toFixed(2)}</td>
              <td>{row.payoutQuote.toFixed(2)}</td>
              <td>{row.netVsHoldQuote.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="note">
        Premium is charged on every row, including a round trip where impermanent loss returns to
        zero. A linear “hedge short” is intentionally not included: it only helps in one price
        direction and adds losses in the other. Concentrated-range IL is a different formula.
      </p>
    </main>
  );
}
