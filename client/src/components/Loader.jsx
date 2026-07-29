import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const STATUS_MESSAGES = [
  "Connecting to Gemini 2.5 Flash...",
  "Analyzing destination highlights...",
  "Structuring daily routing...",
  "Formatting activities and times...",
  "Injecting sightseeing descriptions...",
  "Running schema validator...",
  "Finalizing design details...",
  "Rendering timeline graphics..."
];

export default function Loader() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        
        let increment = 1;
        if (prev < 30) increment = 4;
        else if (prev < 65) increment = 2;
        else if (prev < 85) increment = 1;
        else increment = 0.5;
        
        return Math.min(98, prev + increment);
      });
    }, 120);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 text-main font-sans transition-colors duration-300">
      {/* Loading Status Indicator Panel */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl border border-border-normal relative overflow-hidden bg-card">
        <div className="p-3 rounded-2xl bg-accent-purple/10 text-accent-violet animate-pulse mb-4">
          <Sparkles size={24} className="animate-spin-slow" />
        </div>
        
        <div className="flex items-center gap-3 justify-center mb-3">
          <h3 className="text-sm font-extrabold text-main tracking-tight transition-colors duration-300">
            {STATUS_MESSAGES[statusIndex]}
          </h3>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent-purple/10 text-accent-pink tracking-wider">
            {Math.floor(progress)}%
          </span>
        </div>

        {/* Progress bar container */}
        <div className="w-56 h-1.5 bg-input rounded-full overflow-hidden border border-border-normal mb-3">
          <div 
            className="h-full bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-[11px] text-sub max-w-sm leading-relaxed transition-colors duration-300">
          The AI is drafting the itinerary structure, mapping landmarks, and validating the schema payload.
        </p>
      </div>

      {/* Shimmer Timeline Placeholder Skeletons */}
      <div className="flex flex-col gap-5">
        {/* Skeleton Trip Summary Hero */}
        <div className="glass-panel rounded-3xl p-6 border border-border-normal bg-card shadow-md">
          <div className="shimmer h-8 w-1/3 rounded-lg mb-3"></div>
          <div className="shimmer h-4 w-5/6 rounded mb-2"></div>
          <div className="shimmer h-4 w-4/6 rounded mb-4"></div>
          <div className="flex gap-2">
            <div className="shimmer h-6 w-16 rounded-full"></div>
            <div className="shimmer h-6 w-16 rounded-full"></div>
          </div>
        </div>

        {/* Skeleton Day Itinerary Cards */}
        <div className="glass-panel rounded-3xl p-6 border border-border-normal bg-card shadow-md flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-border-normal">
            <div className="flex items-center gap-3">
              <div className="shimmer w-8 h-8 rounded-full"></div>
              <div className="shimmer h-6 w-40 rounded-lg"></div>
            </div>
            <div className="shimmer h-5 w-20 rounded-full"></div>
          </div>

          <div className="pl-6 border-l-2 border-dashed border-border-normal flex flex-col gap-6 relative">
            <div className="relative">
              <div className="absolute -left-9 top-1 w-4 h-4 rounded-full bg-border-normal border-2 border-app"></div>
              <div className="shimmer h-20 w-full rounded-2xl"></div>
            </div>
            <div className="relative">
              <div className="absolute -left-9 top-1 w-4 h-4 rounded-full bg-border-normal border-2 border-app"></div>
              <div className="shimmer h-20 w-full rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
