"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  reputation: number;
  badges: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ======================================================================
  // TODO 1: Fetch active user session details on page mount
  // ======================================================================
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        // Fetch "/api/auth/me" and parse response JSON
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">No active session found!</h2>
        <button onClick={() => router.push("/")} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm">
          Go Back Home
        </button>
      </div>
    );
  }

  // ======================================================================
  // TODO 2: Dynamically Calculate Developer Rank and Progress Bar Stats
  // ======================================================================
  // Let's calculate:
  // - rankName (string: "Bronze Contributor", "Silver Veteran", "Gold Master")
  // - nextRankName (string: "Silver Veteran", "Gold Master", or "Max Rank Reached")
  // - progressPercent (number: 0 to 100)
  // - xpNeeded (number: XP points remaining to unlock the next rank)
  
  let rankName = "Bronze Contributor";
  let nextRankName = "Silver Veteran";
  let progressPercent = 0;
  let xpNeeded = 0;

  const xp = user.reputation || 0;

  if (xp < 100) {
    rankName = "Bronze Contributor";
    nextRankName = "Silver Veteran";
    // Progress calculation: percentage of the way to 100
    progressPercent = Math.min(100, Math.round((xp / 100) * 100));
    xpNeeded = 100 - xp;
  } else if (xp >= 100 && xp < 300) {
    rankName = "Silver Veteran";
    nextRankName = "Gold Master";
    // Progress calculation: percentage of the way from 100 to 300 (range of 200)
    progressPercent = Math.min(100, Math.round(((xp - 100) / 200) * 100));
    xpNeeded = 300 - xp;
  } else {
    rankName = "Gold Master";
    nextRankName = "Max Rank Reached";
    progressPercent = 100;
    xpNeeded = 0;
  }

  // List of all badges in DevSpace
  const allBadges = [
    { id: "quiz-master", name: "Quiz Master", icon: "🎯", desc: "Score 80% or higher on any technical quiz challenge" },
    { id: "rising-star", name: "Rising Star", icon: "⭐", desc: "Gain upvotes on questions you publish" },
    { id: "code-ninja", name: "Code Ninja", icon: "🥷", desc: "Provide an accepted answer to a question thread" }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            DevSpace
          </span>
        </div>
      </header>

      {/* CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* PROFILE HERO CARD */}
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl mb-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-500/20">
            {user.username[0].toUpperCase()}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
              {user.username}
            </h1>
            <p className="text-sm text-zinc-500 font-medium mb-3">{user.email}</p>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
              {rankName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: STATS & PROGRESS */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-extrabold text-white">Developer Progress</h2>
            
            {/* XP Stats Card */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-850 rounded-2xl grid grid-cols-2 gap-4">
              <div className="border-r border-zinc-800 pr-4">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Total Reputation</span>
                <span className="text-3xl font-black text-white">{xp} <span className="text-sm text-indigo-400 font-bold">XP</span></span>
              </div>
              <div className="pl-4 flex flex-col justify-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Badge Count</span>
                <span className="text-2xl font-black text-white">{user.badges.length} / {allBadges.length}</span>
              </div>
            </div>

            {/* Rank Progress Bar Card */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rank Progress</span>
                {xpNeeded > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-semibold">
                    {xpNeeded} XP to {nextRankName}
                  </span>
                ) : (
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Max Rank Unlocked!</span>
                )}
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-3 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <span>{rankName}</span>
                <span>{nextRankName}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: BADGES GRIDS */}
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Earned Badges</h2>
            
            <div className="space-y-3">
              {allBadges.map((badge) => {
                const isUnlocked = user.badges.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 border rounded-2xl transition-all duration-300 relative overflow-hidden flex items-start gap-3.5 ${
                      isUnlocked 
                        ? "bg-zinc-900 border-indigo-500/30 shadow-md shadow-indigo-500/[0.02]" 
                        : "bg-zinc-950/40 border-zinc-900 opacity-60"
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl border ${
                      isUnlocked 
                        ? "bg-indigo-500/10 border-indigo-500/20 text-white" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-600"
                    }`}>
                      {isUnlocked ? badge.icon : "🔒"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold truncate ${isUnlocked ? "text-white" : "text-zinc-500"}`}>
                        {badge.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
