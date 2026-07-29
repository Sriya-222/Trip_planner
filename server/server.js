const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());

// Fallback Mock Trip Generator
// Generates structured itineraries matching the schema to support execution without an API key.
function generateMockItinerary(destination, daysCount = 3) {
  const destName = destination || "Dream Destination";
  const numDays = Math.max(1, Math.min(10, parseInt(daysCount) || 3));
  
  const mockActivities = [
    { time: "09:00", place: "Local Bakery & Morning Walk", duration: "1.5 hours", description: "Start the day with fresh local pastries and coffee while exploring the neighborhood." },
    { time: "11:00", place: "Historic Landmarks Tour", duration: "2.5 hours", description: "Visit the most famous central historic monuments and learn about the local heritage." },
    { time: "14:30", place: "Art District & Museum", duration: "2 hours", description: "Stroll through the art alleyways, visiting independent galleries and the main museum." },
    { time: "17:00", place: "Panoramic Sunset Viewpoint", duration: "1 hour", description: "Climb up to the highest local deck or hill for breathtaking panoramic views of the skyline." },
    { time: "19:30", place: "Traditional Cuisine Dinner", duration: "2 hours", description: "Dine at a highly recommended local tavern, sampling authentic signature dishes." }
  ];

  const days = [];
  for (let i = 1; i <= numDays; i++) {
    // Select 3 activities for each day, offset by index
    const dayActivities = [
      mockActivities[(i - 1) % mockActivities.length],
      mockActivities[i % mockActivities.length],
      mockActivities[(i + 1) % mockActivities.length]
    ].map((act, idx) => {
      // Adjust hours for simple visual variety
      const hours = 9 + idx * 4;
      const timeStr = `${hours.toString().padStart(2, '0')}:00`;
      return { ...act, time: timeStr };
    });

    days.push({
      day: i,
      title: `Exploring the Wonders of ${destName} - Day ${i}`,
      activities: dayActivities
    });
  }

  return {
    tripTitle: `${destName} Explorer`,
    summary: `A beautiful ${numDays}-day getaway exploring the sights, tastes, and culture of ${destName}.`,
    days: days
  };
}

