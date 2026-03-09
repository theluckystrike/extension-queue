# Contributing to extension-queue

Thank you for your interest in contributing to extension-queue! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear title describing the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Chrome version, OS, etc.)
   - Minimal code sample if applicable

### Suggesting Features

1. **Check the issue tracker** for existing discussions
2. **Open a feature request** with:
   - Clear description of the feature
   - Use cases
   - Proposed implementation (optional)
   - Alternatives considered

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** following our coding standards
4. **Write tests** for new functionality
5. **Commit with clear messages**
6. **Push to your fork** and submit a PR

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/extension-queue.git
cd extension-queue

# Install dependencies
npm install

# Build the project
npm run build

# Run tests (if available)
npm test
```

## Coding Standards

- **TypeScript**: Use strict mode
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: Use camelCase for variables and functions, PascalCase for classes
- **Comments**: Add JSDoc comments for public APIs
- **Error Handling**: Always handle errors appropriately

## Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## Pull Request Guidelines

- Keep PRs focused and reasonably sized
- Include context in the PR description
- Link related issues
- Ensure all tests pass
- Update documentation if needed

## Recognition

Contributors will be recognized in the README and release notes.

## Contact

For questions or suggestions, open an issue or reach out via GitHub.

---

Thank you for contributing!
