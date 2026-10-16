# URL Shortener

[![CI](https://github.com/ernesrama/url-shortener/actions/workflows/ci.yml/badge.svg)](https://github.com/ernesrama/url-shortener/actions/workflows/ci.yml)

A full-stack URL shortener with user accounts, custom short codes, click tracking,
link expiry, and an admin dashboard. Built as a TypeScript monorepo with a clean,
modular Express API and a React single-page app.

## Tech Stack

**Backend** (`UrlShortener.API`)
- Node.js + Express 5 (TypeScript)
- PostgreSQL via Prisma ORM
- Zod for request validation
- JWT auth (access + refresh tokens), bcrypt password hashing
- Vitest for unit tests

**Frontend** (`UrlShortener.Web`)
- React 19 + Vite + TypeScript
- React Router
- Tailwind CSS v4
- Axios

**Tooling**
- GitHub Actions CI (typecheck, tests, production build)
- Docker Compose for local PostgreSQL

## Features

- Shorten URLs with an auto-generated code, or pick a **custom short code** (logged-in users)
- Anonymous (guest) shortening with shorter expiry; account links last longer
- **Click tracking** and per-link **active/inactive** toggle
- Link **expiry** with friendly "expired" handling
- User accounts: register, login, profile editing, password change
- **Admin dashboard**: view stats, manage users (roles, delete), manage all URLs
- Graceful `503` responses when the database is unreachable (no leaked internals)
- Responsive UI (tables collapse to cards on mobile)

## Project Structure

```
url-shortener/
├── UrlShortener.API/     # Express + Prisma backend
│   └── src/modules/      # auth, urls, users, admin (each: routes/controller/service/repository/schemas)
├── UrlShortener.Web/     # React + Vite frontend
└── .github/workflows/    # CI pipeline
```

The backend follows a layered, per-module structure — **routes → controller → service → repository** — which keeps business logic (services) free of HTTP and database concerns and makes it easy to unit-test in isolation.

## Getting Started

### Prerequisites
- Node.js 20+
- Docker (for the local PostgreSQL database)

### 1. Backend

```bash
cd UrlShortener.API
npm install
cp .env.example .env          # then fill in the values
docker-compose up -d          # start PostgreSQL on :5432
npx prisma migrate dev        # create the schema
npm run dev                   # API on http://localhost:3000
```

Backend environment variables (`.env`):

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| `PORT`         | API port (default `3000`)                |
| `DATABASE_URL` | PostgreSQL connection string             |
| `JWT_SECRET`   | Secret used to sign JWTs                 |

### 2. Frontend

```bash
cd UrlShortener.Web
npm install
cp .env.example .env          # set VITE_API_URL (default http://localhost:3000)
npm run dev                   # app on http://localhost:5173
```

## Running Tests

```bash
cd UrlShortener.API
npm test          # run the Vitest suite once
npm run test:watch
```

The service layer is unit-tested with the database, bcrypt, and JWT mocked, so tests are fast and require no running database.

## API Overview

All routes are prefixed with the base URL (e.g. `http://localhost:3000`).

### Auth (`/auth`)
| Method | Path             | Description                  |
| ------ | ---------------- | ---------------------------- |
| POST   | `/auth/register` | Create an account            |
| POST   | `/auth/login`    | Log in, receive tokens       |
| POST   | `/auth/refresh`  | Exchange a refresh token     |
| POST   | `/auth/logout`   | Invalidate a refresh token   |

### URLs (`/urls`)
| Method | Path                  | Auth      | Description                       |
| ------ | --------------------- | --------- | --------------------------------- |
| POST   | `/urls`               | optional  | Create a short URL                |
| GET    | `/urls`               | required  | List the current user's URLs      |
| PATCH  | `/urls/:id/comment`   | required  | Update a URL's comment            |
| PATCH  | `/urls/:id/toggle`    | required  | Toggle active/inactive            |
| GET    | `/urls/:shortCode`    | —         | Resolve and redirect (counts a click) |

### Users (`/users`)
| Method | Path                 | Description            |
| ------ | -------------------- | ---------------------- |
| GET    | `/users/me`          | Get current profile    |
| PATCH  | `/users/me`          | Update profile         |
| POST   | `/users/me/password` | Change password        |

### Admin (`/admin`) — admin role required
| Method | Path                    | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | `/admin/stats`          | Dashboard statistics   |
| GET    | `/admin/users`          | List all users         |
| PATCH  | `/admin/users/:id/role` | Change a user's role   |
| DELETE | `/admin/users/:id`      | Delete a user          |
| GET    | `/admin/urls`           | List all URLs          |
| PATCH  | `/admin/urls/:id/toggle`| Toggle a URL           |
| DELETE | `/admin/urls/:id`       | Delete a URL           |

## Continuous Integration

Every push to `main` and every pull request runs two parallel jobs:
- **Backend** — install, `prisma generate`, typecheck (`tsc --noEmit`), and the Vitest suite
- **Frontend** — install and a production build (`tsc -b && vite build`)
