# Sylcchi Palace Client

Frontend application for Sylcchi Palace, built with Next.js App Router.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- React Hook Form + Zod

## Local Setup

```bash
npm install
cp .env.example .env.local
```

Set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Key Routes

- `/`
- `/about`
- `/rooms`
- `/gallery`
- `/news`
- `/news/[slug]`
- `/contact`

## Backend Integration

The client expects backend API under `NEXT_PUBLIC_API_URL`.

Examples:

- Rooms API calls use `/rooms`
- Booking flows use `/bookings`
- Auth flows use `/auth`

For social auth redirects, client logic derives the backend origin from `NEXT_PUBLIC_API_URL`.

## Content/Data Sources

Static content and fallback UI data live in:

- `src/data/rooms.ts`
- `src/data/news.ts`

Update those files when adjusting hotel room/news mock content.

## Quality Checks

```bash
npm run lint
npm run build
```
