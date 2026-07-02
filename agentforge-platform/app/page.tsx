import { getPlatformStats } from "@/lib/mock-data";

export default function Home() {
  const stats = getPlatformStats();

  const sortedModels = Object.entries(stats.modelUsage)
    .sort(([, a], [, b]) => b - a);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Platform Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Each user builds their own agents &mdash; different structures, models, and configurations.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Agents" value={stats.totalAgents} />
        <StatCard label="Active Agents" value={stats.activeAgents} />
        <StatCard label="Total LLM Calls" value={stats.totalCalls.toLocaleString()} />
        <StatCard label="Total Cost" value={`$${stats.totalCost.toLocaleString()}`} />
      </div>

      {/* Model Usage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">Model Usage (by call volume)</h2>
        <div className="space-y-3">
          {sortedModels.map(([model, calls]) => {
            const pct = (calls / stats.totalCalls) * 100;
            return (
              <div key={model}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-mono">{model}</span>
                  <span className="text-gray-500">{calls.toLocaleString()} calls ({pct.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <a href="/agents" className="text-purple-600 text-sm hover:underline">View all agents &rarr;</a>
        <a href="/users" className="text-purple-600 text-sm hover:underline">View all users &rarr;</a>
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
