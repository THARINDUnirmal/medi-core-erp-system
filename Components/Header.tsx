import { Activity, LogOut } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
        <span className="text-lg font-bold text-gray-900">Medi Core</span>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
          Financial Terminal
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Terminal Operational</span>
        <div className="h-5 w-px bg-gray-200" />
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </header>
  );
}