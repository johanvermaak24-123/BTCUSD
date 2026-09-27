# BTC Oracle R6.12 — Tick Learning

This is a paper/evaluation build for Pepperstone BTCUSD through MT5.

## What it does

- Imports the previous truth brain.
- Imports MT5 tick CSV data.
- Stores raw ticks in the browser IndexedDB database.
- Creates rule-labelled mock momentum entries.
- Resolves each mock entry against later ticks using spread-aware bid/ask prices.
- Records WIN, LOSS and EXPIRED outcomes by strategy, direction and regime.
- Exports the truth brain and a tick-learning summary.

## MT5 capture

1. Open Pepperstone MT5 desktop.
2. Open MetaEditor and create an Expert Advisor from `BTC_Oracle_MT5_Tick_Capture.mq5`.
3. Compile it and attach it to the Pepperstone BTCUSD chart. If Pepperstone uses a suffix, change `InpSymbol` or attach it to that exact symbol.
4. Allow the EA to run. It writes `btc_oracle_ticks.csv` to the terminal's `MQL5/Files` folder.
5. Move that CSV to the phone or computer running the Oracle.
6. Open the Oracle, press **Import MT5 ticks**, and select the CSV.

This build is paper-only. It does not place live orders and does not claim that a mock result is a guaranteed trading edge.
