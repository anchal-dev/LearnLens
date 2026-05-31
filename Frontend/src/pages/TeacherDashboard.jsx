import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, BookOpen, AlertTriangle, Search, 
  Filter, MoreVertical, ShieldAlert, CheckCircle
} from 'lucide-react';

const TeacherDashboard = () => {
  const { API_URL } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_URL}/teacher/classes`);
        setClasses(res.data);
        if (res.data.length > 0) {
          fetchAnalytics(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const fetchAnalytics = async (classId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/teacher/analytics/${classId}`);
      setAnalytics(res.data);
      setSelectedClass(classes.find(c => c._id === classId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teacher Analytics Hub</h1>
          <p className="text-slate-400">Monitoring performance across {classes.length} classes.</p>
        </div>
        <div className="flex gap-4">
          <select 
            onChange={(e) => fetchAnalytics(e.target.value)}
            className="input-field py-2 !w-auto"
          >
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button className="btn-primary flex items-center gap-2">
            <BookOpen size={18} /> New Quiz
          </button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard 
              icon={<Users className="text-primary-400" />} 
              title="Total Students" 
              value={analytics.totalStudents} 
            />
            <StatCard 
              icon={<MoreVertical className="text-rose-400" />} 
              title="At Risk" 
              value={analytics.students.filter(s => s.riskLevel === 'High').length} 
            />
            <StatCard 
              icon={<CheckCircle className="text-emerald-400" />} 
              title="Class Average" 
              value={`${(analytics.students.reduce((acc, s) => acc + parseFloat(s.avgScore), 0) / analytics.students.length || 0).toFixed(1)}%`} 
            />
          </div>

          {/* Student Risk Table */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between mb-6 p-2">
              <h3 className="text-xl font-bold">Student Performance Matrix</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  className="bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-700 text-slate-500 uppercase text-xs">
                    <th className="px-4 py-4 font-semibold">Student Name</th>
                    <th className="px-4 py-4 font-semibold">Avg Score</th>
                    <th className="px-4 py-4 font-semibold">Risk Level</th>
                    <th className="px-4 py-4 font-semibold">Learning Gaps</th>
                    <th className="px-4 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {analytics.students.map((student, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-xs font-bold">
                          {student.name[0]}
                        </div>
                        <span className="font-medium">{student.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${student.avgScore > 70 ? 'bg-emerald-500' : student.avgScore > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{ width: `${student.avgScore}%` }} 
                            />
                          </div>
                          <span className="text-sm">{student.avgScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskBadgeStyles(student.riskLevel)}`}>
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {student.recentGaps.length > 0 ? (
                            student.recentGaps.flatMap(g => g.weakTopics.slice(0, 2)).map((t, j) => (
                              <span key={j} className="bg-dark-800 text-[10px] px-2 py-0.5 rounded border border-dark-700">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 italic text-xs">No data</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-primary-400 hover:text-primary-300 font-medium text-sm">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="glass-card flex items-center gap-4">
    <div className="bg-white/5 p-4 rounded-2xl">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const riskBadgeStyles = (level) => {
  switch (level) {
    case 'High': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  }
};

export default TeacherDashboard;
