import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Loader2, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden" style={{ background: 'var(--color-surface-0)' }}>
      
      {/* ─── Left: Branding Panel ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center" style={{ background: 'var(--color-surface-1)' }}>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(0, 220, 130, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 220, 130, 0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Green glow — top left */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(0, 220, 130, 0.08) 0%, transparent 70%)',
        }} />

        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none scanlines opacity-[0.02]" />

        {/* Border-right brutal green line */}
        <div className="absolute right-0 top-0 bottom-0 w-[3px]" style={{ background: 'var(--color-green)' }} />

        <div className="relative z-10 max-w-[440px] px-12">
          {/* Logo mark */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 flex items-center justify-center border-2 border-[var(--color-green)]" style={{
              background: 'var(--color-surface-0)',
              boxShadow: '4px 4px 0px var(--color-green)',
            }}>
              <span className="text-[28px] font-bold text-[var(--color-green)]" style={{ fontFamily: 'var(--font-display)' }}>A</span>
            </div>
            <div>
              <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                AGENT<span className="text-[var(--color-green)]">Z</span>
              </h1>
              <p className="text-[12px] font-medium tracking-[0.3em] uppercase text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-body)' }}>
                Studio
              </p>
            </div>
          </div>

          <h2 className="text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--color-text-primary)] mb-5" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            Video<br/>
            Production,<br/>
            <span className="text-[var(--color-green)]">vereinfacht.</span>
          </h2>

          <p className="text-[15px] leading-relaxed text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
            Ideen, Drehtermine, Skripte und Videos — alles an einem Ort. 
            Von der ersten Idee bis zur Veröffentlichung.
          </p>

          {/* Feature tags — brutal style */}
          <div className="flex flex-wrap gap-2 mt-10">
            {["Pipeline", "Kunden", "Drehplanung", "Video-Review"].map((f, i) => (
              <span
                key={f}
                className="px-3 py-1.5 text-[12px] font-medium uppercase tracking-wide border border-[var(--color-border-strong)] text-[var(--color-text-secondary)]"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: i === 0 ? 'var(--color-green-subtle)' : 'var(--color-surface-2)',
                  color: i === 0 ? 'var(--color-green)' : undefined,
                  borderColor: i === 0 ? 'var(--color-border-green)' : undefined,
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Decorative brutal line */}
          <div className="mt-12 w-24 h-[3px]" style={{ background: 'var(--color-green)' }} />
        </div>
      </div>

      {/* ─── Right: Login Form ─── */}
      <div className="flex-1 flex items-center justify-center relative" style={{ background: 'var(--color-surface-0)' }}>
        {/* Subtle glow */}
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none" style={{
          background: 'radial-gradient(circle, var(--color-green) 0%, transparent 70%)',
        }} />

        <div className="w-full max-w-[400px] px-6 relative z-10 animate-in">

          {/* Mobile logo */}
          <div className="text-center mb-10 lg:hidden">
            <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center border-2 border-[var(--color-green)]" style={{
              background: 'var(--color-surface-1)',
              boxShadow: '4px 4px 0px var(--color-green)',
            }}>
              <span className="text-[32px] font-bold text-[var(--color-green)]" style={{ fontFamily: 'var(--font-display)' }}>A</span>
            </div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              AGENT<span className="text-[var(--color-green)]">Z</span> Studio
            </h1>
            <p className="mt-2 text-[13px] text-[var(--color-text-tertiary)] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-body)' }}>
              Video Production Management
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              Willkommen
            </h2>
            <div className="w-12 h-[3px] mt-2 mb-3" style={{ background: 'var(--color-green)' }} />
            <p className="text-[14px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-body)' }}>
              Melde dich in deinem Account an
            </p>
          </div>

          {/* Form card — brutal */}
          <div className="border border-[var(--color-border-strong)] p-6" style={{
            background: 'var(--color-surface-1)',
            boxShadow: '6px 6px 0px rgba(0, 220, 130, 0.15)',
          }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="w-full h-12 px-4 text-[15px] text-[var(--color-text-primary)] border-0 focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-muted)]"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: 'var(--color-surface-0)',
                    borderLeft: focused === "email" ? '3px solid var(--color-green)' : '3px solid var(--color-surface-3)',
                    transition: 'border-color 0.15s ease',
                  }}
                  placeholder="mail@beispiel.de"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="w-full h-12 px-4 text-[15px] text-[var(--color-text-primary)] border-0 focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-muted)]"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: 'var(--color-surface-0)',
                    borderLeft: focused === "password" ? '3px solid var(--color-green)' : '3px solid var(--color-surface-3)',
                    transition: 'border-color 0.15s ease',
                  }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 border-l-3 animate-in" style={{
                  background: 'rgba(255, 51, 51, 0.08)',
                  borderLeft: '3px solid var(--color-error)',
                }}>
                  <p className="text-[13px] text-[var(--color-error)]" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--color-surface-0)] flex items-center justify-center gap-2 group disabled:opacity-50 transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: 'var(--color-green)',
                  boxShadow: '4px 4px 0px var(--color-surface-0)',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-green-dark)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-surface-0)';
                }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Anmelden
                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-between text-[11px] text-[var(--color-text-muted)] uppercase tracking-[0.05em]" style={{ fontFamily: 'var(--font-body)' }}>
            <span>© {new Date().getFullYear()} AgentZ Media</span>
            <div className="flex gap-4">
              <a href="#/impressum" className="hover:text-[var(--color-text-secondary)] transition-colors">Impressum</a>
              <a href="#/datenschutz" className="hover:text-[var(--color-text-secondary)] transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
