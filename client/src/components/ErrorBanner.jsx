import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';

export default function ErrorBanner({ error, onRetry }) {
  const [showLogs, setShowLogs] = useState(false);

  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 rounded-3xl border border-danger-red/20 bg-danger-red/5 text-main shadow-2xl relative overflow-hidden transition-colors duration-300"
    >
      {/* Dynamic left accent strip */}
      <div className="absolute top-0 left-0 h-full w-[4px] bg-danger-red" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-danger-red/10 text-danger-red">
            <AlertTriangle size={20} className="animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-main tracking-tight transition-colors duration-300">
              {error.title || "Generation Failed"}
            </h3>
            <p className="text-xs text-sub font-medium mt-0.5 transition-colors duration-300">
              An error occurred while compiling recommendations.
            </p>
          </div>
        </div>

        <p className="text-xs text-main font-medium leading-relaxed transition-colors duration-300">
          {error.message || "An unexpected error occurred while communicating with the AI planner. Please try again."}
        </p>

        {error.details && (
          <div className="text-left">
            <button 
              type="button"
              onClick={() => setShowLogs(!showLogs)} 
              className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-sub hover:text-main cursor-pointer outline-none transition-colors duration-300"
            >
              <span>{showLogs ? 'Hide diagnostics' : 'Show diagnostics'}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showLogs ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showLogs && (
                <motion.pre
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 text-[10px] font-mono bg-input border border-border-normal p-3 rounded-xl overflow-x-auto text-sub select-all border-l-2 border-l-danger-red transition-colors duration-300"
                >
                  {error.details}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        )}

        {onRetry && (
          <div className="flex justify-start">
            <motion.button 
              onClick={onRetry} 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white cursor-pointer select-none bg-danger-red rounded-full hover:bg-danger-red/90 shadow-md hover:shadow-danger-red/10"
            >
              <RefreshCw size={12} className="animate-spin-slow" />
              <span>Retry Generation</span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
