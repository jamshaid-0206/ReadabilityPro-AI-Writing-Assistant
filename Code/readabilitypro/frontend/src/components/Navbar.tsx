import React from 'react';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';

interface NavbarProps {
  user: User | null;
  isPro: boolean;
  onLogin: () => void;
  onLogout: () => void;
  view: string;
  setView: (view: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, isPro, onLogin, onLogout, view, setView }) => {
  return (
    <nav id="main-nav" className="fixed top-6 left-1/2 -translate-x-1/2 h-20 w-[calc(100%-3rem)] max-w-7xl glass rounded-[2.5rem] z-50 px-8 flex items-center justify-between shadow-premium transition-all duration-300">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
        <div className="w-11 h-11 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-display font-black text-xl group-hover:bg-indigo-600 group-hover:-rotate-6 transition-all duration-500 shadow-xl shadow-indigo-500/20">
          R
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-display font-black tracking-tighter text-slate-950 leading-none">
            Readability<span className="text-indigo-600">Pro</span>
          </span>
          {user && (
            <span className={`text-[7px] font-black uppercase tracking-[0.3em] mt-1 ${isPro ? 'text-indigo-600' : 'text-slate-400'}`}>
              {isPro ? 'Premium Intelligence' : 'Standard Tier'}
            </span>
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {[
          { id: 'analyze', label: 'Editor' },
          { id: 'history', label: 'Archive', auth: true },
          { id: 'api', label: 'API' },
          { id: 'pricing', label: 'Plans' }
        ].filter(item => !item.auth || user).map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`hover:text-slate-950 transition-colors relative py-1 ${view === item.id ? 'text-slate-950' : ''}`}
          >
            {item.label}
            {view === item.id && (
              <motion.div 
                layoutId="nav-glow" 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_12px_3px_rgba(79,70,229,0.4)]" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-5">
        {user ? (
          <div className="flex items-center gap-5">
            {isPro ? (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                Elite Member
              </div>
            ) : (
              <button 
                onClick={() => setView('pricing')}
                className="hidden lg:block px-5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all"
              >
                Go Pro
              </button>
            )}
            <div 
              className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 font-display font-bold cursor-pointer hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
              onClick={onLogout}
              title="Sign Out"
            >
              {user.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="px-8 py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:translate-y-0 shadow-lg shadow-slate-900/10"
          >
            Join the Elite
          </button>
        )}
      </div>
    </nav>
  );
};
