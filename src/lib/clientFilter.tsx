import { createContext, useContext, useState, type ReactNode } from "react";

interface ClientFilterContextValue {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
}

const ClientFilterContext = createContext<ClientFilterContextValue>({
  selectedClientId: null,
  setSelectedClientId: () => {},
});

export function ClientFilterProvider({ children }: { children: ReactNode }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  return (
    <ClientFilterContext.Provider value={{ selectedClientId, setSelectedClientId }}>
      {children}
    </ClientFilterContext.Provider>
  );
}

export function useClientFilter() {
  return useContext(ClientFilterContext);
}
