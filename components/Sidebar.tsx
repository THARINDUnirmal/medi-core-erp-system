"use client";
import useRouter from "next/navigation";
import { LogOut, Activity, User, Calendar, Pill, DollarSign, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
    roleName: string;
    currentTab: string;
}

export default function Sidebar({ roleName, currentTab }: SidebarProps) {
    const router = require("next/navigation").useRouter();

    const handleLogout = () => {
        router.push("/");
    };

    return (
        <div className="w-full bg-white/80 border-b border-gray-100 px-8 py-4 backdrop-blur-md shadow-sm flex items-center justify-between">
            {/* Brand & Dynamic Role Indicator */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635bff] text-white">
                        <Activity size={18} />
                    </div>
                    <span className="text-lg font-bold text-gray-800">CareOps</span>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider bg-[#635bff]/10 text-[#635bff] px-2.5 py-1 rounded-full">
                    {roleName} Panel
                </span>
            </div>

            {/* Simulated Nav Links reminiscent of the image tabs */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <span className={`px-4 py-2 rounded-lg ${currentTab === 'dashboard' ? 'bg-[#635bff]/10 text-[#635bff]' : ''}`}>
                    Overview Dashboard
                </span>
            </div>

            {/* Logout Action */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
                <LogOut size={16} />
                Log Out
            </button>
        </div>
    );
}