import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider, useAuth } from "./lib/auth";
import { LoginPage } from "./pages/Login";
import { lazy, Suspense, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CookieBanner } from "./components/CookieBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileHeader } from "./components/layout/MobileHeader";
import { ClientFilterProvider } from "./lib/clientFilter";
import { KeyboardShortcutsDialog } from "./components/layout/KeyboardShortcuts";
import { CommandPalette } from "./components/layout/CommandPalette";
import { PageTransition } from "./components/layout/PageTransition";

// Lazy-loaded pages for code splitting
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard").then(m => ({ default: m.ClientDashboard })));
const ClientsPage = lazy(() => import("./pages/ClientsPage").then(m => ({ default: m.ClientsPage })));
const IdeasPage = lazy(() => import("./pages/IdeasPage").then(m => ({ default: m.IdeasPage })));
const IdeaDetail = lazy(() => import("./pages/IdeaDetail").then(m => ({ default: m.IdeaDetail })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then(m => ({ default: m.CalendarPage })));
const PipelinePage = lazy(() => import("./pages/PipelinePage").then(m => ({ default: m.PipelinePage })));
const VideosPage = lazy(() => import("./pages/VideosPage").then(m => ({ default: m.VideosPage })));
const VideoReview = lazy(() => import("./pages/VideoReview").then(m => ({ default: m.VideoReview })));
const SharePage = lazy(() => import("./pages/SharePage").then(m => ({ default: m.SharePage })));
const InvitePage = lazy(() => import("./pages/InvitePage").then(m => ({ default: m.InvitePage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const TeamPage = lazy(() => import("./pages/TeamPage").then(m => ({ default: m.TeamPage })));
const LibraryPage = lazy(() => import("./pages/LibraryPage").then(m => ({ default: m.LibraryPage })));
const ClientDetail = lazy(() => import("./pages/ClientDetail").then(m => ({ default: m.ClientDetail })));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage").then(m => ({ default: m.AuditLogPage })));
import { ImpressumPage, DatenschutzPage } from "./pages/LegalPages";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-tertiary)]" />
    </div>
  );
}

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
  if (currentPage === "audit") return <AuditLogPage />;
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
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <PageTransition pageKey={currentPage}>
                {user.role === "admin"
                  ? <AdminRoutes currentPage={currentPage} onNavigate={handleNavigate} />
                  : <ClientRoutes currentPage={currentPage} onNavigate={handleNavigate} />
                }
              </PageTransition>
            </Suspense>
          </ErrorBoundary>
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
  return <AuthProvider><ClientFilterProvider><ToastProvider><AppContent /></ToastProvider></ClientFilterProvider></AuthProvider>;
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <AppRouter />
    </ConvexProvider>
  );
}
