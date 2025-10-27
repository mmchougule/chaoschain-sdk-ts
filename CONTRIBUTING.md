# Contributing to ChaosChain TypeScript SDK

Thank you for your interest in contributing to the ChaosChain TypeScript SDK! This document provides guidelines for contributions.

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Getting Started

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/chaoschain-sdk-ts.git
cd chaoschain-sdk-ts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
# Add your private key and RPC URLs
```

4. Run tests:
```bash
npm test
```

5. Build the project:
```bash
npm run build
```

## Development Workflow

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our code style
3. Add tests for new functionality
4. Ensure all tests pass:
```bash
npm run test
npm run typecheck
npm run lint
```

5. Build to ensure no errors:
```bash
npm run build
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Check linting
npm run lint
```

**Key guidelines:**
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- No `any` types in public interfaces
- Prefer `interface` over `type` for object types
- Use meaningful variable names

### Commit Messages

Follow conventional commits format:

```
feat: add support for new network
fix: resolve payment calculation issue
docs: update API documentation
test: add tests for WalletManager
chore: update dependencies
```

## Pull Request Process

1. Update documentation for any API changes
2. Add tests for new features
3. Ensure all CI checks pass
4. Update CHANGELOG.md (if applicable)
5. Request review from maintainers

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Code follows project style
- [ ] Commit messages are clear
- [ ] No breaking changes (or clearly documented)
- [ ] Build succeeds

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- WalletManager.test.ts

# Run with coverage
npm run test:coverage
```

### Integration Tests

For integration tests against live networks, ensure you have:
- Test wallet with testnet funds
- Valid RPC endpoints
- Storage provider credentials (for storage tests)

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new public APIs
- Update examples if API changes
- Keep CHANGELOG.md up to date

## Adding New Features

### New Storage Provider

1. Create file in `src/providers/storage/`
2. Implement `StorageProvider` interface
3. Export from `src/providers/storage/index.ts`
4. Add tests
5. Update documentation

### New Network Support

1. Add network to `NetworkConfig` enum in `src/types.ts`
2. Add contract addresses to `src/utils/networks.ts`
3. Add RPC URL configuration
4. Update documentation

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v0.1.0`
4. Push tag: `git push origin v0.1.0`
5. GitHub Actions will publish to npm

## Bug Reports

Use GitHub Issues with the bug template:

**Title:** Clear description of the bug

**Description:**
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node.js version, OS)
- Relevant logs/errors

## Feature Requests

Use GitHub Issues with the feature request template:

**Title:** Feature name

**Description:**
- Use case / problem to solve
- Proposed solution
- Alternatives considered
- Additional context

## Questions and Support

- GitHub Discussions for questions
- Discord for community chat
- Email: sumeet.chougule@nethermind.io

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ChaosChain! 🎉

