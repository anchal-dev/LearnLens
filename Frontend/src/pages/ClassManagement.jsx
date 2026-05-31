import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Users, Plus, Trash2, UserPlus, UserMinus, BookOpen,
  ChevronRight, ChevronLeft, X, Search, Layers,
  GraduationCap, AlertCircle, CheckCircle, Loader2,
  Building2, FlaskConical, TrendingUp, ArrowLeft
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLASS_OPTIONS = [
  'Class 10',
  'Class 11 Science',
  'Class 11 Commerce',
  'Class 12 Science',
  'Class 12 Commerce'
];

const STREAM_COLORS = {
  General:  { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  Science:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Commerce: { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',  dot: 'bg-amber-400' },
};

const streamFromName = (name) => {
  if (name.includes('Science'))  return 'Science';
  if (name.includes('Commerce')) return 'Commerce';
  return 'General';
};

const avatarColor = (char) => {
  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
  ];
  return colors[(char?.charCodeAt(0) ?? 0) % colors.length];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = type === 'success'
    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
    : 'bg-red-500/20 border-red-500/40 text-red-300';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${styles} animate-fade-in`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="animate-spin text-purple-400" size={32} />
  </div>
);

const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/20">
      <Icon size={36} className="text-purple-400" />
    </div>
    <p className="text-xl font-bold text-white">{title}</p>
    <p className="text-slate-400 max-w-xs text-sm leading-relaxed">{desc}</p>
  </div>
);

// ─── Create Class Modal ───────────────────────────────────────────────────────

const CreateClassModal = ({ onClose, onCreate }) => {
  const [name, setName]       = useState('Class 10');
  const [section, setSection] = useState('A');
  const [desc, setDesc]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!section.trim()) { setError('Section is required'); return; }
    setLoading(true);
    try {
      await onCreate({ name, section: section.toUpperCase(), description: desc });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const stream = streamFromName(name);
  const sc = STREAM_COLORS[stream];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#0f1629] border border-white/10 rounded-3xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">Create New Class</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add a class to your teaching roster</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Class Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Name</label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all text-sm"
            >
              {CLASS_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0f1629]">{opt}</option>
              ))}
            </select>
          </div>

          {/* Stream badge preview */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${sc.bg} ${sc.border}`}>
            <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
            <span className={`text-xs font-bold ${sc.text}`}>Stream: {stream}</span>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value.toUpperCase())}
              placeholder="e.g. A, B, C"
              maxLength={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description <span className="text-slate-600">(optional)</span></label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short description for this class..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-all text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Add Student Modal ────────────────────────────────────────────────────────

const AddStudentModal = ({ cls, onClose, onAdd }) => {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter a student email'); return; }
    setLoading(true);
    try {
      await onAdd(cls._id, email.trim().toLowerCase());
      setEmail('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-[#0f1629] border border-white/10 rounded-3xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">Add Student</h2>
            <p className="text-xs text-slate-500 mt-0.5">{cls.name} – Section {cls.section}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Class Card ───────────────────────────────────────────────────────────────

const ClassCard = ({ cls, onView, onDelete }) => {
  const stream = cls.stream || streamFromName(cls.name);
  const sc = STREAM_COLORS[stream] || STREAM_COLORS.General;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] hover:border-purple-500/30 transition-all duration-300 group cursor-pointer flex flex-col gap-4"
      onClick={() => onView(cls)}>

      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="text-purple-400" size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-tight">{cls.name}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Section {cls.section}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(cls._id); }}
          className="p-2 rounded-xl bg-red-500/0 hover:bg-red-500/10 text-slate-600 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Stream Badge */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border w-fit ${sc.bg} ${sc.border} ${sc.text}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
        {stream}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={15} />
          <span className="text-sm font-bold text-white">{cls.students?.length ?? 0}</span>
          <span className="text-xs">students</span>
        </div>
        <div className="flex items-center gap-1 text-purple-400 text-xs font-bold group-hover:gap-2 transition-all">
          View Details <ChevronRight size={14} />
        </div>
      </div>

      {cls.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 -mt-1">{cls.description}</p>
      )}
    </div>
  );
};

// ─── Class Detail Panel ───────────────────────────────────────────────────────

const ClassDetailPanel = ({ cls, onBack, onAddStudent, onRemoveStudent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [removing, setRemoving]       = useState(null);

  const stream = cls.stream || streamFromName(cls.name);
  const sc = STREAM_COLORS[stream] || STREAM_COLORS.General;

  const filtered = (cls.students || []).filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = async (studentId) => {
    setRemoving(studentId);
    await onRemoveStudent(cls._id, studentId);
    setRemoving(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            All Classes
          </button>
          <div className="h-5 w-px bg-white/10" />
          <div>
            <h2 className="text-2xl font-black text-white">{cls.name} – <span className="text-purple-400">Section {cls.section}</span></h2>
            <div className={`inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-lg text-xs font-bold border ${sc.bg} ${sc.border} ${sc.text}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {stream}
            </div>
          </div>
        </div>
        <button
          onClick={() => onAddStudent(cls)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95 text-sm"
        >
          <UserPlus size={16} /> Add Student
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: cls.students?.length ?? 0, icon: <Users size={18} className="text-purple-400" /> },
          { label: 'Stream', value: stream, icon: <FlaskConical size={18} className="text-blue-400" /> },
          { label: 'Section', value: cls.section, icon: <Building2 size={18} className="text-emerald-400" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">{icon}</div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">{label}</p>
              <p className="text-base font-black text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Student List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name or email..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? 'No students found' : 'No students yet'}
            desc={searchQuery ? 'Try a different name or email.' : 'Add students to this class using the button above.'}
          />
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((student, i) => (
              <div
                key={student._id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all group"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl ${avatarColor(student.name?.[0])} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                  {student.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{student.name}</p>
                  <p className="text-xs text-slate-500 truncate">{student.email}</p>
                </div>
                {/* Index badge */}
                <span className="text-xs text-slate-600 font-mono hidden sm:block">#{String(i + 1).padStart(2, '0')}</span>
                {/* Remove */}
                <button
                  onClick={() => handleRemove(student._id)}
                  disabled={removing === student._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-slate-600 hover:text-red-400 transition-all text-xs font-bold opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {removing === student._id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <UserMinus size={14} />}
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ClassManagement = () => {
  const { API_URL } = useAuth();
  const token = localStorage.getItem('token');

  const [classes, setClasses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  // Modals
  const [showCreate, setShowCreate]     = useState(false);
  const [addStudentFor, setAddStudentFor] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch all classes ──────────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/teacher/classes`, { headers });
      setClasses(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  // ── Create class ───────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    const res = await axios.post(`${API_URL}/teacher/classes`, data, { headers });
    setClasses((prev) => [res.data, ...prev]);
    showToast(`${res.data.name} – Section ${res.data.section} created!`);
  };

  // ── Delete class ───────────────────────────────────────────────────────────
  const handleDelete = async (classId) => {
    const cls = classes.find((c) => c._id === classId);
    if (!window.confirm(`Delete "${cls?.name} – Section ${cls?.section}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_URL}/teacher/classes/${classId}`, { headers });
      setClasses((prev) => prev.filter((c) => c._id !== classId));
      if (selectedClass?._id === classId) setSelectedClass(null);
      showToast('Class deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  // ── View class detail (fetch fresh with students) ──────────────────────────
  const handleView = async (cls) => {
    try {
      const res = await axios.get(`${API_URL}/teacher/classes/${cls._id}`, { headers });
      setSelectedClass(res.data);
    } catch {
      setSelectedClass(cls); // fallback to cached data
    }
  };

  // ── Add student ────────────────────────────────────────────────────────────
  const handleAddStudent = async (classId, email) => {
    const res = await axios.post(`${API_URL}/teacher/classes/${classId}/students`, { email }, { headers });
    // Refresh selected class view
    setSelectedClass(res.data);
    // Update list count
    setClasses((prev) => prev.map((c) => c._id === classId ? { ...c, students: res.data.students } : c));
    showToast('Student added successfully!');
  };

  // ── Remove student ─────────────────────────────────────────────────────────
  const handleRemoveStudent = async (classId, studentId) => {
    try {
      const res = await axios.delete(`${API_URL}/teacher/classes/${classId}/students/${studentId}`, { headers });
      setSelectedClass(res.data);
      setClasses((prev) => prev.map((c) => c._id === classId ? { ...c, students: res.data.students } : c));
      showToast('Student removed from class.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Remove failed', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      {/* Background radial glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* ── Page Header ── */}
        {!selectedClass && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/25">
                  <Layers className="text-purple-400" size={22} />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Class Management</h1>
              </div>
              <p className="text-slate-400 text-sm">Create and manage your classes, enroll students, and track rosters.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-purple-600/25 active:scale-95"
            >
              <Plus size={18} /> New Class
            </button>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <Spinner />
        ) : selectedClass ? (
          <ClassDetailPanel
            cls={selectedClass}
            onBack={() => setSelectedClass(null)}
            onAddStudent={(cls) => setAddStudentFor(cls)}
            onRemoveStudent={handleRemoveStudent}
          />
        ) : classes.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No classes yet"
            desc="Click 'New Class' to create your first class and start adding students."
          />
        ) : (
          <>
            {/* Summary Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                <Layers size={15} className="text-purple-400" />
                <span className="text-sm font-bold text-white">{classes.length}</span>
                <span className="text-xs text-slate-500">classes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                <Users size={15} className="text-blue-400" />
                <span className="text-sm font-bold text-white">
                  {classes.reduce((acc, c) => acc + (c.students?.length ?? 0), 0)}
                </span>
                <span className="text-xs text-slate-500">total students</span>
              </div>
            </div>

            {/* Class Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((cls) => (
                <ClassCard
                  key={cls._id}
                  cls={cls}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
              {/* Add New Card */}
              <button
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-2xl p-8 text-slate-600 hover:text-purple-400 transition-all duration-300 group min-h-[200px]"
              >
                <div className="p-4 rounded-2xl bg-white/0 group-hover:bg-purple-500/10 border border-white/0 group-hover:border-purple-500/20 transition-all duration-300">
                  <Plus size={28} />
                </div>
                <span className="text-sm font-bold">Create New Class</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateClassModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
      {addStudentFor && (
        <AddStudentModal
          cls={addStudentFor}
          onClose={() => setAddStudentFor(null)}
          onAdd={handleAddStudent}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default ClassManagement;
