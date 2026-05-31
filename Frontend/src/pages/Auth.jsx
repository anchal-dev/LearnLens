import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, User as UserIcon } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-dark-950 bg-gradient-premium relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md glass-card !p-12 relative z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-10 group">
             <div className="bg-primary-600 p-4 rounded-[2rem] shadow-glow transform group-hover:scale-110 transition-all duration-500">
               <BrainCircuit size={48} className="text-white" />
             </div>
          </Link>
          <h2 className="text-4xl font-black italic tracking-tighter font-outfit">Welcome back</h2>
          <p className="text-slate-500 mt-3 font-medium">Log in to continue your AI journey</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="email" placeholder="Email Address" required className="input-field pl-12" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="password" placeholder="Password" required className="input-field pl-12" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full py-4 text-lg">Sign In</button>
        </form>
        
        <p className="text-center text-slate-400 mt-8">
          New here? <Link to="/register" className="text-primary-400 font-bold hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      alert('Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-premium">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-card p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black italic">Create Account</h2>
          <p className="text-slate-400 mt-2">Start analyzing your learning gaps today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Full Name" required className="input-field pl-12" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="email" placeholder="Email Address" required className="input-field pl-12" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="password" placeholder="Password" required className="input-field pl-12" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setFormData({...formData, role: 'student'})} className={`py-4 rounded-xl border-2 transition-all font-bold ${formData.role === 'student' ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-dark-700 text-slate-500'}`}>Student</button>
            <button type="button" onClick={() => setFormData({...formData, role: 'teacher'})} className={`py-4 rounded-xl border-2 transition-all font-bold ${formData.role === 'teacher' ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-dark-700 text-slate-500'}`}>Teacher</button>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-lg">Join LearnLens</button>
        </form>
        
        <p className="text-center text-slate-400 mt-8">
          Already have an account? <Link to="/login" className="text-primary-400 font-bold hover:underline">Log in here</Link>
        </p>
      </motion.div>
    </div>
  );
};
