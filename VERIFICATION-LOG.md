# Verification log

**Trust label:** educational-reference  
**Updated:** 2026-10-20

| Claim | Evidence | State |
| --- | --- | --- |
| IL is 0 at k=1 and −0.2 at k=4 and k=0.25 | `examples/il.test.ts` | verified (unit) |
| LP and hold identities at 4× for entry value 1000 | same | verified (unit) |
| Deductible policy payout is capped at 15% of entry | same | verified (unit) |
| Round trip zeros IL and keeps the premium | same | verified (unit) |
| Invalid coverage throws | same | verified (unit) |
| Demo table calls `trackSeries` | `examples/Demo.tsx` | partial (inspection) |
| Alcor or Hyperion history | none | untested |
| Any live insurance pool on WAX | none | not claimed |
