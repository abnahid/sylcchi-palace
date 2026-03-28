# Sylcchi Palace Backend API

Express + TypeScript backend for Sylcchi Palace hotel booking and operations.

## Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Runtime       | Node.js + TypeScript         |
| API Framework | Express 5                    |
| Database      | PostgreSQL                   |
| ORM           | Prisma 7                     |
| Auth          | Better Auth + JWT            |
| Payments      | Stripe, SSLCommerz           |
| Uploads       | Multer + Cloudinary          |
| Email         | Nodemailer (SMTP)            |
| Validation    | Zod                          |
| Deployment    | Vercel serverless-compatible |

## Quick Start

### Prerequisites

- Node.js >= 20
- PostgreSQL instance
- Optional: Stripe, SSLCommerz, and Cloudinary credentials

### Installation

```bash
npm install
cp .env.example .env.local
```

Set at least:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `FRONTEND_URL`

### Database

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

### Run

```bash
npm run dev
```

Default local URL: `http://localhost:5000`

## API Routing

### Base Paths

- Main API: `/api/v1`
- Better Auth passthrough: `/api/auth/*`
- Payment webhooks: `/api/webhooks/*`

### Auth (`/api/v1/auth`)

- `POST /sign-up`
- `POST /sign-in`
- `POST /sign-out`
- `GET /session`
- `POST /request-verification-otp`
- `POST /verify-otp`
- `POST /forgot-password`
- `POST /reset-password`

### Rooms (`/api/v1/rooms`)

- `GET /types`
- `POST /types` (admin)
- `GET /`
- `GET /:slug`
- `POST /` (admin)
- `PATCH /:id` (admin/manager)
- `DELETE /:id` (admin)

### Room Images (`/api/v1/rooms`)

- `GET /:roomId/images`
- `POST /:roomId/images/urls` (admin/manager)
- `POST /:roomId/images/upload` (admin/manager)
- `PATCH /:roomId/images/:imageId/url` (admin/manager)
- `DELETE /:roomId/images/:imageId` (admin)

### Reviews (`/api/v1/rooms`)

- `GET /:roomId/reviews`
- `GET /:roomId/reviews/eligibility`
- `POST /:roomId/reviews` (authenticated)

### Bookings (`/api/v1/bookings`)

- `POST /create`
- `POST /pay`
- `GET /pay`
- `GET /:id`
- `POST /cancel`
- `POST /refund/complete` (admin)

### Check-in (`/api/v1/checkin`)

- `POST /upload-documents`
- `POST /lookup`
- `POST /verify-otp`
- `POST /complete`

### Users (`/api/v1/users`)

- `GET /profile`
- `PATCH /profile`
- `GET /` (admin)
- `GET /:id` (admin)
- `PATCH /:id` (admin)
- `DELETE /:id` (admin)

### Wishlist (`/api/v1/wishlist`)

- `GET /`
- `POST /`
- `DELETE /:roomId`

### Webhooks (`/api/webhooks`)

- `POST /stripe`
- `POST /sslcommerz/success`
- `POST /sslcommerz/fail`
- `POST /sslcommerz/cancel`
- `POST /sslcommerz/ipn`

## Core Domain Models

- `User`, `Session`, `Account`, `Verification`
- `RoomType`, `Room`, `RoomImage`
- `Reservation`, `ReservationDocument`, `Payment`, `Checkin`, `CheckinOtp`
- `Review`, `Wishlist`

Roles used in authorization:

- `CUSTOMER`
- `MANAGER`
- `ADMIN`

## Scripts

```bash
npm run dev
npm run build
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev
npm run stripe:webhook
```

## License

MIT (see repository root `LICENSE`)
