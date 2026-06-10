# Deployment Guide

Exam Portal currently runs as separate services. The former root Docker Compose
configuration was removed because it referenced missing frontend and backend
Dockerfiles. Deploy and verify each service independently until a complete,
tested orchestration setup is contributed.

## Service Layout

| Service | Default local port | Notes |
| --- | ---: | --- |
| React frontend | `5173` | Static Vite build for production |
| Express backend | `4000` | Main API and PostgreSQL access |
| Flask PDF service | `5000` | Primary PDF implementation |
| External OMR processor | `8001` | Optional; implementation not bundled |

## Production Checklist

- Create environment-specific secrets outside Git.
- Apply `backend/migrations/001_initial_schema.sql` to a new PostgreSQL
  database.
- Apply `backend/schema/student_tracking.sql` and
  `backend/schema/user_activity_migration.sql` for activity analytics.
- Create the first super-admin through the explicit bootstrap command. The
  migration intentionally contains no default credentials.
- Restrict CORS to the deployed frontend origin.
- Put every public HTTP service behind TLS.
- Limit upload sizes and protect OMR/PDF service access.
- Configure process supervision and centralized logs.
- Back up PostgreSQL and test restore procedures.
- Run the CI checks and service health checks before release.

## Backend

```bash
cd backend
npm ci --omit=dev
cp .env.example .env
npm start
```

Required production values include database credentials, a strong
`JWT_SECRET`, the frontend URL, and the selected service URLs.

Create the first super-admin once:

```bash
SUPERADMIN_USERNAME=replace_me \
SUPERADMIN_NAME="Production Administrator" \
SUPERADMIN_PASSWORD=replace_with_a_long_password \
npm run bootstrap:superadmin
```

Health monitoring should verify the API process and a simple database-backed
endpoint. A dedicated backend health endpoint is still recommended.

## Frontend

```bash
cd frontend
cp .env.example .env
npm ci
npm run build
```

Serve `frontend/dist/` from a static host or reverse proxy. Set
`VITE_API_BASE_URL` and `VITE_PDF_SERVICE_URL` before building because Vite
embeds those values into the production bundle.

## Primary Flask PDF Service

```bash
cd pdf_service_flask
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app
```

Verify:

```bash
curl http://localhost:5000/health
```

## External OMR Processor

The backend can proxy OMR requests to `OMR_SERVICE_URL`, but the processor
implementation is not bundled in this repository. Deploy a compatible service
separately and verify its health endpoint before enabling OMR workflows.

## Reverse Proxy

A reverse proxy can expose the frontend and route private API traffic:

```text
/              -> frontend static files
/api/          -> Express backend :4000
/internal/pdf/ -> Flask PDF service :5000
/internal/omr/ -> external OMR processor :8001
```

Keep the PDF service and external OMR processor private when possible and allow
the backend to proxy requests to them.
