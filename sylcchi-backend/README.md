# Sylcchi Palace - Backend API

A RESTful backend server for the **Sylcchi Palace** hotel management system, built with Express.js 5, TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Runtime          | Node.js + TypeScript 5.9                |
| Framework        | Express.js 5.2                          |
| Database         | PostgreSQL                              |
| ORM              | Prisma 7.5                              |
| Authentication   | Better Auth 1.5 + JWT                   |
| Payments         | Stripe, SSLCommerz                      |
| File Storage     | Cloudinary + Multer                     |
| Email            | Nodemailer (SMTP)                       |
| Validation       | Zod 4                                   |
| Deployment       | Vercel (Serverless)                     |

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- Stripe account (for payments)
- Cloudinary account (for file uploads)

### Installation

```bash
git clone https://github.com/your-username/sylcchi-backend.git
cd sylcchi-backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable                       | Description                        | Default                |
| ------------------------------ | ---------------------------------- | ---------------------- |
| `NODE_ENV`                     | Environment mode                   | `development`          |
| `PORT`                         | Server port                        | `5000`                 |
| `DATABASE_URL`                 | PostgreSQL connection string       | —                      |
| `DIRECT_URL`                   | Direct database connection         | —                      |
| `BETTER_AUTH_URL`              | Better Auth base URL               | —                      |
| `BETTER_AUTH_SECRET`           | Better Auth signing secret         | —                      |
| `FRONTEND_URL`                 | Frontend origin (CORS)             | —                      |
| `JWT_SECRET`                   | JWT signing secret                 | —                      |
| `ACCESS_TOKEN_EXPIRES_IN`      | Access token TTL                   | `15m`                  |
| `REFRESH_TOKEN_EXPIRES_IN`     | Refresh token TTL                  | `30d`                  |
| `GOOGLE_CLIENT_ID`             | Google OAuth client ID             | —                      |
| `GOOGLE_CLIENT_SECRET`         | Google OAuth client secret         | —                      |
| `SMTP_HOST`                    | SMTP server host                   | `smtp.gmail.com`       |
| `SMTP_PORT`                    | SMTP server port                   | `587`                  |
| `SMTP_SECURE`                  | Use TLS                            | `false`                |
| `SMTP_USER`                    | SMTP username                      | —                      |
| `SMTP_PASS`                    | SMTP password                      | —                      |
| `SMTP_FROM`                    | From email address                 | `no-reply@sylcchi.local` |
| `CLOUDINARY_CLOUD_NAME`        | Cloudinary cloud name              | —                      |
| `CLOUDINARY_API_KEY`           | Cloudinary API key                 | —                      |
| `CLOUDINARY_API_SECRET`        | Cloudinary API secret              | —                      |
| `STRIPE_PUBLIC_KEY`            | Stripe publishable key             | —                      |
| `STRIPE_SECRET_KEY`            | Stripe secret key                  | —                      |
| `STRIPE_CURRENCY`              | Stripe currency code               | `usd`                  |
| `STRIPE_WEBHOOK_SECRET`        | Stripe webhook signing secret      | —                      |
| `STRIPE_CHECKOUT_SUCCESS_URL`  | Stripe success redirect URL        | —                      |
| `STRIPE_CHECKOUT_CANCEL_URL`   | Stripe cancel redirect URL         | —                      |
| `SSLCOMMERZ_STORE_ID`          | SSLCommerz store ID                | —                      |
| `SSLCOMMERZ_STORE_PASSWORD`    | SSLCommerz store password          | —                      |
| `SSLCOMMERZ_API_URL`           | SSLCommerz API endpoint            | sandbox URL            |
| `BOOKING_MAX_STAY_NIGHTS`      | Maximum stay duration              | `11`                   |

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev
```

### Run Development Server

```bash
npm run dev
```

The server starts at `http://localhost:5000`.

## Project Structure

