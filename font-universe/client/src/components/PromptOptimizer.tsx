import React, { useState } from 'react';
import { Sparkles, Copy, RefreshCw, Sliders, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizationResult {
  original: string;
  optimized: string;
  changes: string[];
}

export const PromptOptimizer: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState('clarity');
  const [intensity, setIntensity] = useState(50);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;

    setLoading(true);
    try {
      // Call backend API
      const response = await fetch('http://localhost:3000/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt, focus, intensity }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.optimized || !Array.isArray(data.changes)) {
        throw new Error('Invalid response format from server');
      }

      setResult(data);
    } catch (error) {
      console.error('Optimization failed:', error);
      // Fallback for demo if backend is not reachable or fails
      // We only fallback if it's a connection error or server error, but we want to show the user something useful
      setResult({
        original: inputPrompt,
        optimized: `[${focus.toUpperCase()}]: ${inputPrompt} \n\n(AI Service unavailable, using fallback optimization logic)\n\nEnsure the response is detailed, structured, and avoids ambiguity. Focus on actionable insights.`,
        changes: ['Enhanced clarity (fallback)', 'Added structural requirements', 'Removed ambiguity']
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.optimized) {
      navigator.clipboard.writeText(result.optimized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="text-primary" /> Prompt Optimizer
        </h2>
        <p className="text-gray-400">Refine your AI prompts for better results using our galaxy-class optimization engine.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 pb-20 md:pb-0 items-stretch">
        {/* Input Section */}
        <div className="flex-1 w-full space-y-4 bg-galaxy-800/50 p-4 md:p-6 rounded-2xl border border-galaxy-700 backdrop-blur-sm flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-semibold text-white">Original Prompt</h3>
            <div className="flex gap-2">
              <select 
                value={focus} 
                onChange={(e) => setFocus(e.target.value)}
                className="bg-galaxy-900 border border-galaxy-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-primary min-h-[40px]"
              >
                <option value="clarity">Clarity</option>
                <option value="creativity">Creativity</option>
                <option value="technicality">Technicality</option>
                <option value="brevity">Brevity</option>
              </select>
            </div>
          </div>
          
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full flex-1 min-h-[12rem] md:min-h-[16rem] bg-galaxy-900/50 border border-galaxy-700 rounded-xl p-4 text-white placeholder-galaxy-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-base"
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-2 gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-400 w-full">
              <Sliders size={16} />
              <span>Intensity: {intensity}%</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={intensity} 
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-primary h-10 md:h-auto"
              />
            </div>
          </div>
        </div>

        {/* Center Button Section */}
        <div className="flex items-center justify-center shrink-0">
          <button
            onClick={handleOptimize}
            disabled={loading || !inputPrompt.trim()}
            className="hidden lg:flex w-16 h-16 bg-primary hover:bg-primary-hover text-white rounded-full items-center justify-center shadow-lg shadow-primary/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Optimize Prompt"
          >
            {loading ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
          </button>
          
          {/* Mobile Button (Standard Button Style in flow) */}
           <button
            onClick={handleOptimize}
            disabled={loading || !inputPrompt.trim()}
            className="lg:hidden w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            Optimize Prompt
          </button>
        </div>

        {/* Output Section */}
        <div className="flex-1 w-full space-y-4 bg-galaxy-800/50 p-4 md:p-6 rounded-2xl border border-galaxy-700 backdrop-blur-sm relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-semibold text-white">Optimized Result</h3>
            {result && (
              <div className="flex gap-2">
                 <button 
                  onClick={() => {/* Save logic */}}
                  className="p-3 hover:bg-galaxy-700 rounded-lg text-gray-400 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                  title="Save to favorites"
                  aria-label="Save to favorites"
                >
                  <Save size={20} />
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 hover:bg-galaxy-700 rounded-lg text-gray-400 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                  title="Copy to clipboard"
                  aria-label="Copy to clipboard"
                >
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
              </div>
            )}
          </div>

          <div className="w-full flex-1 min-h-[12rem] md:min-h-[16rem] bg-galaxy-900/50 border border-galaxy-700 rounded-xl p-4 overflow-y-auto relative text-base">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                <Sparkles size={32} className="opacity-20" />
                <p>Optimization result will appear here</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white whitespace-pre-wrap"
                >
                  {result.optimized}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-2"
            >
              <h4 className="text-sm font-medium text-gray-400 mb-2">Enhancements Applied:</h4>
              <div className="flex flex-wrap gap-2">
                {result.changes.map((change, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-primary/20 text-primary-200 rounded-full border border-primary/20">
                    {change}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
};
