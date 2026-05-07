import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Send, 
  Sparkles, 
  BarChart3, 
  Clock, 
  Quote, 
  CheckCircle2, 
  AlertCircle,
  Wand2,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
  Repeat,
  Download,
  Copy,
  Plus,
  Layout,
  Maximize2,
  Printer,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AnalysisResult {
  metrics: {
    sentences: number;
    words: number;
    syllables: number;
    complexWords: number;
  };
  scores: {
    fleschEase: number;
    fleschKincaid: number;
    gunningFog: number;
    interpretation: string;
  };
}

interface ImprovedVersion {
  type: string;
  text: string;
  label: string;
  icon: React.ReactNode;
}

import { useUser } from '../contexts/UserContext';

export const AnalysisView: React.FC<{ user: User | null; onLogin: () => void }> = ({ user, onLogin }) => {
  const { isPro, upgradeToPro } = useUser();
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [activeTab, setActiveTab] = useState<'metrics' | 'improve' | 'suggestions'>('metrics');
  const [improvedVersions, setImprovedVersions] = useState<ImprovedVersion[]>([]);
  const [improving, setImproving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze.");
      return;
    }
    
    setAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          userId: user?.uid,
          documentName 
        })
      });
      
      if (!response.ok) throw new Error("Analysis failed");
      
      const data = await response.json();
      setResult(data);
      
      // Save to Firebase if logged in
      if (user) {
        const path = `users/${user.uid}/analyses`;
        try {
          await addDoc(collection(db, path), {
            userId: user.uid,
            text,
            title: documentName,
            scores: data.scores,
            metrics: data.metrics,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
      
      toast.success("Analysis complete!");
      setActiveTab('metrics');
    } catch (err) {
      toast.error("Failed to analyze text. Please try again.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpgradeLocal = async () => {
    if (!user) {
      onLogin();
      return;
    }
    setUpgrading(true);
    toast.info("Initializing secure checkout...", { duration: 2000 });
    try {
      await upgradeToPro();
      toast.success("Welcome to the Elite! Your Pro features are now unlocked.");
    } catch (err) {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const handleImprove = async (type: 'simplify' | 'formal' | 'punchy') => {
    if (!text.trim()) return;
    if (!isPro) {
      toast.error("Premium feature! Upgrade to Pro to unlock AI Text Refinement.");
      setActiveTab('improve');
      return;
    }
    setImproving(true);
    try {
      const promptMap = {
        simplify: "Rewrite the following text to be extremely simple and easy to understand. Aim for a 5th-grade reading level. Maintain the original meaning but use shorter sentences and simpler vocabulary.",
        formal: "Rewrite the following text to be professional, academic, and formal. Enhance the vocabulary and structure for a corporate or scholarly audience.",
        punchy: "Rewrite the following text to be engaging, punchy, and modern. Great for social media or marketing. Use short, impactful sentences."
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${promptMap[type]}\n\nTEXT:\n${text}`,
      });

      const improvedText = response.text || "Failed to generate.";
      
      const newVersion: ImprovedVersion = {
        type,
        text: improvedText,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        icon: type === 'simplify' ? <Zap className="w-4 h-4" /> : type === 'formal' ? <FileText className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />
      };

      setImprovedVersions(prev => [newVersion, ...prev]);
      toast.success(`${newVersion.label} version generated!`);
      setActiveTab('improve');
    } catch (err) {
      toast.error("AI improvement failed. Check your API key or try again.");
      console.error(err);
    } finally {
      setImproving(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!text.trim()) return;
    if (!isPro) {
      toast.error("Premium feature! Upgrade to Pro for deep linguistic insights.");
      setActiveTab('suggestions');
      return;
    }
    setSuggesting(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 5 specific, actionable suggestions to improve the readability and impact of the following text. Format as a bulleted list of short phrases. Focus on things like passive voice, sentence length, and jargon.\n\nTEXT:\n${text}`,
      });

      const suggestions = response.text?.split('\n').filter(s => s.trim().startsWith('*') || s.trim().startsWith('-') || /^\d+\./.test(s.trim())) || [];
      setAiSuggestions(suggestions.map(s => s.replace(/^[*-]\s*|^\d+\.\s*/, '').trim()));
      setActiveTab('suggestions');
      toast.success("Suggestions ready!");
    } catch (err) {
      toast.error("Failed to fetch suggestions.");
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  const getScoreColor = (score: number, type: 'ease' | 'grade') => {
    if (type === 'ease') {
      if (score >= 70) return 'text-emerald-600';
      if (score >= 50) return 'text-amber-600';
      return 'text-rose-600';
    } else {
      if (score <= 8) return 'text-emerald-600';
      if (score <= 12) return 'text-amber-600';
      return 'text-rose-600';
    }
  };

  const handleExportPDF = (type: 'download' | 'print' = 'download') => {
    if (!text.trim()) {
      toast.error("Nothing to export.");
      return;
    }

    if (type === 'print' && !isPro) {
      toast.error("Advanced export options are available for Pro members only.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Readability Report", margin, 30);

    // Subtitle / Document Name
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Document: ${documentName}`, margin, 40);

    // Analysis Status Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Readability Analysis", margin, 55);

    if (result) {
      // Metrics Table
      autoTable(doc, {
        startY: 65,
        margin: { left: margin },
        head: [['Metric', 'Value']],
        body: [
          ['Flesch Reading Ease', Math.round(result.scores.fleschEase).toString()],
          ['Flesch-Kincaid Grade Level', result.scores.fleschKincaid.toFixed(1)],
          ['Gunning Fog Index', result.scores.gunningFog.toFixed(1)],
          ['Interpretation', result.scores.interpretation],
          ['Total Words', result.metrics.words.toString()],
          ['Total Sentences', result.metrics.sentences.toString()],
          ['Complex Words', result.metrics.complexWords.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
      });
    } else {
      doc.setFontSize(12);
      doc.text("No analysis data available.", margin, 65);
    }

    // Original Text Section
    const nextY = (doc as any).lastAutoTable?.finalY + 20 || 80;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Original Text", margin, nextY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    
    // Split text into lines for wrapping
    const textLines = doc.splitTextToSize(text, contentWidth);
    
    // Check for page overflow
    let currentY = nextY + 10;
    textLines.forEach((line: string) => {
      if (currentY > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(line, margin, currentY);
      currentY += 6;
    });

    // Improved Versions Section if any
    if (improvedVersions.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("AI Improved Versions", margin, 20);

      let impY = 30;
      improvedVersions.forEach((v) => {
        if (impY > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          impY = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229);
        doc.text(`${v.label} Version`, margin, impY);
        impY += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        const vLines = doc.splitTextToSize(v.text, contentWidth);
        vLines.forEach((line: string) => {
          if (impY > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            impY = margin;
          }
          doc.text(line, margin, impY);
          impY += 5;
        });
        impY += 10;
      });
    }

    if (type === 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`${documentName.replace(/\s+/g, '_')}_report.pdf`);
      toast.success("PDF report generated!");
    }
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-20">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Editor (Left Pane) */}
        <div className="flex-grow space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-grow">
               <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/10">
                 <Layout className="w-5 h-5" />
               </div>
               <input 
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="bg-transparent border-none text-4xl font-display font-bold text-slate-950 focus:ring-0 w-full placeholder:text-slate-200 tracking-tight"
                  placeholder="Document Name"
                />
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => copyToClipboard(text)}
                 className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                 title="Copy Original"
               >
                 <Copy className="w-5 h-5" />
               </button>
               {!user && (
                 <div className="px-4 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2">
                   <AlertCircle className="w-3 h-3" /> Anonymous Mode
                 </div>
               )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[3rem] p-2 shadow-premium relative group">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing your masterpiece..."
              className="w-full h-[650px] p-12 text-2xl font-medium leading-relaxed bg-white border-none focus:ring-0 outline-none transition-all resize-none custom-scrollbar text-slate-800 placeholder:text-slate-200"
            />
            
            {/* Action Bar Floating */}
            <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus-within:opacity-100">
              <div className="flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-6 py-3 rounded-[2rem] border border-white/10 shadow-2xl">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Quote className="w-3 h-3 text-indigo-400" /> {text.split(/\s+/).filter(Boolean).length} Words
                </span>
                <div className="w-px h-3 bg-white/20" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="w-3 h-3 text-indigo-400" /> {Math.ceil(text.split(/\s+/).filter(Boolean).length / 200)} Min Read
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleGetSuggestions}
                  disabled={suggesting || !text.trim()}
                  className="px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl"
                >
                  {suggesting ? 'Scanning...' : 'Insights'}
                  <Brain className="w-4 h-4 text-indigo-600" />
                </button>
                
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing || !text.trim()}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-950 transition-all flex items-center gap-3 shadow-2xl shadow-indigo-500/20 disabled:opacity-50"
                >
                  {analyzing ? 'Processing...' : 'Run Intelligence'}
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar (Right Pane) */}
        <div className="w-full lg:w-[460px] shrink-0 space-y-8">
          
          {/* Tabs Navigation */}
          <div className="flex p-2 bg-slate-50 rounded-[2rem] gap-1 border border-slate-100">
             {[
               { id: 'metrics', label: 'Score', icon: <BarChart3 className="w-3.5 h-3.5" /> },
               { id: 'improve', label: 'Improver', icon: <Zap className="w-3.5 h-3.5" /> },
               { id: 'suggestions', label: 'Advice', icon: <Brain className="w-3.5 h-3.5" /> }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                   activeTab === tab.id 
                   ? 'bg-white text-indigo-600 shadow-premium' 
                   : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {tab.icon}
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {/* Metrics Tab */}
              {activeTab === 'metrics' && (
                <motion.div 
                  key="metrics"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {!result ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                      <BarChart3 className="w-12 h-12 text-slate-100 mb-4" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Waiting for Analysis</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-premium">
                        <div className="flex items-center justify-between mb-10">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clarity Index</h4>
                           <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Global Scan</div>
                        </div>
                        
                        <div className="flex items-end justify-between mb-12">
                          <div className="text-left">
                            <span className={`text-8xl font-display font-bold leading-none ${getScoreColor(result.scores.fleschEase, 'ease')}`}>
                              {Math.round(result.scores.fleschEase)}
                            </span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Ease Score</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-5xl font-display font-medium ${getScoreColor(result.scores.fleschKincaid, 'grade')}`}>
                              L{result.scores.fleschKincaid.toFixed(0)}
                            </span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Grade Level</p>
                          </div>
                        </div>

                        <div className="p-8 bg-slate-950 rounded-3xl text-white shadow-2xl">
                           <div className="flex items-start gap-6">
                             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                               <TrendingUp className="w-5 h-5 text-white" />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-white leading-relaxed">{result.scores.interpretation}</p>
                               <p className="text-[10px] text-indigo-300 font-medium mt-2 tracking-widest uppercase">Verified Accuracy</p>
                             </div>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Word Count', val: result.metrics.words, icon: <Quote className="w-3.5 h-3.5" /> },
                          { label: 'Fog Index', val: result.scores.gunningFog.toFixed(1), icon: <Shield className="w-3.5 h-3.5" /> },
                          { label: 'Structural', val: result.metrics.sentences, icon: <Maximize2 className="w-3.5 h-3.5" /> },
                          { label: 'Complex', val: result.metrics.complexWords, icon: <Zap className="w-3.5 h-3.5" /> }
                        ].map((m, i) => (
                          <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-premium transition-all duration-500">
                            <div className="text-indigo-600 mb-6">{m.icon}</div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                              <p className="text-3xl font-display font-bold tracking-tighter text-slate-950">{m.val}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* AI Improver Tab */}
              {activeTab === 'improve' && (
                <motion.div 
                  key="improve"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 relative overflow-hidden">
                    {!isPro && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl">
                          <Zap className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-display font-bold text-slate-950 mb-3 tracking-tight">Unlock AI Refinement</h4>
                        <p className="text-sm text-slate-500 font-medium mb-8 max-w-[240px]">Rewrite your content for any audience with our advanced semantic engines.</p>
                        <button 
                          onClick={handleUpgradeLocal}
                          disabled={upgrading}
                          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                        >
                          {upgrading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Text Improver</h4>
                       <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded uppercase">Premium</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                       {[
                         { id: 'simplify', label: 'Simplify', desc: '5th Grade level', icon: <Repeat className="w-3.5 h-3.5" /> },
                         { id: 'formal', label: 'Formal', desc: 'Professional', icon: <FileText className="w-3.5 h-3.5" /> },
                         { id: 'punchy', label: 'Punchy', desc: 'Short & Impact', icon: <Sparkles className="w-3.5 h-3.5" /> }
                       ].map(mode => (
                         <button 
                           key={mode.id}
                           onClick={() => handleImprove(mode.id as any)}
                           disabled={improving}
                           className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-100 rounded-2xl transition-all group"
                         >
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                              {mode.icon}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter">{mode.label}</span>
                         </button>
                       ))}
                    </div>

                    <div className="space-y-4">
                       {improving && (
                         <div className="p-8 border-2 border-dashed border-indigo-100 rounded-2xl flex flex-col items-center justify-center text-center">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="mb-3"
                            >
                              <Repeat className="w-5 h-5 text-indigo-400" />
                            </motion.div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rewriting Content...</p>
                         </div>
                       )}

                       {improvedVersions.map((v, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group"
                         >
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-2">
                                 {v.icon}
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{v.label} Version</span>
                               </div>
                               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => copyToClipboard(v.text)}
                                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => setText(v.text)}
                                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all font-black text-[8px] uppercase"
                                  >
                                    Apply
                                  </button>
                               </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-4">{v.text}</p>
                         </motion.div>
                       ))}

                       {improvedVersions.length === 0 && !improving && (
                         <div className="text-center p-10 border-2 border-dashed border-slate-100 rounded-2xl">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">
                             Select a mode above to<br />generate improved versions.
                           </p>
                         </div>
                       )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Suggestions Tab */}
              {activeTab === 'suggestions' && (
                <motion.div 
                  key="suggestions"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                   <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 relative overflow-hidden">
                     {!isPro && (
                       <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center">
                         <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl">
                           <Brain className="w-8 h-8" />
                         </div>
                         <h4 className="text-2xl font-display font-bold text-slate-950 mb-3 tracking-tight">Linguistic Intelligence</h4>
                         <p className="text-sm text-slate-500 font-medium mb-8 max-w-[240px]">Get specific, actionable advice to transform your writing into a masterpiece.</p>
                         <button 
                           onClick={handleUpgradeLocal}
                           disabled={upgrading}
                           className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                         >
                           {upgrading ? 'Processing...' : 'Unlock Insights'}
                         </button>
                       </div>
                     )}
                     <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Suggestions</h4>
                       <Brain className="w-4 h-4 text-indigo-400" />
                     </div>

                     <div className="space-y-4">
                        {aiSuggestions.map((s, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50"
                          >
                             <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                               <span className="text-[10px] font-black text-indigo-600">{i + 1}</span>
                             </div>
                             <p className="text-xs font-bold text-slate-700">{s}</p>
                          </motion.div>
                        ))}

                        {aiSuggestions.length === 0 && !suggesting && (
                          <div className="text-center p-10 border-2 border-dashed border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">
                              Click "Suggestions" on the editor<br />to get writing advice.
                            </p>
                          </div>
                        )}

                        {suggesting && (
                           <div className="space-y-4">
                             {[1,2,3].map(i => (
                               <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                             ))}
                           </div>
                        )}
                     </div>
                   </div>

                   <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white">
                      <div className="flex items-center gap-3 mb-4">
                         <Zap className="w-5 h-5 text-indigo-300" />
                         <h4 className="text-xs font-black uppercase tracking-widest">Why metrics matter?</h4>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed opacity-80">
                        Higher Ease scores improve user engagement by 40% and SEO ranking by making content scannable for Google crawlers.
                      </p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Tools */}
          <div className="flex items-center gap-4">
             <button 
               onClick={() => handleExportPDF('download')}
               className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-950 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10"
             >
               <Download className="w-4 h-4" /> Export Report
             </button>
             <button 
               onClick={() => handleExportPDF('print')}
               className="p-5 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-indigo-600 hover:shadow-premium transition-all"
               title="Print Analysis"
             >
               <Printer className="w-5 h-5" />
             </button>
             <button className="p-5 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-indigo-600 hover:shadow-premium transition-all">
               <Layout className="w-5 h-5" />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
