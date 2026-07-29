import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Moon, Sun, Sparkles } from 'lucide-react';
import TripForm from './components/TripForm';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';
import TripSummary from './components/TripSummary';
import Itinerary from './components/Itinerary';
import SimulationPanel from './components/SimulationPanel';

const API_ENDPOINT = 'http://localhost:5000/api/generate-itinerary';

// Helper to determine active CSS class theme based on destination name
const getThemeClass = (destination = '') => {
  const dest = destination.toLowerCase();
  if (dest.includes('tokyo') || dest.includes('japan') || dest.includes('kyoto') || dest.includes('osaka')) {
    return 'dest-theme-tokyo';
  }
  if (dest.includes('paris') || dest.includes('france') || dest.includes('romantic')) {
    return 'dest-theme-paris';
  }
  if (dest.includes('london') || dest.includes('uk') || dest.includes('england') || dest.includes('british')) {
    return 'dest-theme-london';
  }
  if (dest.includes('new york') || dest.includes('nyc') || dest.includes('manhattan') || dest.includes('chicago')) {
    return 'dest-theme-newyork';
  }
  if (dest.includes('swiss') || dest.includes('alps') || dest.includes('mountain') || dest.includes('bali') || dest.includes('nature') || dest.includes('forest') || dest.includes('beach') || dest.includes('hawaii')) {
    return 'dest-theme-nature';
  }
  return '';
};

