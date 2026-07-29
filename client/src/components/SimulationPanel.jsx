import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Terminal, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function SimulationPanel({ activeMode, setActiveMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: '', label: 'Production (Real / Mock API)' },
    { value: 'malformed', label: 'Malformed JSON response' },
    { value: 'missing-activities', label: 'Schema Mismatch (Missing acts)' },
    { value: 'empty', label: 'Empty Itinerary (Zero days)' },
    { value: 'slow', label: 'Slow Connection (10s delay)' },
    { value: 'timeout', label: 'Request Timeout (25s delay)' },
    { value: 'error', label: 'Internal Server Error (500 status)' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors duration-300 ${
          isOpen 
            ? 'bg-card text-main border-border-normal' 
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
        }`}
      >
        <Sliders size={14} className={isOpen ? 'animate-spin' : ''} />
        <span>DevTools</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </motion.button>

      {/* Drawer Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-14 right-0 w-80 p-5 rounded-2xl border border-border-normal bg-card/95 backdrop-blur-xl shadow-2xl text-main font-mono transition-colors duration-300"
          >
            <div className="flex items-center gap-2 border-b border-border-normal pb-3 mb-3">
              <Terminal size={14} className="text-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-sub">Simulation Drawer</span>
            </div>

            <p className="text-[10px] text-sub leading-relaxed mb-4">
              Inject mock exceptions and inspect the frontend resilience layout.
            </p>

            <div className="flex flex-col gap-2">
              {options.map((opt) => {
                const isActive = activeMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setActiveMode(opt.value)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all duration-300 border cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold' 
                        : 'bg-input/40 text-sub border-transparent hover:text-main hover:bg-input/60'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeDot"
                        className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            
            {activeMode && (
              <div className="mt-4 flex items-start gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/10">
                <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                <span className="text-[9px] text-amber-500/80 leading-normal">
                  Simulation active. Next generation request will trigger the exception block.
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
