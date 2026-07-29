import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Download, Trash2, CloudSun, DollarSign, Compass, Layers, Save } from 'lucide-react';

export default function TripSummary({ trip, onUpdateTitle, onClear, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(trip.tripTitle || 'My Itinerary');

  const handleSaveTitle = () => {
    setIsEditing(false);
    if (editedTitle.trim()) {
      onUpdateTitle(editedTitle.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') {
      setEditedTitle(trip.tripTitle);
      setIsEditing(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(trip.tripTitle || 'trip').replace(/\s+/g, '_')}_itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalDays = trip.days ? trip.days.length : 0;
  const totalActivities = trip.days ? trip.days.reduce((acc, d) => acc + (d.activities ? d.activities.length : 0), 0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden bg-card border-border-normal text-main transition-colors duration-300"
    >
      {/* Dynamic top gradient line to reparent layout colors */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink" />

      {/* Left Details */}
      <div className="flex-1 min-w-[280px] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-purple/10 text-accent-violet shrink-0">
            <Compass size={16} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-pink">Itinerary Workspace</span>
        </div>

        {isEditing ? (
          <input
            type="text"
            className="w-full text-3xl md:text-4xl font-extrabold text-main tracking-tight bg-transparent border-b-2 border-dashed border-accent-purple outline-none pb-1"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <h1 
            onClick={() => setIsEditing(true)} 
            className="text-3xl md:text-4xl font-extrabold text-main tracking-tight cursor-pointer hover:opacity-90 flex items-center gap-3 group"
            title="Click to edit title"
          >
            <span className="truncate max-w-[550px]">{trip.tripTitle || 'My Itinerary'}</span>
            <Edit2 size={16} className="text-muted group-hover:text-accent-violet transition-colors shrink-0" />
          </h1>
        )}
        
        <p className="text-sm text-sub font-medium leading-relaxed max-w-2xl">
          {trip.summary || 'A custom-tailored day-by-day travel plan.'}
        </p>

        {/* Dynamic Statistics Row */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-input border border-border-normal text-sub transition-colors duration-300">
            <Layers size={12} className="text-accent-violet" />
            <span>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-input border border-border-normal text-sub transition-colors duration-300">
            <Compass size={12} className="text-accent-violet" />
            <span>{totalActivities} Stops</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-input border border-border-normal text-sub transition-colors duration-300">
            <DollarSign size={12} className="text-emerald-500" />
            <span>Budget Friendly</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-input border border-border-normal text-sub transition-colors duration-300">
            <CloudSun size={12} className="text-amber-500" />
            <span>Mostly Sunny</span>
          </span>
        </div>
      </div>

      {/* Action Buttons (Pill design) */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 shrink-0">
        <motion.button 
          onClick={handleExportJSON}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border border-border-normal bg-input text-xs font-bold text-sub cursor-pointer select-none hover:text-main hover:border-border-hover transition-colors"
          title="Export Itinerary to JSON file"
        >
          <Download size={14} />
          <span>Export JSON</span>
        </motion.button>

        <motion.button 
          onClick={onSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border border-border-normal bg-input text-xs font-bold text-sub cursor-pointer select-none hover:text-main hover:border-border-hover transition-colors"
          title="Save Itinerary locally"
        >
          <Save size={14} />
          <span>Save Trip</span>
        </motion.button>

        <motion.button 
          onClick={onClear}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border border-danger-red/20 bg-danger-red/5 text-xs font-bold text-danger-red cursor-pointer select-none hover:bg-danger-red hover:text-white transition-all duration-200"
          title="Reset Planner"
        >
          <Trash2 size={14} />
          <span>Clear</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