```
src/
├── app.ts                  # Express app configuration
├── server.ts               # Server entry point
├── config/                 # App configuration
│   ├── cloudinary.config.ts
│   ├── env.ts
│   ├── multer.config.ts
│   └── stripe.config.ts
├── lib/                    # Core libraries
│   ├── auth.ts             # Better Auth setup
│   └── prisma.ts           # Prisma client singleton
├── middleware/              # Express middleware
│   ├── auth.ts             # Authentication & role-based access
│   ├── globalErrorHandler.ts
│   └── notFound.ts
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   ├── booking/            # Reservations & payments
│   ├── checkin/            # Check-in / check-out
│   ├── review/             # Room reviews
│   ├── room/               # Room management
│   ├── room-image/         # Room image management
│   ├── user/               # User management
│   ├── webhook/            # Payment webhooks
│   └── wishlist/           # Wishlist
├── routes/                 # Route aggregation
│   └── index.ts
├── utils/                  # Utilities (email, etc.)
├── errorHelpers/           # Error handling
├── interfaces/             # TypeScript interfaces
└── types/                  # Type definitions
```

## API Endpoints

Base URL: `/api`

### Authentication — `/api/v1/auth`

| Method | Endpoint                       | Access   | Description                    |
| ------ | ------------------------------ | -------- | ------------------------------ |
| POST   | `/sign-up`                     | Public   | Register a new user            |
| POST   | `/sign-in`                     | Public   | Login                          |
| POST   | `/sign-out`                    | Public   | Logout                         |
| GET    | `/session`                     | Public   | Get current session            |
| POST   | `/request-verification-otp`    | Public   | Request email verification OTP |
| POST   | `/verify-otp`                  | Public   | Verify OTP                     |
| POST   | `/forgot-password`             | Public   | Initiate password reset        |
| POST   | `/reset-password`              | Public   | Complete password reset         |

### Rooms — `/api/v1/rooms`

| Method | Endpoint                              | Access         | Description               |
| ------ | ------------------------------------- | -------------- | ------------------------- |
| GET    | `/types`                              | Public         | List all room types       |
| POST   | `/types`                              | Admin          | Create a room type        |
| GET    | `/`                                   | Public         | List rooms (with filters) |
| GET    | `/:slug`                              | Public         | Get room by slug          |
| POST   | `/`                                   | Admin          | Create a room             |
| PATCH  | `/:id`                                | Admin/Manager  | Update a room             |
| DELETE | `/:id`                                | Admin          | Delete a room             |

### Room Images — `/api/v1/rooms`

| Method | Endpoint                              | Access         | Description                  |
| ------ | ------------------------------------- | -------------- | ---------------------------- |
| GET    | `/:roomId/images`                     | Public         | List room images             |
| POST   | `/:roomId/images/urls`                | Admin/Manager  | Add images via URLs          |
| POST   | `/:roomId/images/upload`              | Admin/Manager  | Upload images (max 3 files)  |
| PATCH  | `/:roomId/images/:imageId/url`        | Admin/Manager  | Update an image URL          |
| DELETE | `/:roomId/images/:imageId`            | Admin          | Delete an image              |

### Reviews — `/api/v1/rooms`

| Method | Endpoint                              | Access         | Description                |
| ------ | ------------------------------------- | -------------- | -------------------------- |
| GET    | `/:roomId/reviews`                    | Public         | Get reviews for a room     |
| GET    | `/:roomId/reviews/eligibility`        | Optional Auth  | Check review eligibility   |
| POST   | `/:roomId/reviews`                    | Authenticated  | Create or update a review  |

### Bookings — `/api/v1/bookings`

| Method | Endpoint                   | Access        | Description                   |
| ------ | -------------------------- | ------------- | ----------------------------- |
| POST   | `/create`                  | Authenticated | Create a new booking          |
| POST   | `/pay`                     | Authenticated | Process booking payment       |
| GET    | `/pay`                     | Public        | Payment callback handler      |
| GET    | `/:id`                     | Authenticated | Get booking details           |
| POST   | `/cancel`                  | Authenticated | Cancel a booking              |
| POST   | `/refund/complete`         | Admin         | Mark refund as completed      |

### Check-in — `/api/v1/checkin`

