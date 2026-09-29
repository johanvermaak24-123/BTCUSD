BTC ORACLE R6.14.4 — TICK INTEGRITY

This is a paper/mock-learning build. It does not place live orders.

Important fixes:
- Raw ticks remain preserved in IndexedDB.
- Exact duplicate ticks are not replayed into learning.
- Repeated flat quotes are rate-limited for learning, with heartbeat ticks retained for expiry.
- Data gaps close open mocks as GAP and exclude them from learning.
- Raw R and capped learning R are both retained; one outlier cannot dominate the adaptive brain.
- Export matched package creates the truth summary and raw CSV from one identical snapshot.

Upload index.html to the root of a GitHub Pages repository.
