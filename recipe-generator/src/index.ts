import express, { Request, Response } from 'express';
import cors from 'cors';
import { verlon } from './lib/verlon.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'recipe-generator' });
});

app.post('/recipe', async (req: Request, res: Response) => {
  try {
    const { groceryList } = req.body;

    // Validate input
    if (!groceryList || !Array.isArray(groceryList) || groceryList.length === 0) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'groceryList must be a non-empty array of strings',
      });
      return;
    }

    const gateId = process.env.VERLON_GATE_ID;
    if (!gateId) {
      res.status(500).json({
        error: 'Configuration error',
        message: 'VERLON_GATE_ID environment variable is required',
      });
      return;
    }

    const startTime = Date.now();

    const result = await verlon.chat({
      gateId,
      data: {
        messages: [
          // {
          //   role: 'system',
          //   content: 'You are a creative chef assistant. Generate detailed, practical recipes based on available ingredients. Include preparation time, cooking time, difficulty level, and step-by-step instructions.',
          // },
          {
            role: 'user',
            content: `Generate a delicious recipe using these ingredients: ${groceryList.join(', ')}. The recipe should be practical, easy to follow, and make the best use of these ingredients.`,
          },
        ],
      },
    });

    const latency = Date.now() - startTime;

    res.json({
      recipe: result.content,
      metadata: {
        model: result.model,
        cost: result.cost,
        latency: `${latency}ms`,
        ingredients: groceryList,
      },
    });
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({
      error: 'Recipe generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🍳 Recipe Generator running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🥘 Recipe API: POST http://localhost:${PORT}/recipe`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});
