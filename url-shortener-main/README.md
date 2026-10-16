# Secure URL Shortener

A full-stack URL shortening application that converts long URLs into short links and provides link management and click tracking.

## Features

- Short URL generation and custom short codes
- User registration and login
- Link expiry and active/inactive controls
- Click tracking
- User profile management
- Admin dashboard for managing users and URLs
- Responsive web interface

*Verify these features by running the application before presenting them as working.*

## Technology Stack

**Frontend**
- React, TypeScript, Vite
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js, Express
- PostgreSQL and Prisma ORM
- JWT authentication
- Zod request validation

**Testing and Tools**
- Vitest
- Docker Compose
- GitHub Actions

## Project Structure

- `UrlShortener.Web/` — Frontend application
- `UrlShortener.API/` — Backend API
- `.github/workflows/` — Continuous integration workflow

## Running the Project

### Prerequisites
- Node.js 20 or later
- Docker for the local PostgreSQL database

### Backend

```bash
cd UrlShortener.API
npm install
cp .env.example .env
docker-compose up -d
npx prisma migrate dev
npm run dev
```

Configure the required environment variables in `.env` before starting the application.

### Frontend

Open another terminal:

```bash
cd UrlShortener.Web
npm install
cp .env.example .env
npm run dev
```

Configure `VITE_API_URL` to point to the backend API.

## Running Tests

```bash
cd UrlShortener.API
npm test
```

## Original Project and Attribution

This project is based on the original repository:

https://github.com/ernesrama/url-shortener

The original source and applicable licence terms are acknowledged. Any additional changes should be documented after implementation and testing.

## My Contributions

Document your own verified improvements here as you implement them.

## License

Refer to the included `LICENSE` file for the applicable licence terms.
