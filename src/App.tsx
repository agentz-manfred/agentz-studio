import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider, useAuth } from "./lib/auth";
import { LoginPage } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ClientDashboard } from "./pages/ClientDashboard";
import { Sidebar } from "./components/layout/Sidebar";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)]">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen bg-[var(--color-surface-0)]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {user.role === "admin" ? <AdminDashboard /> : <ClientDashboard />}
    </div>
  );
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConvexProvider>
  );
}
