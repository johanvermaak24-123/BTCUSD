BTC ORACLE R6.14.6 — GOD TRUTH AUDIT

This is a single-file, phone-friendly paper/mock-learning app. It does not place live orders.

What changed:
- Added a separate “Audit tick summary” action and read-only audit panel.
- Shows snapshot-versus-summary row mismatches, outcome count, raw hit rate and bucket counts.
- A tick summary is never replayed into learning.
- Import brain now refuses a tick-summary JSON, protecting the existing brain from accidental replacement.
- Preserves the existing localStorage key and IndexedDB database name so existing app data remains available in the browser.

Install:
1. Extract this ZIP.
2. Upload the included index.html to the root of the GitHub Pages repository.
3. Open the site and use “Audit tick summary” to inspect a summary JSON.
4. Use “Import MT5 CSV” only for raw CSV/TXT tick files. Summary JSON is not raw tick data.

Limits:
- Paper/mock only; no live broker connection or order placement.
- Public exchange proxy ticks are isolated from Pepperstone entries.
- The supplied summary has a 217-row snapshot mismatch and too few resolved outcomes to validate forecasts.
- An independent replay requires the raw tick CSV and realistic cost assumptions.
