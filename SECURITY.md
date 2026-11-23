# Security — paper IL insurance

## Closed in tests

| Issue | Behavior |
| --- | --- |
| k=4 and k=0.25 | IL −0.2 versus hold |
| Bad policy fractions | throw |
| Empty ticks | throw |
| Network prices | not read |

## Attack angles

1. Labeling `payoutQuote` as protocol money.  
2. Feeding concentrated tick ranges into the full-range formula.  
3. Presenting fixtures as live WAX market backtests.  
4. Hiding the payout cap or the non-refundable premium.

## Honesty limits

Educational arithmetic. Not financial advice. No wallet.
