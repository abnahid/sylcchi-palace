# Sylcchi Palace Client

Frontend web client for Sylcchi Palace, built with Next.js App Router.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Important Routes

- `/` Home page
- `/about` About page
- `/rooms` Rooms listing
- `/gallery` Gallery page
- `/news` News listing
- `/news/[slug]` Single news detail
- `/contact` Contact page

Note: The correct contact route is `/contact` (not `/contacts`).

## Data Sources (Editable)

Main fake/mock data is centralized so UI sections stay synced.

- `src/data/rooms.ts`
  - Home room cards
  - Gallery room images
- `src/data/news.ts`
  - News list cards
  - Sidebar recommended posts/tags/categories
  - News detail pages by slug

If you need to update text/images for rooms or news, edit these files first.

## Maps

Google Maps embed is used in:

- `src/components/home/ContactSection.tsx`
- `src/components/contact/ContactClient.tsx`

Both use the same responsive iframe embed URL for consistency.

## Branding Notes

This project is customized for **Sylcchi Palace**.

- Navigation and content use Sylcchi Palace naming.
- Contact and accommodation sections contain hotel-specific copy.
- Logo image uses eager loading in navbar for better LCP behavior.

## Checks

```bash
npm run lint
```

Run lint after content or component updates.
