import { useState, useEffect } from "react";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { section: "Video Player", items: [
    { keys: ["Space"], desc: "Play / Pause" },
    { keys: ["←"], desc: "5 Sekunden zurück" },
    { keys: ["→"], desc: "5 Sekunden vor" },
    { keys: ["M"], desc: "Ton ein/aus" },
    { keys: ["F"], desc: "Vollbild" },
  ]},
  { section: "Navigation", items: [
    { keys: ["?"], desc: "Diese Übersicht" },
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[400px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[var(--color-text-tertiary)]" />
            <h2 className="text-[15px] font-semibold">Tastenkürzel</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          {SHORTCUTS.map((section) => (
            <div key={section.section}>
              <h3 className="text-[12px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                {section.section}
              </h3>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <div key={item.desc} className="flex items-center justify-between">
                    <span className="text-[13px] text-[var(--color-text-secondary)]">{item.desc}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="min-w-[24px] h-6 px-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[11px] font-mono font-medium text-[var(--color-text-secondary)] flex items-center justify-center"
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
