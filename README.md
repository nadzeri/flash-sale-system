## Flash Sale System

A full-stack flash sale application demonstrating high-concurrency purchase handling with strict inventory guarantees.

### Design choices and trade-offs
- **Strict consistency on purchases**: The backend performs an atomic stock decrement inside a database transaction and inserts an order with a unique constraint per user and sale. This guarantees no overselling and no duplicate orders for the same user.
  - **Trade-off**: Using the database as the concurrency control gate (row-level locking with conditional update) can limit peak throughput compared to entirely in-memory coordination, but it keeps correctness simple and durable.
- **Simple, explicit API boundaries**: `POST /api/flash-sales/:id/purchase` is the single write path. Simplicity reduces edge cases during load.
- **Drizzle ORM + Postgres**: SQL-first modeling, migrations, and the ability to express conditional updates cleanly.
- **Monorepo with shared types**: `packages/shared` provides typed contracts across backend and frontend to reduce bugs.
- **Security & DX**: JWT-based auth, CORS/Helmet defaults, Vitest for fast backend tests.

Key concurrency logic (high-level):
- Decrement stock only if `remainingStock > 0` then insert order, all inside a transaction; on conflict (user already purchased), revert the decrement.

### System diagram
```mermaid
flowchart LR
  User -- REST --> API
  subgraph Monorepo
    API -- Drizzle ORM --> DB[(Postgres)]
    Frontend[Frontend App]
    Shared[packages/shared]
  end
  User <-- JWT / Fetch --> Frontend
  Frontend -- Typed Models --> Shared
  API -- Typed Models --> Shared
```

## Getting started

### Prerequisites
- Node.js 18+ (uses workspaces)
- Docker (for Postgres)

### 1) Install dependencies
```bash
npm install
```

### 2) Start Postgres
```bash
docker compose up -d
```

Postgres will be available on port `35432` (container exposes `5432`).

### 3) Environment setup
This repo includes example env files. Copy them and initialize the database.
```bash
npm run setup
```
What it does:
- Copies `apps/backend/.env.example` -> `apps/backend/.env`
- Copies `apps/frontend/.env.example` -> `apps/frontend/.env`
- Resets and migrates the DB for backend

Confirm backend `.env` contains a valid `DATABASE_URL` (matching Docker Compose):
```
DATABASE_URL=postgresql://app:app@localhost:35432/flash_sale
```

### 4) Build shared package
```bash
npm run build
```

## Running the apps

### Backend (API)
```bash
npm run dev:backend
```
Defaults to `PORT=3000`. Health check: `GET http://localhost:3000/health`.

### Frontend (Vite)
```bash
npm run dev:frontend
```
Defaults to `http://localhost:38080`.

Frontend expects the backend base URL via `apps/frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

## Testing (backend)
Run the test suite:
```bash
npm run test -w flash-sale-backend
```

Coverage:
```bash
npm run test:coverage -w flash-sale-backend
```

## Stress testing
We use Artillery to simulate flash sale traffic. There are two convenient scripts:

- Single user sanity:
```bash
npm run stresstest:single-user
```

- 100 concurrent users, short burst:
```bash
npm run stresstest:multiple-users
```

These commands will:
1. Reset the database to a clean state.
2. Generate users and flash sale data under `stresstest/artillery/data`.
3. Run the scenario described in `stresstest/artillery/purchase.yml` against `http://localhost:33000` by default.
4. Produce results under `stresstest/results/*.json` and an HTML report.

If your backend runs on a different port, adjust `stresstest/artillery/purchase.yml` `config.target` or run the backend on `PORT=33000`.

### Expected outcome under load
- **No overselling**: Total successful orders never exceed the configured `remainingStock` for the flash sale.
- **No duplicate purchases per user**: Attempts beyond the first for a user result in `400` with a clear message.
- **Bounded errors**: When stock is exhausted, further requests receive `400` “out of stock”; overall error rate will rise accordingly but is expected and correct.
- **Throughput and latencies**: With DB-backed atomic operations, expect stable correctness with moderate TPS; tuning Postgres, pool size, and process concurrency can improve throughput if needed.

Artifacts:
- JSON and HTML reports saved in `stresstest/results/` with the run name specified via `--name`.

## Useful commands
- Start DB: `docker compose up -d`
- Stop DB: `docker compose down`
- DB studio (schema UI): `npm run db:studio -w flash-sale-backend`

## Notes
- CORS defaults allow localhost origins; adjust `CORS_ORIGIN` in backend `.env` as needed.
- Authentication uses JWT; the frontend stores the token in `localStorage` and sends it via `Authorization: Bearer <token>`.