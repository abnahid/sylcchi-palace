# Contributing to Sylcchi Palace

Thanks for your interest in contributing to Sylcchi Palace.

## Code of Conduct

This project follows the rules in `CODE_OF_CONDUCT.md`. By participating, you agree to follow them.

## Ways to Contribute

### Report Bugs

Before opening a new issue, search existing issues first.

Please include:

- A clear bug description
- Reproduction steps
- Expected behavior vs actual behavior
- Screenshots or logs when helpful
- Environment details (OS, Node version, browser)

### Suggest Improvements

Please include:

- The problem or use case
- Your proposed solution
- Any alternatives considered

### Submit Pull Requests

1. Fork and clone the repository.
2. Create a branch from `main`.
3. Make focused, testable changes.
4. Run checks locally.
5. Open a PR with clear context.

## Local Development

```bash
git clone <your-fork-url>
cd "Sylcchi Palace"

# Backend
cd sylcchi-backend
npm install
cp .env.example .env.local
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev

# Frontend (new terminal)
cd ../sylcchi-client
npm install
cp .env.example .env.local
npm run dev
```

## Validation Checklist

Before opening a PR:

- Backend: `cd sylcchi-backend && npm run prisma:validate`
- Frontend: `cd sylcchi-client && npm run lint`
- Build affected app(s) when your change impacts runtime behavior

## Commit Style

Conventional Commits are recommended:

- `feat`: new feature
- `fix`: bug fix
- `docs`: docs changes
- `refactor`: internal code improvement
- `test`: tests
- `chore`: tooling and maintenance

Example:

```text
feat(booking): add refund completion guard for admin only
```

## Pull Request Tips

- Keep PRs scoped to one concern.
- Include screenshots for UI changes.
- Mention breaking changes explicitly.
- Reference related issues.

Thanks for helping improve Sylcchi Palace.
