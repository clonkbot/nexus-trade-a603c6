import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CreateBotModalProps {
  onClose: () => void;
}

const strategies = [
  { id: "momentum", name: "Momentum", description: "Follows price trends and momentum indicators", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { id: "mean_reversion", name: "Mean Reversion", description: "Trades based on price returning to average", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { id: "grid", name: "Grid Trading", description: "Places buy/sell orders at preset intervals", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { id: "dca", name: "DCA Bot", description: "Dollar-cost averaging at regular intervals", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const tradingPairs = [
  { id: "BTC/USDT", name: "Bitcoin", symbol: "BTC" },
  { id: "ETH/USDT", name: "Ethereum", symbol: "ETH" },
  { id: "SOL/USDT", name: "Solana", symbol: "SOL" },
  { id: "AVAX/USDT", name: "Avalanche", symbol: "AVAX" },
];

export function CreateBotModal({ onClose }: CreateBotModalProps) {
  const createBot = useMutation(api.bots.create);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState("");
  const [tradingPair, setTradingPair] = useState("");
  const [initialCapital, setInitialCapital] = useState("1000");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !strategy || !tradingPair || !initialCapital) return;
    setIsCreating(true);
    try {
      await createBot({
        name,
        strategy,
        tradingPair,
        initialCapital: parseFloat(initialCapital),
      });
      onClose();
    } catch (error) {
      console.error("Failed to create bot:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#12141a] border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#12141a] border-b border-white/5 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Create Trading Bot</h2>
              <p className="text-white/40 text-sm mt-1">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2">Bot Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alpha Momentum Bot"
                  className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2">Trading Strategy</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {strategies.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStrategy(s.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        strategy === s.id
                          ? "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/20"
                          : "bg-black/20 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                        strategy === s.id ? "bg-emerald-500/20" : "bg-white/5"
                      }`}>
                        <svg className={`w-5 h-5 ${strategy === s.id ? "text-emerald-400" : "text-white/40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                        </svg>
                      </div>
                      <p className={`font-bold text-sm ${strategy === s.id ? "text-emerald-400" : "text-white"}`}>{s.name}</p>
                      <p className="text-xs text-white/40 mt-1">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2">Trading Pair</label>
                <div className="grid grid-cols-2 gap-3">
                  {tradingPairs.map((pair) => (
                    <button
                      key={pair.id}
                      onClick={() => setTradingPair(pair.id)}
                      className={`p-4 rounded-xl border transition-all ${
                        tradingPair === pair.id
                          ? "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/20"
                          : "bg-black/20 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        tradingPair === pair.id ? "bg-emerald-500/20" : "bg-white/5"
                      }`}>
                        <span className={`text-lg font-black ${tradingPair === pair.id ? "text-emerald-400" : "text-white/60"}`}>
                          {pair.symbol.charAt(0)}
                        </span>
                      </div>
                      <p className={`font-bold text-sm text-center ${tradingPair === pair.id ? "text-emerald-400" : "text-white"}`}>
                        {pair.symbol}
                      </p>
                      <p className="text-xs text-white/40 text-center">{pair.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2">Initial Capital (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                  <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    min="100"
                    step="100"
                    className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 pl-8 text-white text-xl font-bold placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {["500", "1000", "2500", "5000"].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setInitialCapital(amount)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        initialCapital === amount
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-bold text-white/60 mb-3">Bot Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Name</span>
                    <span className="text-white font-medium">{name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Strategy</span>
                    <span className="text-emerald-400 font-medium">
                      {strategies.find((s) => s.id === strategy)?.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Trading Pair</span>
                    <span className="text-cyan-400 font-medium">{tradingPair || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Capital</span>
                    <span className="text-white font-bold">${initialCapital}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#12141a] border-t border-white/5 p-4 md:p-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && (!name || !strategy)) || (step === 2 && !tradingPair)}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-black hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating || !name || !strategy || !tradingPair || !initialCapital}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-black hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Launch Bot"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
