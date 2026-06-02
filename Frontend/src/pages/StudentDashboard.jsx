import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LearningGapAnalysis from '../components/LearningGapAnalysis';
import AIFeedback from '../components/AIFeedback';
import RiskCard from '../components/RiskCard';
import WeeklyStudyChart from '../components/WeeklyStudyChart';
import LearningPlan from '../components/LearningPlan';
import PerformanceTrend from '../components/PerformanceTrend';
import QuickActions from '../components/QuickActions';
import Achievements from '../components/Achievements';
import ProgressSummary from '../components/ProgressSummary';
import StudySubjects from '../components/StudySubjects';
import { 
  Plus, Brain, BookOpen, Trophy, 
  TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const StudentDashboard = () => {
  const { user, API_URL, selectedSubject } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.studentClass) {
      navigate('/student/class');
      return;
    }
    if (!selectedSubject) {
      navigate('/student/subjects');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/student/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL, navigate, selectedSubject, user]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-slate-400">Here's how your learning journey is progressing.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card !p-4 flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-lg"><Trophy className="text-amber-500" size={20} /></div>
            <div>
              <p className="text-xs text-slate-500">Current Streak</p>
              <p className="font-bold text-white">{data?.streak ?? 0} Days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <StudySubjects />
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="col-span-1">
          <LearningGapAnalysis gaps={data?.recentGaps?.length ? data.recentGaps.map(g => ({ topic: g.weakTopics?.[0] || 'Unknown', status: g.status || 'Needs Practice', progress: g.progress || 40 })) : []} />
        </div>
        <StatCard icon={<Clock />} title="Time Studied" value={data?.timeStudied || '0h'} color="primary" />
        <StatCard icon={<CheckCircle2 />} title="Quizzes Done" value={data?.totalQuizzes ?? 0} color="emerald" />
        <StatCard icon={<TrendingUp />} title="Avg Accuracy" value={data?.avgAccuracy != null ? `${data.avgAccuracy}%` : 'N/A'} color="indigo" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PerformanceTrend data={data?.results?.length ? data.results.map((r, i) => ({ date: `Quiz ${i+1}`, score: Math.round((r.score / r.totalQuestions) * 100), accuracy: r.accuracy || Math.round((r.score / r.totalQuestions) * 100) })) : []} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <RiskCard percent={data?.riskScore || 0} value={data?.riskLabel || 'No risk data'} />
            <WeeklyStudyChart data={data?.weeklyStudy || []} />
            <LearningPlan tasks={data?.learningPlan || []} />
          </div>
        </div>

        {/* AI Recommendations / Quick Actions & Achievements */}
        <div className="space-y-6">

          <AIFeedback
            title={data?.aiSummary?.title || 'AI Suggestions'}
            message={data?.aiSummary?.message || (data?.totalQuizzes ? 'No suggestions right now.' : 'Complete a quiz to get AI learning recommendations.')}
            actions={data?.aiSummary?.actions || []}
          />

          <QuickActions actions={[{ icon: '🎯', label: 'Generate Quiz' }, { icon: '📚', label: 'Summarize Notes' }, { icon: '🧠', label: 'Create Flashcards' }, { icon: '❓', label: 'Ask a Doubt' }]} />

          <Achievements items={data?.achievements || []} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <ProgressSummary
            level={data?.level || 'N/A'}
            mastered={data?.topicsMastered ?? 0}
            inProgress={data?.topicsInProgress ?? 0}
            weak={data?.weakTopicsCount ?? 0}
          />
        </div>
        <div>
          {/* Placeholder for any other quick stats */}
          <div className="glass-card"> 
            <h4 className="font-bold mb-2">Quick Insights</h4>
            <p className="text-sm text-slate-400">Personalized insights powered by LearnLens AI.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    rose: "bg-rose-500/10 text-rose-500",
    primary: "bg-primary-500/10 text-primary-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    indigo: "bg-indigo-500/10 text-indigo-500",
  };
  return (
    <div className="glass-card flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
