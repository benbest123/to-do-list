import { useEffect, useState } from "react";
import { TokenData, UserData } from "../types/spotify";
import { API_URL } from "../utils/constants";

interface UseSpotifyReturn {
  token: TokenData | null;
  userData: UserData | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export function useSpotify(): UseSpotifyReturn {
  const [token, setToken] = useState<TokenData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");
    const error = params.get("error");

    if (error) {
      console.error("Spotify auth error:", error);
      setLoading(false);
      return;
    }

    if (accessToken && refreshToken && expiresIn) {
      const tokenData: TokenData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: parseInt(expiresIn),
        expires_at: Date.now() + parseInt(expiresIn) * 1000,
      };
      sessionStorage.setItem("spotify_token", JSON.stringify(tokenData));
      setToken(tokenData);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchUserData(accessToken);
    } else {
      const stored = sessionStorage.getItem("spotify_token");
      if (stored) {
        const parsed: TokenData = JSON.parse(stored);
        if (parsed.expires_at && parsed.expires_at > Date.now()) {
          setToken(parsed);
          fetchUserData(parsed.access_token);
          return;
        } else {
          sessionStorage.removeItem("spotify_token");
        }
      }
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/spotify/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        setUserData(await response.json());
      } else {
        console.error("Failed to fetch Spotify user data");
      }
    } catch (error) {
      console.error("Error fetching Spotify user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${API_URL}/spotify/login`;
  };

  const logout = () => {
    sessionStorage.removeItem("spotify_token");
    setToken(null);
    setUserData(null);
  };

  const refreshToken = async () => {
    if (!token?.refresh_token) return;
    try {
      const response = await fetch(`${API_URL}/spotify/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: token.refresh_token }),
      });
      if (response.ok) {
        const data = await response.json();
        const newToken: TokenData = {
          access_token: data.access_token,
          refresh_token: data.refresh_token || token.refresh_token,
          expires_in: data.expires_in,
          expires_at: Date.now() + data.expires_in * 1000,
        };
        sessionStorage.setItem("spotify_token", JSON.stringify(newToken));
        setToken(newToken);
      }
    } catch (error) {
      console.error("Error refreshing Spotify token:", error);
    }
  };

  return { token, userData, loading, login, logout, refreshToken };
}
