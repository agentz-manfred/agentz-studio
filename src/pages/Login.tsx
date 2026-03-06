import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, name, "admin");
      } else {
        await login(email, password);
      }
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
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
            AgentZ Studio
          </h1>
          <p className="mt-2 text-[15px] text-[var(--color-text-secondary)]">
            Production Management
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="animate-in">
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[15px] transition-all duration-200 ease-[var(--ease-out)] focus:border-[var(--color-accent)] focus:ring-0 focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
                placeholder="Dein Name"
                required
              />
            </div>
          )}

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
            {isRegister ? "Registrieren" : "Anmelden"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {isRegister ? "Bereits registriert? Anmelden" : "Noch kein Konto? Registrieren"}
          </button>
        </div>
      </div>
    </div>
  );
}
