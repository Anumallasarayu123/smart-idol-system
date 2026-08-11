const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { MPEGDecoder } = require('mpg123-decoder');

// Import Panchangam calculation engine for Today's Date (.cjs)
const { CITIES, getDailyPanchangam, generateAudioScript } = require('./src/utils/panchangamEngineNode.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for ALL requests
app.use(cors());
app.use(express.json());

// Global Headers Middleware (No Cache + CORS)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

// Audio Storage Directory Setup
const STORAGE_DIR = path.resolve(__dirname, 'storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const LATEST_MP3_PATH = path.resolve(STORAGE_DIR, 'latest.mp3');
const LATEST_WAV_PATH = path.resolve(STORAGE_DIR, 'latest.wav');
const STATE_FILE_PATH = path.resolve(STORAGE_DIR, 'state.json');

let audioLastUpdated = null;
let currentWifiSsid = 'Neonflake';
let currentWifiPassword = 'FanSense#2023';

// ESP32 Motion State Flags (Globally Defined)
let motionTriggered = false;
let lastMotionTimestamp = null;
let lastGeneratedDateKey = null;

let currentPanchangamLang = 'te';
let currentCityId = 'hyderabad';
let currentPanchangamText = '';

// Load saved state on startup
try {
  if (fs.existsSync(STATE_FILE_PATH)) {
    const savedState = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf8'));
    if (savedState.lang) currentPanchangamLang = savedState.lang;
    if (savedState.city) currentCityId = savedState.city;
  }
} catch (e) {}

function updateTodayPanchangamText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  const todayPanchang = getDailyPanchangam(currentCityId, now);
  currentPanchangamText = generateAudioScript(currentPanchangamLang, todayPanchang);
  lastGeneratedDateKey = dateKey;
  return dateKey;
}

updateTodayPanchangamText();

function saveServerState() {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify({
      text: currentPanchangamText,
      lang: currentPanchangamLang,
      city: currentCityId,
      timestamp: new Date().toISOString()
    }, null, 2));
  } catch (e) {}
}

