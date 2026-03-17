export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-emerald-500/20 rounded-full animate-ping absolute" />
        <div className="w-20 h-20 border-2 border-t-emerald-400 border-r-emerald-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
