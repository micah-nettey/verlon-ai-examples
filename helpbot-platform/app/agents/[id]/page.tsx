import { getInstance, agentDefinition } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instance = getInstance(id);
  if (!instance) return notFound();

  return (
    <div>
      <a href="/agents" className="text-sm text-blue-600 hover:underline">&larr; All Instances</a>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold">{instance.userName}</h1>
        <p className="text-sm text-gray-500">
          {instance.instanceId} &middot; {instance.userEmail} &middot;{" "}
          <span className={instance.status === "active" ? "text-green-600" : "text-gray-400"}>
            {instance.status}
          </span>
        </p>
      </div>

      {/* Custom Config */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">Instance Config</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Custom Instructions</div>
            <div className="text-sm mt-1 bg-gray-50 rounded p-3">{instance.customInstructions}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Knowledge Base</div>
            <div className="text-sm mt-1 font-mono">{instance.knowledgeBase}</div>
            <div className="text-xs text-gray-400 mt-4">Created</div>
            <div className="text-sm mt-1">{new Date(instance.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Shared Agent Definition + Per-call-site Usage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-1">
          Agent: {agentDefinition.name} v{agentDefinition.version}
        </h2>
        <p className="text-xs text-gray-500 mb-4">{agentDefinition.description}</p>

        <div className="space-y-3">
          {agentDefinition.llmCalls.map((call) => {
            const usage = instance.usage.perCallSite[call.name as keyof typeof instance.usage.perCallSite];
            return (
              <div key={call.name} className="bg-gray-50 rounded p-4 flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-medium">{call.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{call.purpose}</div>
                  <div className="text-xs text-blue-600 mt-1">Model: {call.model}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium">{usage.calls.toLocaleString()} calls</div>
                  <div className="text-xs text-gray-500">${usage.cost.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Total Calls</div>
          <div className="text-xl font-bold mt-1">{instance.usage.totalCalls.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Total Cost</div>
          <div className="text-xl font-bold mt-1">${instance.usage.totalCost.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Last Active</div>
          <div className="text-xl font-bold mt-1">{new Date(instance.usage.lastActive).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
