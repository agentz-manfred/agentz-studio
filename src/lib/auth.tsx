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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: "admin" | "client") => Promise<void>;
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
  const registerMutation = useMutation(api.auth.register);
  const logoutMutation = useMutation(api.auth.logout);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (session !== undefined) setLoading(false);
  }, [session, token]);

  const login = async (email: string, password: string) => {
    const result = await loginMutation({ email, password });
    localStorage.setItem("session_token", result.token);
    setToken(result.token);
  };

  const register = async (email: string, password: string, name: string, role: "admin" | "client") => {
    const result = await registerMutation({ email, password, name, role });
    localStorage.setItem("session_token", result.token);
    setToken(result.token);
  };

  const logout = async () => {
    if (token) await logoutMutation({ token });
    localStorage.removeItem("session_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user: session as User | null, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
