'use client';
import { useRef, useState } from 'react';
import styles from "../page.module.css";
import { useUser } from "@clerk/nextjs";
import TooltipInfo from "../../components/TooltipInfo"
import Link from "next/link";

async function analyzeAudioFile(audioFileOrBlob) {
  const formData = new FormData();
  formData.append("file", audioFileOrBlob);

  const response = await fetch("http://localhost:8000/analyze-audio/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze audio");
  }

  const data = await response.json();
  
  return data;
}

// Helper function to highlight words in transcript
function highlightTranscript(transcript) {
  if (!transcript) return null;
  // Define words/phrases to highlight and their colors
  const highlights = [
    // Filler words in orange
    { word: "just", color: "#fed7aa" },
    { word: "maybe", color: "#fed7aa" },
    { word: "like", color: "#fed7aa" },
    { word: "um", color: "#fed7aa" },
    { word: "uh", color: "#fed7aa" },
    { word: "uhm", color: "#fed7aa" },
    { word: "uh huh", color: "#fed7aa" },
    { word: "you know", color: "#fed7aa" },
    { word: "so", color: "#fed7aa" },
    { word: "actually", color: "#fed7aa" },
    { word: "I mean", color: "#fed7aa" },
    { word: "well", color: "#fed7aa" },
    // Non-confident words/phrases in light red
    { word: "I think", color: "#fecaca" },
    { word: "Maybe we could", color: "#fecaca" },
    { word: "I feel like", color: "#fecaca" },
    { word: "sort of", color: "#fecaca" },
    { word: "kind of", color: "#fecaca" },
    { word: "I guess", color: "#fecaca" },
    { word: "possibly", color: "#fecaca" },
    { word: "perhaps", color: "#fecaca" },
    { word: "hopefully", color: "#fecaca" },
    { word: "it seems like", color: "#fecaca" },
    { word: "sorry", color: "#fecaca" },
    // Self-diminishing words/phrases in purple
    { word: "Sorry to bother you, but", color: "#e9d5ff" },
    { word: "I'm probably wrong, but", color: "#e9d5ff" },
    { word: "I'm no expert, but", color: "#e9d5ff" },
    { word: "I just wanted to", color: "#e9d5ff" },
    { word: "Does that make sense?", color: "#e9d5ff" },
    { word: "I could be totally off here, but", color: "#e9d5ff" },
  ];

  // Sort by length to avoid partial matches
  highlights.sort((a, b) => b.word.length - a.word.length);

  // Escape regex special chars
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Build regex
  const regex = new RegExp(
    highlights.map(h => `\\b${escapeRegExp(h.word)}\\b`).join("|"),
    "gi"
  );

  // Split transcript by highlights
  const parts = [];
  let lastIndex = 0;
  transcript.replace(regex, (match, offset) => {
    if (offset > lastIndex) {
      parts.push(transcript.slice(lastIndex, offset));
    }
    // Find color for this match
    const highlight = highlights.find(h => h.word.toLowerCase() === match.toLowerCase());
    parts.push(
      <span key={offset} style={{ background: highlight?.color || "#ffeeba", padding: "2px 4px", borderRadius: 4 }}>{match}</span>
    );
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex < transcript.length) {
    parts.push(transcript.slice(lastIndex));
  }
  return parts;
}

// List of orange-highlighted filler words
const orangeFillerWords = [
  "just", "maybe", "like", "um", "uh", "uhm", "uh huh", "you know", "so", "actually", "I mean", "well"
];

function countHighlightedFillerWords(transcript) {
  if (!transcript) return 0;
  const lowerTranscript = transcript.toLowerCase();
  let count = 0;
  orangeFillerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

export default function Analyze() {
  const { user, isLoaded } = useUser();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioFileOrBlob, setAudioFileOrBlob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localUploadCount, setLocalUploadCount] = useState(0); // fallback for not loaded
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef();
  const [savedReportId, setSavedReportId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Determine if user is pro
  const isPro = user?.publicMetadata?.pro === true;
  // If not logged in, treat as not pro
  const isLoggedIn = !!user;

  console.log("User is pro", user?.publicMetadata?.pro)
  console.log("User", user)
  // Use a single effective upload count
  const effectiveUploadCount = isLoggedIn
    ? (user?.publicMetadata?.uploadCount || 0)
    : localUploadCount;
  const uploadLimit = isPro ? Infinity : 3;
  const reachedLimit = !isPro && effectiveUploadCount >= uploadLimit;

  console.log("User has uploaded", effectiveUploadCount, "times")

  const startRecording = async () => {
    if (reachedLimit) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(audioBlob));
        setAudioFileOrBlob(audioBlob);
        await incrementUploadCount();
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setAnalysis(null);
      setError(null);
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone access was denied. Please allow access to record audio.");
        alert("Microphone access was denied. Please allow access to record audio.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No microphone was found. Please connect a microphone and try again.");
        alert("No microphone was found. Please connect a microphone and try again.");
      } else {
        setError("Could not start recording. Please check your microphone and browser settings.");
        alert("Microphone access was denied. Please allow access to record audio.");
      }
      setRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleFileChange = async (event) => {
    if (reachedLimit) return;
    const file = event.target.files[0];
    if (file) {
      setAudioURL(URL.createObjectURL(file));
      setAudioFileOrBlob(file);
      setAnalysis(null);
      setError(null);
      await incrementUploadCount();
    }
  };

  async function incrementUploadCount() {
    if (user) {
      console.log("Incrementing upload count for user", user.id)

      // Update Clerk metadata
      // const newCount = (user.publicMetadata.uploadCount || 0) + 1;
      // await user.update({
      //   publicMetadata: { uploadCount: newCount }
      // });

      // // Optimistically update the UI (if possible)
      // user.publicMetadata.uploadCount = newCount;

      // await incrementUploadCountBackend(user.id);

      // Optionally, force a re-render by using a state variable
      // setForceRerender(x => x + 1);
    } else {
      setLocalUploadCount((prev) => prev + 1);
    }
  }

  // Move handleAnalyze inside the component so it has access to state
  const handleAnalyze = async () => {
    if (!audioFileOrBlob) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeAudioFile(audioFileOrBlob);
      setAnalysis(result);
  
      // Increment upload count
      if (user) {
        // If using Clerk, update user metadata
        const newCount = (user.publicMetadata.uploadCount || 0) + 1;
        await user.update({
          publicMetadata: { uploadCount: newCount }
        });
      } else {
        // For guests, update local state
        // setLocalUploadCount((prev) => prev + 1);
      }
    } catch (err) {
      setError('Failed to analyze audio.');
    } finally {
      setLoading(false);
    }
  };

  // Reset audio and analysis state
  const resetAudio = () => {
    setAudioURL(null);
    setAudioFileOrBlob(null);
    setAnalysis(null);
    setError(null);
  };

  async function saveVoiceReport() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFileOrBlob); // The audio file/blob
      formData.append('analysis', JSON.stringify(analysis));
      formData.append('clerkId', user?.id || '');
      formData.append('guestId', user?.id || '');
      formData.append('userId', user?.id || '');
  
      const response = await fetch('/api/save-report', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.id) {
        setSavedReportId(data.id);
      } else {
        alert(data.error || 'Failed to save report');
      }
    } catch (err) {
      alert('Failed to save report');
    } finally {
      setSaving(false);
    }
  }

  // // Mock API call for demonstration
  // async function analyzeAudioFile(audioFileOrBlob) {
  //   // Simulate network delay
  //   await new Promise((res) => setTimeout(res, 1500));
  //   // Return mock analysis
  //   return {
  //     transcript: '"I think we could maybe try..."',
  //     tone: 'Slight upspeak in 2 spots',
  //     suggestions: [
  //       'Try rephrasing to sound more assertive',
  //       'Avoid "maybe" and "I think" for stronger statements',
  //     ],
  //     passiveVoice: [
  //       'could be done',
  //       'was decided',
  //     ],
  //     nonConfidentVoice: [
  //       'I think',
  //       'maybe',
  //       'possibly',
  //     ],
  //     scores: {
  //       confidence: 72,
  //       terms: 85,
  //       pace: 60,
  //       tone: 78,
  //     },
  //   };
  // }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Hero */}
        <section style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            Try It for Free
          </h1>
          <p style={{ fontSize: 18, color: "#666", marginBottom: 24 }}>
            Upload or record your voice and get instant feedback on your speaking style.
          </p>
        </section>

        {/* Minimized upload/record section if audio is present */}
        {(!analysis && audioFileOrBlob) ? (
          <section style={{ background: "#f8f8f8", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "center" }}>
            <div>
              <strong>Audio added.</strong>
              <audio src={audioURL} controls style={{ display: "block", margin: "12px auto" }} />
            </div>
            <button
              style={{
                marginTop: 12,
                padding: "10px 24px",
                borderRadius: 8,
                background: reachedLimit ? "#eaeaea" : "#0070f3",
                color: reachedLimit ? "#222" : "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                marginRight: 8,
                cursor: reachedLimit ? "not-allowed" : "pointer"
              }}
              onClick={handleAnalyze}
              disabled={reachedLimit || loading}
            >
              {reachedLimit ? "Limit Reached" : (loading ? "Analyzing..." : "Analyze")}
            </button>
            {reachedLimit && (
              <div style={{ color: "red", marginTop: 8 }}>
                You have reached your limit of 3 analyses. {isLoggedIn ? <a href="/pricing" style={{ color: "#0070f3", textDecoration: "underline" }}>Upgrade to Pro</a> : <a href="/sign-in" style={{ color: "#0070f3", textDecoration: "underline" }}>Log in</a>} for unlimited access.
              </div>
            )}
            {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
          </section>
        ) : (!analysis && !audioFileOrBlob) ? (
          // Full upload/record section as before
          <section style={{ background: "#f8f8f8", borderRadius: 12, padding: 32, marginBottom: 32, textAlign: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Step 1: Record or Upload</h2>
            <p style={{ marginBottom: 20 }}>Record a 30-second intro or upload a voice memo</p>
            <button
              style={{ padding: "12px 28px", borderRadius: 8, background: recording || reachedLimit ? "#eaeaea" : "#0070f3", color: recording || reachedLimit ? "#222" : "#fff", border: "none", fontWeight: 600, fontSize: 16, marginRight: 12 }}
              onClick={recording ? stopRecording : startRecording}
              disabled={reachedLimit || effectiveUploadCount >= uploadLimit}
            >
              {recording ? "⏹️ Stop" : "🎤 Record"}
            </button>
            <label
              htmlFor="audio-upload"
              style={{
                padding: "12px 28px",
                borderRadius: 8,
                background: reachedLimit ? "#eaeaea" : "#eaeaea",
                color: reachedLimit ? "#aaa" : "#222",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                cursor: reachedLimit ? "not-allowed" : "pointer",
                display: "inline-block",
                marginLeft: 8
              }}
            >
              ⬆️ Upload
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={reachedLimit || effectiveUploadCount >= uploadLimit}
              />
            </label>
            {reachedLimit && (
              <div style={{ color: "red", marginTop: 8 }}>
                You have reached your limit of 3 analyses. {isLoggedIn ? <a href="/pricing" style={{ color: "#0070f3", textDecoration: "underline" }}>Upgrade to Pro</a> : <a href="/sign-in" style={{ color: "#0070f3", textDecoration: "underline" }}>Log in</a>} for unlimited access.
              </div>
            )}
            {audioURL && !audioFileOrBlob && (
              <div style={{ marginTop: 20 }}>
                <audio src={audioURL} controls />
              </div>
            )}
          </section>
        ) : (analysis && (
          <div style={{ position: 'relative', height: 0 }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 10,
                margin: 24
              }}
            >
              <button
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: "#eaeaea",
                  color: "#222",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "30px",
                }}
                onClick={resetAudio}
                disabled={loading}
              >
                + Add Another
              </button>
            </div>
          </div>
        ))}

        {/* Step 2: See Analysis (real or placeholder) */}
        {analysis && (
          <>

            {/* --- Voice Report Section (like voice-report.md) --- */}
            <section style={{ background: "#f9fafb", borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", maxWidth: 1000, marginLeft: "auto", marginRight: "auto" }}>
              {/* Audio Player */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🎧 Your Voice Report</h2>
                <p style={{ marginBottom: 16, color: "#666" }}>Listen to your original recording below.</p>
                <audio src={audioURL} controls style={{ width: "100%", borderRadius: 12 }} />
                {/* Save Report Button and Share Link */}
                {!savedReportId ? (
                  <button
                    style={{ marginTop: 24, padding: "10px 24px", borderRadius: 8, background: "#0070f3", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: saving ? "not-allowed" : "pointer" }}
                    onClick={saveVoiceReport}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Report"}
                  </button>
                ) : (
                  <div style={{ marginTop: 24 }}>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Report saved!</span>
                    <br />
                    <Link href={`/report/${savedReportId}`} style={{ color: '#0070f3', textDecoration: 'underline', fontSize: 16 }}>
                      View or share your report
                    </Link>
                  </div>
                )}
              </div>

              {/* Confidence Score and Metrics */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 32, justifyContent: 'center' }}>
                <div style={{ minWidth: 180, background: '#f3f4f6', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 14 }}>Overall Confidence Score</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0070f3' }}>{analysis.score ?? '—'} / 100</div>
                </div>
                <div style={{ minWidth: 140, background: '#f3f4f6', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    Words Per Minute
                    <TooltipInfo message="Ideal speaking speed is 130–160 wpm. Below 100 is too slow, above 180 is too fast." />
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color:
                        analysis.wpm >= 130 && analysis.wpm <= 160
                          ? '#16a34a' // green
                          : '#f59e42', // orange
                    }}
                  >
                    {analysis.wpm ?? '—'}
                  </div>
                </div>
                <div style={{ minWidth: 140, background: '#f3f4f6', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    Filler Words
                    <TooltipInfo message="Filler words include 'um', 'uh', 'like', 'just', and similar. This count combines words detected by AI and those highlighted in your transcript." />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>
                    {(() => {
                      const aiCount = analysis.filler_count ?? 0;
                      const highlightCount = countHighlightedFillerWords(analysis.transcript);
                      return aiCount + highlightCount;
                    })()}
                  </div>
                </div>
                {/* <div style={{ minWidth: 140, background: '#f3f4f6', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 14 }}>Hesitations</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{analysis.hesitations ?? '—'}</div>
                </div>
                <div style={{ minWidth: 140, background: '#f3f4f6', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: 14 }}>Upspeak %</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{analysis.hesitations ?? '—'}</div>
                </div> */}
              </div>

              {/* Transcript Section with highlights */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>📝 Transcript</h3>
                <p style={{ background: "#f3f4f6", padding: 16, borderRadius: 12, lineHeight: 1.7 }}>
                  {analysis.transcript ? highlightTranscript(analysis.transcript) : null}
                </p>
              </div>

              {/* Sentiment Analysis Table */}
              {/* {Array.isArray(analysis.sentiment_analysis) && analysis.sentiment_analysis.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>🗣️ Sentiment Analysis</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                    <thead style={{ background: '#e5e7eb' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Sentence</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Sentiment</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...analysis.sentiment_analysis]
                        .sort((a, b) => a.confidence - b.confidence)
                        .map((s, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '8px 12px' }}>{s.text}</td>
                            <td style={{ padding: '8px 12px' }}>{s.sentiment}</td>
                            <td style={{ padding: '8px 12px' }}>{(s.confidence * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )} */}

              {/* Suggested Rewrites (mock) */}
              {/* <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>✍️ Suggested Rewrites</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 12, overflow: "hidden" }}>
                  <thead style={{ background: "#e5e7eb" }}>
                    <tr>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Original</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Suggested</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 12px" }}>I just wanted to check in</td>
                      <td style={{ padding: "8px 12px" }}>Checking in to follow up</td>
                    </tr>
                    <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 12px" }}>Maybe we could consider</td>
                      <td style={{ padding: "8px 12px" }}>Let's consider</td>
                    </tr>
                    <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 12px" }}>Sorry if I'm off base</td>
                      <td style={{ padding: "8px 12px" }}>I'd like to suggest</td>
                    </tr>
                  </tbody>
                </table>
              </div> */}

              {/* Tone & Delivery Metrics (mock) */}
              {/* <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>🎭 Tone & Delivery</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div style={{ background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
                    <p style={{ color: "#666", fontSize: 14 }}>Confidence Score</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>72 / 100</p>
                  </div>
                  <div style={{ background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
                    <p style={{ color: "#666", fontSize: 14 }}>Speaking Rate</p>
                    <p style={{ fontSize: 18 }}>180 wpm – a bit fast ⚡</p>
                  </div>
                  <div style={{ background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
                    <p style={{ color: "#666", fontSize: 14 }}>Pitch Variation</p>
                    <p style={{ fontSize: 18 }}>Low – may sound monotone 🎵</p>
                  </div>
                  <div style={{ background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
                    <p style={{ color: "#666", fontSize: 14 }}>Upspeak Detected</p>
                    <p style={{ fontSize: 18 }}>3 rising tones ⬆️</p>
                  </div>
                </div>
              </div> */}

              {/* Tip Box (mock) */}
              {/* <div style={{ background: "#fef9c3", borderLeft: "4px solid #fde047", padding: 16, borderRadius: 12 }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>🎯 Tip:</p>
                <p>Try replacing "I think" with "I believe" to project more confidence.</p>
              </div> */}
            </section>
            {/* <section style={{ background: "#fff", borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Step 2: See Analysis</h2>
              {/* Scores Section */}
              {/* {analysis.scores && (
                <div style={{
                  display: "flex",
                  gap: 24,
                  marginBottom: 24,
                  justifyContent: "center",
                  flexWrap: "wrap"
                }}>
                  {Object.entries(analysis.scores).map(([label, value]) => (
                    <div key={label} style={{
                      minWidth: 120,
                      background: "#f8f8f8",
                      borderRadius: 8,
                      padding: 16,
                      textAlign: "center"
                    }}>
                      <div style={{ fontWeight: 600, textTransform: "capitalize", marginBottom: 8 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#0070f3" }}>
                        {value}
                      </div>
                      <div style={{
                        height: 8,
                        background: "#e0e0e0",
                        borderRadius: 4,
                        marginTop: 8,
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${value}%`,
                          height: "100%",
                          background: "#0070f3"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginBottom: 12, color: "#888" }}>
                <strong>Transcript:</strong> <span style={{ background: "#ffeeba", borderRadius: 4, padding: "2px 6px" }}>{analysis.transcript}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Tone:</strong> {analysis.tone}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Passive Voice:</strong>
                <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none" }}>
                  {analysis.passiveVoice && analysis.passiveVoice.length > 0 ? (
                    analysis.passiveVoice.map((pv, i) => <li key={i}>• {pv}</li>)
                  ) : (
                    <li>None detected</li>
                  )}
                </ul>
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Non-Confident Voice:</strong>
                <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none" }}>
                  {analysis.nonConfidentVoice && analysis.nonConfidentVoice.length > 0 ? (
                    analysis.nonConfidentVoice.map((nc, i) => <li key={i}>• {nc}</li>)
                  ) : (
                    <li>None detected</li>
                  )}
                </ul>
              </div>
              <div>
                <strong>Suggestions:</strong>
                <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none" }}>
                  {analysis.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div> */}
            {/* </section> */}
          </>
        )}

        {/* Upgrade Nudge */}
        {/* <section style={{ background: "#e0f2fe", borderRadius: 8, padding: 20, textAlign: "center" }}>
          <span style={{ fontWeight: 500, color: "#0070f3" }}>
            Want more than 3 recordings per week?{' '}
            <a href="#" style={{ color: "#0070f3", textDecoration: "underline" }}>Get full access with Pro →</a>
          </span>
        </section> */}
      </main>
    </div>
  );
}
