# AI Tourism Planner Server

A Node.js backend service that generates personalized travel itineraries using OpenAI models (default: `gpt-6-luna`). Itineraries are streamed to the client in real time via Server-Sent Events.

## 🌟 Features

- **AI-Powered Travel Planning**: Uses OpenAI models for intelligent itinerary generation, configurable via `OPENAI_MODEL`
- **Real-time Streaming**: Server-Sent Events (SSE) for live response streaming
- **Customizable Parameters**: Location, duration, pace, and interests
- **Input Validation**: Rejects malformed or oversized requests before they reach OpenAI
- **Rate Limiting**: Per-IP request limit, one generation at a time per IP, and a global daily cap
- **Abuse Visibility**: One JSON log line per request, plus an IP block list
- **Cost Controls**: Optional reasoning effort setting for reasoning models
- **Docker Support**: Containerized deployment ready
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
   cp env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-6-luna
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
  "location": "Paris",
  "days": 3,
  "pace": "moderate",
  "interests": ["Art & Museums", "Food & Dining", "Architecture"]
}
```

### Parameters

| Parameter | Type | Required | Rules |
|-----------|------|----------|-------|
| `location` | string | Yes | 1–100 characters; letters (any language), spaces and `. , ' ( ) -` only |
| `days` | integer | Yes | 1–7 |
| `pace` | string | Yes | `relaxed`, `moderate` or `fast` |
| `interests` | string[] | Yes | 1–20 items, each up to 40 characters; letters, spaces and `& , ' -` only. Duplicates are removed |

### Pace Guidelines

- **Relaxed**: 1-2 activities per day
- **Moderate**: 2-3 activities per day
- **Fast**: 3-4 activities per day

### Responses

**`200 OK`**: a `text/event-stream` response:

| Message | Meaning |
|---------|---------|
| `data: <base64>` | A chunk of itinerary text, Base64-encoded UTF-8 |
| `event: complete` | Generation finished successfully |
| `event: error` followed by `data: {"error": "..."}` | Generation failed (e.g. OpenAI error) |

The decoded text has one paragraph per day, each starting with `Day N:`.

**`400 Bad Request`**: invalid input:
```json
{ "error": "days must be an integer between 1 and 7" }
```

**`429 Too Many Requests`**: rate limit exceeded (the `Retry-After` header gives the seconds until the limit resets), or this IP already has a generation in progress:
```json
{ "error": "Too many requests. Please try again later." }
```

**`503 Service Unavailable`**: the global daily limit (`DAILY_REQUEST_LIMIT`) has been reached:
```json
{ "error": "The planner has reached its daily limit. Please try again tomorrow." }
```

**`403 Forbidden`**: the client IP is in `BLOCKED_IPS`.

Every response from this endpoint includes `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset` headers.

### Example Frontend Usage

`EventSource` only supports GET requests, so use `fetch` and read the stream:

```javascript
const response = await fetch('http://localhost:8080/api/travel-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: 'Paris', days: 3, pace: 'moderate', interests: ['Art & Museums'] }),
});

if (!response.ok) {
    const { error } = await response.json(); // 400 or 429
    throw new Error(error);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
const base64ToUtf8 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
let buffer = '';
let text = '';
let isError = false;

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
        if (line.startsWith('event: error')) isError = true;
        if (!line.startsWith('data:')) continue;

        const data = line.slice(5).trim();
        if (!data) continue;
        if (isError) throw new Error(JSON.parse(data).error);

        text += base64ToUtf8(data);
        document.getElementById('output').textContent = text;
    }
}
```

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t ai-tourism-planner .

# Run the container
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=your_api_key \
  -e OPENAI_MODEL=gpt-6-luna \
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
      - OPENAI_MODEL=${OPENAI_MODEL:-gpt-6-luna}
      - CORS_ALLOWED_ORIGIN=${CORS_ALLOWED_ORIGIN}
      - PORT=8080
