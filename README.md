# 🎙️ Voice Confidence Coach

An AI-powered app to help users identify passive speech patterns, analyze vocal tone, and rewrite speech with confidence. Designed especially for women who want to speak with more clarity, assertiveness, and presence.

---

## 🚀 Features
- 🎤 Audio recording or upload
- 🧠 Transcription + passive speech detection
- ✍️ Assertive rewording suggestions
- 🎭 Tone & delivery metrics (upspeak, pace, pitch)
- 📈 Confidence score per clip
- 🔁 Shareable report outputs
- 🔒 Free tier with usage limits + paid Pro tier via Stripe

---

## 🧱 Tech Stack

### Frontend
- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev) for authentication
- [Vercel](https://vercel.com) for deployment

### Backend / API
- [Supabase](https://supabase.io) for data storage
- [Stripe](https://stripe.com) for billing
- [OpenAI Whisper](https://openai.com/research/whisper) or AssemblyAI for transcription
- OpenAI GPT-4 for tone rewriting

---

## 📦 Setup Instructions

1. **Clone the repo**
```bash
git clone https://github.com/yourname/voice-coach-app.git
cd voice-coach-app
```

2. **Start the frontend** 
```bash
cd voice-coach-frontend
npm start dev
```

3. Start the backend
```bash
cd voice-coach-backend
npm install
```


3. **Add environment variables in `.env.local`**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🧠 Coming Soon
- AI voice playback (via ElevenLabs)
- Team dashboards
- Mobile-first version

---

## 📜 License
MIT — free to use and adapt.

---

## ✨ Built With
Passion for empowering voices that deserve to be heard.

---