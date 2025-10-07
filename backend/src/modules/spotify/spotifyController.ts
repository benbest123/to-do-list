import crypto from "crypto";
import { Request, Response } from "express";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;
const FRONTEND_URI = `${process.env.FRONTEND_URI}/spotify`;

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SCOPE = "user-read-private user-read-email";

// Store code verifiers temporarily (in production, use Redis or similar)
const codeVerifiers = new Map<string, string>();

// Generate PKCE challenge
function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return hash.toString("base64url");
}

// Generate random string
function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

// Route: Initiate Spotify login
export const spotifyLogin = (req: Request, res: Response) => {
  const state = generateRandomString(16);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store code verifier with state
  codeVerifiers.set(state, codeVerifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPE,
    redirect_uri: REDIRECT_URI,
    state: state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  const authUrl = `${AUTH_ENDPOINT}?${params.toString()}`;

  res.redirect(authUrl);
};

export const spotifyGetToken = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.redirect(`${FRONTEND_URI}?error=missing_params`);
  }

  const codeVerifier = codeVerifiers.get(state as string);
  if (!codeVerifier) {
    return res.redirect(`${FRONTEND_URI}?error=invalid_state`);
  }

  // Clean up used verifier
  codeVerifiers.delete(state as string);

  try {
    // Exchange code for token
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.redirect(`${FRONTEND_URI}?error=${data.error}`);
    }

    // In production, store tokens securely (e.g., encrypted HTTP-only cookies or session)
    // For now, redirect with tokens (NOT recommended for production)
    const params = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });

    res.redirect(`${FRONTEND_URI}?${params.toString()}`);
  } catch (error) {
    console.error("Error getting token:", error);
    res.redirect(`${FRONTEND_URI}?error=token_exchange_failed`);
  }
};

export const spotifyRefreshToken = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

// Route: Get user data (proxy to avoid exposing tokens to frontend)
export const spotifyUserData = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: authHeader },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};
