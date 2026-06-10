# Exam Portal Documentation

This directory contains contributor and operator documentation that is too
detailed for the root README.

## Guides

- [Service deployment](deployment.md)
- [OMR integration](omr/integration.md)
- [OMR result workflow](omr/workflow.md)
- [PDF API testing with Postman](testing/postman.md)

## Images

The `images/` directory contains screenshots used by the root README. Before
adding an image, remove personal student data, credentials, and private exam
content. Screenshots with student names, roll numbers, schools, or identifiable
answer sheets must remain local until they are redacted.

## Service Documentation

Service-specific documentation stays beside the service:

- [`pdf_service_flask/README.md`](../pdf_service_flask/README.md) - primary PDF
  service
- [`pdf_service/README.md`](../pdf_service/README.md) - experimental FastAPI
  PDF service
- [`frontend/README.md`](../frontend/README.md) - frontend setup
