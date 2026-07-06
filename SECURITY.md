# Security

Please do not open public issues containing secrets, API keys, uploaded resumes, database URLs, payment credentials, or private user data.

## Reporting

If you find a vulnerability, report it privately to the repository owner. Include reproduction steps, affected routes or modules, and the expected impact.

## Secret Handling

- Keep `.env` and `.env.local` local.
- Store production secrets in your deployment provider.
- Rotate any credential that was accidentally committed or exposed.
- Treat uploaded resumes as sensitive personal data.
