# BTC Oracle R6.12.0 GOD — Forensic Truth

Single-file BTCUSD Oracle build with an isolated BTC brain:

- Storage key: `btcOraclePrimeStateV1`
- Instrument guard: `BTCUSD`
- Build: `2026-09-26-BTC-R6.12.0-GOD-FORENSIC-TRUTH`
- Entry behavior: preserved from R6.11.4; the GOD layer does not add a blanket no-trade gate for missing public microstructure.

Open the HTML file directly in a modern browser. The app keeps its brain in browser storage and supports JSON brain export/import from the Learning section.

## Truth model

The build keeps these evidence lanes separate:

1. Strict closed plan fills: only side-aware TP/SL-resolved plan outcomes count.
2. Evaluation observations: future-path and direction observations can remain useful without becoming trade P/L.
3. Fast 15-minute learning: separate from strict 1H/3H/6H proof.
4. News reaction truth: source/event reaction evidence, freshness-bounded.
5. Confirmed MT5 positions: requires exact entry and a verified close mark.
6. False flips: recorded and resolved independently; they do not hard-block entries.

`OPEN_AT_HORIZON`, `NO_ENTRY`, and ambiguous bars are retained for audit but are not strict closed-trade learning.

## Validation

The package includes `tests/god_forensic_regression.js`, which checks state preservation, strict-outcome classification, news freshness, daily-bar deduplication, plan lifecycle state, and the existing execution self-check.