// POST endpoint to generate the itinerary
app.post('/api/generate-itinerary', async (req, res) => {
  const { prompt, days, destination, simulateMode: bodySimulateMode } = req.body;
  const simulateMode = req.headers['x-simulate-mode'] || bodySimulateMode;

  console.log(`[Request] New request received. Destination: "${destination}", Days: ${days}, Simulation: "${simulateMode || 'none'}"`);

  // --- SIMULATION HANDLING MODE ---
  if (simulateMode) {
    console.log(`[Simulation] Triggered: ${simulateMode}`);

    switch (simulateMode) {
      case 'error':
        return res.status(500).json({ 
          error: "Simulated internal server error. The server encountered an unexpected condition that prevented it from fulfilling the request." 
        });

      case 'slow':
        // Wait 10 seconds before continuing to serve standard response
        await new Promise(resolve => setTimeout(resolve, 10000));
        break; // Continue to normal generation (or mock) after 10s

      case 'timeout':
        // Wait 25 seconds to exceed frontend abort limit (20s)
        await new Promise(resolve => setTimeout(resolve, 25000));
        return res.json({ message: "This should have timed out on the client side!" });

      case 'malformed':
        // Return 200 but send structurally broken JSON string
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(
          `{"tripTitle": "Simulated Broken Trip", "summary": "Malformed JSON output.", "days": [{"day": 1, "title": "Incomplete Day", "activities": [{"time": "09:00", "place": "Shibuya", "duration": "1 hour"`
        );

      case 'missing-activities':
        // Return JSON where activities array is missing or null
        return res.json({
          tripTitle: `${destination || 'Test'} Vacation`,
          summary: "Simulated response with missing activities fields.",
          days: [
            { day: 1, title: "Day with Null Activities", activities: null },
            { day: 2, title: "Day with Missing Activities Field" }
          ]
        });

      case 'empty':
        // Return JSON with empty days array
        return res.json({
          tripTitle: `${destination || 'Test'} Getaway`,
          summary: "An empty itinerary simulation.",
          days: []
        });

      default:
        console.log(`[Simulation] Unknown simulation mode: ${simulateMode}`);
    }
  }

  // --- NORMAL GENERATION FLOW ---
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    console.log("[Fallback] GEMINI_API_KEY is not defined. Returning Mock Itinerary.");
    // Wait a brief 1.2s to simulate real API network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    const mockData = generateMockItinerary(destination, days);
    return res.json(mockData);
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const userPrompt = `
Create a day-by-day travel itinerary.
Destination: ${destination || 'Unknown Location'}
Duration: ${days || 3} days
User Preferences / Description: ${prompt || 'A balanced sightseeing trip.'}

You must return ONLY a JSON object that adheres to the following structure:
{
  "tripTitle": "string (A creative and catchy title for the trip)",
  "summary": "string (A brief 1-2 sentence overview of the trip's theme and highlights)",
  "days": [
    {
      "day": number (starting at 1),
      "title": "string (brief theme/focus of the day)",
      "activities": [
        {
          "time": "string (approximate time, e.g., '09:00', '14:30', or 'Flexible')",
          "place": "string (name of the attraction or activity)",
          "duration": "string (duration, e.g., '2 hours', '45 mins')",
          "description": "string (1-2 sentences of what the user will do there)"
        }
      ]
    }
  ]
}

Ensure the activities list has 3-4 entries for each day. Write all texts in English. Do not wrap the JSON output in markdown formatting (no \`\`\`json or backticks). Return raw string JSON only.
`;

    // Resilient generation function using fallback models and transient-error backoff
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-3.5-flash"];
    let textResponse = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      // Allow up to 2 attempts per model for transient glitches
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Gemini API] Querying model "${modelName}" (Attempt ${attempt}/2)...`);
          
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });
          
          const result = await model.generateContent(userPrompt);
          textResponse = result.response.text();
          
          if (textResponse) {
            console.log(`[Gemini API] ✅ SUCCESS using model "${modelName}"!`);
            break; // Break the attempt loop
          }
        } catch (err) {
          lastError = err;
          // Determine if error is temporary/rate-related
          const isTransient = err.status === 503 || err.status === 429 || 
                              err.message?.includes("503") || err.message?.includes("429") || 
                              err.message?.includes("demand") || err.message?.includes("temporary");
          
          if (isTransient) {
            console.warn(`[Gemini API] ⚠️ Model "${modelName}" busy (503/429). Backing off for ${800 * attempt}ms...`);
            await new Promise(resolve => setTimeout(resolve, 800 * attempt));
          } else {
            console.warn(`[Gemini API] ❌ Model "${modelName}" threw non-transient error: ${err.message}. Switching model.`);
            break; // Switch to next model in the list
          }
        }
      }
      
      if (textResponse) break; // Break the models loop if we succeeded
    }

    if (!textResponse) {
      throw lastError || new Error("All fallback models were exhausted due to service load.");
    }

    console.log("[Gemini Response Raw]:", textResponse);

    // Try parsing it backend-side to ensure it is valid JSON before sending
    try {
      const parsed = JSON.parse(textResponse.trim());
      return res.json(parsed);
    } catch (parseErr) {
      console.error("[Backend] Gemini returned invalid JSON structure:", parseErr);
      return res.status(200).send(textResponse);
    }

  } catch (error) {
    console.error("[Backend Error] Failed to call Gemini API after fallback chaining:", error);
    return res.status(500).json({ 
      error: "All Gemini model services are currently experiencing high load. Please try again or use the simulation toggles.",
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  AI Trip Planner Backend running on port ${PORT}`);
  console.log(`  API Endpoint: http://localhost:${PORT}/api/generate-itinerary`);
  if (!process.env.GEMINI_API_KEY) {
    console.log(`  [Notice] GEMINI_API_KEY env is empty.`);
    console.log(`  The server will return rich MOCK itineraries for testing.`);
  } else {
    console.log(`  [Ready] GEMINI_API_KEY environment variable detected.`);
  }
  console.log(`==================================================`);
});
