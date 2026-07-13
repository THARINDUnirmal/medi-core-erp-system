"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const lowerEmail = email.toLowerCase().trim();

      if (lowerEmail === "admin@gmail.com" && password === "Admin") {
        router.push("/admin");
      } else if (lowerEmail === "patient@gmail.com" && password === "patient123") {
        router.push("/patient");
      } else if (lowerEmail === "appointment@gmail.com" && password === "appointment123") {
        router.push("/appointment");
      } else if (lowerEmail === "pharmacy@gmail.com" && password === "pharmacy123") {
        router.push("/pharmacy");
      } else if (lowerEmail === "financial@gmail.com" && password === "financial123") {
        router.push("/financial");
      } else {
        setError("Invalid email or password.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f3f4f6] p-4 lg:p-8">

      {/* Main Container Frame */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl min-h-[600px]">

        {/* LEFT PANEL: Clean Login Form */}
        <div className="flex w-full flex-col justify-between p-8 sm:p-12 lg:w-1/2">

          {/* Top Brand Area updated to Medi Core */}
          <div className="flex items-center gap-2">
            <Activity className="text-[#635bff]" size={24} />
            <span className="text-xl font-bold tracking-tight text-slate-900">Medi Core</span>
          </div>

          {/* Core Form Element Wrapper */}
          <div className="my-auto py-6 w-full max-w-[360px] mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-center">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-slate-400 text-center mb-8">
              Enter your corporate credentials to access your station terminal.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#635bff] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#635bff]/10 transition hover:bg-[#5249e0] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? "Connecting Terminal..." : "Log In"}
              </button>

            </form>
          </div>

          {/* Footer Area */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-4 border-t border-slate-50">
            <span>Copyright © 2026 Medi Core Systems Inc.</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
          </div>

        </div>

        {/* RIGHT PANEL: Vibrant purple panel showcasing mini app preview cards */}
        <div className="hidden w-1/2 flex-col justify-center bg-[#635bff] p-12 text-white lg:flex relative">

          <div className="max-w-sm mx-auto space-y-4 mb-8">
            <h2 className="text-3xl font-bold leading-tight tracking-tight">
              Effortlessly manage your team and operations.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Log in to access your dashboard metrics and track active medical cases.
            </p>
          </div>

          {/* Graphical Mockup Section */}
          <div className="w-full bg-slate-50 rounded-xl p-4 shadow-2xl scale-95 origin-top text-slate-800">

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#635bff] rounded-lg p-2.5 text-white">
                <div className="text-[9px] opacity-75">Total Revenue</div>
                <div className="text-sm font-bold mt-0.5">$189,374</div>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                <div className="text-[9px] text-slate-400">Avg Efficiency</div>
                <div className="text-sm font-bold mt-0.5">94.2%</div>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                <div className="text-[9px] text-slate-400">Active Admitted</div>
                <div className="text-sm font-bold mt-0.5 text-[#635bff]">142 Patients</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-slate-100 space-y-2">
              <div className="h-2 w-1/4 bg-slate-200 rounded" />
              <div className="space-y-1.5 pt-1">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-md bg-slate-100" />
                      <div className="h-1.5 w-16 bg-slate-300 rounded" />
                    </div>
                    <div className="h-1.5 w-8 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}