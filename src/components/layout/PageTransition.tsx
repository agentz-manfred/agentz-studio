import { useEffect, useState, useRef } from "react";

interface PageTransitionProps {
  pageKey: string;
  children: React.ReactNode;
}

export function PageTransition({ pageKey, children }: PageTransitionProps) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (prevKey.current !== pageKey) {
      // Exit phase
      setPhase("exit");
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children);
        setPhase("enter");
        prevKey.current = pageKey;
        // Enter → idle
        const enterTimer = setTimeout(() => setPhase("idle"), 200);
        return () => clearTimeout(enterTimer);
      }, 100);
      return () => clearTimeout(exitTimer);
    } else {
      setDisplayChildren(children);
    }
  }, [pageKey, children]);

  const style: React.CSSProperties =
    phase === "exit"
      ? {
          opacity: 0,
          transform: "translateX(-6px)",
          transition: "opacity 100ms var(--ease-brutal), transform 100ms var(--ease-brutal)",
        }
      : phase === "enter"
        ? {
            opacity: 1,
            transform: "translateX(0)",
            transition: "opacity 200ms var(--ease-out), transform 200ms var(--ease-out)",
          }
        : {
            opacity: 1,
            transform: "translateX(0)",
          };

  return <div style={style}>{displayChildren}</div>;
}
