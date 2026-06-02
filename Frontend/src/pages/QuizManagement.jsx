import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Sparkles, Edit3, Trash2, BookOpen, Clock, Calendar,
  ChevronLeft, ChevronRight, X, Check, AlertTriangle, Loader2,
  Brain, BarChart2, Layers, GraduationCap, Zap, Eye, EyeOff,
  ArrowLeft
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Accountancy', 'Computer Science', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [3, 5, 8, 10, 15, 20];

const DIFF_STYLE = {
  Easy:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard:   'bg-red-500/10 text-red-400 border-red-500/20'
};

const EMPTY_QUESTION = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOption: 0,
  explanation: '',
  topic: ''
});

const EMPTY_FORM = {
  title: '', subject: '', topic: '', description: '',
  classId: '', difficulty: 'Medium', duration: 30, dueDate: '',
  questions: [EMPTY_QUESTION()]
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const QuizSkeleton = () => (
  <div className="glass-card animate-pulse space-y-3">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-4 w-3/4 bg-slate-800 rounded-full" />
        <div className="h-3 w-1/2 bg-slate-800 rounded-full" />
      </div>
      <div className="h-6 w-16 bg-slate-800 rounded-lg ml-3" />
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-20 bg-slate-800 rounded-full" />
      <div className="h-5 w-20 bg-slate-800 rounded-full" />
    </div>
    <div className="flex gap-2 pt-2 border-t border-slate-800">
      <div className="h-8 w-16 bg-slate-800 rounded-lg" />
      <div className="h-8 w-16 bg-slate-800 rounded-lg" />
    </div>
  </div>
);

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

const DeleteDialog = ({ quiz, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <div className="glass-card max-w-md w-full space-y-5 border border-red-500/30">
      <div className="flex items-center gap-3">
        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          <AlertTriangle className="text-red-400" size={22} />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Delete Quiz</h3>
          <p className="text-slate-400 text-sm">This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm">
        Are you sure you want to delete <span className="font-bold text-white">"{quiz?.title}"</span>?
        All associated data will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-all border border-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Question Builder ──────────────────────────────────────────────────────────

const QuestionBuilder = ({ questions, onChange, topicDefault }) => {
  const update = (idx, field, value) => {
    const updated = questions.map((q, i) => i === idx ? { ...q, [field]: value } : q);
    onChange(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    });
    onChange(updated);
  };

  const addQuestion = () => {
    const newQ = EMPTY_QUESTION();
    newQ.topic = topicDefault || '';
    onChange([...questions, newQ]);
  };

  const removeQuestion = (idx) => {
    if (questions.length === 1) return;
    onChange(questions.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">Question {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeQuestion(idx)}
              disabled={questions.length === 1}
              className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-30"
            >
              <X size={16} />
            </button>
          </div>

          <textarea
            rows={2}
            placeholder="Enter question text..."
            value={q.questionText}
            onChange={e => update(idx, 'questionText', e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 resize-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update(idx, 'correctOption', optIdx)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    q.correctOption === optIdx
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {q.correctOption === optIdx && <Check size={12} className="text-white" />}
                </button>
                <input
                  type="text"
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                  value={opt}
                  onChange={e => updateOption(idx, optIdx, e.target.value)}
                  className="flex-1 bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Topic (e.g. Algebra)"
              value={q.topic}
              onChange={e => update(idx, 'topic', e.target.value)}
              className="bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
            />
            <input
              type="text"
              placeholder="Explanation (optional)"
              value={q.explanation}
              onChange={e => update(idx, 'explanation', e.target.value)}
              className="bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full border border-dashed border-slate-700 hover:border-primary-500 text-slate-400 hover:text-primary-400 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
};

// ─── Quiz Form Modal ───────────────────────────────────────────────────────────

const QuizFormModal = ({ mode, editQuiz, classes, classesLoading, onClose, onSave }) => {
  const [form, setForm] = useState(
    editQuiz
      ? {
          title: editQuiz.title || '',
          subject: editQuiz.subject || '',
          topic: editQuiz.topic || '',
          description: editQuiz.description || '',
          classId: editQuiz.class?._id || '',
          difficulty: editQuiz.difficulty || 'Medium',
          duration: editQuiz.duration || 30,
          dueDate: editQuiz.dueDate ? editQuiz.dueDate.split('T')[0] : '',
          questions: editQuiz.questions?.length > 0 ? editQuiz.questions : [EMPTY_QUESTION()]
        }
      : { ...EMPTY_FORM, questions: [EMPTY_QUESTION()] }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Title is required.');
    if (!form.subject) return setError('Subject is required.');
    if (!form.topic.trim()) return setError('Topic is required.');
    if (!form.classId) return setError('Please select a class.');
    if (form.questions.length === 0) return setError('Add at least one question.');

    const hasEmptyQ = form.questions.some(
      q => !q.questionText.trim() || q.options.some(o => !o.trim()) || !q.topic.trim()
    );
    if (hasEmptyQ) return setError('All question fields must be filled in.');

    setSaving(true);
    try {
      await onSave(form, editQuiz?._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-[#0c1225] border-l border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600/10 p-2 rounded-xl border border-primary-500/20">
              <BookOpen className="text-primary-400" size={20} />
            </div>
            <div>
              <h2 className="font-black text-white font-outfit text-lg">
                {editQuiz ? 'Edit Quiz' : 'Create Standard Quiz'}
              </h2>
              <p className="text-slate-500 text-xs">Fill in all fields and add questions</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Quiz Title *</label>
              <input
                type="text"
                placeholder="e.g. Chapter 5 Diagnostic Quiz"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Subject *</label>
              <select
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">Select subject...</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Topic *</label>
              <input
                type="text"
                placeholder="e.g. Quadratic Equations"
                value={form.topic}
                onChange={e => set('topic', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Class *</label>
              <select
                value={form.classId}
                onChange={e => set('classId', e.target.value)}
                disabled={classesLoading}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 disabled:opacity-60"
              >
                <option value="">
                  {classesLoading ? 'Loading classes...' : classes.length === 0 ? 'No classes found — create one first' : 'Select class...'}
                </option>
                {!classesLoading && classes.map(c => (
                  <option key={c._id} value={c._id}>{c.name}{c.section ? ` – Sec ${c.section}` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('difficulty', d)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      form.difficulty === d ? DIFF_STYLE[d] : 'border-slate-700 text-slate-500 hover:border-slate-500'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Duration (min)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={form.duration}
                onChange={e => set('duration', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                rows={2}
                placeholder="Optional description..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Questions ({form.questions.length})
              </label>
            </div>
            <QuestionBuilder
              questions={form.questions}
              onChange={q => set('questions', q)}
              topicDefault={form.topic}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {editQuiz ? 'Save Changes' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── AI Generate Modal ─────────────────────────────────────────────────────────

const AIGenerateModal = ({ classes, classesLoading, onClose, onSave }) => {
  const [form, setForm] = useState({
    subject: '', topic: '', difficulty: 'Medium',
    count: 5, classId: '', title: '', duration: 30, dueDate: ''
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const { API_URL } = useAuth();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.subject) return setError('Subject is required.');
    if (!form.topic.trim()) return setError('Topic is required.');
    if (!form.classId) return setError('Please select a class.');

    setGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/quiz/generate-ai`, {
        ...form,
        title: form.title || `AI Quiz: ${form.topic}`
      });
      setGeneratedQuiz(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(generatedQuiz);
    } catch (err) {
      setError('Failed to save quiz.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-[#0c1225] border-l border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/10 p-2 rounded-xl border border-purple-500/20">
              <Sparkles className="text-purple-400 animate-pulse" size={20} />
            </div>
            <div>
              <h2 className="font-black text-white font-outfit text-lg">Generate AI Quiz</h2>
              <p className="text-slate-500 text-xs">Gemini AI will create questions for you</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {!generatedQuiz ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 text-sm text-purple-300">
                <p className="font-semibold flex items-center gap-2 mb-1"><Zap size={14} /> How it works</p>
                <p className="text-slate-400 text-xs leading-relaxed">Fill in the subject, topic and difficulty. Gemini AI generates diagnostic MCQ questions. Review them before saving to MongoDB.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Quiz Title (optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Subject *</label>
                  <select
                    value={form.subject}
                    onChange={e => set('subject', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Topic *</label>
                  <input
                    type="text"
                    placeholder="e.g. Newton's Laws of Motion"
                    value={form.topic}
                    onChange={e => set('topic', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Class *</label>
                  <select
                    value={form.classId}
                    onChange={e => set('classId', e.target.value)}
                    disabled={classesLoading}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-60"
                  >
                    <option value="">
                      {classesLoading ? 'Loading classes...' : classes.length === 0 ? 'No classes found — create one first' : 'Select class...'}
                    </option>
                    {!classesLoading && classes.map(c => (
                      <option key={c._id} value={c._id}>{c.name}{c.section ? ` – Sec ${c.section}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Number of Questions</label>
                  <select
                    value={form.count}
                    onChange={e => set('count', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {QUESTION_COUNTS.map(n => <option key={n} value={n}>{n} questions</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set('difficulty', d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          form.difficulty === d ? DIFF_STYLE[d] : 'border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Duration (min)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={form.duration}
                    onChange={e => set('duration', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => set('dueDate', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="animate-pulse" />
                    Generate {form.count} Questions
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Check className="text-emerald-400 shrink-0" size={20} />
                <div>
                  <p className="text-emerald-300 font-bold text-sm">Quiz Generated Successfully!</p>
                  <p className="text-slate-400 text-xs">{generatedQuiz.questions?.length} questions on "{generatedQuiz.topic}"</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {generatedQuiz.questions?.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <p className="text-sm font-semibold text-white">
                      <span className="text-primary-400 mr-2">Q{idx + 1}.</span>{q.questionText}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                            optIdx === q.correctOption
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-bold'
                              : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-slate-500 italic">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex gap-3 shrink-0">
          {generatedQuiz ? (
            <>
              <button
                type="button"
                onClick={() => setGeneratedQuiz(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Save to MongoDB
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Quiz Card ─────────────────────────────────────────────────────────────────

const QuizCard = ({ quiz, onEdit, onDelete }) => {
  const date = quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  const due = quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

  return (
    <div className="glass-card flex flex-col gap-4 hover:border-slate-700 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {quiz.isAIGenerated && (
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <Sparkles size={9} /> AI
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${DIFF_STYLE[quiz.difficulty] || DIFF_STYLE.Medium}`}>
              {quiz.difficulty}
            </span>
          </div>
          <h3 className="font-bold text-white text-base leading-tight truncate group-hover:text-primary-300 transition-colors">
            {quiz.title}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {quiz.subject} · {quiz.topic}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <BookOpen size={13} className="text-primary-400" />
          {quiz.questions?.length ?? 0} questions
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} className="text-blue-400" />
          {quiz.duration} min
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap size={13} className="text-emerald-400" />
          {quiz.class?.name}{quiz.class?.section ? ` – ${quiz.class.section}` : ''}
        </span>
        {due && (
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-amber-400" />
            Due {due}
          </span>
        )}
      </div>

      <div className="text-[10px] text-slate-600 font-semibold">Created {date}</div>

      <div className="flex gap-2 pt-3 border-t border-slate-800/60">
        <button
          onClick={() => onEdit(quiz)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-lg transition-all border border-slate-700"
        >
          <Edit3 size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(quiz)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs py-2 rounded-lg transition-all border border-red-500/20"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const QuizManagement = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filterClass, setFilterClass] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [search, setSearch] = useState('');

  // Fetch classes independently first so modals always have options
  const fetchClasses = useCallback(async () => {
    setClassesLoading(true);
    try {
      const res = await axios.get(`${API_URL}/teacher/classes`);
      setClasses(res.data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setClassesLoading(false);
    }
  }, [API_URL]);

  // Open modal from URL param — only AFTER classes are loaded
  useEffect(() => {
    if (classesLoading) return; // wait for classes first
    const mode = searchParams.get('mode');
    if (mode === 'create') setShowCreateModal(true);
    if (mode === 'ai')     setShowAIModal(true);
  }, [searchParams, classesLoading]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/quiz/teacher/mine`);
      setQuizzes(res.data);
    } catch (err) {
      setError('Failed to load quizzes. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchClasses();
    fetchData();
  }, [fetchClasses, fetchData]);


  // ── CRUD Handlers ──────────────────────────────────────────────────
  const handleCreate = async (form) => {
    const res = await axios.post(`${API_URL}/quiz`, {
      title:         form.title,
      subject:       form.subject,
      topic:         form.topic,
      description:   form.description,
      classId:       form.classId,
      questions:     form.questions,
      duration:      form.duration,
      dueDate:       form.dueDate || null,
      difficulty:    form.difficulty,
      isAIGenerated: false
    });
    setQuizzes(prev => [res.data, ...prev]);
    setShowCreateModal(false);
  };

  const handleUpdate = async (form, quizId) => {
    const res = await axios.put(`${API_URL}/quiz/${quizId}`, {
      title:       form.title,
      subject:     form.subject,
      topic:       form.topic,
      description: form.description,
      classId:     form.classId,
      questions:   form.questions,
      duration:    form.duration,
      dueDate:     form.dueDate || null,
      difficulty:  form.difficulty
    });
    setQuizzes(prev => prev.map(q => q._id === quizId ? res.data : q));
    setEditQuiz(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/quiz/${deleteTarget._id}`);
      setQuizzes(prev => prev.filter(q => q._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError('Failed to delete quiz.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAISave = async (generatedQuiz) => {
    setQuizzes(prev => [generatedQuiz, ...prev]);
    setShowAIModal(false);
  };

  // ── Filtered list ────────────────────────────────────────────────
  const filtered = quizzes.filter(q => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase());
    const matchClass  = !filterClass || q.class?._id === filterClass;
    const matchDiff   = !filterDiff  || q.difficulty === filterDiff;
    return matchSearch && matchClass && matchDiff;
  });

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 font-sans pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <Link to="/teacher" className="text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-800">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-primary-600/10 p-2.5 rounded-xl border border-primary-500/20">
                <Layers className="text-primary-400" size={26} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight font-outfit text-white">Quiz Management</h1>
                <p className="text-slate-400 text-sm mt-0.5">Create, edit and assign quizzes to your classes.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-all border border-slate-700 active:scale-95"
            >
              <Plus size={17} /> Create Standard Quiz
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm py-2.5 px-5 rounded-xl transition-all shadow-glow active:scale-95"
            >
              <Sparkles size={17} className="animate-pulse" /> Generate AI Quiz
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Quizzes',  value: quizzes.length,                                  icon: <BookOpen size={18} />,    color: 'text-blue-400' },
            { label: 'AI Generated',   value: quizzes.filter(q => q.isAIGenerated).length,     icon: <Sparkles size={18} />,    color: 'text-purple-400' },
            { label: 'Total Questions',value: quizzes.reduce((a, q) => a + (q.questions?.length || 0), 0), icon: <BarChart2 size={18} />, color: 'text-emerald-400' },
            { label: 'Classes Covered',value: new Set(quizzes.map(q => q.class?._id).filter(Boolean)).size, icon: <GraduationCap size={18} />, color: 'text-amber-400' }
          ].map(stat => (
            <div key={stat.label} className="glass-card flex items-center gap-3 py-4">
              <span className={stat.color}>{stat.icon}</span>
              <div>
                <p className="text-xl font-black text-white font-outfit">{loading ? '—' : stat.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
          />
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}{c.section ? ` – Sec ${c.section}` : ''}</option>)}
          </select>
          <select
            value={filterDiff}
            onChange={e => setFilterDiff(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm">
            <AlertTriangle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Quiz Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => <QuizSkeleton key={n} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card text-center py-20 space-y-4">
            <div className="bg-slate-800/60 p-4 w-16 h-16 rounded-2xl border border-slate-700 mx-auto flex items-center justify-center">
              <BookOpen className="text-slate-500" size={28} />
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                {quizzes.length === 0 ? 'No Quizzes Yet' : 'No Quizzes Match Filters'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {quizzes.length === 0
                  ? 'Create your first quiz or generate one with AI.'
                  : 'Try adjusting the search or filters above.'}
              </p>
            </div>
            {quizzes.length === 0 && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-all border border-slate-700"
                >
                  <Plus size={16} /> Create Quiz
                </button>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white font-black text-sm py-2.5 px-5 rounded-xl transition-all shadow-glow"
                >
                  <Sparkles size={16} /> Generate AI Quiz
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(quiz => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onEdit={q => setEditQuiz(q)}
                onDelete={q => setDeleteTarget(q)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreateModal || editQuiz) && (
        <QuizFormModal
          mode={editQuiz ? 'edit' : 'create'}
          editQuiz={editQuiz}
          classes={classes}
          classesLoading={classesLoading}
          onClose={() => { setShowCreateModal(false); setEditQuiz(null); }}
          onSave={editQuiz ? handleUpdate : handleCreate}
        />
      )}

      {showAIModal && (
        <AIGenerateModal
          classes={classes}
          classesLoading={classesLoading}
          onClose={() => setShowAIModal(false)}
          onSave={handleAISave}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          quiz={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default QuizManagement;
