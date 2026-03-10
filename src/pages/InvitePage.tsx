import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

export function InvitePage({ token, onLogin }: { token: string; onLogin: (sessionToken: string) => void }) {
  const invite = useQuery(api.invites.validate, { token });
  const redeemInvite = useAction(api.invitesActions.redeem);
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
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 border-2 border-[var(--color-error)]" style={{ borderRadius: 0, background: "rgba(239,68,68,0.08)" }}>
            <XCircle className="w-8 h-8" style={{ color: "#ef4444" }} />
          </div>
          <h1 className="text-[22px] font-bold uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>Einladung ungültig</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-8 mt-2">{invite.error}</p>
          <a
            href="#/"
            className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--color-green)] text-[#0A0A0A] text-[12px] font-bold uppercase border-2 border-[var(--color-green-dark)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)] transition-all"
            style={{ borderRadius: 0, letterSpacing: '0.06em' }}
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
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 border-2 border-[var(--color-green)]" style={{ borderRadius: 0, background: "var(--color-green-subtle)" }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: "var(--color-green)" }} />
          </div>
          <h1 className="text-[22px] font-bold uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>Willkommen!</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-8 mt-2">
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
          <div className="w-12 h-12 bg-[var(--color-green)] text-[#0A0A0A] flex items-center justify-center mx-auto mb-4 text-[20px] font-bold border-2 border-[var(--color-green-dark)] shadow-[var(--shadow-brutal)]" style={{ borderRadius: 0 }}>
            A
          </div>
          <h1 className="text-[24px] font-bold uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>AgentZ Studio</h1>
          <p className="text-[12px] text-[var(--color-text-tertiary)] uppercase font-bold mt-1" style={{ letterSpacing: '0.08em' }}>
            Zugang einrichten
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] overflow-hidden" style={{ borderRadius: 0 }}>
          {/* Welcome banner */}
          <div className="px-6 py-5 border-b-2 border-[var(--color-border-strong)] bg-[var(--color-surface-2)]">
            <p className="text-[13px] text-[var(--color-text-tertiary)] mb-1">Einladung für</p>
            <p className="text-[17px] font-semibold">{invite.clientName}</p>
            {invite.company && (
              <p className="text-[14px] text-[var(--color-text-secondary)] mt-0.5">{invite.company}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
                Anzeigename
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3  border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-colors"
                placeholder={invite.clientName || "Ihr Name"}
              />
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">Optional — wird im Studio angezeigt</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
                E-Mail
              </label>
              <div className="h-10 px-3  border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[14px] flex items-center text-[var(--color-text-secondary)]">
                {invite.email}
              </div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">Damit loggen Sie sich ein</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
                Passwort *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10  border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-colors"
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
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5">
                Passwort bestätigen *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full h-10 px-3  border bg-[var(--color-surface-0)] text-[14px] focus:outline-none transition-colors ${
                  confirmPassword && confirmPassword !== password
                    ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
                    : "border-[var(--color-border)] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)]"
                }`}
                placeholder="Passwort wiederholen"
                required
              />
            </div>

            {error && (
              <div className="px-3 py-2.5  text-[13px] font-medium" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || password.length < 6 || password !== confirmPassword}
              className="w-full h-11 mt-2 bg-[var(--color-green)] text-[#0A0A0A] text-[13px] font-bold uppercase border-2 border-[var(--color-green-dark)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              style={{ borderRadius: 0, letterSpacing: '0.06em' }}
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
