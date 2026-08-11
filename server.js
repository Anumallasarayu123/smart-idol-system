import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Directory Setup
const STORAGE_DIR = path.resolve(__dirname, 'storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const LATEST_MP3_PATH = path.resolve(STORAGE_DIR, 'latest.mp3');
const DIST_DIR = path.resolve(__dirname, 'dist');

// Global Panchangam & System State
let currentPanchangamText = "ఓం శ్రీ వేంకటేశాయ నమః. నేటి శుభ పంచాంగం సిద్ధంగా ఉంది.";
let currentPanchangamLang = "te";
let currentWifiSsid = "Neonflake";
let currentWifiPassword = "FanSense#2023";
let motionTriggered = false;
let lastMotionTimestamp = null;

// Split text into safe TTS phrases (< 180 chars)
function splitTextIntoPhrases(text) {
  const sentences = text.match(/[^.!?।]+[.!?।]?/g) || [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length < 180) {
      current += (current ? ' ' : '') + sentence.trim();
    } else {
      if (current) chunks.push(current);
      current = sentence.trim();
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

// Fetch single Google TTS MP3 chunk
function fetchGoogleTTSChunk(textPhrase, langCode) {
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
    https.get(url, options, (res) => {
      if (res.statusCode === 200) {
        const audioChunks = [];
        res.on('data', (chunk) => audioChunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(audioChunks)));
        res.on('error', () => resolve(null));
      } else {
        resolve(null);
      }
    }).on('error', () => resolve(null));
  });
}

// Generate full MP3 audio file
async function generateMp3Audio(text, lang) {
  console.log(`📥 [PANCHANGAM SYNC] Generating MP3 Audio for Lang: "${lang}"...`);
  const phrases = splitTextIntoPhrases(text);
  const mp3Buffers = [];

  for (const phrase of phrases) {
    if (!phrase.trim()) continue;
    const buf = await fetchGoogleTTSChunk(phrase, lang);
    if (buf && buf.length > 0) {
      mp3Buffers.push(buf);
    }
  }

  if (mp3Buffers.length > 0) {
    const fullMp3Buffer = Buffer.concat(mp3Buffers);
    fs.writeFileSync(LATEST_MP3_PATH, fullMp3Buffer);
    console.log(`✨ [AUDIO STORED] Saved ${LATEST_MP3_PATH} (${fullMp3Buffer.length} bytes)`);
    return fullMp3Buffer.length;
  }
  return 0;
}

// 1. POST & GET /generate-audio & /update-panchangam-text Endpoints
const handleGenerateAudioESM = async (req, res) => {
  const text = req.body?.text || req.query?.text;
  const lang = req.body?.lang || req.query?.lang;
  
  if (text) currentPanchangamText = text;
  if (lang) currentPanchangamLang = lang.split('-')[0].toLowerCase();
  
  console.log(`📝 [DASHBOARD UPDATE] Panchangam Text received in "${currentPanchangamLang}"`);
  
  try {
    const size = await generateMp3Audio(currentPanchangamText, currentPanchangamLang);
    res.json({
      status: 'ok',
      message: 'Panchangam text updated & audio generated',
      audioUrl: '/audio/latest.mp3',
      wavUrl: '/audio/latest.wav',
      sizeBytes: size,
      lang: currentPanchangamLang
    });
  } catch (err) {
    console.error('Error updating panchangam:', err);
    res.status(500).json({ status: 'error', message: 'Failed to generate audio' });
  }
};

app.all(['/generate-audio', '/update-panchangam-text'], handleGenerateAudioESM);

