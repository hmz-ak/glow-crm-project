# FlowCRM MVP

FlowCRM is a mobile-first CRM prototype for solo and tiny B2C service businesses. It focuses on the everyday workflow that small operators usually track in spreadsheets and messaging apps: lead capture, booking, service status, payment tracking, and follow-up.

## Project Structure

- `backend/` - NestJS REST API with Prisma and SQLite.
- `frontend/` - React/Vite app with a compact mobile-first interface.

## Local Setup

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:4000`. Frontend runs on `http://localhost:5173`.

## Demo Story

1. Open the dashboard and show today’s bookings, hot leads, overdue follow-ups, and receivables.
2. Add a lead from the Pipeline screen in under a minute.
3. Move the lead across the sales stages: `New`, `Contacted`, `Booked`, `Served`, `Follow-up`, `Won`, `Lost`.
4. Mark a booking completed, mark a payment paid, and complete a follow-up task.
5. Generate a WhatsApp/SMS-style message suggestion from the Follow-ups screen.

## API Highlights

- `GET /dashboard/summary`
- `GET /customers`, `POST /customers`, `PATCH /customers/:id`
- `GET /leads`, `POST /leads`, `PATCH /leads/:id`
- `GET /appointments`, `POST /appointments`, `PATCH /appointments/:id`
- `GET /payments`, `POST /payments`, `PATCH /payments/:id`
- `GET /follow-ups`, `POST /follow-ups`, `PATCH /follow-ups/:id`
- `POST /ai/message-suggestion`

## Product Choices

- SQLite keeps the interview prototype easy to run locally.
- Template-based message generation avoids API keys while still demonstrating AI-assisted workflow design.
- Authentication, multi-business accounts, and real payment processing are intentionally out of scope for the MVP.
