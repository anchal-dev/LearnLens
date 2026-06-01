import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Users, BookOpen, AlertTriangle, Search,
  TrendingUp, Sparkles, Plus, Download,
  Layers, ChevronRight, ShieldAlert,
  GraduationCap, CheckCircle, HelpCircle, Activity,
  Brain, FileText, Wifi, WifiOff
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';

Chart.register(...registerables);

// ─── Stream badge colors ──────────────────────────────────────────────────────

const STREAM_STYLE = {
  General:  { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    dot: 'bg-blue-400'    },
  Science:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  Commerce: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   dot: 'bg-amber-400'   },
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="glass-card animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-3 w-24 bg-slate-800 rounded-full" />
        <div className="h-8 w-16 bg-slate-800 rounded-lg" />
        <div className="h-2 w-32 bg-slate-800 rounded-full" />
      </div>
      <div className="w-14 h-14 bg-slate-800 rounded-2xl" />
    </div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, title, value, trend, color, isLoading }) => {
  if (isLoading) return <SkeletonCard />;
  return (
    <div className="glass-card flex items-center justify-between hover:scale-[1.02] duration-300 cursor-default group">
      <div className="space-y-1.5">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black font-outfit text-white tracking-tight">{value}</p>
        <p className="text-[10px] text-slate-500 font-semibold">{trend}</p>
      </div>
      <div className={`p-4 rounded-2xl border ${color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
  );
};

// ─── Severity Badge ───────────────────────────────────────────────────────────

const SeverityBadge = ({ level }) => {
  const styles = {
    High:   'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-block border ${styles[level] || styles.Low}`}>
      {level}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TeacherDashboard = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [dbClasses, setDbClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classesLoading, setClassesLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [learningGaps, setLearningGaps] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [trendData, setTrendData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  // Chart refs
  const lineCanvasRef = useRef(null);
  const barCanvasRef  = useRef(null);
  const lineChartRef  = useRef(null);
  const barChartRef   = useRef(null);

  // ── 1. Fetch DB Classes ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const res = await axios.get(`${API_URL}/teacher/classes`);
        setDbClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClassId(res.data[0]._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Could not connect to database. Please make sure the backend is running.');
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, [API_URL]);

  // ── 2. Fetch Dashboard Analytics (with 10s auto-polling) ───────────────────
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchAllDashboardData = async () => {
      try {
        setError('');
        const [statsRes, gapsRes, riskRes, trendRes] = await Promise.all([
          axios.get(`${API_URL}/teacher/dashboard/${selectedClassId}`),
          axios.get(`${API_URL}/teacher/learning-gaps/${selectedClassId}`),
          axios.get(`${API_URL}/teacher/risk-students/${selectedClassId}`),
          axios.get(`${API_URL}/teacher/performance-trend/${selectedClassId}`)
        ]);

        setDashboardStats(statsRes.data);
        setLearningGaps(gapsRes.data);
        setRiskStudents(riskRes.data);
        setTrendData(trendRes.data);

        // Compile Live Activity Stream dynamically based on diagnostic signals
        const acts = [];
        let idCounter = 1;
        
        if (riskRes.data.length > 0) {
          riskRes.data.slice(0, 2).forEach(student => {
            acts.push({
              id: idCounter++,
              type: 'alert',
              text: `AI flagged ${student.name} as ${student.riskLevel} Risk in ${student.gap}`,
              time: 'Just now',
              icon: <AlertTriangle className="text-rose-400" size={14} />
            });
          });
        }
        
        if (gapsRes.data.length > 0) {
          gapsRes.data.slice(0, 2).forEach(gap => {
            acts.push({
              id: idCounter++,
              type: 'ai',
              text: `Learning gap alert for "${gap.topic}" affecting ${gap.count} students`,
              time: 'Recently',
              icon: <Sparkles className="text-purple-400" size={14} />
            });
          });
        }

        acts.push({
          id: idCounter++,
          type: 'quiz',
          text: `Performance data synced with MongoDB for ${dbClasses.find(c => c._id === selectedClassId)?.name || 'Class'}`,
          time: 'Synced live',
          icon: <Activity className="text-emerald-400" size={14} />
        });

        setRecentActivities(acts);
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
        setError('Error synchronizing with live MongoDB cluster.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();

    // Auto-polling every 10 seconds for real-time updates
    const interval = setInterval(fetchAllDashboardData, 10000);
    return () => clearInterval(interval);
  }, [API_URL, selectedClassId, dbClasses]);

  // ── 3. Render Charts ──────────────────────────────────────────────────────
  useEffect(() => {
    if (lineChartRef.current) { lineChartRef.current.destroy(); lineChartRef.current = null; }
    if (barChartRef.current)  { barChartRef.current.destroy();  barChartRef.current  = null; }

    if (!trendData) return;

    const fontColor      = 'rgba(148,163,184,1)';
    const gridColor      = 'rgba(255,255,255,0.05)';
    const tooltipDefaults = {
      backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8
    };

    if (lineCanvasRef.current) {
      const ctx  = lineCanvasRef.current.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, 'rgba(139,92,246,0.4)');
      grad.addColorStop(1, 'rgba(139,92,246,0.0)');
      lineChartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trendData.trendLabels || ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5', 'Quiz 6'],
          datasets: [{
            label: 'Class Avg Score (%)',
            data: trendData.trendScores || [70, 70, 70, 70, 70, 70],
            borderColor: '#a78bfa',
            borderWidth: 3,
            backgroundColor: grad,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipDefaults },
          scales: {
            y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: fontColor, stepSize: 20 } },
            x: { grid: { display: false }, ticks: { color: fontColor } }
          }
        }
      });
    }

    if (barCanvasRef.current) {
      const ctx  = barCanvasRef.current.getContext('2d');
      barChartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: trendData.topics && trendData.topics.length > 0 ? trendData.topics : ['No learning gaps detected'],
          datasets: [{
            label: 'Average Score (%)',
            data: trendData.gapScores && trendData.gapScores.length > 0 ? trendData.gapScores : [100],
            backgroundColor: trendData.topics && trendData.topics.length > 0 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(16, 185, 129, 0.75)',
            borderColor: trendData.topics && trendData.topics.length > 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
            borderRadius: 8, barPercentage: 0.6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipDefaults },
          scales: {
            y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: fontColor, stepSize: 20 } },
            x: { grid: { display: false }, ticks: { color: fontColor, font: { size: 10 } } }
          }
        }
      });
    }

    return () => {
      if (lineChartRef.current) { lineChartRef.current.destroy(); lineChartRef.current = null; }
      if (barChartRef.current)  { barChartRef.current.destroy();  barChartRef.current  = null; }
    };
  }, [trendData]);

  // Derived Stream badge resolver
  const getStreamStyle = (className) => {
    if (className.includes('Science')) return STREAM_STYLE.Science;
    if (className.includes('Commerce')) return STREAM_STYLE.Commerce;
    return STREAM_STYLE.General;
  };

  // Empty Class State
  if (!classesLoading && dbClasses.length === 0) {
    return (
      <div className="min-h-screen bg-[#070b19] text-slate-100 font-sans pt-24 pb-16 px-4 md:px-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-md w-full glass-card text-center space-y-6 z-10 py-12">
          <div className="bg-primary-600/15 p-4 w-16 h-16 rounded-2xl border border-primary-500/25 mx-auto flex items-center justify-center">
            <Brain className="text-primary-400" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-outfit text-white">No Classes Registered</h2>
            <p className="text-slate-400 text-sm">Create and enroll students in your senior secondary classes to start collecting live metrics.</p>
          </div>
          <Link
            to="/teacher/classes"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm py-3 px-6 rounded-xl transition-all shadow-glow active:scale-95"
          >
            <Plus size={16} /> Manage Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 font-sans pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600/10 p-2.5 rounded-xl border border-primary-500/20">
              <Brain className="text-primary-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-outfit text-white">Teacher Analytics Hub</h1>
              <p className="text-slate-400 text-sm mt-0.5">Real-time performance and diagnostic tracking powered by MongoDB.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-emerald-300 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live DB Sync
            </div>

            <select
              value={selectedClassId}
              onChange={e => {
                setLoading(true);
                setSelectedClassId(e.target.value);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              {dbClasses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}{c.section ? ` – Sec ${c.section}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Error Banner ──────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm">
            <WifiOff size={18} className="shrink-0" />
            <div>
              <span className="font-bold">Sync Error: </span>
              {error}
            </div>
          </div>
        )}

        {/* ── Stats Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            isLoading={loading}
            icon={<Users size={24} />}
            title="Total Students"
            value={dashboardStats?.totalStudents ?? 0}
            trend="Active students enrolled"
            color="border-blue-500/20 bg-blue-500/5 text-blue-400"
          />
          <StatCard
            isLoading={loading}
            icon={<GraduationCap size={24} />}
            title="Average Class Score"
            value={dashboardStats ? `${dashboardStats.averageScore}%` : '0%'}
            trend="Aggregated diagnostics"
            color="border-purple-500/20 bg-purple-500/5 text-purple-400"
          />
          <StatCard
            isLoading={loading}
            icon={<AlertTriangle size={24} />}
            title="Learning Gap Alerts"
            value={dashboardStats?.learningGapAlerts ?? 0}
            trend="Topics with average < 50%"
            color="border-amber-500/20 bg-amber-500/5 text-amber-400"
          />
          <StatCard
            isLoading={loading}
            icon={<ShieldAlert size={24} />}
            title="At-Risk Students"
            value={dashboardStats?.atRiskStudents ?? 0}
            trend="Require prioritized support"
            color="border-rose-500/20 bg-rose-500/5 text-rose-400"
          />
        </div>

        {/* ── Charts Row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Chart */}
          <div className="lg:col-span-2 glass-card flex flex-col h-[380px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white">Class Performance Trend</h3>
                <p className="text-slate-400 text-xs mt-0.5">Chronological average score trajectory</p>
              </div>
              <TrendingUp className="text-primary-400" size={20} />
            </div>
            <div className="relative flex-1 w-full">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-xl z-10">
                  <Activity className="animate-spin text-primary-400" size={28} />
                </div>
              )}
              <canvas ref={lineCanvasRef} />
            </div>
          </div>

          {/* Teacher Command Actions */}
          <div className="glass-card flex flex-col space-y-5">
            <div>
              <h3 className="text-lg font-bold font-outfit text-white">Teacher Command Actions</h3>
              <p className="text-slate-400 text-xs mt-0.5">Automated workflows & AI intervention tools</p>
            </div>
            <div className="flex flex-col gap-3.5 flex-1 justify-center">
              <button
                onClick={() => navigate('/teacher/quizzes?mode=create')}
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all border border-slate-700/50 flex items-center gap-3 active:scale-95"
              >
                <Plus size={18} className="text-indigo-400" /> Create Standard Quiz
              </button>
              <button
                onClick={() => navigate('/teacher/quizzes?mode=ai')}
                className="w-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm py-3.5 px-6 rounded-xl transition-all shadow-glow flex items-center justify-between active:scale-95"
              >
                <span className="flex items-center gap-3">
                  <Sparkles size={18} className="animate-pulse" /> Generate AI Remediation Quiz
                </span>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => navigate('/teacher/quizzes')}
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all border border-slate-700/50 flex items-center gap-3 active:scale-95"
              >
                <Layers size={18} className="text-blue-400" /> Manage All Quizzes
              </button>
              <button
                onClick={() => navigate('/teacher/quizzes')}
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all border border-slate-700/50 flex items-center gap-3 active:scale-95"
              >
                <Download size={18} className="text-emerald-400" /> View Quiz Reports
              </button>
            </div>
          </div>
        </div>

        {/* ── Topic Gap Bar Chart + Intelligence Table ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="glass-card flex flex-col h-[380px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white">Struggling Topic Breakdown</h3>
                <p className="text-slate-400 text-xs mt-0.5">Average accuracy per critical subject area</p>
              </div>
              <HelpCircle className="text-blue-400" size={20} />
            </div>
            <div className="relative flex-1 w-full">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-xl z-10">
                  <Activity className="animate-spin text-primary-400" size={28} />
                </div>
              )}
              <canvas ref={barCanvasRef} />
            </div>
          </div>

          {/* Gap Intelligence Table */}
          <div className="glass-card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white">Learning Gap Intelligence</h3>
                <p className="text-slate-400 text-xs mt-0.5">Focus areas with highest struggle frequencies</p>
              </div>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold uppercase">
                Live MongoDB Signal
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800/80 flex-1">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="px-5 py-3.5">Topic</th>
                    <th className="px-5 py-3.5 text-center">Struggling Students</th>
                    <th className="px-5 py-3.5 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {loading ? (
                    [1, 2, 3].map(n => (
                      <tr key={n} className="animate-pulse">
                        <td className="px-5 py-3.5"><div className="h-4 w-32 bg-slate-800 rounded-full" /></td>
                        <td className="px-5 py-3.5 text-center"><div className="h-4 w-12 bg-slate-800 rounded-full mx-auto" /></td>
                        <td className="px-5 py-3.5 text-right"><div className="h-6 w-16 bg-slate-800 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : learningGaps.length > 0 ? (
                    learningGaps.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-white">{item.topic}</td>
                        <td className="px-5 py-3.5 text-center text-slate-300 font-bold">{item.count}</td>
                        <td className="px-5 py-3.5 text-right">
                          <SeverityBadge level={item.severity} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-16 text-center text-slate-500 italic text-sm">
                        No critical learning gaps detected. All averages above 50%!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Student Risk Prediction + AI Interventions ─────────────────── */}
        <div className="glass-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold font-outfit text-white">Student Risk Predictions & AI Interventions</h3>
              <p className="text-slate-400 text-xs mt-0.5">Students flagged by AI with prioritized action items</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary-500 w-full text-slate-300"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [1, 2].map(n => (
                <div key={n} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 bg-slate-800 rounded-full" />
                      <div className="h-3 w-40 bg-slate-800 rounded-full" />
                    </div>
                    <div className="h-6 w-16 bg-slate-800 rounded-lg" />
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full" />
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 h-20" />
                </div>
              ))
            ) : riskStudents.length > 0 ? (
              riskStudents
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((student, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-4 hover:border-slate-700 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                          {student.avatar}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white">{student.name}</h4>
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Gap: {student.gap}</span>
                        </div>
                      </div>
                      <SeverityBadge level={student.riskLevel} />
                    </div>
                    <p className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Warning: </span>{student.reason}
                    </p>
                    <div className="p-4 rounded-xl bg-primary-950/20 border border-primary-500/10">
                      <div className="flex items-center gap-1.5 text-xs text-primary-400 font-extrabold mb-1.5">
                        <Sparkles size={14} className="animate-pulse" /> AI Remediation Plan
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{student.suggestion}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-2 py-14 text-center text-slate-500 italic bg-slate-900/20 rounded-2xl border border-slate-800/40 text-sm">
                No students currently flagged as Medium or High Risk. Excellent class progress!
              </div>
            )}
          </div>
        </div>

        {/* ── Class Overview Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card space-y-5">
            <div>
              <h3 className="text-lg font-bold font-outfit text-white">Live Classes Quick Overview</h3>
              <p className="text-slate-400 text-xs mt-0.5">Click any card to select class analytics instantly</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {classesLoading ? (
                [1, 2, 3].map(n => (
                  <div key={n} className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 h-32 animate-pulse space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-16 bg-slate-800 rounded-full" />
                      <div className="h-4 w-12 bg-slate-800 rounded-full" />
                    </div>
                    <div className="h-6 w-24 bg-slate-800 rounded-lg" />
                    <div className="h-2 w-full bg-slate-800 rounded-full" />
                  </div>
                ))
              ) : (
                dbClasses.map(cls => {
                  const ss = getStreamStyle(cls.name);
                  const isSelected = selectedClassId === cls._id;
                  return (
                    <div
                      key={cls._id}
                      className={`p-4 rounded-xl bg-slate-900/50 border transition-all duration-300 flex flex-col gap-3 hover:bg-slate-900 hover:border-slate-700 cursor-pointer ${isSelected ? 'border-primary-500 shadow-glow bg-slate-900/90 scale-95' : 'border-slate-800'}`}
                      onClick={() => {
                        setLoading(true);
                        setSelectedClassId(cls._id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] font-extrabold uppercase">{cls.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ss.bg} ${ss.text} ${ss.border}`}>
                          {cls.stream || 'General'}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold font-outfit text-white">Section {cls.section || 'A'}</span>
                        <span className="text-slate-500 text-[10px]">{cls.students?.length ?? 0} students</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                        <span>Invite: {cls.inviteCode || 'N/A'}</span>
                        <span className="text-primary-400">View Live Analytics</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="glass-card flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-bold font-outfit text-white">Live Activity Stream</h3>
              <p className="text-slate-400 text-xs mt-0.5">Real-time alerts and diagnosis logs</p>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-64 pr-1">
              {loading ? (
                [1, 2, 3].map(n => (
                  <div key={n} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-slate-850 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-4/5 bg-slate-850 rounded-full" />
                      <div className="h-2 w-16 bg-slate-850 rounded-full" />
                    </div>
                  </div>
                ))
              ) : recentActivities.length > 0 ? (
                recentActivities.map(act => (
                  <div key={act.id} className="flex items-start gap-3 text-xs text-slate-300">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 shrink-0">
                      {act.icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-white/90 font-medium leading-tight">{act.text}</p>
                      <span className="text-[10px] text-slate-500 font-bold">{act.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-600 italic py-10 text-xs">
                  No diagnostic events logged.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
