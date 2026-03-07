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
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in">
      <div className="max-w-lg mx-auto bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-4 flex items-start gap-3">
        <Cookie className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            Diese Website verwendet nur technisch notwendige Cookies für Login und Einstellungen. Keine Tracking-Cookies.{" "}
            <a href="#/datenschutz" className="text-[var(--color-accent)] hover:underline">Mehr erfahren</a>
          </p>
        </div>
        <button
          onClick={accept}
          className="flex-shrink-0 h-8 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
