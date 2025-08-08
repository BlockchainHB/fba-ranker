# Contributing to FBA Hangout - Seller's Leaderboard

Thank you for your interest in contributing to the FBA Hangout Seller's Leaderboard! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/fba-ranker.git
   cd fba-ranker
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your environment** following the [README setup instructions](README.md#quick-start)

## 🛠️ Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run dev
   npm run build
   npm run lint
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your descriptive commit message"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Prefer interfaces over types where possible
- Use proper type annotations

### React/Next.js
- Use functional components with hooks
- Follow React best practices
- Use Next.js App Router conventions

### Styling
- Use Tailwind CSS utility classes
- Follow shadcn/ui component patterns
- Ensure responsive design

### Code Organization
- Keep components small and focused
- Use proper file naming conventions
- Add comments for complex logic

## 🎯 Types of Contributions

### 🐛 Bug Reports
- Use the bug report template
- Include reproduction steps
- Provide environment details

### 💡 Feature Requests
- Use the feature request template
- Explain the use case
- Consider implementation complexity

### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Documentation updates

### 📚 Documentation
- README improvements
- Code comments
- Setup guides
- API documentation

## 🧪 Testing

- Test your changes thoroughly
- Ensure existing functionality isn't broken
- Test on different screen sizes
- Verify database operations work correctly

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project conventions
- [ ] Changes are tested locally
- [ ] Documentation is updated if needed
- [ ] Commit messages are descriptive

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Works on mobile
- [ ] Database operations verified

## Screenshots
Include relevant screenshots for UI changes
```

## 🏷️ Commit Message Convention

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Testing changes
- `chore:` - Maintenance tasks

Examples:
```
feat: add monthly profit tracking
fix: resolve submission approval bug
docs: update setup instructions
```

## 🚫 What Not to Contribute

- Breaking changes without discussion
- Features that don't align with project goals
- Code that doesn't follow our standards
- Untested changes
- Security vulnerabilities (report privately)

## 🆘 Getting Help

- **General Questions**: Open a discussion on GitHub
- **Bug Reports**: Create an issue with the bug template
- **Feature Ideas**: Create an issue with the feature template
- **Security Issues**: Email privately (don't create public issues)

## 🎉 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Credited in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, helps make this project better for the Amazon FBA community!

---

**Happy coding! 🚀**
