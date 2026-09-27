#property strict
#property version   "1.00"
#property description "BTC Oracle R6.12: Pepperstone MT5 tick capture for paper learning"

input string InpSymbol = "BTCUSD";
input string InpFileName = "btc_oracle_ticks.csv";
input bool   InpIncludeLast = true;

int handle = INVALID_HANDLE;
long rows = 0;

int OnInit()
{
   string symbol = InpSymbol == "" ? _Symbol : InpSymbol;
   if(!SymbolSelect(symbol,true))
   {
      Print("BTC Oracle: could not select symbol ",symbol);
      return INIT_FAILED;
   }

   handle = FileOpen(InpFileName,FILE_READ|FILE_WRITE|FILE_CSV|FILE_SHARE_READ|FILE_SHARE_WRITE|FILE_ANSI,',');
   if(handle == INVALID_HANDLE)
   {
      Print("BTC Oracle: FileOpen failed. Error ",GetLastError());
      return INIT_FAILED;
   }

   if(FileSize(handle) == 0)
      FileWrite(handle,"time_msc","bid","ask","last","volume");
   FileSeek(handle,0,SEEK_END);
   EventSetTimer(2);
   Print("BTC Oracle tick capture running for ",symbol," -> MQL5/Files/",InpFileName);
   return INIT_SUCCEEDED;
}

void OnTick()
{
   string symbol = InpSymbol == "" ? _Symbol : InpSymbol;
   MqlTick tick;
   if(!SymbolInfoTick(symbol,tick)) return;

   FileSeek(handle,0,SEEK_END);
   double last = InpIncludeLast ? tick.last : 0.0;
   FileWrite(handle,(long)tick.time_msc,DoubleToString(tick.bid,_Digits),DoubleToString(tick.ask,_Digits),DoubleToString(last,_Digits),(long)tick.volume);
   rows++;
}

void OnTimer()
{
   if(handle != INVALID_HANDLE) FileFlush(handle);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   if(handle != INVALID_HANDLE)
   {
      FileFlush(handle);
      FileClose(handle);
      handle = INVALID_HANDLE;
   }
   Print("BTC Oracle tick capture stopped. Rows written: ",rows);
}
