# Contributing to mcp-devkit

Thank you for your interest in contributing to mcp-devkit! This project aims to enhance Claude's development workflow by providing persistent project memory and anti-drift mechanisms.

## 🎯 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- TypeScript knowledge
- Familiarity with Model Context Protocol (MCP)
- Understanding of AI-assisted development workflows

### Development Setup
```bash
# Clone the repository
git clone https://github.com/escott/mcp-devkit.git
cd mcp-devkit

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run in development mode
npm run dev
```

## 🏗️ Project Structure

```
src/
├── cli/           # CLI tool implementation
├── mcp/           # MCP server and tools
├── core/          # Core business logic
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## 🧪 Testing

We maintain high test coverage (>80%) for all code:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Writing Tests
- Place unit tests next to the code they test in `__tests__` folders
- Use descriptive test names that explain the expected behavior
- Test both success and error cases
- Mock external dependencies appropriately

## 📝 Development Guidelines

### TypeScript
- Use TypeScript strict mode
- Define explicit types for all function parameters and returns
- Avoid `any` types unless absolutely necessary
- Use interfaces for object shapes

### Code Style
- Follow the existing code style (enforced by ESLint + Prettier)
- Run `npm run lint` before committing
- Run `npm run format` to auto-fix formatting issues

### Commit Messages
Follow conventional commits format:
```
feat: add new MCP tool for project analysis
fix: correct drift detection logic
docs: update README with new examples
test: add integration tests for init command
```

## 🔄 Pull Request Process

1. **Fork and Branch**: Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement**: Make your changes following the guidelines above

3. **Test**: Ensure all tests pass and coverage remains >80%
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Document**: Update documentation if needed

5. **Submit PR**: 
   - Provide a clear description of the changes
   - Reference any related issues
   - Include examples if applicable

### PR Checklist
- [ ] All tests pass
- [ ] Code coverage remains >80%
- [ ] TypeScript compiles without errors
- [ ] ESLint and Prettier checks pass
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions

## 🎯 What We're Looking For

### High Priority
- Additional MCP tools for Claude workflow enhancement
- Integration with other AI development tools
- Performance optimizations
- Bug fixes with reproducible test cases

### Feature Ideas
- Custom project templates
- Advanced drift detection algorithms  
- Team collaboration features
- Analytics and reporting tools
- VS Code extension

### Documentation
- Usage examples and tutorials
- Integration guides
- Video walkthroughs
- Translation to other languages

## 🐛 Reporting Issues

When reporting issues, please include:
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages or logs

## 💡 Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Describe the problem you're solving
- Explain your proposed solution
- Consider implementation complexity

## 🤝 Community

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Issues**: Report bugs and request features
- **Pull Requests**: Contribute code improvements

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Special thanks section

Thank you for helping make Claude a better development partner! 🚀