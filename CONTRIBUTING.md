# Contributing to extension-queue

Thank you for your interest in contributing. This document outlines the process for contributing to the project.

## Reporting Issues

Before reporting a new issue, please search existing issues to avoid duplicates.

When reporting a bug, include:
- A clear description of the problem
- Steps to reproduce the issue
- Your environment (Node.js version, Chrome version, OS)
- Any relevant error messages or logs

When requesting a feature, describe:
- The problem you are trying to solve
- Your proposed solution
- Alternative solutions you have considered

## Development Workflow

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch from main
4. Make your changes
5. Test your changes
6. Push to your fork
7. Submit a pull request

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Setup

```bash
npm install
npm run build
```

## Code Style

The project uses TypeScript with the following conventions:
- Use TypeScript strict mode
- Prefer interfaces over types for public APIs
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Run `npm run build` before committing to ensure type safety

## Testing

Run the build to verify TypeScript compilation:

```bash
npm run build
```

The project uses TypeScript's built-in type checking. Ensure no TypeScript errors exist before submitting a pull request.

## License

By contributing to extension-queue, you agree that your contributions will be licensed under the MIT License.
