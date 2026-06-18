import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pp_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pp_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("pp_token", token);
    localStorage.setItem("pp_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
