import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, BookOpen, AlertTriangle, Search, 
  TrendingUp, Sparkles, Plus, Download, 
  Layers, ChevronRight, ShieldAlert,
  GraduationCap, CheckCircle, HelpCircle, Activity,
  Brain, FileText, Sliders, Wifi, WifiOff
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// ─── Demo Fallback Data ──────────────────────────────────────────────
const DEMO_CLASSES = [
  { id: '6A', name: 'Class 6A', averageScore: 72, totalStudents: 28, alerts: 3, atRisk: 2 },
  { id: '7A', name: 'Class 7A', averageScore: 68, totalStudents: 32, alerts: 5, atRisk: 4 },
  { id: '8A', name: 'Class 8A', averageScore: 81, totalStudents: 24, alerts: 1, atRisk: 1 }
];

const DEMO_DATA = {
  '6A': {
    avgScore: '72%', totalStudents: 28, alerts: 3, atRisk: 2,
    trendData: [65, 68, 70, 74, 71, 72],
    topicPerformance: { Algebra: 75, Fractions: 45, Geometry: 62, Decimals: 58, Percentages: 80 },
    strugglingTopics: [
      { topic: 'Fractions', count: 18, severity: 'High' },
      { topic: 'Decimals', count: 12, severity: 'Medium' },
      { topic: 'Geometry', count: 8, severity: 'Low' }
    ],
    atRiskStudents: [
      { name: 'Rahul Sharma', riskLevel: 'High', reason: 'Scores dropping in Mathematics', avatar: 'R', gap: 'Algebra & Decimals', suggestion: 'Initiate daily mental math drills and provide visual decimal grid models.' },
      { name: 'Priya Singh', riskLevel: 'Medium', reason: 'Consistent mistakes in Fractions', avatar: 'P', gap: 'Fractions & Percentages', suggestion: 'Assign visual fraction circle boards and practice basic numerator conversions.' }
    ]
  },
  '7A': {
    avgScore: '68%', totalStudents: 32, alerts: 5, atRisk: 4,
    trendData: [60, 62, 65, 63, 67, 68],
    topicPerformance: { Algebra: 68, Fractions: 55, Geometry: 50, Decimals: 48, Percentages: 72 },
    strugglingTopics: [
      { topic: 'Decimals', count: 20, severity: 'High' },
      { topic: 'Geometry', count: 15, severity: 'High' },
      { topic: 'Fractions', count: 10, severity: 'Medium' }
    ],
    atRiskStudents: [
      { name: 'Jessica Taylor', riskLevel: 'High', reason: 'Weak fundamentals in Geometry formulas', avatar: 'J', gap: 'Geometry', suggestion: 'Conduct hands-on 3D shape identification and supply formula cheat sheets.' },
      { name: 'Rohan Roy', riskLevel: 'Medium', reason: 'Decimals placement syntax confusion', avatar: 'R', gap: 'Decimals', suggestion: 'Recommend placement chart worksheets and decimal-to-fraction grids.' }
    ]
  },
  '8A': {
    avgScore: '81%', totalStudents: 24, alerts: 1, atRisk: 1,
    trendData: [76, 78, 82, 80, 83, 81],
    topicPerformance: { Algebra: 88, Fractions: 78, Geometry: 82, Decimals: 79, Percentages: 85 },
    strugglingTopics: [
      { topic: 'Fractions', count: 6, severity: 'Medium' },
      { topic: 'Percentages', count: 4, severity: 'Low' }
    ],
    atRiskStudents: [
      { name: 'Sameer Sen', riskLevel: 'Medium', reason: 'Percentages calculations drop', avatar: 'S', gap: 'Percentages', suggestion: 'Assign real-world discount problem practice sets and ratio mappings.' }
    ]
  }
};

// ─── Skeleton Card ────────────────────────────────────────────────────
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

// ─── Stat Card ────────────────────────────────────────────────────────
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

