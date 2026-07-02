import { instances } from "@/lib/mock-data";

export default function AgentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Agent Instances</h1>
      <p className="text-gray-500 text-sm mb-6">
        {instances.length} instances of HelpBot across all users
      </p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Instance</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Knowledge Base</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Total Calls</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Cost</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {instances.map((inst) => (
              <tr key={inst.instanceId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/agents/${inst.instanceId}`} className="text-blue-600 hover:underline font-mono text-xs">
                    {inst.instanceId}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{inst.userName}</div>
                  <div className="text-xs text-gray-400">{inst.userEmail}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{inst.knowledgeBase}</td>
                <td className="px-4 py-3 text-right font-mono">{inst.usage.totalCalls.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono">${inst.usage.totalCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    inst.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {inst.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">
                  {new Date(inst.usage.lastActive).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
