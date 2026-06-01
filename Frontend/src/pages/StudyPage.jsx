import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';

const StudyPage = () => {
  const { subjectId } = useParams();
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/study/subject/${subjectId}`);
        setSubjectData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Unable to load subject data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [API_URL, subjectId]);

  const markCompleted = async (chapterId) => {
    try {
      setSaving(true);
      await axios.post(`${API_URL}/study/progress`, {
        chapterId,
        status: 'completed',
        score: 100
      });
      const res = await axios.get(`${API_URL}/study/subject/${subjectId}`);
      setSubjectData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to update progress.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading study content...</div>;
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-red-400 font-semibold">{error}</p>
        <button onClick={() => navigate('/student')} className="btn-secondary px-6 py-3 rounded-2xl">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
      <button onClick={() => navigate('/student')} className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-200 mb-6">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-card p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-emerald-400 uppercase tracking-[0.2em] mb-2">{subjectData.subject.grade?.name || 'Grade'}</p>
            <h1 className="text-4xl font-bold mb-3">{subjectData.subject.title}</h1>
            <p className="text-slate-400 max-w-2xl">{subjectData.subject.description}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 text-center">
            <p className="text-sm text-slate-400">Progress</p>
            <p className="text-3xl font-bold mt-2">{subjectData.progressSummary.completedChapters}/{subjectData.progressSummary.totalChapters}</p>
            <p className="text-slate-500 mt-1">chapters completed</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="text-primary-400" size={20} />
              <h2 className="text-2xl font-bold">Chapters</h2>
            </div>
            <div className="space-y-4">
              {subjectData.chapters.map((chapter) => (
                <div key={chapter._id} className="rounded-3xl border border-white/10 bg-slate-950 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{chapter.title}</h3>
                      <p className="text-slate-400 mt-1">Status: <span className="text-white">{chapter.status}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      {chapter.status === 'completed' ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-emerald-300 text-sm">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      ) : (
                        <button
                          disabled={saving}
                          onClick={() => markCompleted(chapter._id)}
                          className="btn-primary px-4 py-2 rounded-2xl"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                  {chapter.summary && <p className="text-slate-400 mt-4">{chapter.summary}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles className="text-rose-400" size={20} />
              <h2 className="text-2xl font-bold">Notes & Quizzes</h2>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
                <p className="text-slate-400">Notes available</p>
                <p className="text-2xl font-bold mt-2">{subjectData.notes.length}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
                <p className="text-slate-400">Quizzes available</p>
                <p className="text-2xl font-bold mt-2">{subjectData.quizzes.length}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <p className="text-slate-400">Subject</p>
            <h3 className="text-2xl font-bold mt-2">{subjectData.subject.title}</h3>
            <p className="text-slate-500 mt-3">{subjectData.subject.shortTitle || subjectData.subject.description}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-slate-400">Next step</p>
            <p className="mt-3 text-white">Continue the next chapter to keep your progress moving.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudyPage;
