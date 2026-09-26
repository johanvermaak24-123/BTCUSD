# Forensic upgrade changelog

## R6.12.0 GOD forensic truth layer

- Fixed the early-migration live-plan failure caused by calling the ladder builder before its `ORDER_TYPES` dependency was initialized. A brain with `livePlan` now loads instead of silently falling back to an empty default.
- Reclassified resolved forecast rows into evaluation-resolved, strict closed-plan, open-at-horizon, no-entry, or ambiguous evidence.
- Removed `OPEN_AT_HORIZON` from strict trade-learning counters while preserving its mark/evaluation fields and the original row.
- Rebuilt strict 1H/3H/6H counters from retained TP/SL evidence. No strict outcome is invented when a horizon has no proof.
- Used side-aware entry/exit geometry with the conservative Pepperstone floating-spread reference for inferred closed-bar plan fills.
- Added full-horizon observation embargoes: 60 minutes for 1H, 180 minutes for 3H, and 360 minutes for 6H. Overlap skips are labeled explicitly as `overlap-embargo`.
- Rebuilt observation/path learning chronologically without clearing news, fast, or confirmed-position memory.
- Added freshness-bounded news scoring: articles older than six hours are ignored for current directional evidence, degraded feeds fail open with a bounded soft contribution, and missing microstructure is not promoted to a hard entry veto.
- Consolidated duplicate bar timestamps and recalculated health from closed bars rather than the last array row. Duplicate daily groups remain auditable through the GOD integrity panel.
- Canonicalized duplicate cross-market aliases so `ethScore` and an identical `crossMarketScore` are not double-counted.
- Added fast-direction flip tracking and later outcome resolution into the existing flip ledger.
- Reconciled the canonical live plan into `activePlans`, terminal statuses, scan snapshots, and `lastPlanEvent`.
- Added a visible GOD forensic dashboard showing strict, observation, fast, news, MT5-position, false-flip, overlap, freshness, lifecycle, and bar-dedupe counts.
- Preserved BTC/Gold isolation, `btcOraclePrimeStateV1`, the BTCUSD guard, imported position history, losses, valid signal behavior, and the existing execution self-check.

This build makes evidence classification stricter; it does not claim profitability or predictive accuracy.
