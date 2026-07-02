// HelpBot Platform - Shared Agent, Multiple Instances
// Every user gets the same agent structure, just different configs

export interface LLMCallSite {
  name: string;
  purpose: string;
  model: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  llmCalls: LLMCallSite[];
}

export interface AgentInstance {
  instanceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  agentDefinitionId: string;
  customInstructions: string;
  knowledgeBase: string;
  createdAt: string;
  status: "active" | "inactive";
  usage: {
    totalCalls: number;
    totalCost: number;
    lastActive: string;
    perCallSite: {
      orchestrator: { calls: number; cost: number };
      search_processor: { calls: number; cost: number };
      responder: { calls: number; cost: number };
    };
  };
}

// The ONE shared agent definition that all users get
export const agentDefinition: AgentDefinition = {
  id: "helpbot-v1",
  name: "HelpBot",
  description:
    "Customer support assistant with knowledge search and intelligent response generation",
  version: "1.0.0",
  llmCalls: [
    {
      name: "orchestrator",
      purpose:
        "Analyzes user message, decides intent: route to search, give direct answer, or escalate to human",
      model: "claude-sonnet-4-5",
    },
    {
      name: "search_processor",
      purpose:
        "Takes raw search results from knowledge base and extracts the most relevant information",
      model: "gpt-4o-mini",
    },
    {
      name: "responder",
      purpose:
        "Generates the final user-facing response using extracted context and conversation history",
      model: "claude-sonnet-4-5",
    },
  ],
};

// Helper to generate realistic usage data
function generateUsage(tier: "heavy" | "medium" | "light") {
  const multiplier = tier === "heavy" ? 1 : tier === "medium" ? 0.4 : 0.1;
  const base = Math.floor(Math.random() * 5000 + 2000);
  const orchestratorCalls = Math.floor(base * multiplier);
  const searchCalls = Math.floor(orchestratorCalls * 0.7); // not all intents need search
  const responderCalls = Math.floor(orchestratorCalls * 0.95); // almost all get a response

  const orchestratorCost = orchestratorCalls * 0.003;
  const searchCost = searchCalls * 0.0004;
  const responderCost = responderCalls * 0.005;

  const daysAgo = tier === "heavy" ? 0 : tier === "medium" ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 14 + 3);
  const lastActive = new Date(Date.now() - daysAgo * 86400000).toISOString();

  return {
    totalCalls: orchestratorCalls + searchCalls + responderCalls,
    totalCost: Number((orchestratorCost + searchCost + responderCost).toFixed(2)),
    lastActive,
    perCallSite: {
      orchestrator: {
        calls: orchestratorCalls,
        cost: Number(orchestratorCost.toFixed(2)),
      },
      search_processor: {
        calls: searchCalls,
        cost: Number(searchCost.toFixed(2)),
      },
      responder: {
        calls: responderCalls,
        cost: Number(responderCost.toFixed(2)),
      },
    },
  };
}

const companies = [
  "Acme Corp", "TechFlow", "DataSync", "CloudPeak", "NexGen", "Vortex Labs",
  "Pinnacle", "BlueShift", "CoreStack", "Elevate", "FusionIO", "GridPoint",
  "HyperLoop", "InnoTech", "JetStream", "KeyStone", "LuminAI", "MetaCore",
  "NovaEdge", "OmniStack", "PrismTech", "Quantum", "RapidOps", "SkyNet",
  "TrueNorth", "UniCore", "VectorAI", "WaveForm", "XeroTech", "ZenithAI",
];

const knowledgeBases = [
  "product-docs", "api-reference", "troubleshooting-guide", "billing-faq",
  "onboarding-guide", "security-docs", "compliance-docs", "partner-docs",
  "developer-guide", "admin-manual",
];

const instructions = [
  "You are a helpful support agent for {company}. Be concise and professional.",
  "Help {company} customers with technical issues. Always suggest checking docs first.",
  "You assist {company} users. Be friendly and patient. Escalate billing issues to humans.",
  "Support agent for {company}. Focus on quick resolution. Use knowledge base extensively.",
  "You are {company}'s AI assistant. Be empathetic. Never share internal information.",
];

// Generate 100 user instances
export const instances: AgentInstance[] = Array.from({ length: 100 }, (_, i) => {
  const company = companies[i % companies.length];
  const tier: "heavy" | "medium" | "light" =
    i < 15 ? "heavy" : i < 50 ? "medium" : "light";
  const instruction = instructions[i % instructions.length].replace("{company}", company);
  const daysAgoCreated = Math.floor(Math.random() * 180 + 10);

  return {
    instanceId: `inst_${String(i + 1).padStart(3, "0")}`,
    userId: `usr_${String(i + 1).padStart(3, "0")}`,
    userName: `${company} Support`,
    userEmail: `support@${company.toLowerCase().replace(/\s+/g, "")}.com`,
    agentDefinitionId: "helpbot-v1",
    customInstructions: instruction,
    knowledgeBase: knowledgeBases[i % knowledgeBases.length],
    createdAt: new Date(Date.now() - daysAgoCreated * 86400000).toISOString(),
    status: i < 85 ? "active" : "inactive",
    usage: generateUsage(tier),
  };
});

// Aggregate stats
export function getPlatformStats() {
  const totalCalls = instances.reduce((sum, i) => sum + i.usage.totalCalls, 0);
  const totalCost = instances.reduce((sum, i) => sum + i.usage.totalCost, 0);
  const activeCount = instances.filter((i) => i.status === "active").length;

  return {
    totalUsers: instances.length,
    activeUsers: activeCount,
    totalAgentInstances: instances.length, // 1:1 with users in this model
    totalCalls,
    totalCost: Number(totalCost.toFixed(2)),
    agentDefinition,
  };
}

export function getInstance(id: string): AgentInstance | undefined {
  return instances.find((i) => i.instanceId === id);
}