// 2. GET /scan-wifi (Windows netsh Scanner)
app.get('/scan-wifi', (req, res) => {
  console.log('📶 [WIFI SCAN] Scanning local Wi-Fi networks using netsh...');
  exec('netsh wlan show networks', { encoding: 'utf8' }, (error, stdout) => {
    const networks = [];
    if (stdout) {
      const lines = stdout.split(/\r?\n/);
      for (let line of lines) {
        line = line.trim();
        if (line.match(/^SSID\s+\d+\s*:/i)) {
          const parts = line.split(':');
          if (parts.length > 1) {
            const ssid = parts.slice(1).join(':').trim();
            if (ssid) {
              networks.push({ ssid, signalPct: '100%', isConnected: ssid === currentWifiSsid });
            }
          }
        }
      }
    }
    if (networks.length === 0) {
      networks.push({ ssid: currentWifiSsid, signalPct: '100%', isConnected: true });
    }
    console.log(`📶 [WIFI SCAN] Found ${networks.length} networks`);
    res.json({ status: 'ok', networks });
  });
});

// 3. POST /connect-wifi (Store SSID & Password)
app.post('/connect-wifi', (req, res) => {
  const { ssid, password } = req.body;
  if (ssid) {
    currentWifiSsid = ssid;
    currentWifiPassword = password || '';
    console.log(`📶 [WIFI PROVISION] Provisioned ESP32 Smart Idol to Wi-Fi: "${ssid}"`);
    res.json({ status: 'ok', message: `Provisioned to ${ssid}`, ssid });
  } else {
    res.status(400).json({ status: 'error', message: 'Missing SSID' });
  }
});

// 4. GET /audio/latest.mp3 (Bulletproof Direct ESP32 MP3 Stream Endpoint)
app.get('/audio/latest.mp3', (req, res) => {
  console.log('🔊 [AUDIO STREAM] ESP32 requested /audio/latest.mp3');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.header('Content-Type', 'audio/mpeg');
  res.header('Connection', 'close');

  if (fs.existsSync(LATEST_MP3_PATH)) {
    const stat = fs.statSync(LATEST_MP3_PATH);
    res.header('Content-Length', stat.size);
    return res.sendFile('latest.mp3', { root: STORAGE_DIR });
  }
  res.status(404).json({ status: 'error', message: 'Panchangam audio not ready' });
});

// 5. POST /motion & GET /motion (Receive Motion Event from ESP32)
app.post('/motion', (req, res) => {
  lastMotionTimestamp = new Date().toLocaleTimeString('en-IN');
  console.log(`⚡ [MOTION DETECTED] Motion POST event received from ESP32 at ${lastMotionTimestamp}`);
  motionTriggered = true;
  res.json({ status: 'ok', motion: true, audioUrl: '/audio/latest.mp3' });
});

app.get('/motion', (req, res) => {
  lastMotionTimestamp = new Date().toLocaleTimeString('en-IN');
  console.log(`⚡ [MOTION DETECTED] Motion GET event received from ESP32 at ${lastMotionTimestamp}`);
  motionTriggered = true;
  res.json({ status: 'ok', motion: true, audioUrl: '/audio/latest.mp3' });
});

// 6. GET /motion-status (React Dashboard Polling Endpoint)
app.get('/motion-status', (req, res) => {
  if (motionTriggered) {
    motionTriggered = false;
    res.json({ motion: true, timestamp: lastMotionTimestamp, text: currentPanchangamText, audioUrl: '/audio/latest.mp3' });
  } else {
    res.json({ motion: false });
  }
});

// 7. Serve React Production Build Files
app.use(express.static(DIST_DIR));

// 8. Catch-All Route serving dist/index.html
app.use((req, res) => {
  const indexPath = path.resolve(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Smart Temple Idol Express Server Active.');
  }
});

// 9. Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=================================================`);
  console.log(`✅ Smart Temple Idol Express Server Active on Port ${PORT}`);
  console.log(`📡 ESP32 Audio Stream: http://192.168.31.217:${PORT}/audio/latest.mp3`);
  console.log(`=================================================\n`);
  
  // Initial Audio Generation
  generateMp3Audio(currentPanchangamText, currentPanchangamLang).catch(console.error);
});
