import React from 'react';

interface FooterProps {
  setView?: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  const handleClick = (e: React.MouseEvent, view: string) => {
    e.preventDefault();
    if (setView) setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-slate-400 py-24 px-8 border-t border-slate-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
        <div className="flex flex-col gap-8 max-w-sm">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={(e) => handleClick(e, 'home')}>
            <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-display font-black text-lg group-hover:bg-indigo-600 transition-all duration-500">R</div>
            <span className="font-display font-bold text-2xl tracking-tighter text-slate-950">Readability<span className="text-indigo-600">Pro</span></span>
          </div>
          <p className="text-lg text-slate-500 font-medium leading-relaxed tracking-tight">
            Elevating the art of the written word through scientific precision and world-class AI.
          </p>
        </div>

        <div className="flex flex-wrap gap-20 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex flex-col gap-6">
            <h5 className="text-slate-950 opacity-100">Product</h5>
            <button onClick={(e) => handleClick(e, 'features')} className="text-left hover:text-indigo-600 transition-colors">Architecture</button>
            <button onClick={(e) => handleClick(e, 'pricing')} className="text-left hover:text-indigo-600 transition-colors">Pricing</button>
            <button onClick={(e) => handleClick(e, 'api')} className="text-left hover:text-indigo-600 transition-colors">Developer Portal</button>
          </div>
          <div className="flex flex-col gap-6">
            <h5 className="text-slate-950 opacity-100">Foundation</h5>
            <button onClick={(e) => handleClick(e, 'about')} className="text-left hover:text-indigo-600 transition-colors">Ethos</button>
            <button onClick={(e) => handleClick(e, 'privacy')} className="text-left hover:text-indigo-600 transition-colors">Privacy</button>
            <button onClick={(e) => handleClick(e, 'terms')} className="text-left hover:text-indigo-600 transition-colors">Legal</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] uppercase tracking-[0.3em] font-black opacity-40">
        <div>&copy; {new Date().getFullYear()} ReadabilityPro. Precision Intelligence Workspace.</div>
        <div className="flex gap-8">
          <span>Twitter</span>
          <span>LinkedIn</span>
          <span>GitHub</span>
        </div>
      </div>
    </footer>
  );
};
