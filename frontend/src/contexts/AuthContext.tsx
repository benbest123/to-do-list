import { createContext, ReactNode, useEffect, useState } from "react";
import { AuthContextType } from "../types/authcontext";
import { API_URL } from "../utils/constants";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // On mount, silently try to get a new access token using the refresh cookie
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
          setUsername(data.username);
        }
      } catch {
        // No valid refresh token — user is not logged in
      } finally {
        setIsInitialized(true);
      }
    };

    tryRefresh();
  }, []);

  const login = (username: string, token: string) => {
    setUsername(username);
    setToken(token);
    // Access token is in memory only. Refresh token is in the HttpOnly cookie
    // set by the server — no localStorage needed.
  };

  const logout = () => {
    // Fire and forget — clears the HttpOnly refresh cookie on the server
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUsername(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
