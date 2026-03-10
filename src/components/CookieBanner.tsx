import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent");
    if (!accepted) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  return (
    <div
      className="fixed z-[100] animate-in"
      style={{ bottom: '16px', left: '16px', right: '16px' }}
    >
      <div
        className="flex items-start gap-3"
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: 'var(--color-surface-1)',
          border: '2px solid var(--color-border-strong)',
          boxShadow: 'var(--shadow-brutal)',
          padding: '16px',
        }}
      >
        {/* Icon box */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--color-green)',
            background: 'var(--color-green-subtle)',
            marginTop: '2px',
          }}
        >
          <Cookie style={{ width: '16px', height: '16px', color: 'var(--color-green)' }} strokeWidth={2} />
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p style={{
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            lineHeight: '1.5',
          }}>
            Nur technisch notwendige Cookies für Login und Einstellungen. Kein Tracking.{" "}
            <a
              href="#/datenschutz"
              style={{
                color: 'var(--color-green)',
                textDecoration: 'none',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '10px',
                letterSpacing: '0.06em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              MEHR →
            </a>
          </p>
        </div>
        {/* Accept button */}
        <button
          onClick={accept}
          className="flex-shrink-0 btn-brutal"
          style={{
            height: '32px',
            padding: '0 16px',
            fontSize: '11px',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
