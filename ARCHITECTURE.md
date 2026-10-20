# Architecture

```
entry value, entry price, price now, policy
        |
        v
   snapshot()  ----> IL vs hold, premium, capped payout
        ^
   trackSeries() over fixture ticks
```

## Decisions

**Full range only.** Alcor v2 is concentrated. Pretending `2*sqrt(k)/(1+k)-1` is a tick-range result would teach the wrong model. The README says so in the first screen.

**Premium is on entry value, deductible is on entry value, IL percent is versus hold.** Mixing those bases is how these dashboards become incomparable. The type names use `Quote` for currency units and `Fraction` for unitless ratios.

**No price feed.** A wrong path that is checked in is more honest than a green chart from an unverified URL.

## Live path (not shipped)

```
pool id --> Alcor pair state + swap history --> your own ticks --> trackSeries
```

Record one real response before writing the client. Do not guess field names.
