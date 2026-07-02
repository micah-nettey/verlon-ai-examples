// AgentForge Platform - Custom Agents per User
// Each user builds their own agents with different structures

export interface AgentStep {
  name: string;
  type: "llm" | "tool";
  purpose: string;
  model?: string; // only for llm type
}

export interface Agent {
  agentId: string;
  userId: string;
  name: string;
  description: string;
  steps: AgentStep[];
  createdAt: string;
  status: "active" | "inactive" | "draft";
  usage: {
    totalCalls: number;
    totalCost: number;
    lastActive: string;
    perStep: Record<string, { calls: number; cost: number }>;
  };
}

export interface User {
  userId: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
}

// Agent templates - different archetypes users might build
const agentTemplates: {
  name: string;
  description: string;
  steps: AgentStep[];
}[] = [
  // Simple: single LLM call
  {
    name: "Quick Q&A Bot",
    description: "Simple question-answering bot",
    steps: [
      { name: "responder", type: "llm", purpose: "Answers user questions directly", model: "gpt-4o-mini" },
    ],
  },
  {
    name: "Text Summarizer",
    description: "Summarizes long text input",
    steps: [
      { name: "summarizer", type: "llm", purpose: "Condenses text to key points", model: "claude-haiku" },
    ],
  },
  {
    name: "Code Explainer",
    description: "Explains code snippets in plain English",
    steps: [
      { name: "explainer", type: "llm", purpose: "Analyzes and explains code", model: "claude-sonnet-4-5" },
    ],
  },
  // Moderate: 2-3 LLM calls + tools
  {
    name: "Research Assistant",
    description: "Searches the web, analyzes results, and writes summaries",
    steps: [
      { name: "planner", type: "llm", purpose: "Breaks down research query into search terms", model: "gpt-4o" },
      { name: "web_search", type: "tool", purpose: "Searches the web for relevant results" },
      { name: "analyzer", type: "llm", purpose: "Evaluates search results for relevance and quality", model: "gpt-4o-mini" },
      { name: "writer", type: "llm", purpose: "Synthesizes findings into a coherent report", model: "claude-sonnet-4-5" },
    ],
  },
  {
    name: "Customer Email Drafter",
    description: "Drafts customer-facing emails based on context",
    steps: [
      { name: "fetch_history", type: "tool", purpose: "Retrieves customer interaction history" },
      { name: "sentiment_analyzer", type: "llm", purpose: "Analyzes customer sentiment from history", model: "gpt-4o-mini" },
      { name: "drafter", type: "llm", purpose: "Writes a personalized email draft", model: "claude-sonnet-4-5" },
    ],
  },
  {
    name: "Data Analyzer",
    description: "Analyzes CSV data and generates insights",
    steps: [
      { name: "parse_data", type: "tool", purpose: "Parses and validates CSV data" },
      { name: "analyzer", type: "llm", purpose: "Identifies patterns and anomalies", model: "gpt-4o" },
      { name: "chart_generator", type: "tool", purpose: "Creates visualizations from analysis" },
      { name: "narrator", type: "llm", purpose: "Writes human-readable insights", model: "claude-haiku" },
    ],
  },
  {
    name: "Content Moderator",
    description: "Reviews and moderates user-generated content",
    steps: [
      { name: "classifier", type: "llm", purpose: "Classifies content type and flags potential issues", model: "gpt-4o-mini" },
      { name: "policy_check", type: "tool", purpose: "Checks against content policy rules" },
      { name: "reviewer", type: "llm", purpose: "Makes final moderation decision with explanation", model: "claude-sonnet-4-5" },
    ],
  },
  // Complex: 4-5 LLM calls + tools
  {
    name: "Full-Stack Code Generator",
    description: "Generates full-stack code from natural language specs",
    steps: [
      { name: "architect", type: "llm", purpose: "Designs system architecture from requirements", model: "claude-sonnet-4-5" },
      { name: "schema_generator", type: "llm", purpose: "Generates database schema", model: "gpt-4o" },
      { name: "backend_coder", type: "llm", purpose: "Writes backend API code", model: "claude-sonnet-4-5" },
      { name: "frontend_coder", type: "llm", purpose: "Writes frontend components", model: "gpt-4o" },
      { name: "file_writer", type: "tool", purpose: "Writes generated code to files" },
      { name: "test_generator", type: "llm", purpose: "Generates test cases", model: "gpt-4o-mini" },
    ],
  },
  {
    name: "Multi-Language Translator",
    description: "Translates content across multiple languages with context awareness",
    steps: [
      { name: "language_detector", type: "llm", purpose: "Detects source language and context", model: "gpt-4o-mini" },
      { name: "context_extractor", type: "llm", purpose: "Extracts cultural and domain context", model: "gpt-4o" },
      { name: "translator", type: "llm", purpose: "Performs the core translation", model: "claude-sonnet-4-5" },
      { name: "quality_checker", type: "llm", purpose: "Reviews translation quality and suggests improvements", model: "gpt-4o" },
      { name: "format_output", type: "tool", purpose: "Formats output in requested format" },
    ],
  },
  {
    name: "Sales Intelligence Agent",
    description: "Researches prospects and generates personalized outreach",
    steps: [
      { name: "crm_lookup", type: "tool", purpose: "Fetches prospect data from CRM" },
      { name: "enricher", type: "llm", purpose: "Enriches prospect profile with web data", model: "gpt-4o-mini" },
      { name: "web_scrape", type: "tool", purpose: "Scrapes prospect's company website" },
      { name: "analyzer", type: "llm", purpose: "Identifies pain points and opportunities", model: "gpt-4o" },
      { name: "strategist", type: "llm", purpose: "Develops outreach strategy", model: "claude-sonnet-4-5" },
      { name: "copywriter", type: "llm", purpose: "Writes personalized outreach message", model: "claude-sonnet-4-5" },
      { name: "crm_update", type: "tool", purpose: "Updates CRM with outreach details" },
    ],
  },
  {
    name: "Document Processor",
    description: "Extracts, classifies, and summarizes documents",
    steps: [
      { name: "ocr_extract", type: "tool", purpose: "Extracts text from uploaded documents" },
      { name: "classifier", type: "llm", purpose: "Classifies document type", model: "gpt-4o-mini" },
      { name: "entity_extractor", type: "llm", purpose: "Extracts key entities and data points", model: "gpt-4o" },
      { name: "summarizer", type: "llm", purpose: "Creates structured summary", model: "claude-haiku" },
      { name: "db_store", type: "tool", purpose: "Stores extracted data in database" },
    ],
  },
  {
    name: "Meeting Assistant",
    description: "Transcribes, summarizes, and creates action items from meetings",
    steps: [
      { name: "transcriber", type: "tool", purpose: "Transcribes audio to text" },
      { name: "speaker_identifier", type: "llm", purpose: "Identifies and labels speakers", model: "gpt-4o-mini" },
      { name: "summarizer", type: "llm", purpose: "Creates meeting summary with key decisions", model: "claude-sonnet-4-5" },
      { name: "action_extractor", type: "llm", purpose: "Extracts action items and assigns owners", model: "gpt-4o" },
      { name: "calendar_sync", type: "tool", purpose: "Creates follow-up calendar events" },
      { name: "notifier", type: "tool", purpose: "Sends summary to attendees" },
    ],
  },
];

