# AI Trip Planner (Frontend Assignment)

An interactive, responsive, and highly resilient day-by-day travel planner application. Users describe their dream trip, specify travel durations and styles, and the application generates structured itineraries containing day cards, custom locations, and action timelines.

The application includes a comprehensive **Failure Simulation Panel** to demonstrate robust error recovery in the event of malformed JSON, API server exceptions, empty itineraries, slow responses, and request timeouts.

---

## Technical Stack
- **Frontend**: React (Hooks, Functional Components) + Vanilla CSS (Custom properties, theme tokens, glassmorphism, responsive styles). No TypeScript.
- **Backend**: Node.js + Express (Handles API key isolation, Gemini model calls, and simulated failure middleware).
- **AI Model**: Google Gemini API (`gemini-1.5-flash` model utilizing system guidelines and structured `responseMimeType: "application/json"`).

---

## Core Features

1. **Interactive Timeline UI**:
   - **Collapsible Day Cards**: Expand and collapse individual days to focus on specific plans.
   - **Custom Stops**: Add new custom activities/stops on any day.
   - **Full Activity Editing**: Edit location, arrival times, duration, and detailed descriptions.
   - **Activity Deletion**: Remove unwanted stops from any day with instant timeline redrawing.
   - **Shortcuts / Reordering**: Reorder activities dynamically using HTML5 **Drag-and-Drop** on desktop, or quick **Move Up / Move Down** controls (specifically optimized for mobile touchscreens).
2. **Robust Resilience System**:
   - **Validation & Sanitization**: Validates structural shapes. If fields like descriptions, arrival times, or durations are corrupt or missing, they are filled with high-fidelity defaults instead of crashing the app.
   - **Stale Response Deduplication**: Prevents race conditions. If the user fires multiple consecutive requests, a request counter registers each one and discards responses from outdated (stale) requests.
   - **Client-Side Timeout Handling**: Uses an `AbortController` set to **8 seconds**. If the API hangs or runs too slow, the UI cancels the request, reports the timeout, and lets the user retry.
   - **Simulation Panel**: Graders can click the simulation panel in the sidebar to inject various errors:
     - *Malformed JSON*: Returns a truncated, broken JSON string to trigger parsing errors.
     - *Missing Activities*: Returns a valid JSON structure where the activities array is missing.
     - *Empty Itinerary*: Returns an empty day array to test empty states.
     - *Slow Response*: Inserts a 10-second backend delay to show loading skeletons.
     - *API Timeout*: Inserts a 15-second delay to trigger the frontend's 8-second AbortController.
     - *Internal Server Error*: Responds with a 500 status code and custom message.
3. **Session Caching**: Save and restore trip data using `localStorage`.
4. **Export Options**: Export the current itinerary as a structured JSON file.
5. **Dark Mode Theme**: Beautiful system theme integration (using custom HSL tokens, glassmorphism filters, and CSS variables).

---

## Setup & Run Instructions

To run the application, make sure you have [Node.js](https://nodejs.org/) installed (recommended version >= 18).

### 1. Run the Express Backend
Navigate to the `server/` directory:
```bash
cd server
npm install
```
Configure your environment variables:
Create a `.env` file from the example:
```bash
cp .env.example .env
```
*(Optional)* Add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> [!NOTE]
> **No API Key? No Problem!**
> If the `GEMINI_API_KEY` is left blank, the server detects it and automatically redirects to a high-fidelity **Mock Trip Generator** that parses your inputs and returns fully valid, structured itineraries matching the exact schema. You can test and grade the entire application immediately without needing to configure a key!

Start the backend server:
```bash
npm start
```
The server will run on `http://localhost:5000`.

### 2. Run the Vite Frontend
Open a new terminal window and navigate to the `client/` directory:
```bash
cd client
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` (or the URL shown in your terminal).

---

## Architecture Design

```
client/src/
 ├── components/
 │    ├── Icons.jsx            <-- Lightweight SVG dictionary components
 │    ├── SimulationPanel.jsx  <-- Collapsible edge-case selector
 │    ├── TripForm.jsx         <-- Destination input and style config
 │    ├── Loader.jsx           <-- Skeleton card drawer & status rotating text
 │    ├── ErrorBanner.jsx      <-- Specific error formatting + retry triggers
 │    ├── TripSummary.jsx      <-- Inline title editor + Export/Reset controls
 │    └── Itinerary.jsx        <-- Timelines, collapse controls, edits, reorders
 ├── App.jsx                   <-- Orchestrator (Fetch logic, timeouts, deduplication, cache)
 ├── index.css                 <-- Design tokens, themes (light/dark), layout structure
 └── main.jsx                  <-- DOM mounter
```

---

## AI Tools Usage Statement

The following AI assistants were utilized to expedite development:
- **Claude 3.5 Sonnet / Gemini 3.5 Flash**:
  - Bootstrapping layout code and converting plain HTML structures into interactive React fragments.
  - Designing raw SVG vector paths for the `Icons.jsx` component library to keep asset dependencies small.
  - Crafting modern Vanilla CSS stylesheet layout rules (glassmorphic transparency backdrops, responsive grid definitions, and keyframe animations).
  - Designing JSON-schema system prompts.

---

## Known Limitations & Tradeoffs

1. **Reordering Bounds**: Activities can only be reordered *within* their scheduled day. Moving stops across different days (e.g. dragging a Day 1 stop into Day 2) is currently not supported in this version.
2. **Animation Overheads**: For simplicity and stability, HTML5 drag-and-drop handles do not contain extensive spring animation libraries (e.g., Framer Motion). Focus was placed on standard layouts and reliable touch event handlers.
3. **Local Storage Limits**: The browser-based `localStorage` mechanism works well for single-itinerary sessions but is capped at ~5MB, which is plenty for dozens of text itineraries but would not suit heavy image caching.

---

## Time Spent
- **Research & API Setup**: 1 hour
- **Express Backend & Mock Fallback Router**: 1 hour
- **Resilience Controls (Timeout, Overlaps, Simulation Panel)**: 1.5 hours
- **Frontend Components & Timeline Drag/Drop/Arrows**: 2.5 hours
- **Vanilla CSS System Styling & Dark Mode Tuning**: 1.5 hours
- **Verification & Documentation**: 0.5 hours
- **Total Duration**: ~8 hours
