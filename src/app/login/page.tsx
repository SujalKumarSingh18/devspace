"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // 1. React States for Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================================
  // TODO 1: Handle User Login (POST to /api/auth/login)
  // ======================================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // A. Validation: Ensure both fields are filled
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      // B. Send POST request to "/api/auth/login" containing:
      // - email and password in the body.
      // - Headers: Content-Type application/json
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      // C. Parse the response JSON
      const data = await response.json();

      // D. If response is successful (res.ok):
      // - Set success message to "Login successful! Redirecting..."
      // - Wait 2 seconds (using setTimeout) and redirect user to dashboard "/" using router.push
      if (response.ok) {
        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // E. If response fails:
        // - Set error state with the message returned from server
        setError(data.error || "Login failed. Please check credentials.");
      }

    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glowing background circle */}
        <div className="absolute -top-24 -left-24 h-48 w-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center font-black text-xl text-white mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            D
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-medium">Log into your DevSpace developer account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jack@example.com"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200 text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200 text-white"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
          {success && <p className="text-green-400 text-xs font-semibold">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg cursor-pointer ${
              loading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/10"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-zinc-500">
            Don't have an account yet?{" "}
            <button 
              onClick={() => router.push("/register")}
              className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
