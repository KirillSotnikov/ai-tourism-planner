# AI Tourism Planner Server

A Node.js backend service that generates personalized travel itineraries using OpenAI's GPT-3.5-turbo model. The service provides both streaming and non-streaming APIs for real-time travel planning.

## 🌟 Features

- **AI-Powered Travel Planning**: Uses OpenAI GPT-3.5-turbo for intelligent itinerary generation
- **Real-time Streaming**: Server-Sent Events (SSE) for live response streaming
- **Customizable Parameters**: Location, duration, pace, and interests
- **Docker Support**: Containerized deployment ready
- **Environment Configuration**: Flexible configuration via environment variables
- **CORS Support**: Configurable cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KirillSotnikov/ai-tourism-planner
   cd ai-tourism-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=8080
   CORS_ALLOWED_ORIGIN=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The server will be available at `http://localhost:8080`

## 📖 API Documentation

### Generate Travel Plan (Streaming)

**Endpoint:** `POST /api/travel-plan`

**Request Body:**
```json
{
  "location": "Paris, France",
  "days": 3,
  "pace": "moderate",
  "interests": ["museums", "food", "architecture"]
}
```

**Response:** Server-Sent Events stream with Base64 encoded chunks

**Example Frontend Usage:**
```javascript
const eventSource = new EventSource('/api/travel-plan');

eventSource.onmessage = function(event) {
    try {
        const decodedContent = atob(event.data);
        console.log('Received chunk:', decodedContent);
        // Add to your UI
        document.getElementById('output').textContent += decodedContent;
    } catch (error) {
        console.error('Error decoding chunk:', error);
    }
};

eventSource.addEventListener('complete', function(event) {
    console.log('Stream completed');
    eventSource.close();
});
```

### Parameters

| Parameter | Type | Description | Options |
|-----------|------|-------------|---------|
| `location` | string | Destination city/country | Any valid location |
| `days` | number | Number of days for the trip | 1-30 |
| `pace` | string | Travel pace preference | `relaxed`, `moderate`, `fast` |
| `interests` | array | List of interests | `museums`, `food`, `architecture`, `nature`, `shopping`, etc. |

### Pace Guidelines

- **Relaxed**: 1-2 activities per day
- **Moderate**: 2-3 activities per day  
- **Fast**: 3-4 activities per day

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t ai-tourism-planner .

# Run the container
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=your_api_key \
  -e CORS_ALLOWED_ORIGIN=http://localhost:3000 \
  ai-tourism-planner
```

### Docker Compose

```yaml
version: '3.8'
services:
  ai-tourism-planner:
    build: .
    ports:
      - "8080:8080"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CORS_ALLOWED_ORIGIN=${CORS_ALLOWED_ORIGIN}
      - PORT=8080
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Required | Your OpenAI API key |
| `PORT` | 8080 | Server port |
| `CORS_ALLOWED_ORIGIN` | Required | Allowed CORS origin |

### Example .env file

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=8080
CORS_ALLOWED_ORIGIN=http://localhost:3000
```

## 🧪 Development

### Scripts

```bash
# Start development server
npm start

# Run tests (when implemented)
npm test

# Lint code (when implemented)
npm run lint
```

### Project Structure

```
ai-tourism-planner-server/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── Dockerfile           # Docker configuration
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-3.5-turbo API
- Express.js community for the excellent web framework
- All contributors who help improve this project

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/KirillSotnikov/ai-tourism-planner/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ for travelers and developers**