import { Menu, Search } from "lucide-react";

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden flex items-center h-14 px-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-1)]">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors"
      >
        <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
      </button>
      <div className="ml-3 flex-1 flex items-center gap-2.5">
        <div className="w-6 h-6 flex items-center justify-center border border-[var(--color-green)]" style={{
          background: 'var(--color-surface-0)',
          boxShadow: '1.5px 1.5px 0px var(--color-green)',
        }}>
          <span className="text-[12px] font-bold text-[var(--color-green)]" style={{ fontFamily: 'var(--font-display)' }}>A</span>
        </div>
        <span className="text-[14px] font-bold tracking-[-0.01em] uppercase" style={{ fontFamily: 'var(--font-display)' }}>Agent<span className="text-[var(--color-green)]">Z</span> <span className="text-[var(--color-text-muted)] text-[11px] font-medium tracking-[0.15em]">Studio</span></span>
      </div>
      <button
        onClick={() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
        }}
        className="p-2 -mr-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors"
      >
        <Search className="w-5 h-5 text-[var(--color-text-secondary)]" />
      </button>
    </div>
  );
}
