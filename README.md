<div align="center">

# 🏰 Sylcchi Palace

**Modern full-stack hotel booking and hospitality management platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

[Overview](#overview) • [Features](#features) • [Tech Stack](#tech-stack) • [Setup](#getting-started) • [Environment](#environment-variables) • [Security](#security)

</div>

---

## Overview

Sylcchi Palace is a production-oriented monorepo for a hotel and reservation platform.
It includes:

- `sylcchi-client`: Next.js frontend for guests, customers, and admins
- `sylcchi-backend`: Express + Prisma API for auth, rooms, bookings, payments, check-in, and more

The platform supports role-based permissions (`CUSTOMER`, `MANAGER`, `ADMIN`), integrated payment flows (Stripe and SSLCommerz), and a reservation lifecycle with OTP-assisted check-in.

---

## Features

### Guest and Customer Experience

- Browse room listings and room details
- Save favorite rooms to wishlist
- Create bookings and complete payments
- View booking details and cancel pending bookings
- Submit and update room reviews

### Operations and Management

- Manage room types and room inventory
- Upload and manage room images
- Track booking/payment/check-in lifecycle
- Complete refunds through protected admin endpoints

### Authentication and Security

- Better Auth integration for session-based flows
- JWT-based API authorization for protected resources
- Role-based access control in backend middleware
- Webhook endpoints for trusted payment confirmations

---

## Tech Stack

### Frontend (`sylcchi-client`)

| Layer       | Technology                |
| ----------- | ------------------------- |
| Framework   | Next.js 16 (App Router)   |
| UI Library  | React 19                  |
| Language    | TypeScript 5              |
| Styling     | Tailwind CSS 4            |
| State/Query | TanStack Query            |
| Forms       | React Hook Form + Zod     |
| Icons       | Lucide React, React Icons |

### Backend (`sylcchi-backend`)

| Layer        | Technology               |
| ------------ | ------------------------ |
| Runtime      | Node.js + TypeScript 5   |
| Framework    | Express 5                |
| ORM          | Prisma 7 + PostgreSQL 15 |
| Database     | PostgreSQL               |
| Auth         | Better Auth 1.5 + JWT    |
| Payments     | Stripe + SSLCommerz      |
| File Storage | Cloudinary + Multer      |
| Email        | Nodemailer (SMTP)        |
| Validation   | Zod 4                    |
| Deployment   | Vercel serverless        |

### Key Features by Role

| Role       | Permissions                                  |
| ---------- | -------------------------------------------- |
| `CUSTOMER` | Browse rooms, book, pay, review, wishlist    |
| `MANAGER`  | Manage rooms, images, track bookings         |
| `ADMIN`    | Full access: users, rooms, payments, refunds |

---

## Project Structure

```text
Sylcchi Palace/
|-- sylcchi-client/        # Frontend (Next.js)
|-- sylcchi-backend/       # Backend API (Express + Prisma)
|-- CODE_OF_CONDUCT.md
|-- CONTRIBUTING.md
|-- SECURITY.md
`-- LICENSE
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20 ([download](https://nodejs.org/))
- **npm** >= 10 (included with Node.js)
- **PostgreSQL** >= 15 ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/))

**Optional service accounts** (for full feature set):

- Stripe account ([sign up](https://dashboard.stripe.com/register))
- SSLCommerz account ([sign up](https://www.sslcommerz.com/))
- Cloudinary account ([sign up](https://cloudinary.com/))
- Gmail account with app password (for SMTP)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd "Sylcchi Palace"

# Install backend dependencies
cd sylcchi-backend
npm install

# Install frontend dependencies (in another terminal)
cd ../sylcchi-client
npm install
```

### 2. Backend Setup

```bash
cd sylcchi-backend
cp .env.example .env.local
```

Update `.env.local` with:

- `DATABASE_URL` - Your PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Random 32+ character string
- `BETTER_AUTH_URL` - `http://localhost:5000`
- `FRONTEND_URL` - `http://localhost:3000`

Then run:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

✅ API ready at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../sylcchi-client
cp .env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Run:

```bash
npm run dev
```

✅ Frontend ready at `http://localhost:3000`

---

## Environment Variables

### Backend (`sylcchi-backend/.env.local`)

| Variable                            | Required | Default                          | Description                                              |
| ----------------------------------- | -------- | -------------------------------- | -------------------------------------------------------- |
| `NODE_ENV`                          | No       | `development`                    | Environment mode (`development`, `test`, `production`)   |
| `PORT`                              | No       | `5000`                           | API server port                                          |
| **Database**                        |
| `DATABASE_URL`                      | ✅       | —                                | PostgreSQL connection string with schema                 |
| `DIRECT_URL`                        | No       | `DATABASE_URL`                   | Direct DB connection for migrations                      |
| **Authentication**                  |
| `BETTER_AUTH_URL`                   | ✅       | —                                | Better Auth base URL (e.g., `http://localhost:5000`)     |
| `BETTER_AUTH_SECRET`                | ✅       | —                                | Better Auth signing secret (min 32 chars)                |
| `FRONTEND_URL`                      | ✅       | —                                | Frontend origin for CORS (e.g., `http://localhost:3000`) |
| `JWT_SECRET`                        | No       | `dev-secret-change-me`           | JWT signing secret for token generation                  |
| `ACCESS_TOKEN_EXPIRES_IN`           | No       | `15m`                            | Access token TTL                                         |
| `REFRESH_TOKEN_EXPIRES_IN`          | No       | `30d`                            | Refresh token TTL                                        |
| **OAuth (Optional)**                |
| `GOOGLE_CLIENT_ID`                  | No       | —                                | Google OAuth client ID                                   |
| `GOOGLE_CLIENT_SECRET`              | No       | —                                | Google OAuth client secret                               |
| **Email/SMTP**                      |
| `SMTP_HOST`                         | No       | `smtp.gmail.com`                 | SMTP server hostname                                     |
| `SMTP_PORT`                         | No       | `587`                            | SMTP server port                                         |
| `SMTP_SECURE`                       | No       | `false`                          | Use TLS for SMTP                                         |
| `SMTP_USER`                         | No       | —                                | SMTP username (Gmail app password)                       |
| `SMTP_PASS`                         | No       | —                                | SMTP password (Gmail app password)                       |
| `SMTP_FROM`                         | No       | `no-reply@sylcchi.local`         | Email "from" address                                     |
| **File Upload**                     |
| `CLOUDINARY_CLOUD_NAME`             | No       | —                                | Cloudinary cloud name                                    |
| `CLOUDINARY_API_KEY`                | No       | —                                | Cloudinary API key                                       |
| `CLOUDINARY_API_SECRET`             | No       | —                                | Cloudinary API secret                                    |
| **Stripe Payments**                 |
| `STRIPE_PUBLIC_KEY`                 | No       | —                                | Stripe publishable key (pk*test*...)                     |
| `STRIPE_SECRET_KEY`                 | No       | —                                | Stripe secret key (sk*test*...)                          |
| `STRIPE_CURRENCY`                   | No       | `usd`                            | Default payment currency                                 |
| `STRIPE_WEBHOOK_SECRET`             | No       | —                                | Stripe webhook signing secret (whsec\_...)               |
| `STRIPE_CHECKOUT_SUCCESS_URL`       | No       | —                                | Post-checkout success redirect URL                       |
| `STRIPE_CHECKOUT_CANCEL_URL`        | No       | —                                | Post-checkout cancel redirect URL                        |
| **SSLCommerz (Bangladesh Gateway)** |
| `SSLCOMMERZ_STORE_ID`               | No       | —                                | SSLCommerz store ID                                      |
| `SSLCOMMERZ_STORE_PASSWORD`         | No       | —                                | SSLCommerz store password                                |
| `SSLCOMMERZ_API_URL`                | No       | `https://sandbox.sslcommerz.com` | SSLCommerz API endpoint                                  |
| **Booking Rules**                   |
| `BOOKING_MAX_STAY_NIGHTS`           | No       | `11`                             | Maximum stay duration in nights                          |

### Frontend (`sylcchi-client/.env.local`)

| Variable              | Required | Default | Description                                                 |
| --------------------- | -------- | ------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | ✅       | —       | Backend API base URL (e.g., `http://localhost:5000/api/v1`) |

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

Main route groups:

- `/auth` - registration, login, session, OTP verification, password reset
- `/rooms` - room types, room catalog, room images, room reviews
- `/bookings` - create booking, pay, fetch booking, cancel, complete refund
- `/checkin` - upload documents, booking lookup, OTP verification, complete check-in
- `/users` - profile and admin user management
- `/wishlist` - customer wishlist operations

Webhook base: `http://localhost:5000/api/webhooks`

- `/stripe`
- `/sslcommerz/success`
- `/sslcommerz/fail`
- `/sslcommerz/cancel`
- `/sslcommerz/ipn`

---

## Scripts

### Backend (`sylcchi-backend`)

- `npm run dev` - start API in watch mode
- `npm run build` - generate Prisma client
- `npm run prisma:validate` - validate Prisma schema
- `npm run prisma:generate` - regenerate Prisma client
- `npm run prisma:migrate:dev` - run/create development migrations
- `npm run stripe:webhook` - forward Stripe events locally

### Frontend (`sylcchi-client`)

- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - run ESLint

---

## Security

If you discover a security issue, please do not open a public issue.
Report vulnerabilities through the process in [SECURITY.md](./SECURITY.md).

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting pull requests.

---

## Quick Links

| Resource                   | Link                                                     |
| -------------------------- | -------------------------------------------------------- |
| 📋 Contributing Guidelines | [CONTRIBUTING.md](./CONTRIBUTING.md)                     |
| 🔒 Security Policy         | [SECURITY.md](./SECURITY.md)                             |
| 📜 Code of Conduct         | [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)               |
| 📄 License                 | [LICENSE](./LICENSE)                                     |
| 🎯 Backend Documentation   | [sylcchi-backend/README.md](./sylcchi-backend/README.md) |
| 🎨 Frontend Documentation  | [sylcchi-client/README.md](./sylcchi-client/README.md)   |

---

## License

This repository is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

Copyright © 2025-2026 Abdul Jabbar Al Nahid ([abnahid](https://github.com/abnahid))

---

<div align="center">

Made with ❤️ for seamless hotel booking experiences

⭐ If you find this project helpful, please give it a star!

</div>
