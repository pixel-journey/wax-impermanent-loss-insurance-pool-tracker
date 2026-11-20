# Education — a float IL sketch, plus a paper policy

> **Rung:** `npm test` passes (11). `Math.sqrt`, not the integer `isqrt` in [wax-lp-impermanent-loss-heat-map](https://github.com/pixel-journey/wax-lp-impermanent-loss-heat-map). They agree at 1x and at 4x. They will not agree on every other ratio. This is not Alcor, not a hedge quote, and not financial advice.  
> **The test is the rule.**

## Predict, then run

`impermanentLossFraction` is `2 * sqrt(k) / (1 + k) - 1`.

| Ratio | Locked result |
| --- | --- |
| `1` | `0` |
| `4` and `0.25` | `-0.2` |
| `0` or negative | `IlInputError` |

Entry value `1000`, entry price `1`, price now `4`, no insurance:

| Field | Result |
| --- | --- |
| LP value | `2000` (`1000 * sqrt(4)`) |
| Hold value | `2500` (`1000 * (4 + 1) / 2`) |
| IL versus hold | `-500` |
| payout | `0` |
| net versus hold | `-500` |

The deductible policy is a 0.5% premium, a 2% deductible, 80% coverage, and a 15% payout cap. On the same 4x move the shortfall is `500`. Deductible is `20`. `80%` of `480` is `384`, and the cap cuts that to `150`. Premium is `5`. Net versus hold is `-500 - 5 + 150 = -355`. The cover does not catch holding.

The full policy charges a 4% premium (`40` on `1000`) even when the price does not move, and the payout is then `0`. A round trip can return IL to `0` and still leave the premium. Coverage above `1` throws.

Terminal nets on the pump path are still negative for both the full policy and no insurance. The test locks that the full policy loses less than no insurance, and that it still loses versus holding. It does not lock a profit.
