# OMR Integration Guide

Exam Portal exposes integration points for an OMR processor that can detect a
student roll number and marked answers, compare answers with the configured
key, and send the result through the main application workflow. The processor
implementation is not bundled in this repository.

## Components

```text
frontend/src/components/OMRUpload.jsx
        |
        v
backend/routes/omr.js
        |
        v
external OMR processor
        |
        +--> OpenCV processing
        +--> backend exam/student/result endpoints
```

## Integration Setup

Start the backend first:

```bash
cd backend
npm install
npm run dev
```

Configure `OMR_SERVICE_URL` in `backend/.env` and `VITE_OMR_SERVICE_URL` in
`frontend/.env` for a compatible external processor. The expected local
defaults are:

- API: `http://localhost:8001`
- OpenAPI docs: `http://localhost:8001/docs`
- Health check: `http://localhost:8001/health`

## Important Endpoints

### External OMR processor

- `POST /process-omr` - process one sheet
- `POST /batch-process` - process multiple sheets
- `GET /answer-keys/{exam_id}/{class_id}` - retrieve an answer key
- `GET /health` - service health

### Backend integration

- `GET /api/omr/health`
- `POST /api/omr/process-omr`
- `GET /api/omr/answer-key/:examId/:classId`
- `POST /api/omr/submit-results`
- `GET /api/omr/stats/:examId/:classId`

## Request Flow

1. The user selects an exam/class and uploads an OMR image.
2. The backend forwards the image to the external OMR processor.
3. OpenCV aligns the sheet, decodes the roll number, and detects answer
   bubbles.
4. The service retrieves student and answer-key data from the backend.
5. The frontend displays the detected data for review.
6. Confirmed results are submitted to the backend.

## Current Limitations

- Several OMR-to-backend URLs are currently hard-coded to
  `http://localhost:4000`.
- Processing accuracy depends on the expected sheet layout, image quality, and
  visible fiducial markers.
- Real student data and answer sheets must not be committed as fixtures.
- Batch processing and error recovery need broader automated coverage.

## Troubleshooting

Check service health:

```bash
curl http://localhost:8001/health
curl http://localhost:4000/api/omr/health
```

For detection failures, verify that the full sheet is visible, the image is not
blurred, lighting is even, and all alignment markers are present.
