import { useConvexAuth } from "convex/react";
import { Dashboard } from "./components/Dashboard";
import { AuthScreen } from "./components/AuthScreen";
import { LoadingScreen } from "./components/LoadingScreen";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      {isAuthenticated ? <Dashboard /> : <AuthScreen />}
    </div>
  );
}
