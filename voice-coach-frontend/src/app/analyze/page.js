'use client';
import { useRef, useState } from 'react';
import styles from "../page.module.css";
import { useUser } from "@clerk/nextjs";

// Mock API call for demonstration
async function analyzeAudioFile(audioFileOrBlob) {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 1500));
  // Return mock analysis
  return {
    transcript: '"I think we could maybe try..."',
    tone: 'Slight upspeak in 2 spots',
    suggestions: [
      'Try rephrasing to sound more assertive',
      'Avoid "maybe" and "I think" for stronger statements',
    ],
    passiveVoice: [
      'could be done',
      'was decided',
    ],
    nonConfidentVoice: [
      'I think',
      'maybe',
      'possibly',
    ],
    scores: {
      confidence: 72,
      terms: 85,
      pace: 60,
      tone: 78,
    },
  };
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

  // Get upload count from Clerk publicMetadata
  const uploadCount = user?.publicMetadata?.uploadCount || localUploadCount;
  const uploadLimit = 3;

  // Helper to increment upload count in Clerk
  const incrementUploadCount = async () => {
    // if (user) {
    //   const currentCount = user.publicMetadata?.uploadCount || 0;
    //   await user.update({
    //     publicMetadata: {
    //       ...user.publicMetadata,
    //       uploadCount: currentCount + 1,
    //     },
    //   });
    // } else {
    //   setLocalUploadCount((c) => c + 1);
    // }
  };

  const startRecording = async () => {
    if (uploadCount >= uploadLimit) return;
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
    if (uploadCount >= uploadLimit) return;
    const file = event.target.files[0];
    if (file) {
      setAudioURL(URL.createObjectURL(file));
      setAudioFileOrBlob(file);
      setAnalysis(null);
      setError(null);
      await incrementUploadCount();
    }
  };

  const handleAnalyze = async () => {
    if (!audioFileOrBlob) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeAudioFile(audioFileOrBlob);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            Try It for Free
          </h1>
          <p style={{ fontSize: 18, color: "#666", marginBottom: 24 }}>
            Upload or record your voice and get instant feedback on your speaking style.
          </p>
        </section>

        {/* Step 1: Record or Upload */}
        <section style={{ background: "#f8f8f8", borderRadius: 12, padding: 32, marginBottom: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Step 1: Record or Upload</h2>
          <p style={{ marginBottom: 20 }}>Record a 30-second intro or upload a voice memo</p>
          <button
            style={{ padding: "12px 28px", borderRadius: 8, background: recording || uploadCount >= uploadLimit ? "#eaeaea" : "#0070f3", color: recording || uploadCount >= uploadLimit ? "#222" : "#fff", border: "none", fontWeight: 600, fontSize: 16, marginRight: 12 }}
            onClick={recording ? stopRecording : startRecording}
            disabled={uploadCount >= uploadLimit}
          >
            {recording ? "⏹️ Stop" : "🎤 Record"}
          </button>
          <label
            htmlFor="audio-upload"
            style={{
              padding: "12px 28px",
              borderRadius: 8,
              background: uploadCount >= uploadLimit ? "#eaeaea" : "#eaeaea",
              color: uploadCount >= uploadLimit ? "#aaa" : "#222",
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              cursor: uploadCount >= uploadLimit ? "not-allowed" : "pointer",
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
              disabled={uploadCount >= uploadLimit}
            />
          </label>
          {uploadCount >= uploadLimit && (
            <div style={{ color: "red", marginTop: 8 }}>
              You have reached your limit of 3 uploads/recordings.
            </div>
          )}
          {audioURL && (
            <div style={{ marginTop: 20 }}>
              <audio src={audioURL} controls />
              <button
                style={{ marginTop: 12, padding: "10px 24px", borderRadius: 8, background: "#0070f3", color: "#fff", border: "none", fontWeight: 600, fontSize: 16 }}
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
              {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
            </div>
          )}
        </section>

        {/* Step 2: See Analysis (real or placeholder) */}
        {analysis && (
          <>

            {/* --- Voice Report Section (like voice-report.md) --- */}
            <section style={{ background: "#f9fafb", borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {/* Audio Player */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🎧 Your Voice Report</h2>
                <p style={{ marginBottom: 16, color: "#666" }}>Listen to your original recording below.</p>
                <audio src={audioURL} controls style={{ width: "100%", borderRadius: 12 }} />
              </div>

              {/* Transcript Section with highlights (mock) */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>📝 Transcript</h3>
                <p style={{ background: "#f3f4f6", padding: 16, borderRadius: 12, lineHeight: 1.7 }}>
                  I <span style={{ background: "#bfdbfe", padding: "2px 4px", borderRadius: 4 }}>just</span> wanted to <span style={{ background: "#bfdbfe", padding: "2px 4px", borderRadius: 4 }}>check in</span> and see if we <span style={{ background: "#fed7aa", padding: "2px 4px", borderRadius: 4 }}>maybe</span> could revisit the plan. <span style={{ background: "#fecaca", padding: "2px 4px", borderRadius: 4 }}>Sorry</span> if I'm off base.
                </p>
              </div>

              {/* Suggested Rewrites (mock) */}
              <div style={{ marginBottom: 32 }}>
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
              </div>

              {/* Tone & Delivery Metrics (mock) */}
              <div style={{ marginBottom: 32 }}>
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
              </div>

              {/* Tip Box (mock) */}
              <div style={{ background: "#fef9c3", borderLeft: "4px solid #fde047", padding: 16, borderRadius: 12 }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>🎯 Tip:</p>
                <p>Try replacing "I think" with "I believe" to project more confidence.</p>
              </div>
            </section>
            <section style={{ background: "#fff", borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Step 2: See Analysis</h2>
              {/* Scores Section */}
              {analysis.scores && (
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
              </div>
            </section>
          </>
        )}

        {/* Upgrade Nudge */}
        <section style={{ background: "#e0f2fe", borderRadius: 8, padding: 20, textAlign: "center" }}>
          <span style={{ fontWeight: 500, color: "#0070f3" }}>
            Want more than 3 recordings per week?{' '}
            <a href="#" style={{ color: "#0070f3", textDecoration: "underline" }}>Get full access with Pro →</a>
          </span>
        </section>
      </main>
    </div>
  );
}
