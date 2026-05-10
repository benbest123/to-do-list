// Runs in every test file's environment before the test framework is installed.
// Setting env vars here ensures they are available when modules are first required.
process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.SPOTIFY_CLIENT_ID = "test-client-id";
process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";
process.env.SPOTIFY_REDIRECT_URI = "http://localhost:8000/api/spotify/callback";
process.env.FRONTEND_URI = "http://localhost:5173";
