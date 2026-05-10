/**
 * 30 hand-written research scenarios for volume generation.
 *
 * Mix:
 *    8 pure-quick (factual general knowledge — orchestrator should
 *      route to research-quick-answer)
 *   12 pure-search (time-sensitive — should route to research-searcher
 *      and run the Brave loop)
 *   10 mixed (start factual, escalate to time-sensitive — exercises
 *      cross-sub-gate routing within one session)
 *
 * Each turn is a self-contained question — the research agent does
 * not currently thread conversation history through the orchestrator.
 * Variety in topics + recency cues is what gives Cortex signal to
 * cluster on.
 */
export interface ResearchScenario {
  name: string;
  turns: string[];
}

export const RESEARCH_SCENARIOS: ResearchScenario[] = [
  // ─── Pure quick (8) ───────────────────────────────────────────────
  {
    name: 'geography basics',
    turns: [
      "What's the capital of Mongolia?",
      'What country has the largest land area?',
    ],
  },
  {
    name: 'physics constants',
    turns: [
      'How fast does light travel in a vacuum?',
      "What's Avogadro's number?",
    ],
  },
  {
    name: 'world-war timeline',
    turns: [
      'When did World War II officially end?',
      'Who was the first president of the United States?',
    ],
  },
  {
    name: 'classic literature',
    turns: [
      'Who wrote Hamlet?',
      'In what year was the first iPhone released?',
    ],
  },
  {
    name: 'protocol acronyms',
    turns: [
      "What does 'JSON' stand for?",
      "What's the practical difference between TCP and UDP?",
    ],
  },
  {
    name: 'unit conversions',
    turns: [
      'How many feet are in a mile?',
      "What's 100 degrees Fahrenheit in Celsius?",
    ],
  },
  {
    name: 'famous founders',
    turns: ['Who painted the Mona Lisa?', 'Who founded Apple?'],
  },
  {
    name: 'languages of the world',
    turns: [
      'What language is spoken in Brazil?',
      'How many official languages does India recognize?',
    ],
  },

  // ─── Pure search (12) ─────────────────────────────────────────────
  {
    name: 'anthropic news this week',
    turns: [
      'What did Anthropic announce in the past week?',
      'Have they released Claude 5 yet, or is Claude 4 still the latest?',
    ],
  },
  {
    name: 'openai news this week',
    turns: [
      'What did OpenAI announce in the past week?',
      'Any updates on GPT-5 — has there been an announced release date?',
    ],
  },
  {
    name: 'deepmind recent',
    turns: [
      "What's new from Google DeepMind in the past month?",
      'Did they release a new Gemini variant recently?',
    ],
  },
  {
    name: 'mistral release',
    turns: ["What's the most recent Mistral model release?"],
  },
  {
    name: 'apple iphone fall',
    turns: [
      'Did Apple release a new iPhone this fall?',
      "What's notable about the latest model — anything significant on the camera or battery side?",
    ],
  },
  {
    name: 'sp500 weekly',
    turns: ['How is the S&P 500 doing this week — up or down for the week?'],
  },
  {
    name: 'nba most recent champion',
    turns: ['Who won the most recent NBA championship?'],
  },
  {
    name: 'nfl season schedule',
    turns: [
      'When does the current NFL season start?',
      'Who are the teams considered favorites this year?',
    ],
  },
  {
    name: 'mongolia politics recent',
    turns: ["What's been happening politically in Mongolia recently?"],
  },
  {
    name: 'eu ai regulation',
    turns: [
      "What's the latest from the EU on AI regulation? I'm specifically interested in updates to the AI Act in the past few months.",
    ],
  },
  {
    name: 'bitcoin price',
    turns: ["What's the current price of Bitcoin in USD?"],
  },
  {
    name: 'spacex recent launches',
    turns: ['Has SpaceX done any notable launches in the past month?'],
  },

  // ─── Mixed (10) — quick → search escalation ───────────────────────
  {
    name: 'tokyo from facts to news',
    turns: [
      "What's the capital of Japan?",
      "What's Tokyo's current population, roughly?",
      'Any major news from Tokyo in the past few weeks?',
    ],
  },
  {
    name: 'tesla founder to stock',
    turns: ['Who founded Tesla?', "What's Tesla's current stock price?"],
  },
  {
    name: 'mongolia full profile',
    turns: [
      "What's the capital of Mongolia?",
      "What's the current population of Mongolia, roughly?",
      'What recent political events have happened in Mongolia in the past month?',
    ],
  },
  {
    name: 'anthropic from history to news',
    turns: [
      'When was Anthropic founded?',
      'What did Anthropic announce most recently?',
    ],
  },
  {
    name: 'oceans facts to news',
    turns: [
      "What's the deepest part of the ocean?",
      'Has there been any notable deep-sea exploration news recently?',
    ],
  },
  {
    name: 'boxing past to present',
    turns: [
      'Who currently holds the heavyweight boxing championship?',
      'Who held that title five years ago?',
    ],
  },
  {
    name: 'sahara facts to climate news',
    turns: [
      "What's the largest desert on Earth?",
      'Has there been any notable climate news related to the Sahara in the past year?',
    ],
  },
  {
    name: 'transformers concept to news',
    turns: [
      'In machine learning, what is a transformer?',
      'What new transformer-architecture research has been announced recently?',
    ],
  },
  {
    name: 'sound speed concept to news',
    turns: [
      "What's the speed of sound at sea level?",
      'Has any notable supersonic / hypersonic record been broken in the past year?',
    ],
  },
  {
    name: 'react history to current',
    turns: [
      'What is React (the JavaScript framework)?',
      "What's the latest stable React version released?",
    ],
  },
];
