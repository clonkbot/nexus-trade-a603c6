import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-emerald-500/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/15 rounded-full" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo and title */}
      <div className="relative z-10 mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl rotate-12 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg className="w-8 h-8 text-black -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            NEXUS
          </span>
          <span className="text-white/90">TRADE</span>
        </h1>
        <p className="text-emerald-400/60 font-mono text-sm mt-2 tracking-widest">AI-POWERED TRADING BOTS</p>
      </div>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
        <div className="relative bg-[#12141a]/90 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-8 shadow-2xl">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-emerald-400/50 rounded-tr-lg" />
          </div>
          <div className="absolute bottom-0 left-0 w-20 h-20 overflow-hidden">
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-emerald-400/50 rounded-bl-lg" />
          </div>

          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setFlow("signIn")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 ${
                flow === "signIn"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-lg shadow-emerald-500/30"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setFlow("signUp")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 ${
                flow === "signUp"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-lg shadow-emerald-500/30"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <input
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-black tracking-wider hover:shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
            >
              <span className="relative z-10">{isLoading ? "PROCESSING..." : flow === "signIn" ? "ACCESS TERMINAL" : "CREATE ACCOUNT"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#12141a] text-emerald-500/40 text-xs tracking-widest">OR</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="w-full py-4 bg-white/5 border border-emerald-500/30 rounded-xl font-bold text-emerald-400 tracking-wider hover:bg-white/10 hover:border-emerald-400 transition-all duration-300 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              DEMO MODE
            </span>
          </button>

          <p className="text-center text-white/30 text-xs mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-12 text-center">
        <p className="text-white/20 text-xs font-mono">
          Requested by <span className="text-emerald-500/50">@web-user</span> · Built by <span className="text-cyan-500/50">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
