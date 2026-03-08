import { createContext, useContext, useState, type ReactNode } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface ClientFilterContextValue {
  selectedClientId: Id<"clients"> | null;
  setSelectedClientId: (id: Id<"clients"> | null) => void;
}

const ClientFilterContext = createContext<ClientFilterContextValue>({
  selectedClientId: null,
  setSelectedClientId: () => {},
});

export function ClientFilterProvider({ children }: { children: ReactNode }) {
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  return (
    <ClientFilterContext.Provider value={{ selectedClientId, setSelectedClientId }}>
      {children}
    </ClientFilterContext.Provider>
  );
}

export function useClientFilter() {
  return useContext(ClientFilterContext);
}
