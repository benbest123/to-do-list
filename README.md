<div align="center">

# Ben's Full-Stack Portfolio Project

**Initially a Todo list app to learn full-stack web dev, but branching out into more of a portfolio with various other applets**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

</div>

---

## Overview

This is a full-stack app styled after the Windows 95 desktop. It features user authentication, a fully interactive to-do list, and a Spotify OAuth integration — all built from scratch as a portfolio project to demonstrate end-to-end web development skills.

---

## Features

- **Windows 95 desktop UI** — retro aesthetic with a teal desktop, grey windowed panels, and a taskbar
- **User authentication** — register and log in with bcrypt-hashed passwords; short-lived access tokens (15 min) and long-lived refresh tokens (7 days, HttpOnly cookie)
- **Full todo CRUD** — create, complete, edit inline, and delete tasks
- **Drag-and-drop reordering** — reorder incomplete todos with smooth drag handles powered by dnd-kit
- **Spotify OAuth 2.0 (PKCE)** — connect your Spotify account; view your profile, top artists, and top tracks across three time ranges (4 weeks, 6 months, 1 year)
- **Protected routes** — unauthenticated users are redirected to the login page
- **Error dialogs** — user-facing error feedback styled as retro Windows dialog boxes
- **Persistent SQLite database** — data survives server restarts with a proper migrations system
- **Backend test suite** — Jest + Supertest integration tests covering auth, todos, and utilities

---

## Tech Stack

### Frontend

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| React 19        | UI framework              |
| TypeScript      | Type safety               |
| Vite            | Build tool and dev server |
| Tailwind CSS v4 | Styling                   |
| React Router v7 | Client-side routing       |
| dnd-kit         | Drag-and-drop reordering  |
| Lucide React    | Icons                     |

### Backend

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| Node.js + Express 5 | HTTP server and routing         |
| TypeScript          | Type safety                     |
| better-sqlite3      | Embedded SQLite database        |
| bcrypt              | Password hashing                |
| jsonwebtoken        | JWT-based authentication        |
| cookie-parser       | HttpOnly refresh token handling |
| dotenv              | Environment variable management |
| Jest + Supertest    | Integration and unit testing    |

---

## Project Structure

```
ben-fullstack-win95-portfolio/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/          # Registration, login, token refresh, logout
│       │   ├── todos/         # Todo CRUD endpoints + ownership checks
│       │   └── spotify/       # Spotify OAuth 2.0 (PKCE) flow + top items
│       ├── shared/
│       │   ├── database.ts    # SQLite connection + migrations runner
│       │   └── utils/         # Auth middleware, TTL map, helpers
│       └── __tests__/         # Jest integration tests
└── frontend/
    └── src/
        ├── components/        # Reusable UI components
        ├── contexts/          # Auth context (global user state)
        ├── hooks/             # useAuth, useTodos, useSpotify custom hooks
        ├── pages/             # Desktop, Auth, Todo, SpotifyAuth
        └── utils/             # Shared constants
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [Spotify Developer](https://developer.spotify.com/dashboard) app (for Spotify features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ben-fullstack-win95-portfolio.git
   cd ben-fullstack-win95-portfolio
   ```

2. **Install all dependencies**

   ```bash
   npm run install:all
   ```

3. **Configure environment variables**

   Create `backend/.env`:

   ```env
   JWT_SECRET=your_jwt_secret_here
   CORS_ORIGIN=http://localhost:5173
   FRONTEND_URI=http://localhost:5173
   PORT=8000

   # Spotify (optional — only needed for Spotify features)
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:8000/api/spotify/callback
   ```

### Running in Development

```bash
npm run dev
```

This starts both the backend (port 8000) and frontend (port 5173) concurrently.

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:8000 |

### Running Tests

```bash
cd backend && npm test
```

### Building for Production

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path       | Description                                                       | Auth required |
| ------ | ---------- | ----------------------------------------------------------------- | ------------- |
| `POST` | `/login`   | Register or log in; returns an access token + sets refresh cookie | No            |
| `POST` | `/refresh` | Issue a new access token using the refresh cookie                 | No            |
| `POST` | `/logout`  | Clear the refresh token cookie                                    | No            |

### Todos — `/api/todos`

| Method   | Path                | Description                          | Auth required |
| -------- | ------------------- | ------------------------------------ | ------------- |
| `GET`    | `/`                 | Fetch the authenticated user's todos | Yes           |
| `POST`   | `/add`              | Add a new todo                       | Yes           |
| `PATCH`  | `/toggle/:id`       | Toggle completed status              | Yes           |
| `PATCH`  | `/edit/:id`         | Edit a todo's title                  | Yes           |
| `PATCH`  | `/reorder`          | Update the display order             | Yes           |
| `DELETE` | `/delete/:id`       | Delete a single todo                 | Yes           |
| `DELETE` | `/delete-completed` | Delete all completed todos           | Yes           |

### Spotify — `/api/spotify`

| Method | Path         | Description                                          | Auth required |
| ------ | ------------ | ---------------------------------------------------- | ------------- |
| `GET`  | `/login`     | Initiate Spotify OAuth (PKCE) flow                   | No            |
| `GET`  | `/callback`  | Handle Spotify redirect and exchange code for tokens | No            |
| `POST` | `/refresh`   | Refresh a Spotify access token                       | No            |
| `GET`  | `/me`        | Fetch the authenticated Spotify user's profile       | No            |
| `GET`  | `/top/:type` | Fetch top artists or tracks for a given time range   | No            |

---

## Security Highlights

- Passwords are hashed with **bcrypt** before storage
- Auth uses **short-lived access tokens (15 min)** and **long-lived refresh tokens (7 days)** stored in an HttpOnly cookie
- JWTs are verified on every protected route via middleware
- All todo mutations include **ownership checks** — users cannot read or modify each other's data
- Spotify PKCE state uses a **TTL map** to prevent replay attacks and memory leaks
- CORS origin is configured via environment variable, not hardcoded
- Input validation is applied at the API boundary

---

## Roadmap

- [ ] Shared types package — extract duplicated `Todo` type into a monorepo-level `packages/types` directory
- [ ] Football scores integration (embed https://github.com/benbest123/epl-tracker-ui)
- [ ] Separate Register and Log In flows
- [ ] Link Spotify account to app user account in the database
- [ ] Actual deployment

---

## License

MIT

---

## Acknowledgements

- [**MishaKav/jest-coverage-comment**](https://github.com/MishaKav/jest-coverage-comment) — GitHub Action used to post Jest coverage reports as PR comments. Thanks to Misha Kav for maintaining this.
