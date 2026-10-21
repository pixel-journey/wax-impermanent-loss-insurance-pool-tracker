# wax-impermanent-loss-insurance-pool-tracker

**Trust label:** `educational-reference`  
**Status:** Private. The full-range formula and the insurance overlay are tested offline.

One-sentence goal: show how a constant-product liquidity position compares with simply holding, and how a paper insurance policy changes that gap.

Parent catalog: [pixel-journey/wax-ecosystem-blueprint-catalog](https://github.com/pixel-journey/wax-ecosystem-blueprint-catalog)

## Quick start

```bash
git clone https://github.com/pixel-journey/wax-impermanent-loss-insurance-pool-tracker.git
cd wax-impermanent-loss-insurance-pool-tracker
npm install
npm test
npm run dev
```

The demo uses a 1,000 quote-unit position and fixture prices. It does not connect a wallet.

## Why this exists

“IL insurance” dashboards often mix a live pool chart with an unlabeled model. This repo separates them. The math you can recompute is here. Alcor history is not.

This is **not financial advice**, not a quote, and not evidence that any WAX pool offers the policies in the dropdown.

## Concepts

| Piece | Rule |
| --- | --- |
| Price ratio `k` | `priceNow / entryPrice` |
| Full-range LP value | `entryValue * sqrt(k)` |
| Hold value | `entryValue * (k + 1) / 2` |
| IL fraction | `lp / hold - 1`, which is `2*sqrt(k)/(1+k) - 1` |
| Shortfall | `max(0, hold - lp)` in quote units |
| Policy | Premium, deductible, coverage, and payout cap, each a fraction of **entry** value |

At `k = 4` and at `k = 1/4`, IL is −20% versus holding. A round trip back to `k = 1` returns IL to zero and does not refund the premium. Trading fees are not modeled, so a real pool can differ.

## Patterns

**Simple.** Call `impermanentLossFraction(k)` and show the percent.

**Recommended.** Call `snapshot` with an explicit `InsurancePolicy`. The demo does this for three named policies.

**Advanced.** Run `trackSeries` on your own price ticks. Keep ticks in the repo as fixtures until you have recorded Alcor responses in `VERIFICATION-LOG.md`.

## Demo

Pick a path (flat, 4×, quarter, round trip) and a policy. The table is the whole product. There is no chart library and no animation.

## Integration

```ts
import { POLICIES, snapshot } from "./src/il";

const row = snapshot({
  entryValueQuote: 1000,
  entryPrice: 1,
  priceNow: 4,
  policy: POLICIES.deductible,
});
```

Do not label `row.payoutQuote` as money a protocol will send you.

## Best practices and anti-patterns

Do:

- Say “versus holding” when you show the −20% figure. It is not a loss versus the entry deposit.
- Show the premium on the round trip, where IL itself is zero.
- State that concentrated liquidity uses a different formula.

Do not:

- Feed this function an Alcor v2 tick range and call the result concentrated IL.
- Draw a directional short as if it were symmetric insurance. A short helps one way and hurts the other; it is omitted on purpose.
- Present fixture paths as backtests of WAX/PXJ or any other market.
- Hide the payout cap. The deductible policy in this repo hits the cap at 4×.

## Edge cases

| Input | Result |
| --- | --- |
| `k = 1` | IL is 0. Insured policies still charge premium |
| `k = 4` and `k = 0.25` | Same IL fraction (−0.2), different quote values of hold and LP |
| Coverage or premium outside 0..1 | Throw `IlInputError` |
| Empty tick list | Throw |
| Deductible larger than the shortfall | Payout is 0 |

## Safety

No wallet, no prices from the network. Copy on the page says the numbers are not a hedge quote. Not an axe audit. The table is text, so it is readable without color.

## Antelope portability

The formula is AMM math, not a WAX endpoint. Alcor v2 ranges, fee tiers, and “insurance pools” on WAX are **not** implemented. The same functions apply to any constant-product pool on Antelope or elsewhere. They do not apply unchanged to concentrated liquidity.

## Verification

`src/il.test.ts` locks the 4× identities, the payout cap, the round-trip premium, and input rejection. No Alcor response has been recorded.

## Related

- `wax-lp-impermanent-loss-heat-map` — still a separate repo; do not assume it shares this code
- `wax-alcor-v2-range-efficiency-backtester`
- `wax-defi-protocol-health-dashboard`

## Roadmap

- One recorded Alcor pool state, cited in the verification log, before any “live” label
- A concentrated-range function in its own module, with its own tests, not stuffed into this one
- Still no trading advice

## License

MIT.


## Queries and unsigned transactions

`src/api.ts` builds the HTTP requests. `src/usecases.ts` is the worked case for this repo: those requests, and the unsigned transaction when the feature actually has an action. `executed` is false. Nothing is sent.

The engines used to sit in `examples/`. GitHub treats that directory as documentation, so the language bar showed the stylesheet and almost none of the TypeScript.
