import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";

interface BotCardProps {
  bot: Doc<"bots">;
  isSelected: boolean;
  onSelect: () => void;
}

const strategyLabels: Record<string, string> = {
  momentum: "Momentum",
  mean_reversion: "Mean Reversion",
  grid: "Grid Trading",
  dca: "DCA Bot",
};

export function BotCard({ bot, isSelected, onSelect }: BotCardProps) {
  const updateStatus = useMutation(api.bots.updateStatus);
  const removeBot = useMutation(api.bots.remove);
  const simulateTrade = useMutation(api.bots.simulateTrade);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Auto-simulate trades for active bots
  useEffect(() => {
    if (bot.status !== "active") return;

    const interval = setInterval(async () => {
      try {
        await simulateTrade({ botId: bot._id });
      } catch (error) {
        console.error("Trade simulation failed:", error);
      }
    }, 8000 + Math.random() * 7000); // Random interval 8-15 seconds

    return () => clearInterval(interval);
  }, [bot._id, bot.status, simulateTrade]);

  const handleToggleStatus = async () => {
    const newStatus = bot.status === "active" ? "paused" : "active";
    await updateStatus({ id: bot._id, status: newStatus });
  };

  const handleSimulateTrade = async () => {
    if (bot.status !== "active") return;
    setIsSimulating(true);
    try {
      await simulateTrade({ botId: bot._id });
    } catch (error) {
      console.error("Trade simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDelete = async () => {
    await removeBot({ id: bot._id });
    setShowConfirmDelete(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getStatusColor = () => {
    switch (bot.status) {
      case "active":
        return "bg-emerald-500";
      case "paused":
        return "bg-amber-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <>
      <div
        className={`bg-[#12141a] border rounded-2xl overflow-hidden transition-all cursor-pointer ${
          isSelected
            ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
            : "border-white/5 hover:border-white/10"
        }`}
        onClick={onSelect}
      >
        <div className="p-4 md:p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                bot.profitLoss >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}>
                <svg className={`w-5 h-5 md:w-6 md:h-6 ${bot.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm md:text-base">{bot.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">{strategyLabels[bot.strategy]}</span>
                  <span className="text-xs text-cyan-400 font-mono">{bot.tradingPair}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${bot.status === "active" ? "animate-pulse" : ""}`} />
              <span className="text-xs font-medium capitalize text-white/60">{bot.status}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Capital</p>
              <p className="font-bold text-white text-sm md:text-base">{formatCurrency(bot.currentCapital)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">P&L</p>
              <p className={`font-bold text-sm md:text-base ${bot.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(bot.profitLoss)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Return</p>
              <p className={`font-bold text-sm md:text-base ${bot.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatPercent(bot.profitLossPercent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Win Rate</p>
              <p className="font-bold text-white text-sm md:text-base">{bot.winRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>Performance</span>
              <span>{bot.totalTrades} trades</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  bot.profitLossPercent >= 0
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    : "bg-gradient-to-r from-red-500 to-orange-500"
                }`}
                style={{ width: `${Math.min(100, Math.abs(bot.profitLossPercent) * 2 + 50)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions (shown when selected) */}
        {isSelected && (
          <div className="border-t border-white/5 p-3 md:p-4 bg-black/20 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleToggleStatus}
              className={`flex-1 min-w-[100px] py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                bot.status === "active"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              }`}
            >
              {bot.status === "active" ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resume
                </>
              )}
            </button>

            <button
              onClick={handleSimulateTrade}
              disabled={bot.status !== "active" || isSimulating}
              className="flex-1 min-w-[100px] py-2.5 rounded-xl font-bold text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isSimulating ? "Trading..." : "Force Trade"}
            </button>

            <button
              onClick={() => setShowConfirmDelete(true)}
              className="py-2.5 px-4 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmDelete(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-[#12141a] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete Bot?</h3>
            <p className="text-white/40 text-sm text-center mb-6">
              This will permanently delete "{bot.name}" and all its trade history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 text-white/60 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
