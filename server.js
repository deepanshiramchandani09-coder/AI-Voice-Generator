const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend assets
app.use(express.static(__dirname));

// Pre-curated official ElevenLabs voices (Prioritizes free-tier compatible premade voices)
const DEFAULT_FALLBACK_VOICES = [
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'premade',
    labels: { accent: 'american', description: 'deep', age: 'middle_aged', gender: 'male', use_case: 'narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/673417e4-2395-46fe-882d-881b854e4c27.mp3'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    category: 'premade',
    labels: { accent: 'american', description: 'well-rounded', age: 'young', gender: 'male', use_case: 'narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d80f3a-7d3f-4833-8329-a72093510006.mp3'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'premade',
    labels: { accent: 'american', description: 'soft', age: 'young', gender: 'female', use_case: 'narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01504e92-e300-473d-a511-7890e0d1656f.mp3'
  },
  {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    category: 'premade',
    labels: { accent: 'british', description: 'warm', age: 'middle_aged', gender: 'male', use_case: 'storytelling' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-47bc-8863-28c0697222e6.mp3'
  },
  {
    voice_id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    category: 'premade',
    labels: { accent: 'british', description: 'deep', age: 'middle_aged', gender: 'male', use_case: 'news presenter' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0237-c6ff-4796-94b2-04e334469275.mp3'
  },
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    category: 'premade',
    labels: { accent: 'american', description: 'calm', age: 'young', gender: 'female', use_case: 'narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-1965-4d70-b308-11394103ab46.mp3'
  },
  {
    voice_id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    category: 'premade',
    labels: { accent: 'american', description: 'strong', age: 'young', gender: 'female', use_case: 'audiobook' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/502e63b4-1a28-4444-be1a-9694ce0b6167.mp3'
  },
  {
    voice_id: 'VR6AewLTigWG4x5hh3GPS',
    name: 'Arnold',
    category: 'premade',
    labels: { accent: 'american', description: 'crisp', age: 'middle_aged', gender: 'male', use_case: 'narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4x5hh3GPS/8dd9c836-8a03-4f93-b67e-400762fa5ab4.mp3'
  },
  {
    voice_id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    category: 'premade',
    labels: { accent: 'american', description: 'raspy', age: 'young', gender: 'male', use_case: 'narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/1c4d417c-b9c6-4983-aab6-201a403ab52c.mp3'
  },
  {
    voice_id: 'ZQe5CZNOzWyzPSCn5a3c',
    name: 'James',
    category: 'premade',
    labels: { accent: 'australian', description: 'calm', age: 'old', gender: 'male', use_case: 'news' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ZQe5CZNOzWyzPSCn5a3c/357606e1-9524-4f25-83fb-980bf857ff11.mp3'
  }
];

// Official ElevenLabs TTS Models
const SUPPORTED_MODELS = [
  {
    model_id: 'eleven_multilingual_v2',
    name: 'Eleven Multilingual v2',
    description: 'Cutting-edge emotional accuracy and natural cadence across 29 languages. Recommended.',
    languages: '29 Languages',
    recommended: true
  },
  {
    model_id: 'eleven_flash_v2_5',
    name: 'Eleven Flash v2.5',
    description: 'Ultra-fast (~75ms latency) model supporting 32 languages. Ideal for real-time applications.',
    languages: '32 Languages',
    recommended: false
  },
  {
    model_id: 'eleven_turbo_v2_5',
    name: 'Eleven Turbo v2.5',
    description: 'High-speed, high-quality multilingual model with balanced performance.',
    languages: '32 Languages',
    recommended: false
  },
  {
    model_id: 'eleven_monolingual_v1',
    name: 'Eleven English v1',
    description: 'Original foundational model optimized purely for English narration.',
    languages: 'English only',
    recommended: false
  }
];

// Helper: Checks if API key is present and not the placeholder template
function getApiKey() {
  const key = process.env.ELEVENLABS_API_KEY ? process.env.ELEVENLABS_API_KEY.trim() : '';
  if (!key || key === 'your_elevenlabs_api_key_here' || key === 'YOUR_API_KEY_HERE') {
    return null;
  }
  return key;
}

/**
 * GET /api/status
 * Returns system configuration status without leaking API key
 */
app.get('/api/status', (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.json({
      configured: false,
      message: 'ElevenLabs API key is missing. Add your key in the .env file.',
      preview: null
    });
  }

  // Masked preview for security
  const maskedKey = apiKey.length > 8 
    ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
    : 'sk_***';

  res.json({
    configured: true,
    message: 'ElevenLabs API key is configured.',
    preview: maskedKey
  });
});

/**
 * GET /api/models
 * Returns the list of officially supported ElevenLabs models
 */
app.get('/api/models', (req, res) => {
  res.json({
    success: true,
    models: SUPPORTED_MODELS
  });
});

/**
 * GET /api/voices
 * Fetches available voices from ElevenLabs API, or returns fallback list
 */
app.get('/api/voices', async (req, res) => {
  const apiKey = getApiKey();

  // If API key is not configured, supply high-quality fallback voice list
  if (!apiKey) {
    return res.json({
      success: true,
      voices: DEFAULT_FALLBACK_VOICES,
      isFallback: true,
      message: 'Using default preset voices. Add your ElevenLabs API key in .env to fetch your custom and full voice library.'
    });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`ElevenLabs API returned ${response.status} when fetching voices:`, errText);
      // Fallback to default voices on error
      return res.json({
        success: true,
        voices: DEFAULT_FALLBACK_VOICES,
        isFallback: true,
        message: `API returned ${response.status}. Using cached voices.`
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      voices: data.voices || DEFAULT_FALLBACK_VOICES,
      isFallback: false
    });
  } catch (error) {
    console.error('Error fetching voices from ElevenLabs:', error.message);
    return res.json({
      success: true,
      voices: DEFAULT_FALLBACK_VOICES,
      isFallback: true,
      message: 'Network issue contacting ElevenLabs. Using cached voices.'
    });
  }
});

/**
 * POST /api/tts
 * Generates speech from text using ElevenLabs Text-to-Speech API
 * Expects JSON: { text, voice_id, model_id, voice_settings }
 * Returns: audio/mpeg binary stream
 */
app.post('/api/tts', async (req, res) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return res.status(400).json({
      error: 'MISSING_API_KEY',
      message: 'ElevenLabs API Key is not configured. Please open .env and set ELEVENLABS_API_KEY to your valid key.'
    });
  }

  const { text, voice_id, model_id, voice_settings } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      error: 'EMPTY_TEXT',
      message: 'Please provide text to convert into speech.'
    });
  }

  if (text.length > 5000) {
    return res.status(400).json({
      error: 'TEXT_TOO_LONG',
      message: 'Text exceeds maximum character limit of 5,000 characters per request.'
    });
  }

  const selectedVoiceId = voice_id || 'pNInz6obpgDQGcFmaJgB'; // Adam (Free tier compatible default)
  const selectedModelId = model_id || 'eleven_multilingual_v2';

  const payload = {
    text: text.trim(),
    model_id: selectedModelId,
    voice_settings: {
      stability: typeof voice_settings?.stability === 'number' ? voice_settings.stability : 0.5,
      similarity_boost: typeof voice_settings?.similarity_boost === 'number' ? voice_settings.similarity_boost : 0.75,
      style: typeof voice_settings?.style === 'number' ? voice_settings.style : 0.0,
      use_speaker_boost: typeof voice_settings?.use_speaker_boost === 'boolean' ? voice_settings.use_speaker_boost : true
    }
  };

  try {
    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`;
    
    const elevenResponse = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload)
    });

    if (!elevenResponse.ok) {
      const errorBody = await elevenResponse.text();
      let parsedError = {};
      try {
        parsedError = JSON.parse(errorBody);
      } catch (e) {
        parsedError = { detail: errorBody };
      }

      let userFriendlyMessage = 'Speech generation failed.';
      if (elevenResponse.status === 401) {
        userFriendlyMessage = 'Invalid ElevenLabs API key. Please check the ELEVENLABS_API_KEY in your .env file.';
      } else if (elevenResponse.status === 402) {
        userFriendlyMessage = 'This voice requires a paid ElevenLabs plan on API. Please select Adam, Antoni, Bella, George, or Daniel which are fully available on free accounts!';
      } else if (elevenResponse.status === 429) {
        userFriendlyMessage = 'ElevenLabs quota exceeded or rate limit reached. Please check your credit balance.';
      } else if (elevenResponse.status === 404) {
        userFriendlyMessage = `Voice ID "${selectedVoiceId}" was not found. Please pick another voice.`;
      } else if (parsedError.detail?.message) {
        userFriendlyMessage = parsedError.detail.message;
      } else if (typeof parsedError.detail === 'string') {
        userFriendlyMessage = parsedError.detail;
      }

      return res.status(elevenResponse.status).json({
        error: 'ELEVENLABS_ERROR',
        status: elevenResponse.status,
        message: userFriendlyMessage,
        details: parsedError
      });
    }

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="narration.mp3"');
    res.setHeader('Cache-Control', 'no-cache');

    const audioArrayBuffer = await elevenResponse.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);
    
    return res.end(audioBuffer);
  } catch (error) {
    console.error('Server error calling ElevenLabs TTS:', error);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to communicate with ElevenLabs API. Check your internet connection.'
    });
  }
});

// Fallback route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎙️ ElevenLabs Text-to-Speech Server Running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🔑 API Key Configured: ${getApiKey() ? 'YES (Secure in .env)' : 'NO (See .env.example)'}`);
  console.log(`====================================================`);
});
