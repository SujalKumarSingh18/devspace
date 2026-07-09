# 🌌 DevSpace - Gamified Developer Q&A Platform

DevSpace is a full-stack, gamified Q&A forum designed for developers. Built on Next.js, TypeScript, TailwindCSS, and MongoDB, it implements features like secure cookie-based session management, real-time reputation scoring, a sequenced quiz portal, interactive upvoting/downvoting, and robust administrator controls.

---

## 🚀 Key Features

* 🔐 **Secure JWT Session Management:** Register and login flows backed by `bcryptjs` hashing. Sessions are tracked via secure, HTTP-only cookie-tokens (independent browser vs. API client jars).
* 🏆 **Gamified Reputation Engine:** Real-time XP tracking and dynamic progress bar calculations on `/profile` displaying user ranks (Bronze, Silver, Gold) and badge unlocks.
  * `+10 XP` for publishing questions.
  * `+20 XP` for posting answers.
  * `+50 XP` and `Quiz Master` badge for passing quizzes.
* ⬆️ **Upvote & Downvote System:** Double-ended voting arrays on questions and answers featuring mutual exclusion (toggling an upvote pulls the downvote) and event-propagation blocks (`e.stopPropagation()`).
* 📝 **Interactive Q&A Thread Feed:** Chronological questions feed (sorted newest-first) with tag categorization and Markdown-supported threads.
* ⚙️ **Admin Privileges & Controls:** Dynamic RBAC (Role-Based Access Control) checking user roles in MongoDB Atlas to permit quiz creation and red "Delete Question/Reply" elements.
* 🧠 **Sequenced Quiz Portal:** Dynamic quiz deck executing client-side scoring checks and database attempts checking to prevent double-XP farming.

---

## 🛠️ Technology Stack

* **Frontend Framework:** Next.js (App Router, Tailwind CSS, TypeScript)
* **Backend Runtime:** Next.js API Route Handlers
* **Database Engine:** MongoDB Atlas (Mongoose ODM)
* **Security & Tokens:** JSON Web Tokens (`jsonwebtoken`), Cookie Sessions (`next/headers`)

---

## 📂 Project Architecture Map

```text
c:\Users\sujal\Desktop\PROJECTS\devspace
├── src/
│   ├── app/
│   │   ├── api/                  # Backend Next.js API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   ├── me/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── questions/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── answers/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── quizzes/
│   │   │   │   ├── attempts/route.ts
│   │   │   │   └── route.ts
│   │   │   └── votes/route.ts
│   │   ├── login/page.tsx        # Auth Pages
│   │   ├── register/page.tsx
│   │   ├── profile/page.tsx      # Gamified User Statistics
│   │   ├── questions/
│   │   │   └── [id]/page.tsx     # Thread & Answering Feed
│   │   ├── quiz/
│   │   │   └── [id]/page.tsx     # Seq Quiz Deck
│   │   ├── page.tsx              # Dashboard Explorer
│   │   └── layout.tsx
│   ├── models/                   # Mongoose Database Schemas
│   │   ├── User.ts
│   │   ├── Question.ts
│   │   ├── Answer.ts
│   │   ├── Quiz.ts
│   │   └── QuizAttempt.ts
│   └── lib/
│       └── dbConnect.ts          # Mongoose Connection Pooling
```

---

## 🔌 API Documentation

### 1. Authentication
* `POST /api/auth/register` - Registers a new user account.
* `POST /api/auth/login` - Validates credentials, signs JWT, sets Secure HTTP-only Cookie.
* `POST /api/auth/logout` - Deletes the secure session cookie.
* `GET /api/auth/me` - Verifies the cookie token and returns the current user profile.

### 2. Discussion Threads
* `GET /api/questions` - Fetches all questions (newest first, author populated).
* `POST /api/questions` - Creates a new question (`+10 XP` awarded).
* `GET /api/questions/[id]` - Fetches a single question's details.
* `DELETE /api/questions/[id]` - Deletes the question and associated answers (Admin only).
* `GET /api/answers?questionId=[id]` - Fetches replies to a question.
* `POST /api/answers` - Posts an answer to a question (`+20 XP` awarded).
* `DELETE /api/answers/[id]` - Deletes a reply (Admin only).

### 3. Voting & Interaction
* `POST /api/votes` - Toggles upvote/downvote arrays on Questions/Answers.

### 4. Quiz Portal
* `GET /api/quizzes` - Retrieves active assessments.
* `POST /api/quizzes` - Creates a new quiz (Admin only).
* `POST /api/quizzes/attempts` - Logs attempt results (`+50 XP` & Badge on first pass).

---

## ⚙️ How to Setup & Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/SujalKumarSingh18/devspace.git
cd devspace
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and configure your credentials:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devspace
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application!

---

## 🌐 Live Demo

You can view and test the application live in your browser here: **[https://devspace-navy.vercel.app/](https://devspace-navy.vercel.app/)**
