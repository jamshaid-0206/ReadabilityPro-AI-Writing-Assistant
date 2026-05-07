import React, { useState } from 'react';
import { signInWithPopup, googleProvider, signOut, auth } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AnalysisView } from './components/AnalysisView';
import { HistoryView } from './components/HistoryView';
import { Footer } from './components/Footer';
import { InfoPages } from './components/InfoPages';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProvider, useUser } from './contexts/UserContext';

type ViewState = 'home' | 'analyze' | 'history' | 'features' | 'pricing' | 'api' | 'about' | 'privacy' | 'terms';

function AppContent() {
  const { user, loading, isPro } = useUser();
  const [view, setView] = useState<ViewState>('home');

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in successfully!");
      setView('analyze');
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in interrupted. Try again if you still want to log in.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Just ignore if another popup was opened
      } else {
        toast.error(`Login failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-display font-black text-xl shadow-2xl"
        >
          R
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300"
        >
          Initializing Intelligence
        </motion.p>
      </div>
    );
  }

  const isInfoPage = ['features', 'pricing', 'api', 'about', 'privacy', 'terms'].includes(view);

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-950">
      <Toaster position="top-center" richColors />
      
      {/* Decorative background mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-50/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-slate-50/50 rounded-full blur-[100px]" />
      </div>

      <Navbar 
        user={user} 
        isPro={isPro}
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        view={view as any}
        setView={setView as any}
      />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === 'home' && (
              <Hero 
                onStart={() => setView('analyze')} 
                onBrowseAPI={() => setView('api')}
              />
            )}
            {view === 'analyze' && (
              <AnalysisView user={user} onLogin={handleLogin} />
            )}
            {view === 'history' && (
              <HistoryView user={user} />
            )}
            {isInfoPage && (
              <InfoPages view={view as any} onBack={() => setView('home')} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer setView={setView as any} />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