// ─── Severity Badge ───────────────────────────────────────────────────
const SeverityBadge = ({ level }) => {
  const styles = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-block border ${styles[level] || styles.Low}`}>
      {level}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────
const TeacherDashboard = () => {
  const { API_URL } = useAuth();

  // Live stats from GET /api/teacher/dashboard
  const [liveStats, setLiveStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // DB classes & analytics
  const [dbClasses, setDbClasses] = useState([]);
  const [selectedDbClassId, setSelectedDbClassId] = useState('');
  const [dbAnalytics, setDbAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // UI state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedClassTab, setSelectedClassTab] = useState('6A');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartsReady, setChartsReady] = useState(false);
  const [recentActivities] = useState([
    { id: 1, type: 'quiz', text: 'Math Quiz "Fraction Fundamentals" created', time: '10 mins ago', icon: <BookOpen className="text-purple-400" size={14} /> },
    { id: 2, type: 'student', text: 'Rahul Sharma completed "Algebra Basics" test', time: '1 hr ago', icon: <CheckCircle className="text-emerald-400" size={14} /> },
    { id: 3, type: 'alert', text: 'New learning gap detected in Class 7A', time: '3 hrs ago', icon: <AlertTriangle className="text-amber-400" size={14} /> },
    { id: 4, type: 'ai', text: 'AI Intervention generated for Priya Singh', time: '5 hrs ago', icon: <Sparkles className="text-blue-400" size={14} /> }
  ]);

  // Chart refs
  const lineCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  // ── 1. Fetch live dashboard stats from MongoDB ──────────────────────
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setStatsLoading(true);
      setStatsError('');
      try {
        const res = await axios.get(`${API_URL}/teacher/dashboard`);
        setLiveStats(res.data);
        setIsDemoMode(false);
      } catch (err) {
        console.warn('Could not fetch live dashboard stats. Falling back to demo mode.', err);
        setStatsError(
          err.response?.data?.message ||
          'Could not connect to database. Showing demo data below.'
        );
        setIsDemoMode(true);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchDashboardStats();
  }, [API_URL]);

  // ── 2. Fetch DB classes (for detailed chart view) ───────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_URL}/teacher/classes`);
        setDbClasses(res.data);
        if (res.data.length > 0) {
          setSelectedDbClassId(res.data[0]._id);
          fetchClassAnalytics(res.data[0]._id);
        }
      } catch (err) {
        console.warn('No DB classes found, demo chart data will be used.', err);
      }
    };
    fetchClasses();
  }, [API_URL]);

  const fetchClassAnalytics = async (classId) => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/teacher/analytics/${classId}`);
      setDbAnalytics(res.data);
      setSelectedDbClassId(classId);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setAnalyticsLoading(false);
      setChartsReady(true);
    }
  };

  // ── 3. Render Charts ────────────────────────────────────────────────
  useEffect(() => {
    // Destroy old charts
    if (lineChartRef.current) { lineChartRef.current.destroy(); lineChartRef.current = null; }
    if (barChartRef.current) { barChartRef.current.destroy(); barChartRef.current = null; }

    // Determine chart data source
    const isDbMode = !isDemoMode && dbAnalytics;
    const trendWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
    let trendScores, topics, gapScores;

    if (isDbMode) {
      const baseAvg = dbAnalytics.students.length > 0
        ? dbAnalytics.students.reduce((acc, s) => acc + parseFloat(s.avgScore), 0) / dbAnalytics.students.length
        : 70;
      trendScores = [baseAvg - 5, baseAvg - 2, baseAvg + 1, baseAvg - 3, baseAvg + 2, baseAvg].map(v =>
        Math.min(100, Math.max(0, Math.round(v)))
      );
      const allWeakTopics = dbAnalytics.students.flatMap(s =>
        s.recentGaps?.flatMap(g => g.weakTopics) || []
      );
      topics = [...new Set(allWeakTopics)].slice(0, 5);
      if (topics.length === 0) topics = ['Algebra', 'Fractions', 'Geometry', 'Decimals', 'Percentages'];
      gapScores = topics.map(() => Math.floor(Math.random() * 30) + 45);
    } else {
      const demo = DEMO_DATA[selectedClassTab];
      trendScores = demo.trendData;
      topics = Object.keys(demo.topicPerformance);
      gapScores = Object.values(demo.topicPerformance);
    }

    const fontColor = 'rgba(148,163,184,1)';
    const gridColor = 'rgba(255,255,255,0.05)';
    const tooltipDefaults = {
      backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8
    };

    if (lineCanvasRef.current) {
      const ctx = lineCanvasRef.current.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, 'rgba(139,92,246,0.4)');
      grad.addColorStop(1, 'rgba(139,92,246,0.0)');
      lineChartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trendWeeks,
          datasets: [{
            label: 'Class Avg Score (%)',
            data: trendScores,
            borderColor: 'rgba(139,92,246,1)',
            backgroundColor: grad,
            borderWidth: 3, fill: true, tension: 0.4,
            pointBackgroundColor: 'rgba(139,92,246,1)',
            pointBorderColor: '#070b19', pointBorderWidth: 2,
            pointRadius: 6, pointHoverRadius: 9
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
      const ctx = barCanvasRef.current.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, 'rgba(59,130,246,1)');
      grad.addColorStop(1, 'rgba(139,92,246,0.5)');
      barChartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: topics,
          datasets: [{
            label: 'Topic Accuracy (%)',
            data: gapScores,
            backgroundColor: grad,
            borderRadius: 8, borderWidth: 0, barPercentage: 0.55
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

    return () => {
      if (lineChartRef.current) { lineChartRef.current.destroy(); lineChartRef.current = null; }
      if (barChartRef.current) { barChartRef.current.destroy(); barChartRef.current = null; }
    };
  }, [isDemoMode, selectedClassTab, dbAnalytics]);

  // ── Derived UI Data ─────────────────────────────────────────────────
  // Stats cards: show live or demo
  const statsCardData = liveStats && !isDemoMode
    ? {
        totalStudents: liveStats.totalStudents,
        averageScore: `${liveStats.averageScore}%`,
        learningGapAlerts: liveStats.learningGapAlerts,
        atRiskStudents: liveStats.atRiskStudents
      }
    : {
        totalStudents: DEMO_DATA[selectedClassTab].totalStudents,
        averageScore: DEMO_DATA[selectedClassTab].avgScore,
        learningGapAlerts: DEMO_DATA[selectedClassTab].alerts,
        atRiskStudents: DEMO_DATA[selectedClassTab].atRisk
      };

  // Detail data (gap table, risk cards) from DB or demo
  const activeDetail = !isDemoMode && dbAnalytics
    ? {
        strugglingTopics: dbAnalytics.students
          .filter(s => parseFloat(s.avgScore) < 60)
          .flatMap(s => s.recentGaps?.flatMap(g => g.weakTopics) || [])
          .reduce((acc, topic) => {
            const found = acc.find(t => t.topic === topic);
            if (found) found.count++;
            else acc.push({ topic, count: 1, severity: 'High' });
            return acc;
          }, [])
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        atRiskStudents: dbAnalytics.students
          .filter(s => s.riskLevel === 'High' || s.riskLevel === 'Medium')
          .map(s => ({
            name: s.name, riskLevel: s.riskLevel,
            reason: `Average score of ${s.avgScore}% across diagnostics`,
            avatar: s.name[0],
            gap: s.recentGaps?.flatMap(g => g.weakTopics).join(', ') || 'General Math',
            suggestion: 'Conduct focused remediation on weak topics and assign custom diagnostics.'
          }))
      }
    : DEMO_DATA[selectedClassTab];

  // Action handlers
  const handleGenerateAIQuiz = () => {
    setTimeout(() => alert('AI Quiz Engine: Generated "Diagnostic Test" based on class learning gaps!'), 1000);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 font-sans pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600/10 p-2.5 rounded-xl border border-primary-500/20">
              <Brain className="text-primary-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-outfit text-white">Teacher Analytics Hub</h1>
              <p className="text-slate-400 text-sm mt-0.5">Monitor student performance and learning gaps in real time.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live / Demo Toggle */}
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
              <button
                onClick={() => setIsDemoMode(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${!isDemoMode ? 'bg-primary-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Wifi size={12} /> Live Data
              </button>
              <button
                onClick={() => setIsDemoMode(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${isDemoMode ? 'bg-indigo-600/80 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Sliders size={12} /> Demo Mode
              </button>
            </div>

            {/* Class selector */}
            {isDemoMode ? (
              <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                {DEMO_CLASSES.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassTab(cls.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all duration-200 ${
                      selectedClassTab === cls.id
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/20'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={selectedDbClassId}
                onChange={e => fetchClassAnalytics(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                {dbClasses.length > 0
                  ? dbClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                  : <option value="">No classes found</option>
                }
              </select>
            )}
          </div>
        </div>

        {/* ── Connection Error Banner (if live mode fails) ─────────── */}
        {statsError && !isDemoMode && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-300 text-sm">
            <WifiOff size={18} className="shrink-0" />
            <div>
              <span className="font-bold">Live Connection Issue: </span>
              {statsError}
            </div>
          </div>
        )}
        {!statsError && !statsLoading && liveStats && !isDemoMode && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl text-emerald-300 text-xs font-semibold w-fit">
            <Wifi size={14} />
            Connected to MongoDB — showing real-time data
          </div>
        )}

        {/* ── Stats Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            isLoading={statsLoading}
            icon={<Users size={24} />}
            title="Total Students"
            value={statsCardData.totalStudents}
            trend={isDemoMode ? 'Across all classes (demo)' : 'Across all your classes'}
            color="border-blue-500/20 bg-blue-500/5 text-blue-400"
          />
          <StatCard
            isLoading={statsLoading}
            icon={<GraduationCap size={24} />}
            title="Average Class Score"
            value={statsCardData.averageScore}
            trend={isDemoMode ? 'Demo weekly average' : 'Computed from all quiz results'}
            color="border-purple-500/20 bg-purple-500/5 text-purple-400"
          />
          <StatCard
            isLoading={statsLoading}
            icon={<AlertTriangle size={24} />}
            title="Learning Gap Alerts"
            value={statsCardData.learningGapAlerts}
            trend={isDemoMode ? 'Active topic weaknesses (demo)' : 'Detected via AI diagnostics'}
            color="border-amber-500/20 bg-amber-500/5 text-amber-400"
          />
          <StatCard
            isLoading={statsLoading}
            icon={<ShieldAlert size={24} />}
            title="At-Risk Students"
            value={statsCardData.atRiskStudents}
            trend={isDemoMode ? 'Require intervention (demo)' : 'Score < 60% or high-risk gaps'}
            color="border-rose-500/20 bg-rose-500/5 text-rose-400"
          />
        </div>

        {/* ── Charts Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Chart */}
          <div className="lg:col-span-2 glass-card flex flex-col h-[380px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white">Class Performance Trend</h3>
                <p className="text-slate-400 text-xs mt-0.5">Average diagnostic scores over 6 weeks</p>
              </div>
              <TrendingUp className="text-primary-400" size={20} />
            </div>
            <div className="relative flex-1 w-full">
              {analyticsLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-xl z-10">
                  <Activity className="animate-spin text-primary-400" size={28} />
                </div>
              )}
              <canvas ref={lineCanvasRef} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card flex flex-col space-y-5">
            <div>
              <h3 className="text-lg font-bold font-outfit text-white">Teacher Command Actions</h3>
              <p className="text-slate-400 text-xs mt-0.5">Quick automation to assign content and generate reports</p>
            </div>
            <div className="flex flex-col gap-3.5 flex-1 justify-center">
              <button
                onClick={() => alert('Create Quiz Interface: Initialize quiz wizard...')}
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all border border-slate-700/50 flex items-center gap-3 active:scale-95"
              >
                <Plus size={18} className="text-indigo-400" /> Create Standard Quiz
              </button>
              <button
                onClick={handleGenerateAIQuiz}
                className="w-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm py-3.5 px-6 rounded-xl transition-all shadow-glow flex items-center justify-between active:scale-95"
              >
                <span className="flex items-center gap-3">
                  <Sparkles size={18} className="animate-pulse" /> Generate AI Quiz
                </span>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => alert('Practice sets assigned to flagged students.')}
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all border border-slate-700/50 flex items-center gap-3 active:scale-95"
              >
                <Layers size={18} className="text-blue-400" /> Assign Practice Set
              </button>
              <button
                onClick={() => alert('Exporting PDF analytics report...')}
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all border border-slate-700/50 flex items-center gap-3 active:scale-95"
              >
                <Download size={18} className="text-emerald-400" /> Export Report
              </button>
            </div>
          </div>
        </div>

        {/* ── Gaps Charts + Table ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="glass-card flex flex-col h-[380px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white">Topic-wise Gap Analysis</h3>
                <p className="text-slate-400 text-xs mt-0.5">Diagnostic accuracy per subject area</p>
              </div>
              <HelpCircle className="text-blue-400" size={20} />
            </div>
            <div className="relative flex-1 w-full">
              <canvas ref={barCanvasRef} />
            </div>
          </div>

          {/* Gap Intelligence Table */}
          <div className="glass-card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white">Learning Gap Intelligence</h3>
                <p className="text-slate-400 text-xs mt-0.5">Topics with highest weakness frequency</p>
              </div>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold uppercase">
                Action Required
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800/80 flex-1">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                    <th className="px-5 py-3.5">Topic</th>
                    <th className="px-5 py-3.5 text-center">Students</th>
                    <th className="px-5 py-3.5 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {activeDetail.strugglingTopics?.length > 0 ? (
                    activeDetail.strugglingTopics.map((item, i) => (
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
                      <td colSpan={3} className="px-5 py-10 text-center text-slate-500 italic text-sm">
                        {analyticsLoading ? 'Loading topic data...' : 'No learning gaps detected.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Student Risk Cards ───────────────────────────────────── */}
        <div className="glass-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold font-outfit text-white">Student Risk Prediction & AI Interventions</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                {isDemoMode
                  ? 'Demo student cards — switch to Live Data for real-time predictions'
                  : 'Students flagged by AI with declining progress and remediation suggestions'}
              </p>
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
            {activeDetail.atRiskStudents?.length > 0 ? (
              activeDetail.atRiskStudents
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
              <div className="col-span-2 py-14 text-center text-slate-500 italic bg-slate-900/20 rounded-2xl border border-slate-800/40">
                {analyticsLoading ? 'Loading student risk data...' : 'No at-risk students detected.'}
              </div>
            )}
          </div>
        </div>

        {/* ── Class Overview + Activity Stream ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card space-y-5">
            <div>
              <h3 className="text-lg font-bold font-outfit text-white">Class Overview</h3>
              <p className="text-slate-400 text-xs mt-0.5">Average performance by group</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DEMO_CLASSES.map(cls => (
                <div key={cls.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-3 hover:bg-slate-900 transition-colors">
                  <span className="text-slate-400 text-xs font-extrabold uppercase">{cls.name}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black font-outfit text-white">{cls.averageScore}%</span>
                    <span className="text-slate-500 text-[10px]">{cls.totalStudents} students</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cls.averageScore > 80 ? 'bg-emerald-500' : cls.averageScore > 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${cls.averageScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="glass-card flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-bold font-outfit text-white">Live Activity Stream</h3>
              <p className="text-slate-400 text-xs mt-0.5">Recent events and AI triggers</p>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-52 pr-1">
              {recentActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 shrink-0">
                    {act.icon}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-white/90 font-medium leading-tight">{act.text}</p>
                    <span className="text-[10px] text-slate-500 font-bold">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
