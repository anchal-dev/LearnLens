import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${API_URL}/quiz/${id}`);
        setQuiz(res.data);
        setTimeLeft(res.data.duration * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft === 0) handleSubmit();
    if (!timeLeft || submitted) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const answersArray = quiz.questions.map((_, i) => answers[i] ?? -1);
      await axios.post(`${API_URL}/quiz/${id}/submit`, {
        answers: answersArray,
        timeTaken: (quiz.duration * 60) - timeLeft
      });
      navigate('/student');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading Quiz...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8 glass p-4 rounded-2xl border-white/10">
        <h2 className="text-xl font-bold">{quiz.title}</h2>
        <div className="flex items-center gap-2 text-primary-400 font-mono font-bold">
          <Clock size={20} />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {quiz.questions.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 flex-1 rounded-full ${i <= currentQuestion ? 'bg-primary-500' : 'bg-dark-800'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card"
        >
          <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest font-bold">Question {currentQuestion + 1} of {quiz.questions.length}</p>
          <h3 className="text-2xl font-bold mb-8">{currentQ.questionText}</h3>
          
          <div className="space-y-4">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(i)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group
                  ${answers[currentQuestion] === i 
                    ? 'border-primary-500 bg-primary-500/10 text-white' 
                    : 'border-dark-700 hover:border-white/20 text-slate-400'}`}
              >
                <span>{option}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${answers[currentQuestion] === i ? 'border-primary-500 bg-primary-500' : 'border-dark-600'}`}>
                  {answers[currentQuestion] === i && <CheckCircle size={14} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button 
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(q => q - 1)}
          className="glass px-6 py-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        {currentQuestion === quiz.questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            className="btn-primary py-3 !px-10 flex items-center gap-2"
          >
            Submit Exam <CheckCircle size={20} />
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestion(q => q + 1)}
            className="btn-primary py-3 !px-10 flex items-center gap-2"
          >
            Next Question <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
