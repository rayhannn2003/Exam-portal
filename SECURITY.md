# Security Policy

## Reporting a Vulnerability

Please do not report security vulnerabilities in public GitHub issues.

Use GitHub's private vulnerability reporting feature for this repository when
available. Otherwise, contact the maintainer privately through the GitHub
profile linked in the root README.

Include:

- A description of the vulnerability and its impact
- Reproduction steps or a minimal proof of concept
- The affected component and version or commit
- Any suggested mitigation

Please allow reasonable time for investigation and remediation before public
disclosure.

## Security Expectations

- Never commit `.env` files, API keys, database credentials, JWT secrets, or
  real student records.
- Use strong, unique secrets for each environment.
- Rotate any credential that has appeared in Git history.
- Review authentication, authorization, CORS, file upload limits, and
  service-to-service access before production deployment.
- Replace development accounts and seed data before exposing an environment.

## Supported Versions

Security fixes currently target the latest commit on the `main` branch.

