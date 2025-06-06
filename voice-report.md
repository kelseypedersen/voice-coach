export default function VoiceReport() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 text-gray-900">
      {/* Audio Player */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-2">🎧 Your Voice Report</h2>
        <p className="mb-4 text-sm text-gray-600">Listen to your original recording below.</p>
        <audio controls className="w-full rounded-xl">
          <source src="your-audio-file.webm" type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      </section>

      {/* Transcript Section */}
      <section>
        <h3 className="text-xl font-semibold mb-2">📝 Transcript</h3>
        <p className="bg-gray-100 p-4 rounded-xl leading-relaxed">
          I <span className="bg-blue-200 px-1 rounded">just</span> wanted to <span className="bg-blue-200 px-1 rounded">check in</span> and see if we <span className="bg-orange-200 px-1 rounded">maybe</span> could revisit the plan. <span className="bg-red-200 px-1 rounded">Sorry</span> if I’m off base.
        </p>
      </section>

      {/* Suggested Rewrites */}
      <section>
        <h3 className="text-xl font-semibold mb-2">✍️ Suggested Rewrites</h3>
        <table className="w-full text-left border rounded-xl overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Original</th>
              <th className="px-4 py-2">Suggested</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-2">I just wanted to check in</td>
              <td className="px-4 py-2">Checking in to follow up</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2">Maybe we could consider</td>
              <td className="px-4 py-2">Let’s consider</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2">Sorry if I’m off base</td>
              <td className="px-4 py-2">I’d like to suggest</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Tone & Delivery Metrics */}
      <section>
        <h3 className="text-xl font-semibold mb-4">🎭 Tone & Delivery</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Confidence Score</p>
            <p className="text-2xl font-bold text-green-600">72 / 100</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Speaking Rate</p>
            <p className="text-lg">180 wpm – a bit fast ⚡</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Pitch Variation</p>
            <p className="text-lg">Low – may sound monotone 🎵</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Upspeak Detected</p>
            <p className="text-lg">3 rising tones ⬆️</p>
          </div>
        </div>
      </section>

      {/* Tip Box */}
      <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
        <p className="font-semibold">🎯 Tip:</p>
        <p>Try replacing “I think” with “I believe” to project more confidence.</p>
      </section>
    </div>
  );
}