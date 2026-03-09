import { Menu, Search } from "lucide-react";

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden flex items-center h-14 px-4 border-b-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] relative">
      {/* Green accent line bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[2px]">
        <div className="absolute left-0 top-0 w-12 h-full bg-[var(--color-green)] opacity-50" />
        <div className="absolute right-0 top-0 w-12 h-full bg-[var(--color-green)] opacity-50" />
      </div>

      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-all duration-100 border border-transparent hover:border-[var(--color-border-green)]"
      >
        <Menu className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Brand */}
      <div className="ml-3 flex-1 flex items-center gap-2.5">
        <div className="w-6 h-6 flex items-center justify-center border-2 border-[var(--color-green)] bg-[var(--color-surface-0)]" style={{
          boxShadow: '2px 2px 0px var(--color-green-dark)',
        }}>
          <span className="text-[11px] font-bold text-[var(--color-green)]" style={{ fontFamily: 'var(--font-display)' }}>A</span>
        </div>
        <div className="flex items-baseline gap-0">
          <span className="text-[14px] font-bold tracking-[-0.01em] uppercase" style={{ fontFamily: 'var(--font-display)' }}>Agent</span>
          <span className="text-[14px] font-bold tracking-[-0.01em] text-[var(--color-green)] uppercase" style={{ fontFamily: 'var(--font-display)' }}>Z</span>
          <span className="text-[var(--color-text-muted)] text-[10px] font-semibold tracking-[0.2em] ml-2 uppercase">Studio</span>
        </div>
      </div>

      {/* Search */}
      <button
        onClick={() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
        }}
        className="p-2 -mr-2 text-[var(--color-text-secondary)] hover:text-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-all duration-100 border border-transparent hover:border-[var(--color-border-green)]"
      >
        <Search className="w-5 h-5" strokeWidth={2} />
      </button>
    </div>
  );
}
