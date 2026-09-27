# BTC Oracle R6.11.5 — Truth Core

This is a self-contained GitHub Pages-ready paper/evaluation PWA.

## What changed

- One canonical signal ledger.
- Separate paper entry confirmation from simulated price triggers.
- Terminal learning only after TP1, TP2, SL or expiry.
- Cost-aware entry levels using spread and ATR.
- Missing data is shown as incomplete instead of silently treated as neutral.
- Brain import/export is supported.
- Existing R6.11.4 rewards are preserved as forensic evidence, not copied into new terminal trade outcomes.

## Use

1. Open `index.html`.
2. Select **Import brain** and choose the exported BTC brain JSON.
3. Review the forensic blockers.
4. Use **Refresh scan** for a paper signal.
5. If a trade is actually taken, press **Confirm actual entry** and enter the real fill price.
6. Mark TP1, TP2, SL or Expired only when the outcome is real.
7. Export the Truth Core brain regularly.

This version does not connect to MT5 and does not auto-trade.
