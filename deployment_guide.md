# Deployment Guide - LearnLens AI

Follow these steps to deploy the application for production.

## 1. Database (MongoDB Atlas)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a new cluster and a database named `learnlens`.
3. Go to **Network Access** and allow IP address `0.0.0.0/0` (or your specific server IPs).
4. Go to **Database Access** and create a user with read/write permissions.
5. Copy the Connection String.

## 2. Backend (Render / Heroku)
1. Push your code to a GitHub repository.
2. Link your repository to Render.
3. Set the Environment Variables:
   - `NODE_ENV=production`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_API_KEY`
4. Set the Build Command: `npm install`
5. Set the Start Command: `node index.js`

## 3. Frontend (Vercel / Netlify)
1. Link your GitHub repository to Vercel.
2. Set the Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://learnlens-api.onrender.com/api`)
3. Vercel will automatically detect the Vite config and deploy.

## 4. Google AI API Key
1. Go to the [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key.
3. Add it to your backend's `GOOGLE_API_KEY` variable.
