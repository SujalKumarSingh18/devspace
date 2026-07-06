"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Interfaces
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

interface Answer {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
}

interface UserProfile {
  _id: string;
  username: string;
  role?: 'user' | 'admin';
  reputation?: number;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  // 1. React States for Data
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Answer Form State
  const [answerContent, setAnswerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // ======================================================================
  // TODO 1: Fetch Question, its Answers, and User session on page mount
  // ======================================================================
  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);
        // Fetch:
        // A. "/api/questions/[id]" (fetches the question details)
        // B. "/api/answers?questionId=[id]" (fetches all answers for this question)
        // C. "/api/auth/me" (fetches current user session details)
        const [qRes, answersRes, userRes] = await Promise.all([
          fetch(`/api/questions/${questionId}`),
          fetch(`/api/answers?questionId=${questionId}`),
          fetch("/api/auth/me")
        ]);

        const qData = await qRes.json();
        const aData = await answersRes.json();
        const uData = await userRes.json();

        // Update states if responses are successful
        if (qData.success) {
          setQuestion(qData.question);
        }
        if (aData.success) {
          setAnswers(aData.answers);
        }
        if (uData.success) {
          setUser(uData.user);
        }

      } catch (err) {
        console.error("Error loading page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPageData();
  }, [questionId]);

  // ======================================================================
  // TODO 2: Handle Answer Submission (POST to /api/answers)
  // ======================================================================
  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!answerContent.trim()) {
      setSubmitError("Answer content cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      
      // A. Send POST request to "/api/answers" containing:
      // - content (answerContent)
      // - question (questionId)
      // - author (user._id)
      const response = await fetch("/api/answers", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          content: answerContent,
          question: questionId,
          author: user?._id,
        }),
        credentials: 'include',
      })
      
      const data = await response.json();
      
      
      // B. If response is OK:
      // - Clear the answerContent state
      // - Show a success message
      // - Fetch the answers list again from "/api/answers?questionId=[id]" to update the UI
      if (response.ok){
        setAnswerContent("");
        setSubmitSuccess("Answer posted successfully!");
        // Update user state reputation locally (+20 XP for posting answer)
        setUser(prev => prev ? { ...prev, reputation: (prev.reputation || 0) + 20 } : null);
        
        // Re-fetch the answers to update the list
        const answersRes = await fetch(`/api/answers?questionId=${questionId}`);
        const answersData = await answersRes.json();
        
        if (answersData.success) {
          setAnswers(answersData.answers);
        }
        
        // Hide success message after a few seconds
        setTimeout(() => setSubmitSuccess(""), 3000);
      } else {
        setSubmitError(data.error || "Failed to post answer.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (targetType: 'question' | 'answer', targetId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      alert("Please log in to vote on posts!");
      return;
    }

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          userId: user._id,
          voteType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // ======================================================================
        // TODO: Update React states locally using state setters (setQuestion / setAnswers)
        // ======================================================================
        // Hint for question:
        //    setQuestion(prev => prev ? { ...prev, upvotes: data.upvotes, downvotes: data.downvotes } : null);
        // Hint for answer:
        //    setAnswers(prev => prev.map(ans => ans._id === targetId ? { ...ans, upvotes: data.upvotes, downvotes: data.downvotes } : ans));
        if (targetType === 'question'){
          setQuestion(prev => prev ? { ...prev, upvotes: data.upvotes, downvotes: data.downvotes } : null);
        } else {
          setAnswers(prev => prev.map(ans => ans._id === targetId ? { ...ans, upvotes: data.upvotes, downvotes: data.downvotes } : ans));
        }

      } else {
        console.error(data.message || "Failed to submit vote");
      }
    } catch (err) {
      console.error("Voting error:", err);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm("Are you sure you want to delete this question? This will also delete all of its answers!")) return;
    try {
      // ======================================================================
      // TODO: Call DELETE /api/questions/[questionId] and route home on success
      // ======================================================================
      // 1. Fetch `/api/questions/${questionId}` with method "DELETE"
      // 2. If response is ok: alert success and redirect home (router.push("/"))
      // 3. Else: alert error message
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (response.ok){
        alert(data.message || "Question deleted successfully!");
        router.push("/");
      }
      else{
        alert(data.message || data.error || "Failed to delete question");
      }
      
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Are you sure you want to delete this answer?")) return;
    try {
      // ======================================================================
      // TODO: Call DELETE /api/answers/[answerId] and filter answers list state
      // ======================================================================
      // 1. Fetch `/api/answers/${answerId}` with method "DELETE"
      // 2. If response is ok: setAnswers(prev => prev.filter(ans => ans._id !== answerId))
      // 3. Else: alert error message
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok){
        setAnswers(prev => prev.filter(ans => ans._id !== answerId));
      }
      else{
        alert(data.message || data.error || "Failed to delete answer");
      }
      
    } catch (err) {
      console.error("Failed to delete answer:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">Question not found!</h2>
        <button onClick={() => router.push("/")} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm">
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold transition cursor-pointer"
          >
            ← Back to Feed
          </button>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            DevSpace
          </span>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* QUESTION DETAIL CARD */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-indigo-900/50 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center justify-center">
              {question.author?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <span className="text-xs text-zinc-400 font-medium">{question.author?.username || "unknown"}</span>
            <span className="text-zinc-700 text-xs">•</span>
            <span className="text-xs text-zinc-500">{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-snug">
            {question.title}
          </h1>

          <p className="text-sm md:text-base text-zinc-300 whitespace-pre-wrap leading-relaxed mb-6">
            {question.content}
          </p>

          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Voting Row */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/50">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 gap-1">
              <button 
                onClick={() => handleVote('question', question._id, 'upvote')}
                className={`p-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  question.upvotes?.includes(user?._id || '')
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ▲ Upvote ({question.upvotes?.length || 0})
              </button>
              <button 
                onClick={() => handleVote('question', question._id, 'downvote')}
                className={`p-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  question.downvotes?.includes(user?._id || '')
                    ? "bg-red-600/20 text-red-400 border border-red-500/20"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ▼ Downvote ({question.downvotes?.length || 0})
              </button>
            </div>

            {user && (user.role === 'admin' || user._id === question.author?._id) && (
              <button 
                onClick={handleDeleteQuestion}
                className="bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 hover:border-red-800/50 text-red-400 hover:text-red-300 font-semibold text-xs px-4 py-2 rounded-xl transition duration-200 cursor-pointer shadow-md"
              >
                {user.role === 'admin' ? "Delete Question/Announcement" : "Delete Question"}
              </button>
            )}
          </div>
        </div>

        {/* ANSWERS LIST SECTION */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Answers
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
              {answers.length}
            </span>
          </h2>

          {answers.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/20 border border-zinc-850 rounded-2xl border-dashed">
              <p className="text-zinc-500 text-sm">No answers posted yet. Help this developer!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map((ans) => (
                <div key={ans._id} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl transition-all duration-200 hover:border-zinc-750">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold flex items-center justify-center">
                      {ans.author?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-xs text-zinc-400 font-semibold">{ans.author?.username || "unknown"}</span>
                    <span className="text-zinc-700 text-xs">•</span>
                    <span className="text-xs text-zinc-500">{new Date(ans.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {ans.content}
                  </p>

                  {/* Voting Row */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/30">
                    <div className="flex items-center bg-zinc-950 border border-zinc-850 rounded-xl p-0.5 gap-1">
                      <button 
                        onClick={() => handleVote('answer', ans._id, 'upvote')}
                        className={`p-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          ans.upvotes?.includes(user?._id || '')
                            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        ▲ ({ans.upvotes?.length || 0})
                      </button>
                      <button 
                        onClick={() => handleVote('answer', ans._id, 'downvote')}
                        className={`p-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          ans.downvotes?.includes(user?._id || '')
                            ? "bg-red-600/20 text-red-400 border border-red-500/20"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        ▼ ({ans.downvotes?.length || 0})
                      </button>
                    </div>

                    {user && (user.role === 'admin' || user._id === ans.author?._id) && (
                      <button 
                        onClick={() => handleDeleteAnswer(ans._id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold px-2.5 py-1 bg-red-950/20 hover:bg-red-900/10 border border-red-900/30 rounded-lg transition duration-200 cursor-pointer"
                      >
                        Delete Reply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* POST ANSWER FORM */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Your Answer</h3>
          <form onSubmit={handlePostAnswer} className="space-y-4">
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={6}
              placeholder="Write your explanation or code solution here..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all duration-200 text-white resize-none"
            />

            {submitError && <p className="text-red-400 text-xs font-medium">{submitError}</p>}
            {submitSuccess && <p className="text-green-400 text-xs font-medium">{submitSuccess}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg cursor-pointer ${
                submitting
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/10"
              }`}
            >
              {submitting ? "Posting..." : "Post Answer"}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
