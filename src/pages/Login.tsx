import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)]">
      <div className="animate-in w-full max-w-[380px] px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 mx-auto mb-4 bg-[var(--color-accent)] rounded-[var(--radius-md)] flex items-center justify-center">
            <span className="text-white text-[20px] font-bold">A</span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
            AgentZ Studio
          </h1>
          <p className="mt-2 text-[15px] text-[var(--color-text-secondary)]">
            Production Management
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[15px] transition-all duration-200 ease-[var(--ease-out)] focus:border-[var(--color-accent)] focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
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
              className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[15px] transition-all duration-200 ease-[var(--ease-out)] focus:border-[var(--color-accent)] focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[var(--color-error)] animate-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[15px] font-medium transition-all duration-200 ease-[var(--ease-out)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Anmelden
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-[var(--color-text-tertiary)]">
          © {new Date().getFullYear()} AgentZ Media
        </p>
      </div>
    </div>
  );
}
