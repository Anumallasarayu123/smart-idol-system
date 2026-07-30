const https = require('https');
const fs = require('fs');
const path = require('path');

// Today's Panchangam Text in Telugu
const text = encodeURIComponent("ఓం శ్రీ గణేశాయ నమః. నేటి పవిత్ర పంచాంగము. తిథి త్రయోదశి, నక్షత్రం స్వాతి, యోగం వరీయాన్. శుభ సమయం ప్రాప్తం.");
const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=te&client=tw-ob&q=${text}`;

console.log("📥 Downloading Today's Spoken Panchangam Audio File...");

const wavPath = path.join(__dirname, 'panchangam_today.mp3');
const file = fs.createWriteStream(wavPath);

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log("✅ Audio Downloaded Successfully: panchangam_today.mp3");
    });
  });
}).on('error', (err) => {
  console.error("Error downloading audio:", err);
});
