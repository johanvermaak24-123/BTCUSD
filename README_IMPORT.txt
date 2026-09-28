BTC ORACLE R6.14.3 — PHONE MOCK GOD

1. Upload index.html to the root of GitHub Pages.
2. Open the app on the phone.
3. Press Start phone learning.
4. The app receives public BTCUSDT bid/ask ticks and creates mock trades automatically. If WebSocket is blocked, it falls back to REST polling.
5. Later ticks resolve TP, SL or timeout and update the learning brain.
6. Import BTC_ORACLE_TICKS_NORMALIZED.csv when broker-specific MT5 research is required.
7. The app replaces Last=0 with the bid/ask mid-price.
8. Invalid quotes and gaps over 30 seconds are quarantined.

The phone feed is a public BTCUSDT proxy, not Pepperstone's exact BTCUSD price.
This is a paper/evaluation tool. It does not place live orders.
The supplied one-day dataset is suitable for pipeline testing, not proof of profitability.
