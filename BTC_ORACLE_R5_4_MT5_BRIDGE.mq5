#property strict
#property version   "1.00"
#property description "BTC Oracle R5.4 Pepperstone MT5 quote + position bridge"

input string RelayBaseUrl = "https://YOUR-RELAY-HOST";
input string BridgeChannel = "btc_048YkjdqdTYvvDJgoeTmYTyg7t7HiR5v";
input string BridgeWriteKey = "c7m7YqTUHUY0CUdfgTyKj2x2TgAvoxk9jF1YE2UG7mc";
input string BridgeSymbol = "BTCUSD";
input int PublishEveryMs = 500;
input int RequestTimeoutMs = 1500;

int g_last_http = 0;
string g_last_error = "Starting";

string JsonEscape(string s)
  {
   StringReplace(s,"\\","\\\\");
   StringReplace(s,"\"","\\\"");
   StringReplace(s,"\r"," ");
   StringReplace(s,"\n"," ");
   StringReplace(s,"\t"," ");
   return s;
  }

bool GetPositionSummary(string symbol,string &side,double &entry,int &count)
  {
   double buy_vol=0.0,sell_vol=0.0,buy_sum=0.0,sell_sum=0.0;
   int buy_count=0,sell_count=0;
   for(int i=PositionsTotal()-1;i>=0;i--)
     {
      ulong ticket=PositionGetTicket(i);
      if(ticket==0) continue;
      if(PositionGetString(POSITION_SYMBOL)!=symbol) continue;
      ENUM_POSITION_TYPE type=(ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      double vol=PositionGetDouble(POSITION_VOLUME);
      double px=PositionGetDouble(POSITION_PRICE_OPEN);
      if(vol<=0.0 || px<=0.0) continue;
      if(type==POSITION_TYPE_BUY) { buy_vol+=vol; buy_sum+=vol*px; buy_count++; }
      else if(type==POSITION_TYPE_SELL) { sell_vol+=vol; sell_sum+=vol*px; sell_count++; }
     }
   count=buy_count+sell_count;
   if(buy_vol>0.0 && sell_vol>0.0) { side="MIXED"; entry=0.0; return true; }
   if(buy_vol>0.0) { side="BUY"; entry=buy_sum/buy_vol; return true; }
   if(sell_vol>0.0) { side="SELL"; entry=sell_sum/sell_vol; return true; }
   side="FLAT"; entry=0.0; return true;
  }

bool PublishSnapshot()
  {
   if(StringLen(RelayBaseUrl)<12 || StringFind(RelayBaseUrl,"YOUR-RELAY-HOST")>=0)
     { g_last_error="Set RelayBaseUrl first"; return false; }
   if(StringLen(BridgeChannel)<16 || StringLen(BridgeWriteKey)<24)
     { g_last_error="BridgeChannel / BridgeWriteKey invalid"; return false; }
   MqlTick tick;
   if(!SymbolInfoTick(BridgeSymbol,tick) || tick.bid<=0.0 || tick.ask<tick.bid)
     { g_last_error="No valid tick for "+BridgeSymbol; return false; }
   int digits=(int)SymbolInfoInteger(BridgeSymbol,SYMBOL_DIGITS);
   string side="FLAT"; double entry=0.0; int count=0;
   GetPositionSummary(BridgeSymbol,side,entry,count);
   string entry_json=(entry>0.0 ? DoubleToString(entry,digits) : "null");
   string payload="{\"symbol\":\""+JsonEscape(BridgeSymbol)+"\","
                  +"\"bid\":"+DoubleToString(tick.bid,digits)+","
                  +"\"ask\":"+DoubleToString(tick.ask,digits)+","
                  +"\"broker\":\""+JsonEscape(AccountInfoString(ACCOUNT_COMPANY))+"\","
                  +"\"server\":\""+JsonEscape(AccountInfoString(ACCOUNT_SERVER))+"\","
                  +"\"positionSide\":\""+side+"\","
                  +"\"positionEntry\":"+entry_json+","
                  +"\"positionCount\":"+IntegerToString(count)+","
                  +"\"eaTime\":\""+JsonEscape(TimeToString(TimeTradeServer(),TIME_DATE|TIME_SECONDS))+"\"}";
   string base=RelayBaseUrl;
   while(StringLen(base)>0 && StringSubstr(base,StringLen(base)-1,1)=="/") base=StringSubstr(base,0,StringLen(base)-1);
   string url=base+"/push/"+BridgeChannel;
   string headers="Content-Type: application/json\r\nX-Bridge-Key: "+BridgeWriteKey+"\r\n";
   char data[],result[];
   string result_headers;
   int n=StringToCharArray(payload,data,0,WHOLE_ARRAY,CP_UTF8);
   if(n>0 && ArraySize(data)>0) ArrayResize(data,ArraySize(data)-1);
   ResetLastError();
   int code=WebRequest("POST",url,headers,MathMax(500,RequestTimeoutMs),data,result,result_headers);
   g_last_http=code;
   if(code<200 || code>=300)
     {
      int err=GetLastError();
      g_last_error="HTTP "+IntegerToString(code)+" / MT5 error "+IntegerToString(err);
      return false;
     }
   g_last_error="LIVE";
   return true;
  }

void UpdateChartStatus()
  {
   string state=(g_last_http>=200 && g_last_http<300 ? "LIVE" : "WAIT");
   Comment("BTC ORACLE R5.4 MT5 BRIDGE\n",
           "Symbol: ",BridgeSymbol,"\n",
           "Relay: ",state,"  HTTP ",g_last_http,"\n",
           "Status: ",g_last_error,"\n",
           "No orders are sent by this EA - quote/position telemetry only.");
  }

int OnInit()
  {
   if(!SymbolSelect(BridgeSymbol,true))
     { Print("Cannot select symbol ",BridgeSymbol); return INIT_FAILED; }
   int ms=MathMax(250,PublishEveryMs);
   if(!EventSetMillisecondTimer(ms))
     { Print("EventSetMillisecondTimer failed: ",GetLastError()); return INIT_FAILED; }
   Print("BTC Oracle bridge started for ",BridgeSymbol,". Add the relay origin to Tools > Options > Expert Advisors > Allow WebRequest.");
   PublishSnapshot();
   UpdateChartStatus();
   return INIT_SUCCEEDED;
  }

void OnDeinit(const int reason)
  {
   EventKillTimer();
   Comment("");
  }

void OnTimer()
  {
   PublishSnapshot();
   UpdateChartStatus();
  }
