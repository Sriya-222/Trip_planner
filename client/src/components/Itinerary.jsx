import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, ChevronDown, Clock, MapPin, 
  Hourglass, X, ArrowUp, ArrowDown, Check, CheckSquare 
} from 'lucide-react';

export default function Itinerary({ trip, onUpdateTrip }) {
  // Collapsed status of days: true = collapsed
  const [collapsedDays, setCollapsedDays] = useState({});
  // Editing state: holds { dayIndex, activityIndex, place, time, duration, description }
  const [modalData, setModalData] = useState(null);
  // Dragged state
  const [draggedItem, setDraggedItem] = useState(null);

  if (!trip || !trip.days) return null;

  // Toggle day expansion
  const toggleDay = (dayIdx) => {
    setCollapsedDays(prev => ({
      ...prev,
      [dayIdx]: !prev[dayIdx]
    }));
  };

  // Reorder activities within a day
  const moveActivity = (dayIndex, actIndex, direction) => {
    const updatedDays = [...trip.days];
    const activities = [...updatedDays[dayIndex].activities];
    
    const targetIndex = direction === 'up' ? actIndex - 1 : actIndex + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    // Swap
    const temp = activities[actIndex];
    activities[actIndex] = activities[targetIndex];
    activities[targetIndex] = temp;

    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: activities
    };

    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Delete an activity
  const deleteActivity = (dayIndex, actIndex) => {
    if (!window.confirm("Are you sure you want to remove this activity?")) return;
    
    const updatedDays = [...trip.days];
    const activities = updatedDays[dayIndex].activities.filter((_, idx) => idx !== actIndex);
    
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: activities
    };

    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Save changes from Modal (Add or Edit)
  const handleSaveModal = (e) => {
    e.preventDefault();
    const { dayIndex, activityIndex, place, time, duration, description } = modalData;
    
    const updatedDays = [...trip.days];
    const activities = updatedDays[dayIndex].activities ? [...updatedDays[dayIndex].activities] : [];

    const newActivity = {
      time: time || 'Flexible',
      place: place || 'New Attraction',
      duration: duration || 'Flexible',
      description: description || 'No description provided.'
    };

    if (activityIndex === -1) {
      activities.push(newActivity);
    } else {
      activities[activityIndex] = newActivity;
    }

    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: activities
    };

    onUpdateTrip({ ...trip, days: updatedDays });
    setModalData(null);
  };

  // Open modal to add
  const openAddModal = (dayIndex) => {
    setModalData({
      dayIndex,
      activityIndex: -1,
      place: '',
      time: '12:00',
      duration: '1 hour',
      description: ''
    });
  };

  // Open modal to edit
  const openEditModal = (dayIndex, activityIndex, act) => {
    setModalData({
      dayIndex,
      activityIndex,
      place: act.place,
      time: act.time,
      duration: act.duration,
      description: act.description
    });
  };

  // --- HTML5 Drag and Drop Handlers ---
  const handleDragStart = (e, dayIndex, activityIndex) => {
    setDraggedItem({ dayIndex, activityIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${dayIndex}-${activityIndex}`);
  };

  const handleDragOver = (e, targetDayIndex) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.dayIndex !== targetDayIndex) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e, targetDayIndex, targetActivityIndex) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    const { dayIndex, activityIndex } = draggedItem;
    if (dayIndex !== targetDayIndex || activityIndex === targetActivityIndex) {
      setDraggedItem(null);
      return;
    }

    const updatedDays = [...trip.days];
    const activities = [...updatedDays[dayIndex].activities];

    const [draggedAct] = activities.splice(activityIndex, 1);
    activities.splice(targetActivityIndex, 0, draggedAct);

    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: activities
    };

    onUpdateTrip({ ...trip, days: updatedDays });
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col gap-5">
        {trip.days.map((dayData, dayIdx) => {
          const isCollapsed = collapsedDays[dayIdx] === true;
          const acts = dayData.activities || [];
          
          return (
            <motion.div 
              key={dayIdx} 
              layout="position"
              className="rounded-3xl border border-border-normal bg-card overflow-hidden shadow-lg transition-colors duration-300"
            >
              {/* Day Header Trigger */}
              <div 
                className="flex items-center justify-between p-5 cursor-pointer bg-input/20 hover:bg-input/55 border-b border-transparent transition-all duration-300 select-none"
                onClick={() => toggleDay(dayIdx)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
                    {dayData.day || (dayIdx + 1)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-main tracking-tight leading-none transition-colors duration-300">
                      {dayData.title || `Day ${dayIdx + 1}`}
                    </h3>
                    <p className="text-[10px] text-sub font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5 transition-colors duration-300">
                      <span>{acts.length} {acts.length === 1 ? 'Stop' : 'Stops'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <CheckSquare size={10} className="text-muted animate-pulse" />
                        <span>Progressive timeline</span>
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Miniature progress bar */}
                  <div className="w-16 h-1 bg-input rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-accent-purple" style={{ width: acts.length > 0 ? '100%' : '0%' }} />
                  </div>
                  <ChevronDown 
                    size={18} 
                    className="text-sub transition-transform duration-200"
                    style={{ transform: !isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </div>
              </div>

              {/* Collapsible Container */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="p-6 bg-zinc-950/5 border-t border-border-normal flex flex-col gap-6">
                      {acts.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border-normal rounded-2xl bg-input/10">
                          <p className="text-xs text-sub font-medium italic">
                            No activities scheduled for this day yet.
                          </p>
                        </div>
                      ) : (
                        <div 
                          className="relative pl-7 border-l border-border-normal flex flex-col gap-6"
                          onDragOver={(e) => handleDragOver(e, dayIdx)}
                        >
                          {acts.map((act, actIdx) => {
                            const isDraggingSelf = draggedItem && draggedItem.dayIndex === dayIdx && draggedItem.activityIndex === actIdx;
                            
                            return (
                              <motion.div 
                                key={actIdx} 
                                layout="position"
                                className={`relative group transition-opacity duration-200 ${isDraggingSelf ? 'opacity-30' : ''}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, dayIdx, actIdx)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, dayIdx, actIdx)}
                              >
                                {/* Vertical connector dot */}
                                <div className="absolute -left-9 top-1.5 w-3.5 h-3.5 rounded-full bg-app border-2 border-accent-purple shadow-sm z-10 group-hover:scale-110 group-hover:border-accent-pink transition-all duration-200" />
                                
                                <div className="glass-panel rounded-2xl p-4.5 border border-border-normal bg-card hover:bg-card-hover shadow-md flex items-start justify-between gap-4 group-hover:border-accent-purple/35 transition-all duration-300">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-accent-purple/10 text-accent-pink uppercase tracking-wide">
                                        <Clock size={10} />
                                        <span>{act.time || 'Flexible'}</span>
                                      </span>
                                      <span className="flex items-center gap-1 text-[10px] font-bold text-sub">
                                        <Hourglass size={10} />
                                        <span>{act.duration || 'Flexible'}</span>
                                      </span>
                                    </div>
                                    <h4 className="text-base font-extrabold text-main tracking-tight flex items-center gap-1.5 leading-snug mb-1 transition-colors duration-300">
                                      <MapPin size={13} className="text-accent-pink shrink-0" />
                                      <span className="truncate">{act.place || 'Sightseeing'}</span>
                                    </h4>
                                    <p className="text-xs text-sub font-medium leading-relaxed transition-colors duration-300">
                                      {act.description || 'Enjoy exploring the sights.'}
                                    </p>
                                  </div>

                                  {/* Activity action buttons */}
                                  <div className="flex flex-col gap-2 shrink-0">
                                    <div className="flex items-center gap-1 bg-input p-0.5 rounded-full border border-border-normal">
                                      <button 
                                        onClick={() => moveActivity(dayIdx, actIdx, 'up')}
                                        disabled={actIdx === 0}
                                        className="p-1 rounded-full text-sub hover:text-main disabled:opacity-20 cursor-pointer transition-colors"
                                        title="Move Up"
                                      >
                                        <ArrowUp size={11} />
                                      </button>
                                      <button 
                                        onClick={() => moveActivity(dayIdx, actIdx, 'down')}
                                        disabled={actIdx === acts.length - 1}
                                        className="p-1 rounded-full text-sub hover:text-main disabled:opacity-20 cursor-pointer transition-colors"
                                        title="Move Down"
                                      >
                                        <ArrowDown size={11} />
                                      </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 justify-end">
                                      <button 
                                        onClick={() => openEditModal(dayIdx, actIdx, act)}
                                        className="p-1.5 rounded-full border border-border-normal bg-input text-sub hover:text-accent-purple hover:border-accent-purple/20 cursor-pointer transition-all duration-200"
                                        title="Edit Activity"
                                      >
                                        <Edit2 size={11} />
                                      </button>
                                      <button 
                                        onClick={() => deleteActivity(dayIdx, actIdx)}
                                        className="p-1.5 rounded-full border border-border-normal bg-input text-sub hover:text-danger-red hover:border-danger-red/20 cursor-pointer transition-all duration-200"
                                        title="Delete Activity"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Activity Trigger */}
                      <div className="flex justify-center mt-2">
                        <button 
                          onClick={() => openAddModal(dayIdx)}
                          className="flex items-center justify-center gap-1.5 w-full max-w-[240px] py-2 rounded-xl border border-dashed border-border-normal hover:border-accent-purple hover:text-accent-purple bg-input/30 text-xs font-bold text-sub cursor-pointer transition-all duration-200"
                        >
                          <Plus size={13} />
                          <span>Add Custom Stop</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* --- ADD/EDIT MODAL OVERLAY --- */}
      <AnimatePresence>
        {modalData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleSaveModal}
              className="w-full max-w-md p-6 rounded-3xl border border-border-normal bg-card shadow-2xl relative overflow-hidden flex flex-col gap-4 font-sans text-main transition-colors duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink" />
              
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-extrabold text-main tracking-tight">
                  {modalData.activityIndex === -1 ? 'Add New Stop' : 'Edit Stop Details'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setModalData(null)}
                  className="p-1.5 rounded-full border border-border-normal bg-input text-sub hover:text-main cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-sub">Location / Landmark</label>
                <input
                  type="text"
                  value={modalData.place}
                  onChange={e => setModalData({ ...modalData, place: e.target.value })}
                  placeholder="e.g. Eiffel Tower, Sushi Restaurant"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-normal bg-input text-xs text-main outline-none focus:border-accent-purple/50 placeholder-muted"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-sub">Arrival Time</label>
                  <input
                    type="text"
                    value={modalData.time}
                    onChange={e => setModalData({ ...modalData, time: e.target.value })}
                    placeholder="e.g. 09:30, Afternoon"
                    className="w-full px-4 py-2.5 rounded-xl border border-border-normal bg-input text-xs text-main outline-none focus:border-accent-purple/50 placeholder-muted"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-sub">Duration</label>
                  <input
                    type="text"
                    value={modalData.duration}
                    onChange={e => setModalData({ ...modalData, duration: e.target.value })}
                    placeholder="e.g. 2 hours, 45 mins"
                    className="w-full px-4 py-2.5 rounded-xl border border-border-normal bg-input text-xs text-main outline-none focus:border-accent-purple/50 placeholder-muted"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-sub">Description</label>
                <textarea
                  value={modalData.description}
                  onChange={e => setModalData({ ...modalData, description: e.target.value })}
                  placeholder="Briefly describe what you'll see, eat, or experience..."
                  className="w-full p-4 rounded-xl border border-border-normal bg-input text-xs text-main outline-none min-h-[90px] resize-y focus:border-accent-purple/50 placeholder-muted"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalData(null)}
                  className="px-4 py-2 rounded-xl border border-border-normal text-xs font-bold text-sub hover:text-main cursor-pointer bg-input/20"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1 px-4.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer bg-gradient-to-r from-accent-purple to-accent-pink shadow-md hover:shadow-purple-500/10"
                >
                  <Check size={12} />
                  <span>Save Stop</span>
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
