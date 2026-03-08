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

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  error: "border-red-500/20 bg-red-500/10 text-red-400",
  info: "border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const Icon = ICONS[t.type];

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), (t.duration || 3000) - 300);
    const removeTimer = setTimeout(() => onDismiss(t.id), t.duration || 3000);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, [t, onDismiss]);

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-[var(--radius-md)] border backdrop-blur-md shadow-[var(--shadow-lg)] transition-all duration-300 ${STYLES[t.type]} ${
        exiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-[13px] font-medium flex-1">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <X className="w-3 h-3" />
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
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-[360px]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
