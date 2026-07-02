import { agents, users } from "@/lib/mock-data";

export default function AgentsPage() {
  const userMap = Object.fromEntries(users.map((u) => [u.userId, u]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">All Agents</h1>
      <p className="text-gray-500 text-sm mb-6">{agents.length} agents across {users.length} users</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Agent</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Owner</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Steps</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">LLM Calls</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Models</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Cost</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((agent) => {
              const user = userMap[agent.userId];
              const llmSteps = agent.steps.filter((s) => s.type === "llm");
              const models = [...new Set(llmSteps.map((s) => s.model!))];
              return (
                <tr key={agent.agentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a href={`/agents/${agent.agentId}`} className="text-purple-600 hover:underline font-medium">
                      {agent.name}
                    </a>
                    <div className="text-xs text-gray-400">{agent.agentId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/users/${agent.userId}`} className="text-gray-700 hover:underline">
                      {user?.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">{agent.steps.length}</td>
                  <td className="px-4 py-3 text-center font-mono">{llmSteps.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {models.map((m) => (
                        <span key={m} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">${agent.usage.totalCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      agent.status === "active" ? "bg-green-100 text-green-700" :
                      agent.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
