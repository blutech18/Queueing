# Queueing System

A simple web-based office queueing system built with plain HTML, CSS, JavaScript, Vercel Serverless Functions, and NeonDB PostgreSQL.

## Features

- Kiosk screen for clients to choose a service and receive a queue number.
- Staff counter dashboard with Next, Recall, Skip, and Done actions.
- TV display screen that polls the API every 3 seconds.
- Admin page with services, activation toggles, today’s queue list, and daily statistics.
- Daily queue numbering reset per service using the format `CODE-001`.
- Database access is isolated inside Vercel API functions.

## Project Structure

```text
queueing-system/
├── index.html
├── counter.html
├── display.html
├── admin.html
├── css/
│   └── style.css
├── js/
│   ├── kiosk.js
│   ├── counter.js
│   ├── display.js
│   └── admin.js
├── api/
│   ├── _db.js
│   ├── create-queue.js
│   ├── next-queue.js
│   ├── update-queue.js
│   ├── serving.js
│   ├── admin-stats.js
│   └── services.js
├── schema.sql
├── package.json
├── .env.example
└── README.md
```

## NeonDB Setup

1. Create a Neon project at <https://neon.tech>.
2. Copy the pooled PostgreSQL connection string.
3. Open the Neon SQL Editor.
4. Run the contents of `schema.sql`.
5. Confirm the `services` table contains the default services.

Default services:

- AD RECORDS
- OPM Permits
- FSD
- PRIORITY LANE
- TERMINAL
- FD-DISBURSEMENT
- PSD-SAFETY
- PPD
- ASSESSMENT
- ENCODING
- CASHIER
- MARINE

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
```

Run locally with Vercel:

```bash
npm run local
```

Open:

- Kiosk: <http://localhost:3000/>
- Counter: <http://localhost:3000/counter.html>
- Display: <http://localhost:3000/display.html>
- Admin: <http://localhost:3000/admin.html>

## Vercel Deployment

1. Push this project to a Git repository.
2. Import the repository in Vercel.
3. Add an environment variable in Vercel Project Settings:
   - Name: `DATABASE_URL`
   - Value: your Neon PostgreSQL connection string
4. Deploy.
5. Visit the deployed URLs:
   - `/`
   - `/counter.html`
   - `/display.html`
   - `/admin.html`

## API Endpoints

### `POST /api/create-queue`

Creates a waiting queue record.

```json
{
  "serviceId": 1
}
```

### `POST /api/next-queue`

Calls the earliest waiting queue for the selected service.

```json
{
  "serviceId": 1,
  "counterNumber": "1"
}
```

### `POST /api/update-queue`

Updates a queue status to `skipped` or `completed`.

```json
{
  "queueId": 10,
  "status": "completed",
  "counterNumber": "1"
}
```

### `GET /api/serving`

Returns currently serving queues and recent called queues.

### `GET /api/admin-stats`

Returns today’s queue counts and queue records.

### `GET /api/services`

Returns active services. Use `?includeInactive=true` for admin service management.

### `PATCH /api/services`

Activates or deactivates a service.

```json
{
  "id": 1,
  "isActive": true
}
```

## Security Notes

- Frontend JavaScript calls only `/api/*` routes.
- `DATABASE_URL` is read only by serverless functions.
- SQL queries use tagged parameterized queries through `@neondatabase/serverless`.
- Do not commit `.env`.

## Queue Statuses

- `waiting`: Client has taken a number and is waiting.
- `serving`: Staff called the queue.
- `skipped`: Staff skipped the queue.
- `completed`: Transaction is done.
