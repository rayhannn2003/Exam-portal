# Primary Flask PDF Service

This is the primary PDF implementation used by the current Exam Portal backend
and frontend integration. It provides printable question papers, scholarship
lists, and admit cards, including Bengali-friendly templates.

The application uses `http://localhost:5000` for local development. The
experimental FastAPI alternative is located in `../pdf_service/`.

## Why This Is the Primary Service

- `backend/controllers/pdfController.js` defaults to port `5000`.
- Current frontend scholarship and admit-card actions target the Flask service.
- Admit-card endpoints exist here but not in the FastAPI implementation.

## Features

- Question-paper preview and PDF download
- Scholarship-list PDF generation
- Admit-card generation and download
- Bengali templates and organization branding
- Jinja2 templates, ReportLab, and WeasyPrint support
- Health, template-list, and customization endpoints

## Local Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
./start_local.sh
```

Verify the service:

```bash
curl http://localhost:5000/health
```

## Environment

See [`.env.example`](.env.example).

Important values:

```dotenv
PDF_SERVICE_HOST=0.0.0.0
PDF_SERVICE_PORT=5000
TEMPLATE_DIR=templates
UPLOAD_DIR=uploads
ALLOWED_ORIGINS=http://localhost:5173
DEBUG=false
```

Restrict `ALLOWED_ORIGINS` and disable debug mode in production.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health |
| `GET` | `/templates` | Available templates |
| `GET` | `/templates/<template_name>` | Template details |
| `GET` | `/customization-options` | Supported customization |
| `POST` | `/preview-question-paper` | Render an HTML preview |
| `POST` | `/generate-question-paper` | Generate question-paper metadata |
| `POST` | `/generate-question-paper/download` | Download a question-paper PDF |
| `POST` | `/generate-scholarship-pdf` | Generate scholarship-list metadata |
| `POST` | `/generate-scholarship-pdf/download` | Download a scholarship PDF |
| `POST` | `/generate-admit-card` | Generate an admit-card PDF |
| `POST` | `/generate-admit-card/download` | Download an admit-card PDF |

## Production

Install the dependencies and run Gunicorn:

```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app
```

A service Dockerfile is included. Build and expose it explicitly:

```bash
docker build -t exam-portal-pdf-flask .
docker run --rm -p 5000:8000 --env-file .env exam-portal-pdf-flask
```

There is intentionally no service Compose file. The previous configuration
conflicted with the OMR service port and was removed until complete
orchestration is available.

## Testing

The existing scripts exercise a running local service:

```bash
python test_service.py
python test_templates.py
```

They generate local PDFs, which are ignored by Git.

## Template Development

Templates live in `templates/`. Keep template changes compatible with the
payloads produced by `backend/controllers/pdfController.js` and verify Bengali
  font rendering before merging.
