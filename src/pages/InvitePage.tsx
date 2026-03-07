import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

export function InvitePage({ token, onLogin }: { token: string; onLogin: (sessionToken: string) => void }) {
  const invite = useQuery(api.invites.validate, { token });
  const redeemInvite = useMutation(api.invites.redeem);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Loading state
  if (invite === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-tertiary)]" />
          <p className="text-[13px] text-[var(--color-text-tertiary)]">Einladung wird geprüft…</p>
        </div>
      </div>
    );
  }

  // Invalid invite
  if (!invite.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239,68,68,0.08)" }}>
            <XCircle className="w-8 h-8" style={{ color: "#ef4444" }} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] mb-2">Einladung ungültig</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)] mb-8">{invite.error}</p>
          <a
            href="#/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(22,163,74,0.08)" }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: "#16a34a" }} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] mb-2">Willkommen!</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)] mb-8">
            Ihr Zugang wurde erfolgreich eingerichtet. Sie werden weitergeleitet…
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await redeemInvite({
        token,
        password,
        name: name || undefined,
      });
      setSuccess(true);
      // Auto-login after short delay
      setTimeout(() => onLogin(result.token), 1500);
    } catch (err: any) {
      setError(err.message || "Fehler bei der Registrierung");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
      <div className="w-full max-w-[440px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white flex items-center justify-center mx-auto mb-4 text-[20px] font-bold tracking-tight">
            A
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] mb-1">AgentZ Studio</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            Zugang einrichten
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-md)] overflow-hidden">
          {/* Welcome banner */}
          <div className="px-6 py-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]">
            <p className="text-[13px] text-[var(--color-text-tertiary)] mb-1">Einladung für</p>
            <p className="text-[17px] font-semibold">{invite.clientName}</p>
            {invite.company && (
              <p className="text-[14px] text-[var(--color-text-secondary)] mt-0.5">{invite.company}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                Anzeigename
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                placeholder={invite.clientName || "Ihr Name"}
              />
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">Optional — wird im Studio angezeigt</p>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                E-Mail
              </label>
              <div className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[14px] flex items-center text-[var(--color-text-secondary)]">
                {invite.email}
              </div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">Damit loggen Sie sich ein</p>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                Passwort *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                  placeholder="Mindestens 6 Zeichen"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                Passwort bestätigen *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full h-10 px-3 rounded-[var(--radius-md)] border bg-[var(--color-surface-0)] text-[14px] focus:outline-none transition-colors ${
                  confirmPassword && confirmPassword !== password
                    ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
                    : "border-[var(--color-border)] focus:border-[var(--color-accent)]"
                }`}
                placeholder="Passwort wiederholen"
                required
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || password.length < 6 || password !== confirmPassword}
              className="w-full h-11 mt-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Zugang einrichten
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-[var(--color-text-tertiary)] mt-6">
          Bereits registriert?{" "}
          <a href="#/" className="text-[var(--color-accent)] hover:underline">Zum Login</a>
        </p>
      </div>
    </div>
  );
}
