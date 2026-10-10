# 🎙️ ElevenLabs Text-to-Speech Web Studio

A complete, modern, responsive AI Text-to-Speech (TTS) web application built with **HTML5, CSS3, JavaScript (ES6+), and a secure Node.js Express backend**, integrating the official **ElevenLabs API**.

Designed to be beginner-friendly, visually stunning, and ready for college projects, capstone demonstrations, and portfolio showcases.

---

## ✨ Features

- **🎨 Modern Dark Studio UI**: Glassmorphism aesthetic, ambient glows, fluid animations, and responsive layout for mobile, tablet, and desktop screens.
- **🗣️ Dynamic Voice Selection**: Automatically fetches voices directly from the ElevenLabs API (`/v1/voices`), displaying voice tags (accent, age, gender, use case) with an integrated voice sample preview audio player.
- **⚡ Official ElevenLabs Models**:
  - `eleven_multilingual_v2` (High Quality, 29 languages) — *Recommended default*
  - `eleven_flash_v2_5` (Ultra-low latency ~75ms, 32 languages)
  - `eleven_turbo_v2_5` (Fast, high-fidelity multilingual)
  - `eleven_monolingual_v1` (English v1 foundational model)
- **🎛️ Advanced Voice Settings**: Interactive sliders for *Stability*, *Clarity + Similarity*, and *Style Exaggeration*, plus a toggle for *Speaker Boost*.
- **📝 Smart Text Input**: Large input area with real-time character & word counters, 5,000-character safety guard, clipboard paste, quick prompt presets (Sci-Fi, Tech News, Motivation, Customer Support), and clear button.
- **▶️ Real-Time Synthesis & Playback**: Generates realistic neural audio with instant playback upon completion.
- **⏹️ Immediate Stop & Request Cancellation**: Instant audio stop and `AbortController` cancellation for in-flight API requests.
- **📊 Custom Audio Player Deck**:
  - Animated soundwave visualizer
  - Precision timeline scrubber with elapsed and total duration
  - Volume control with one-click mute
  - Playback speed control (0.75x, 1.0x, 1.25x, 1.5x, 2.0x)
  - **Direct MP3 Download** (`elevenlabs-[voice]-[timestamp].mp3`)
- **📜 Generation History**: Keeps a log of recently generated audio clips with instant replay and download options.
- **🔒 Backend API Key Protection**: The ElevenLabs API key is safely stored on the server inside `.env` and never exposed to the frontend browser network tab.
- **🛡️ Comprehensive Error Handling**: Toast notifications and diagnostic alerts for missing API keys, rate limits, invalid keys, and network disruptions.

---

## 🏗️ Project Architecture

```
eleven-labs/
├── index.html           # Semantic HTML5 frontend with accessibility
├── style.css            # Custom CSS3 design system with glassmorphism & dark theme
├── script.js            # Vanilla JavaScript handling UI, audio playback, and API calls
├── server.js            # Node.js + Express backend proxying ElevenLabs API securely
├── package.json         # Project metadata and dependencies (Express, CORS, dotenv)
├── .env.example         # Template for required environment variables
├── .gitignore           # Protects your .env and node_modules from Git
└── README.md            # Complete documentation and setup guide
```

### Request Flow
```
[Browser Frontend (HTML/CSS/JS)]
         │
         │  POST /api/tts { text, voice_id, model_id, voice_settings }
         ▼
[Node.js Backend (server.js)]  <─── Reads ELEVENLABS_API_KEY from .env
         │
         │  POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
         ▼
[Official ElevenLabs API Engine]
         │
         │  Returns binary MP3 audio stream (audio/mpeg)
         ▼
[Node.js Backend] ── Streams audio back to browser ──▶ [Browser Custom Audio Player]
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or later recommended).
  Check by running:
  ```bash
  node -v
  ```

### 2. Install Dependencies
Open a terminal in the project directory and run:
```bash
npm install
```
This installs `express`, `cors`, and `dotenv`.

---

### 3. Configure Your ElevenLabs API Key

1. If you don't have an account, sign up for free at [elevenlabs.io](https://elevenlabs.io).
2. Click your **Profile avatar** in the bottom-left corner and navigate to **API Keys** (or go to [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)).
3. Click **Create API Key** and copy it.
4. In the project folder, copy `.env.example` to create a new file named `.env`:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On Mac / Linux:
     ```bash
     cp .env.example .env
     ```
5. Open `.env` in any text editor and replace the placeholder with your actual key:
   ```env
   ELEVENLABS_API_KEY=sk_your_actual_elevenlabs_api_key_here
   PORT=3000
   ```
   > ⚠️ **Important:** Never commit your `.env` file to public GitHub repositories! The provided `.gitignore` already ignores it.

---

### 4. Run the Application

Start the server:
```bash
npm start
```
You will see output in the terminal:
```
====================================================
🎙️ ElevenLabs Text-to-Speech Server Running!
🌐 Local URL: http://localhost:3000
🔑 API Key Configured: YES (Secure in .env)
====================================================
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Testing & Verification

1. **Verify API Connection**:
   - The status badge at the top-right will show `API Ready (sk_...xxxx)`.
   - If no key is set yet, an amber alert banner guides you to configure `.env`.
2. **Select Voice & Model**:
   - Pick any voice from the dropdown (e.g. *Rachel*, *Adam*, *Antoni*).
   - Click the **Sample** button on the voice bio card to hear a sample preview.
   - Choose your preferred model (e.g. *Eleven Multilingual v2*).
3. **Input Text**:
   - Click one of the quick prompt pills (e.g. *✨ Sci-Fi Intro* or *📰 Tech News*) or type your own text.
   - Notice the live character and word counters updating.
4. **Generate & Play**:
   - Click **Generate & Play Speech**.
   - Watch the animated soundwave loader while the audio synthesizes.
   - Audio begins playing immediately through the custom audio player deck!
5. **Player Controls**:
   - Test **Play / Pause**, scrubbing through the timeline slider, volume adjustment, and changing playback speed.
   - Click **Download MP3** to save the generated file to your computer.
   - Check the **Recent Generations** list at the bottom to replay or redownload past generations.

---

## 🛠️ API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Checks if `ELEVENLABS_API_KEY` is present and returns masked preview |
| `GET` | `/api/models` | Returns available ElevenLabs neural models and metadata |
| `GET` | `/api/voices` | Returns voice library from ElevenLabs API (or curated fallback list) |
| `POST` | `/api/tts` | Synthesizes text to speech and streams back `audio/mpeg` MP3 |

### Example POST `/api/tts` Payload
```json
{
  "text": "Hello, world! This is generated with ElevenLabs AI.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

---

## 🎓 College Project / Presentation Highlights

When demonstrating this project for academic evaluation or technical interviews, highlight:
1. **Security Best Practice**: Direct API calls from browsers expose secret credentials in devtools network tabs. This project prevents key leakage by implementing a proxy server with environment variables and git exclusion.
2. **Binary Stream Handling**: Binary audio streaming (`audio/mpeg`) between ElevenLabs API, Node.js buffer stream, and client-side `Blob` / `URL.createObjectURL()`.
3. **Graceful Degradation**: If an API key is not yet configured or the network drops, fallback presets keep the UI interactive and notify the user with helpful toasts.
4. **Interactive Audio API & Canvas/CSS Visualizer**: Custom scrubber, reactive waveform animation, and playback rate control.

---

## 📄 License

This project is licensed under the MIT License.
