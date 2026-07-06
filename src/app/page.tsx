"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// TypeScript Interfaces for our State
interface UserProfile {
  _id: string;
  username: string;
  email: string;
  reputation: number;
  badges: string[];
  role?: 'user' | 'admin';
}

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    _id: string;
    username: string;
  };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
}

export default function Home() {
  const router = useRouter();

  // ======================================================================
  // Define states for:
  // - questions (type: Question[], initial: [])
  // - quizzes (type: Quiz[], initial: [])
  // - user (type: UserProfile | null, initial: null)
  // - loading (type: boolean, initial: true)
  // - showAskForm (type: boolean, initial: false)
  // Hint: const [questions, setQuestions] = useState<Question[]>([]);
  // ======================================================================
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAskForm, setShowAskForm] = useState<boolean>(false);
  

  // ======================================================================
  // Define states for:
  // - title (string, initial: "")
  // - content (string, initial: "")
  // - tagInput (string, initial: "")
  // - submitError (string, initial: "")
  // - submitSuccess (string, initial: "")
  // ======================================================================
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  

  // ======================================================================
  // Fetch Dashboard Data on Page Mount (useEffect)
  // ======================================================================
  // Write a useEffect hook that runs only ONCE when the component mounts.
  // Inside, fetch "/api/questions", "/api/quizzes", and "/api/auth/me" 
  // concurrently using Promise.all(), parse the JSONs, and set states.
  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Set loading state to true
        setLoading(true);
        // Fetch data
        // Hint: const [qRes, quizRes, userRes] = await Promise.all([ ... ]);
        const [qRes, quizRes, userRes] = await Promise.all([
          fetch("/api/questions", { cache: "no-store" }),
          fetch("/api/quizzes"),
          fetch("/api/auth/me"),
        ]);

        // Parse JSON responses
        const questionsData = await qRes.json();
        const quizzesData = await quizRes.json();
        const userData = await userRes.json();
        
        // Set states if responses are successful
        if (questionsData.success) setQuestions(questionsData.questions || []);
        if (quizzesData.success) setQuizzes(quizzesData.quizzes || []);
        if (userData.success) setUser(userData.user || null);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        // Set loading state to false
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []); // Run on mount

  // ======================================================================
  // Handle Question Submission (POST request)
  // ======================================================================
  const handleAskQuestion = async (e: React.FormEvent) => {
    // Prevent the default browser page reload behavior
    e.preventDefault();
    
    // Clear old errors and success messages
    setSubmitError("");
    setSubmitSuccess("");

    // Validation: Ensure title and content are provided
    if (!title || !content){
      setSubmitError("Please enter both tile & content");
      return;
    }

    // Parse tagInput comma-separated string into a trimmed array
    const tagsArray = tagInput
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    try {
      // Send POST request to "/api/questions" containing title, content, tags, and author (user._id)
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          content,
          tags: tagsArray,
          author: user?._id
        })
      });

      // If response is OK:
      // - Show success message
      // - Clear form fields (title, content, tagInput)
      // - Close the form panel (showAskForm = false)
      // - Refresh the questions list by fetching "/api/questions" again
      if (res.ok){
        setShowAskForm(false);
        setSubmitSuccess("Question/Announcement asked successfully!")
        setTitle("");
        setContent("");
        setTagInput("");
        // Dynamically award 10 XP to local user state so it updates in the sidebar instantly without reload
        setUser(prev => prev ? { ...prev, reputation: prev.reputation + 10 } : null);
        // Refresh the questions list
        const updatedRes = await fetch("/api/questions", { cache: "no-store" });
        const updatedData = await updatedRes.json();
        if (updatedData.success) setQuestions(updatedData.questions || []);
      }else{
        const error = await res.json();
        setSubmitError(error.error || "Failed to post question");
      }
    } catch (err: any) {
      // Set submit error message
      setSubmitError("Failed to post question");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /**
   * handleVote - Handles upvoting and downvoting on individual question cards in the feed.
   * 
   * @param e - React Mouse Event to capture user click details.
   * @param questionId - The target question ID in MongoDB.
   * @param voteType - Either 'upvote' or 'downvote'.
   */
  const handleVote = async (e: React.MouseEvent, questionId: string, voteType: 'upvote' | 'downvote') => {
    // 1. PREVENT EVENT BUBBLING (Propagation):
    // The entire question card has an onClick handler redirecting to '/questions/[id]'.
    // Calling e.stopPropagation() ensures that clicking the vote arrows registers the vote
    // without triggering the card's click event and redirecting the user!
    e.stopPropagation(); 

    // 2. SECURITY CHECK:
    // Ensure only logged-in users can participate in voting.
    if (!user) {
      alert("Please log in to vote!");
      return;
    }

    try {
      // 3. BACKEND API CALL:
      // Send a POST request to '/api/votes' carrying the target ID, vote action, and user ID.
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: 'question',
          targetId: questionId,
          userId: user._id,
          voteType
        })
      });

      const data = await res.json();
      
      // 4. IN-PLACE REACT STATE UPDATE:
      // If the database successfully updates the arrays, we update the state in-place.
      // We map through the existing questions array and replace the upvote/downvote lists
      // for the matching question. This avoids refreshing the page or refetching the whole list.
      if (res.ok && data.success) {
        setQuestions(prev => 
          prev.map(q => 
            q._id === questionId 
              ? { ...q, upvotes: data.upvotes, downvotes: data.downvotes } 
              : q
          )
        );
      } else {
        console.error(data.message || "Failed to register vote");
      }
    } catch (err) {
      console.error("Vote request failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* HEADER / NAVBAR */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
              D
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              DevSpace
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button 
                  onClick={() => setShowAskForm(!showAskForm)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 cursor-pointer"
                >
                  {showAskForm ? "Close Form" : (user && user.role === 'admin' ? "Ask a Question/Announcement" : "Ask a Question")}
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-850 text-zinc-300 hover:text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => router.push("/login")}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Log In
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ASK QUESTION PANEL */}
        {showAskForm && (
          <div className="mb-8 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold mb-4 text-white">Ask a Public {user && user.role === 'admin' ? "Question/Announcement" : "Question"}</h2>
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={user && user.role === 'admin' ? "e.g. Important Announcement: System Update" : "e.g. How to use Promise.all in TypeScript?"}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Description (Content)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder={user && user.role === 'admin' ? "Describe your question/announcement in detail..." : "Describe your question in detail..."}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="typescript, nextjs, react (comma separated)"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 text-white"
                />
              </div>

              {submitError && <p className="text-red-400 text-xs font-medium">{submitError}</p>}
              {submitSuccess && <p className="text-green-400 text-xs font-medium">{submitSuccess}</p>}

              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Publish {user && user.role === 'admin' ? "Question/Announcement" : "Question"}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: QUESTIONS LIST */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Explore {user && user.role === 'admin' ? "Questions/Announcements" : "Questions"}
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                {questions.length}
              </span>
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-32 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-2xl border-dashed">
                <p className="text-zinc-500 text-sm">No {user && user.role === 'admin' ? "questions/announcements" : "questions"} have been asked yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div 
                    key={q._id}
                    onClick={() => router.push(`/questions/${q._id}`)}
                    className="flex gap-4 p-5 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all duration-200 group relative hover:shadow-lg hover:shadow-indigo-500/[0.02] cursor-pointer"
                  >
                    {/* LEFT: VOTING COLUMN */}
                    <div className="flex flex-col items-center gap-2 pt-1.5 min-w-[3rem] border-r border-zinc-800/40 pr-3">
                      <button 
                        onClick={(e) => handleVote(e, q._id, 'upvote')}
                        className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-1 ${
                          q.upvotes?.includes(user?._id || '')
                            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        ▲ {(q.upvotes?.length || 0)}
                      </button>
                      <button 
                        onClick={(e) => handleVote(e, q._id, 'downvote')}
                        className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-1 ${
                          q.downvotes?.includes(user?._id || '')
                            ? "bg-red-600/20 text-red-400 border border-red-500/20"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        ▼ {(q.downvotes?.length || 0)}
                      </button>
                    </div>

                    {/* RIGHT: QUESTION CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="h-6 w-6 rounded-full bg-indigo-900/50 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center justify-center">
                          {q.author?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">{q.author?.username || "unknown"}</span>
                        <span className="text-zinc-600 text-xs">•</span>
                        <span className="text-xs text-zinc-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors duration-200 mb-2">
                        {q.title}
                      </h3>
                      
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                        {q.content}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {q.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <div className="space-y-6">
            
            {/* USER PROFILE CARD */}
            {user && (
              <div 
                onClick={() => router.push("/profile")}
                className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl relative overflow-hidden shadow-xl shadow-zinc-950/50 cursor-pointer transition-all duration-250"
              >
                <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl" />
                
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Your Profile</h3>
                
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-white shadow-lg text-lg">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white leading-tight">{user.username}</h4>
                    <span className="text-xs text-zinc-500">{user.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-850 pt-4">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">Reputation</span>
                    <span className="text-xl font-black text-indigo-400">{user.reputation} XP</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">Badges</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {user.badges.map((badge) => (
                        <span 
                          key={badge}
                          className="text-[9px] font-bold px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded uppercase tracking-wider"
                        >
                          🏆 {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden shadow-xl shadow-zinc-950/50">
                <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-sm font-bold text-white mb-2">Join the Community!</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Log in or create an account to ask questions, post replies, and attempt quizzes to earn badges and reputation ranks!
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => router.push("/login")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition duration-200 cursor-pointer text-center"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => router.push("/register")}
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs py-2.5 rounded-xl transition duration-200 cursor-pointer text-center"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}

            {/* QUIZZES CARD */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Active Challenges</h3>

              {loading ? (
                <div className="h-20 bg-zinc-950 border border-zinc-900 rounded-xl animate-pulse" />
              ) : quizzes.length === 0 ? (
                <div className="p-4 text-center bg-zinc-950/30 border border-zinc-850 rounded-xl">
                  <p className="text-zinc-600 text-xs">No active quizzes right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz._id}
                      className="p-4 bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-white">{quiz.title}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          quiz.difficulty === "easy" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          quiz.difficulty === "medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3 line-clamp-1">{quiz.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-indigo-400">+{quiz.xpReward} XP</span>
                        <button 
                          onClick={() => router.push(`/quiz/${quiz._id}`)}
                          className="text-[10px] font-bold text-white bg-zinc-800 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Start Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
