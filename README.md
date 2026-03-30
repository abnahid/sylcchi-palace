<div align="center">

![Sylcchi Palace Logo](./sylcchi-client/public/assets/images/sylcchi-palace.png)

# Sylcchi Palace

**A production-grade, full-stack hotel booking and hospitality management platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

[Live Demo](#live-urls) &bull; [Features](#key-features) &bull; [Tech Stack](#tech-stack) &bull; [Architecture](#architecture) &bull; [Setup](#getting-started) &bull; [API](#api-overview)

</div>

---

## Overview

Sylcchi Palace is a monorepo hotel reservation and hospitality management system built with **Next.js 16**, **Express 5**, **Prisma 7**, and **PostgreSQL**. It delivers an end-to-end guest experience from room browsing and online booking through secure payment processing, OTP-verified check-in, and multi-dimensional reviews - all managed through a role-based admin dashboard.

| Module | Description |
|--------|-------------|
| `sylcchi-client` | Next.js App Router frontend for guests, customers, managers, and admins |
| `sylcchi-backend` | Express + Prisma REST API handling auth, rooms, bookings, payments, check-in, reviews, and analytics |

> **Note:** This project is under active development. The features listed below reflect the current implementation - some modules may serve partial functionality as work continues toward full production coverage.

---

## Live URLs

| Environment | URL |
|-------------|-----|
| Frontend | [https://sylcchipalace.com](https://sylcchipalace.com) |
| API Base | `https://sylcchipalace.com/api/v1` |
| Repository | [github.com/abnahid/sylcchi-palace](https://github.com/abnahid/sylcchi-palace) |

---

## Key Features

### Room Browsing & Discovery

- Browse curated room listings with category filters and room type navigation
- Detailed room pages with image galleries, facility lists, house rules, and pricing breakdowns
- Real-time availability calendar showing booked dates per room
- Save rooms to a personal wishlist for later booking

### Booking Flow

The booking pipeline manages the full reservation lifecycle:

```
Browse Rooms --> Select Dates & Guests --> Create Reservation (PENDING)
     --> Choose Payment Method --> Complete Payment --> Reservation CONFIRMED
          --> Receive Booking Code via Email
```

- **Date selection** with blocked-date validation against existing reservations
- **Dynamic pricing** calculates base price, number of nights, VAT, deposit rate, and total
- **Multiple payment options**: Stripe (international), SSLCommerz (Bangladesh), or Pay Later
- **Booking codes** generated for each reservation, used for check-in lookup and guest reference
- **Cancellation** available for pending bookings before payment completion
- **Expiration handling** for unpaid reservations

### Payment Processing

Dual payment gateway integration with webhook-driven confirmation:

- **Stripe**: Checkout session creation, client-side redirect, webhook verification with signature validation
- **SSLCommerz**: Session initiation, gateway redirect, IPN (Instant Payment Notification) callback handling
- **Payment types**: Full payment or deposit-based partial payment
- **Status tracking**: `PENDING` &rarr; `PARTIAL` &rarr; `PAID` with transaction ID logging
- **Refund management**: Admin-only refund processing with status audit trail

### Check-In / Check-Out Flow

Secure, document-verified check-in process:

```
Lookup Booking (by code) --> Upload ID Documents --> Receive OTP via Email
     --> Verify OTP --> Complete Check-In --> Status: CHECKED_IN
          --> Manager/Admin Processes Check-Out --> Status: CHECKED_OUT
```

- **Document upload** (ID card, passport) stored via Cloudinary
- **OTP verification** with expiration timer and attempt limits
- **Check-in status tracking**: `PENDING` &rarr; `CHECKED_IN` &rarr; `CHECKED_OUT`
- **Manager/Admin checkout** with timestamp recording

### Review System

Multi-dimensional guest review flow:

```
Complete a Stay --> Eligibility Check (must have a completed booking)
     --> Submit Ratings (Location, Comfort, Service, Pricing) + Comment
          --> Review Published (one review per user per room, updatable)
```

- **Eligibility enforcement**: Only guests with completed stays can leave reviews
- **Four rating dimensions**: Location, Comfort, Service, and Pricing (each scored independently)
- **Overall rating** calculated from dimensional scores
- **Upsert logic**: Guests can update their existing review at any time
- **Public visibility**: All reviews displayed on room detail pages

### Authentication & Authorization

- **Better Auth** session management with secure HTTP-only cookies
- **JWT-based API tokens** with 15-minute access / 30-day refresh lifecycle
- **Google OAuth** social login integration
- **Email OTP verification** for account activation
- **Forgot/reset password** flow via email
- **Role-based access control**:

| Role | Access Scope |
|------|-------------|
| `CUSTOMER` | Browse rooms, book, pay, review, manage wishlist and profile |
| `MANAGER` | Room & image management, booking tracking, check-in/check-out operations |
| `ADMIN` | Full system access including user management, payments, refunds, and analytics |

### Admin Dashboard & Analytics

- **Statistics overview**: Total bookings, revenue, occupancy metrics
- **User management**: View, edit roles, delete accounts
- **Room management**: Create/edit rooms and room types, upload images
- **Booking tracker**: Monitor all reservations across statuses
- **Payment monitoring**: Transaction history, refund processing
- **Check-in management**: Track guest check-in/check-out status

---

## Tech Stack

### Frontend (`sylcchi-client`)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Server/client rendering, routing, SSR |
| UI Library | React 19 | Component architecture |
| Language | TypeScript 5.9 | Type safety |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Data Fetching | TanStack Query 5 | Server state, caching, mutations |
| Forms | React Hook Form + Zod 4 | Form state management and validation |
| UI Components | Radix UI / shadcn | Accessible, composable primitives |
| Charts | Recharts 3 | Dashboard analytics visualizations |
| Date Picker | React Day Picker 9 | Calendar date selection |
| Icons | Lucide React, React Icons | Icon sets |
| HTTP | Axios | API client |

### Backend (`sylcchi-backend`)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js + TypeScript 5.9 | Server runtime |
| Framework | Express 5 | HTTP routing and middleware |
| ORM | Prisma 7 | Database access and migrations |
| Database | PostgreSQL 15+ (Supabase) | Relational data storage |
| Auth | Better Auth 1.5 + JWT | Session and token management |
| Payments | Stripe + SSLCommerz | International + local payment gateways |
| File Storage | Cloudinary + Multer | Image upload and CDN delivery |
| Email | Nodemailer (SMTP) | Transactional emails and OTP delivery |
| Validation | Zod 4 | Request schema validation |
| Deployment | Vercel Serverless | Production hosting |

---

## Architecture

### Project Structure

```
Sylcchi Palace/
|-- sylcchi-client/                 # Next.js Frontend
|   |-- src/
|   |   |-- app/                    # App Router pages & layouts
|   |   |   |-- (auth)/             # Login, register, OTP, password reset
|   |   |   |-- (main)/             # Public pages (rooms, booking, gallery)
|   |   |   |-- dashboard/          # Authenticated dashboard views
|   |   |   |-- payment/            # Payment success/fail/cancel pages
|   |   |   +-- checkin/            # Guest check-in flow
|   |   |-- components/             # Reusable UI components
|   |   |-- hooks/                  # Custom React hooks (useBooking, useRooms, etc.)
|   |   +-- lib/
|   |       |-- api/                # Typed API client functions
|   |       +-- types/              # Shared TypeScript interfaces
|   +-- public/                     # Static assets
|
|-- sylcchi-backend/                # Express API
|   |-- src/
|   |   |-- modules/                # Feature modules (domain-driven)
|   |   |   |-- auth/               # Registration, login, session, OTP
|   |   |   |-- booking/            # Reservation CRUD and lifecycle
|   |   |   |-- payment/            # Stripe & SSLCommerz processing
|   |   |   |-- checkin/            # Document upload, OTP, check-in/out
|   |   |   |-- rooms/              # Room catalog and management
|   |   |   |-- roomImage/          # Image upload and CDN management
|   |   |   |-- review/             # Guest review system
|   |   |   |-- wishlist/           # Wishlist operations
|   |   |   |-- user/               # Profile and admin user management
|   |   |   +-- statistic/          # Dashboard analytics
|   |   |-- middleware/              # Auth guards, error handling
|   |   |-- config/                 # Environment and service configuration
|   |   |-- lib/                    # Core libraries (auth, prisma client)
|   |   +-- utils/                  # Email helpers, shared utilities
|   +-- prisma/
|       |-- schema.prisma           # Data model definitions
|       +-- migrations/             # Database migration history
|
|-- CODE_OF_CONDUCT.md
|-- CONTRIBUTING.md
|-- SECURITY.md
+-- LICENSE
```

### Data Model Overview

```
User ─────┬──── Session
          |──── Account (OAuth)
          |──── Reservation ──┬── Payment
          |                   |── ReservationDocument
          |                   |── CheckinOtp
          |                   +── Checkin
          |──── Review
          +──── Wishlist

Room ─────┬──── RoomImage
          |──── Reservation
          |──── Review
          +──── Wishlist

RoomType ──── Room
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20 ([download](https://nodejs.org/))
- **npm** >= 10 (included with Node.js)
- **PostgreSQL** >= 15 ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/))

**Optional service accounts** (for full feature set):

- [Stripe](https://dashboard.stripe.com/register) - International payments
- [SSLCommerz](https://www.sslcommerz.com/) - Bangladesh payment gateway
- [Cloudinary](https://cloudinary.com/) - Image upload and CDN
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) - SMTP email delivery

### 1. Clone and Install

```bash
git clone https://github.com/abnahid/sylcchi-palace.git
cd "Sylcchi Palace"

# Install backend dependencies
cd sylcchi-backend
npm install

# Install frontend dependencies
cd ../sylcchi-client
npm install
```

### 2. Backend Configuration

```bash
cd sylcchi-backend
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/sylcchi_db?schema=public
BETTER_AUTH_SECRET=your-random-32-character-secret-here
BETTER_AUTH_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Optional (enable specific features)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SSLCOMMERZ_STORE_ID=your_store_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
GOOGLE_CLIENT_ID=your_google_client_id
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Run the backend:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Frontend Configuration

```bash
cd ../sylcchi-client
cp .env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Run the frontend:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Stripe Webhooks (Local Development)

To test Stripe payment webhooks locally:

```bash
cd sylcchi-backend
npm run stripe:webhook
```

This forwards Stripe events to your local API endpoint.

---

## Environment Variables

### Backend (`sylcchi-backend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| **Database** ||||
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `DIRECT_URL` | No | `DATABASE_URL` | Direct DB connection (for migrations) |
| **Authentication** ||||
| `BETTER_AUTH_URL` | Yes | - | Better Auth base URL |
| `BETTER_AUTH_SECRET` | Yes | - | Signing secret (min 32 chars) |
| `FRONTEND_URL` | Yes | - | Frontend origin for CORS |
| `JWT_SECRET` | No | `dev-secret-change-me` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRES_IN` | No | `15m` | Access token TTL |
| `REFRESH_TOKEN_EXPIRES_IN` | No | `30d` | Refresh token TTL |
| **OAuth** ||||
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| **Email / SMTP** ||||
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | - | SMTP username |
| `SMTP_PASS` | No | - | SMTP password (app password) |
| `SMTP_FROM` | No | `no-reply@sylcchi.local` | Sender email address |
| **File Upload** ||||
| `CLOUDINARY_CLOUD_NAME` | No | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | - | Cloudinary API secret |
| **Stripe** ||||
| `STRIPE_PUBLIC_KEY` | No | - | Stripe publishable key |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Webhook signing secret |
| `STRIPE_CURRENCY` | No | `usd` | Default currency |
| **SSLCommerz** ||||
| `SSLCOMMERZ_STORE_ID` | No | - | SSLCommerz store ID |
| `SSLCOMMERZ_STORE_PASSWORD` | No | - | SSLCommerz store password |
| `SSLCOMMERZ_API_URL` | No | Sandbox URL | SSLCommerz API endpoint |
| **Booking** ||||
| `BOOKING_MAX_STAY_NIGHTS` | No | `11` | Maximum stay duration |

### Frontend (`sylcchi-client/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API base URL |

---

## API Overview

**Base URL:** `http://localhost:5000/api/v1`

| Route Group | Endpoints | Description |
|-------------|-----------|-------------|
| `/auth` | `sign-up`, `sign-in`, `sign-out`, `session`, `verify-otp`, `forgot-password`, `reset-password` | Authentication and account management |
| `/rooms` | CRUD, `/types`, `/:roomId/images`, `/:roomId/reviews`, `/:roomId/booked-dates` | Room catalog, images, reviews, availability |
| `/bookings` | `create`, `pay`, `verify-payment`, `cancel`, `refund/complete`, `/my`, `/all` | Reservation lifecycle and payment |
| `/checkin` | `lookup`, `upload-documents`, `verify-otp`, `complete`, `checkout`, `status` | Guest check-in/check-out process |
| `/users` | `profile`, CRUD (admin) | User profile and admin management |
| `/wishlist` | GET, POST, DELETE | Wishlist operations |
| `/statistics` | Dashboard stats | Analytics and revenue metrics |

**Webhooks:** `http://localhost:5000/api/webhooks`

| Endpoint | Provider |
|----------|----------|
| `/stripe` | Stripe checkout events |
| `/sslcommerz/success` | SSLCommerz success callback |
| `/sslcommerz/fail` | SSLCommerz failure callback |
| `/sslcommerz/cancel` | SSLCommerz cancellation |
| `/sslcommerz/ipn` | SSLCommerz IPN notification |

---

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API server in watch mode |
| `npm run build` | Generate Prisma client |
| `npm run prisma:validate` | Validate Prisma schema |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate:dev` | Run database migrations |
| `npm run stripe:webhook` | Forward Stripe events locally |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint checks |

---

## Security

If you discover a security vulnerability, please do **not** open a public issue. Report it responsibly through the process described in [SECURITY.md](./SECURITY.md).

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting pull requests.

---

## Quick Links

| Resource | Link |
|----------|------|
| Contributing Guidelines | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Security Policy | [SECURITY.md](./SECURITY.md) |
| Code of Conduct | [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) |
| License | [LICENSE](./LICENSE) |
| Backend Docs | [sylcchi-backend/README.md](./sylcchi-backend/README.md) |
| Frontend Docs | [sylcchi-client/README.md](./sylcchi-client/README.md) |

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

Copyright &copy; 2025-2026 Abdul Jabbar Al Nahid ([@abnahid](https://github.com/abnahid))

---

<div align="center">

**Built for seamless hotel booking experiences**

Star this repo if you find it useful!

</div>
