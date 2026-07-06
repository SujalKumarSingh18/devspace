"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Interfaces
interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  difficulty: string;
  xpReward: number;
}

interface UserProfile {
  _id: string;
  username: string;
  reputation: number;
  badges?: string[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  // 1. React States
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Feedback state for checking answers
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [firstTryStatus, setFirstTryStatus] = useState<boolean[]>([]);
  
  // Quiz completion state
  const [completed, setCompleted] = useState(false);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [earnedReputation, setEarnedReputation] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ======================================================================
  // TODO 1: Fetch Quiz Details and User session on mount
  // ======================================================================
  useEffect(() => {
    async function loadQuizData() {
      try {
        setLoading(true);
        // Fetch "/api/quizzes" and "/api/auth/me" in parallel
        const [quizzesRes, userRes] = await Promise.all([
          fetch("/api/quizzes"),
          fetch("/api/auth/me")
        ]);

        const quizzesData = await quizzesRes.json();
        const userData = await userRes.json();

        if (quizzesData.success) {
          // Find the specific quiz matching the quizId from the URL
          const foundQuiz = quizzesData.quizzes.find((q: Quiz) => q._id === quizId);
          setQuiz(foundQuiz || null);
          if (foundQuiz) {
            setFirstTryStatus(new Array(foundQuiz.questions.length).fill(true));
          }
        }

        if (userData.success) {
          setUser(userData.user);
        }
      } catch (err) {
        console.error("Error loading quiz:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [quizId]);

  // ======================================================================
  // handleCheckAnswer - Validates the currently selected option.
  // Provides visual green "Correct!" or red "Wrong answer, try again" feedback.
  // Tracks if the user got the question right on their first try.
  // ======================================================================
  const handleCheckAnswer = () => {
    if (selectedOption === null || !quiz) return;

    setSubmitError("");

    const correctIdx = quiz.questions[currentIndex].correctOptionIndex;
    const isAnsCorrect = selectedOption === correctIdx;

    setIsCorrect(isAnsCorrect);
    setChecked(true);

    if (isAnsCorrect) {
      // User got it correct. Increment the count of correct answers.
      setCorrectAnswers(prev => prev + 1);
    } else {
      // User got it incorrect. Mark this question's first try status as false.
      setFirstTryStatus(prev => {
        const next = [...prev];
        next[currentIndex] = false;
        return next;
      });
    }
  };

  // ======================================================================
  // handleNextQuestion - Advances the quiz deck or submits final attempt on finish.
  // Calculates score based on first-try accuracy.
  // ======================================================================
  const handleNextQuestion = async () => {
    if (!quiz) return;

    // Reset checking feedback states for the next question card
    setChecked(false);
    setIsCorrect(null);
    setSelectedOption(null);
    setSubmitError("");

    const isLastQuestion = currentIndex === quiz.questions.length - 1;
    
    if (isLastQuestion) {
      // Calculate final score using firstTryStatus array (only counting first-try correct answers)
      const firstTryCorrectCount = firstTryStatus.filter(val => val === true).length;
      const scorePercentage = Math.round((firstTryCorrectCount / quiz.questions.length) * 100);
      setFinalScore(scorePercentage);
      setCompleted(true);
      
      setSubmittingAttempt(true);
      try {
        const response = await fetch("/api/quizzes/attempts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user: user?._id,
            quiz: quiz._id,
            score: scorePercentage
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setEarnedReputation(data.reputationUpdated);
          if (data.reputationUpdated) {
            setUser(prev => {
              if (!prev) return null;
              const newBadges = prev.badges ? [...prev.badges] : [];
              if (!newBadges.includes('quiz-master')) {
                newBadges.push('quiz-master');
              }
              return {
                ...prev,
                reputation: prev.reputation + 50,
                badges: newBadges
              };
            });
          }
        } else {
          setSubmitError(data.message || "Failed to submit quiz attempt.");
        }
      } catch (err: any) {
        setSubmitError(err.message || "An error occurred while submitting.");
      } finally {
        setSubmittingAttempt(false);
      }
    } else {
      // Otherwise, proceed to the next question card
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">Quiz not found!</h2>
        <button onClick={() => router.push("/")} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm">
          Go Back Home
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background blur */}
        <div className="absolute -top-12 -right-12 h-36 w-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* SCREEN 1: QUIZ IN PROGRESS */}
        {!completed ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Question {currentIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {quiz.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg md:text-xl font-extrabold text-white mb-6 leading-snug">
              {currentQuestion.questionText}
            </h2>

            {/* Options List */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedOption(idx);
                    setChecked(false);
                    setIsCorrect(null);
                    setSubmitError("");
                  }}
                  className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    selectedOption === idx
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
                      : "bg-zinc-950 border-zinc-850 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <span>{option}</span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                    selectedOption === idx
                      ? "border-indigo-400 bg-indigo-500 text-white"
                      : "border-zinc-700 bg-zinc-950"
                  }`}>
                    {selectedOption === idx && (
                      <div className="h-2 w-2 rounded-full bg-white animate-scale-in" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback Messages */}
            {checked && isCorrect === false && (
              <p className="text-red-400 text-sm font-semibold text-center mb-5">
                Wrong answer, try again
              </p>
            )}
            {checked && isCorrect === true && (
              <p className="text-green-400 text-sm font-semibold text-center mb-5">
                Correct!
              </p>
            )}

            {/* Action Button */}
            <button
              onClick={checked && isCorrect ? handleNextQuestion : handleCheckAnswer}
              disabled={selectedOption === null || (checked && !isCorrect)}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg cursor-pointer ${
                (selectedOption === null || (checked && !isCorrect))
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/15"
              }`}
            >
              {checked && isCorrect 
                ? (currentIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question")
                : "Check Answer"
              }
            </button>
          </div>
        ) : (
          
          /* SCREEN 2: QUIZ COMPLETED SCREEN */
          <div className="text-center py-4">
            <div className="h-16 w-16 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl">
              🎯
            </div>

            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Quiz Completed!</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs mx-auto">
              You finished the <span className="text-zinc-200 font-semibold">{quiz.title}</span>. Let's see your results:
            </p>

            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 mb-8 max-w-sm mx-auto grid grid-cols-2 gap-4">
              <div className="border-r border-zinc-850 pr-4 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Score</span>
                <span className={`text-2xl font-black ${finalScore && finalScore >= 80 ? "text-green-400" : "text-red-400"}`}>
                  {finalScore}%
                </span>
              </div>
              <div className="pl-4 text-center flex flex-col justify-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Status</span>
                <span className={`text-xl font-black ${finalScore && finalScore >= 80 ? "text-indigo-400" : "text-zinc-500"}`}>
                  {finalScore && finalScore >= 80 ? "Passed" : "Failed"}
                </span>
              </div>
            </div>

            {submittingAttempt ? (
              <p className="text-zinc-500 text-xs animate-pulse">Logging attempt and updating reputation...</p>
            ) : submitError ? (
              <p className="text-red-400 text-xs mb-4">{submitError}</p>
            ) : earnedReputation ? (
              <p className="text-green-400 text-xs font-semibold mb-6 flex items-center justify-center gap-1.5">
                🎉 Quiz completed and passed! Your badge has been unlocked.
              </p>
            ) : (
              <p className="text-zinc-500 text-xs mb-6">
                {finalScore && finalScore >= 80 
                  ? "Attempt logged. You already passed this quiz before (No double-XP farming!)." 
                  : "Score 80% or higher on your first attempts to earn Reputation and the Quiz-Master badge!"}
              </p>
            )}

            <button
              onClick={() => router.push("/")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
