import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentForge Platform",
  description: "Custom agent platform - users build their own agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-purple-600">AgentForge</a>
            <a href="/agents" className="text-sm text-gray-600 hover:text-gray-900">Agents</a>
            <a href="/users" className="text-sm text-gray-600 hover:text-gray-900">Users</a>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
