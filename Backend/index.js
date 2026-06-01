const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedDefaultCurriculum } = require('./utils/seedData');

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultCurriculum();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('LearnLens AI API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));

// Global error handler for unexpected exceptions
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err);
  if (err && err.stack) console.error(err.stack);
  res.status(500).json({ message: err?.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
