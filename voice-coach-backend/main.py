import requests
import time
import os
import tempfile
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY") or "ff74d7d7c3f44a9e9cc101d8e7380f82"
base_url = "https://api.assemblyai.com"

headers = {
    "authorization": ASSEMBLYAI_API_KEY
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-audio/")
async def analyze_audio(file: UploadFile = File(...)):
    # Save the uploaded file to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Upload the file to AssemblyAI
    with open(tmp_path, "rb") as f:
        upload_response = requests.post(
            base_url + "/v2/upload",
            headers=headers,
            data=f
        )
    os.remove(tmp_path)

    if not upload_response.ok:
        return {"error": "Upload to AssemblyAI failed", "details": upload_response.text}

    audio_url = upload_response.json()["upload_url"]

    # Request transcription with audio intelligence features
    data = {
        "audio_url": audio_url,
        "speech_model": "universal",
        "sentiment_analysis": True,
        "auto_highlights": True,  # for filler words, hesitations, etc.
        "iab_categories": False,  # not needed for this use case
        "entity_detection": False,  # optional
        "auto_chapters": False,  # not needed
        "speaker_labels": False,  # not needed
        "word_boost": [],
        "boost_param": "default",
        "disfluencies": True, # Transcribe Filler Words, like “umm”, in your media file
        "speaker_labels": True, # Detect and label speakers in your media file
    }
    response = requests.post(base_url + "/v2/transcript", json=data, headers=headers)
    if not response.ok:
        return {"error": "Transcription request failed", "details": response.text}

    transcript_id = response.json()['id']
    polling_endpoint = base_url + "/v2/transcript/" + transcript_id

    # Poll for completion
    while True:
        transcription_result = requests.get(polling_endpoint, headers=headers).json()

        if transcription_result['status'] == 'completed':
            # Extract features
            transcript = transcription_result.get('text', '')
            confidence = transcription_result.get('confidence', None)
            words = transcription_result.get('words', [])
            audio_duration = transcription_result.get('audio_duration', None)

            wpm = None
            if audio_duration and transcript:
                word_count = len(transcript.split())
                wpm = round(word_count / (audio_duration / 60), 1) if audio_duration > 0 else None
            # Filler words and hesitations from auto_highlights_result
            auto_highlights = transcription_result.get('auto_highlights_result', {})
            filler_count = 0
            hesitations = 0
            if auto_highlights and 'results' in auto_highlights:
                for item in auto_highlights['results']:
                    if item.get('type') == 'filler':
                        filler_count += item.get('count', 0)
                    if item.get('type') == 'hesitation':
                        hesitations += item.get('count', 0)
            # Sentiment analysis
            sentiment_results = transcription_result.get('sentiment_analysis_results', [])
            # Hedging phrases
            hedging_phrases = [
                "i think", "maybe", "sort of", "kind of", "possibly", "perhaps", "hopefully", "it seems like", "i guess", "i feel like", "i mean", "well", "just", "actually", "you know", "so"
            ]
            transcript_lower = transcript.lower()
            hedging_count = 0
            for phrase in hedging_phrases:
                hedging_count += transcript_lower.count(phrase)
            # Simple confidence score calculation (improved)
            score = 100
            if wpm and (wpm < 100 or wpm > 180):
                score -= 10
            score -= filler_count * 2
            score -= hesitations * 2
            score -= hedging_count * 2
            if wpm and (wpm < 100 or wpm > 180):
                score -= 10
            if confidence is not None:
                score += int((confidence - 0.8) * 50)  # boost for high confidence
            score = max(0, min(100, score))
            
            return {
                "transcript": transcript,
                "confidence": confidence,
                "wpm": wpm,
                "filler_count": filler_count,
                "hesitations": hesitations,
                "hedging_count": hedging_count,
                "sentiment_analysis": sentiment_results,
                "score": score
            }
        elif transcription_result['status'] == 'error':
            return {"error": f"Transcription failed: {transcription_result['error']}"}
        else:
            time.sleep(3)