| Method | Endpoint              | Access        | Description                      |
| ------ | --------------------- | ------------- | -------------------------------- |
| POST   | `/upload-documents`   | Authenticated | Upload check-in documents        |
| POST   | `/lookup`             | Authenticated | Lookup booking for check-in      |
| POST   | `/verify-otp`         | Authenticated | Verify check-in OTP              |
| POST   | `/complete`           | Authenticated | Complete check-in                |

### Users — `/api/v1/users`

| Method | Endpoint     | Access        | Description             |
| ------ | ------------ | ------------- | ----------------------- |
| GET    | `/profile`   | Authenticated | Get own profile         |
| PATCH  | `/profile`   | Authenticated | Update own profile      |
| GET    | `/`          | Admin         | List all users          |
| GET    | `/:id`       | Admin         | Get user by ID          |
| PATCH  | `/:id`       | Admin         | Update a user           |
| DELETE | `/:id`       | Admin         | Delete a user           |

### Wishlist — `/api/v1/wishlist`

| Method | Endpoint     | Access        | Description                     |
| ------ | ------------ | ------------- | ------------------------------- |
| GET    | `/`          | Authenticated | Get user's wishlist             |
| POST   | `/`          | Authenticated | Add room to wishlist            |
| DELETE | `/:roomId`   | Authenticated | Remove room from wishlist       |

### Webhooks — `/api/webhooks`

| Method | Endpoint               | Access  | Description                  |
| ------ | ---------------------- | ------- | ---------------------------- |
| POST   | `/stripe`              | Stripe  | Stripe payment webhook       |
| POST   | `/sslcommerz/success`  | SSLCommerz | Payment success callback  |
| POST   | `/sslcommerz/fail`     | SSLCommerz | Payment failure callback  |
| POST   | `/sslcommerz/cancel`   | SSLCommerz | Payment cancel callback   |
| POST   | `/sslcommerz/ipn`      | SSLCommerz | IPN notification          |

### Better Auth — `/api/auth/*`

All requests to `/api/auth/*` are handled internally by the Better Auth library (OAuth flows, email verification, session management).

### Health Check

| Method | Endpoint | Description     |
| ------ | -------- | --------------- |
| GET    | `/`      | Welcome message |

## Database Models

| Model                 | Description                                    |
| --------------------- | ---------------------------------------------- |
| `User`                | User accounts (roles: CUSTOMER, MANAGER, ADMIN)|
| `Session`             | Active user sessions                           |
| `Account`             | OAuth provider accounts                        |
| `Verification`        | Email verification tokens                      |
| `Room`                | Room listings with pricing and facilities      |
| `RoomType`            | Room categories                                |
| `RoomImage`           | Room gallery images                            |
| `Reservation`         | Bookings with pricing and payment status       |
| `ReservationDocument` | Supporting documents for bookings              |
| `Payment`             | Payment transaction records                    |
| `Checkin`             | Check-in / check-out tracking                  |
| `CheckinOtp`          | OTP codes for check-in verification            |
| `Review`              | Room reviews with multi-category ratings       |
| `Wishlist`            | User's saved favorite rooms                    |

## Authentication & Authorization

- **Better Auth** handles sign-up, sign-in, OAuth (Google), and session management
- **JWT** tokens for API authentication
- **Role-based access control** with three roles:
  - `CUSTOMER` — Default role for registered users
  - `MANAGER` — Can manage rooms and images
  - `ADMIN` — Full access to all resources

## Payment Integration

### Stripe
- Checkout session-based payments
- Webhook verification for payment confirmation
- Supports deposit and full payment types

### SSLCommerz
- Bangladesh local payment gateway
- IPN (Instant Payment Notification) support
- Success/fail/cancel callback handling

## Background Jobs

- **Reservation Scheduler** — Automatically expires unconfirmed bookings every 60 seconds

## Available Scripts

```bash
npm run dev                # Start development server with hot reload
npm run build              # Generate Prisma client
npm run prisma:validate    # Validate Prisma schema
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate:dev # Run database migrations
npm run stripe:webhook     # Forward Stripe webhooks to localhost
```

## Author

**AB Nahid**

## License

ISC
