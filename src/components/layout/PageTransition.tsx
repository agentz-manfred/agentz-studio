import { useEffect, useState, useRef } from "react";

interface PageTransitionProps {
  pageKey: string;
  children: React.ReactNode;
}

export function PageTransition({ pageKey, children }: PageTransitionProps) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (prevKey.current !== pageKey) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitioning(false);
        prevKey.current = pageKey;
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pageKey, children]);

  return (
    <div
      className="transition-all duration-150 ease-[var(--ease-out)]"
      style={{
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "translateY(4px)" : "translateY(0)",
      }}
    >
      {displayChildren}
    </div>
  );
}
