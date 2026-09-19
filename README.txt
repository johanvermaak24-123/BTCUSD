BTC ORACLE R5.1 — FORENSIC AUDITED
Build date: 19 September 2026
SHA256 index.html: 9a54ac7ee2139ab66e982c7fcea7436a5d694360199952d6eb17837aa857bf9e

DEPLOY
Upload index.html to GitHub Pages or Netlify as the site root.
The app is a single-file browser app.

PRESERVED
- BTC Oracle storage key remains btcOraclePrimeStateV1, so existing BTC R5 memory on the same browser/site can migrate forward.
- BTC memory remains isolated from Gold.

R5.1 FORENSIC FIXES
- Strict closed-candle learning/outcome resolution.
- Higher-timeframe aggregation excludes incomplete current buckets.
- Freshness guards for BTC candles and DXY/ETH cross-market evidence.
- Stale DXY/ETH evidence is disabled rather than trusted.
- Spread/cost geometry enforced after rounded order construction.
- Adaptive Entry 1/2/3 selector cannot choose a rung that fails active cost geometry.
- BUY mark-to-close uses bid when available; SELL uses ask when available.
- Exact-entry position risk guard retained.

TESTING
- 1,000,000 seeded randomized engine scenarios: 0 failures.
- In-app self-check: 30,000 randomized cases + manual-entry risk + position/timeline + re-entry + hard-lock + ladder: PASS.
- HTML IDs/selectors checked: no duplicate IDs or missing selector targets.
- JavaScript syntax checked: PASS.
- BTC storage/symbol isolation checked: PASS.

IMPORTANT
These tests prove code/state/order-geometry invariants, not future market profitability.
BTC Oracle R5.1 currently starts with a clean BTC-specific learning brain unless you already have BTC Oracle memory in the same browser/site. No mature BTC Oracle resolved-outcome dataset was available to claim a historical win rate. Let the app collect real BTC outcomes before judging predictive performance.
