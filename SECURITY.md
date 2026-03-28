# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x.x   | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

Security issues should be reported privately.

Do not open public issues for vulnerabilities.

Send reports to: **security@abnahid.com**

Please include:

1. Vulnerability type and affected area
2. Reproduction steps
3. Impact assessment
4. Proof of concept (if available)
5. Suggested mitigation (optional)

## Response Targets

- Acknowledgment: within 48 hours
- Initial triage: within 5 business days
- Critical fix target: as soon as possible, typically within 7 days

## Scope

In scope:

- `sylcchi-backend` API and authentication logic
- `sylcchi-client` frontend security-sensitive flows
- Role and permission enforcement (`CUSTOMER`, `MANAGER`, `ADMIN`)
- Payment callback/webhook validation

Out of scope:

- Vulnerabilities only in third-party services or packages
- Social engineering attacks
- Physical security threats
- Volumetric DDoS without app-layer exploit details

## Security Expectations for Contributors

- Keep all trust decisions on backend services.
- Never commit secrets or credentials.
- Validate and sanitize all external input.
- Enforce authorization checks on protected routes.
- Use least privilege when adding new access paths.

## Current Security Controls

- Better Auth for session and auth lifecycle
- JWT-based auth for API route protection
- RBAC middleware for admin/manager/customer access
- Prisma ORM to reduce injection risks
- CORS and cookie parsing controls
- Webhook endpoints for payment reconciliation

Thank you for helping keep Sylcchi Palace secure.