const firstNames = [
  "Alex", "Jordan", "Sam", "Casey", "Morgan", "Riley", "Quinn", "Avery",
  "Taylor", "Dakota", "Drew", "Finley", "Hayden", "Jamie", "Kai", "Lane",
  "Nico", "Parker", "Reese", "Sage", "Tatum", "Val", "Wren", "Yael",
  "Zion", "Blake", "Charlie", "Devon", "Ellis", "Frankie", "Gray", "Harper",
  "Indie", "Jules", "Kit", "Logan", "Marley", "Noel", "Oakley", "Peyton",
  "Remy", "Shay", "Toby", "Uma", "Vic", "Winter", "Xen", "Yuri", "Zara", "Ash",
];

const lastNames = [
  "Chen", "Patel", "Kim", "Santos", "Nguyen", "Mueller", "Okafor", "Singh",
  "Park", "Costa", "Ali", "Berg", "Cho", "Das", "Ek", "Fox",
  "Gao", "Hayes", "Ito", "Jain", "Kang", "Lin", "Ma", "Nash",
  "Oz", "Pike", "Qi", "Rao", "Sun", "Tan", "Uri", "Voss",
  "Wu", "Xu", "Yang", "Zhou", "Adler", "Bhat", "Cruz", "Diaz",
  "Ernst", "Fang", "Gill", "Holm", "Iyer", "Jung", "Kato", "Lam", "Mora", "Nair",
];

