import request from "supertest";
import { createApp } from "../../app";

// ── mock fetch globally before the app loads ─────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// ── mock database (not used by spotify routes but required by app bootstrap) ─
jest.mock("../../shared/database", () => {
  const Database = require("better-sqlite3");
  const db = new Database(":memory:");
  return { __esModule: true, default: db };
});

const app = createApp();

beforeAll(() => {
  process.env.SPOTIFY_CLIENT_ID = "test-client-id";
  process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";
  process.env.SPOTIFY_REDIRECT_URI = "http://localhost:8000/api/spotify/callback";
  process.env.FRONTEND_URI = "http://localhost:5173";
  process.env.CORS_ORIGIN = "http://localhost:5173";
});

beforeEach(() => {
  mockFetch.mockReset();
});

// ── GET /api/spotify/login ───────────────────────────────────────────────────
describe("GET /api/spotify/login", () => {
  it("redirects to the Spotify authorization URL", async () => {
    const res = await request(app).get("/api/spotify/login");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("accounts.spotify.com/authorize");
  });

  it("includes the required OAuth params in the redirect URL", async () => {
    const res = await request(app).get("/api/spotify/login");
    const location = res.headers.location as string;
    expect(location).toContain("response_type=code");
    expect(location).toContain("client_id=test-client-id");
    expect(location).toContain("code_challenge_method=S256");
  });
});

// ── GET /api/spotify/callback ────────────────────────────────────────────────
describe("GET /api/spotify/callback", () => {
  it("redirects with error=missing_params when code or state is absent", async () => {
    const res = await request(app).get("/api/spotify/callback");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("error=missing_params");
  });

  it("redirects with error=invalid_state when state is unknown", async () => {
    const res = await request(app).get("/api/spotify/callback?code=abc&state=unknown-state");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("error=invalid_state");
  });

  it("exchanges the code for tokens when state is valid", async () => {
    // First get a valid state by hitting the login endpoint
    const loginRes = await request(app).get("/api/spotify/login");
    const location = loginRes.headers.location as string;
    const state = new URL(location).searchParams.get("state")!;

    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        access_token: "acc123",
        refresh_token: "ref123",
        expires_in: 3600,
      }),
    } as Response);

    const res = await request(app).get(`/api/spotify/callback?code=authcode&state=${state}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("access_token=acc123");
    expect(res.headers.location).toContain("refresh_token=ref123");
  });

  it("redirects with error when Spotify returns an error response", async () => {
    const loginRes = await request(app).get("/api/spotify/login");
    const location = loginRes.headers.location as string;
    const state = new URL(location).searchParams.get("state")!;

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ error: "invalid_grant" }),
    } as Response);

    const res = await request(app).get(`/api/spotify/callback?code=badcode&state=${state}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("error=invalid_grant");
  });
});

// ── POST /api/spotify/refresh ─────────────────────────────────────────────────
describe("POST /api/spotify/refresh", () => {
  it("returns 400 when refresh_token is missing", async () => {
    const res = await request(app).post("/api/spotify/refresh").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/refresh token required/i);
  });

  it("forwards the refresh response from Spotify", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ access_token: "new-acc", expires_in: 3600 }),
    } as Response);

    const res = await request(app).post("/api/spotify/refresh").send({ refresh_token: "old-refresh" });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBe("new-acc");
  });

  it("returns 500 when the fetch to Spotify fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const res = await request(app).post("/api/spotify/refresh").send({ refresh_token: "some-token" });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/failed to refresh token/i);
  });
});

// ── GET /api/spotify/me ───────────────────────────────────────────────────────
describe("GET /api/spotify/me", () => {
  it("returns 401 when no authorization header is present", async () => {
    const res = await request(app).get("/api/spotify/me");
    expect(res.status).toBe(401);
  });

  it("proxies the Spotify /me response", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ id: "spotify-user-id", display_name: "Test User" }),
    } as Response);

    const res = await request(app).get("/api/spotify/me").set("Authorization", "Bearer spotify-access-token");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("spotify-user-id");
  });

  it("returns 500 when the Spotify API call fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Spotify down"));

    const res = await request(app).get("/api/spotify/me").set("Authorization", "Bearer token");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch user data/i);
  });
});

// ── GET /api/spotify/top/:type ────────────────────────────────────────────────
describe("GET /api/spotify/top/:type", () => {
  it("returns 401 when no authorization header is present", async () => {
    const res = await request(app).get("/api/spotify/top/tracks");
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid type", async () => {
    const res = await request(app).get("/api/spotify/top/playlists").set("Authorization", "Bearer token");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/artists or tracks/i);
  });

  it("returns top tracks from Spotify", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ items: [{ name: "Track 1" }] }),
    } as Response);

    const res = await request(app).get("/api/spotify/top/tracks").set("Authorization", "Bearer spotify-token");

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it("returns top artists from Spotify", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ items: [{ name: "Artist 1" }] }),
    } as Response);

    const res = await request(app).get("/api/spotify/top/artists").set("Authorization", "Bearer spotify-token");

    expect(res.status).toBe(200);
    expect(res.body.items[0].name).toBe("Artist 1");
  });

  it("returns 500 when the Spotify API call fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const res = await request(app).get("/api/spotify/top/tracks").set("Authorization", "Bearer token");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/failed to fetch top items/i);
  });

  it("serves cached results without calling fetch again", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ items: [{ name: "Cached Track" }] }),
    } as Response);

    // First request populates the cache
    await request(app).get("/api/spotify/top/tracks?time_range=short_term").set("Authorization", "Bearer same-token");

    // Second request with the same params should use cache
    const res = await request(app)
      .get("/api/spotify/top/tracks?time_range=short_term")
      .set("Authorization", "Bearer same-token");

    expect(res.status).toBe(200);
    // fetch should only have been called once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
