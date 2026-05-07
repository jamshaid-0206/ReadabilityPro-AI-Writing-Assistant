import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Code, Info, Lock, ScrollText } from 'lucide-react';

interface InfoPagesProps {
  view: 'features' | 'pricing' | 'api' | 'about' | 'privacy' | 'terms';
  onBack: () => void;
}

interface ContentItem {
  title: string;
  icon: React.ReactNode;
  text: string;
  details?: React.ReactNode;
}

import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';

export const InfoPages: React.FC<InfoPagesProps> = ({ view, onBack }) => {
  const { isPro, upgradeToPro, user } = useUser();
  const [upgrading, setUpgrading] = React.useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please sign in to upgrade your workspace.");
      return;
    }
    setUpgrading(true);
    toast.info("Processing your premium membership...", { duration: 2000 });
    try {
      await upgradeToPro();
      toast.success("Welcome to the Elite! Your workspace is now upgraded.");
    } catch (err) {
      toast.error("Failed to process upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const content: Record<string, ContentItem> = {
    features: {
      title: "The Architecture",
      icon: <Zap className="w-8 h-8 text-indigo-600" />,
      text: "ReadabilityPro is engineered for the modern attention economy. Our intelligence layer ensures your narrative remains precise, impactful, and mathematically optimized.",
      details: (
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <h4 className="text-[10px] font-black uppercase text-slate-950 mb-4 tracking-widest">Semantic Refinement</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed tracking-tight">Simplify complex jargon, rewrite for formal audiences, or create punchy social copy using our proprietary AI engines.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <h4 className="text-[10px] font-black uppercase text-slate-950 mb-4 tracking-widest">Linguistic SEO</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed tracking-tight">Mathematically ensure your content is scannable for search crawlers while remaining deeply engaging for human readers.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <h4 className="text-[10px] font-black uppercase text-slate-950 mb-4 tracking-widest">Cognitive Insights</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed tracking-tight">AI-driven heuristics to identify passive voice, syntactic complexity, and lexical redundancy in real-time.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <h4 className="text-[10px] font-black uppercase text-slate-950 mb-4 tracking-widest">Global Vault</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed tracking-tight">Securely archive and sync your intellectual property across our global encrypted infrastructure.</p>
          </div>
        </div>
      )
    },
    pricing: {
      title: "The Membership",
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      text: "Invest in linguistic clarity. Our simple tiers provide the transparency you need to scale your communications.",
      details: (
        <div className="mt-12 grid sm:grid-cols-2 gap-8">
          <div className="p-10 border border-slate-100 rounded-[3rem] bg-white shadow-premium">
             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Individual</h4>
             <div className="text-5xl font-display font-bold text-slate-950 mb-8 tracking-tighter">$0 <span className="text-sm font-medium text-slate-400 tracking-normal">/ mo</span></div>
             <ul className="space-y-4 mb-10 text-sm font-medium text-slate-500 tracking-tight">
               <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Basic Grade Scoring</li>
               <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> 5 AI Refinements / day</li>
               <li className="flex items-center gap-3 opacity-30"><Check className="w-4 h-4" /> PDF Intelligence Reports</li>
             </ul>
             <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-display font-bold text-xs" disabled={!isPro}>
               {!isPro ? 'Current Tier' : 'Standard Access'}
             </button>
          </div>
          <div className="p-10 border border-indigo-600 rounded-[3rem] bg-slate-950 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">Elite</div>
             <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Pro Writer</h4>
             <div className="text-5xl font-display font-bold text-white mb-8 tracking-tighter">$29 <span className="text-sm font-medium text-slate-500 tracking-normal">/ mo</span></div>
             <ul className="space-y-4 mb-10 text-sm font-medium text-slate-400 tracking-tight">
               <li className="flex items-center gap-3"><Check className="w-4 h-4 text-indigo-400" /> Unlimited Analytics</li>
               <li className="flex items-center gap-3"><Check className="w-4 h-4 text-indigo-400" /> Unlimited AI Intelligence</li>
               <li className="flex items-center gap-3"><Check className="w-4 h-4 text-indigo-400" /> PDF & Bulk Data Exports</li>
             </ul>
             <button 
               onClick={handleUpgrade}
               disabled={isPro || upgrading}
               className="w-full py-4 bg-white text-slate-950 rounded-2xl font-display font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/5 disabled:opacity-50"
             >
               {upgrading ? 'Processing...' : isPro ? 'Elite Active' : 'Upgrade Portfolio'}
             </button>
          </div>
        </div>
      )
    },
    api: {
      title: "Developer Portal",
      icon: <Code className="w-8 h-8 text-indigo-600" />,
      text: "Integrate high-fidelity readability scores directly into your digital surface. Our RESTful API powers high-volume content pipelines with sub-200ms latency.",
      details: (
        <div className="mt-12 space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">REST ENDPOINT</p>
            <code className="text-sm text-indigo-600 font-mono font-bold">POST https://api.readabilitypro.com/v1/intel</code>
          </div>
          <div className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-6 tracking-widest">Linguistic Query Schema</p>
            <pre className="text-xs text-indigo-300 font-mono whitespace-pre-wrap leading-relaxed">
              {`curl -X POST https://api.readabilitypro.com/v1/intel \\
  -H "Authorization: Bearer [ACCESS_TOKEN]" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": "The clarity of the message is the priority.",
    "engine": "fk_grade"
  }'`}
            </pre>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Rate Capability</span>
                <p className="text-xl font-display font-bold text-slate-950 mt-1">10k req/min</p>
             </div>
             <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Operational Uptime</span>
                <p className="text-xl font-display font-bold text-slate-950 mt-1">99.99% SLA</p>
             </div>
          </div>
        </div>
      )
    },
    about: {
      title: "The Ethos",
      icon: <Info className="w-8 h-8 text-indigo-600" />,
      text: "ReadabilityPro was founded on the principle that complexity is the enemy of truth. We build tools that strip away the superfluous, leaving only the essential."
    },
    privacy: {
      title: "Privacy Policy",
      icon: <Lock className="w-8 h-8 text-indigo-600" />,
      text: "Your intellectual property is sacred. Our infrastructure is designed so that your content remains private, local, and sovereign unless voluntarily archived."
    },
    terms: {
      title: "Terms of Engagement",
      icon: <ScrollText className="w-8 h-8 text-indigo-600" />,
      text: "ReadabilityPro operates under high-standard professional guidelines. We provide a sanctuary for clarity, protected by rigorous legal frameworks."
    }
  };

  const active = content[view] || content.about;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 md:px-12 py-40"
    >
      <div className="bg-white rounded-[4rem] border border-slate-50 p-12 md:p-24 shadow-premium relative">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-12 border border-slate-100">
          {active.icon}
        </div>
        <h2 className="text-6xl md:text-8xl font-display font-bold text-slate-950 tracking-tight mb-10 leading-none">{active.title}</h2>
        <p className="text-2xl md:text-3xl text-slate-500 leading-relaxed mb-16 tracking-tight max-w-4xl font-medium">
          {active.text}
        </p>

        {active.details && (
          <div className="mb-20">
            {active.details}
          </div>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {["Encryption at Rest", "99.99% Architecture", "Global CDN Nodes", "Elite Concierge Support"].map((item, i) => (
             <div key={i} className="flex items-center gap-4 text-slate-950 font-display font-bold text-sm tracking-tight">
               <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                 <Check className="w-4 h-4" />
               </div>
               {item}
             </div>
          ))}
        </div>

        <button 
          onClick={onBack}
          className="px-12 py-5 bg-slate-950 text-white rounded-[1.5rem] font-display font-bold text-sm hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300 shadow-2xl shadow-indigo-500/20"
        >
          Return to Dashboard
        </button>
      </div>
    </motion.div>
  );
};
