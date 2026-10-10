/**
 * ElevenLabs Text-to-Speech Studio - Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Navigation & Status
  const apiStatusBadge = document.getElementById('apiStatusBadge');
  const apiStatusText = document.getElementById('apiStatusText');
  const apiAlertBanner = document.getElementById('apiAlertBanner');
  const dismissBannerBtn = document.getElementById('dismissBannerBtn');
  const guideBtn = document.getElementById('guideBtn');
  const setupGuideModal = document.getElementById('setupGuideModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalBottomBtn = document.getElementById('closeModalBottomBtn');
  const toastContainer = document.getElementById('toastContainer');

  // DOM Elements - Configuration Panel
  const voiceSelect = document.getElementById('voiceSelect');
  const refreshVoicesBtn = document.getElementById('refreshVoicesBtn');
  const modelSelect = document.getElementById('modelSelect');
  const modelDescription = document.getElementById('modelDescription');
  const voiceNameEl = document.getElementById('voiceName');
  const voiceAvatar = document.getElementById('voiceAvatar');
  const voiceCategory = document.getElementById('voiceCategory');
  const voiceLabels = document.getElementById('voiceLabels');
  const previewSampleBtn = document.getElementById('previewSampleBtn');

  // DOM Elements - Advanced Settings Accordion
  const accordionToggleBtn = document.getElementById('accordionToggleBtn');
  const accordionContent = document.getElementById('accordionContent');
  const stabilitySlider = document.getElementById('stabilitySlider');
  const stabilityVal = document.getElementById('stabilityVal');
  const similaritySlider = document.getElementById('similaritySlider');
  const similarityVal = document.getElementById('similarityVal');
  const styleSlider = document.getElementById('styleSlider');
  const styleVal = document.getElementById('styleVal');
  const speakerBoostToggle = document.getElementById('speakerBoostToggle');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');

  // DOM Elements - Text Input
  const textInput = document.getElementById('textInput');
  const charCount = document.getElementById('charCount');
  const wordCount = document.getElementById('wordCount');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const presetChips = document.querySelectorAll('.chip-btn');

  // DOM Elements - Primary Action Buttons
  const playBtn = document.getElementById('playBtn');
  const playBtnText = document.getElementById('playBtnText');
  const stopBtn = document.getElementById('stopBtn');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const loadingStatusTitle = document.getElementById('loadingStatusTitle');
  const loadingStatusDesc = document.getElementById('loadingStatusDesc');

  // DOM Elements - Audio Player Deck
  const nativeAudio = document.getElementById('nativeAudio');
  const samplePreviewAudio = document.getElementById('samplePreviewAudio');
  const playerVoiceTitle = document.getElementById('playerVoiceTitle');
  const audioWaveVisualizer = document.getElementById('audioWaveVisualizer');
  const currentTimeEl = document.getElementById('currentTime');
  const totalDurationEl = document.getElementById('totalDuration');
  const seekSlider = document.getElementById('seekSlider');
  const seekProgressFill = document.getElementById('seekProgressFill');
  const playerPlayPauseBtn = document.getElementById('playerPlayPauseBtn');
  const playerPlayIcon = document.getElementById('playerPlayIcon');
  const playerPauseIcon = document.getElementById('playerPauseIcon');
  const playerStopBtn = document.getElementById('playerStopBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const muteBtn = document.getElementById('muteBtn');
  const volumeHighIcon = document.getElementById('volumeHighIcon');
  const volumeMutedIcon = document.getElementById('volumeMutedIcon');
  const speedSelect = document.getElementById('speedSelect');
  const downloadBtn = document.getElementById('downloadBtn');

  // DOM Elements - History
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // Application State
  let voicesList = [];
  let currentAudioUrl = null;
  let currentAudioBlob = null;
  let currentVoiceName = '';
  let abortController = null;
  let isGenerating = false;
  let generationHistory = [];

  // Preset Sample Scripts
  const SCRIPT_PRESETS = {
    story: "In the quiet expanse of the Orion Nebula, an abandoned observation station began transmitting coordinates that no star chart had ever recorded.",
    news: "Good morning. Artificial intelligence researchers have introduced new generative speech models capable of zero-shot emotive voice cloning with unprecedented clarity.",
    motivation: "The secret to unlocking your potential isn't waiting for the right moment. It's having the courage to begin today, embrace the challenges, and keep moving forward.",
    customer: "Hello and thank you for reaching out to ElevenLabs support. My name is Rachel, and I will be delighted to guide you through setting up your project."
  };

  /* ==========================================================================
     Toast Notification System
     ========================================================================== */
  function showToast(message, type = 'info', duration = 4500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-msg">${message}</div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  /* ==========================================================================
     API Status Check
     ========================================================================== */
  async function checkApiStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();

      if (data.configured) {
        apiStatusBadge.className = 'status-badge connected';
        apiStatusText.textContent = `API Ready (${data.preview})`;
        apiAlertBanner.classList.add('hidden');
      } else {
        apiStatusBadge.className = 'status-badge warning';
        apiStatusText.textContent = 'API Key Needed';
        apiAlertBanner.classList.remove('hidden');
      }
    } catch (err) {
      console.warn('Could not contact API status route:', err);
      apiStatusBadge.className = 'status-badge warning';
      apiStatusText.textContent = 'Server Offline';
      showToast('Cannot reach Node.js server. Please check terminal.', 'error');
    }
  }

  /* ==========================================================================
     Load Voices & Models
     ========================================================================== */
  async function loadVoices() {
    voiceSelect.innerHTML = '<option value="" disabled selected>Loading ElevenLabs voices...</option>';

    try {
      const res = await fetch('/api/voices');
      const data = await res.json();

      if (!data.voices || data.voices.length === 0) {
        throw new Error('No voices returned by server.');
      }

      voicesList = data.voices;
      voiceSelect.innerHTML = '';

      // Populate voice options
      voicesList.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.voice_id;
        
        const accent = voice.labels?.accent ? ` [${voice.labels.accent}]` : '';
        const desc = voice.labels?.description ? ` - ${voice.labels.description}` : '';
        option.textContent = `${voice.name}${accent}${desc}`;
        voiceSelect.appendChild(option);
      });

      // Default selection (Adam or first voice)
      const defaultVoice = voicesList.find(v => v.name.toLowerCase() === 'adam') || voicesList[0];
      if (defaultVoice) {
        voiceSelect.value = defaultVoice.voice_id;
        updateVoiceCard(defaultVoice);
      }

      if (data.isFallback) {
        showToast('Using curated voices. Add your ElevenLabs API key in .env to load full voice library.', 'info', 6000);
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
      showToast('Failed to load voice list from server.', 'error');
      voiceSelect.innerHTML = '<option value="" disabled>Failed to load voices</option>';
    }
  }

  function updateVoiceCard(voice) {
    if (!voice) return;

    currentVoiceName = voice.name;
    voiceNameEl.textContent = voice.name;
    voiceAvatar.textContent = voice.name.charAt(0).toUpperCase();
    voiceCategory.textContent = voice.category || 'voice';

    // Update tags
    voiceLabels.innerHTML = '';
    const labels = voice.labels || {};
    const tagValues = [labels.accent, labels.gender, labels.description, labels.use_case].filter(Boolean);

    if (tagValues.length === 0) {
      tagValues.push('Natural Voice');
    }

    tagValues.forEach(val => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = val;
      voiceLabels.appendChild(span);
    });

    // Handle voice preview sample availability
    if (voice.preview_url) {
      previewSampleBtn.style.display = 'inline-flex';
      previewSampleBtn.onclick = () => playVoiceSample(voice.preview_url, voice.name);
    } else {
      previewSampleBtn.style.display = 'none';
    }
  }

  function playVoiceSample(sampleUrl, name) {
    if (samplePreviewAudio.src === sampleUrl && !samplePreviewAudio.paused) {
      samplePreviewAudio.pause();
      previewSampleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Sample</span>
      `;
      return;
    }

    samplePreviewAudio.src = sampleUrl;
    samplePreviewAudio.play()
      .then(() => {
        previewSampleBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <span>Pause</span>
        `;
        showToast(`Playing sample preview for "${name}"`, 'info', 2500);
      })
      .catch(e => {
        console.warn('Sample preview play blocked:', e);
        showToast('Sample preview playback blocked or unavailable.', 'warning');
      });

    samplePreviewAudio.onended = () => {
      previewSampleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Sample</span>
      `;
    };
  }

  voiceSelect.addEventListener('change', (e) => {
    const selected = voicesList.find(v => v.voice_id === e.target.value);
    if (selected) {
      updateVoiceCard(selected);
    }
  });

  refreshVoicesBtn.addEventListener('click', () => {
    loadVoices();
    checkApiStatus();
    showToast('Refreshing voices list...', 'info', 2000);
  });

  // Model Selection description updates
  const MODEL_INFO = {
    'eleven_multilingual_v2': 'Cutting-edge emotional accuracy and natural cadence across 29 languages. Recommended.',
    'eleven_flash_v2_5': 'Ultra-fast (~75ms latency) model supporting 32 languages. Ideal for real-time applications.',
    'eleven_turbo_v2_5': 'High-speed, high-quality multilingual model with balanced performance.',
    'eleven_monolingual_v1': 'Original foundational model optimized purely for English narration.'
  };

  modelSelect.addEventListener('change', (e) => {
    const desc = MODEL_INFO[e.target.value] || 'Official ElevenLabs text-to-speech model.';
    modelDescription.textContent = desc;
  });

  /* ==========================================================================
     Advanced Settings Accordion & Sliders
     ========================================================================== */
  accordionToggleBtn.addEventListener('click', () => {
    const isExpanded = accordionToggleBtn.getAttribute('aria-expanded') === 'true';
    accordionToggleBtn.setAttribute('aria-expanded', !isExpanded);
    accordionContent.classList.toggle('expanded', !isExpanded);
  });

  stabilitySlider.addEventListener('input', (e) => {
    stabilityVal.textContent = `${Math.round(e.target.value * 100)}%`;
  });

  similaritySlider.addEventListener('input', (e) => {
    similarityVal.textContent = `${Math.round(e.target.value * 100)}%`;
  });

  styleSlider.addEventListener('input', (e) => {
    styleVal.textContent = `${Math.round(e.target.value * 100)}%`;
  });

  resetSettingsBtn.addEventListener('click', () => {
    stabilitySlider.value = 0.5;
    stabilityVal.textContent = '50%';
    similaritySlider.value = 0.75;
    similarityVal.textContent = '75%';
    styleSlider.value = 0.0;
    styleVal.textContent = '0%';
    speakerBoostToggle.checked = true;
    showToast('Voice settings reset to defaults.', 'info', 2000);
  });

  /* ==========================================================================
     Text Input Tools & Counters
     ========================================================================== */
  function updateCounters() {
    const text = textInput.value;
    const length = text.length;
    charCount.textContent = length.toLocaleString();

    const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    wordCount.textContent = `${words.toLocaleString()} words`;

    if (length > 4500) {
      charCount.style.color = '#ef4444';
    } else {
      charCount.style.color = 'inherit';
    }
  }

  textInput.addEventListener('input', updateCounters);

  // Quick Prompt Presets
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const presetKey = chip.getAttribute('data-preset');
      if (SCRIPT_PRESETS[presetKey]) {
        textInput.value = SCRIPT_PRESETS[presetKey];
        updateCounters();
        textInput.focus();
        showToast(`Loaded ${chip.textContent.trim()} prompt!`, 'info', 2000);
      }
    });
  });

  // Clear Text Button
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    updateCounters();
    textInput.focus();
  });

  // Paste from Clipboard Button
  pasteBtn.addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        textInput.value = clipText;
        updateCounters();
        showToast('Text pasted from clipboard!', 'success', 2000);
      }
    } catch (err) {
      showToast('Clipboard access was denied. Please paste manually (Ctrl+V).', 'warning');
    }
  });

  /* ==========================================================================
     Text-to-Speech Synthesis Generation
     ========================================================================== */
  async function generateAndPlaySpeech() {
    const text = textInput.value.trim();

    if (!text) {
      showToast('Please type or paste some text to generate speech.', 'warning');
      textInput.focus();
      return;
    }

    if (text.length > 5000) {
      showToast('Text exceeds maximum limit of 5,000 characters.', 'error');
      return;
    }

    const voiceId = voiceSelect.value;
    if (!voiceId) {
      showToast('Please select a voice from the dropdown.', 'warning');
      return;
    }

    const modelId = modelSelect.value;
    const voiceSettings = {
      stability: parseFloat(stabilitySlider.value),
      similarity_boost: parseFloat(similaritySlider.value),
      style: parseFloat(styleSlider.value),
      use_speaker_boost: speakerBoostToggle.checked
    };

    // UI state: generating
    isGenerating = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;
    loadingIndicator.classList.remove('hidden');
    playBtnText.textContent = 'Synthesizing Audio...';

    // Set up abort controller
    abortController = new AbortController();

    try {
      loadingStatusTitle.textContent = 'Calling ElevenLabs API...';
      loadingStatusDesc.textContent = `Generating audio using voice "${currentVoiceName}" and model "${modelId}"...`;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          model_id: modelId,
          voice_settings: voiceSettings
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        let errJson = null;
        try {
          errJson = await response.json();
        } catch (e) {
          errJson = { message: `Server error status: ${response.status}` };
        }

        const msg = errJson.message || 'ElevenLabs synthesis failed.';
        showToast(msg, 'error', 6000);

        if (errJson.error === 'MISSING_API_KEY') {
          apiAlertBanner.classList.remove('hidden');
        }
        return;
      }

      // Received MP3 audio stream
      loadingStatusTitle.textContent = 'Decoding Audio Stream...';
      const audioBlob = await response.blob();

      // Revoke previous audio URL
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }

      currentAudioBlob = audioBlob;
      currentAudioUrl = URL.createObjectURL(audioBlob);

      // Load into native audio player
      nativeAudio.src = currentAudioUrl;
      nativeAudio.playbackRate = parseFloat(speedSelect.value);

      // Play generated audio
      await nativeAudio.play();

      // Enable player controls
      playerVoiceTitle.textContent = `${currentVoiceName} (${modelSelect.options[modelSelect.selectedIndex].text.split('(')[0].trim()})`;
      playerPlayPauseBtn.disabled = false;
      playerStopBtn.disabled = false;
      downloadBtn.disabled = false;

      // Add to generation history
      addToHistory({
        id: Date.now(),
        voice: currentVoiceName,
        text: text,
        blobUrl: currentAudioUrl,
        blob: audioBlob,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      showToast(`Narration generated successfully with ${currentVoiceName}!`, 'success', 3500);

    } catch (err) {
      if (err.name === 'AbortError') {
        showToast('Speech generation was stopped by user.', 'info', 2500);
      } else {
        console.error('TTS Generation error:', err);
        showToast('Network error while generating speech. Please check backend server.', 'error', 5000);
      }
    } finally {
      isGenerating = false;
      playBtn.disabled = false;
      playBtnText.textContent = 'Generate & Play Speech';
      loadingIndicator.classList.add('hidden');
      if (nativeAudio.paused) {
        stopBtn.disabled = true;
      }
    }
  }

  // Primary Play Button click
  playBtn.addEventListener('click', generateAndPlaySpeech);

  // Stop Button click (Cancels in-flight generation OR stops active audio)
  stopBtn.addEventListener('click', () => {
    if (isGenerating && abortController) {
      abortController.abort();
    }
    stopPlayback();
  });

  function stopPlayback() {
    nativeAudio.pause();
    nativeAudio.currentTime = 0;
    samplePreviewAudio.pause();
    seekSlider.value = 0;
    seekProgressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    updatePlayerPlayState(false);
    stopBtn.disabled = true;
  }

  /* ==========================================================================
     Audio Player Deck Controls & Events
     ========================================================================== */
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updatePlayerPlayState(isPlaying) {
    if (isPlaying) {
      playerPlayIcon.classList.add('hidden');
      playerPauseIcon.classList.remove('hidden');
      audioWaveVisualizer.classList.add('playing');
      stopBtn.disabled = false;
    } else {
      playerPlayIcon.classList.remove('hidden');
      playerPauseIcon.classList.add('hidden');
      audioWaveVisualizer.classList.remove('playing');
    }
  }

  playerPlayPauseBtn.addEventListener('click', () => {
    if (!nativeAudio.src) return;

    if (nativeAudio.paused) {
      nativeAudio.play();
    } else {
      nativeAudio.pause();
    }
  });

  playerStopBtn.addEventListener('click', stopPlayback);

  nativeAudio.addEventListener('play', () => {
    updatePlayerPlayState(true);
  });

  nativeAudio.addEventListener('pause', () => {
    updatePlayerPlayState(false);
  });

  nativeAudio.addEventListener('ended', () => {
    updatePlayerPlayState(false);
    stopBtn.disabled = true;
  });

  nativeAudio.addEventListener('loadedmetadata', () => {
    totalDurationEl.textContent = formatTime(nativeAudio.duration);
    seekSlider.max = nativeAudio.duration || 100;
  });

  nativeAudio.addEventListener('timeupdate', () => {
    if (!isNaN(nativeAudio.duration) && nativeAudio.duration > 0) {
      currentTimeEl.textContent = formatTime(nativeAudio.currentTime);
      seekSlider.value = nativeAudio.currentTime;
      const pct = (nativeAudio.currentTime / nativeAudio.duration) * 100;
      seekProgressFill.style.width = `${pct}%`;
    }
  });

  seekSlider.addEventListener('input', (e) => {
    if (!isNaN(nativeAudio.duration)) {
      nativeAudio.currentTime = parseFloat(e.target.value);
      currentTimeEl.textContent = formatTime(nativeAudio.currentTime);
      const pct = (nativeAudio.currentTime / nativeAudio.duration) * 100;
      seekProgressFill.style.width = `${pct}%`;
    }
  });

  // Volume & Mute
  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    nativeAudio.volume = val;
    if (val === 0) {
      volumeHighIcon.classList.add('hidden');
      volumeMutedIcon.classList.remove('hidden');
    } else {
      volumeHighIcon.classList.remove('hidden');
      volumeMutedIcon.classList.add('hidden');
    }
  });

  muteBtn.addEventListener('click', () => {
    if (nativeAudio.volume > 0) {
      nativeAudio.volume = 0;
      volumeSlider.value = 0;
      volumeHighIcon.classList.add('hidden');
      volumeMutedIcon.classList.remove('hidden');
    } else {
      nativeAudio.volume = 1;
      volumeSlider.value = 1;
      volumeHighIcon.classList.remove('hidden');
      volumeMutedIcon.classList.add('hidden');
    }
  });

  // Playback Speed
  speedSelect.addEventListener('change', (e) => {
    nativeAudio.playbackRate = parseFloat(e.target.value);
  });

  // Download MP3
  downloadBtn.addEventListener('click', () => {
    if (!currentAudioBlob) {
      showToast('No audio generated to download.', 'warning');
      return;
    }

    const downloadUrl = URL.createObjectURL(currentAudioBlob);
    const safeVoice = (currentVoiceName || 'narration').toLowerCase().replace(/\s+/g, '-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `elevenlabs-${safeVoice}-${timestamp}.mp3`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
    showToast(`Downloading "${fileName}"...`, 'success', 3000);
  });

  /* ==========================================================================
     Generation History List
     ========================================================================== */
  function addToHistory(item) {
    generationHistory.unshift(item);
    if (generationHistory.length > 8) {
      generationHistory.pop();
    }
    renderHistory();
  }

  function renderHistory() {
    if (generationHistory.length === 0) {
      historyList.innerHTML = '<div class="empty-history">No speech generated yet. Enter text above and click Play!</div>';
      return;
    }

    historyList.innerHTML = '';
    generationHistory.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';

      const snippet = item.text.length > 55 ? `${item.text.slice(0, 52)}...` : item.text;

      div.innerHTML = `
        <div class="history-meta">
          <div class="history-title">🎙️ ${item.voice}: "${snippet}"</div>
          <div class="history-sub">${item.timestamp}</div>
        </div>
        <div class="history-actions">
          <button class="pill-btn replay-btn" title="Play Narration">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Play
          </button>
          <button class="pill-btn dl-btn" title="Download Audio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      `;

      // Replay
      div.querySelector('.replay-btn').onclick = () => {
        nativeAudio.src = item.blobUrl;
        playerVoiceTitle.textContent = `${item.voice} (Saved)`;
        nativeAudio.play();
        playerPlayPauseBtn.disabled = false;
        playerStopBtn.disabled = false;
        downloadBtn.disabled = false;
        currentAudioBlob = item.blob;
        showToast(`Playing saved audio (${item.voice})`, 'info', 2000);
      };

      // Download
      div.querySelector('.dl-btn').onclick = () => {
        const downloadUrl = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `elevenlabs-${item.voice.toLowerCase()}-${item.id}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      };

      historyList.appendChild(div);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    generationHistory = [];
    renderHistory();
    showToast('Generation history cleared.', 'info', 2000);
  });

  /* ==========================================================================
     Modal & Alert Handlers
     ========================================================================== */
  dismissBannerBtn.addEventListener('click', () => {
    apiAlertBanner.classList.add('hidden');
  });

  guideBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setupGuideModal.classList.add('open');
  });

  closeModalBtn.addEventListener('click', () => {
    setupGuideModal.classList.remove('open');
  });

  closeModalBottomBtn.addEventListener('click', () => {
    setupGuideModal.classList.remove('open');
  });

  setupGuideModal.addEventListener('click', (e) => {
    if (e.target === setupGuideModal) {
      setupGuideModal.classList.remove('open');
    }
  });

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && setupGuideModal.classList.contains('open')) {
      setupGuideModal.classList.remove('open');
    }
  });

  /* ==========================================================================
     Application Initialization
     ========================================================================== */
  // Initial check and fetch
  checkApiStatus();
  loadVoices();
  updateCounters();

  // Load sample preset into text area initially for instant wow factor
  textInput.value = SCRIPT_PRESETS.story;
  updateCounters();
});