export default function App() {
  // Theme state: dark mode default
  const [darkTheme, setDarkTheme] = useState(() => {
    const saved = localStorage.getItem('ai_trip_planner_dark_theme');
    return saved ? JSON.parse(saved) : true; // Dark mode is default
  });

  // Trip and UI states
  const [trip, setTrip] = useState(() => {
    const saved = localStorage.getItem('ai_trip_planner_current_trip');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInputs, setLastInputs] = useState(null);
  const [simulateMode, setSimulateMode] = useState('');
  
  const requestId = useRef(0);

  // Determine active theme based on trip title or last search input destination
  const themeClass = trip 
    ? getThemeClass(trip.tripTitle || lastInputs?.destination || '') 
    : (lastInputs ? getThemeClass(lastInputs.destination) : '');

  // Apply dark mode class to both html (documentElement) and body elements on state change
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('ai_trip_planner_dark_theme', JSON.stringify(darkTheme));
  }, [darkTheme]);

  const handleUpdateTrip = (updatedTrip) => {
    setTrip(updatedTrip);
    if (updatedTrip) {
      localStorage.setItem('ai_trip_planner_current_trip', JSON.stringify(updatedTrip));
    } else {
      localStorage.removeItem('ai_trip_planner_current_trip');
    }
  };

  const handleClearSession = () => {
    if (window.confirm("Are you sure you want to clear your current itinerary? This will reset the planner.")) {
      handleUpdateTrip(null);
      setError(null);
      setLastInputs(null);
    }
  };

  const handleSaveTrip = () => {
    if (trip) {
      localStorage.setItem('ai_trip_planner_current_trip', JSON.stringify(trip));
      alert("Itinerary cached successfully to your local session!");
    }
  };

  const validateAndSanitizeItinerary = (rawData) => {
    if (!rawData) {
      throw new Error("No payload was returned from the generator server.");
    }

    let parsed = rawData;
    if (typeof rawData === 'string') {
      try {
        parsed = JSON.parse(rawData);
      } catch (jsonErr) {
        throw new Error(`The generator returned a malformed response that cannot be parsed as JSON. Details:\n\n${rawData}`);
      }
    }

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error("Parsed data is not a valid JSON structure.");
    }

    const sanitized = {
      tripTitle: typeof parsed.tripTitle === 'string' && parsed.tripTitle.trim() !== ''
        ? parsed.tripTitle.trim()
        : 'Custom Vacation Plan',
      summary: typeof parsed.summary === 'string' && parsed.summary.trim() !== ''
        ? parsed.summary.trim()
        : 'A beautiful tailored day-by-day travel plan.',
      days: Array.isArray(parsed.days) ? parsed.days : []
    };

    if (sanitized.days.length === 0) {
      const err = new Error("The itinerary contains empty days.");
      err.name = "EmptyItineraryError";
      throw err;
    }

    sanitized.days = sanitized.days.map((dayObj, dayIdx) => {
      const dayNum = Number(dayObj.day) || (dayIdx + 1);
      const title = typeof dayObj.title === 'string' && dayObj.title.trim() !== ''
        ? dayObj.title.trim()
        : `Day ${dayNum}`;
      
      const rawActivities = Array.isArray(dayObj.activities) ? dayObj.activities : [];

      const sanitizedActivities = rawActivities.map((act) => {
        return {
          time: typeof act.time === 'string' && act.time.trim() !== '' ? act.time.trim() : 'Flexible',
          place: typeof act.place === 'string' && act.place.trim() !== '' ? act.place.trim() : 'Local Sightseeing',
          duration: typeof act.duration === 'string' && act.duration.trim() !== '' ? act.duration.trim() : 'Flexible',
          description: typeof act.description === 'string' && act.description.trim() !== ''
            ? act.description.trim()
            : 'Spend time exploring local points of interest and landmarks.'
        };
      });

      return {
        day: dayNum,
        title,
        activities: sanitizedActivities
      };
    });

    return sanitized;
  };

  const handleGenerateItinerary = async (inputs) => {
    setLastInputs(inputs);
    setLoading(true);
    setError(null);

    const currentRequestId = ++requestId.current;
    
    // Setup AbortController for client-side API timeout (20 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      console.log(`[API Request #${currentRequestId}] Sending to backend...`);
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulate-mode': simulateMode
        },
        body: JSON.stringify({
          prompt: inputs.prompt,
          days: inputs.days,
          destination: inputs.destination
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (currentRequestId !== requestId.current) {
        console.log(`[API Request #${currentRequestId}] Ignored stale response.`);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const rawText = await response.text();
      const validatedTrip = validateAndSanitizeItinerary(rawText);

      handleUpdateTrip(validatedTrip);
      setLoading(false);

    } catch (err) {
      clearTimeout(timeoutId);

      if (currentRequestId !== requestId.current) {
        console.log(`[API Request #${currentRequestId}] Ignored error from stale response.`);
        return;
      }

      console.error(`[API Request #${currentRequestId}] Error occurred:`, err);
      
      let errorTitle = "Generation Failed";
      let errorMessage = "An error occurred while generating your itinerary.";
      let errorDetails = err.message;

      if (err.name === 'AbortError') {
        errorTitle = "Request Timeout";
        errorMessage = "The travel planner took longer than 20 seconds to respond. The request was aborted on the client to prevent blocking.";
        errorDetails = "Client-side AbortController triggered after 20000ms threshold.";
      } else if (err.name === 'EmptyItineraryError') {
        errorTitle = "Empty Itinerary";
        errorMessage = "The AI successfully parsed the inputs but returned a trip with zero scheduled days or activities.";
        errorDetails = "Schema validation failed: 'days' array length is 0.";
      } else if (err.message.includes('JSON')) {
        errorTitle = "Malformed Response";
        errorMessage = "The AI returned a response that could not be parsed as a structured travel plan. This happens when the model output gets corrupted.";
      } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        errorTitle = "Network Connection Error";
        errorMessage = "Could not connect to the trip planner backend server. Please verify that the node server is running locally on port 5000.";
      }

      setError({
        title: errorTitle,
        message: errorMessage,
        details: errorDetails
      });
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastInputs) {
      handleGenerateItinerary(lastInputs);
    }
  };

  const handleQuickSearch = (city) => {
    let style = "Balanced";
    let prompt = "Explore the main attractions, historical spots, local food and hidden gems.";
    let days = 3;
    let dest = city;
    
    if (city === "Tokyo") dest = "Tokyo, Japan";
    else if (city === "Paris") dest = "Paris, France";
    else if (city === "London") dest = "London, UK";
    else if (city === "New York") dest = "New York, USA";
    else if (city === "Bali") dest = "Bali, Indonesia";
    
    handleGenerateItinerary({ destination: dest, days, prompt: `Travel style: ${style}. Preferences: ${prompt}` });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none relative bg-app text-main transition-colors duration-300 ${themeClass}`}>
      {/* Background ambient glowing blobs */}
      <div className="ambient-glow-purple" />
      <div className="ambient-glow-pink" />

      {/* Premium Sticky Navigation Header */}
      <header className="sticky top-0 z-40 h-[72px] flex items-center justify-between px-6 md:px-12 bg-glass-nav border-b border-border-normal backdrop-blur-xl shadow-md transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink flex items-center justify-center text-white font-extrabold shadow-lg shadow-purple-500/20">
            A
          </div>
          <span className="text-base font-extrabold text-main tracking-tight transition-colors duration-300">
            AI Trip Planner
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkTheme(!darkTheme)}
            className="p-2 rounded-full border border-border-normal text-sub hover:text-main hover:border-border-hover cursor-pointer transition-all duration-300 outline-none bg-input"
            title="Toggle Light/Dark Theme"
          >
            {darkTheme ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main SaaS Dashboard Container */}
      <main className="max-w-[1500px] w-full mx-auto flex-1 flex flex-col lg:flex-row gap-8 p-6 md:p-8">
        
        {/* Sidebar Panel (Inputs) */}
        <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
          <TripForm onSubmit={handleGenerateItinerary} loading={loading} />
        </aside>

        {/* Workspace Display Viewport */}
        <section className="flex-1 min-w-0 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {error && (
              <ErrorBanner key="error" error={error} onRetry={lastInputs ? handleRetry : null} />
            )}
          </AnimatePresence>

          <div className="flex-1">
            {loading ? (
              <Loader />
            ) : trip ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                <TripSummary 
                  trip={trip} 
                  onUpdateTitle={(newTitle) => handleUpdateTrip({ ...trip, tripTitle: newTitle })}
                  onClear={handleClearSession}
                  onSave={handleSaveTrip}
                />
                <Itinerary 
                  trip={trip} 
                  onUpdateTrip={handleUpdateTrip} 
                />
              </motion.div>
            ) : (
              /* Premium Empty Landing View */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border-dashed border-border-normal min-h-[480px] shadow-xl"
              >
                <div className="p-4 rounded-full bg-accent-purple/5 border border-accent-purple/10 text-accent-violet animate-pulse mb-6">
                  <Compass size={40} className="text-accent-purple" />
                </div>
                
                <h2 className="text-3xl font-extrabold text-main tracking-tight mb-2 transition-colors duration-300">
                  Create Your Next Itinerary
                </h2>
                
                <p className="text-sm text-sub font-medium max-w-md leading-relaxed mb-8 transition-colors duration-300">
                  Specify details in the sidebar to build a custom travel plan using Google Gemini AI, or try one of the popular locations below.
                </p>

                {/* Popular Action Chips */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted transition-colors duration-300">Popular Destinations</span>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                    {[
                      { name: "Tokyo", flag: "🗼" },
                      { name: "Paris", flag: "🥖" },
                      { name: "London", flag: "🎡" },
                      { name: "New York", flag: "🗽" },
                      { name: "Bali", flag: "🌴" }
                    ].map((city) => (
                      <motion.button
                        key={city.name}
                        onClick={() => handleQuickSearch(city.name)}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border-normal bg-input text-xs font-bold text-sub hover:text-main cursor-pointer select-none transition-colors duration-300"
                      >
                        <span>{city.flag}</span>
                        <span>{city.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {lastInputs && (
                  <motion.button 
                    onClick={handleRetry}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-8 px-6 py-2.5 rounded-full border border-accent-purple/20 bg-accent-purple/5 text-xs font-bold text-accent-pink hover:bg-accent-purple/10 cursor-pointer transition-colors"
                  >
                    Restore Last Search
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Developer Simulation drawer */}
      <SimulationPanel activeMode={simulateMode} setActiveMode={setSimulateMode} />

      {/* Footnote */}
      <footer className="text-center py-6 border-t border-border-normal bg-glass-nav/30 text-muted text-xs font-medium transition-colors duration-300">
        <span>© 2026 AI Trip Planner. Structured via Gemini 2.5 Flash. Engineered with precision.</span>
      </footer>
    </div>
  );
}
