# AI handoff — paper IL insurance

## Non-negotiables

1. Full-range IL fraction is `2*sqrt(k)/(1+k) - 1` where `k = priceNow / entryPrice`.
2. At `k = 4` and `k = 1/4`, IL is **−20%** versus **holding**, not versus the entry deposit.
3. LP value = `entryValue * sqrt(k)`. Hold value = `entryValue * (k + 1) / 2`. Shortfall = `max(0, hold - lp)`.
4. Policy premium, deductible, coverage, and payout cap are fractions of **entry** value. Round trip to `k = 1` returns IL to zero and does **not** refund the premium.
5. Coverage or premium outside 0..1 throws. Empty tick list throws. Deductible larger than shortfall → payout 0.
6. **Not** the integer IL heat-map lab. **Not** concentrated-range IL. **Not** Alcor. **Not** financial advice.
7. Do not label `payoutQuote` as money a protocol will send. Trading fees are not modeled.

## Prompt seeds

- "k=4 versus k=0.25 — same IL fraction?"
- "Round trip premium when IL is zero."
- "Refuse feeding an Alcor tick range into this full-range formula."

## Do not

- Present fixture paths as WAX/PXJ backtests.  
- Hide the payout cap.  
- Draw a directional short as symmetric insurance.
