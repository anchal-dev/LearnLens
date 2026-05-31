import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, BrainCircuit, User as UserIcon, BookOpen, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/10">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-primary-600 p-2 rounded-lg">
          <BrainCircuit className="text-white" size={24} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white italic font-outfit">LearnLens <span className="text-primary-500">AI</span></span>
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {user ? (
          <>
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-2 hover:text-primary-400 transition-all font-medium ${isActive ? 'text-primary-500' : 'text-slate-400'}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            {user.role === 'student' && (
              <NavLink to="/tutor" className={({isActive}) => `flex items-center gap-2 hover:text-primary-400 transition-all font-medium ${isActive ? 'text-primary-500' : 'text-slate-400'}`}>
                <BrainCircuit size={18} /> AI Tutor
              </NavLink>
            )}
            <div className="flex items-center gap-6 border-l border-white/10 pl-10 ml-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user.role}</p>
              </div>
              <button 
                onClick={logout} 
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all border border-rose-500/20"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors font-medium">Login</Link>
            <Link to="/register" className="btn-primary flex items-center gap-2 px-8">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
