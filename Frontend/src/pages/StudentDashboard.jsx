import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Plus, Brain, BookOpen, Trophy, 
  TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const StudentDashboard = () => {
  const { user, API_URL } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
              <p className="font-bold text-white">{data?.streak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Brain />} title="Knowledge Gaps" value={data?.recentGaps?.length || 0} color="rose" />
        <StatCard icon={<Clock />} title="Time Studied" value="12.5h" color="primary" />
        <StatCard icon={<CheckCircle2 />} title="Quizzes Done" value={data?.totalQuizzes || 0} color="emerald" />
        <StatCard icon={<TrendingUp />} title="Avg Accuracy" value="78%" color="indigo" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 glass-card">
          <h3 className="text-xl font-bold mb-6">Performance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.results?.map(r => ({ name: r.quiz?.title, score: (r.score / r.totalQuestions) * 100 }))}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Immediate Interventions */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="text-rose-500" size={20} /> AI Recommendations
          </h3>
          <div className="space-y-4">
            {data?.recentGaps?.length > 0 ? (
              data.recentGaps.map((gap, i) => (
                <div key={i} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <p className="text-xs text-rose-400 font-semibold mb-1 uppercase tracking-wider">Learning Gap</p>
                  <p className="font-bold text-white mb-2">{gap.weakTopics[0]}</p>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{gap.aiFeedback}</p>
                  <button className="text-primary-400 text-sm font-semibold hover:underline">Start Review →</button>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No gaps detected yet. Take a quiz to start analysis!</p>
            )}
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
