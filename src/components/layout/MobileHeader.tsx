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
      <span className="ml-3 flex-1 text-[15px] font-semibold tracking-[-0.01em]">
        AgentZ Studio
      </span>
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
