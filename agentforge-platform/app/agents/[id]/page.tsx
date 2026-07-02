import { getAgent, getUser } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) return notFound();
  const user = getUser(agent.userId);

  return (
    <div>
      <a href="/agents" className="text-sm text-purple-600 hover:underline">&larr; All Agents</a>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold">{agent.name}</h1>
        <p className="text-sm text-gray-500">
          {agent.agentId} &middot; by{" "}
          <a href={`/users/${agent.userId}`} className="text-purple-600 hover:underline">{user?.name}</a>
          &middot;{" "}
          <span className={
            agent.status === "active" ? "text-green-600" :
            agent.status === "draft" ? "text-yellow-600" : "text-gray-400"
          }>
            {agent.status}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-2">{agent.description}</p>
      </div>

      {/* Steps / Pipeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
          Pipeline ({agent.steps.length} steps)
        </h2>
        <div className="space-y-3">
          {agent.steps.map((step, i) => {
            const usage = agent.usage.perStep[step.name];
            return (
              <div key={step.name} className="bg-gray-50 rounded p-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-mono">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium flex items-center gap-2">
                      {step.name}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        step.type === "llm" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {step.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{step.purpose}</div>
                    {step.model && (
                      <div className="text-xs text-purple-600 mt-1">Model: {step.model}</div>
                    )}
                  </div>
                </div>
                {usage && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-mono font-medium">{usage.calls.toLocaleString()} calls</div>
                    <div className="text-xs text-gray-500">${usage.cost.toFixed(2)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Total Calls</div>
          <div className="text-xl font-bold mt-1">{agent.usage.totalCalls.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Total Cost</div>
          <div className="text-xl font-bold mt-1">${agent.usage.totalCost.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Last Active</div>
          <div className="text-xl font-bold mt-1">{new Date(agent.usage.lastActive).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
