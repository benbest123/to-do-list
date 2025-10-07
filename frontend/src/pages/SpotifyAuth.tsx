import { useEffect, useState } from "react";
import SpotifyLoginButton from "../components/spotify/SpotifyLoginButton";
import SpotifyTokenInfo from "../components/spotify/SpotifyTokenInfo";
import SpotifyUserProfile from "../components/spotify/SpotifyUserProfile";

const API_URL = "http://127.0.0.1:8000";

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
}

export interface UserData {
  display_name: string;
  email: string;
  id: string;
  images?: { url: string }[];
}

function SpotifyAuth() {
  const [token, setToken] = useState<TokenData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL params for tokens (returned from backend)
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");
    const error = params.get("error");

    if (error) {
      console.error("Auth error:", error);
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

      setToken(tokenData);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Fetch user data
      fetchUserData(accessToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/spotify/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/api/spotify/login`;
  };

  const handleLogout = () => {
    setToken(null);
    setUserData(null);
  };

  const handleRefreshToken = async () => {
    if (!token?.refresh_token) return;

    try {
      const response = await fetch(`${API_URL}/api/spotify/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: token.refresh_token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken: TokenData = {
          access_token: data.access_token,
          refresh_token: data.refresh_token || token.refresh_token,
          expires_in: data.expires_in,
          expires_at: Date.now() + data.expires_in * 1000,
        };
        setToken(newToken);
        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <main className="p-5 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Spotify Auth Demo</h1>

      {!token ? (
        <SpotifyLoginButton onLogin={handleLogin} />
      ) : (
        <div className="space-y-5">
          <SpotifyUserProfile userData={userData} />
          <SpotifyTokenInfo token={token} onRefresh={handleRefreshToken} onLogout={handleLogout} />
        </div>
      )}
    </main>
  );
}

export default SpotifyAuth;
