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
import { InvitePage } from "./pages/InvitePage";
import { SettingsPage } from "./pages/SettingsPage";
import { TeamPage } from "./pages/TeamPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ClientDetail } from "./pages/ClientDetail";
import { ImpressumPage, DatenschutzPage } from "./pages/LegalPages";
import { CookieBanner } from "./components/CookieBanner";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileHeader } from "./components/layout/MobileHeader";
import { ClientFilterProvider } from "./lib/clientFilter";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { KeyboardShortcutsDialog } from "./components/layout/KeyboardShortcuts";
import { CommandPalette } from "./components/layout/CommandPalette";
import { PageTransition } from "./components/layout/PageTransition";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AdminRoutes({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string, id?: string) => void }) {
  if (currentPage === "clients") return <ClientsPage onNavigate={onNavigate} />;
  if (currentPage.startsWith("client:")) return <ClientDetail clientId={currentPage.split(":")[1]} onBack={() => onNavigate("clients")} onNavigate={onNavigate} />;
  if (currentPage === "ideas") return <IdeasPage onNavigate={onNavigate} />;
  if (currentPage.startsWith("idea:")) return <IdeaDetail ideaId={currentPage.split(":")[1]} onBack={() => onNavigate("ideas")} onNavigate={onNavigate} />;
  if (currentPage === "pipeline") return <PipelinePage onNavigate={onNavigate} />;
  if (currentPage === "videos") return <VideosPage onNavigate={onNavigate} />;
  if (currentPage === "library") return <LibraryPage onNavigate={onNavigate} />;
  if (currentPage.startsWith("video:")) return <VideoReview videoId={currentPage.split(":")[1]} onBack={() => onNavigate("videos")} onNavigate={onNavigate} />;
  if (currentPage === "calendar") return <CalendarPage onNavigate={onNavigate} />;
  if (currentPage === "team") return <TeamPage />;
  if (currentPage === "settings") return <SettingsPage />;
  return <AdminDashboard onNavigate={onNavigate} />;
}

function ClientRoutes({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string, id?: string) => void }) {
  if (currentPage === "videos") return <VideosPage onNavigate={onNavigate} />;
  if (currentPage === "pipeline") return <PipelinePage onNavigate={onNavigate} />;
  if (currentPage === "calendar") return <CalendarPage onNavigate={onNavigate} />;
  if (currentPage.startsWith("idea:")) return <IdeaDetail ideaId={currentPage.split(":")[1]} onBack={() => onNavigate("dashboard")} onNavigate={onNavigate} />;
  if (currentPage.startsWith("video:")) return <VideoReview videoId={currentPage.split(":")[1]} onBack={() => onNavigate("videos")} onNavigate={onNavigate} />;
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

  if (!user) return <><LoginPage /><CookieBanner /></>;

  return (
    <div className="flex h-dvh bg-[var(--color-surface-0)]">
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
        <div className="flex-1 overflow-auto dot-grid">
          <PageTransition pageKey={currentPage}>
            {user.role === "admin"
              ? <AdminRoutes currentPage={currentPage} onNavigate={handleNavigate} />
              : <ClientRoutes currentPage={currentPage} onNavigate={handleNavigate} />
            }
          </PageTransition>
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

function InviteRoute() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/invite/")) {
      setToken(hash.replace("#/invite/", ""));
    }
    const handleHashChange = () => {
      const h = window.location.hash;
      if (h.startsWith("#/invite/")) {
        setToken(h.replace("#/invite/", ""));
      } else {
        setToken(null);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!token) return null;

  const handleLogin = (sessionToken: string) => {
    localStorage.setItem("session_token", sessionToken);
    window.location.hash = "#/dashboard";
    window.location.reload();
  };

  return <InvitePage token={token} onLogin={handleLogin} />;
}

function AppRouter() {
  const [route, setRoute] = useState(() => {
    const h = window.location.hash;
    if (h.startsWith("#/share/")) return "share";
    if (h.startsWith("#/invite/")) return "invite";
    if (h === "#/impressum") return "impressum";
    if (h === "#/datenschutz") return "datenschutz";
    return "app";
  });

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash;
      if (h.startsWith("#/share/")) setRoute("share");
      else if (h.startsWith("#/invite/")) setRoute("invite");
      else if (h === "#/impressum") setRoute("impressum");
      else if (h === "#/datenschutz") setRoute("datenschutz");
      else setRoute("app");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goBack = () => { window.location.hash = "#/"; };

  if (route === "share") return <><ShareRoute /><CookieBanner /></>;
  if (route === "invite") return <><InviteRoute /><CookieBanner /></>;
  if (route === "impressum") return <><ImpressumPage onBack={goBack} /><CookieBanner /></>;
  if (route === "datenschutz") return <><DatenschutzPage onBack={goBack} /><CookieBanner /></>;
  return <AuthProvider><ClientFilterProvider><AppContent /></ClientFilterProvider></AuthProvider>;
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <AppRouter />
    </ConvexProvider>
  );
}
