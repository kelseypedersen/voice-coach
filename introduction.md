🎯 GOAL:

Help users upload or record speech, get instant feedback, and track progress over time.

⸻

🔁 MVP User Flow

1. Landing Page
	•	Value prop: “Sound more confident in meetings, interviews, and life.”
	•	CTA: “Try a free voice check”

⸻

2. Signup / Onboarding
	•	Lightweight auth (email + password, or social login)
	•	Quick intake:
	•	“What’s your goal?” (e.g., public speaking, interviews, leadership)
	•	“What’s one area you want to improve?” (filler words, tone, pace, etc.)

⸻

3. Voice Analysis Screen

Core feature with two options:

Option A: Record your voice
	•	Mic access using MediaRecorder API
	•	Prompt: “Tell me about yourself in 30 seconds”

Option B: Upload a clip
	•	Accept .mp3, .m4a, .wav, etc.
	•	Add option to pull from Zoom/Google Meet later (future)

Once submitted:
	•	Show loading bar → “Analyzing your voice…”

⸻

4. Results Screen

Insights card layout:
	•	✅ Filler words detected (highlight in transcript)
	•	⏱️ Pace: “160 wpm – a bit fast”
	•	🎢 Tone: “Upspeak in 4 places – try ending with confidence”
	•	🎙️ Playback with waveform + transcript sync
	•	🧠 Confidence score (0–100) with simple explanation

CTA: “Try again” or “Practice with a drill”

⸻

5. Practice Drills (Optional for MVP+)
	•	Power openers: “I believe…”, “Here’s the plan…”
	•	Pace control: “Read this in 120 wpm”
	•	Drill: “Say this sentence confidently 3 times”

⸻

6. Progress Tracker (Optional V1)
	•	Chart showing:
	•	Confidence score over time
	•	Filler words/week
	•	Speaking rate trend

⸻

7. Upgrade Flow (if monetized)
	•	Limit to 3 free recordings/week
	•	Offer “Pro” plan: Unlimited recordings + personalized insights + live coach feedback (later)

⸻

🔧 Tech Stack for This MVP
	•	Frontend: Next.js + Tailwind CSS
	•	Backend: FastAPI or Node.js
	•	Audio Analysis: Whisper (transcription), PyDub or Praat for pitch, custom filler/tone logic
	•	Storage: Supabase or Firebase
	•	Auth: Clerk or Firebase Auth
	•	Charts: Recharts or Chart.js
