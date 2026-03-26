# Contributing to Zenvira

Thank you for considering contributing to Zenvira!

## Code of Conduct

This project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, check existing issues. Include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Steps to reproduce the behavior
- **Expected vs Actual Behavior**: What you expected vs what happened
- **Screenshots**: If applicable
- **Environment**: OS, Node.js version, Browser

### Suggesting Enhancements

Include:
- **Use Case**: The problem you're solving
- **Proposed Solution**: Your suggested approach
- **Alternatives**: Other options you've considered

### Pull Requests

1. **Fork & Clone**
   ```bash
   git clone https://github.com/abnahid/Zenvira.git
   cd Zenvira
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes** - Follow coding style, write meaningful commits

4. **Test**
   ```bash
   cd server && npm run build
   cd zenvira-client && npm run build && npm run lint
   ```

5. **Push & Open PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Development Setup

```bash
# Backend
cd server
npm install
cp .env.example .env
npm run db:migrate
npm run dev

# Frontend
cd zenvira-client
npm install
npm run dev
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Build/tooling

Example: `feat(auth): add email verification`

---

Thank you for contributing!
