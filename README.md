# FlowCRM MVP

FlowCRM is a mobile-first lightweight CRM prototype for solo and tiny B2C service businesses such as salons, cleaners, mobile technicians, and home-service providers. It replaces scattered spreadsheets and messaging threads with one simple workflow for capturing leads, booking work, tracking payments, sending follow-ups, and reviewing business activity.

The assignment idea selected is **Lightweight CRM for Small Businesses**.

## What Is Implemented

### Product Experience

- Mobile-first dashboard for daily operations.
- Lead capture modal from the home page with success toast feedback.
- Pipeline board and table views for lead stages: `New`, `Contacted`, `Booked`, `Served`, `Follow-up`, `Won`, and `Lost`.
- Customer directory with searchable customer records and interaction history.
- Bookings page that reflects booked leads and supports status filtering.
- Follow-ups page with prioritized tasks, deterministic WhatsApp/SMS-style message suggestions, copy support, and send-message flow.
- Payments page with paid, unpaid, and partial payment tracking.
- Payment confirmation warning before marking a record fully paid.
- Pagination across list and table-heavy screens.
- Responsive bottom navigation optimized for phone-sized usage.

### Authentication And Business Accounts

- Login screen with seeded demo credentials.
- Token-based API authentication.
- Password hashing for seeded users.
- Multi-business account support.
- Business switcher in the frontend shell.
- Create-new-business action from the app header.
- Backend data is scoped by selected business using `X-Business-Id`.

### Audit Tracking

- Model-wise audit logs for user activity.
- Audit records track actor, business, model, action, record id, description, changes, and timestamp.
- Audits are generated for create/update activity across core CRM models.
- Dedicated Audit page with model filter and pagination.

### Backend

- NestJS REST API.
- Prisma ORM with SQLite for local persistence.
- DTO validation using `class-validator`.
- CORS support for the Vite frontend.
- Seed script with realistic demo data.
- Business-scoped services for dashboard, customers, leads, appointments, payments, follow-ups, and audits.

### Frontend

- React + TypeScript + Vite.
- React Router page navigation.
- Lightweight fetch-based API client.
- Mobile-first operational UI with compact panels, badges, filters, cards, tables, and pagination.

## Project Structure

```text
backend/   NestJS REST API, Prisma schema, migrations, seed data, tests
frontend/  React/Vite frontend application
```

## Demo Login

```text
Email: owner@flowcrm.test
Password: password123
```

The seeded account includes a demo business called `Glow Studio`.

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

The backend runs on:

```text
http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

### Backend

```text
DATABASE_URL="file:./dev.db"
PORT=4000
FRONTEND_ORIGIN="http://localhost:5173"
```

### Frontend

```text
VITE_API_URL=http://localhost:4000
```

## Demo Flow

1. Log in with the demo account.
2. Review the dashboard widgets for all leads, today’s activity, follow-ups, and receivables.
3. Click `Add lead` from the dashboard and capture a new lead.
4. Open Pipeline and switch between cards view and table view.
5. Move a lead through the workflow from `New` to `Booked`.
6. Confirm the booked lead appears in Bookings and test the booking filters.
7. Open Payments, record a partial payment, then mark the payment fully paid after confirming the warning.
8. Open Follow-ups, generate a suggested message, copy it, and use the send-message action.
9. Open Audit to see model-wise activity created by the authenticated user.
10. Create or switch businesses to demonstrate isolated multi-business data.

## API Highlights

Authentication:

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/businesses`

Dashboard and CRM:

- `GET /dashboard/summary`
- `GET /customers`
- `POST /customers`
- `PATCH /customers/:id`
- `GET /leads`
- `POST /leads`
- `PATCH /leads/:id`
- `GET /appointments`
- `POST /appointments`
- `PATCH /appointments/:id`
- `GET /payments`
- `POST /payments`
- `PATCH /payments/:id`
- `GET /follow-ups`
- `POST /follow-ups`
- `PATCH /follow-ups/:id`

AI-assisted workflow:

- `POST /ai/message-suggestion`

Audit:

- `GET /audits`

Protected endpoints expect:

```text
Authorization: Bearer <token>
X-Business-Id: <business-id>
```

## Data Model

Core CRM models:

- `Customer`
- `Lead`
- `Appointment`
- `Payment`
- `FollowUpTask`

Account and audit models:

- `User`
- `Business`
- `BusinessMember`
- `AuditLog`

## Testing And Verification

Backend:

```bash
cd backend
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

Current verification completed:

- Backend tests pass.
- Backend production build passes.
- Frontend production build passes.
- Login, business selection, dashboard loading, lead creation, and audit rendering were smoke-tested locally.

## Product Decisions

- SQLite keeps the prototype easy to run locally without external infrastructure.
- Token-based auth and business scoping demonstrate the multi-account concept without adding deployment complexity.
- Payment handling tracks status and paid amount only; it does not integrate a real payment processor.
- Message suggestions are deterministic and template-based, so the app works without external AI API keys.
- Audit logs make the product more credible for real business usage by showing who changed what and when.

