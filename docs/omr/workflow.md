# OMR Result Workflow

The user-facing OMR workflow is available from the results area and supports
both single-sheet and batch processing.

## Workflow

1. Select the relevant exam and class.
2. Upload a JPG or JPEG image of the completed OMR sheet.
3. The OMR service detects the roll number and marked answers.
4. The system looks up the student and answer key.
5. Review the detected student, score, confidence, and processed sheet.
6. Confirm the result before adding it to the result records.

## Result States

### Successful detection

- The roll number is decoded.
- Student information is found.
- Answers are detected and scored.
- The reviewed result can be submitted.

### Partial detection

- The roll number may be detected while one or more answer areas are unclear.
- The result should remain unsubmitted until reviewed or rescanned.

### Failed detection

- The roll number or required sheet regions cannot be decoded.
- No result should be submitted.
- The user should upload a clearer, correctly aligned image.

## Processing Details

The OpenCV processor performs:

- Fiducial-marker detection and perspective correction
- Roll-number bubble decoding
- Answer-bubble detection
- Answer-key comparison
- Confidence and processing-detail reporting

## Data Safety

Treat answer sheets and result records as sensitive educational data. Use
synthetic fixtures in tests and documentation, and remove temporary uploads
according to the deployment's retention policy.

## Verification Checklist

- The selected exam/class has an answer key.
- The detected roll belongs to the expected student.
- The processed-sheet overlay matches the original marks.
- Correct, incorrect, skipped, and total counts are consistent.
- A failed or partial scan does not create a result record.

