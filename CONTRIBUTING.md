# Contributing to Exam Portal

Thank you for helping improve Exam Portal. Contributions are welcome across the
frontend, backend, OMR processing, PDF generation, tests, and documentation.

## Before You Start

- Read the root `README.md` and the relevant guide under `docs/`.
- Search existing issues before opening a new one.
- Keep pull requests focused on one problem or feature.
- Never commit credentials, student data, private exam data, or generated
  reports.

## Development Setup

Run each service separately during local development:

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev

# Primary PDF service
cd pdf_service_flask
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./start_local.sh

```

Create local `.env` files from the component `.env.example` files.

## Branches and Commits

- Create a descriptive branch such as `fix/omr-roll-detection` or
  `docs/local-setup`.
- Write concise commit messages that explain the change.
- Avoid unrelated formatting or refactoring in the same pull request.

## Validation

Run the checks relevant to your change:

```bash
cd frontend && npm run build
cd frontend && npm run lint
cd backend && npm test
```

The frontend currently has known lint debt. Do not add new lint errors, and
prefer reducing existing errors in files you modify.

For PDF changes, also run the service locally and describe the manual
verification performed. For OMR integration changes, document the compatible
external processor used for testing.

## Pull Requests

Include:

- The problem being solved
- The approach taken
- Screenshots for user-interface changes
- Test and verification steps
- Any migration, configuration, or compatibility impact

By contributing, you agree that your contribution will be licensed under the
MIT License.
