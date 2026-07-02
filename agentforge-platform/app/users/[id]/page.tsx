import { getUser, getUserAgents } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUser(id);
  if (!user) return notFound();
  const userAgents = getUserAgents(user.userId);
  const totalCost = userAgents.reduce((s, a) => s + a.usage.totalCost, 0);
  const totalCalls = userAgents.reduce((s, a) => s + a.usage.totalCalls, 0);

  return (
    <div>
      <a href="/users" className="text-sm text-purple-600 hover:underline">&larr; All Users</a>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-sm text-gray-500">
          {user.email} &middot;{" "}
          <span className={`${
            user.plan === "enterprise" ? "text-purple-600" :
            user.plan === "pro" ? "text-blue-600" : "text-gray-500"
          }`}>
            {user.plan}
          </span>
          &middot; joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Agents</div>
          <div className="text-xl font-bold mt-1">{userAgents.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Total Calls</div>
          <div className="text-xl font-bold mt-1">{totalCalls.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase">Total Cost</div>
          <div className="text-xl font-bold mt-1">${totalCost.toFixed(2)}</div>
        </div>
      </div>

      {/* User's Agents */}
      <h2 className="text-lg font-semibold mb-4">Agents</h2>
      <div className="space-y-4">
        {userAgents.map((agent) => {
          const llmSteps = agent.steps.filter((s) => s.type === "llm");
          const models = [...new Set(llmSteps.map((s) => s.model!))];
          return (
            <div key={agent.agentId} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <a href={`/agents/${agent.agentId}`} className="text-purple-600 hover:underline font-medium">
                    {agent.name}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                  <div className="flex gap-1 mt-2">
                    {models.map((m) => (
                      <span key={m} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    agent.status === "active" ? "bg-green-100 text-green-700" :
                    agent.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {agent.status}
                  </span>
                  <div className="text-sm font-mono mt-2">{agent.usage.totalCalls.toLocaleString()} calls</div>
                  <div className="text-xs text-gray-500">${agent.usage.totalCost.toFixed(2)}</div>
                </div>
              </div>

              {/* Steps preview */}
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {agent.steps.map((step) => (
                  <span key={step.name} className={`text-xs px-2 py-1 rounded ${
                    step.type === "llm" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                  }`}>
                    {step.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
