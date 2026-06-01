# LearnLens AI - Learning Gap Detection Platform

LearnLens AI is a production-ready MERN stack application designed to help teachers identify student learning gaps using artificial intelligence. Using Google Gemini, it analyzes quiz performance to pinpoint specific conceptual weaknesses and provide personalized feedback.

## ✨ Features

- **Students**
  - Register/Login with Role-based Access.
  - Interactive Dashboard with performance analytics.
  - **AI Tutor Chatbot** for 24/7 doubt solving and concept explanation.
  - Real-time quiz system with timers and analysis.
  - AI-generated personalized feedback and learning recommendations.
- **Teachers**
  - Create and manage classes.
  - **Risk Prediction System** that flags at-risk students using AI.
  - Topic-wise performance analytics.
  - Class-wide heatmaps and interaction reports.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Lucide React.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **AI**: Google Gemini Pro API.
- **Authentication**: JWT & Bcrypt.js.

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to the `Backend` directory.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   AI_PROVIDER=google
   GOOGLE_API_KEY=your_gemini_api_key
   # OPENAI_API_KEY=your_openai_api_key
   # OPENAI_MODEL=gpt-4.1-mini
   # GOOGLE_MODEL=gemini-1.5-flash
   ```
4. Run `npm start`.

### Frontend Setup
1. Navigate to the `Frontend` directory.
2. Run `npm install`.
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run `npm run dev`.

## 📈 Database Models

- **User**: Name, email, password, role.
- **Class**: Teacher, student list, invite codes.
- **Quiz**: Questions, topics, duration, difficulty.
- **Result**: Student scores, topic-by-topic accuracy.
- **LearningGap**: AI-generated reports on weak concepts.
- **ChatHistory**: Persistent AI Tutor conversations.

## 📄 License
MIT
