import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TradeHistoryProps {
  selectedBotId: Id<"bots"> | null;
}

export function TradeHistory({ selectedBotId }: TradeHistoryProps) {
  const recentTrades = useQuery(api.trades.listRecent);
  const botTrades = useQuery(
    api.trades.listByBot,
    selectedBotId ? { botId: selectedBotId } : "skip"
  );

  const trades = selectedBotId ? botTrades : recentTrades;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-[#12141a] border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {selectedBotId ? "Bot Trades" : "Recent Trades"}
        </h2>
      </div>

      <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto">
        {trades === undefined ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">No trades yet</p>
            <p className="text-white/20 text-xs mt-1">Trades will appear here once bots start trading</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {trades.map((trade: { _id: string; type: string; pair: string; amount: number; price: number; profit?: number; timestamp: number }) => (
              <div key={trade._id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    trade.type === "buy" ? "bg-emerald-500/10" : "bg-cyan-500/10"
                  }`}>
                    <svg
                      className={`w-5 h-5 ${trade.type === "buy" ? "text-emerald-400" : "text-cyan-400"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {trade.type === "buy" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        trade.type === "buy"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-cyan-500/20 text-cyan-400"
                      }`}>
                        {trade.type}
                      </span>
                      <span className="text-sm font-mono text-white/60 truncate">{trade.pair}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40">
                        {trade.amount.toFixed(4)} @ {formatCurrency(trade.price)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      (trade.profit || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {(trade.profit || 0) >= 0 ? "+" : ""}{formatCurrency(trade.profit || 0)}
                    </p>
                    <p className="text-xs text-white/30">{formatTime(trade.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live indicator */}
      {trades && trades.length > 0 && (
        <div className="p-3 border-t border-white/5 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/40">Live updates</span>
        </div>
      )}
    </div>
  );
}
