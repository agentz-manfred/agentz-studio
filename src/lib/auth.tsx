import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface User {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "client";
  clientId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("session_token")
  );
  const [loading, setLoading] = useState(true);

  const session = useQuery(api.auth.getSession, token ? { token } : "skip");
  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (session !== undefined) {
      // If session is null, token is invalid — clean up
      if (session === null) {
        localStorage.removeItem("session_token");
        setToken(null);
      }
      setLoading(false);
    }
  }, [session, token]);

  const login = async (email: string, password: string) => {
    const result = await loginMutation({ email, password });
    localStorage.setItem("session_token", result.token);
    setToken(result.token);
  };

  const logout = async () => {
    if (token) {
      try { await logoutMutation({ token }); } catch { /* ignore */ }
    }
    localStorage.removeItem("session_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user: session as User | null, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
