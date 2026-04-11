import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serving static files from the root directory
// NOTE: If your HTML files are in a folder named 'public', change __dirname to path.join(__dirname, 'public')
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Safety check for production: Ensure API key exists
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: API Key missing.' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', 
        messages: messages,
        temperature: 0.1,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error Details:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Groq API Error' 
      });
    }

    res.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('Server Internal Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

// IMPORTANT: Listen on 0.0.0.0 for external access on hosting platforms
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 MathAssist server is running!`);
  console.log(`🔗 Port: ${PORT}`);
  console.log(`📦 Model: llama-3.1-8b-instant\n`);
});