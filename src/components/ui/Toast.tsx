import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Check, AlertTriangle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, typeof Check> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastType, { border: string; bg: string; text: string; iconBg: string }> = {
  success: {
    border: 'var(--color-green)',
    bg: 'var(--color-surface-1)',
    text: 'var(--color-green)',
    iconBg: 'rgba(0, 220, 130, 0.1)',
  },
  error: {
    border: 'var(--color-error)',
    bg: 'var(--color-surface-1)',
    text: 'var(--color-error)',
    iconBg: 'rgba(255, 51, 51, 0.1)',
  },
  info: {
    border: 'var(--color-info)',
    bg: 'var(--color-surface-1)',
    text: 'var(--color-info)',
    iconBg: 'rgba(59, 130, 246, 0.1)',
  },
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const Icon = ICONS[t.type];
  const colors = COLORS[t.type];

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), (t.duration || 3000) - 300);
    const removeTimer = setTimeout(() => onDismiss(t.id), t.duration || 3000);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, [t, onDismiss]);

  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: '10px 14px',
        background: colors.bg,
        border: '2px solid ' + colors.border,
        boxShadow: `3px 3px 0px ${colors.border}`,
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(12px)' : 'translateX(0)',
        transition: 'all 300ms var(--ease-brutal)',
        animation: 'toastSlideIn 250ms var(--ease-brutal)',
      }}
    >
      {/* Icon box */}
      <div style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid ' + colors.border,
        background: colors.iconBg,
        flexShrink: 0,
      }}>
        <Icon style={{ width: '14px', height: '14px', color: colors.text }} strokeWidth={2.5} />
      </div>
      {/* Message */}
      <span style={{
        fontSize: '12px',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        flex: 1,
      }}>
        {t.message}
      </span>
      {/* Dismiss */}
      <button
        onClick={() => onDismiss(t.id)}
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: '24px',
          height: '24px',
          border: '1px solid var(--color-border-strong)',
          background: 'transparent',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          transition: 'all 100ms var(--ease-brutal)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-error)';
          e.currentTarget.style.color = 'var(--color-error)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        <X style={{ width: '12px', height: '12px' }} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success", duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed z-[200] flex flex-col gap-2"
        style={{
          bottom: '24px',
          right: '24px',
          maxWidth: '380px',
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
