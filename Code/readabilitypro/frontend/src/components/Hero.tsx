import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Wand2, BarChart3, Fingerprint } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onBrowseAPI: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onBrowseAPI }) => {
  return (
    <div id="hero-section" className="relative pt-40 pb-20 md:pt-60 md:pb-32 px-6 overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-950 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-12 shadow-2xl shadow-indigo-500/20">
            <Sparkles className="w-3 h-3 text-indigo-400" /> V2.0 Enterprise Release
          </div>
          
          <h1 className="text-6xl md:text-9xl font-display font-bold text-slate-950 tracking-[-0.04em] leading-[0.9] mb-10 max-w-5xl mx-auto">
            Writing with <br />
            <span className="text-indigo-600">Pure Intent.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium tracking-tight">
            The professional workspace for linguistic precision. Analyze readability, optimize for SEO, and refine with world-class AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-5 bg-slate-950 text-white rounded-2xl font-display font-bold text-sm tracking-tight hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300 shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 group"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onBrowseAPI}
              className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-display font-bold text-sm tracking-tight hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
            >
              Developer API
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
          {[
            { icon: <BarChart3 className="w-5 h-5" />, title: "Precision Metrics", desc: "Scientific scoring using Flesch-Kincaid and Gunning Fog algorithms." },
            { icon: <Wand2 className="w-5 h-5" />, title: "AI Refinement", desc: "Multi-layered rewriting engines for formal, simple, or punchy narratives." },
            { icon: <Fingerprint className="w-5 h-5" />, title: "Secure Archive", desc: "Enterprise-grade security for your intellectual property and drafts." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
              className="p-10 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-premium hover:border-indigo-100 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.15em] mb-4">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium tracking-tight">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
