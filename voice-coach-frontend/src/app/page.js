import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Hero Section */}
        <section style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>
            Speak with Confidence. Every Time.
          </h1>
          <p style={{ fontSize: 20, color: "#666", marginBottom: 32 }}>
            Identify passive speech, refine your tone, and build vocal presence with AI-powered feedback.
          </p>
          <div className={styles.ctas} style={{ justifyContent: "center" }}>
          <Link href="/analyze" className={"primary " + styles.primary} style={{ minWidth: 140 }}>
            Try Free
          </Link>
            <a className={"secondary " + styles.secondary} href="#pro" style={{ minWidth: 140 }}>
              See Pro Plan
            </a>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ maxWidth: 900, margin: "0 auto 48px auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>How It Works</h2>
          <ol style={{ display: "flex", flexWrap: "nowrap", gap: 24, justifyContent: "center", listStyle: "none", padding: 0 }}>
            <li style={{ flex: "1 1 180px", minWidth: 180 }}>
              <span style={{ fontSize: 32 }}>🎤</span>
              <div style={{ fontWeight: 500, marginTop: 8 }}>Record or upload your voice</div>
            </li>
            <li style={{ flex: "1 1 180px", minWidth: 180 }}>
              <span style={{ fontSize: 32 }}>🧠</span>
              <div style={{ fontWeight: 500, marginTop: 8 }}>Get feedback on tone & phrasing</div>
            </li>
            <li style={{ flex: "1 1 180px", minWidth: 180 }}>
              <span style={{ fontSize: 32 }}>✨</span>
              <div style={{ fontWeight: 500, marginTop: 8 }}>Improve with personalized suggestions</div>
            </li>
            <li style={{ flex: "1 1 180px", minWidth: 180 }}>
              <span style={{ fontSize: 32 }}>📈</span>
              <div style={{ fontWeight: 500, marginTop: 8 }}>Track your vocal progress over time</div>
            </li>
          </ol>
        </section>

        {/* Free vs Pro Comparison */}
        <section id="pro" style={{ maxWidth: 900, margin: "0 auto 48px auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>Free vs Pro</h2>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ background: "#fafafa", borderRadius: 16, padding: 32, minWidth: 240, flex: 1 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Free</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 16 }}>
                <li>✅ 3 voice checks/month</li>
                <li>✅ Basic tone feedback</li>
                <li>✅ Progress tracking</li>
                <li>❌ Advanced suggestions</li>
                <li>❌ Download reports</li>
              </ul>
            </div>
            <div style={{ background: "#f0f6ff", borderRadius: 16, padding: 32, minWidth: 240, flex: 1, border: "2px solid #0070f3" }}>
              <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Pro</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 16 }}>
                <li>✅ Unlimited voice checks</li>
                <li>✅ Advanced tone & phrasing feedback</li>
                <li>✅ Personalized suggestions</li>
                <li>✅ Downloadable reports</li>
                <li>✅ Priority support</li>
              </ul>
              <a className={"primary " + styles.primary} href="#" style={{ marginTop: '20px'}}>
                Upgrade to Pro
              </a>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section style={{ maxWidth: 700, margin: "0 auto 48px auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>What Our Users Say</h2>
          <blockquote style={{ fontStyle: "italic", color: "#444", margin: "0 auto 8px auto" }}>
            “This helped me stop underselling myself in meetings.”
          </blockquote>
          <div style={{ fontSize: 14, color: "#888" }}>— Early Beta User</div>
        </section>

        {/* Screenshots or UI Preview */}
        <section style={{ maxWidth: 900, margin: "0 auto 48px auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>See It In Action</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 24, minWidth: 260 }}>
              <span style={{ fontSize: 32 }}>📝</span>
              <div style={{ marginTop: 8 }}>Transcription with highlights</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 24, minWidth: 260 }}>
              <span style={{ fontSize: 32 }}>📊</span>
              <div style={{ marginTop: 8 }}>Tone graph preview</div>
            </div>
          </div>
        </section>

        {/* Trust & About */}
        <section style={{ maxWidth: 700, margin: "0 auto 48px auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Our Mission</h2>
          <p style={{ fontSize: 16, color: "#555" }}>
            Built by women, for women — to close the confidence gap in communication.
          </p>
          <a href="#" style={{ color: "#0070f3", textDecoration: "underline", fontSize: 15 }}>
            Read our story
          </a>
        </section>

        {/* Final CTA */}
        <section style={{ textAlign: "center", margin: "48px 0 0 0" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>
            Ready to sound more confident?
          </h2>
          <a className={"primary " + styles.primary} href="#" style={{ minWidth: 180 }}>
            Start Free Voice Check
          </a>
        </section>
      </main>
      <footer className={styles.footer}>
        <p>© 2025 Confident Voice. All rights reserved.</p>
      </footer>
    </div>
  );
}
