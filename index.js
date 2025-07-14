const express = require('express');
const OpenAI = require('openai');

require('dotenv').config()

const app = express();
app.use(express.json());

const cors = require('cors');

app.use(cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    credentials: true
}));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
}

console.log('Using OpenAI GPT-3.5-turbo');

const systemPrompt = `You are a helpful travel assistant. Generate a daily itinerary for the traveler.`;

function buildPrompt({ location, days, pace, interests }) {
    return `Follow these rules:
- For "relaxed" pace, suggest 1–2 activities per day.
- For "moderate" pace, suggest 2–3 activities per day.
- For "fast" pace, suggest 3–4 activities per day.
- Group activities in the same neighborhood or along a logical route (e.g., moving from north to south). Avoid backtracking.
- Activities should match the listed interests (e.g. food, architecture, museums).
- Use this format with proper line breaks:
Day 1: [activities...]

Day 2: [activities...]


Example:
City: Paris
Days: 2
Pace: relaxed
Interests: museums, food

Output:
Day 1: Visit the Musée d'Orsay and have lunch at a cozy café by the Seine.

Day 2: Explore Notre-Dame Cathedral and enjoy French pastries at Pierre Hermé.

Now generate a plan for:
City: ${location}
Days: ${days}
Pace: ${pace}
Interests: ${interests.join(', ')}

Respond in English with each day on a new line and add a blank line between days for better readability.
  `.trim();
}

async function generateTravelPlan(params) {
    const prompt = buildPrompt(params);
    console.log('prompt', prompt);

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        const plainText = completion.choices[0].message.content.trim();
        return plainText.split('\n\n').map(line => line.trim());
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
}


app.post('/api/travel-plan', async (req, res) => {
    const params = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const prompt = buildPrompt(params);
        const stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            stream: true,
            temperature: 0.7
        });

        let accumulatedText = '';
        let lastChunkSent = '';

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                accumulatedText += content;

                // Only send the new content since last chunk
                const newContent = accumulatedText.substring(lastChunkSent.length);
                if (newContent.trim()) {
                    // Base64 encode to preserve all characters including spaces
                    const encodedContent = Buffer.from(newContent, 'utf8').toString('base64');
                    res.write(`data: ${encodedContent}\n\n`);
                    lastChunkSent = accumulatedText;
                }
            }
        }

        // Send final chunk with proper formatting
        const finalContent = accumulatedText.substring(lastChunkSent.length);
        if (finalContent.trim()) {
            // Base64 encode to preserve all characters including spaces
            const encodedContent = Buffer.from(finalContent, 'utf8').toString('base64');
            res.write(`data: ${encodedContent}\n\n`);
        }

        // Send completion signal as a special event
        res.write(`event: complete\ndata: \n\n`);
        res.end();

    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

const server = app.listen(process.env.PORT || 8080, '0.0.0.0', () => {
    console.log(`Travel Agent ready on port ${server.address().port}`);
});
