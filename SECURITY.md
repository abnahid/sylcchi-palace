# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Zenvira seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to **security@abnahid.com** with the following information:

1. **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
2. **Location** of the vulnerability (file path, URL, or component)
3. **Step-by-step instructions** to reproduce the issue
4. **Proof of concept** or exploit code (if available)
5. **Impact assessment** of the vulnerability
6. **Suggested fix** (if you have one)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Assessment**: We will assess the vulnerability and determine its impact
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days
- **Credit**: We will credit you in our security acknowledgments (unless you prefer to remain anonymous)

### Scope

The following are in scope:
- Zenvira client application (zenvira-client)
- Zenvira server API (server)
- Authentication and authorization systems
- Data handling and storage
- API endpoints

### Out of Scope

- Vulnerabilities in third-party dependencies (report these to the respective maintainers)
- Social engineering attacks
- Physical security issues
- Denial of service attacks

## Security Best Practices

When contributing to Zenvira, please follow these security practices:

1. **Never commit secrets** - Use environment variables for API keys, passwords, etc.
2. **Validate all inputs** - Sanitize user input on both client and server
3. **Use parameterized queries** - Prevent SQL injection with Prisma's query builder
4. **Implement proper authentication** - Use Better Auth's built-in security features
5. **Keep dependencies updated** - Regularly update npm packages

## Security Features

Zenvira implements the following security measures:

- **Password hashing** with bcrypt
- **Session-based authentication** with secure cookies
- **Role-based access control** (customer, seller, admin)
- **Email verification** for new accounts
- **CORS protection** with configurable origins
- **Input validation** on all API endpoints

---

Thank you for helping keep Zenvira and our users safe!
