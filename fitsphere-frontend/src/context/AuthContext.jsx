import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { session } from "../services/api";
import * as auth from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" while we verify a stored token with GET /auth/me (session restore)
  const [loading, setLoading] = useState(() => !!session.getToken());

  useEffect(() => {
    if (!session.getToken()) return undefined;
    let cancelled = false;
    auth
      .fetchCurrentUser()
      .then((u) => !cancelled && setUser(u))
      .catch((err) => {
        // 401 is already handled (token cleared + redirect) by api.js
        if (err?.response?.status === 401 || err?.response?.status === 403) session.clear();
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    await auth.login(email, password);
    const u = await auth.fetchCurrentUser();
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      logout,
      isAdmin: (user?.role || "").toUpperCase() === "ADMIN",
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