```

### Running behind a reverse proxy

If the server runs behind nginx or a load balancer, set `TRUST_PROXY=1`. Without it, every request appears to come from the proxy's IP, and all users share a single rate-limit bucket.

The server sends `X-Accel-Buffering: no`, so nginx streams responses instead of buffering them.

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Required | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-6-luna` | OpenAI model used for generation |
| `OPENAI_REASONING_EFFORT` | Not sent | Reasoning effort for reasoning models (e.g. `low`). Lower effort means fewer billed hidden reasoning tokens. Supported values depend on the model |
| `OPENAI_TEMPERATURE` | Not sent | Sampling temperature. Only for models that accept it: reasoning models reject custom values |
| `PORT` | `8080` | Server port |
| `CORS_ALLOWED_ORIGIN` | Required | Allowed CORS origin (your frontend URL) |
| `RATE_LIMIT_MAX` | `10` | Max requests per IP per window |
| `RATE_LIMIT_WINDOW_MS` | `3600000` (1 hour) | Rate limit window length in milliseconds |
| `TRUST_PROXY` | Not set | Set to `1` when behind one reverse proxy so client IPs are detected correctly. Don't set it if clients reach Node directly: they could fake their IP via `X-Forwarded-For` |
| `DAILY_REQUEST_LIMIT` | `300` | Max OpenAI calls per day across all users (resets 00:00 UTC) |
| `MAX_OUTPUT_TOKENS` | `5000` | Max tokens generated per request, including hidden reasoning tokens |
| `BLOCKED_IPS` | Not set | Comma-separated client IPs to reject with `403` |

### Example .env file

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-6-luna
# OPENAI_REASONING_EFFORT=low
PORT=8080
CORS_ALLOWED_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=3600000
DAILY_REQUEST_LIMIT=300
MAX_OUTPUT_TOKENS=5000
# BLOCKED_IPS=203.0.113.5
# TRUST_PROXY=1
```

## 🤖 Choosing a Model

The model is set with `OPENAI_MODEL`, so switching is a config change and a restart.

| Model | Price per 1M tokens (input / output) | When to use |
|-------|--------------------------------------|-------------|
| `gpt-6-luna` (default) | $0.10 / $0.50 | Cheapest current-generation model; good fit for short itineraries |
| `gpt-6.1-terra` | $1.00 / $5.00 | If `gpt-6-luna` output quality isn't good enough |

A typical itinerary uses roughly 1,000 input and 1,500–2,500 output tokens (including hidden reasoning), which is about $0.001 per plan with `gpt-6-luna`.

Prices are as of October 2026. OpenAI retires models regularly (for example `gpt-3.5-turbo`, `gpt-5-mini` and `gpt-5-nano`), so check the [deprecations page](https://developers.openai.com/api/docs/deprecations) before picking a model.

## 💰 Cost Protection

- **Daily cap**: `DAILY_REQUEST_LIMIT` limits OpenAI calls per day across all users, so it still holds when an abuser rotates IPs. With `gpt-6-luna`, 300 calls is roughly $0.30/day.
- **One generation per IP**: a second request from the same IP while one is streaming gets `429`.
- **Stop on disconnect**: if the client disconnects, the OpenAI stream is cancelled so you don't pay for unread tokens.
- **Output cap**: `MAX_OUTPUT_TOKENS` limits the cost of a single request.
- **Request logs**: every request writes a JSON line with time, IP, origin, user agent and outcome (`accepted`, `invalid`, `rate_limited`, `concurrent_rejected`, `daily_limit_reached`, `client_disconnected`). Use them to find abusers and add their IPs to `BLOCKED_IPS`.
- **Rate limiting**: in-memory, per IP, fixed window. Rejected requests also count toward the limit. Counts reset when the server restarts and aren't shared between instances; use a shared store such as Redis if you run several replicas.
- **Input validation**: invalid requests are rejected with `400` before any OpenAI call. Request bodies are capped at 10 KB.
- **Prompt structure**: fixed instructions are in the system prompt; the user message only contains the trip details.
- **Reasoning effort**: set `OPENAI_REASONING_EFFORT=low` to reduce hidden reasoning tokens on reasoning models.

## 🧪 Development

### Scripts

```bash
# Start the server
npm start

# Start with auto-reload (nodemon)
npm run dev

# Run tests (when implemented)
npm test

# Lint code (when implemented)
npm run lint
```

### Project Structure

```
ai-tourism-planner-server/
├── index.js             # Main server file
├── package.json         # Dependencies and scripts
├── Dockerfile           # Docker configuration
├── env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
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

- OpenAI for providing the API
- Express.js community for the excellent web framework
- All contributors who help improve this project

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/KirillSotnikov/ai-tourism-planner/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ for travelers and developers**