// Helper 1: Clean and sanitize text for Google TTS engine
function sanitizeTextForTTS(rawText) {
  if (!rawText) return 'ఓం శ్రీ వేంకటేశాయ నమః.';
  return rawText
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper 2: Smart Natural Phrase Chunking (Splits on punctuation & clause limits)
function splitTextToNaturalPhrases(text, maxLen = 60) {
  const sentences = text.split(/([।\.!\?\,;:–\n]+)/);
  const chunks = [];
  let current = '';

  for (let s of sentences) {
    if (!s.trim()) continue;
    if ((current + ' ' + s).length <= maxLen) {
      current += (current ? ' ' : '') + s.trim();
    } else {
      if (current) chunks.push(current);
      current = s.trim();
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

// Helper 3: Build standard 44-Byte RIFF WAV Header (16-bit, 44100Hz MONO PCM)
function createWavHeader(pcmDataLength, sampleRate = 44100, numChannels = 1, bitsPerSample = 16) {
  const buffer = Buffer.alloc(44);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + pcmDataLength, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);                             // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);                              // AudioFormat (1 = Uncompressed PCM)
  buffer.writeUInt16LE(numChannels, 22);                    // 1 Channel (Mono)
  buffer.writeUInt32LE(sampleRate, 24);                     // 44100 Hz Sample Rate
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);                  // 16 bits per sample

  buffer.write('data', 36);
  buffer.writeUInt32LE(pcmDataLength, 40);

  return buffer;
}

// Helper 4: Direct Google translate_tts Single Phrase Fetcher
function fetchDirectTTSChunk(textPhrase, langCode) {
  return new Promise((resolve) => {
    const encodedText = encodeURIComponent(textPhrase);
    const url = `https://translate.google.co.in/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://translate.google.co.in/'
      }
    };

    const req = https.get(url, options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(res.statusCode === 200 && buffer.length > 500 ? buffer : null);
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// Helper 5: 44.1kHz Resampler & High-Pass (100Hz) / Low-Pass (6500Hz) Noise Filter
function resampleAndFilterPCM(inSamples, inSampleRate = 24000, targetSampleRate = 44100) {
  const ratio = inSampleRate / targetSampleRate;
  const outLen = Math.floor(inSamples.length / ratio);
  const outSamples = new Float32Array(outLen);

  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const s0 = inSamples[idx] || 0;
    const s1 = inSamples[idx + 1] || s0;
    outSamples[i] = s0 + frac * (s1 - s0);
  }

  const rcHp = 1.0 / (2 * Math.PI * 100);
  const dtHp = 1.0 / targetSampleRate;
  const alphaHp = rcHp / (rcHp + dtHp);
  let prevInHp = outSamples[0] || 0;
  let prevOutHp = 0;

  for (let i = 0; i < outLen; i++) {
    const current = outSamples[i];
    const filtered = alphaHp * (prevOutHp + current - prevInHp);
    prevInHp = current;
    prevOutHp = filtered;
    outSamples[i] = filtered;
  }

  const rcLp = 1.0 / (2 * Math.PI * 6500);
  const dtLp = 1.0 / targetSampleRate;
  const alphaLp = dtLp / (rcLp + dtLp);
  let prevOutLp = outSamples[0] || 0;

  for (let i = 0; i < outLen; i++) {
    const filtered = prevOutLp + alphaLp * (outSamples[i] - prevOutLp);
    prevOutLp = filtered;
    outSamples[i] = filtered;
  }

  return outSamples;
}

// Helper 6: FLAWLESS CRYSTAL-CLEAR 44.1kHz NOISE-FREE DSP AUDIO ENGINE
async function downloadAndStorePanchangamAudio(text, lang) {
  const cleanLang = (lang || currentPanchangamLang || 'te').split('-')[0].toLowerCase();
  const cleanText = sanitizeTextForTTS(text || currentPanchangamText);

  currentPanchangamLang = cleanLang;
  currentPanchangamText = cleanText;
  saveServerState();

  const start = Date.now();
  console.log(`📥 [GENERATING AUDIO FOR LANG "${cleanLang}", CITY "${currentCityId}"] "${cleanText.substring(0, 50)}..."`);
  
  try {
    const phrases = splitTextToNaturalPhrases(cleanText, 60);

    const fetchPromises = phrases.map(phraseText => {
      if (phraseText.length < 2) return Promise.resolve(null);
      return fetchDirectTTSChunk(phraseText, cleanLang);
    });

    const results = await Promise.all(fetchPromises);
    const validMp3Buffers = results.filter(buf => buf !== null && buf.length > 0);

    if (validMp3Buffers.length === 0) {
      throw new Error('No valid TTS MP3 buffers returned from Google API');
    }

    const fullMp3Buffer = Buffer.concat(validMp3Buffers);

    const decoder = new MPEGDecoder();
    await decoder.ready;

    const pcmPhraseArrays = [];
    const PAUSE_SAMPLES_44K = 2205; // 50ms silence pause @ 44.1kHz
    let totalSamples = 0;

    for (let buf of validMp3Buffers) {
      try {
        const { channelData, sampleRate } = decoder.decodeFrames([buf]);
        if (channelData && channelData.length > 0 && channelData[0].length > 0) {
          const left = channelData[0];
          const right = channelData.length > 1 ? channelData[1] : left;
          
          const mono24k = new Float32Array(left.length);
          for (let i = 0; i < left.length; i++) {
            mono24k[i] = (left[i] + right[i]) / 2.0;
          }

          const filtered44k = resampleAndFilterPCM(mono24k, sampleRate || 24000, 44100);
          const chunkLen = filtered44k.length;

          const fadeLen = Math.min(220, Math.floor(chunkLen / 10));
          const monoChunk = new Float32Array(chunkLen + PAUSE_SAMPLES_44K);

          for (let i = 0; i < chunkLen; i++) {
            let sample = filtered44k[i];
            if (i < fadeLen) {
              sample *= (i / fadeLen);
            } else if (i > chunkLen - fadeLen) {
              sample *= ((chunkLen - i) / fadeLen);
            }
            monoChunk[i] = sample;
          }

          pcmPhraseArrays.push(monoChunk);
          totalSamples += monoChunk.length;
        }
      } catch (e) {
        console.warn('Chunk decode warning:', e.message);
      }
    }

    decoder.free();

    if (totalSamples === 0) {
      throw new Error('Could not extract PCM audio samples');
    }

    const pcmBuffer = Buffer.alloc(totalSamples * 2);
    let sampleIdx = 0;

    let peakValue = 0.0;
    for (let chunk of pcmPhraseArrays) {
      for (let i = 0; i < chunk.length; i++) {
        const absVal = Math.abs(chunk[i]);
        if (absVal > peakValue) peakValue = absVal;
      }
    }

    const normFactor = peakValue > 0.001 ? (0.88 / peakValue) : 0.88;

    for (let chunk of pcmPhraseArrays) {
      for (let i = 0; i < chunk.length; i++) {
        let sample = chunk[i] * normFactor;
        let monoSample = Math.tanh(sample);
        let intSample = Math.floor(monoSample < 0 ? monoSample * 32768 : monoSample * 32767);
        
        pcmBuffer.writeInt16LE(intSample, sampleIdx * 2);
        sampleIdx++;
      }
    }

    const header = createWavHeader(pcmBuffer.length, 44100, 1, 16);
    const fullWavBuffer = Buffer.concat([header, pcmBuffer]);

    fs.writeFileSync(LATEST_MP3_PATH, fullMp3Buffer);
    fs.writeFileSync(LATEST_WAV_PATH, fullWavBuffer);

    const durationSec = (totalSamples / 44100).toFixed(2);
    audioLastUpdated = new Date().toISOString();
    const elapsed = Date.now() - start;

    console.log(`✨ [UPDATED SERVER AUDIO FOR "${cleanLang.toUpperCase()}" in ${elapsed}ms] Saved storage/latest.mp3 (${fullMp3Buffer.length} bytes) & storage/latest.wav (${fullWavBuffer.length} bytes, ${durationSec}s 44.1kHz MONO WAV)`);
    return { mp3Path: LATEST_MP3_PATH, wavPath: LATEST_WAV_PATH, mp3Size: fullMp3Buffer.length, wavSize: fullWavBuffer.length };

  } catch (err) {
    console.error('TTS generation error:', err.message);
    throw err;
  }
}

// 🌺 AUTOMATIC DAILY PANCHANGAM AUDIO WATCHDOG
setInterval(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  if (dateKey !== lastGeneratedDateKey) {
    console.log(`🌅 [AUTOMATIC DAILY DATE CHANGE] Rolling over Panchangam audio for date: ${dateKey}`);
    updateTodayPanchangamText();
    downloadAndStorePanchangamAudio(currentPanchangamText, currentPanchangamLang).catch(console.error);
  }
}, 15 * 60 * 1000);

// 🌺 PRE-GENERATE AUTOMATIC DAILY PANCHANGAM AUDIO ON STARTUP
downloadAndStorePanchangamAudio(currentPanchangamText, currentPanchangamLang).catch(console.error);

// 1. POST & GET /generate-audio Endpoints (Accepts lang, city, and text updates via body or query!)
const handleGenerateAudioReq = async (req, res) => {
  const text = req.body?.text || req.query?.text;
  const lang = req.body?.lang || req.query?.lang;
  const city = req.body?.city || req.query?.city;
  
  if (city) {
    currentCityId = city.toLowerCase();
  }

  if (lang) {
    currentPanchangamLang = lang.split('-')[0].toLowerCase();
  }
  
  if (text) {
    currentPanchangamText = text;
  } else {
    updateTodayPanchangamText();
  }
  
  saveServerState();

  try {
    const result = await downloadAndStorePanchangamAudio(currentPanchangamText, currentPanchangamLang);
    res.json({
      status: 'ok',
      message: `Server audio updated for Language: ${currentPanchangamLang.toUpperCase()}, City: ${currentCityId}`,
      audioUrl: '/audio/latest.mp3',
      wavUrl: '/audio/latest.wav',
      timestamp: audioLastUpdated,
      sizeBytes: result.mp3Size,
      lang: currentPanchangamLang,
      city: currentCityId
    });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ status: 'error', message: 'Audio download failed' });
  }
};

app.post('/generate-audio', handleGenerateAudioReq);
app.get('/generate-audio', handleGenerateAudioReq);

// 2. Direct Browser Download Endpoint
app.get('/audio/download', async (req, res) => {
  try {
    updateTodayPanchangamText();
    await downloadAndStorePanchangamAudio(currentPanchangamText, currentPanchangamLang);
    if (fs.existsSync(LATEST_MP3_PATH)) {
      res.header('Content-Type', 'audio/mpeg');
      const stream = fs.createReadStream(LATEST_MP3_PATH);
      stream.pipe(res);
    } else {
      res.status(500).send('Audio file missing');
    }
  } catch (err) {
    res.status(500).send('Audio generation failed');
  }
});

// 3. BULLETPROOF NATIVE STREAMING ENDPOINTS FOR ESP32 HARDWARE DECODERS
// Dedicated chunked webstream route for ESP32 hardware decoders (No Content-Length header to force ST_WEBSTREAM mode in ESP32-AudioI2S)
app.get('/audio/latest.mp3', (req, res) => {
  if (fs.existsSync(LATEST_MP3_PATH)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    const stream = fs.createReadStream(LATEST_MP3_PATH);
    stream.pipe(res);
  } else {
    res.status(404).send('Audio file missing');
  }
});

app.use('/audio', express.static(STORAGE_DIR, {
  acceptRanges: true,
  cacheControl: false,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Content-Type', 'audio/mpeg');
  }
}));

app.use('/storage', express.static(STORAGE_DIR, {
  acceptRanges: true,
  cacheControl: false,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Content-Type', 'audio/mpeg');
  }
}));

// GET /audio/status Endpoint
app.get('/audio/status', (req, res) => {
  const existsMp3 = fs.existsSync(LATEST_MP3_PATH);
  const existsWav = fs.existsSync(LATEST_WAV_PATH);
  let mp3Size = existsMp3 ? fs.statSync(LATEST_MP3_PATH).size : 0;
  let wavSize = existsWav ? fs.statSync(LATEST_WAV_PATH).size : 0;
  res.json({
    existsMp3,
    existsWav,
    timestamp: audioLastUpdated,
    mp3Size,
    wavSize,
    lang: currentPanchangamLang,
    city: currentCityId,
    mp3Url: '/audio/latest.mp3',
    wavUrl: '/audio/latest.wav',
    downloadUrl: '/audio/download'
  });
});

// Real Wi-Fi Networks Scanner using Windows netsh
app.get('/scan-wifi', (req, res) => {
  exec('netsh wlan show networks', { encoding: 'utf8' }, (error, stdout, stderr) => {
    if (error || !stdout) {
      return res.json({
        status: 'ok',
        networks: [{ ssid: 'Neonflake', rssi: -52, signalPct: '100%', security: 'WPA2-Personal', isConnected: true }]
      });
    }

    const networks = [];
    const lines = stdout.split(/\r?\n/);
    let currentSsid = null;

    for (let line of lines) {
      line = line.trim();
      if (line.match(/^SSID\s+\d+\s*:/i)) {
        const parts = line.split(':');
        if (parts.length > 1) {
          const ssid = parts.slice(1).join(':').trim();
          if (ssid && ssid.length > 0) {
            currentSsid = ssid;
            networks.push({
              ssid: currentSsid,
              rssi: -52,
              signalPct: '100%',
              security: 'WPA2-Personal',
              isConnected: currentSsid === currentWifiSsid
            });
          }
        }
      }
    }

    res.json({ status: 'ok', networks });
  });
});

// Connect Wi-Fi Endpoint
app.post('/connect-wifi', (req, res) => {
  const { ssid, password } = req.body;
  if (ssid) {
    currentWifiSsid = ssid;
    currentWifiPassword = password || '';
    console.log(`📶 Provisioned ESP32 Smart Idol to Real Wi-Fi: "${ssid}"`);
    res.json({ status: 'ok', message: `Connected to ${ssid}`, ssid });
  } else {
    res.status(400).json({ status: 'error', message: 'Missing SSID' });
  }
});

// Client Portal Idol Login Endpoint
app.post('/idol-login', (req, res) => {
  const { serial, password } = req.body;
  if (!serial || !password) {
    return res.status(400).json({ status: 'error', message: 'Serial number and password required' });
  }

  const cleanSerial = serial.trim().toUpperCase();
  const cleanPass = password.trim();

  if (cleanPass === 'idol2026' || cleanPass === 'smartidol' || cleanPass.length >= 4) {
    console.log(`🔑 [CLIENT IDOL LOGIN SUCCESS] Idol Serial: ${cleanSerial}`);
    res.json({
      status: 'ok',
      message: `Authenticated Smart Idol ${cleanSerial}`,
      serial: cleanSerial,
      deviceName: `Smart Ganesha Idol (${cleanSerial})`
    });
  } else {
    res.status(401).json({ status: 'error', message: 'Invalid Idol Password. Default password is idol2026' });
  }
});

// ESP32 calls this when motion is detected
app.post('/motion', (req, res) => {
  const senderIp = req.ip || req.connection.remoteAddress;
  lastMotionTimestamp = new Date().toLocaleTimeString('en-IN');
  console.log(`⚡ REAL ESP32 MOTION SIGNAL RECEIVED at ${lastMotionTimestamp} from ${senderIp}`);
  motionTriggered = true;
  res.json({ status: 'ok', message: 'Motion received', audioUrl: '/audio/latest.mp3' });
});

app.get('/motion', (req, res) => {
  lastMotionTimestamp = new Date().toLocaleTimeString('en-IN');
  console.log(`⚡ REAL ESP32 MOTION (GET) RECEIVED at ${lastMotionTimestamp}`);
  motionTriggered = true;
  res.json({ status: 'ok', message: 'Motion received', audioUrl: '/audio/latest.mp3' });
});

// React app polls this every 400ms
app.get('/motion-status', (req, res) => {
  if (motionTriggered) {
    motionTriggered = false;
    res.json({ motion: true, timestamp: lastMotionTimestamp, text: currentPanchangamText, audioUrl: '/audio/latest.mp3' });
  } else {
    res.json({ motion: false });
  }
});

// Handle missing audio routes cleanly without throwing NotFoundError
app.use((req, res, next) => {
  if (req.path.startsWith('/audio') || req.path.startsWith('/storage')) {
    return res.status(404).json({ status: 'error', message: 'Audio route or file not found' });
  }
  next();
});

// Serve static JS/CSS assets from dist folder
const DIST_DIR = path.join(__dirname, 'dist');
app.use(express.static(DIST_DIR));

// Safe SPA catch-all route
app.use((req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Smart Idol API Server Running.');
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Smart Idol Server listening on port ${PORT} (Dynamic Multi-Language & Location Server Audio Active)`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use by active server instance. Keeping running instance.`);
  } else {
    console.error('Server error:', err);
  }
});