import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Loader2, ArrowRight, Play } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Fehler bei der Anmeldung");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)",
      }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
          <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="relative z-10 max-w-[420px] px-12">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 p-2.5">
              <img src="/agentz-logo.svg" alt="AgentZ" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-white tracking-[-0.03em]">AgentZ</h1>
              <p className="text-[14px] text-blue-200 tracking-wide uppercase font-medium">Studio</p>
            </div>
          </div>

          <h2 className="text-[36px] font-bold text-white leading-[1.15] tracking-[-0.03em] mb-4">
            Video Production,<br />
            <span className="text-blue-200">vereinfacht.</span>
          </h2>
          <p className="text-[16px] text-blue-100/80 leading-relaxed">
            Verwalte Ideen, Drehtermine, Skripte und Videos — alles an einem Ort. 
            Von der ersten Idee bis zur Veröffentlichung.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["Pipeline", "Kunden", "Drehplanung", "Video-Review"].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-[13px] border border-white/10 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[var(--color-surface-0)] relative">
        {/* Subtle accent glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)" }} />

        <div className="animate-in w-full max-w-[380px] px-6 relative z-10">
          {/* Mobile logo (hidden on lg) */}
          <div className="text-center mb-10 lg:hidden">
            <div className="w-14 h-14 mx-auto mb-5 bg-[var(--color-accent)] rounded-[14px] flex items-center justify-center shadow-[var(--shadow-md)] p-2">
              <img src="/agentz-logo.svg" alt="AgentZ" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
              AgentZ Studio
            </h1>
            <p className="mt-2 text-[15px] text-[var(--color-text-tertiary)]">
              Video Production Management
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
              Willkommen zurück
            </h2>
            <p className="mt-1.5 text-[15px] text-[var(--color-text-tertiary)]">
              Melde dich in deinem Account an
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-6 shadow-[var(--shadow-sm)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border bg-[var(--color-surface-0)] text-[15px] text-[var(--color-text-primary)] transition-all duration-200 ease-[var(--ease-out)] focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
                  style={{
                    borderColor: focused === "email" ? "var(--color-accent)" : "var(--color-border)",
                    boxShadow: focused === "email" ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
                  }}
                  placeholder="mail@beispiel.de"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border bg-[var(--color-surface-0)] text-[15px] text-[var(--color-text-primary)] transition-all duration-200 ease-[var(--ease-out)] focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
                  style={{
                    borderColor: focused === "password" ? "var(--color-accent)" : "var(--color-border)",
                    boxShadow: focused === "password" ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
                  }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 animate-in">
                  <p className="text-[13px] text-[var(--color-error)]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[15px] font-medium transition-all duration-200 ease-[var(--ease-out)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Anmelden
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-[12px] text-[var(--color-text-tertiary)]">
            © {new Date().getFullYear()} AgentZ Media
          </p>
        </div>
      </div>
    </div>
  );
}
