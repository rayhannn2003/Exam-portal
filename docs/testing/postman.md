# PDF API Testing with Postman

The Postman collection at
[`pdf-generator.postman_collection.json`](pdf-generator.postman_collection.json)
contains requests for exercising PDF endpoints.

## Before Testing

Start the primary Flask PDF service:

```bash
cd pdf_service_flask
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./start_local.sh
```

The primary local PDF URL is `http://localhost:5000`.

Start the backend separately when testing proxied endpoints:

```bash
cd backend
npm install
npm run dev
```

## Import

1. Open Postman.
2. Import `docs/testing/pdf-generator.postman_collection.json`.
3. Set collection or environment variables to match your local services.
4. Replace example IDs and tokens with values from your own development
   database.

## Recommended Test Order

1. `GET http://localhost:5000/health`
2. `GET http://localhost:5000/templates`
3. `GET http://localhost:5000/customization-options`
4. Generate a question-paper preview
5. Download a question-paper PDF
6. Generate a scholarship PDF
7. Generate an admit card
8. Test the backend-proxied PDF endpoints with an admin token

## Safety

- Do not save real bearer tokens, credentials, or student information in the
  committed collection.
- Generated PDFs are ignored by Git and should remain local.
- Use port `5000` for the primary Flask service.
