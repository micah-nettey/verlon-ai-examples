import { getPlatformStats } from "@/lib/mock-data";

export default function Home() {
  const stats = getPlatformStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Platform Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Every user gets the same HelpBot agent &mdash; one agent definition, many instances.
      </p>

      {/* Agent Definition Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-1">{stats.agentDefinition.name}</h2>
        <p className="text-sm text-gray-500 mb-4">{stats.agentDefinition.description}</p>
        <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">LLM Call Sites</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.agentDefinition.llmCalls.map((call) => (
            <div key={call.name} className="bg-gray-50 rounded p-3">
              <div className="font-mono text-sm font-medium">{call.name}</div>
              <div className="text-xs text-gray-500 mt-1">{call.purpose}</div>
              <div className="text-xs text-blue-600 mt-2">Model: {call.model}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Active Users" value={stats.activeUsers} />
        <StatCard label="Total LLM Calls" value={stats.totalCalls.toLocaleString()} />
        <StatCard label="Total Cost" value={`$${stats.totalCost.toLocaleString()}`} />
      </div>

      <div className="text-center">
        <a href="/agents" className="text-blue-600 text-sm hover:underline">
          View all agent instances &rarr;
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs text-gray-400 uppercase">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
