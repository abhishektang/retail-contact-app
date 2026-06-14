# RetailAgent Application

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
   cd openagent-contact-app
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

#### Backend

1. Ensure PostgreSQL is running locally with a database named `openagent`.
  CLIENT_URL=http://localhost:3000
   ```

2. Start the server:
   ```bash
   cd server
   npm install
   npm run start:dev
   ```
   The API will be available at `http://localhost:3001`.

#### Frontend

1. Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. Start the client:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/contacts` | Create a new contact |
| `GET` | `/contacts` | List all contacts (newest first) |
| `PATCH` | `/contacts/:id` | Update a contact (e.g. mark as verified) |
| `DELETE` | `/contacts/:id` | Delete a contact |

### Example: Create a Contact

```bash
curl -X POST http://localhost:3001/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "0412345678",
    "note": "Looking for help with selling my property"
  }'
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
│   │   └── contacts/
│   │       ├── contact.entity.ts
│   │       ├── contacts.controller.ts
│   │       ├── contacts.service.ts
│   │       ├── contacts.module.ts
│   │       └── dto/
│   │           ├── create-contact.dto.ts
│   │           └── update-contact.dto.ts
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
