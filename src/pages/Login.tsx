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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.03] pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-30%] left-[-15%] w-[800px] h-[800px] rounded-full opacity-[0.02] pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
        }}
      />

      <div className="animate-in w-full max-w-[400px] px-6 relative z-10">
        {/* Logo + Brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-5 bg-[var(--color-accent)] rounded-[14px] flex items-center justify-center shadow-[var(--shadow-md)]">
            <span className="text-white text-[22px] font-bold tracking-[-0.03em]">A</span>
          </div>
          <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[var(--color-text-primary)] leading-none">
            AgentZ Studio
          </h1>
          <p className="mt-2.5 text-[15px] text-[var(--color-text-tertiary)] tracking-[-0.01em]">
            Video Production Management
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
                className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border bg-[var(--color-surface-0)] text-[15px] transition-all duration-200 ease-[var(--ease-out)] focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
                style={{
                  borderColor: focused === "email" ? "var(--color-accent)" : "var(--color-border)",
                  boxShadow: focused === "email" ? "0 0 0 3px rgba(10,10,10,0.06)" : "none",
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
                className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border bg-[var(--color-surface-0)] text-[15px] transition-all duration-200 ease-[var(--ease-out)] focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
                style={{
                  borderColor: focused === "password" ? "var(--color-accent)" : "var(--color-border)",
                  boxShadow: focused === "password" ? "0 0 0 3px rgba(10,10,10,0.06)" : "none",
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
  );
}
