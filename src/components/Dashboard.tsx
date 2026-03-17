import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { CreateBotModal } from "./CreateBotModal";
import { BotCard } from "./BotCard";
import { TradeHistory } from "./TradeHistory";
import { Id } from "../../convex/_generated/dataModel";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const bots = useQuery(api.bots.list);
  const portfolio = useQuery(api.portfolio.get);
  const stats = useQuery(api.trades.getStats);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<Id<"bots"> | null>(null);
  const [mobileNav, setMobileNav] = useState<"bots" | "trades">("bots");

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

  return (
    <div className="min-h-screen bg-[#0a0b0d] relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-emerald-500/10 bg-[#0a0b0d]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl rotate-12 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-black -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">NEXUS</span>
                <span className="text-white/90">TRADE</span>
              </h1>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 pb-32 md:pb-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 md:p-5">
            <p className="text-emerald-400/60 text-xs font-mono tracking-wider mb-1">PORTFOLIO VALUE</p>
            <p className="text-2xl md:text-3xl font-black text-white">
              {portfolio ? formatCurrency(portfolio.totalValue) : "$0.00"}
            </p>
            <div className={`flex items-center gap-1 mt-1 ${(portfolio?.totalProfitPercent || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              <svg className={`w-4 h-4 ${(portfolio?.totalProfitPercent || 0) >= 0 ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-sm font-bold">{formatPercent(portfolio?.totalProfitPercent || 0)}</span>
            </div>
          </div>

          <div className="bg-[#12141a] border border-white/5 rounded-2xl p-4 md:p-5">
            <p className="text-white/40 text-xs font-mono tracking-wider mb-1">TOTAL P&L</p>
            <p className={`text-xl md:text-2xl font-black ${(portfolio?.totalProfit || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {portfolio ? formatCurrency(portfolio.totalProfit) : "$0.00"}
            </p>
          </div>

          <div className="bg-[#12141a] border border-white/5 rounded-2xl p-4 md:p-5">
            <p className="text-white/40 text-xs font-mono tracking-wider mb-1">ACTIVE BOTS</p>
            <p className="text-xl md:text-2xl font-black text-cyan-400">
              {bots?.filter((b: { status: string }) => b.status === "active").length || 0}
            </p>
          </div>

          <div className="bg-[#12141a] border border-white/5 rounded-2xl p-4 md:p-5">
            <p className="text-white/40 text-xs font-mono tracking-wider mb-1">WIN RATE</p>
            <p className="text-xl md:text-2xl font-black text-white">
              {stats?.totalTrades ? `${((stats.winningTrades / stats.totalTrades) * 100).toFixed(1)}%` : "0%"}
            </p>
          </div>
        </div>

        {/* Mobile navigation tabs */}
        <div className="flex md:hidden gap-2 mb-4 bg-[#12141a] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setMobileNav("bots")}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              mobileNav === "bots"
                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-white/40"
            }`}
          >
            Trading Bots
          </button>
          <button
            onClick={() => setMobileNav("trades")}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              mobileNav === "trades"
                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-white/40"
            }`}
          >
            Trade History
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Bots Section */}
          <div className={`md:col-span-2 ${mobileNav !== "bots" ? "hidden md:block" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Trading Bots
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-black text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Bot</span>
              </button>
            </div>

            {bots === undefined ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#12141a] border border-white/5 rounded-2xl p-5 animate-pulse">
                    <div className="h-6 bg-white/10 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : bots.length === 0 ? (
              <div className="bg-[#12141a] border border-dashed border-emerald-500/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold mb-2">No Trading Bots Yet</h3>
                <p className="text-white/40 text-sm mb-4">Create your first AI-powered trading bot to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-black text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  Create Your First Bot
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bots.map((bot: { _id: Id<"bots">; name: string; strategy: string; tradingPair: string; status: string; initialCapital: number; currentCapital: number; profitLoss: number; profitLossPercent: number; totalTrades: number; winRate: number; createdAt: number; lastTradeAt?: number }) => (
                  <BotCard
                    key={bot._id}
                    bot={bot}
                    isSelected={selectedBotId === bot._id}
                    onSelect={() => setSelectedBotId(selectedBotId === bot._id ? null : bot._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Trade History Section */}
          <div className={`${mobileNav !== "trades" ? "hidden md:block" : ""}`}>
            <TradeHistory selectedBotId={selectedBotId} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-white/20 text-xs font-mono">
            Requested by <span className="text-emerald-500/50">@web-user</span> · Built by <span className="text-cyan-500/50">@clonkbot</span>
          </p>
        </footer>
      </main>

      {/* Create Bot Modal */}
      {showCreateModal && (
        <CreateBotModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Mobile floating action button */}
      <div className="fixed bottom-6 right-6 md:hidden z-30">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40"
        >
          <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
