import { useState, useEffect } from "react";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { section: "Navigation", items: [
    { keys: ["⌘", "K"], desc: "Suche / Command Palette" },
    { keys: ["↑", "↓"], desc: "Sidebar Navigation" },
    { keys: ["?"], desc: "Diese Übersicht" },
    { keys: ["Esc"], desc: "Dialog / Modal schließen" },
  ]},
  { section: "Video Player", items: [
    { keys: ["Space"], desc: "Play / Pause" },
    { keys: ["←"], desc: "5 Sekunden zurück" },
    { keys: ["→"], desc: "5 Sekunden vor" },
    { keys: ["M"], desc: "Ton ein/aus" },
    { keys: ["F"], desc: "Vollbild" },
  ]},
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={() => setOpen(false)}
      style={{
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(8px) saturate(120%)',
        WebkitBackdropFilter: 'blur(8px) saturate(120%)',
      }}
    >
      <div
        className="animate-in w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          background: 'var(--color-surface-1)',
          border: '2px solid var(--color-border-strong)',
          boxShadow: 'var(--shadow-brutal)',
        }}
      >
        {/* Green accent bar */}
        <div style={{ height: '3px', background: 'var(--color-green)' }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '2px solid var(--color-border-strong)' }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-green)',
              background: 'var(--color-green-subtle)',
            }}>
              <Keyboard style={{ width: '14px', height: '14px', color: 'var(--color-green)' }} strokeWidth={2} />
            </div>
            <h2 style={{
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-primary)',
            }}>
              TASTENKÜRZEL
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center"
            style={{
              width: '28px',
              height: '28px',
              border: '2px solid var(--color-border-strong)',
              background: 'transparent',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              transition: 'all 100ms var(--ease-brutal)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-error)';
              e.currentTarget.style.color = 'var(--color-error)';
              e.currentTarget.style.background = 'rgba(255, 51, 51, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
              e.currentTarget.style.color = 'var(--color-text-tertiary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {SHORTCUTS.map((section, sIdx) => (
            <div key={section.section} style={{ marginTop: sIdx > 0 ? '20px' : '0' }}>
              {/* Section header */}
              <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                <div style={{ width: '3px', height: '12px', background: 'var(--color-green)' }} />
                <h3 style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  {section.section}
                </h3>
              </div>
              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {section.items.map((item, iIdx) => (
                  <div
                    key={item.desc}
                    className="flex items-center justify-between"
                    style={{
                      padding: '6px 0',
                      borderTop: iIdx > 0 ? '1px solid var(--color-border-subtle)' : 'none',
                    }}
                  >
                    <span style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                    }}>
                      {item.desc}
                    </span>
                    <div className="flex gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="flex items-center justify-center"
                          style={{
                            minWidth: '24px',
                            height: '24px',
                            padding: '0 6px',
                            border: '2px solid var(--color-border-strong)',
                            background: 'var(--color-surface-2)',
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            color: 'var(--color-green)',
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