const models = ["gpt-4o", "gpt-4o-mini", "claude-sonnet-4-5", "claude-haiku", "gemini-pro", "gemini-flash"];

// Generate users
export const users: User[] = Array.from({ length: 50 }, (_, i) => {
  const daysAgo = Math.floor(Math.random() * 300 + 10);
  const plan: User["plan"] = i < 5 ? "enterprise" : i < 20 ? "pro" : "free";
  return {
    userId: `usr_${String(i + 1).padStart(3, "0")}`,
    name: `${firstNames[i]} ${lastNames[i]}`,
    email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
    plan,
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  };
});

// Generate agents - each user gets 1-4 agents
function generateAgentUsage(steps: AgentStep[]): Agent["usage"] {
  const baseCalls = Math.floor(Math.random() * 3000 + 100);
  const perStep: Record<string, { calls: number; cost: number }> = {};

  for (const step of steps) {
    const stepCalls = step.type === "llm"
      ? Math.floor(baseCalls * (0.5 + Math.random() * 0.5))
      : Math.floor(baseCalls * (0.3 + Math.random() * 0.7));

    const costPerCall = step.type === "tool" ? 0 :
      step.model?.includes("mini") || step.model?.includes("haiku") || step.model?.includes("flash") ? 0.0004 :
      step.model?.includes("sonnet") ? 0.005 :
      0.003;

    perStep[step.name] = {
      calls: stepCalls,
      cost: Number((stepCalls * costPerCall).toFixed(2)),
    };
  }

  const totalCalls = Object.values(perStep).reduce((s, v) => s + v.calls, 0);
  const totalCost = Object.values(perStep).reduce((s, v) => s + v.cost, 0);
  const daysAgo = Math.floor(Math.random() * 14);

  return {
    totalCalls,
    totalCost: Number(totalCost.toFixed(2)),
    lastActive: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    perStep,
  };
}

let agentCounter = 0;

export const agents: Agent[] = users.flatMap((user) => {
  const numAgents = user.plan === "enterprise" ? Math.floor(Math.random() * 3 + 2) :
    user.plan === "pro" ? Math.floor(Math.random() * 3 + 1) :
    Math.floor(Math.random() * 2 + 1);

  return Array.from({ length: numAgents }, () => {
    agentCounter++;
    const template = agentTemplates[agentCounter % agentTemplates.length];

    // Optionally randomize some models for variety
    const steps = template.steps.map((step) => {
      if (step.type === "tool") return { ...step };
      // 30% chance of swapping to a different model
      const model = Math.random() < 0.3
        ? models[Math.floor(Math.random() * models.length)]
        : step.model!;
      return { ...step, model };
    });

    const daysAgoCreated = Math.floor(Math.random() * 200 + 5);
    const statuses: Agent["status"][] = ["active", "active", "active", "inactive", "draft"];

    return {
      agentId: `agt_${String(agentCounter).padStart(3, "0")}`,
      userId: user.userId,
      name: `${template.name}${numAgents > 1 ? ` (${user.name.split(" ")[0]})` : ""}`,
      description: template.description,
      steps,
      createdAt: new Date(Date.now() - daysAgoCreated * 86400000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      usage: generateAgentUsage(steps),
    };
  });
});

// Helpers
export function getUser(id: string): User | undefined {
  return users.find((u) => u.userId === id);
}

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.agentId === id);
}

export function getUserAgents(userId: string): Agent[] {
  return agents.filter((a) => a.userId === userId);
}

export function getPlatformStats() {
  const totalCalls = agents.reduce((s, a) => s + a.usage.totalCalls, 0);
  const totalCost = agents.reduce((s, a) => s + a.usage.totalCost, 0);
  const activeAgents = agents.filter((a) => a.status === "active").length;

  const modelUsage: Record<string, number> = {};
  for (const agent of agents) {
    for (const step of agent.steps) {
      if (step.model) {
        modelUsage[step.model] = (modelUsage[step.model] || 0) + (agent.usage.perStep[step.name]?.calls || 0);
      }
    }
  }

  return {
    totalUsers: users.length,
    totalAgents: agents.length,
    activeAgents,
    totalCalls,
    totalCost: Number(totalCost.toFixed(2)),
    modelUsage,
  };
}
