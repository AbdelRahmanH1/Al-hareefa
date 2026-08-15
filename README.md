# Al-Hareefa

**A backend platform connecting talented players with coaches and organizations — powering tournaments, private coaching, and automated competition management.**

Built with NestJS, Prisma, PostgreSQL, and Redis.

---

## Overview

Al-Hareefa is a sports talent platform where players can showcase their skills, connect with coaches, and compete in organized tournaments. Organizations can register, get approved, and run their own tournaments through the platform, while independent coaches can offer private training sessions. The system automates the entire competition lifecycle — from bracket generation to secure, oversell-proof ticket sales.

## Key Features

### Tournament & Organization Management
- Organizations can apply to host tournaments; a manager-approval workflow controls who is authorized to create and run events on the platform.
- Coaches have a dedicated section for offering and managing private training sessions, independent of tournament play.

### Automated Match Scheduling
- A rules-based bracket-generation engine automatically builds tournament structures — **knockout, group stage, and semi-final/final progressions** — removing the need for manual scheduling as tournaments grow or player counts change.

### Oversell-Safe Ticketing
- Ticket purchases are protected against overselling through **pre-payment availability checks** combined with **atomic database transactions**, ensuring ticket counts stay accurate even under concurrent purchase attempts.
- Reservation locks are managed in **Redis**, holding a ticket briefly while a payment is in progress so two users can't purchase the same seat simultaneously.

### Payments
- Integrated with **Paymob** to handle secure payment processing for tournament tickets and coaching bookings.

### Real-Time Notifications
- **Firebase Cloud Messaging (FCM)** delivers real-time push notifications for events such as tournament approval, match scheduling updates, and payment confirmations.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL |
| Caching / Locks | Redis |
| Payments | Paymob |
| Notifications | Firebase Cloud Messaging (FCM) |
| Language | TypeScript |

## Architecture Highlights

- **Modular NestJS structure** — features (tournaments, organizations, coaching, ticketing, payments) are isolated into independent modules for maintainability and testability.
- **Transactional integrity** — ticket purchase and tournament-slot allocation flows use database transactions to prevent race conditions under concurrent load.
- **Cache-backed reservation system** — Redis-backed short-lived locks prevent double-booking of tickets or coaching slots during the payment window.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/AbdelRahmanH1/Al-hareefa.git
cd Al-hareefa

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in database, Redis, Paymob, and Firebase credentials

# Run database migrations
npx prisma migrate dev

# Start in development mode
npm run start:dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `PAYMOB_API_KEY` | Paymob payment gateway API key |
| `FIREBASE_PROJECT_ID` | Firebase project ID for FCM |
| `JWT_SECRET` | Secret used to sign authentication tokens |

*(Adjust variable names to match your actual `.env` configuration.)*

## Roadmap Ideas

- Live match score updates via WebSockets
- Player performance analytics and stats dashboard
- Multi-language support for organizations outside Egypt

## License

MIT — feel free to explore, fork, or build on top of this project.
