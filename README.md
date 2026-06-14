# RetailAgent — Full-Stack Contact Application

A full-stack web application featuring a **Contact Us** page and a **Contacts List** page, built with Next.js (frontend) and NestJS (backend), backed by PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (React, TypeScript, Tailwind CSS) |
| Backend | NestJS 11 (TypeScript, TypeORM) |
| Database | PostgreSQL 16 |
| Containerisation | Docker & Docker Compose |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Running with Docker (Recommended)

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd retail-contact-app
   ```

2. Start all services:
   ```bash
   docker compose up --build
   ```

3. Open your browser:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:3001](http://localhost:3001)

4. To stop:
   ```bash
   docker compose down
   ```

### Running Locally (Without Docker)

**Additional prerequisites:** [Node.js](https://nodejs.org/) 20+ and a running [PostgreSQL](https://www.postgresql.org/download/) 16 instance.

#### Backend

1. Ensure PostgreSQL is running locally and create a database named `openagent`:
   ```bash
   createdb openagent
   ```

2. The server reads its database connection from environment variables (defaults shown below). Override them if your local setup differs:

   | Variable | Default | Description |
   |----------|---------|-------------|
   | `DB_HOST` | `localhost` | PostgreSQL host |
   | `DB_PORT` | `5432` | PostgreSQL port |
   | `DB_USERNAME` | `postgres` | Database user |
   | `DB_PASSWORD` | `postgres` | Database password |
   | `DB_NAME` | `openagent` | Database name |
   | `PORT` | `3001` | API server port |
   | `CLIENT_URL` | `http://localhost:3000` | Allowed CORS origin |

   > **Note:** The values above are **development defaults only**, intended for local testing. In production, use strong, unique credentials supplied via a secrets manager or an environment-specific `.env` file that is **never committed** to source control.

3. Start the server:
   ```bash
   cd server
   npm install
   npm run start:dev
   ```
   The API will be available at `http://localhost:3001/api/v1`.

#### Frontend

1. Start the client (defaults to calling the API at `http://localhost:3001`; override with `NEXT_PUBLIC_API_URL` if needed):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## API Endpoints

All endpoints are served under the global prefix `/api/v1`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/contacts` | Create a new contact |
| `GET` | `/api/v1/contacts` | List all contacts (newest first, paginated) |
| `PATCH` | `/api/v1/contacts/:id` | Update a contact (e.g. mark as verified) |
| `DELETE` | `/api/v1/contacts/:id` | Delete a contact |
| `GET` | `/api/v1/health` | Health check (database connectivity) |

### Example: Create a Contact

```bash
curl -X POST http://localhost:3001/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "0412345678",
    "note": "Looking for help with selling my property"
  }'
```

## Running Tests

The backend includes a full suite of unit and end-to-end tests (Jest + Supertest). The tests mock the database, so no running PostgreSQL instance is required.

```bash
cd server
npm install
npm test          # unit tests
npm run test:e2e  # end-to-end tests
npm run test:cov  # unit tests with coverage report
```

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Contact Us page
│   │   │   ├── contacts/page.tsx  # Contacts List page
│   │   │   └── thank-you/page.tsx # Thank You page
│   │   └── components/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── Dockerfile
│   └── package.json
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/
│   │   │   └── pipes/
│   │   │       └── sanitize.pipe.ts   # XSS sanitisation
│   │   ├── health/
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   └── contacts/
│   │       ├── contact.entity.ts
│   │       ├── contacts.controller.ts
│   │       ├── contacts.service.ts
│   │       ├── contacts.module.ts
│   │       └── dto/
│   │           ├── create-contact.dto.ts
│   │           ├── update-contact.dto.ts
│   │           └── pagination-query.dto.ts
│   ├── test/                          # End-to-end tests
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── README.md
└── AI_USAGE.md
```

## Assumptions

1. **Australian phone number validation:** Accepts common Australian formats including mobile (04xx), landline (02, 03, 07, 08), and special numbers (13xx, 1300, 1800). Spaces are stripped before validation.

2. **Company contact details:** Phone, email, postal address, and hours are hardcoded on the frontend as they represent static company information (not fetched from an API).

3. **"Mark as verified" behaviour:** Once a contact is marked as verified, the action is irreversible (the button becomes disabled). There is no "unverify" action.

4. **Sorting:** Contacts are sorted by `createdAt` descending (newest first) as specified.

5. **No authentication:** The contacts list page is publicly accessible as the spec does not mention authentication.

6. **Database synchronize:** TypeORM's `synchronize: true` is used for automatic schema creation. In production, migrations would be preferred.
