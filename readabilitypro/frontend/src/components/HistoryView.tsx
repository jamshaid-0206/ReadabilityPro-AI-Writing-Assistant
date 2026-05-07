import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { History, Trash2, Calendar, FileText, ChevronRight, BarChart, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface AnalysisRecord {
  id: string;
  title: string;
  text: string;
  scores: {
    fleschEase: number;
    fleschKincaid: number;
    gunningFog: number;
  };
  createdAt: any;
}

import { useUser } from '../contexts/UserContext';

export const HistoryView: React.FC<{ user: User | null }> = ({ user }) => {
  const { isPro, upgradeToPro } = useUser();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const path = `users/${user.uid}/analyses`;
    try {
      const q = query(
        collection(db, path),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalysisRecord[];
      setHistory(records);
    } catch (err: any) {
      console.error("History load error", err);
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeLocal = async () => {
    setUpgrading(true);
    toast.info("Upgrading archive limits...");
    try {
      await upgradeToPro();
      toast.success("Archive fully unlocked!");
    } catch (err) {
      toast.error("Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/analyses/${id}`;
    try {
      await deleteDoc(doc(db, path));
      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success("Record permanently removed.");
    } catch (e: any) {
      handleFirestoreError(e, OperationType.DELETE, path);
      toast.error("Failed to delete record.");
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-40 text-center">
        <div className="p-12 bg-white rounded-[3rem] border border-slate-100 shadow-premium mb-12 inline-block">
          <History className="w-20 h-20 text-slate-100 mx-auto" />
        </div>
        <h2 className="text-4xl font-display font-bold text-slate-950 mb-6 tracking-tight">Access your library</h2>
        <p className="text-xl text-slate-500 max-w-sm mx-auto mb-10 font-medium tracking-tight">Track your linguistic progress and access your saved intelligence archives.</p>
        <button className="px-10 py-4 bg-slate-950 text-white rounded-2xl font-display font-bold text-sm">Sign In to Archive</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-8 md:px-12 pt-40 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Intellectual Assets</h2>
            </div>
            <h1 className="text-6xl font-display font-bold text-slate-950 tracking-tight">The Archive.</h1>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
             <BarChart className="w-4 h-4 text-indigo-600" />
             <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em]">{history.length} Saved Analysis</span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-28 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-40 text-center bg-slate-50 rounded-[4rem] border border-slate-100 shadow-inner-soft">
            <FileText className="w-16 h-16 text-slate-100 mx-auto mb-8" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Vault is Empty</p>
            <p className="text-sm text-slate-400 mt-4 font-medium">Your historical records will appear here after analysis.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 hover:shadow-premium transition-all duration-500 flex items-center justify-between"
                >
                  <div className="flex items-center gap-8 overflow-hidden">
                    <div className="w-16 h-16 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500 border border-slate-100">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-slate-950 group-hover:text-indigo-600 transition-colors text-2xl tracking-tight truncate mb-1">{item.title}</h4>
                      <div className="flex flex-wrap items-center gap-6 mt-3 font-black text-[9px] text-slate-400 uppercase tracking-[0.15em]">
                        <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">Ease: {Math.round(item.scores.fleschEase)}</span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg">Grade {item.scores.fleschKincaid.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300"
                      title="Purge record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-2xl transition-all duration-300 shadow-sm">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-32 p-12 bg-slate-950 rounded-[4rem] text-white relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -mr-64 -mt-64 group-hover:bg-indigo-600/20 transition-all duration-700" />
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="text-center lg:text-left space-y-4">
                <h3 className="text-3xl font-display font-bold tracking-tight">
                  {isPro ? 'Enterprise Intelligence Active.' : 'ReadabilityPro Enterprise.'}
                </h3>
                <p className="text-slate-400 text-lg font-medium tracking-tight max-w-xl leading-relaxed">
                  {isPro 
                    ? 'You have full access to our collaborative workspaces, unlimited history archives, and neural search capabilities.'
                    : 'Unlock the full potential of your team with collaborative workspaces, unlimited history, and semantic search capabilities.'}
                </p>
              </div>
              {!isPro && (
                <button 
                  onClick={handleUpgradeLocal}
                  disabled={upgrading}
                  className="px-10 py-5 bg-white text-slate-950 rounded-[1.5rem] font-display font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/5 whitespace-nowrap disabled:opacity-50"
                >
                  {upgrading ? 'Processing...' : 'Join the Network'}
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
