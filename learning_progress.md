# DevSpace: TypeScript Learning & Project Progress 🚀

This file keeps track of your learning milestones, files created, and progress sequentially as we build the **DevSpace** project.

---

## 📅 Timeline & Progress

### 1. TypeScript Foundations
* **Concepts Learned:** Primitive types, Type Inference, Arrays, Interfaces, Type Aliases (`type`), Unions (`|`), Literals, Non-Null Assertions (`!`), Function/Async types, React props (`React.ReactNode`, `Readonly`), and Mongoose Schema integration.
* **Practice File:** [ts_practice.ts](file:///c:/Users/sujal/Desktop/PROJECTS/ts_practice.ts) (Challenges 1-6 completed successfully).

### 2. Project Setup & Configuration
* **Dependencies Installed:** `mongoose`, `bcryptjs`, and dev dependencies `@types/bcryptjs`.
* **Database Connection Singleton:** Created [dbConnect.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/lib/dbConnect.ts) to handle database pooling and hot-reloading cache in Next.js development.

### 3. Database Models (`src/models/`)
* **[User.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/models/User.ts):** Created and configured with typescript interface `IUser`, Mongoose Schema, unique indexes, reputation default value, and theme enum preference.
* **[Question.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/models/Question.ts):** Completed. Structured with `IQuestion` interface, referencing the `User` model via `Schema.Types.ObjectId` for authors, upvotes, and downvotes.
* **[Answer.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/models/Answer.ts):** Completed. Structured with `IAnswer` interface, referencing `Question` and `User` models, with acceptance flags and upvote/downvote arrays.
* **[Quiz.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/models/Quiz.ts):** Completed. Structured with `IQuiz` interface containing a nested array of `IQuizQuestion` subdocuments, with difficulty enum and XP reward field.
* **[QuizAttempt.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/models/QuizAttempt.ts):** Completed. Structured with `IQuizAttempt` interface, linking a User to a attempted Quiz with their score.
* **[.env.local](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/.env.local):** Configured with MongoDB Atlas credentials.
* **[route.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/app/api/test-db/route.ts):** Completed. Next.js API Route to test the database connection using Mongoose.
* **[route.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/app/api/auth/register/route.ts):** Completed. A fully secure, type-safe API endpoint for user registration using password hashing (bcryptjs) and Mongoose.
* **[route.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/app/api/auth/login/route.ts):** Completed. A fully secure, type-safe API endpoint for user login using Mongoose queries (`findOne`) and bcrypt password comparisons.
* **[route.ts](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/src/app/api/questions/route.ts):** Completed. Structured with GET and POST handlers to fetch all questions (with populated author) and create new questions (with validation).
* **[mern_package_guide.txt](file:///c:/Users/sujal/Desktop/PROJECTS/devspace/mern_package_guide.txt):** Created. A Notion-friendly plain text guide explaining MERN and Next.js backend concepts with ASCII flowcharts.

---

## 🛠️ Upcoming Steps
1. Test the Questions API route (GET and POST) in Postman.
2. Build the **Answers** API route.

