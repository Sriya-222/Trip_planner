import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Sparkles, Sliders } from 'lucide-react';

export default function TripForm({ onSubmit, loading }) {
  const [destination, setDestination] = useState('Tokyo, Japan');
  const [days, setDays] = useState(3);
  const [prompt, setPrompt] = useState('A mix of popular tourist spots, anime shops, and delicious local food. Keep it budget-friendly.');
  const [style, setStyle] = useState('Balanced');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    
    const fullPrompt = `Travel style: ${style}. Preferences: ${prompt}`;
    onSubmit({ destination: destination.trim(), days, prompt: fullPrompt });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-card text-main border-border-normal transition-colors duration-300"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink" />
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-violet">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-main tracking-tight leading-none">Plan Your Journey</h2>
            <p className="text-xs text-sub font-medium mt-1">Draft customized plans with Gemini AI</p>
          </div>
        </div>

        {/* Destination Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-sub">Destination</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-3.5 text-muted" />
            <input
              type="text"
              placeholder="e.g., Paris, Kyoto, New York..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-normal bg-input text-sm text-main placeholder-muted outline-none transition-all duration-300 focus:border-accent-violet/60 focus:bg-card focus:shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-sub">Duration</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-3.5 text-muted" />
              <select 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-border-normal bg-input text-sm text-main outline-none transition-all duration-300 appearance-none cursor-pointer focus:border-accent-violet/60 focus:bg-card"
                disabled={loading}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n} className="bg-card text-main">{n} {n === 1 ? 'Day' : 'Days'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Travel Style Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-sub">Style</label>
            <div className="relative">
              <Sliders size={16} className="absolute left-3.5 top-3.5 text-muted" />
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-border-normal bg-input text-sm text-main outline-none transition-all duration-300 appearance-none cursor-pointer focus:border-accent-violet/60 focus:bg-card"
                disabled={loading}
              >
                <option value="Balanced" className="bg-card text-main">Balanced</option>
                <option value="Relaxed" className="bg-card text-main">Relaxed</option>
                <option value="Fast-Paced" className="bg-card text-main">Fast-Paced</option>
                <option value="Adventure" className="bg-card text-main">Adventure</option>
                <option value="Luxury" className="bg-card text-main">Luxury</option>
                <option value="Backpacker" className="bg-card text-main">Backpacker</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences TextArea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-sub">Preferences / Activities</label>
          <textarea
            placeholder="e.g., museums, local street food, parks, cafes, historical temples..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 rounded-xl border border-border-normal bg-input text-sm text-main placeholder-muted min-h-[110px] resize-y outline-none transition-all duration-300 focus:border-accent-violet/60 focus:bg-card"
            disabled={loading}
          />
        </div>

        {/* Generate Button */}
        <motion.button 
          type="submit" 
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative w-full py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer select-none bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.35)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              Generating...
            </span>
          ) : (
            'Generate Itinerary'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
