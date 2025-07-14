# Contributing to AI Tourism Planner Server

Thank you for your interest in contributing to AI Tourism Planner Server! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the [Issues](https://github.com/KirillSotnikov/ai-tourism-planner/issues) section
2. Create a new issue with a clear and descriptive title
3. Include detailed steps to reproduce the bug
4. Add screenshots or logs if applicable
5. Specify your environment (OS, Node.js version, etc.)

### Suggesting Features

1. Check if the feature has already been requested
2. Create a new issue with the "enhancement" label
3. Describe the feature and its benefits
4. Provide use cases and examples if possible

### Code Contributions

#### Prerequisites

- Node.js 18+
- npm or yarn
- Git

#### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/KirillSotnikov/ai-tourism-planner.git
   cd ai-tourism-planner-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment file:
   ```bash
   cp env.example .env
   ```
5. Set up your environment variables in `.env`

#### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test your changes:
   ```bash
   npm start
   ```
4. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add new feature description"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request

#### Code Style Guidelines

- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Handle errors appropriately
- Test your changes thoroughly

#### Commit Message Format

Use conventional commit format:

```
type(scope): description

Examples:
feat(api): add new endpoint for user preferences
fix(streaming): resolve base64 encoding issue
docs(readme): update installation instructions
test(api): add unit tests for travel plan generation
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Pull Request Guidelines

1. Provide a clear description of the changes
2. Include any relevant issue numbers
3. Add tests if applicable
4. Update documentation if needed
5. Ensure all tests pass
6. Follow the project's coding standards

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Manual Testing

1. Start the server:
   ```bash
   npm start
   ```
2. Test the API endpoints using tools like:
   - Postman
   - curl
   - Your frontend application

### API Testing Example

```bash
curl -X POST http://localhost:8080/api/travel-plan \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Paris, France",
    "days": 3,
    "pace": "moderate",
    "interests": ["museums", "food"]
  }'
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms
- Include examples for API endpoints

### README Updates

- Update README.md when adding new features
- Include setup instructions for new dependencies
- Add examples for new API endpoints

## 🔧 Development Tools

### Recommended Extensions (VS Code)

- ESLint
- Prettier
- Node.js Extension Pack
- REST Client

### Useful Commands

```bash
# Start development server with auto-reload
npm run dev

# Check for linting issues
npm run lint

# Run tests
npm test
```

## 🐛 Debugging

### Common Issues

1. **Environment Variables**: Ensure all required env vars are set
2. **CORS Issues**: Check CORS_ALLOWED_ORIGIN configuration
3. **OpenAI API**: Verify API key and rate limits
4. **Port Conflicts**: Change PORT if 8080 is in use

### Debug Mode

Add debug logging:

```javascript
console.log('Debug:', variable);
```

## 📞 Getting Help

- Check existing [Issues](https://github.com/KirillSotnikov/ai-tourism-planner/issues)
- Search [Discussions](https://github.com/KirillSotnikov/ai-tourism-planner/discussions)
- Create a new issue for specific problems

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to AI Tourism Planner Server! 🚀 