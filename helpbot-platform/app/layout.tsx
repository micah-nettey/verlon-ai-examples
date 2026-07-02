import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HelpBot Platform",
  description: "Shared agent platform - every user gets the same HelpBot agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-blue-600">HelpBot</a>
            <a href="/agents" className="text-sm text-gray-600 hover:text-gray-900">Agent Instances</a>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
