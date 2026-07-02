import { users, getUserAgents } from "@/lib/mock-data";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Users</h1>
      <p className="text-gray-500 text-sm mb-6">{users.length} users on the platform</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Plan</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Agents</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Total Calls</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Total Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const userAgents = getUserAgents(user.userId);
              const totalCalls = userAgents.reduce((s, a) => s + a.usage.totalCalls, 0);
              const totalCost = userAgents.reduce((s, a) => s + a.usage.totalCost, 0);
              return (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a href={`/users/${user.userId}`} className="text-purple-600 hover:underline font-medium">
                      {user.name}
                    </a>
                    <div className="text-xs text-gray-400">{user.userId}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.plan === "enterprise" ? "bg-purple-100 text-purple-700" :
                      user.plan === "pro" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">{userAgents.length}</td>
                  <td className="px-4 py-3 text-right font-mono">{totalCalls.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">${totalCost.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
