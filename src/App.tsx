import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider, useAuth } from "./lib/auth";
import { LoginPage } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ClientDashboard } from "./pages/ClientDashboard";
import { ClientsPage } from "./pages/ClientsPage";
import { IdeasPage } from "./pages/IdeasPage";
import { IdeaDetail } from "./pages/IdeaDetail";
import { CalendarPage } from "./pages/CalendarPage";
import { PipelinePage } from "./pages/PipelinePage";
import { VideosPage } from "./pages/VideosPage";
import { VideoReview } from "./pages/VideoReview";
import { SharePage } from "./pages/SharePage";
import { SettingsPage } from "./pages/SettingsPage";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileHeader } from "./components/layout/MobileHeader";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { KeyboardShortcutsDialog } from "./components/layout/KeyboardShortcuts";
import { CommandPalette } from "./components/layout/CommandPalette";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AdminRoutes({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string, id?: string) => void }) {
  if (currentPage === "clients") return <ClientsPage />;
  if (currentPage === "ideas") return <IdeasPage onNavigate={onNavigate} />;
  if (currentPage.startsWith("idea:")) return <IdeaDetail ideaId={currentPage.split(":")[1]} onBack={() => onNavigate("ideas")} onNavigate={onNavigate} />;
  if (currentPage === "pipeline") return <PipelinePage />;
  if (currentPage === "videos") return <VideosPage onNavigate={onNavigate} />;
  if (currentPage.startsWith("video:")) return <VideoReview videoId={currentPage.split(":")[1]} onBack={() => onNavigate("videos")} />;
  if (currentPage === "calendar") return <CalendarPage />;
  if (currentPage === "settings") return <SettingsPage />;
  return <AdminDashboard onNavigate={onNavigate} />;
}

function ClientRoutes({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string, id?: string) => void }) {
  if (currentPage === "pipeline") return <PipelinePage />;
  if (currentPage === "calendar") return <CalendarPage />;
  if (currentPage.startsWith("idea:")) return <IdeaDetail ideaId={currentPage.split(":")[1]} onBack={() => onNavigate("dashboard")} onNavigate={onNavigate} />;
  if (currentPage.startsWith("video:")) return <VideoReview videoId={currentPage.split(":")[1]} onBack={() => onNavigate("dashboard")} />;
  return <ClientDashboard onNavigate={onNavigate} />;
}

function parseHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash || hash.startsWith("share/")) return "dashboard";
  return hash;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(parseHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      const p = parseHash();
      if (!p.startsWith("share/")) setCurrentPage(p);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleNavigate = (page: string, id?: string) => {
    const route = id ? `${page}:${id}` : page;
    window.location.hash = `#/${route}`;
    setCurrentPage(route);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-tertiary)]" />
          <p className="text-[13px] text-[var(--color-text-tertiary)]">Laden…</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen bg-[var(--color-surface-0)]">
      <KeyboardShortcutsDialog />
      <CommandPalette onNavigate={handleNavigate} />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-[var(--ease-out)]
        lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto">
          {user.role === "admin"
            ? <AdminRoutes currentPage={currentPage} onNavigate={handleNavigate} />
            : <ClientRoutes currentPage={currentPage} onNavigate={handleNavigate} />
          }
        </div>
      </div>
    </div>
  );
}

function ShareRoute() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/share/")) {
      setToken(hash.replace("#/share/", ""));
    }

    const handleHashChange = () => {
      const h = window.location.hash;
      if (h.startsWith("#/share/")) {
        setToken(h.replace("#/share/", ""));
      } else {
        setToken(null);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!token) return null;
  return <SharePage token={token} />;
}

export default function App() {
  const isShareRoute = window.location.hash.startsWith("#/share/");

  return (
    <ConvexProvider client={convex}>
      {isShareRoute ? (
        <ShareRoute />
      ) : (
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      )}
    </ConvexProvider>
  );
}
