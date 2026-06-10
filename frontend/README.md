# Exam Portal Frontend

The frontend is a React 19 and Vite application for the public landing page,
student dashboard, admin workflows, exam management, results, scholarships,
finance summaries, reminders, OMR uploads, and PDF actions.

## Prerequisites

- Node.js 20 or newer recommended
- npm
- The Express backend running at `http://localhost:4000`
- The primary Flask PDF service running at `http://localhost:5000` for direct
  PDF actions

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

```dotenv
VITE_API_BASE_URL=http://localhost:4000/api
VITE_PDF_SERVICE_URL=http://localhost:5000
VITE_OMR_SERVICE_URL=http://localhost:8001
```

Vite embeds these values at build time.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production bundle |
| `npm run lint` | Run ESLint |

## Notes

- The production build currently passes.
- The codebase has known lint debt. New changes should not add lint errors and
  should reduce existing errors in touched files.
- Screenshots used by the root README live in `../docs/images/`.
